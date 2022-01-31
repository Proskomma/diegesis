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
import searchTableMatchQuery from "./searchTableMatchQuery";
import tableResultCellContent from "./tableResultCellContent";
import tableResultHeaderRow from "./tableResultHeaderRow";

const SearchTableTab = ({
                            currentDocSet,
                            currentBookCode,
                            setCurrentBookCode,
                            setSelectedChapter,
                            setSelectedVerses
                        }) => {
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
            if (searchWaiting && docSets && currentDocSet) {
                setBooksToSearch(searchTarget === 'docSet' ? Object.keys(docSets[currentDocSet].documents) : [currentBookCode]);
                const tableSearchTerms = searchString.split(/ +/)
                    .map((st) => st.trim())
                    .filter((st) => st.length > 0)
                    .filter(st => st.includes('=') || st.includes('~'))
                    .map(st => [
                        st.includes('=') ? '=' : '~',
                        ...st.split(/[=~]/).slice(0, 2),
                    ]);
                setPayloadSearchTerms([]);
                setAttSearchTerms([]);
                setTableSearchTerms(tableSearchTerms);
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
                    if (tableSearchTerms.length > 0) {
                        const result = await pk.gqlQuery(searchTableMatchQuery(
                            tableSearchTerms,
                            currentDocSet,
                            bookToSearch
                        ));
                        if (result.data && result.data.docSet && result.data.docSet.document && result.data.docSet.document.tableSequences && result.data.docSet.document.tableSequences[0]) {
                            records = result.data.docSet.document.tableSequences[0].rows.map(
                                r => ({
                                    book: result.data.docSet.document.bookCode,
                                    row: r[0].rows[0],
                                    headings: result.data.docSet.document.tableSequences[0].headings,
                                    fields: r.map(f => f.text),
                                })
                            );
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
                <PageToolBar pageTitle="Search Table"/>
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
                                        <>
                                            {tableResultHeaderRow(resultParaRecords)}
                                            {tableResultCellContent(
                                                resultParaRecords,
                                                resultsPage,
                                                nResultsPerPage,
                                            )}
                                        </>
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

export default SearchTableTab;
