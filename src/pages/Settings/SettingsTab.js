import React, {useContext, useEffect} from 'react';
import {IonButton, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonLabel, IonPage, IonRow} from '@ionic/react';
import './SettingsTab.css';
import StorageSettings from './StorageSettings';
import AppearanceSettings from './AppearanceSettings';

import PageToolBar from "../../components/PageToolBar";
import {albums, brush} from "ionicons/icons";

const SettingsTab = ({
                         loadUuid,
                         setLoadUuid,
                         toImport,
                         setToImport,
                         currentDocSet,
                         setCurrentDocSet,
                         currentBookCode,
                         setCurrentBookCode,
                         updateMutationId
                     }) => {
    const [selectedSection, setSelectedSection] = React.useState('storage');
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
                                strong={selectedSection === 'storage'}
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
                            {
                                selectedSection === 'storage' &&
                                <StorageSettings
                                    loadUuid={loadUuid}
                                    setLoadUuid={setLoadUuid}
                                    toImport={toImport}
                                    setToImport={setToImport}
                                    currentDocSet={currentDocSet}
                                    setCurrentDocSet={setCurrentDocSet}
                                    currentBookCode={currentBookCode}
                                    setCurrentBookCode={setCurrentBookCode}
                                    updateMutationId={updateMutationId}
                                />
                            }
                            {
                                selectedSection === 'appearance' &&
                                <AppearanceSettings/>
                            }
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default SettingsTab;
