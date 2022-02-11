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
import InterlinearNode from "../../../components/InterlinearNode";
import TreeDisplayLevel from "../../../components/TreeDisplayLevel";
import TreeDetails from "./TreeDetails";

const SearchTreeTab = ({currentDocSet, currentBookCode}) => {
    const [content, setContent] = useState({});
    const [checkedFields, setCheckedFields] = useState([]);
    const [word, setWord] = useState('');
    const [lemma, setLemma] = useState('');
    const [gloss, setGloss] = useState('');
    const [strongs, setStrongs] = useState('');
    const [parsing, setParsing] = useState('');
    const [checkedFields_2, setCheckedFields_2] = useState([]);
    const [word_2, setWord_2] = useState('');
    const [lemma_2, setLemma_2] = useState('');
    const [gloss_2, setGloss_2] = useState('');
    const [strongs_2, setStrongs_2] = useState('');
    const [parsing_2, setParsing_2] = useState('');
    const [searchWaiting, setSearchWaiting] = React.useState(false);
    const [booksToSearch, setBooksToSearch] = React.useState([]);
    const [searchTarget, setSearchTarget] = React.useState('docSet');
    const [searchTerms, setSearchTerms] = React.useState([]);
    const [searchAllBooks, setSearchAllBooks] = React.useState(false);
    const [results, setResults] = useState([]);
    const [resultsPage, setResultsPage] = React.useState(0);
    const [nResultsPerPage, setNResultsPerPage] = React.useState(10);
    const [openBcvRef, setOpenBcvRef] = React.useState('MAT 1:18');
    const [leafDetailLevel, setLeafDetailLevel] = useState(1);
    const [selectedNode, setSelectedNode] = useState(null);
    const pk = useContext(PkContext);
    const docSets = useContext(DocSetsContext);
    const location = useLocation();

    useEffect(() => {
            if (location && location.state && location.state.content && !deepEqual(content, location.state.content)) {
                if (location.state.referer === "browse" || location.state.referer === "newSearch" || location.state.referer === "addSearch" || Object.keys(content).length === 0) {
                    setContent(location.state.content);
                    setResults([]);
                    setSelectedNode(null);
                    if (location.state.referer === "browse" || location.state.referer === "newSearch") {
                        setWord_2('');
                        setLemma_2('');
                        setGloss_2('');
                        setStrongs_2('');
                        setParsing_2('');
                    }
                } else {
                    setSelectedNode(location.state.content);
                }
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
            const searchTermClause = (cf, f) => {
                let ret = "";
                if (cf.includes('word')) {
                    ret = `==(content('text'), '%searchTerm%')`
                        .replace('%searchTerm%', f.word);
                }
                if (cf.includes('lemma')) {
                    ret = `==(content('lemma'), '%searchTerm%')`
                        .replace('%searchTerm%', f.lemma);
                }
                if (cf.includes('gloss')) {
                    ret = `contains(content('gloss'), '%searchTerm%')`
                        .replace('%searchTerm%', f.gloss);
                }
                if (cf.includes('strongs')) {
                    ret = `==(content('strong'), '%searchTerm%')`
                        .replace('%searchTerm%', f.strongs);
                }
                let parsingClauses = [];
                if (cf.includes('parsing')) {
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
                    if (ret.length > 0) {
                        parsingClauses = [ret, ...parsingClauses];
                    }
                    ret = `and(${parsingClauses.join(',')})`
                }
                return ret;
            }
            const doQuery = async () => {
                let b2s = booksToSearch;
                let rr = results;

                const searchClause = searchTermClause(
                    checkedFields,
                    {
                        word: word,
                        lemma: lemma,
                        gloss: gloss,
                        strongs: strongs,
                        parsing: parsing,
                    }
                );
                const searchClause_2 = searchTermClause(
                    checkedFields_2,
                    {
                        word: word_2,
                        lemma: lemma_2,
                        gloss: gloss_2,
                        strongs: strongs_2,
                        parsing: parsing_2,
                    }
                );

                while (b2s && b2s.length > 0 && (searchAllBooks || rr.length < ((resultsPage + 1) * nResultsPerPage))) {
                    const bookToSearch = b2s[0];
                    console.log(bookToSearch)
                    let records = [];

                    let query = `{
                      docSet(id:"%docSetId%") {
                        document(bookCode:"%bookCode%") {
                          treeSequences {
                            
                            %sentenceValues%
                            %sentenceValues2%
                            sentenceNodes: tribos(
                            query:
                              "root/children/node{@sentence, id}"
                            )
                          }
                        }
                      }
                    }`.replace(/%docSetId%/g, currentDocSet)
                        .replace(/%bookCode%/g, bookToSearch)
                        .replace(
                            /%sentenceValues%/g,
                            searchClause.length > 0 ? `sentenceValues: tribos(query: "nodes[${searchClause}]/values{@sentence}")` : ""
                        )
                        .replace(
                            /%sentenceValues2%/g,
                            searchClause_2.length > 0 ? `sentenceValues2: tribos(query: "nodes[${searchClause_2}]/values{@sentence}")` : ""
                        )
                    let result = await pk.gqlQuery(
                        query
                    );
                    let sentences1 = [];
                    let hasS1 = false;
                    let hasS2 = false;
                    if (result.data.docSet.document.treeSequences[0].sentenceValues) {
                        hasS1 = true;
                        const s1v = JSON.parse(result.data.docSet.document.treeSequences[0].sentenceValues);
                        sentences1 = s1v.data.sentence || [];
                    }
                    let sentences2 = [];
                    if (result.data.docSet.document.treeSequences[0].sentenceValues2) {
                        hasS2 = true;
                        const s2v = JSON.parse(result.data.docSet.document.treeSequences[0].sentenceValues2);
                        sentences2 = s2v.data.sentence || [];
                    }
                    let sentences = [];
                    if (hasS1 && hasS2) {
                        sentences = sentences1.filter(s => sentences2.includes(s));
                    } else if (hasS2) {
                        sentences = sentences2;
                    } else {
                        sentences = sentences1;
                    }
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
                        if (sentenceIds.length > 0) {
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
    const nodeMatchesSearch1 = (node, isSecond) => {
        const cf = isSecond ? checkedFields_2 : checkedFields;
        if (cf.length === 0) {
            return false;
        }
        if (cf.includes('word')) {
            if (!isSecond && word !== node.text) {
                return false;
            }
            if (isSecond && word_2 !== node.text) {
                return false;
            }
        }
        if (cf.includes('lemma')) {
            if (!isSecond && lemma !== node.lemma) {
                return false;
            }
            if (isSecond && lemma_2 !== node.lemma) {
                return false;
            }
        }
        if (cf.includes('gloss')) {
            if (!isSecond && gloss !== node.gloss) {
                return false;
            }
            if (isSecond && gloss_2 !== node.gloss) {
                return false;
            }
        }
        if (cf.includes('strongs')) {
            if (!isSecond && strongs !== node.strong) {
                return false;
            }
            if (isSecond && strongs_2 !== node.strong) {
                return false;
            }
        }
        if (cf.includes('parsing')) {
            for (
                const [k, v] of
                (isSecond ? parsing_2 : parsing)
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
    const nodeMatchesSearch = node => {
        return nodeMatchesSearch1(node, false) || nodeMatchesSearch1(node, true);
    }
    return <IonPage>
        <IonHeader>
            <PageToolBar pageTitle="Search Tree"/>
        </IonHeader>
        {
            selectedNode && <TreeDetails
                currentContent={content}
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
            />
        }
        {
            !selectedNode && <IonContent>
                <IonGrid>
                    <TreeSearchForm
                        isSecond={false}
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
                        <IonCol>
                            <TreeSearchForm
                                isSecond={true}
                                content={content}
                                word={word_2}
                                setWord={setWord_2}
                                lemma={lemma_2}
                                setLemma={setLemma_2}
                                gloss={gloss_2}
                                setGloss={setGloss_2}
                                strongs={strongs_2}
                                setStrongs={setStrongs_2}
                                parsing={parsing_2}
                                setParsing={setParsing_2}
                                checkedFields={checkedFields_2}
                                setCheckedFields={setCheckedFields_2}
                            />

                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol size={11}> </IonCol>
                        <IonCol size={1}>
                            <IonButton
                                color="primary"
                                fill="clear"
                                className="ion-float-start"
                                disabled={checkedFields.length === 0 && checkedFields_2.length === 0}
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
                                <IonCol>No results</IonCol>
                            </IonRow> :
                            <>
                                <IonRow>
                                    <IonCol size={8}>
                                        <SearchResultsTools
                                            resultsPage={resultsPage}
                                            setResultsPage={setResultsPage}
                                            nResultsPerPage={nResultsPerPage}
                                            resultParaRecords={results}
                                            booksToSearch={booksToSearch}
                                            setSearchAllBooks={setSearchAllBooks}
                                        />
                                    </IonCol>
                                    <IonCol style={{textAlign: "right"}} size={4}>
                                        <TreeDisplayLevel
                                            leafDetailLevel={leafDetailLevel}
                                            setLeafDetailLevel={setLeafDetailLevel}
                                        />
                                    </IonCol>
                                </IonRow>
                                {results
                                    .slice(resultsPage * nResultsPerPage, (resultsPage * nResultsPerPage) + nResultsPerPage)
                                    .map(
                                        (r, pn) => {
                                            const bcvRef = `${r.book} ${r.content.cv}`;
                                            return <IonRow>
                                                <IonCol size={1}>
                                                    <IonButton
                                                        key={pn}
                                                        size="small"
                                                        color="secondary"
                                                        fill={bcvRef === openBcvRef ? 'solid' : 'outline'}
                                                        onClick={() => setOpenBcvRef(bcvRef === openBcvRef ? '' : bcvRef)}
                                                    >
                                                        {bcvRef}
                                                    </IonButton>
                                                </IonCol>
                                                <IonCol size={11}>
                                                    {
                                                        leaves(leaves1(r.children, ''), '', '')
                                                            .map(
                                                                (l, n) =>
                                                                    <InterlinearNode
                                                                        key={`${pn}-${n}`}
                                                                        content={l}
                                                                        detailLevel={leafDetailLevel}
                                                                        isBold={nodeMatchesSearch(l)}
                                                                        referer="search"
                                                                    />
                                                            )
                                                    }
                                                    {(bcvRef === openBcvRef) && <SyntaxTreeRow
                                                        treeData={r}
                                                        key={pn}
                                                        rowKey={pn}
                                                        isOpen={true}
                                                    />}
                                                </IonCol>
                                            </IonRow>
                                        }
                                    )
                                }
                            </>
                    }
                </IonGrid>
            </IonContent>
        }
    </IonPage>
}

export default SearchTreeTab;
