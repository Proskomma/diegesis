import React, {useContext, useEffect, useState} from 'react';
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
import VerseDetails from "./VerseDetails";
import './BrowseTab.css';
import PageToolBar from '../../components/PageToolBar';

import PkContext from '../../contexts/PkContext';
import DocSetsContext from '../../contexts/DocSetsContext';


const BrowseTab = ({currentDocSet, setCurrentDocSet, currentBookCode, setCurrentBookCode, currentDocId}) => {
    const pk = useContext(PkContext);
    const docSets = useContext(DocSetsContext);
    const [renderedSequence, setRenderedSequence] = useState([]);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [selectedVerses, setSelectedVerses] = useState(null);

    useEffect(() => {
        const doQuery = async () => {
            const resData = await ScriptureParaModelQuery(pk, [currentDocSet], [currentDocId]);
            if (resData.docSets && resData.docSets[0]) {
                const config = {
                    rendered: [],
                    versesCallback: ((chapter, verses) => {
                        setSelectedChapter(chapter);
                        setSelectedVerses(verses);
                    }),
                };
                const model = new ScriptureParaModel(resData, config);
                const docSetModel = new ScriptureDocSet(resData, model.context, config);
                docSetModel.addDocumentModel("default", new BrowseDocumentModel(resData, model.context, config));
                model.addDocSetModel('default', docSetModel);
                model.render();
                setRenderedSequence(config.rendered);
            }
        };
        if (currentDocSet && currentBookCode) {
            doQuery();
        }
    }, [currentBookCode, currentDocSet, pk]);
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
                                    disabled={selectedChapter && selectedVerses}
                                    onIonChange={e => {
                                        setCurrentDocSet(e.detail.value);
                                        const docSet = docSets[e.detail.value];
                                        if (docSet) {
                                            const firstBookCode = Object.keys(docSet.documents)[0];
                                            setCurrentBookCode(currentBookCode in docSet.documents ? currentBookCode : firstBookCode);
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
                                    disabled={selectedChapter && selectedVerses}
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
                {currentDocSet &&
                <IonGrid>
                    {
                        (!selectedChapter || !selectedVerses) &&
                        <IonRow>
                            <IonCol>
                                <IonText>{renderedSequence}</IonText>
                            </IonCol>
                        </IonRow>
                    }
                    {
                        (selectedChapter && selectedVerses) &&
                        <VerseDetails
                            currentDocSet={currentDocSet}
                            currentBookCode={currentBookCode}
                            selectedChapter={selectedChapter}
                            selectedVerses={selectedVerses}
                            setSelectedChapter={setSelectedChapter}
                            setSelectedVerses={setSelectedVerses}
                        />
                    }
                </IonGrid>}
            </IonContent>
        </IonPage>
    );
};

export default BrowseTab;
