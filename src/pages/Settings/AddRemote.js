import React, {useContext, useEffect, useState} from 'react';
import {IonButton, IonCol, IonGrid, IonIcon, IonRow, IonSpinner, IonText} from '@ionic/react';
import onlineSources from '../../resources/sourceIndexes/online_sources';
import {download} from "ionicons/icons";
import Axios from 'axios';
import JSZip from 'jszip';
import PkContext from "../../contexts/PkContext";
import SettingsContext from "../../contexts/SettingsContext";
import "./SettingsTab.css";

const uuid = require('uuid');
const btoa = require('btoa');

export const AddRemote = ({toImport, setToImport, loadUuid, setLoadUuid, loadedDocSets}) => {
    const [toDownload, setToDownload] = useState([]);

    const pk = useContext(PkContext);
    const settings = useContext(SettingsContext);

    useEffect(() => {
        const doDownload = async () => {
            const downloadRecord = toDownload[0];
            const newToImport = [...toImport];
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
                    "url": `http://localhost:8099/${downloadRecord.source}`
                }
            )
                .then(
                    async response => {
                        const data = response.data;
                        if (['usfmZip', 'tsvZip'].includes(downloadRecord.format)) {
                            const zip = new JSZip();
                            await zip.loadAsync(data);
                            await Promise.all(Object.keys(zip.files).map(async fn => {
                                if (downloadRecord.bookCodes.filter(bc => fn.includes(bc)).length === 1) {
                                    const response = await zip.file(fn).async('string');
                                    newToImport.push({
                                        selectors: downloadRecord.selectors,
                                        contentType: downloadRecord.format === 'usfmZip' ? 'usfm' : 'tsv',
                                        content: response
                                    });
                                }
                            }));
                            setToImport(newToImport);
                            const newUuid = btoa(uuid.v4()).substring(0, 12);
                            setLoadUuid(newUuid);
                        } else {
                            console.log(`Unknown format ${downloadRecord.format}`);
                        }
                    });
            setToDownload(toDownload.slice(1));
        };
        if (toDownload.length > 0) {
            doDownload().then();
        }
    }, [toDownload]);

    const doDownload = os => {
        os.documents.forEach(doc => setToDownload([
            ...toDownload,
            {
                ...doc,
                selectors: os.selectors,
                source: `${os.sourcePrefix}${doc.source}`
            }
        ]));
    }
    const sourceEntries = [...onlineSources.entries()]
        .filter(([n, os]) => loadedDocSets.filter(lds => lds[0] === os.selectors.lang && lds[1] === os.selectors.abbr).length === 0);
    if (settings.enableNetworkAccess[0]) {
        return (
            <IonGrid class="storage_content">
                {
                    sourceEntries.length > 0 ?
                        sourceEntries.map(([n, os]) =>
                            <IonRow key={n}>
                                <IonCol size="2">{os.selectors.source}</IonCol>
                                <IonCol size="7">{os.description}</IonCol>
                                <IonCol
                                    size="2">{Array.from(new Set(os.documents.map(d => d.docTypes).reduce((a, b) => a.concat(b)))).join(', ')}</IonCol>
                                <IonCol size="1">
                                    {(toImport.length === 0 && toDownload.length === 0) &&
                                    <IonButton
                                        fill="clear"
                                        onClick={() => doDownload(os)}>
                                        <IonIcon icon={download}/>
                                    </IonButton>}
                                    {(toImport.length > 0 || toDownload.length > 0) && <IonSpinner name={"dots"}/>}
                                </IonCol>
                            </IonRow>
                        ) : <p className="no_content">
                            <IonText color="primary">No Content to Download</IonText>
                            {(toImport.length > 0 || toDownload.length > 0) && <IonSpinner name={"dots"}/>}
                        </p>
                }
            </IonGrid>
        );
    } else {
        return <IonGrid class="storage_content">
            <IonRow>
                <IonCol>
                    <p className="no_content">
                        <IonText color="danger">Network Access Disabled in App - Click Globe to Enable</IonText>
                    </p>
                </IonCol>
            </IonRow>
        </IonGrid>
    }
};

export default AddRemote;
