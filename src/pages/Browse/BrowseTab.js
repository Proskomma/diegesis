import React, {useContext, useEffect, useState} from 'react';
import {
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonRow,
    IonSelect,
    IonSelectOption,
    IonText
} from '@ionic/react';
import './BrowseTab.css';
import PageToolBar from '../../components/PageToolBar';

import PkContext from '../../contexts/PkContext';
import DocSetsContext from '../../contexts/DocSetsContext';


const BrowseTab = ({currentDocSet, setCurrentDocSet, currentBookCode, setCurrentBookCode}) => {
    const [sequenceText, setSequenceText] = useState([]);
    const pk = useContext(PkContext);
    const docSets = useContext(DocSetsContext);
    useEffect(() => {
        const doQuery = async () => {
            const res = await pk.gqlQuery(`{ docSet(id:"${currentDocSet}") { document(bookCode:"${currentBookCode}") { mainBlocksText } } }`);
            if (res.data.docSet.document) {
                setSequenceText(res.data.docSet.document.mainBlocksText);
            }
        };
        if (currentDocSet && currentBookCode) {
            doQuery();
        }
    }, [currentBookCode, currentDocSet, pk]);
    return (
        <IonPage>
            <IonHeader>
                <PageToolBar pageTitle="Browse"/>
                {
                    currentDocSet !== "" &&
                    <IonGrid>
                        <IonRow>
                             <IonCol size={6}>
                                <IonSelect
                                    value={currentDocSet}
                                    onIonChange={e => {
                                        setCurrentDocSet(e.detail.value);
                                        const docSet = docSets[e.detail.value];
                                        if (docSet) {
                                            const firstBookCode = Object.keys(docSet.documents)[0];
                                            setCurrentBookCode(currentBookCode in docSet.documents ? currentBookCode : firstBookCode);
                                        }
                                    }}>
                                    {
                                        [...Object.entries(docSets)]
                                            .map(dse =>
                                                <IonSelectOption key={dse[0]} value={dse[0]}>
                                                    {`${dse[0]}`}
                                                </IonSelectOption>
                                            )
                                    }
                                </IonSelect>
                            </IonCol>
                            <IonCol size={6}>
                                <IonSelect
                                    value={currentBookCode}
                                    onIonChange={e => setCurrentBookCode(e.detail.value)}>
                                    {
                                        [...Object.entries(docSets[currentDocSet].documents)]
                                            .map(de =>
                                                <IonSelectOption key={de[0]} value={de[0]}>
                                                    {`${de[0]}`}
                                                </IonSelectOption>
                                            )
                                    }
                                </IonSelect>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                }
            </IonHeader>
            <IonContent>
                {!currentDocSet &&
                <IonItem><IonText color="primary">No content - download some in settings</IonText></IonItem>}
                {currentDocSet &&
                <IonContent><IonList>{sequenceText.map(bt => <IonItem>{bt}</IonItem>)}</IonList></IonContent>}
            </IonContent>
        </IonPage>
    );
};

export default BrowseTab;
