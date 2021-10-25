import React, {useContext, useEffect} from 'react';
import {IonContent, IonHeader, IonPage} from '@ionic/react';
import ExploreContainer from '../../components/ExploreContainer';
import './ContributeTab.css';

import PkContext from '../../PkContext';
import PageToolBar from "../../components/PageToolBar";

const BrowseTab = () => {
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
                <PageToolBar pageTitle="Contribute"/>
            </IonHeader>
            <IonContent fullscreen>
                <h1>{JSON.stringify(result)}</h1>
                <ExploreContainer name="Contribute to the Project"/>
            </IonContent>
        </IonPage>
    );
};

export default BrowseTab;
