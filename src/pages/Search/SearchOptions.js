import {IonCol, IonGrid, IonInput, IonRow, IonText, IonTitle} from "@ionic/react";
import React from "react";

const SearchOptions = (
    {
        nResultsPerPage,
        setNResultsPerPage,
        searchTarget,
        setSearchTarget,
        searchResultUnit,
        setSearchResultUnit,
        resetSearch,
    }) =>
    <IonGrid style={{backgroundColor: "#EEF"}}>
        <IonRow>
            <IonCol>
                <IonTitle>Search Options</IonTitle>
            </IonCol>
        </IonRow>
        <IonRow>
            <IonCol size={2}>
                Results per page
            </IonCol>
            <IonCol size={10}>
                <IonInput
                    value={nResultsPerPage}
                    onIonChange={e => parseInt(e.detail.value) > 4 && setNResultsPerPage(parseInt(e.detail.value))}
                />
            </IonCol>
        </IonRow>
        <IonRow>
            <IonCol size={2}>
                Search target
            </IonCol>
            <IonCol size={5}>
                <span
                    onClick={() => {
                        setSearchTarget('docSet');
                        resetSearch();
                    }
                    }
                >
                    <IonText
                        color={searchTarget === 'docSet' ? 'primary' : 'secondary'}>
                        Current DocSet
                    </IonText>
                </span>
            </IonCol>
            <IonCol size={5}>
                <span
                    onClick={() => {
                        setSearchTarget('document');
                        resetSearch();
                    }
                    }
                >
                    <IonText
                        color={searchTarget === 'document' ? 'primary' : 'secondary'}>
                        Current Book
                    </IonText>
                </span>
            </IonCol>
        </IonRow>
        <IonRow>
            <IonCol size={2}>
                Results by
            </IonCol>
            <IonCol size={5}>
                <span
                    onClick={() => {
                        setSearchResultUnit('block');
                        resetSearch();
                    }
                    }
                >
                    <IonText
                        color={searchResultUnit === 'block' ? 'primary' : 'secondary'}>
                        Paragraph
                    </IonText>
                </span>
            </IonCol>
            <IonCol size={5}>
                <span
                    onClick={() => {
                        setSearchResultUnit('verse');
                        resetSearch();
                    }
                    }
                >
                    <IonText
                        color={searchResultUnit === 'verse' ? 'primary' : 'secondary'}>
                        Verse
                    </IonText>
                </span>
            </IonCol>
        </IonRow>
    </IonGrid>;

export default SearchOptions;
