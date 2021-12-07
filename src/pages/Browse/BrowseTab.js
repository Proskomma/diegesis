import React, {useContext, useEffect, useRef, useState} from 'react';
import {
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonItem,
    IonPage,
    IonRow,
    IonSelect,
    IonSelectOption,
    IonText
} from '@ionic/react';
import {ScriptureDocSet, ScriptureParaModel, ScriptureParaModelQuery,} from 'proskomma-render';
import BrowseDocumentModel from './BrowseDocumentModel';
import TextChapterContent from "./TextChapterContent";
import TreeChapterContent from "./TreeChapterContent";
import TableChapterContent from "./TableChapterContent";

import './BrowseTab.css';
import PageToolBar from '../../components/PageToolBar';

import PkContext from '../../contexts/PkContext';
import DocSetsContext from '../../contexts/DocSetsContext';


const BrowseTab = (
    {
        currentDocSet,
        setCurrentDocSet,
        currentBookCode,
        setCurrentBookCode,
        selectedChapter,
        selectedVerses,
        setSelectedChapter,
        setSelectedVerses,
        currentDocId
    }
) => {
    const pk = useContext(PkContext);
    const docSets = useContext(DocSetsContext);
    const [renderedSequence, setRenderedSequence] = useState([]);
    const [chapterNodes, setChapterNodes] = useState([]);
    const [showDetails, setShowDetails] = useState(false);
    const selectedVerseRef = useRef(null);
    const topDocRef = useRef(null);
    const scrollToSelectedVerse = () => {
        if (selectedVerseRef.current) {
            selectedVerseRef.current.scrollIntoView({block: "center"});
        }
        return true;
    }
    const scrollToTopDoc = () => {
        if (topDocRef.current) {
            topDocRef.current.scrollIntoView({block: "start"});
        }
        return true;
    }

    useEffect(() => {
        const doQuery = async () => {
            if (currentDocSet &&
                docSets[currentDocSet].documents[currentBookCode] &&
                docSets[currentDocSet].documents[currentBookCode].tags.includes('doctype:text')) {
                const resData = await ScriptureParaModelQuery(pk, [currentDocSet], [currentDocId]);
                if (resData.docSets && resData.docSets[0]) {
                    const config = {
                        rendered: [],
                        versesCallback: ((chapter, verses) => {
                            setSelectedChapter(chapter);
                            setSelectedVerses(verses);
                            setShowDetails(true);
                        }),
                        selectedChapter,
                        selectedVerses,
                        selectedVerseRef,
                        topDocRef,
                    };
                    const model = new ScriptureParaModel(resData, config);
                    const docSetModel = new ScriptureDocSet(resData, model.context, config);
                    docSetModel.addDocumentModel("default", new BrowseDocumentModel(resData, model.context, config));
                    model.addDocSetModel('default', docSetModel);
                    model.render();
                    setRenderedSequence(config.rendered);
                }
            }
        };
        if (currentDocSet && currentBookCode) {
            doQuery();
        }
    }, [currentBookCode, currentDocSet, selectedChapter, selectedVerses, pk]);
    useEffect(() => {
        const doQuery = async () => {
            if (currentDocSet &&
                currentBookCode &&
                docSets[currentDocSet].documents[currentBookCode] &&
                docSets[currentDocSet].documents[currentBookCode].tags.includes('doctype:tree')) {
                const res = await pk.gqlQuery(`{docSet(id:"${currentDocSet}") {
               document(bookCode:"${currentBookCode}") {
                 treeSequences {
                   id
                   chapterTrees: tribos(query:"nodes[startsWith(content('cv'), '${selectedChapter || '1'}:')]/branch{children, @text, @gloss, @class}")
                 }
               }
             }}`);
                setChapterNodes(JSON.parse(res.data.docSet.document.treeSequences[0].chapterTrees).data);
                }
        };
        if (currentDocSet && currentBookCode) {
            doQuery();
        }
    }, [currentBookCode, currentDocSet, selectedChapter, selectedVerses, pk]);
    useEffect(() => {
        if (selectedVerses && selectedVerseRef) {
            scrollToSelectedVerse();
        } else if (topDocRef) {
            scrollToTopDoc();
        }
    }, [selectedVerses, selectedVerseRef, topDocRef, showDetails, renderedSequence]);
    return (
        <IonPage>
            <IonHeader>
                <PageToolBar pageTitle="Browse"/>
                {
                    currentDocSet !== "" &&
                    <IonGrid>
                        <IonRow>
                            <IonCol size={6}>
                                <IonSelect
                                    value={currentDocSet}
                                    disabled={showDetails}
                                    onIonChange={e => {
                                        const docSet = docSets[e.detail.value];
                                        if (docSet) {
                                            setCurrentDocSet(e.detail.value);
                                            const firstBookCode = Object.keys(docSet.documents)[0];
                                            setCurrentBookCode(currentBookCode in docSet.documents ? currentBookCode : firstBookCode);
                                            setSelectedChapter(null);
                                            setSelectedVerses(null);
                                        }
                                    }}>
                                    {
                                        [...Object.entries(docSets)]
                                            .map(dse =>
                                                <IonSelectOption key={dse[0]} value={dse[0]}>
                                                    {`${dse[0]}`}
                                                </IonSelectOption>
                                            )
                                    }
                                </IonSelect>
                            </IonCol>
                            <IonCol size={6}>
                                <IonSelect
                                    value={currentBookCode}
                                    disabled={showDetails}
                                    onIonChange={e => setCurrentBookCode(e.detail.value)}>
                                    {
                                        [...Object.entries(docSets[currentDocSet].documents)]
                                            .map(de =>
                                                <IonSelectOption key={de[0]} value={de[0]}>
                                                    {`${de[0]}`}
                                                </IonSelectOption>
                                            )
                                    }
                                </IonSelect>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                }
            </IonHeader>
            <IonContent>
                {!currentDocSet &&
                <IonItem><IonText color="primary">No content - download some in settings</IonText></IonItem>}
                {
                    currentDocSet &&
                    docSets[currentDocSet].documents[currentBookCode] &&
                    docSets[currentDocSet].documents[currentBookCode].tags.includes('doctype:text') &&
                    <TextChapterContent
                        showDetails={showDetails}
                        renderedSequence={renderedSequence}
                        currentDocSet={currentDocSet}
                        currentBookCode={currentBookCode}
                        selectedChapter={selectedChapter}
                        selectedVerses={selectedVerses}
                        setShowDetails={setShowDetails}
                    />
                }
                {
                    currentDocSet &&
                    docSets[currentDocSet].documents[currentBookCode] &&
                    docSets[currentDocSet].documents[currentBookCode].tags.includes('doctype:tree') &&
                    <TreeChapterContent
                        chapterNodes={chapterNodes}
                        showDetails={showDetails}
                        currentDocSet={currentDocSet}
                        currentBookCode={currentBookCode}
                        selectedChapter={selectedChapter}
                        selectedVerses={selectedVerses}
                        setShowDetails={setShowDetails}
                    />
                }
                {
                    currentDocSet &&
                    docSets[currentDocSet].documents[currentBookCode] &&
                    docSets[currentDocSet].documents[currentBookCode].tags.includes('doctype:table') &&
                    <TableChapterContent
                        showDetails={showDetails}
                        currentDocSet={currentDocSet}
                        currentBookCode={currentBookCode}
                        selectedChapter={selectedChapter}
                        selectedVerses={selectedVerses}
                        setShowDetails={setShowDetails}
                    />
                }
                {currentDocSet && docSets[currentDocSet].documents[currentBookCode].tags.filter(t => t.startsWith('doctype')).length === 0 &&
                <IonRow>
                    <IonCol>
                        <IonText>{docSets[currentDocSet].documents[currentBookCode].tags.join(', ')}</IonText>
                    </IonCol>
                </IonRow>
                }
            </IonContent>
        </IonPage>
    );
};

export default BrowseTab;
