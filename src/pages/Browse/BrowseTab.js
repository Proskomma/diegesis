import React, {useContext} from 'react';
import {IonContent, IonHeader, IonItem, IonPage, IonText} from '@ionic/react';
import './BrowseTab.css';
import TextBookContent from "./TextBookContent";
import TreeChapterContent from "./TreeChapterContent";
import TableChapterContent from "./TableChapterContent";
import PageToolBar from '../../components/PageToolBar';
import TranslationNavigation from '../../components/TranslationNavigation';

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
    const tagsPresent = () =>
        currentDocSet &&
        docSets[currentDocSet].documents[currentBookCode] &&
        docSets[currentDocSet].documents[currentBookCode].tags;
    const Navigation = ({transType}) => <TranslationNavigation
        transType={transType}
        currentDocSet={currentDocSet}
        setCurrentDocSet={setCurrentDocSet}
        currentBookCode={currentBookCode}
        setCurrentBookCode={setCurrentBookCode}
        selectedChapter={selectedChapter}
        setSelectedChapter={setSelectedChapter}
        selectedVerses={selectedVerses}
        setSelectedVerses={setSelectedVerses}
    />;
    return (
        <IonPage>
            <IonHeader>
                <PageToolBar pageTitle="Browse"/>
            </IonHeader>
            {
                !currentDocSet &&
                <IonContent>
                    <IonItem>
                        <IonText color="primary">No content - download some in settings</IonText>
                    </IonItem>
                </IonContent>
            }
            {
                tagsPresent() &&
                docSets[currentDocSet].documents[currentBookCode].tags.includes('doctype:text') &&
                <>
                    <IonHeader>
                        <Navigation transType="text"/>
                    </IonHeader>
                    <IonContent>
                        <TextBookContent
                            currentDocSet={currentDocSet}
                            currentDocId={currentDocId}
                            currentBookCode={currentBookCode}
                            selectedChapter={selectedChapter}
                            setSelectedChapter={setSelectedChapter}
                            selectedVerses={selectedVerses}
                            setSelectedVerses={setSelectedVerses}
                        />
                    </IonContent>
                </>
            }
            {
                tagsPresent() &&
                docSets[currentDocSet].documents[currentBookCode].tags.includes('doctype:tree') &&
                <TreeChapterContent
                    currentDocSet={currentDocSet}
                    setCurrentDocSet={setCurrentDocSet}
                    currentBookCode={currentBookCode}
                    setCurrentBookCode={setCurrentBookCode}
                    selectedChapter={selectedChapter}
                    setSelectedChapter={setSelectedChapter}
                    selectedVerses={selectedVerses}
                    setSelectedVerses={setSelectedVerses}
                />
            }
            {
                tagsPresent() &&
                docSets[currentDocSet].documents[currentBookCode].tags.includes('doctype:table') &&
                <>
                    <IonHeader>
                        <Navigation transType="table"/>
                    </IonHeader>
                    <IonContent>
                        <TableChapterContent
                            currentDocSet={currentDocSet}
                            currentBookCode={currentBookCode}
                            selectedChapter={selectedChapter}
                            selectedVerses={selectedVerses}
                        />
                    </IonContent>
                </>
            }
            {
                tagsPresent() &&
                docSets[currentDocSet].documents[currentBookCode].tags.filter(t => t.startsWith('doctype')).length === 0 &&
                <IonContent>
                    <IonItem>
                        <IonText>{docSets[currentDocSet].documents[currentBookCode].tags.join(', ')}</IonText>
                    </IonItem>
                </IonContent>
            }
        </IonPage>
    );
};

export default BrowseTab;
