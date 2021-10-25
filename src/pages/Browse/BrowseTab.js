import React, {useContext, useEffect} from 'react';
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import {IonButtons, IonButton, IonIcon} from '@ionic/react';
import {book, cog, construct, create, print} from 'ionicons/icons';
import ExploreContainer from '../../components/ExploreContainer';
import './BrowseTab.css';
import PageToolBar from '../../components/PageToolBar';

import PkContext from '../../PkContext';

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
                <PageToolBar pageTitle="Browse"/>
            </IonHeader>
            <IonContent fullscreen>
                 <h1>{JSON.stringify(result)}</h1>
                <ExploreContainer name="Browse Content"/>
            </IonContent>
        </IonPage>
    );
};

export default BrowseTab;
