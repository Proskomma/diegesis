import React, {useContext, useState} from 'react';
import {Redirect, Route} from 'react-router-dom';
import {IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs,} from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';
import {book, create, print} from 'ionicons/icons';
import BrowseTab from './pages/Browse/BrowseTab';
import EditTab from './pages/Edit/EditTab';
import PublishTab from './pages/Publish/PublishTab';
import SettingsTab from './pages/Settings/SettingsTab';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

/* Non-ionic imports */
import PkContext, {PkProvider} from './PkContext'
import {SettingsProvider} from './SettingsContext'

const App = () => {
    const pk = useContext(PkContext);
    const settings = {
        enableNetworkAccess: useState(false)
    };
    return <IonApp>
        <PkProvider value={pk}>
            <SettingsProvider value={settings}>
                <IonReactRouter>
                    <IonTabs>
                        <IonRouterOutlet>
                            <Route exact path="/browse">
                                <BrowseTab/>
                            </Route>
                            <Route exact path="/edit">
                                <EditTab/>
                            </Route>
                            <Route exact path="/publish">
                                <PublishTab/>
                            </Route>
                            <Route exact path="/settings">
                                <SettingsTab/>
                            </Route>
                            <Route render={() => <Redirect to="/browse"/>}/>
                        </IonRouterOutlet>
                        <IonTabBar slot="bottom">
                            <IonTabButton tab="browse" href="/browse">
                                <IonIcon icon={book}/>
                                <IonLabel>Browse</IonLabel>
                            </IonTabButton>
                            <IonTabButton tab="edit" href="/edit">
                                <IonIcon icon={create}/>
                                <IonLabel>Edit</IonLabel>
                            </IonTabButton>
                            <IonTabButton tab="publish" href="/publish">
                                <IonIcon icon={print}/>
                                <IonLabel>Publish</IonLabel>
                            </IonTabButton>
                        </IonTabBar>
                    </IonTabs>
                </IonReactRouter>
            </SettingsProvider>
        </PkProvider>
    </IonApp>
};

export default App;
