import {IonCol, IonGrid, IonRow, IonText} from "@ionic/react";
import VerseDetails from "./VerseDetails";
import React from "react";

const TextChapterContent = (
    {
        showDetails,
        renderedSequence,
        currentDocSet,
        currentBookCode,
        selectedChapter,
        selectedVerses,
        setShowDetails,
    }) => {
    return <IonGrid>
        {
            !showDetails &&
            <IonRow>
                <IonCol>
                    <IonText>{renderedSequence}</IonText>
                </IonCol>
            </IonRow>
        }
        {
            showDetails &&
            <VerseDetails
                currentDocSet={currentDocSet}
                currentBookCode={currentBookCode}
                selectedChapter={selectedChapter}
                selectedVerses={selectedVerses}
                setShowDetails={setShowDetails}
            />
        };
    </IonGrid>;
}

export default TextChapterContent;
