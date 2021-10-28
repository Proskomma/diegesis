import React, {useContext, useEffect, useState} from "react";
import {IonButton, IonCol, IonGrid, IonIcon, IonLabel, IonRow} from '@ionic/react';
import {download, folder, trash} from "ionicons/icons";

import AddRemote from "./AddRemote";
import RemoveLocal from "./RemoveLocal";
import PkContext from "../../PkContext";

const StorageSettings = () => {
    const [selectedSection, setSelectedSection] = React.useState('remote');
    const [loadCount, setLoadCount] = React.useState(0);
    const [loadedDocSets, setLoadedDocSets] = React.useState([]);

    const pk = useContext(PkContext);

    useEffect(() => {
        const doQuery = async () => {
            const res = await pk.gqlQuery('{ docSets { selectors { key value } } }');
            const selectors = res.data.docSets.map(ds => ds.selectors.map(s => s.value));
            setLoadedDocSets(selectors);
        };
        doQuery();
    }, [loadCount]);

    return <>
        <IonGrid>
            <IonRow>
                <IonCol className="ion-text-center">
                    <IonButton
                        fill={selectedSection === 'remote' ? "solid" : "clear"}
                        expand="full"
                        onClick={() => setSelectedSection('remote')}
                    >
                        <IonIcon icon={download}/>&nbsp;
                        <IonLabel>Add from Server</IonLabel>
                    </IonButton>
                </IonCol>
                 <IonCol className="ion-text-center">
                    <IonButton
                        fill={selectedSection === 'local' ? "solid" : "clear"}
                        expand="full"
                        onClick={() => setSelectedSection('local')}
                        >
                        <IonIcon icon={trash}/>&nbsp;
                        <IonLabel>Remove from Local</IonLabel>
                    </IonButton>
                </IonCol>
            </IonRow>
            <IonRow>
                <IonCol>
                    {selectedSection === 'remote' &&
                    <AddRemote
                        loadCount={loadCount}
                        setLoadCount={setLoadCount}
                        loadedDocSets={loadedDocSets}
                    />}
                    {selectedSection === 'local' &&
                    <RemoveLocal loadedDocSets={loadedDocSets}/>}
                </IonCol>
            </IonRow>
        </IonGrid>
    </>
}

export default StorageSettings;
