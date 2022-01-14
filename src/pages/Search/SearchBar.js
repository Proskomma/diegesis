import {IonButton, IonCol, IonIcon, IonInput, IonRow} from "@ionic/react";
import {options, search, trash} from "ionicons/icons";
import React from "react";

const SearchBar = ({
    searchString,
    setSearchString,
    showOptions,
    setShowOptions,
    resetSearch
                   }) => <IonRow>
    <IonCol size={1}>
        <IonButton
            color="secondary"
            fill="clear"
            onClick={() => setShowOptions(!showOptions)}
        >
            <IonIcon float-right icon={options}/>
        </IonButton>
    </IonCol>
    <IonCol size={9}>
        <IonInput
            value={searchString}
            placeholder="Search Items"
            onKeyPress={e => e.key === 'Enter' && resetSearch()}
            onIonChange={e => setSearchString(e.detail.value)}
        />
    </IonCol>
    <IonCol size={1}>
        <IonButton
            color="primary"
            fill="clear"
            onClick={
                () => {
                    resetSearch();
                }
            }
        >
            <IonIcon float-right icon={search}/>
        </IonButton>
    </IonCol>
    <IonCol size={1}>
        <IonButton
            className="ion-float-end"
            color="secondary"
            fill="clear"
            onClick={() => setSearchString('')}
        >
            <IonIcon float-right icon={trash}/>
        </IonButton>
    </IonCol>
</IonRow>

export default SearchBar;
