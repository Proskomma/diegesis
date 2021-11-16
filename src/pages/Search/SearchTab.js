import React, {useContext, useEffect} from 'react';
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import ExploreContainer from '../../components/ExploreContainer';
import './SearchTab.css';

import PkContext from '../../contexts/PkContext';
import PageToolBar from "../../components/PageToolBar";

const SearchTab = () => {
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
                <PageToolBar pageTitle="Search"/>
            </IonHeader>
            <IonContent fullscreen>
                <h1>{JSON.stringify(result)}</h1>
                <ExploreContainer name="Search"/>
            </IonContent>
        </IonPage>
    );
};

export default SearchTab;
