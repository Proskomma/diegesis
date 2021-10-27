import React, {useContext, useEffect, useState} from 'react';
import {IonButton, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonModal, IonRow, IonTitle} from '@ionic/react';
import onlineSources from '../../resources/sourceIndexes/online_sources';
import {download} from "ionicons/icons";
import Axios from 'axios';
import JSZip from 'jszip';
import PkContext from "../../PkContext";

export const AddRemoteModal = ({showModal, setShowModal}) => {

    const pk = useContext(PkContext);
    const [toDownload, setToDownload] = useState([]);
    const [toImport, setToImport] = useState([]);

    useEffect(() => {
        const doDownload = async () => {
            const downloadRecord = toDownload[0];
            setToDownload(toDownload.slice(1));
            const newToImport = [...toImport];
            await Axios.request(
                {
                    method: "get",
                    responseType: 'arraybuffer',
                    "url": `http://localhost:8099/${downloadRecord.source}`
                }
            )
                .then(
                    async response => {
                        const data = response.data;
                        if (downloadRecord.format === 'usfmZip') {
                            const zip = new JSZip();
                            await zip.loadAsync(data);
                            await Promise.all(Object.keys(zip.files).map(async fn => {
                                if (downloadRecord.bookCodes.filter(bc => fn.includes(bc)).length === 1) {
                                    const response = await zip.file(fn).async('string');
                                    newToImport.push({
                                        selectors: downloadRecord.selectors,
                                        contentType: "usfm",
                                        content: response
                                    });
                                }
                            }));
                            setToImport(newToImport);
                        } else {
                            console.log(`Unknown format ${downloadRecord.format}`);
                        }
                    });
        };
        if (toDownload.length > 0) {
            doDownload().then();
        }
    }, [toDownload]);

    useEffect(() => {
        if (toImport.length > 0) {
            const importRecord = toImport[0];
            console.log(importRecord)
            setToImport(toImport.slice(1));
            pk.importDocument(
                {
                    lang: importRecord.selectors.lang,
                    abbr: importRecord.selectors.abbr
                },
                importRecord.contentType,
                importRecord.content
            );
        }
    }, [toImport]);

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

    return (
        <IonModal isOpen={showModal} cssClass='my-custom-class' backdropDismiss={false}>
            <IonHeader>
                <IonTitle>Add Content from a Server</IonTitle>
            </IonHeader>
            <IonContent>
                <IonGrid>
                    {(toDownload.length > 0 || toImport.length > 0) &&
                    <IonRow>
                        <IonCol size="6">
                            downloading {toDownload.length}
                        </IonCol>
                        <IonCol size="6">
                            importing {toImport.length}
                        </IonCol>
                    </IonRow>
                    }
                    {
                        [...onlineSources.entries()].map(([n, os]) =>
                            <IonRow key={n}>
                                <IonCol size="8">{os.description}</IonCol>
                                <IonCol size="3">{os.selectors.source}</IonCol>
                                <IonCol size="1">
                                    <IonButton
                                        fill="clear"
                                        onClick={() => doDownload(os)}>
                                        <IonIcon icon={download}/>
                                    </IonButton>
                                </IonCol>
                            </IonRow>)
                    }
                </IonGrid>
            </IonContent>
            <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
        </IonModal>
    );
};

export default AddRemoteModal;
