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
} from '@ionic/react';
import './SearchTab.css';

import PkContext from '../../contexts/PkContext';
import PageToolBar from "../../components/PageToolBar";
import SearchResultsTools from './SearchResultsTools';
import {options, search, trash} from "ionicons/icons";
import WordDetails from "./WordDetails";
import SearchOptions from "./SearchOptions";
import searchBlockMatchQuery from "./searchBlockMatchQuery";
import searchVerseMatchQuery from "./searchVerseMatchQuery";
import DocSetsContext from "../../contexts/DocSetsContext";
import ReactMarkdown from "react-markdown";

const SearchTab = ({currentDocSet, currentBookCode, setCurrentBookCode, setSelectedChapter, setSelectedVerses}) => {
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
    const [docType, setDocType] = React.useState('');
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
        // Get docType
        () => {
            const docSetRecord = docSets[currentDocSet];
            if (docSetRecord) {
                const documentRecord = docSetRecord.documents[currentBookCode];
                if (documentRecord) {
                    const docTypeTag = documentRecord.tags.filter(t => t.startsWith('doctype'))[0];
                    if (docTypeTag) {
                        const dt = docTypeTag.split(':')[1];
                        setDocType(dt);
                    }
                }
            }
        },
        [currentDocSet, currentBookCode]
    );
    useEffect(
        // When searchWaiting is set, refresh payloadSearchTerms and set booksToSearch
        () => {
            if (docType === 'text' && searchWaiting) {
                // TEXT:
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
                } else {
                    setSearchWaiting(false);
                }
            } else if (docType === 'table' && searchWaiting) {
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
            } else if (searchWaiting) {
                console.log(`searching ${docType} (not implemented)`);
                setSearchWaiting(false);
            }
        },
        [searchWaiting, searchTarget, docType]
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
                    if (docType === 'text' && searchResultUnit === 'block') {
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
                    } else if (docType === 'text') {
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
                    } else if (docType === 'table') {
                        if (tableSearchTerms.length > 0) {
                            const matches = '[' + tableSearchTerms.map(tst => `{colN:${tst[1]} matching:"${tst[0] === '=' ? '^' : ''}${tst[2]}${tst[0] === '=' ? '$' : ''}"}`).join(', ') + ']';
                            const searchTableMatchQuery = `{
                          docSet(id:"%docSetId%") {
                            document(bookCode:"%bookCode%") {
                              bookCode: header(id: "bookCode")
                              tableSequences {
                                headings
                                rows(matches:%matches%) {
                                  rows
                                  text
                                }
                              }
                            }
                          }
                        }`
                                .replace(/%docSetId%/g, currentDocSet)
                                .replace(/%bookCode%/g, bookToSearch)
                                .replace(/%matches%/g, matches);
                            const result = await pk.gqlQuery(searchTableMatchQuery);
                            if (result.data && result.data.docSet && result.data.docSet.document) {
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
    const textResultCellContent = () =>
        resultParaRecords
            .slice(resultsPage * nResultsPerPage, (resultsPage * nResultsPerPage) + nResultsPerPage)
            .map(
                (rr, n) => {
                    if (!rr || !rr.verses) {
                        return '';
                    }
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
                                                                                onClick={
                                                                                    () => jumpToVerse(
                                                                                        rr.book,
                                                                                        rr.chapter,
                                                                                        ig.scopeLabels.filter(s => s.startsWith('verses/'))[0].split('/')[1]
                                                                                    )
                                                                                }
                                                                                className="verseNumber">{
                                                                                ig.scopeLabels.filter(s => s.startsWith('verses/'))[0].split('/')[1]
                                                                            }</Link>
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
            );

    const tableResultCellContent = () => {
        const resultsToShow = resultParaRecords
            .slice(resultsPage * nResultsPerPage, (resultsPage * nResultsPerPage) + nResultsPerPage);
        return !resultsToShow ?
            [] :
            resultsToShow.map(
                r => <IonRow>
                    <IonCol
                        style={{
                            backgroundColor: '#F7F7F7',
                            borderBottom: "solid 1px #CCC",
                        }}
                    >
                        <ReactMarkdown>{
                            `${r.book}/${r.row}`
                        }</ReactMarkdown>
                    </IonCol>
                    {
                        r.fields && r.fields
                            .map((f, n) => <IonCol
                                size={n === (resultParaRecords[0].headings.length - 1) ? 11 - (resultParaRecords[0].headings.length - 1) : 1}
                                style={{
                                    backgroundColor: (n % 2 === 0) ? "#FFF" : '#F7F7F7',
                                    borderBottom: "solid 1px #CCC",
                                }}
                            >
                                {<ReactMarkdown>{
                                    f
                                        .replace(/<br>/g, '\n')
                                        .replace(/\\n/g, '\n')
                                        .replace(/\(See: .+\)/g, "")
                                }</ReactMarkdown>}
                            </IonCol>)
                    }
                </IonRow>
            );
    }

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
                                    <SearchOptions
                                        nResultsPerPage={nResultsPerPage}
                                        setNResultsPerPage={setNResultsPerPage}
                                        searchTarget={searchTarget}
                                        setSearchTarget={setSearchTarget}
                                        resetSearch={resetSearch}
                                        searchResultUnit={searchResultUnit}
                                        setSearchResultUnit={setSearchResultUnit}
                                    />
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
                                        docType === 'text' ?
                                            textResultCellContent() :
                                            <>
                                                <IonRow>
                                                    <IonCol
                                                        style={{
                                                            backgroundColor: '#CCC',
                                                            borderBottom: "solid 1px #CCC",
                                                        }}
                                                    >Book/Row</IonCol>
                                                    {
                                                        resultParaRecords[0].headings && resultParaRecords[0].headings.map(
                                                            (h, hn) => <IonCol
                                                                key={hn}
                                                                size={hn === (resultParaRecords[0].headings.length - 1) ? 11 - (resultParaRecords[0].headings.length - 1) : 1}
                                                                style={{
                                                                    backgroundColor: (hn % 2 === 0) ? "#DDD" : '#CCC',
                                                                    borderBottom: "solid 1px #CCC",
                                                                }}
                                                            >
                                                                {hn} - {h}
                                                            </IonCol>
                                                        )
                                                    }
                                                </IonRow>
                                                {tableResultCellContent()}
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

export default SearchTab;
