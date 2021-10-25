import React from 'react';
import {IonButton, IonModal} from '@ionic/react';

export const AddRemoteModal = ({showModal, setShowModal}) => {

    return (
        <IonModal isOpen={showModal} cssClass='my-custom-class' backdropDismiss={false}>
            <p>Add Content from a Server</p>
            <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
        </IonModal>
    );
};

export default AddRemoteModal;
