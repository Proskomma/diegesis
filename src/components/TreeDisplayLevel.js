import {IonButton, IonCol, IonIcon} from "@ionic/react";
import {arrowBack, arrowForward} from "ionicons/icons";
import React from "react";

const detailLevels = [null, 'text', 'gloss', 'root', 'all'];

const TreeDisplayLevel = ({leafDetailLevel, setLeafDetailLevel}) => <>
    <IonCol size={1} style={{textAlign: "right"}}>
    <IonButton
        color="secondary"
        fill="clear"
        disabled={leafDetailLevel <= 1}
        onClick={() => setLeafDetailLevel(leafDetailLevel - 1)}
    >
        <IonIcon icon={arrowBack}/>
    </IonButton>
</IonCol>
<IonCol size={1} style={{textAlign: "center"}}>
    {detailLevels[leafDetailLevel]}
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
