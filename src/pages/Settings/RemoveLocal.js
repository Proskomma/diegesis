import React, {useContext, useState} from 'react';
import {IonButton, IonCol, IonGrid, IonIcon, IonRow, IonText} from '@ionic/react';
import {trash} from "ionicons/icons";
import PkContext from "../../contexts/PkContext";
import "./SettingsTab.css";
import btoa from "btoa";
const uuid = require("uuid");

export const RemoveLocal = ({setLoadUuid, loadedDocSets, currentDocSet, setCurrentDocSet, setCurrentBookCode, onlineCatalog}) => {

    const pk = useContext(PkContext);

    const removeDocSet = async selectors => {
        const docSetId = `${selectors.lang}_${selectors.abbr}`;
        const query = `mutation { deleteDocSet(docSetId: "${docSetId}") }`;
        const result = await pk.gqlQuery(query);
        if (currentDocSet === docSetId) {
            setCurrentDocSet("");
            setCurrentBookCode("");
        }
        setLoadUuid(btoa(uuid.v4()).substring(0, 12));
    }

    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const sourceEntries = [...onlineCatalog.entries()]
        .filter(([n, os]) => loadedDocSets.filter(lds => lds[0] === os.selectors.lang && lds[1] === os.selectors.abbr).length === 1);
    return (
        <IonGrid class="storage_content">
            {
                sourceEntries.length > 0 ?
                sourceEntries.map(([n, os]) => {
                        return <IonRow key={n}>
                            <IonCol size="8">{os.description}</IonCol>
                            <IonCol size="3">{os.selectors.source}</IonCol>
                            <IonCol size="1">
                                <IonButton
                                    fill="clear"
                                    disabled={buttonsDisabled}
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
                    }
                ) : <p className="no_content"><IonText color="primary">No Content Stored Locally</IonText></p>
            }
        </IonGrid>
    );
};

export default RemoveLocal;
