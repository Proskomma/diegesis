import React, {useContext, useRef, useEffect, useState} from 'react';
import {IonButton, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonPage, IonRow, IonTitle} from '@ionic/react';
import onlineSources from '../../resources/sourceIndexes/online_sources';
import {trash} from "ionicons/icons";
import PkContext from "../../PkContext";

export const RemoveLocal = (props) => {

    const pk = useContext(PkContext);

    const removeDocSet = async selectors => {
        const docSetId = `${selectors.lang}_${selectors.abbr}`;
        const query = `mutation { deleteDocSet(docSetId: "${docSetId}") }`;
        const result = await pk.gqlQuery(query);
        props.setLoadCount(props.loadCount + 1);
    }

    const buttonRef = useRef(null);
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    return (
        <IonGrid style={{border: "2px solid black"}}>
            {
                [...onlineSources.entries()]
                    .filter(([n, os]) => props.loadedDocSets.filter(lds => lds[0] === os.selectors.lang && lds[1] === os.selectors.abbr).length === 1)
                    .map(([n, os]) => {
                        return <IonRow key={n}>
                            <IonCol size="8">{os.description}</IonCol>
                            <IonCol size="3">{os.selectors.source}</IonCol>
                            <IonCol size="1">
                                <IonButton
                                    fill="clear"
                                    disabled={buttonsDisabled}
                                    ref={buttonRef}
                                    onClick={() => {
                                        setButtonsDisabled(true);
                                        removeDocSet(os.selectors);
                                        setButtonsDisabled(false);
                                    }}
                                >
                                    <IonIcon icon={trash}/>
                                </IonButton>
                            </IonCol>
                        </IonRow>
                    })
            }
        </IonGrid>
    );
};

export default RemoveLocal;
