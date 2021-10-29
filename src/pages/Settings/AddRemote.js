import React, {useContext, useEffect, useState} from 'react';
import {IonButton, IonCol, IonGrid, IonIcon, IonRow, IonSpinner} from '@ionic/react';
import onlineSources from '../../resources/sourceIndexes/online_sources';
import {download} from "ionicons/icons";
import Axios from 'axios';
import JSZip from 'jszip';
import PkContext from "../../PkContext";

export const AddRemote = (props) => {
    const [toDownload, setToDownload] = useState([]);
    const [toImport, setToImport] = useState([]);
    const [showAdds, setShowAdds] = useState(false);

    const pk = useContext(PkContext);

    useEffect(() => {
        const doDownload = async () => {
            const downloadRecord = toDownload[0];
            setToDownload(toDownload.slice(1));
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
                            props.setLoadCount(props.loadCount + 1);
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

    useEffect(() => {
        const newValue = toImport.length > 0 || toDownload.length > 0;
        console.log(newValue);
        setShowAdds(newValue);
    }, [toImport, toDownload]);

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
                <IonGrid style={{border: "2px solid black"}}>
                    {
                        [...onlineSources.entries()]
                            .filter(([n, os]) => props.loadedDocSets.filter(lds => lds[0] === os.selectors.lang && lds[1] === os.selectors.abbr).length === 0)
                            .map(([n, os]) =>
                            <IonRow key={n}>
                                <IonCol size="8">{os.description}</IonCol>
                                <IonCol size="3">{os.selectors.source}</IonCol>
                                <IonCol size="1">
                                    {!showAdds &&
                                    <IonButton
                                        fill="clear"
                                        onClick={() => doDownload(os)}>
                                        <IonIcon icon={download}/>
                                    </IonButton>}
                                    {showAdds && <IonSpinner name={"dots"}/>}
                                </IonCol>
                            </IonRow>)
                    }
                </IonGrid>
    );
};

export default AddRemote;
