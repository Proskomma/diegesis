import React, {useContext, useEffect} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {
    IonButton,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonInput,
    IonPage,
    IonRow,
    IonText
} from '@ionic/react';
import './SearchTab.css';

import PkContext from '../../contexts/PkContext';
import PageToolBar from "../../components/PageToolBar";
import SearchResultsTools from './SearchResultsTools';
import {options, search, trash} from "ionicons/icons";

const SearchTab = ({currentDocSet, setCurrentBookCode, setSelectedChapter, setSelectedVerses}) => {
    const pk = useContext(PkContext);
    const [linkSearchString, setLinkSearchString] = React.useState("");
    const [searchString, setSearchString] = React.useState("");
    const [searchWaiting, setSearchWaiting] = React.useState(false);
    const [searchTerms, setSearchTerms] = React.useState([]);
    const [booksToSearch, setBooksToSearch] = React.useState([]);
    const [resultParaRecords, setResultParaRecords] = React.useState([]);
    const [nResultsPerPage, setNResultsPerPage] = React.useState(5);
    const [resultsPage, setResultsPage] = React.useState(0);
    const jumpToVerse = (book, chapter, verses) => {
        setCurrentBookCode(book);
        setSelectedChapter(chapter);
        setSelectedVerses(verses);
    }
    const location = useLocation();
    if (location && location.state && location.state.newSearchString && location.state.newSearchString !== linkSearchString) {
        setLinkSearchString(location.state.newSearchString);
    }
    const resetSearch = () => {
        setResultsPage(0);
        setBooksToSearch([]);
        setResultParaRecords([]);
        setSearchWaiting(true);
    }
    useEffect(
        // When linkSearchString changes, refresh searchString and launch new search
        () => {
            setSearchString(linkSearchString);
            resetSearch();
        }, [linkSearchString]);

    useEffect(
        // When searchWaiting is set, refresh searchTerms and set booksToSearch
         () => {
            if (searchWaiting) {
                const terms = searchString.split(/ +/)
                    .map((st) => st.trim())
                    .filter((st) => st.length > 0);
                if (terms.length > 0) {
                    const searchDocumentMatchQuery = (
                        "{" +
                        '  docSet(id:"%docSetId%") {\n' +
                        "    documents(" +
                        "         sortedBy:\"paratext\"" +
                        "         allChars: true " +
                        "         withMatchingChars: [%searchTerms%]\n" +
                        "         ) {\n" +
                        '           bookCode: header(id:"bookCode") ' +
                        "         }\n" +
                        "       }\n" +
                        "}"
                    ).replace('%docSetId%', currentDocSet)
                        .replace(
                            '%searchTerms%',
                            terms
                                .map(st => `"""${st}"""`)
                                .join(", ")
                        )
                    const doQuery = async () => {
                        const result = await pk.gqlQuery(searchDocumentMatchQuery);
                        if (result.data && result.data.docSet) {
                            return result.data.docSet.documents.map((book) => book.bookCode);
                        }
                    };
                    doQuery().then(res => {
                        setSearchWaiting(false);
                        setBooksToSearch(res);
                        setSearchTerms(terms);
                    });
                }
            }
        },
        [searchWaiting]
    );
    useEffect(
        // When booksToSearch is set and is not empty,
        // and more results are needed according to paging,
        // search next book
        () => {
            const doQuery = async () => {
                let b2s = booksToSearch;
                let rpr = resultParaRecords;
                while (b2s.length > 0 && rpr.length < ((resultsPage + 1) * nResultsPerPage)) {
                    const bookToSearch = b2s[0];
                    console.log(bookToSearch)
                    const searchBlockMatchQuery = (
                        "{\n" +
                        '  docSet(id:"%docSetId%") {\n' +
                        "    document(\n" +
                        '        bookCode:"%bookCode%" \n' +
                        "      ) {\n" +
                        "       id\n" +
                        '       bookCode: header(id: "bookCode")\n' +
                        '       title: header(id: "toc2")\n' +
                        "       mainSequence {\n" +
                        "         blocks(\n" +
                        "            allChars : true \n" +
                        "           withMatchingChars: [%searchTerms%]\n" +
                        "         ) {\n" +
                        "           scopeLabels(startsWith:[\"chapter/\", \"verse/\"])\n" +
                        "           itemGroups(byScopes:[\"chapter/\", \"verses/\"]) { scopeLabels(startsWith:[\"verses/\"]) text tokens { subType payload }}\n" +
                        "         }\n" +
                        "       }\n" +
                        "    }\n" +
                        '    matches: enumRegexIndexesForString (enumType:"wordLike" searchRegex:"%searchTermsRegex%") { matched }\n' +
                        "  }\n" +
                        "}"
                    ).replace('%docSetId%', currentDocSet)
                        .replace('%bookCode%', bookToSearch)
                        .replace(
                            '%searchTerms%',
                            searchTerms
                                .map(st => `"""${st.toLowerCase()}"""`)
                                .join(", ")
                        )
                        .replace(
                            '%searchTermsRegex%',
                            searchTerms
                                .map(st => `(${st})`)
                                .join('|')
                        );
                    const result = await pk.gqlQuery(searchBlockMatchQuery);
                    let records = [];
                    if (result.data && result.data.docSet && result.data.docSet.document) {
                        records = result.data.docSet.document.mainSequence.blocks.map(
                            b => ({
                                book: result.data.docSet.document.bookCode,
                                matches: result.data.docSet.matches.map(m => m.matched),
                                chapter: b.scopeLabels.filter(sl => sl.startsWith('chapter'))[0].split('/')[1],
                                verses: b.scopeLabels
                                    .filter(sl => sl.startsWith('verse'))
                                    .map(sl => sl.split('/')[1])
                                    .map(vns => parseInt(vns)),
                                itemGroups: b.itemGroups,
                            })
                        );
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
        [resultsPage, currentDocSet, nResultsPerPage, searchTerms]
    );
    return (
        <IonPage>
            <IonHeader>
                <PageToolBar pageTitle="Search"/>
            </IonHeader>
            <IonContent>
                <IonGrid>
                    <IonRow>
                        <IonCol size={1}>
                            <IonButton color="secondary" fill="clear">
                                <IonIcon float-right icon={options}/>
                            </IonButton>
                        </IonCol>
                        <IonCol size={9}>
                            <IonInput
                                value={searchString}
                                placeholder="Search Items"
                                onKeyPress={e => e.key === 'Enter' && resetSearch()}
                                onIonChange={e => setSearchString(e.detail.value)}
                            />
                        </IonCol>
                        <IonCol size={1}>
                            <IonButton
                                color="primary"
                                fill="clear"
                                onClick={
                                    () => {
                                        resetSearch();
                                    }
                                }
                            >
                                <IonIcon float-right icon={search}/>
                            </IonButton>
                        </IonCol>
                        <IonCol size={1}>
                            <IonButton
                                className="ion-float-end"
                                color="secondary"
                                fill="clear"
                                onClick={() => setSearchString('')}
                            >
                                <IonIcon float-right icon={trash}/>
                            </IonButton>
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
                    <IonRow>
                        <IonCol>
                            {
                                resultParaRecords.length === 0 ?
                                    <IonText>No results</IonText> :
                                    resultParaRecords
                                        .slice(resultsPage * nResultsPerPage, (resultsPage * nResultsPerPage) + nResultsPerPage)
                                        .map(
                                            (rr, n) => {
                                                const fromVerse = Math.min(...rr.verses);
                                                const toVerse = Math.max(...rr.verses);
                                                return <IonRow key={n}>
                                                    <IonCol size={1} style={{fontSize: "smaller", fontWeight: "bold"}}>
                                                        {`${rr.book} ${rr.chapter}:${fromVerse}`}
                                                        {toVerse > fromVerse && `-${toVerse}`}
                                                    </IonCol>
                                                    <IonCol size={11}>
                                                        {
                                                            rr.itemGroups
                                                                .map(
                                                                    (ig, n) =>
                                                                        <span key={n}>
                                                                            <Link
                                                                                to="/browse"
                                                                                onClick={() => jumpToVerse(rr.book, rr.chapter, ig.scopeLabels[0].split('/')[1])}
                                                                                className="verseNumber">{ig.scopeLabels[0].split('/')[1]}</Link>
                                                                            {
                                                                                ig.tokens.map(
                                                                                    (t, n) =>
                                                                                        t.subType === 'wordLike' ?
                                                                                            <span
                                                                                                key={n}
                                                                                                onClick={
                                                                                                    () => {
                                                                                                        setSearchString(searchString + " " + t.payload);
                                                                                                        resetSearch();
                                                                                                    }
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    t.subType === 'wordLike' ?
                                                                                                        rr.matches.includes(t.payload) ?
                                                                                                            <IonText
                                                                                                                color="primary"
                                                                                                                key={n}>
                                                                                                                {t.payload}
                                                                                                            </IonText> :
                                                                                                            t.payload
                                                                                                        :
                                                                                                        t.payload
                                                                                                }
                                                                                            </span>
                                                                                            :
                                                                                            t.payload
                                                                                )
                                                                            }
                                                                        </span>
                                                                )
                                                        }
                                                    </IonCol>
                                                </IonRow>;
                                            }
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
        </IonPage>
    );
};

export default SearchTab;
