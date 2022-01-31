import React, {useState} from 'react';

import {IonCol, IonIcon, IonRow, IonTitle} from '@ionic/react';
import {contract, expand} from "ionicons/icons";

const CollapsingRows = ({heading, hasData, children, isOpen, setIsOpen}) => {
    if (!hasData) {
        return '';
    } else if (!isOpen) {
        return <IonRow>
            <IonCol size={10}>
                <IonTitle onClick={() => setIsOpen(true)}>{heading}</IonTitle>
            </IonCol>
            <IonCol size={2} className="ion-text-end"
            >
                <IonIcon
                    onClick={() => setIsOpen(true)}
                    icon={expand}/>
            </IonCol>
        </IonRow>
    } else {
        return <>
            {
                heading &&
                <IonRow>
                    <IonCol size={10}>
                        <IonTitle onClick={() => setIsOpen(false)}>{heading}</IonTitle>
                    </IonCol>
                    <IonCol size={2} className="ion-text-end">
                        <IonIcon
                            icon={contract}
                            onClick={() => setIsOpen(false)}/>
                    </IonCol>
                </IonRow>
            }
            {isOpen && children}
        </>;
    }
}

export default CollapsingRows;
