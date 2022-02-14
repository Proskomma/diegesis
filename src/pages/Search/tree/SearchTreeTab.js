import {IonButton, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonPage, IonRow} from "@ionic/react";
import React, {useContext, useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import TreeSearchForm from "./TreeSearchForm";
import {addCircle, search} from "ionicons/icons";
import PageToolBar from "../../../components/PageToolBar";
import DocSetsContext from "../../../contexts/DocSetsContext";
import PkContext from "../../../contexts/PkContext";
import SyntaxTreeRow from "../../../components/SyntaxTreeRow";
import SearchResultsTools from "../SearchResultsTools";
import {leaves, leaves1} from "../../../components/treeLeaves";
import InterlinearNode from "../../../components/InterlinearNode";
import TreeDisplayLevel from "../../../components/TreeDisplayLevel";

const SearchTreeTab = ({currentDocSet, currentBookCode}) => {
    const [searchFields, setSearchFields] = useState([]);
    const [searchWaiting, setSearchWaiting] = React.useState(false);
    const [booksToSearch, setBooksToSearch] = React.useState([]);
    const [searchTarget, setSearchTarget] = React.useState('docSet');
    const [searchAllBooks, setSearchAllBooks] = React.useState(false);
    const [results, setResults] = useState([]);
    const [resultsPage, setResultsPage] = React.useState(0);
    const [nResultsPerPage, setNResultsPerPage] = React.useState(10);
    const [openBcvRef, setOpenBcvRef] = React.useState('');
    const [leafDetailLevel, setLeafDetailLevel] = useState(1);
    const pk = useContext(PkContext);
    const docSets = useContext(DocSetsContext);
    const location = useLocation();
    const updateSearchField = (fieldContent, fieldN) => setSearchFields(searchFields.map((f, n) => n === fieldN ? fieldContent : f));
    const removeSearchField = (fieldN) => setSearchFields(searchFields.filter((f, n) => n !== fieldN));
    const addSearchField = nf =>
        setSearchFields([
            ...searchFields,
            (nf || {
                    word: '',
                    lemma: '',
                    gloss: '',
                    strongs: '',
                    parsing: '',
                    checkedFields: [],
                }
            ),
        ])

    useEffect(() => {
            if (location && location.state && location.state.content) {
                addSearchField({
                    ...location.state.content,
                    checkedFields: ['lemma'],
                    parsing: Object.keys(location.state.content)
                        .filter(k => ['person', 'gender', 'case', 'number', 'tense', 'voice', 'mood'].includes(k))
                        .map(k => `${k}:${location.state.content[k]}`)
                        .join(' '),
                });
            }
        },
        [location]
    );

    useEffect(
        // When searchWaiting is set, set booksToSearch
        () => {
            if (searchWaiting) {
                setBooksToSearch(searchTarget === 'docSet' ? Object.keys(docSets[currentDocSet].documents) : [currentBookCode]);
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
            const searchTermClause = f => {
                let ret = "";
                for (const ff of ['text', 'lemma', 'gloss', 'strong']) {
                    if ((f.checkedFields || []).includes(ff) && f[ff].length > 0) {
                        ret = `==(content('%ff%'), '%searchTerm%')`
                            .replace('%searchTerm%', f[ff])
                            .replace('%ff%', ff);
                        break;
                    }
                }
                if (ret.length === 0) {
                    return ret;
                }
                let parsingClauses = [];
                if (f.checkedFields.includes('parsing')) {
                    const kvs = f.parsing.split(/ +/)
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

                const combinedClauses = searchFields.map(f => searchTermClause(f))
                    .filter(c => c.length > 0)
                    .map(c => `"nodes[${c}]/values{@sentence}"`)
                    .join(",");

                while (b2s && b2s.length > 0 && (searchAllBooks || rr.length < ((resultsPage + 1) * nResultsPerPage))) {
                    const bookToSearch = b2s[0];
                    console.log(bookToSearch)
                    let records = [];

                    let query = `{
                      docSet(id:"%docSetId%") {
                        document(bookCode:"%bookCode%") {
                          treeSequences {
                            sentenceValues: triboi(queries: [%combinedClauses%])
                            sentenceNodes: tribos(
                            query:
                              "root/children/node{@sentence, id}"
                            )
                          }
                        }
                      }
                    }`.replace(/%docSetId%/g, currentDocSet)
                        .replace(/%bookCode%/g, bookToSearch)
                        .replace(/%combinedClauses%/g, combinedClauses);
                    let result = await pk.gqlQuery(
                        query
                    );
                    const sv = result.data.docSet.document.treeSequences[0].sentenceValues
                        .map(r => JSON.parse(r))
                        .map(r => (r && r.data && r.data.sentence) ? r : {data: {sentence: []}});
                    let sentences = sv[0].data.sentence;
                    for (const svs of (sv.slice(1) || [])) {
                        sentences = sentences.filter(s => svs.data && svs.data.sentence && svs.data.sentence.includes(s));
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
        [resultsPage, currentDocSet, nResultsPerPage, searchAllBooks, searchWaiting]
    );
    const nodeMatchesSearch1 = (node, sf) => {
        const mainSearchKey = sf.checkedFields.filter(f => f !== 'parsing')[0];
        if (!mainSearchKey || (node[mainSearchKey] !== sf[mainSearchKey])) {
            return false;
        }
        if (sf.checkedFields.includes('parsing')) {
            const parsingKV = sf.parsing
                .split(/ +/)
                .map(t => t.trim())
                .map(t => t.split(':'))
                .filter(kv => kv.length === 2);
            for (const [k, v] of parsingKV) {
                if (!node[k] || node[k] !== v) {
                    return false;
                }
            }
        }
        return true;
    }
    const nodeMatchesSearch = node => {
        for (const sf of searchFields) {
            if (nodeMatchesSearch1(node, sf)) {
                return true;
            }
        }
        return false;
    }
    const somethingSelected = () => {
        return searchFields
            .filter(
                f => {
                    return ['text', 'lemma', 'gloss', 'strong']
                        .filter(
                            ff =>
                                f.checkedFields.includes(ff) &&
                                (f[ff] || '')
                                    .trim()
                                    .length > 0
                        )
                        .length > 0;
                }
            )
            .length;
    }
    return <IonPage>
        <IonHeader>
            <PageToolBar pageTitle="Search Tree"/>
        </IonHeader>
        <IonContent>
            <IonGrid>
                {searchFields.map((f, n) => <TreeSearchForm
                        key={n}
                        searchField={searchFields[n]}
                        updateSearchField={updateSearchField}
                        removeSearchField={removeSearchField}
                        fieldN={n}
                        nFields={searchFields.length}
                    />
                )
                }
                <IonRow>
                    <IonCol size={1}>
                        <IonButton
                            className="ion-float-start"
                            fill="clear"
                            color="secondary"
                            onClick={() => addSearchField(null)}
                        >
                            <IonIcon icon={addCircle}/>
                        </IonButton>
                    </IonCol>
                    <IonCol size={10}> </IonCol>
                    <IonCol size={1}>
                        <IonButton
                            color="primary"
                            fill="clear"
                            className="ion-float-end"
                            disabled={searchFields.length === 0 || !somethingSelected()}
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
                                        return <IonRow key={pn}>
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
    </IonPage>
}

export default SearchTreeTab;
