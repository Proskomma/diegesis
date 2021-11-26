import React, {useContext, useEffect, useState} from 'react';
import {IonButton, IonCol, IonRow, IonTitle} from '@ionic/react';
import './BrowseTab.css';
import PkContext from "../../contexts/PkContext";
import SyntaxTrees from "./SyntaxTrees";
import TranslationNotes from "./TranslationNotes";
import StudyNotes from "./StudyNotes";
import MaybeRowText from "../../components/MaybeRowText";

const xre = require('xregexp');

const VerseDetails = (
    {
        currentDocSet,
        currentBookCode,
        selectedChapter,
        selectedVerses,
        setShowDetails,
    }
) => {
    const pk = useContext(PkContext);
    const [result, setResult] = React.useState({});
    const [tnIsOpen, setTnIsOpen] = useState(false);
    const [snIsOpen, setSnIsOpen] = useState(false);
    const [stIsOpen, setStIsOpen] = useState(false);
    useEffect(() => {
        const doQuery = async () => {
            const res = await pk.gqlQuery(`{
             verseText: docSet(id:"${currentDocSet}") {
               document(bookCode:"${currentBookCode}") {cv(chapterVerses:"${selectedChapter}:${selectedVerses}") { text } }
             }
             grcVerseText: docSet(id:"grc_ugnt") {
               document(bookCode:"${currentBookCode}") {cv(chapterVerses:"${selectedChapter}:${selectedVerses}") { text } }
             }
             }`);
            setResult(res);
            const refs = new Set();
            for (const [resourceName, resourceCol] of [['translationNotes', 2], ['studyNotes', 1]]) {
                if (res.data && res.data[resourceName] && res.data[resourceName].document && res.data[resourceName].document.tableSequences) {
                    for (const row of res.data[resourceName].document.tableSequences[0].rows) {
                        for (const linkPhrase of xre.match(row[resourceCol].text, /\(See: \[\[(.*?)\]\]\)/g)) {
                            const link = xre.exec(linkPhrase, /\[\[rc:\/\/(.*?)\]\]/)[1];
                            if (link.startsWith('en/ta')) {
                                refs.add(link);
                            }
                        }
                    }
                }
            }
            // console.log(Array.from(refs));
        };
        doQuery();
    }, []);
    return <>
        <IonRow>
            <IonCol size={8}>
                <IonTitle>{currentBookCode} {selectedChapter}:{selectedVerses}</IonTitle>
            </IonCol>
            <IonCol size={4} className="ion-text-end">
                <IonButton
                    size="small"
                    onClick={
                        () => {
                            setShowDetails(false);
                        }
                    }
                >
                    Dismiss
                </IonButton>
            </IonCol>
        </IonRow>
        <MaybeRowText
            hasData={result.data && result.data.verseText}
            text={result.data && result.data.verseText && result.data.verseText.document.cv.map(cve => cve.text).join(' ')}
            color="primary"/>
        {
            currentDocSet !== 'grc_ugnt' &&
            <MaybeRowText
                hasData={result.data && result.data.grcVerseText}
                text={result.data && result.data.grcVerseText && result.data.grcVerseText.document.cv.map(cve => cve.text).join(' ')}
                color="secondary"/>
        }
        <TranslationNotes
            isOpen={tnIsOpen}
            setIsOpen={setTnIsOpen}
            currentBookCode={currentBookCode}
            selectedChapter={selectedChapter}
            selectedVerses={selectedVerses}
        />
        <StudyNotes
            isOpen={snIsOpen}
            setIsOpen={setSnIsOpen}
            currentBookCode={currentBookCode}
            selectedChapter={selectedChapter}
            selectedVerses={selectedVerses}
        />
        <SyntaxTrees
            isOpen={stIsOpen}
            setIsOpen={setStIsOpen}
            currentBookCode={currentBookCode}
            selectedChapter={selectedChapter}
            selectedVerses={selectedVerses}
        />
    </>
}

export default VerseDetails;
