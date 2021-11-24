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
    IonText,
    IonTitle,
} from '@ionic/react';
import './SearchTab.css';

import PkContext from '../../contexts/PkContext';
import PageToolBar from "../../components/PageToolBar";
import SearchResultsTools from './SearchResultsTools';
import {options, search, trash} from "ionicons/icons";
import WordDetails from "./WordDetails";

const SearchTab = ({currentDocSet, currentBookCode, setCurrentBookCode, setSelectedChapter, setSelectedVerses}) => {
    const pk = useContext(PkContext);
    const [linkSearchString, setLinkSearchString] = React.useState("");
    const [searchString, setSearchString] = React.useState("");
    const [searchWaiting, setSearchWaiting] = React.useState(false);
    const [payloadSearchTerms, setPayloadSearchTerms] = React.useState([]);
    const [attSearchTerms, setAttSearchTerms] = React.useState([]);
    const [booksToSearch, setBooksToSearch] = React.useState([]);
    const [searchAllBooks, setSearchAllBooks] = React.useState(false);
    const [resultParaRecords, setResultParaRecords] = React.useState([]);
    const [nResultsPerPage, setNResultsPerPage] = React.useState(5);
    const [resultsPage, setResultsPage] = React.useState(0);
    const [wordDetails, setWordDetails] = React.useState(null);
    const [showOptions, setShowOptions] = React.useState(false);
    const [searchTarget, setSearchTarget] = React.useState('docSet');
    const jumpToVerse = (book, chapter, verses) => {
        setCurrentBookCode(book);
        setSelectedChapter(chapter);
        setSelectedVerses(verses);
    }
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
        // When linkSearchString changes, refresh searchString and launch new search
        () => {
            setSearchString(linkSearchString);
            resetSearch();
        }, [linkSearchString]);

    useEffect(
        // When searchWaiting is set, refresh payloadSearchTerms and set booksToSearch
        () => {
            if (searchWaiting) {
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
                    const payloadTermsClause = payloadTerms.length > 0 ?
                        "         withMatchingChars: [%payloadSearchTerms%]\n" :
                        "";
                    const attTermsClause = attTerms.length > 0 ?
                        "         withScopes: [%attSearchTerms%]\n" :
                        "";
                    const searchDocumentMatchQuery = (
                        "{" +
                        '  docSet(id:"%docSetId%") {\n' +
                        "    documents(" +
                        "         sortedBy:\"paratext\"" +
                        "         allChars: true " +
                        payloadTermsClause +
                        "         allScopes: true " +
                        attTermsClause +
                        "         ) {\n" +
                        '           bookCode: header(id:"bookCode") ' +
                        "         }\n" +
                        "       }\n" +
                        "}"
                    ).replace('%docSetId%', currentDocSet)
                        .replace(
                            '%payloadSearchTerms%',
                            payloadTerms
                                .map(st => `"""${st}"""`)
                                .join(", ")
                        )
                        .replace(
                            '%attSearchTerms%',
                            attTerms
                                .map(st => `"""attribute/${st[0].startsWith('x-') ? 'milestone' : 'spanWithAtts'}/${st[0].startsWith('x-') ? 'zaln' : 'w'}/${st[0]}/0/${st[1]}"""`)
                                .join(", ")
                        )
                    console.log(searchDocumentMatchQuery);
                    const doQuery = async () => {
                        const result = await pk.gqlQuery(searchDocumentMatchQuery);
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
                }
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
                    console.log(bookToSearch)
                    const payloadTermsClause = payloadSearchTerms.length > 0 ?
                        "         withMatchingChars: [%payloadSearchTerms%]\n" :
                        "";
                    const attTermsClause = attSearchTerms.length > 0 ?
                        "         withScopes: [%attSearchTerms%]\n" :
                        "";
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
                        "           allChars : true\n" +
                                    payloadTermsClause +
                                    attTermsClause +
                        "         ) {\n" +
                        "           scopeLabels(startsWith:[\"chapter/\", \"verse/\"])\n" +
                        "           itemGroups(byScopes:[\"chapter/\", \"verses/\"], includeContext:true) {\n" +
                        "             scopeLabels(startsWith:[\"verses/\"])\n" +
                        "             text\n" +
                        "             tokens {\n" +
                        "               subType\n" +
                        "               payload\n" +
                        "               scopes(\n" +
                        "                 startsWith:[\n" +
                        "                   \"attribute/spanWithAtts/w/\"\n" +
                        "                   \"attribute/milestone/zaln/\"\n" +
                        "                 ]\n" +
                        "               )\n" +
                        "             }\n" +
                        "           }\n" +
                        "         }\n" +
                        "       }\n" +
                        "    }\n" +
                        '    matches: enumRegexIndexesForString (enumType:"wordLike" searchRegex:"%searchTermsRegex%") { matched }\n' +
                        "  }\n" +
                        "}"
                    ).replace('%docSetId%', currentDocSet)
                        .replace('%bookCode%', bookToSearch)
                        .replace(
                            '%payloadSearchTerms%',
                            payloadSearchTerms
                                .map(st => `"""${st.toLowerCase()}"""`)
                                .join(", ")
                        )
                        .replace(
                            '%attSearchTerms%',
                            attSearchTerms
                                .map(st => st[0].startsWith('x-') ? `"""attribute/milestone/zaln/${st[0]}/0/${st[1]}"""` : `"""attribute/spanWithAtts/w/${st[0]}/0/${st[1]}"""`)
                                .join(", ")
                        )
                        .replace(
                            '%searchTermsRegex%',
                            payloadSearchTerms.length > 0 ?
                            payloadSearchTerms
                                .map(st => `(${st})`)
                                .join('|') :
                                "xxxxx"
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
        [resultsPage, currentDocSet, nResultsPerPage, payloadSearchTerms, attSearchTerms, searchAllBooks]
    );
    return (
        <IonPage>
            <IonHeader>
                <PageToolBar pageTitle="Search"/>
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
                        <IonRow>
                            <IonCol size={1}>
                                <IonButton
                                    color="secondary"
                                    fill="clear"
                                    onClick={() => setShowOptions(!showOptions)}
                                >
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
                            showOptions &&
                                <IonRow>
                                    <IonCol>
                                        <IonGrid style={{backgroundColor: "#EEF"}}>
                                            <IonRow>
                                                <IonCol>
                                                    <IonTitle>Search Options</IonTitle>
                                                </IonCol>
                                            </IonRow>
                                            <IonRow>
                                                <IonCol size={2}>
                                                    Results per page
                                                </IonCol>
                                                <IonCol size={10}>
                                                    <IonInput
                                                        value={nResultsPerPage}
                                                        onIonChange={e => parseInt(e.detail.value) > 4 && setNResultsPerPage(parseInt(e.detail.value))}
                                                    />
                                                </IonCol>
                                            </IonRow>
                                            <IonRow>
                                                <IonCol size={2}>
                                                    Search target
                                                </IonCol>
                                                <IonCol size={5}>
                                                    <span
                                                        onClick={() => {
                                                            setSearchTarget('docSet');
                                                            resetSearch();
                                                        }
                                                        }
                                                    >
                                                        <IonText color={searchTarget === 'docSet' ? 'primary' : 'secondary'}>
                                                        Current DocSet
                                                        </IonText>
                                                    </span>
                                                </IonCol>
                                                <IonCol size={5}>
                                                    <span
                                                        onClick={() => {
                                                            setSearchTarget('document');
                                                            resetSearch();
                                                        }
                                                        }
                                                    >
                                                        <IonText color={searchTarget === 'document' ? 'primary' : 'secondary'}>
                                                        Current Book
                                                        </IonText>
                                                    </span>
                                                </IonCol>
                                            </IonRow>
                                        </IonGrid>
                                    </IonCol>
                                </IonRow>
                        }
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
                                        resultParaRecords
                                            .slice(resultsPage * nResultsPerPage, (resultsPage * nResultsPerPage) + nResultsPerPage)
                                            .map(
                                                (rr, n) => {
                                                    const fromVerse = Math.min(...rr.verses);
                                                    const toVerse = Math.max(...rr.verses);
                                                    return <IonRow key={n}>
                                                        <IonCol size={1}
                                                                style={{fontSize: "smaller", fontWeight: "bold"}}>
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
                                                                                                            setWordDetails({
                                                                                                                ...t,
                                                                                                                book: rr.book,
                                                                                                                chapter: rr.chapter,
                                                                                                                verse: ig.scopeLabels[0].split('/')[1]
                                                                                                            });
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
                                                                                                        t.scopes.filter(s => attSearchTerms.map(st => st[1]).includes(s.split('/')[5])).length > 0 ?
                                                                                                            <IonText
                                                                                                                color="secondary"
                                                                                                                key={n}>
                                                                                                                {t.payload}
                                                                                                            </IonText> :
                                                                                                            t.payload :
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
            }
        </IonPage>
    );
};

export default SearchTab;
