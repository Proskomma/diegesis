import {IonButton, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonPage, IonRow} from "@ionic/react";
import React, {useContext, useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import deepEqual from 'deep-equal';
import TreeSearchForm from "../TreeSearchForm";
import {refresh, search} from "ionicons/icons";
import PageToolBar from "../../../components/PageToolBar";
import DocSetsContext from "../../../contexts/DocSetsContext";
import PkContext from "../../../contexts/PkContext";

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
                console.log(treeSearchTerms);
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
                              "nodes[==(content('text'), 'τὸν')]/values{@sentence}"
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
                    ;
                    const result = await pk.gqlQuery(
                        query
                    );
                    console.log(JSON.stringify(JSON.parse(result.data.docSet.document.treeSequences[0].sentenceValues).data.sentence.map(v => parseInt(v)).sort((a,b) => a - b)));
                    console.log(JSON.stringify(JSON.parse(result.data.docSet.document.treeSequences[0].sentenceNodes).data));
                    b2s = b2s.slice(1);
                    rr = [...rr, ...records];
                }
                return [b2s, rr];
            }
            if (!searchWaiting) {
                console.log('here!')
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
                        <IonCol>No Results</IonCol> :
                        <IonCol>{JSON.stringify(results)}</IonCol>
                }
            </IonGrid>
        </IonContent>
    </IonPage>
}

export default SearchTreeTab;
