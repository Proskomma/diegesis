import React from 'react';
import {IonButton, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonModal, IonRow, IonTitle} from '@ionic/react';
import onlineSources from "../../resources/sourceIndexes/online_sources";
import {download} from "ionicons/icons";

export const AddLocalModal = ({showModal, setShowModal}) => {

    return (
        <IonModal isOpen={showModal} cssClass='my-custom-class' backdropDismiss={false}>
            <IonHeader>
                <IonTitle>Add Content from a Server</IonTitle>
            </IonHeader>
            <IonContent>
                <IonGrid>
                    {
                        [...onlineSources.entries()].map(([n, os]) =>
                            <IonRow key={n}>
                                <IonCol size="8">{os.description}</IonCol>
                                <IonCol size="3">{os.selectors.source}</IonCol>
                                <IonCol size="1">
                                    <IonButton
                                        fill="clear"
                                        onClick={() => 'doDownload(os)'}>
                                        <IonIcon icon={download}/>
                                    </IonButton>
                                </IonCol>
                            </IonRow>)
                    }
                </IonGrid>
            </IonContent>
            <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
        </IonModal>
    );
};

export default AddLocalModal;
