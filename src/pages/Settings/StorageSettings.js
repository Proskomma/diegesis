import React, {useContext, useEffect, useState} from "react";
import {IonButton, IonCol, IonGrid, IonIcon, IonLabel, IonRow} from '@ionic/react';
import {download, trash} from "ionicons/icons";

import AddRemote from "./AddRemote";
import RemoveLocal from "./RemoveLocal";
import PkContext from "../../contexts/PkContext";
import Axios from "axios";

const StorageSettings = ({
                             loadUuid,
                             setLoadUuid,
                             toImport,
                             setToImport,
                             currentDocSet,
                             setCurrentDocSet,
                             currentBookCode,
                             setCurrentBookCode
                         }) => {
    const [selectedSection, setSelectedSection] = React.useState('remote');
    const [loadedDocSets, setLoadedDocSets] = React.useState([]);
    const [onlineCatalog, setOnlineCatalog] = useState([]);

    const pk = useContext(PkContext);

    useEffect(() => {
        const doDownload = async () => {
            const axiosInstance = Axios.create({});
            axiosInstance.defaults.headers = {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0',
            };
            await axiosInstance.request(
                {
                    method: "get",
                    responseType: 'arraybuffer',
                    "url": `http://localhost:8099/https://diegesis/online_sources.json`,
                    "validateStatus": false,
                }
            )
                .then(
                    async response => {
                        const data = response.data;
                        if (response.status !== 200) {
                            console.log(`Request for online sources returned status code ${response.status}`);
                            console.log(String.fromCharCode.apply(null, new Uint8Array(data)));
                            return;
                        }
                        setOnlineCatalog(JSON.parse(String.fromCharCode.apply(null, new Uint8Array(data))));
                    }
                );
        };
        doDownload().then();
    }, []);

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
                            onlineCatalog={onlineCatalog}
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
                            onlineCatalog={onlineCatalog}
                        />
                    }
                </IonCol>
            </IonRow>
        </IonGrid>
    </>
}

export default StorageSettings;
