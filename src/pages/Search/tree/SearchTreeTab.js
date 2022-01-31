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

const syntaxTreeAsList = tr => {
    let children = [];
    if (tr.children) {
        children = tr.children.map(ch => syntaxTreeAsList(ch))
    }
    return <li><b>{tr.content.text}</b> <i>{tr.content.gloss}</i>{children.length > 0 ? <ul>{children}</ul>: ''}</li>;
}

const SearchTreeTab = ({currentDocSet, currentBookCode}) => {
    const [content, setContent] = useState({});
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
    const [nResultsPerPage, setNResultsPerPage] = React.useState(5);
    const pk = useContext(PkContext);
    const docSets = useContext(DocSetsContext);
    const location = useLocation();
    if (location && location.state && location.state.content && !deepEqual(content, location.state.content)) {
        setContent(location.state.content);
    }

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
                    let query = `{
                      docSet(id:"%docSetId%") {
                        document(bookCode:"%bookCode%") {
                          treeSequences {
                            sentenceValues: tribos(
                            query:
                              "nodes[==(content('text'), '%searchWord%')]/values{@sentence}"
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
                        .replace(/%searchWord%/g, word);
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
                              "#{%ids%}/branch{@text, @gloss, @cv, children, @class}"
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
            };
        },
        [resultsPage, currentDocSet, nResultsPerPage, searchAllBooks, searchWaiting, searchTerms]
    );
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
                            <IonCol>No Results</IonCol>
                        </IonRow> :
                        results
                            .map(
                                r => <IonRow>
                                    <IonCol size={1}>{`${r.book} ${r.content.cv}`}</IonCol>
                                    <IonCol size={11}>
                                        {r.children.map((rc, n) => <SyntaxTreeRow treeData={rc} rowKey={n}/>)}
                                    </IonCol>
                                </IonRow>
                            )
                }
            </IonGrid>
        </IonContent>
    </IonPage>
}

export default SearchTreeTab;
