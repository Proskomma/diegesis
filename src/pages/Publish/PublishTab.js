import React, {useContext, useEffect} from 'react';
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import ExploreContainer from '../../components/ExploreContainer';
import './PublishTab.css';

import PkContext from '../../contexts/PkContext';
import PageToolBar from "../../components/PageToolBar";

const PublishTab = () => {
    const pk = useContext(PkContext);
    const [result, setResult] = React.useState({});
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
                <PageToolBar pageTitle="Publish"/>
            </IonHeader>
            <IonContent fullscreen>
                <h1>{JSON.stringify(result)}</h1>
                <ExploreContainer name="Publish Content"/>
            </IonContent>
        </IonPage>
    );
};

export default PublishTab;
