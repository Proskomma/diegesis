import React, {useContext, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonText,} from '@ionic/react';
import '../SearchTab.css';

import PkContext from '../../../contexts/PkContext';
import DocSetsContext from "../../../contexts/DocSetsContext";
import PageToolBar from "../../../components/PageToolBar";
import SearchResultsTools from '../SearchResultsTools';
import SearchBar from "../SearchBar";
import WordDetails from "../WordDetails";
import SearchOptions from "../SearchOptions";
import textSearchDocumentQuery from "../textSearchDocumentQuery";
import searchBlockMatchQuery from "../searchBlockMatchQuery";
import searchVerseMatchQuery from "../searchVerseMatchQuery";
import textResultCellContent from "../textResultCellContent";

const SearchTextTab = ({currentDocSet, currentBookCode, setCurrentBookCode, setSelectedChapter, setSelectedVerses}) => {
    const pk = useContext(PkContext);
    const docSets = useContext(DocSetsContext);
    const [linkSearchString, setLinkSearchString] = React.useState("");
    const [searchString, setSearchString] = React.useState("");
    const [searchWaiting, setSearchWaiting] = React.useState(false);
    const [payloadSearchTerms, setPayloadSearchTerms] = React.useState([]);
    const [attSearchTerms, setAttSearchTerms] = React.useState([]);
    const [tableSearchTerms, setTableSearchTerms] = React.useState([]);
    const [booksToSearch, setBooksToSearch] = React.useState([]);
    const [searchAllBooks, setSearchAllBooks] = React.useState(false);
    const [resultParaRecords, setResultParaRecords] = React.useState([]);
    const [nResultsPerPage, setNResultsPerPage] = React.useState(5);
    const [resultsPage, setResultsPage] = React.useState(0);
    const [wordDetails, setWordDetails] = React.useState(null);
    const [showOptions, setShowOptions] = React.useState(false);
    const [searchTarget, setSearchTarget] = React.useState('docSet');
    const [searchResultUnit, setSearchResultUnit] = React.useState('block');

    const location = useLocation();
    if (location && location.state && location.state.newSearchString && location.state.newSearchString !== linkSearchString) {
        setLinkSearchString(location.state.newSearchString);
        setWordDetails(null);
    }
    const resetSearch = () => {
        setResultsPage(0);
        setBooksToSearch([]);
        setResultParaRecords([]);
        setSearchAllBooks(false);
        setSearchWaiting(true);
    }
    useEffect(
        () => {
            resetSearch();
        },
        [currentDocSet]
    )
    useEffect(
        // When linkSearchString changes, refresh searchString and launch new search
        () => {
            setSearchString(linkSearchString);
            resetSearch();
        }, [linkSearchString]);
    useEffect(
        // When searchWaiting is set, refresh payloadSearchTerms and set booksToSearch
        () => {
            const payloadTerms = searchString.split(/ +/)
                .map((st) => st.trim())
                .filter((st) => st.length > 0)
                .filter(st => !st.includes(':'));
            const attTerms =
                searchString.split(/ +/)
                    .map((st) => st.trim())
                    .filter((st) => st.length > 0)
                    .filter(st => st.includes(':'))
                    .map(st => st.split(':').slice(0, 2));
            if (payloadTerms.length > 0 || attTerms.length > 0) {
                const doQuery = async () => {
                    const result = await pk.gqlQuery(textSearchDocumentQuery(payloadTerms, attTerms, currentDocSet));
                    if (result.data && result.data.docSet) {
                        return result.data.docSet.documents.map((book) => book.bookCode);
                    } else {
                        return [];
                    }
                };
                doQuery().then(res => {
                    setSearchWaiting(false);
                    setBooksToSearch(searchTarget === 'docSet' ? res : [currentBookCode]);
                    setPayloadSearchTerms(payloadTerms);
                    setAttSearchTerms(attTerms);
                });
            } else {
                setSearchWaiting(false);
            }
        },
        [searchWaiting, searchTarget]
    );
    useEffect(
        // When booksToSearch is set and is not empty,
        // and more results are needed according to paging,
        // search next book
        () => {
            const doQuery = async () => {
                let b2s = booksToSearch;
                let rpr = resultParaRecords;
                while (b2s && b2s.length > 0 && (searchAllBooks || rpr.length < ((resultsPage + 1) * nResultsPerPage))) {
                    const bookToSearch = b2s[0];
                    console.log(bookToSearch, searchResultUnit)
                    let records = [];
                    if (searchResultUnit === 'block') {
                        const result = await pk.gqlQuery(
                            searchBlockMatchQuery(
                                currentDocSet,
                                bookToSearch,
                                payloadSearchTerms,
                                attSearchTerms)
                        );
                        if (result.data && result.data.docSet && result.data.docSet.document) {
                            records = result.data.docSet.document.mainSequence.blocks.map(
                                b => ({
                                    book: result.data.docSet.document.bookCode,
                                    matches: result.data.docSet.matches.map(m => m.matched),
                                    chapter: b.scopeLabels.filter(sl => sl.startsWith('chapter')).map(s => s.split('/')[1])[0],
                                    verses: b.scopeLabels
                                        .filter(sl => sl.startsWith('verse'))
                                        .map(sl => sl.split('/')[1])
                                        .map(vns => parseInt(vns)),
                                    itemGroups: b.itemGroups,
                                })
                            );
                        }
                    } else {
                        const result = await pk.gqlQuery(
                            searchVerseMatchQuery(
                                currentDocSet,
                                bookToSearch,
                                payloadSearchTerms,
                                attSearchTerms)
                        );
                        if (result.data && result.data.docSet && result.data.docSet.document) {
                            records = result.data.docSet.document.cvMatching.map(
                                b => ({
                                    book: result.data.docSet.document.bookCode,
                                    matches: result.data.docSet.matches.map(m => m.matched),
                                    chapter: b.scopeLabels.filter(sl => sl.startsWith('chapter'))[0].split('/')[1],
                                    verses: b.scopeLabels
                                        .filter(sl => sl.startsWith('verse'))
                                        .map(sl => sl.split('/')[1])
                                        .map(vns => parseInt(vns)),
                                    itemGroups: [b],
                                })
                            );
                            setResultParaRecords(records);
                        }
                    }
                    b2s = b2s.slice(1);
                    rpr = [...rpr, ...records];
                }
                return [b2s, rpr];
            }
            doQuery().then((res) => {
                setBooksToSearch(res[0]);
                setResultParaRecords(res[1]);
            });
        },
        [resultsPage, currentDocSet, nResultsPerPage, payloadSearchTerms, attSearchTerms, tableSearchTerms, searchAllBooks]
    );

    return (
        <IonPage>
            <IonHeader>
                <PageToolBar pageTitle="Search Text"/>
            </IonHeader>
            {
                wordDetails &&
                <WordDetails
                    wordDetails={wordDetails}
                    setWordDetails={setWordDetails}
                    searchString={searchString}
                    setSearchString={setSearchString}
                    resetSearch={resetSearch}
                />
            }
            {
                !wordDetails &&
                <IonContent>
                    <IonGrid>
                        <>
                            <SearchBar
                                searchString={searchString}
                                setSearchString={setSearchString}
                                showOptions={showOptions}
                                setShowOptions={setShowOptions}
                                resetSearch={resetSearch}
                            />
                            {showOptions &&
                            <SearchOptions
                                nResultsPerPage={nResultsPerPage}
                                setNResultsPerPage={setNResultsPerPage}
                                searchTarget={searchTarget}
                                setSearchTarget={setSearchTarget}
                                resetSearch={resetSearch}
                                searchResultUnit={searchResultUnit}
                                setSearchResultUnit={setSearchResultUnit}
                            />}
                        </>
                        {
                            resultParaRecords.length > 0 &&
                            <IonRow>
                                <IonCol style={{textAlign: "center"}}>
                                    <SearchResultsTools
                                        resultsPage={resultsPage}
                                        setResultsPage={setResultsPage}
                                        nResultsPerPage={nResultsPerPage}
                                        resultParaRecords={resultParaRecords}
                                        booksToSearch={booksToSearch}
                                        setSearchAllBooks={setSearchAllBooks}
                                    />
                                </IonCol>
                            </IonRow>
                        }
                        <IonRow>
                            <IonCol>
                                {
                                    resultParaRecords.length === 0 ?
                                        <IonText>No results</IonText> :
                                        textResultCellContent(
                                            resultParaRecords,
                                            resultsPage,
                                            nResultsPerPage,
                                            setWordDetails,
                                            attSearchTerms,
                                            setCurrentBookCode,
                                            setSelectedChapter,
                                            setSelectedVerses,
                                        )
                                }
                            </IonCol>
                        </IonRow>
                        {
                            resultParaRecords.length > 0 &&
                            <IonRow>
                                <IonCol style={{textAlign: "center"}}>
                                    <SearchResultsTools
                                        resultsPage={resultsPage}
                                        setResultsPage={setResultsPage}
                                        nResultsPerPage={nResultsPerPage}
                                        resultParaRecords={resultParaRecords}
                                        booksToSearch={booksToSearch}
                                    />
                                </IonCol>
                            </IonRow>
                        }
                    </IonGrid>
                </IonContent>
            }
        </IonPage>
    );
};

export default SearchTextTab;
