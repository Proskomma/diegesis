import React, {useContext, useEffect} from "react";
import {IonButton, IonCol, IonGrid, IonIcon, IonLabel, IonRow} from '@ionic/react';
import {download, trash} from "ionicons/icons";

import AddRemote from "./AddRemote";
import RemoveLocal from "./RemoveLocal";
import PkContext from "../../contexts/PkContext";

const StorageSettings = ({loadUuid, setLoadUuid, toImport, setToImport, currentDocSet, setCurrentDocSet, currentBookCode, setCurrentBookCode}) => {
    const [selectedSection, setSelectedSection] = React.useState('remote');
    const [loadedDocSets, setLoadedDocSets] = React.useState([]);

    const pk = useContext(PkContext);

    useEffect(() => {
        const doQuery = async () => {
            const res = await pk.gqlQuery('{ docSets { selectors { key value } } }');
            const selectors = res.data.docSets.map(ds => ds.selectors.map(s => s.value));
            setLoadedDocSets(selectors);
        };
        doQuery();
    }, [loadUuid, toImport, loadUuid]);

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
                    {
                        selectedSection === 'remote' &&
                        <AddRemote
                            loadUuid={loadUuid}
                            setLoadUuid={setLoadUuid}
                            toImport={toImport}
                            setToImport={setToImport}
                            loadedDocSets={loadedDocSets}
                        />
                    }
                    {
                        selectedSection === 'local' &&
                        <RemoveLocal
                            loadUuid={loadUuid}
                            setLoadUuid={setLoadUuid}
                            toImport={toImport}
                            setToImport={setToImport}
                            loadedDocSets={loadedDocSets}
                            currentDocSet={currentDocSet}
                            setCurrentDocSet={setCurrentDocSet}
                            currentBookCode={currentBookCode}
                            setCurrentBookCode={setCurrentBookCode}
                        />
                    }
                </IonCol>
            </IonRow>
        </IonGrid>
    </>
}

export default StorageSettings;
