import {IonButton, IonButtons, IonIcon, IonTitle, IonToolbar} from "@ionic/react";
import {cog, construct} from "ionicons/icons";
import React from "react";

const PageToolBar = ({pageTitle}) => <IonToolbar>
    <IonButtons slot="end">
        <IonButton routerLink="/contribute">
            <IonIcon slot="icon-only" icon={construct}/>
        </IonButton>
        <IonButton routerLink="/settings">
            <IonIcon slot="icon-only" icon={cog}/>
        </IonButton>
    </IonButtons>
    <IonTitle>{pageTitle} - Diegesis</IonTitle>
</IonToolbar>

export default PageToolBar;
