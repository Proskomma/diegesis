import React from 'react';
import {IonButton, IonCol, IonContent, IonGrid, IonRow, IonTitle} from '@ionic/react';
import './SearchTab.css';

const WordDetails = ({wordDetails, setWordDetails, searchString, setSearchString, resetSearch}) => {
    return <IonContent>
        <IonGrid>
            <IonRow>
                <IonCol size={8}>
                    <IonTitle>Word <b>'{wordDetails.payload}'</b> in {wordDetails.book} {wordDetails.chapter}:{wordDetails.verse}
                    </IonTitle>
                </IonCol>
                <IonCol size={4} className="ion-text-end">
                    <IonButton
                        size="small"
                        onClick={
                            () => {
                                setWordDetails(false);
                            }
                        }
                    >
                        Dismiss
                    </IonButton>
                </IonCol>
            </IonRow>
            <IonRow>
                <IonCol>
                    <IonButton
                        color="secondary"
                        style={{textTransform: "none"}}
                        onClick={() => {
                            setWordDetails(null);
                            setSearchString(wordDetails.payload);
                            resetSearch();
                        }}>
                        {`Search for '${wordDetails.payload}'`}
                    </IonButton>
                </IonCol>
            </IonRow>
            {!searchString.includes(wordDetails.payload) && <IonRow>
                <IonCol>
                    <IonButton
                        color="secondary"
                        style={{textTransform: "none"}}
                        onClick={() => {
                            setWordDetails(null);
                            setSearchString(`${searchString.trim()} ${wordDetails.payload}`);
                            resetSearch();
                        }}>
                        {`Search for '${searchString.trim()} ${wordDetails.payload}'`}</IonButton>
                </IonCol>
            </IonRow>}
            {wordDetails.scopes
                .filter(s => s.startsWith("attribute/spanWithAtts/w/strong"))
                .map(
                    (s, n) =>
                        <IonRow key={n}>
                            <IonCol>
                                <span>Search for Strongs '{s.split('/')[5]}'</span>
                            </IonCol>
                        </IonRow>
                )
            }
        </IonGrid>
    </IonContent>
}

export default WordDetails;
