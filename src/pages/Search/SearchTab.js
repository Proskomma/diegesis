import React, {useContext, useEffect} from 'react';
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
    IonText,
    IonTitle
} from '@ionic/react';
import './SearchTab.css';

import PkContext from '../../contexts/PkContext';
import PageToolBar from "../../components/PageToolBar";
import {options, search, arrowForward, arrowBack} from "ionicons/icons";

const SearchTab = ({currentDocSet}) => {
    const pk = useContext(PkContext);
    const [searchString, setSearchString] = React.useState("");
    const [searchWaiting, setSearchWaiting] = React.useState(false);
    const [searchTerms, setSearchTerms] = React.useState([]);
    const [booksToSearch, setBooksToSearch] = React.useState([]);
    const [resultParaRecords, setResultParaRecords] = React.useState([]);
    const [resultVerseRecords, setResultVerseRecords] = React.useState([]);
    const [nResultsPerPage, setNResultsPerPage] = React.useState(10);
    const [resultsPage, setResultsPage] = React.useState(0);
    useEffect(
        // When searchWaiting is set, refresh searchTerms and set booksToSearch
        () => {
            if (searchWaiting) {
                const terms = searchString.split(/ +/)
                    .map((st) => st.trim())
                    .filter((st) => st.length > 0);
                setSearchTerms(terms);
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
                        setSearchWaiting(false);
                        setBooksToSearch([]);
                        setResultParaRecords([]);
                        setResultVerseRecords([]);
                        setResultsPage(0);
                        if (result.data && result.data.docSet) {
                            setBooksToSearch(
                                result.data.docSet.documents.map((book) => book.bookCode)
                            );
                        }
                        return result;
                    };
                    doQuery().then();
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
            if (booksToSearch.length > 0 && resultParaRecords.length < ((resultsPage + 1) * nResultsPerPage)) {
                const bookToSearch = booksToSearch[0];
                const searchBlockMatchQuery = (
                    "{" +
                    '  docSet(id:"%docSetId%") {\n' +
                    "    document(" +
                    '        bookCode:"%bookCode%" \n' +
                    "      ) {\n" +
                    "       id\n" +
                    '       bookCode: header(id: "bookCode")\n' +
                    '       title: header(id: "toc2")\n' +
                    "       mainSequence {\n" +
                    "         blocks(\n" +
                    "            allChars : true " +
                    "           withMatchingChars: [%searchTerms%]\n" +
                    "         ) {\n" +
                    "           scopeLabels(startsWith:[\"chapter/\", \"verse/\"])\n" +
                    "           items { type subType payload }\n" +
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
                            .map(st => `"""${st}"""`)
                            .join(", ")
                    )
                    .replace(
                        '%searchTermsRegex%',
                        searchTerms
                            .map(st => `^${st}$`)
                            .join('|')
                    );
                const doQuery = async () => {
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
                                items: b.items,
                            })
                        );
                        setResultParaRecords([...resultParaRecords, ...records]);
                    }
                    setBooksToSearch(booksToSearch.slice(1));
                    return records;
                };
                doQuery().then();
            }
        },
        [booksToSearch, resultsPage]
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
                        <IonCol size={10}>
                            <IonInput
                                value={searchString}
                                placeholder="Search Items"
                                debounce={500}
                                onIonChange={e => setSearchString(e.detail.value)}
                            />
                        </IonCol>
                        <IonCol size={1}>
                            <IonButton
                                color="primary"
                                fill="clear"
                                onClick={() => setSearchWaiting(true)}
                            >
                                <IonIcon float-right icon={search}/>
                            </IonButton>
                        </IonCol>
                    </IonRow>
                    {
                        resultParaRecords.length > 0 &&
                        <IonRow>
                            <IonCol style={{textAlign: "center"}}>
                                <IonTitle>
                                <IonButton
                                    fill="clear"
                                    color="secondary"
                                    disabled={resultsPage === 0}
                                    onClick={() => setResultsPage(resultsPage - 1)}
                                >{
                                    <IonIcon icon={arrowBack}/>
                                }</IonButton>
                                {
                                    `${(resultsPage * nResultsPerPage) + 1}-${Math.min((resultsPage * nResultsPerPage) + nResultsPerPage, resultParaRecords.length)}
                                    of
                                    ${(resultsPage * nResultsPerPage) + nResultsPerPage < resultParaRecords.length ? 'at least' : ""}
                                    ${resultParaRecords.length} result${resultParaRecords.length !== 1 && 's'}`}
                                <IonButton
                                    fill="clear"
                                    color="secondary"
                                    disabled={(resultsPage * nResultsPerPage) + nResultsPerPage > resultParaRecords.length}
                                    onClick={() => setResultsPage(resultsPage + 1)}
                                >{
                                    <IonIcon icon={arrowForward}/>
                                }</IonButton>
                                    </IonTitle>
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
                                                            rr.items
                                                                .filter(i => i.type === 'token')
                                                                .map((t, n) => rr.matches.includes(t.payload) ?
                                                                    <b key={n}>{t.payload}</b> : t.payload)
                                                        }
                                                    </IonCol>
                                                </IonRow>;
                                            }
                                        )
                            }
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default SearchTab;
