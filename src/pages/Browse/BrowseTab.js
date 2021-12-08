import React, {useContext, useState} from 'react';
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
import TextBookContent from "./TextBookContent";
import TreeChapterContent from "./TreeChapterContent";
import TableChapterContent from "./TableChapterContent";

import './BrowseTab.css';
import PageToolBar from '../../components/PageToolBar';

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
    const docSets = useContext(DocSetsContext);
    const [showDetails, setShowDetails] = useState(false);
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
                    <TextBookContent
                        showDetails={showDetails}
                        currentDocSet={currentDocSet}
                        currentDocId={currentDocId}
                        currentBookCode={currentBookCode}
                        selectedChapter={selectedChapter}
                        setSelectedChapter={setSelectedChapter}
                        selectedVerses={selectedVerses}
                        setSelectedVerses={setSelectedVerses}
                        setShowDetails={setShowDetails}
                    />
                }
                {
                    currentDocSet &&
                    docSets[currentDocSet].documents[currentBookCode] &&
                    docSets[currentDocSet].documents[currentBookCode].tags.includes('doctype:tree') &&
                    <TreeChapterContent
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
