import React, {useContext, useEffect, useState} from 'react';
import {Redirect, Route} from 'react-router-dom';
import {IonApp, IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs} from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';
import {book, create, print} from 'ionicons/icons';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

/* Non-ionic imports */
import BrowseTab from './pages/Browse/BrowseTab';
import EditTab from './pages/Edit/EditTab';
import PublishTab from './pages/Publish/PublishTab';
import SettingsTab from './pages/Settings/SettingsTab';
import PkContext, {PkProvider} from './contexts/PkContext';
import {blocksSpecUtils} from 'proskomma';
import {SettingsProvider} from './contexts/SettingsContext';
import {DocSetsProvider} from './contexts/DocSetsContext';

const App = () => {
    const [loadUuid, setLoadUuid] = React.useState("");
    const [toImport, setToImport] = React.useState([]);
    const [docSets, setDocSets] = React.useState({});
    const [currentDocSet, setCurrentDocSet] = React.useState("");
    const [currentBookCode, setCurrentBookCode] = React.useState("");
    const pk = useContext(PkContext);
    const settings = {
        enableNetworkAccess: useState(false)
    };
    useEffect(() => {
        if (toImport.length > 0) {
            const importRecord = toImport[0];
            setToImport(toImport.slice(1));
            if (importRecord.contentType === 'usfm') {
                pk.importDocument(
                    {
                        lang: importRecord.selectors.lang,
                        abbr: importRecord.selectors.abbr
                    },
                    importRecord.contentType,
                    importRecord.content
                );
            } else if (importRecord.contentType === 'tsv') {
                const addTsv = async () => {
                    const tsvJson = blocksSpecUtils.tsvToInputBlock(importRecord.content, true);
                    const tsvQueryContent = blocksSpecUtils.blocksSpec2Query(tsvJson);
                    let bookCode = null;
                    let rowN=0;
                    while (!bookCode) { // TERRIBLE KLUDGE!
                        const name = tsvJson[rowN].items[1].payload;
                        console.log("-", name)
                        if (name === name.toUpperCase()) {
                            bookCode = name;
                        } else {
                            rowN++;
                        }
                    }
                    console.log("bookCode", bookCode);
                    const stubUsfm = `\\id ${bookCode} TSV document\n\\toc1 ${bookCode}\n\\mt TSV Document for ${bookCode}`;
                    let query = `mutation { addDocument(` +
                        `selectors: [{key: "lang", value: "${importRecord.selectors.lang}"}, {key: "abbr", value: "${importRecord.selectors.abbr}"}], ` +
                        `contentType: "usfm", ` +
                        `content: """${stubUsfm}""") }`;
                    let result = await pk.gqlQuery(query);
                    if (!result.data || !result.data.addDocument) {
                        console.log(`tsv doc creation for ${bookCode} failed: ${JSON.stringify(result)}`);
                        return;
                    }
                    const docSetId = `${importRecord.selectors.lang}_${importRecord.selectors.abbr}`;
                    query = `{ docSet(id:"${docSetId}") { id document(bookCode:"${bookCode}") { id } } }`;
                    result = await pk.gqlQuery(query);
                    if (!result.data || !result.data.docSet || !result.data.docSet.document) {
                        console.log(`docSet query after tsv creation for ${bookCode} failed: ${JSON.stringify(result)}`);
                        return;
                    }
                    const docId = result.data.docSet.document.id;
                    query = `mutation { newSequence(` +
                        ` documentId: "${docId}"` +
                        ` type: "table"` +
                        ` blocksSpec: ${tsvQueryContent}` +
                        ` graftToMain: true) }`;
                    result = await pk.gqlQuery(query);
                    if (result.errors) {
                        console.log(`tsv mutation for ${bookCode} failed: ${JSON.stringify(result)}`);
                    }
                }
                addTsv().then();
            } else {
                console.log(`Unknown import contentType '${importRecord.contentType}'`)
            }
        }
    }, [loadUuid, toImport]);

    useEffect(() => {
        const doQuery = async () => {
            const res = await pk.gqlQuery('{ docSets { id selectors { key value } documents(sortedBy:"paratext") { id bookCode: header(id:"bookCode")} } }');
            const dss = {}
            for (const ds of res.data.docSets) {
                const selectors = {};
                for (const selector of ds.selectors) {
                    selectors[selector.key] = selector.value;
                }
                const documents = {};
                for (const document of ds.documents) {
                    documents[document.bookCode] = {
                        id: document.id,
                    }
                }
                dss[ds.id] = {
                    selectors,
                    documents,
                }
            }
            setDocSets(dss);
            if (res.data.docSets.length > 0 && !currentDocSet) {
                setCurrentDocSet(res.data.docSets[0].id);
                setCurrentBookCode(res.data.docSets[0].documents[0].bookCode);
            }
        };
        doQuery();
    }, [loadUuid, toImport]);
    return <IonApp>
        <PkProvider value={pk}>
            <SettingsProvider value={settings}>
                <DocSetsProvider value={docSets}>
                    <IonPage>
                        <IonReactRouter>
                            <IonTabs>
                                <IonRouterOutlet>
                                    <Route exact path="/browse">
                                        <BrowseTab
                                            currentDocSet={currentDocSet}
                                            setCurrentDocSet={setCurrentDocSet}
                                            currentBookCode={currentBookCode}
                                            currentDocId={docSets[currentDocSet] && docSets[currentDocSet].documents[currentBookCode] ? docSets[currentDocSet].documents[currentBookCode].id : ""}
                                            setCurrentBookCode={setCurrentBookCode}
                                        />
                                    </Route>
                                    <Route exact path="/edit">
                                        <EditTab/>
                                    </Route>
                                    <Route exact path="/publish">
                                        <PublishTab/>
                                    </Route>
                                    <Route exact path="/settings">
                                        <SettingsTab
                                            loadUuid={loadUuid}
                                            setLoadUuid={setLoadUuid}
                                            toImport={toImport}
                                            setToImport={setToImport}
                                            currentDocSet={currentDocSet}
                                            setCurrentDocSet={setCurrentDocSet}
                                            currentBookCode={currentBookCode}
                                            setCurrentBookCode={setCurrentBookCode}
                                        />
                                    </Route>
                                    <Route render={() => <Redirect to="/browse"/>}/>
                                </IonRouterOutlet>
                                <IonTabBar slot="bottom">
                                    <IonTabButton tab="browse" href="/browse">
                                        <IonIcon icon={book}/>
                                        <IonLabel>Browse</IonLabel>
                                    </IonTabButton>
                                    <IonTabButton tab="edit" href="/edit">
                                        <IonIcon icon={create}/>
                                        <IonLabel>Edit</IonLabel>
                                    </IonTabButton>
                                    <IonTabButton tab="publish" href="/publish">
                                        <IonIcon icon={print}/>
                                        <IonLabel>Publish</IonLabel>
                                    </IonTabButton>
                                </IonTabBar>
                            </IonTabs>
                        </IonReactRouter>
                    </IonPage>
                </DocSetsProvider>
            </SettingsProvider>
        </PkProvider>
    </IonApp>
};

export default App;
