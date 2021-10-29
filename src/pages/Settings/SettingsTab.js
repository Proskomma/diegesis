import React, {useContext, useEffect} from 'react';
import {IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar, IonLabel} from '@ionic/react';
import { IonGrid, IonRow, IonCol } from '@ionic/react';
import './SettingsTab.css';
import StorageSettings from './StorageSettings';
import AppearanceSettings from './AppearanceSettings';

import PkContext from '../../PkContext';
import PageToolBar from "../../components/PageToolBar";
import {albums, brush} from "ionicons/icons";

const SettingsTab = () => {
    const pk = useContext(PkContext);
    const [result, setResult] = React.useState({});
    const [selectedSection, setSelectedSection] = React.useState('storage');
    useEffect(() => {
        const doQuery = async () => {
            const res = await pk.gqlQuery('{ nDocSets nDocuments }');
            setResult(res);
        };
        doQuery();
    }, [selectedSection]);

    return (
        <IonPage>
            <IonHeader>
                <PageToolBar pageTitle="Settings"/>
            </IonHeader>
            <IonContent fullscreen>
                <IonGrid>
                    <IonRow>
                        <IonCol className="ion-text-center">
                            <IonButton
                                fill="clear"
                                strong = {selectedSection === 'storage'}
                                onClick={() => setSelectedSection('storage')}
                            >
                                <IonIcon icon={albums}/>&nbsp;
                                <IonLabel>Storage</IonLabel>
                            </IonButton>
                        </IonCol>
                        <IonCol className="ion-text-center">
                            <IonButton
                                fill="clear"
                                strong={selectedSection === 'appearance'}
                                onClick={() => setSelectedSection('appearance')}
                            >
                                <IonIcon icon={brush}/>&nbsp;
                                <IonLabel>Appearance</IonLabel>
                            </IonButton>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol>
                            {selectedSection === 'storage' && <StorageSettings/>}
                            {selectedSection === 'appearance' && <AppearanceSettings/>}
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default SettingsTab;
