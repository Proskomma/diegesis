import React, {useContext, useEffect} from 'react';
import {IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar, IonLabel} from '@ionic/react';
import { IonGrid, IonRow, IonCol } from '@ionic/react';
import './SettingsTab.css';
import NetworkSettings from './NetworkSettings';
import StorageSettings from './StorageSettings';
import AppearanceSettings from './AppearanceSettings';

import PkContext from '../../PkContext';
import PageToolBar from "../../components/PageToolBar";
import {globe, albums, brush} from "ionicons/icons";

const SettingsTab = () => {
    const pk = useContext(PkContext);
    const [result, setResult] = React.useState({});
    const [selectedSection, setSelectedSection] = React.useState('network');
    useEffect(() => {
        const doQuery = async () => {
            const res = await pk.gqlQuery('{ id packageVersion processor }');
            setResult(res);
        };
        doQuery();
    }, []);

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
                                fill={selectedSection === 'network' ? "solid" : "outline"}
                                onClick={() => setSelectedSection('network')}
                            >
                                <IonIcon icon={globe}/>&nbsp;
                                <IonLabel>Network</IonLabel>
                            </IonButton>
                        </IonCol>
                        <IonCol className="ion-text-center">
                            <IonButton
                                fill={selectedSection === 'storage' ? "solid" : "outline"}
                                onClick={() => setSelectedSection('storage')}
                            >
                                <IonIcon icon={albums}/>&nbsp;
                                <IonLabel>Storage</IonLabel>
                            </IonButton>
                        </IonCol>
                        <IonCol className="ion-text-center">
                            <IonButton
                                fill={selectedSection === 'appearance' ? "solid" : "outline"}
                                onClick={() => setSelectedSection('appearance')}
                            >
                                <IonIcon icon={brush}/>&nbsp;
                                <IonLabel>Appearance</IonLabel>
                            </IonButton>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol>
                            {selectedSection === 'network' && <NetworkSettings/>}
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
