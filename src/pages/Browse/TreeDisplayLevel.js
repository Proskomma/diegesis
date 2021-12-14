import {IonButton, IonCol, IonIcon} from "@ionic/react";
import {arrowBack, arrowForward} from "ionicons/icons";
import React from "react";

const detailLevels = [null, 'text', 'text and gloss', 'text, gloss and lemma', 'all'];

const TreeDisplayLevel = ({leafDetailLevel, setLeafDetailLevel}) => <>
    <IonCol size={1}>
    <IonButton
        color="secondary"
        fill="clear"
        disabled={leafDetailLevel <= 1}
        onClick={() => setLeafDetailLevel(leafDetailLevel - 1)}
    >
        <IonIcon icon={arrowBack}/>
    </IonButton>
</IonCol>
<IonCol size={4} style={{textAlign: "center"}}>
    display {detailLevels[leafDetailLevel]}
</IonCol>
<IonCol size={1}>
    <IonButton
        color="secondary"
        fill="clear"
        disabled={leafDetailLevel >= 4}
        onClick={() => setLeafDetailLevel(leafDetailLevel + 1)}
    >
        <IonIcon icon={arrowForward}/>
    </IonButton>
</IonCol>
    </>;

export default TreeDisplayLevel;
