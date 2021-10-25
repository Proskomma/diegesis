import React, { useState } from "react";
import {IonButton, IonCol, IonGrid, IonIcon, IonLabel, IonRow} from '@ionic/react';
import {download, folder, trash} from "ionicons/icons";

import AddLocalModal from "./AddLocalModal";
import AddRemoteModal from "./AddRemoteModal";

const StorageSettings = () => {
    const [showRemoteModal, setShowRemoteModal] = useState(false);
    const [showLocalModal, setShowLocalModal] = useState(false);
    return <>
        <AddRemoteModal showModal={showRemoteModal} setShowModal={setShowRemoteModal}/>
        <AddLocalModal showModal={showLocalModal} setShowModal={setShowLocalModal}/>
        <IonGrid>
            <IonRow>
                <IonCol className="ion-text-center">
                    <IonButton
                        color="secondary"
                        size="small"
                        onClick={() => setShowRemoteModal(true)}
                    >
                        <IonIcon icon={download}/>&nbsp;
                        <IonLabel>Add from Server</IonLabel>
                    </IonButton>
                </IonCol>
                <IonCol className="ion-text-center">
                    <IonButton
                        color="secondary"
                        size="small"
                        onClick={() => setShowLocalModal(true)}>
                        <IonIcon icon={folder}/>&nbsp;
                        <IonLabel>Add from Local Storage</IonLabel>
                    </IonButton>
                </IonCol>
                <IonCol className="ion-text-center">
                    <IonButton
                        color="secondary"
                        size="small"
                        disabled={true}>
                        <IonIcon icon={trash}/>&nbsp;
                        <IonLabel>Remove Selected</IonLabel>
                    </IonButton>
                </IonCol>
            </IonRow>
        </IonGrid>
    </>
}

export default StorageSettings;
