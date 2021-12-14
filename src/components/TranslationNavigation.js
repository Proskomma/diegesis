import {IonButton, IonCol, IonGrid, IonIcon, IonRow, IonSelect, IonSelectOption} from "@ionic/react";
import React, {useContext} from "react";
import DocSetsContext from "../contexts/DocSetsContext";
import {arrowBack, arrowForward} from "ionicons/icons";

const TranslationNavigation = (
    {
        transType,
        currentDocSet,
        setCurrentDocSet,
        currentBookCode,
        setCurrentBookCode,
        selectedChapter,
        setSelectedChapter,
        selectedVerses,
        setSelectedVerses,
    }
) => {
    const docSets = useContext(DocSetsContext);
    return <IonGrid>
        <IonRow>
            <IonCol size={3}>
                <IonSelect
                    value={currentDocSet}
                    onIonChange={e => {
                        const docSet = docSets[e.detail.value];
                        if (docSet) {
                            setCurrentDocSet(e.detail.value);
                            const firstBookCode = Object.keys(docSet.documents)[0];
                            setCurrentBookCode(currentBookCode in docSet.documents ? currentBookCode : firstBookCode);
                            setSelectedChapter(1);
                            setSelectedVerses(1);
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
            <IonCol size={3}>
                <IonSelect
                    value={currentBookCode}
                    onIonChange={
                        e => {
                            setCurrentBookCode(e.detail.value);
                            setSelectedChapter(1);
                            setSelectedVerses(1);
                        }
                    }>
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
            {transType === 'tree' && <>
            <IonCol size={1} style={{textAlign: "right"}}>
                <IonButton
                    color="secondary"
                    fill="clear"
                    onClick={() => setSelectedChapter(selectedChapter - 1)}
                >
                    <IonIcon icon={arrowBack}/>
                </IonButton>
            </IonCol>
            <IonCol size={2} style={{textAlign: "center"}}>
                Ch {selectedChapter}
            </IonCol>
            <IonCol size={1}>
                <IonButton
                    color="secondary"
                    fill="clear"
                    onClick={() => setSelectedChapter(selectedChapter + 1)}
                >
                    <IonIcon icon={arrowForward}/>
                </IonButton>
            </IonCol>
            </>}
        </IonRow>
    </IonGrid>
};

export default TranslationNavigation;
