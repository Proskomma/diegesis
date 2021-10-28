import React, {useContext, useEffect, useState} from 'react';
import {IonButton, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonPage, IonRow, IonTitle} from '@ionic/react';
import onlineSources from '../../resources/sourceIndexes/online_sources';
import {trash} from "ionicons/icons";
import PkContext from "../../PkContext";

export const RemoveLocal = (props) => {

    const pk = useContext(PkContext);

    return (
                <IonGrid style={{border: "2px solid black"}}>
                     {
                        [...onlineSources.entries()]
                            .filter(([n, os]) => props.loadedDocSets.filter(lds => lds[0] === os.selectors.lang && lds[1] === os.selectors.abbr).length === 1)
                            .map(([n, os]) =>
                            <IonRow key={n}>
                                <IonCol size="8">{os.description}</IonCol>
                                <IonCol size="3">{os.selectors.source}</IonCol>
                                <IonCol size="1">
                                    <IonButton fill="clear">
                                        <IonIcon icon={trash}/>
                                    </IonButton>
                                </IonCol>
                            </IonRow>)
                    }
                </IonGrid>
    );
};

export default RemoveLocal;
