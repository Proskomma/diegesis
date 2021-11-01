import {IonButton, IonButtons, IonIcon, IonTitle, IonToolbar} from "@ionic/react";
import {cog, globe} from "ionicons/icons";
import React, {useContext} from "react";
import SettingsContext from "../contexts/SettingsContext";

const PageToolBar = ({pageTitle}) => {
    const settings = useContext(SettingsContext);
    return <IonToolbar>
        <IonButtons slot="end">
            <IonButton
                onClick={() => settings.enableNetworkAccess[1](!settings.enableNetworkAccess[0])}
            >
                <IonIcon
                    color={settings.enableNetworkAccess[0] ? "dark" : "medium"}
                    slot="icon-only"
                    icon={globe}/>
            </IonButton>
            <IonButton routerLink="/settings">
                <IonIcon slot="icon-only" icon={cog}/>
            </IonButton>
        </IonButtons>
        <IonTitle>{pageTitle} - Diegesis</IonTitle>
    </IonToolbar>;
}

export default PageToolBar;
