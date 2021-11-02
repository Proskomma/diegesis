import React, {useContext, useEffect} from 'react';
import {IonButton, IonCol, IonRow, IonTitle, IonText} from '@ionic/react';
import PkContext from "../../contexts/PkContext";

const VerseDetails = ({
                          currentDocSet,
                          currentBookCode,
                          selectedChapter,
                          setSelectedChapter,
                          selectedVerses,
                          setSelectedVerses
                      }) => {
    const pk = useContext(PkContext);
    const [result, setResult] = React.useState({});
    useEffect(() => {
        const doQuery = async () => {
            const res = await pk.gqlQuery(`{ verseText: docSet(id:"${currentDocSet}") {document(bookCode:"${currentBookCode}") {cv(chapterVerses:"${selectedChapter}:${selectedVerses}") { text } } } }`);
            setResult(res);
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
                    onClick={() => {
                        setSelectedChapter(null);
                        setSelectedVerses(null);
                    }
                    }
                >
                    Dismiss
                </IonButton>
            </IonCol>
        </IonRow>
        <IonRow>
            <IonCol>
                <IonText color="primary">
                    {result.data && result.data.verseText && result.data.verseText.document.cv.map(cve => cve.text).join(' ')}
                </IonText>
            </IonCol>
        </IonRow>
    </>
}

export default VerseDetails;
