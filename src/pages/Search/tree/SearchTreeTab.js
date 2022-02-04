import {IonButton, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonPage, IonRow} from "@ionic/react";
import React, {useContext, useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import deepEqual from 'deep-equal';
import TreeSearchForm from "./TreeSearchForm";
import {refresh, search} from "ionicons/icons";
import PageToolBar from "../../../components/PageToolBar";
import DocSetsContext from "../../../contexts/DocSetsContext";
import PkContext from "../../../contexts/PkContext";
import SyntaxTreeRow from "../../../components/SyntaxTreeRow";
import SearchResultsTools from "../SearchResultsTools";
import {leaves, leaves1} from "../../../components/treeLeaves";

const SearchTreeTab = ({currentDocSet, currentBookCode}) => {
    const [content, setContent] = useState({});
    const [checkedFields, setCheckedFields] = useState([]);
    const [word, setWord] = useState('');
    const [lemma, setLemma] = useState('');
    const [gloss, setGloss] = useState('');
    const [strongs, setStrongs] = useState('');
    const [parsing, setParsing] = useState('');
    const [searchWaiting, setSearchWaiting] = React.useState(false);
    const [booksToSearch, setBooksToSearch] = React.useState([]);
    const [searchTarget, setSearchTarget] = React.useState('docSet');
    const [searchTerms, setSearchTerms] = React.useState([]);
    const [searchAllBooks, setSearchAllBooks] = React.useState(false);
    const [results, setResults] = useState([]);
    const [resultsPage, setResultsPage] = React.useState(0);
    const [nResultsPerPage, setNResultsPerPage] = React.useState(10);
    const [openBcvRef, setOpenBcvRef] = React.useState('MAT 1:18');
    const pk = useContext(PkContext);
    const docSets = useContext(DocSetsContext);
    const location = useLocation();

    useEffect(() => {
            if (location && location.state && location.state.content && !deepEqual(content, location.state.content)) {
                setContent(location.state.content);
                setResults([]);
            }
        },
    [location]
);

    useEffect(
        // When searchWaiting is set, refresh payloadSearchTerms and set booksToSearch
        () => {
            if (searchWaiting) {
                const treeSearchTerms = ['baa'];
                if (treeSearchTerms.length > 0) {
                    setBooksToSearch(searchTarget === 'docSet' ? Object.keys(docSets[currentDocSet].documents) : [currentBookCode]);
                    setSearchTerms(treeSearchTerms);
                }
                setResults([]);
                setSearchWaiting(false);
                setResultsPage(0);
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
                let rr = results;
                while (b2s && b2s.length > 0 && (searchAllBooks || rr.length < ((resultsPage + 1) * nResultsPerPage))) {
                    const bookToSearch = b2s[0];
                    console.log(bookToSearch)
                    let records = [];
                    let searchClause = "";
                    if (checkedFields.includes('word')) {
                        searchClause = `==(content('text'), '%searchTerm%')`
                            .replace('%searchTerm%', word);
                    }
                    if (checkedFields.includes('lemma')) {
                        searchClause = `==(content('lemma'), '%searchTerm%')`
                            .replace('%searchTerm%', lemma);
                    }
                    if (checkedFields.includes('gloss')) {
                        searchClause = `contains(content('gloss'), '%searchTerm%')`
                            .replace('%searchTerm%', gloss);
                    }
                    if (checkedFields.includes('strongs')) {
                        searchClause = `==(content('strong'), '%searchTerm%')`.replace('%searchTerm%', strongs);
                    }
                    let parsingClauses = [];
                    if (checkedFields.includes('parsing')) {
                        const kvs = parsing.split(/ +/)
                            .map(s => s.trim())
                            .forEach(s => {
                                const kv = s.split(':');
                                if (kv.length === 2) {
                                    parsingClauses.push(
                                        `==(content('%key%'), '%value%')`
                                            .replace('%key%', kv[0].trim())
                                            .replace('%value%', kv[1].trim())
                                    );
                                }
                            })
                    }
                    if (parsingClauses.length > 0) {
                        if (searchClause.length > 0) {
                            parsingClauses = [searchClause, ...parsingClauses];
                        }
                        searchClause = `and(${parsingClauses.join(',')})`
                    }
                    let query = `{
                      docSet(id:"%docSetId%") {
                        document(bookCode:"%bookCode%") {
                          treeSequences {
                            sentenceValues: tribos(
                            query:
                              "nodes[%searchClause%]/values{@sentence}"
                            )
                            sentenceNodes: tribos(
                            query:
                              "root/children/node{@sentence, id}"
                            )
                          }
                        }
                      }
                    }`.replace(/%docSetId%/g, currentDocSet)
                        .replace(/%bookCode%/g, bookToSearch)
                        .replace(/%searchClause%/g, searchClause)
                    let result = await pk.gqlQuery(
                        query
                    );
                    let sentences = JSON.parse(result.data.docSet.document.treeSequences[0].sentenceValues)
                        .data.sentence;
                    if (sentences) {
                        sentences = sentences.map(v => parseInt(v))
                            .sort((a, b) => a - b)
                            .map(v => `${v}`);
                        const sentence2id = {};
                        JSON.parse(result.data.docSet.document.treeSequences[0].sentenceNodes)
                            .data
                            .forEach(so => sentence2id[so.content.sentence] = so.id);
                        const sentenceIds = sentences
                            .map(s => sentence2id[s])
                            .join(', ');
                        query = `{
                      docSet(id:"%docSetId%") {
                        document(bookCode:"%bookCode%") {
                          treeSequences {
                            matches: tribos(
                            query:
                              "#{%ids%}/branch{children, content}"
                            )
                          }
                        }
                      }
                    }`.replace(/%docSetId%/g, currentDocSet)
                            .replace(/%bookCode%/g, bookToSearch)
                            .replace(/%ids%/g, sentenceIds);
                        result = await pk.gqlQuery(
                            query
                        );
                        rr = rr.concat(JSON.parse(result.data.docSet.document.treeSequences[0].matches).data.map(m => ({book: bookToSearch, ...m})));
                    }
                    b2s = b2s.slice(1);
                    rr = [...rr, ...records];
                }
                return [b2s, rr];
            }
            if (!searchWaiting) {
                doQuery().then((res) => {
                        setBooksToSearch(res[0]);
                        setResults(res[1]);
                    }
                )
            }
            ;
        },
        [resultsPage, currentDocSet, nResultsPerPage, searchAllBooks, searchWaiting, searchTerms]
    );
    const nodeMatchesSearch = node => {
        if (checkedFields.includes('word')) {
            if (word !== node.text) {
                return false;
            }
        }
        if (checkedFields.includes('lemma')) {
            if (lemma !== node.lemma) {
                return false;
            }
        }
        if (checkedFields.includes('gloss')) {
            if (gloss !== node.gloss) {
                return false;
            }
        }
        if (checkedFields.includes('strongs')) {
            if (strongs !== node.strong) {
                return false;
            }
        }
        if (checkedFields.includes('parsing')) {
            for (
                const [k, v] of
                parsing
                    .split(/ +/)
                    .map(s => s.trim())
                    .filter(s => s.includes(':'))
                    .map(s => s.split(':'))
                ) {
                if (!(k in node) || node[k] !== v) {
                    return false;
                }
            }
        }
        return true;
    }
    return <IonPage>
        <IonHeader>
            <PageToolBar pageTitle="Search Tree"/>
        </IonHeader>
        <IonContent>
            <IonGrid>
                <TreeSearchForm
                    content={content}
                    word={word}
                    setWord={setWord}
                    lemma={lemma}
                    setLemma={setLemma}
                    gloss={gloss}
                    setGloss={setGloss}
                    strongs={strongs}
                    setStrongs={setStrongs}
                    parsing={parsing}
                    setParsing={setParsing}
                    checkedFields={checkedFields}
                    setCheckedFields={setCheckedFields}
                />
                <IonRow>
                    <IonCol size={1}>
                        <IonButton
                            className="ion-float-end"
                            color="secondary"
                            fill="clear"
                            disabled={true}
                            onClick={() => console.log('reset')}
                        >
                            <IonIcon float-right icon={refresh}/>
                        </IonButton>
                    </IonCol>
                    <IonCol size={10}> </IonCol>
                    <IonCol size={1}>
                        <IonButton
                            color="primary"
                            fill="clear"
                            className="ion-float-start"
                            disabled={checkedFields.length === 0}
                            onClick={
                                () => {
                                    setSearchWaiting(true);
                                }
                            }
                        >
                            <IonIcon icon={search}/>
                        </IonButton>
                    </IonCol>
                </IonRow>
                {
                    results.length === 0 ?
                        <IonRow>
                            <IonCol>{booksToSearch && booksToSearch.length > 0 && (searchAllBooks || results.length < ((resultsPage + 1) * nResultsPerPage)) ? 'Searching' : 'No results'}</IonCol>
                        </IonRow> :
                        <>
                            <IonRow>
                                <IonCol style={{textAlign: "center"}}>
                                    <SearchResultsTools
                                        resultsPage={resultsPage}
                                        setResultsPage={setResultsPage}
                                        nResultsPerPage={nResultsPerPage}
                                        resultParaRecords={results}
                                        booksToSearch={booksToSearch}
                                        setSearchAllBooks={setSearchAllBooks}
                                    />
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol style={{textAlign: "center"}}>
                                    {results
                                        .slice(resultsPage * nResultsPerPage, (resultsPage * nResultsPerPage) + nResultsPerPage)
                                        .map(
                                            (r, pn) => {
                                                const bcvRef = `${r.book} ${r.content.cv}`;
                                                return <IonButton
                                                    key={pn}
                                                    size="small"
                                                    color="secondary"
                                                    fill={bcvRef === openBcvRef ? 'solid' : 'outline'}
                                                    onClick={() => setOpenBcvRef(bcvRef === openBcvRef ? '' : bcvRef)}
                                                >
                                                    {bcvRef}
                                                </IonButton>
                                            }
                                        )
                                    }
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol style={{textAlign: "center"}}>
                                    {results.filter(r => {
                                        const bcvRef = `${r.book} ${r.content.cv}`;
                                        return bcvRef === openBcvRef;
                                    })
                                        .map(
                                            (r, rn) =>
                                                leaves(leaves1(r.children, ''), '', '')
                                                    .map(
                                                        (l, n) =>
                                                            <span
                                                                key={`${rn}-${n}`}
                                                                style={{
                                                                    display: "inline-block",
                                                                    backgroundColor: "#DDD",
                                                                    padding: "5px",
                                                                    margin: "5px",
                                                                    fontWeight: nodeMatchesSearch(l) ? "bold" : "normal"
                                                                }}
                                                                onClick={() => setContent({...l})}
                                                            >
                                                                {l.text}<br/><span style={{fontSize: "smaller"}}>{l.gloss}</span>
                                                            </span>
                                                    )
                                        )
                                    }
                                        </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>
                                    {results.filter(r => {
                                        const bcvRef = `${r.book} ${r.content.cv}`;
                                        return bcvRef === openBcvRef;
                                    })
                                        .map((r, rn) => {
                                            const bcvRef = `${r.book} ${r.content.cv}`;
                                            return r.children.map((rc, n) => <IonGrid key={n}>
                                                    <SyntaxTreeRow
                                                        treeData={rc}
                                                        key={n}
                                                        rowKey={`${rn}-${n}`}
                                                        isOpen={bcvRef === openBcvRef}
                                                    />
                                                </IonGrid>
                                            )
                                        })}
                                </IonCol>
                            </IonRow>
                        </>
                }
            </IonGrid>
        </IonContent>
    </IonPage>
}

export default SearchTreeTab;
