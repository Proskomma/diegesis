import React, {useContext, useState, useEffect} from 'react';
import {IonButton, IonCol, IonGrid, IonIcon, IonRow} from '@ionic/react';
import {cloudDownload, cloudUpload} from "ionicons/icons";
import {freeze, thaw} from "proskomma-freeze";
import PkContext from "../../contexts/PkContext";
import DocSetsContext from "../../contexts/DocSetsContext";
import SettingsContext from "../../contexts/SettingsContext";
import "./SettingsTab.css";
import Axios from "axios";

export const ArchiveRestore = ({updateMutationId}) => {

    const pk = useContext(PkContext);
    const docSets = useContext(DocSetsContext);
    const settings = useContext(SettingsContext);

    const [frozen, setFrozen] = useState(null);
    const [working, setWorking] = useState(false);

    useEffect(
        () => {
            if (frozen) {
                console.log("POST frozen");
                const doPost = async () => {
                    const axiosInstance = Axios.create({});
                    axiosInstance.defaults.headers = {
                        'Content-Type': 'multipart/form-data',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                    };
                    const formData = new FormData();
                    const buf = Buffer.from(frozen);
                    formData.append('frozen', buf)
                    await axiosInstance.post(
                        `http://localhost:8088/freeze`,
                        formData,
                        {
                            responseType: 'arraybuffer',
                            "validateStatus": false,
                        }
                    ).then(res => {
                        console.log(String.fromCharCode.apply(null, new Uint8Array(res.data)));
                        setFrozen(null);
                })
                }
                doPost().then();
            }
        },
        [frozen]
    )

    return (
        <IonGrid class="storage_content">
            <IonRow>
                <IonCol>
                    <IonButton
                        disabled={working || !settings.enableNetworkAccess[0] || Object.keys(docSets).length === 0}
                        onClick={
                            async () => {
                                setWorking(true);
                                setFrozen(await freeze(pk));
                                setWorking(false);
                            }
                        }
                    >
                        <IonIcon icon={cloudUpload}/>&nbsp;Archive
                    </IonButton>
                </IonCol>
            </IonRow>
            <IonRow>
                <IonCol>
                    <IonButton
                        disabled={working || !settings.enableNetworkAccess[0] || Object.keys(docSets).length > 0}
                        onClick={
                            () => {
                                const axiosInstance = Axios.create({});
                                const t = Date.now()
                                axiosInstance.get('http://localhost:8088/archives/archive.pkzip')
                                    .then(
                                        res => {
                                            thaw(pk, res.data).then(
                                                r => {
                                                    updateMutationId();
                                                    console.log(`Restore in ${Date.now() - t} msec`);
                                                }
                                                )
                                        }
                                    )
                            }
                        }
                    >
                        <IonIcon icon={cloudDownload}/>&nbsp;Restore
                    </IonButton>
                </IonCol>
            </IonRow>

        </IonGrid>
    );
};

export default ArchiveRestore;
