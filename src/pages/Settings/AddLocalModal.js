import React from 'react';
import {IonButton, IonModal} from '@ionic/react';

export const AddLocalModal = ({showModal, setShowModal}) => {

    return (
        <IonModal isOpen={showModal} cssClass='my-custom-class' backdropDismiss={false}>
            <p>Add Content from Local Storage</p>
            <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
        </IonModal>
    );
};

export default AddLocalModal;
