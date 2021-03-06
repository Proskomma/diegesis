import React, {useContext, useEffect, useState} from 'react';
import {Redirect, Route} from 'react-router-dom';
import {IonApp, IonButton, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs} from '@ionic/react';
import { setupIonicReact } from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';
import {book, cog, create, print, search} from 'ionicons/icons';

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
import SearchTextTab from './pages/Search/text/SearchTextTab';
import SearchTableTab from './pages/Search/table/SearchTableTab';
import SearchTreeTab from './pages/Search/tree/SearchTreeTab';
import EditTab from './pages/Edit/EditTab';
import PublishTab from './pages/Publish/PublishTab';
import SettingsTab from './pages/Settings/SettingsTab';
import PkContext, {PkProvider} from './contexts/PkContext';
import {blocksSpecUtils} from 'proskomma';
import {SettingsProvider} from './contexts/SettingsContext';
import {DocSetsProvider} from './contexts/DocSetsContext';

const {generateId} = require('proskomma-utils');

setupIonicReact({});

const App = () => {
    const [loadUuid, setLoadUuid] = React.useState("");
    const [toImport, setToImport] = React.useState([]);
    const [docSets, setDocSets] = React.useState({});
    const [currentDocSet, setCurrentDocSet] = React.useState("");
    const [currentBookCode, setCurrentBookCode] = React.useState("");
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [selectedVerses, setSelectedVerses] = useState(null);
    const [mutationId, setMutationId] = useState(null);
    const [docType, setDocType] = useState("");
    const pk = useContext(PkContext);
    const updateMutationId = () => setMutationId(generateId());
    const settings = {
        enableNetworkAccess: useState(false)
    };
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
                    importRecord.content,
                    null,
                    null,
                    null,
                    importRecord.docTypes.map(dt => `doctype:${dt}`)
                );
            } else if (importRecord.contentType === 'tsv') {
                const addTsv = async () => {
                    const tsvJson = blocksSpecUtils.tsvToInputBlock(importRecord.content, true);
                    const tsvHeadings = blocksSpecUtils.tsvHeadingTags(importRecord.content);
                    const tsvQueryContent = blocksSpecUtils.blocksSpec2Query(tsvJson);
                    const stubUsfm =
                        `\\id ${importRecord.bookCode} TSV document\n\\toc1 ${importRecord.bookCode}\n\\mt TSV Document for ${importRecord.bookCode}`;
                    let query = `mutation { addDocument(` +
                        `selectors: [{key: "lang", value: "${importRecord.selectors.lang}"}, {key: "abbr", value: "${importRecord.selectors.abbr}"}], ` +
                        `contentType: "usfm", ` +
                        `content: """${stubUsfm}"""` +
                        `tags: "${importRecord.docTypes.map(dt => 'doctype:' + dt)}") }`;
                    let result = await pk.gqlQuery(query);
                    if (!result.data || !result.data.addDocument) {
                        console.log(`tsv doc creation for ${importRecord.bookCode} failed: ${JSON.stringify(result)}`);
                        return;
                    }
                    const docSetId = `${importRecord.selectors.lang}_${importRecord.selectors.abbr}`;
                    query = `{ docSet(id:"${docSetId}") { id document(bookCode:"${importRecord.bookCode}") { id } } }`;
                    result = await pk.gqlQuery(query);
                    if (!result.data || !result.data.docSet || !result.data.docSet.document) {
                        console.log(`docSet query after tsv creation for ${importRecord.bookCode} failed: ${JSON.stringify(result)}`);
                        return;
                    }
                    const docId = result.data.docSet.document.id;
                    query = `mutation { newSequence(` +
                        ` documentId: "${docId}"` +
                        ` type: "table"` +
                        ` blocksSpec: ${tsvQueryContent}` +
                        ` tags: ${JSON.stringify(tsvHeadings)}` +
                        ` graftToMain: true) }`;
                    result = await pk.gqlQuery(query, updateMutationId);
                    if (result.errors) {
                        console.log(`tsv mutation for ${importRecord.bookCode} failed: ${JSON.stringify(result)}`);
                    }
                }
                addTsv().then();
            } else if (importRecord.contentType === 'pkSerialized') {
                pk.loadSuccinctDocSet(importRecord.content);
                // const query = '{docSet(id:"eng_uwta") { documents { kvSequences { id entries(keyMatches:"translate>>figs-exc") { key itemGroups { scopeLabels(startsWith:"kvField") text } } } } } }'
                // pk.gqlQuery(query).then(response => console.log(JSON.stringify(response.data.docSet.documents[0].kvSequences[0].entries, null, 2)));
            } else {
                console.log(`Unknown import contentType '${importRecord.contentType}'`)
            }
        }
    }, [loadUuid, toImport]);

    useEffect(() => {
        const doQuery = async () => {
            const res = await pk.gqlQuery('{ docSets { id selectors { key value } documents(sortedBy:"paratext") { id tags bookCode: header(id:"bookCode")} } }');
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
                        tags: document.tags,
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
    }, [loadUuid, mutationId, toImport]);
    return <IonApp>
        <PkProvider value={pk}>
            <SettingsProvider value={settings}>
                <DocSetsProvider value={docSets}>
                    <IonReactRouter>
                        <IonTabs>
                            <IonRouterOutlet>
                                <Route exact path="/browse">
                                    <BrowseTab
                                        currentDocSet={currentDocSet}
                                        setCurrentDocSet={setCurrentDocSet}
                                        currentBookCode={currentBookCode}
                                        selectedChapter={selectedChapter}
                                        selectedVerses={selectedVerses}
                                        currentDocId={docSets[currentDocSet] && docSets[currentDocSet].documents[currentBookCode] ? docSets[currentDocSet].documents[currentBookCode].id : ""}
                                        setCurrentBookCode={setCurrentBookCode}
                                        setSelectedChapter={setSelectedChapter}
                                        setSelectedVerses={setSelectedVerses}
                                        mutationId={mutationId}
                                    />
                                </Route>
                                <Route exact path="/search/text">
                                    <SearchTextTab
                                        currentDocSet={currentDocSet}
                                        currentBookCode={currentBookCode}
                                        setCurrentBookCode={setCurrentBookCode}
                                        setSelectedChapter={setSelectedChapter}
                                        setSelectedVerses={setSelectedVerses}
                                    />
                                </Route>
                                <Route exact path="/search/tree">
                                    <SearchTreeTab
                                        currentDocSet={currentDocSet}
                                        currentBookCode={currentBookCode}
                                    />
                                </Route>
                                <Route exact path="/search/table">
                                    <SearchTableTab
                                        currentDocSet={currentDocSet}
                                        currentBookCode={currentBookCode}
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
                                        updateMutationId={updateMutationId}
                                    />
                                </Route>
                                <Route render={() => <Redirect to="/browse"/>}/>
                            </IonRouterOutlet>
                            <IonTabBar slot="bottom">
                                <IonTabButton tab="browse" href="/browse">
                                    <IonIcon icon={book}/>
                                    <IonLabel>Browse</IonLabel>
                                </IonTabButton>
                                <IonTabButton tab="search" href={`/search/${docType}`}>
                                    <IonIcon icon={search}/>
                                    <IonLabel>Search</IonLabel>
                                </IonTabButton>
                                <IonTabButton tab="edit" href="/edit" disabled={true}>
                                    <IonIcon icon={create}/>
                                    <IonLabel>Edit</IonLabel>
                                </IonTabButton>
                                <IonTabButton tab="publish" href="/publish" disabled={true}>
                                    <IonIcon icon={print}/>
                                    <IonLabel>Publish</IonLabel>
                                </IonTabButton>
                                <IonTabButton tab="settings" href="/settings">
                                    <IonIcon icon={cog}/>
                                    <IonLabel>Settings</IonLabel>
                                </IonTabButton>
                            </IonTabBar>
                        </IonTabs>
                    </IonReactRouter>
                </DocSetsProvider>
            </SettingsProvider>
        </PkProvider>
    </IonApp>
};

export default App;
