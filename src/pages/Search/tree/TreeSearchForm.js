import React, {useEffect, useState} from 'react';
import {IonButton, IonCheckbox, IonCol, IonIcon, IonInput, IonRow} from '@ionic/react'
import {trash} from "ionicons/icons";

const TreeSearchForm = ({searchField, updateSearchField, removeSearchField, fieldN, nFields}) => {
    const TreeSearchField = ({fieldKey, fieldLabel, fieldWidth}) => {
        const cf = searchField.checkedFields;
        return <>
            <IonCol size={1}>
                <IonCheckbox
                    checked={cf.includes(fieldKey)}
                    onIonChange={
                        () => {
                            if (cf.includes(fieldKey)) {
                                updateSearchField(
                                    {
                                        ...searchField,
                                        checkedFields: cf.filter(f => f !== fieldKey)
                                    },
                                    fieldN
                                )
                            } else if (fieldKey === 'parsing') {
                                updateSearchField(
                                    {
                                        ...searchField,
                                        checkedFields: [...cf, fieldKey]
                                    },
                                    fieldN
                                )
                            } else {
                                updateSearchField(
                                    {
                                        ...searchField,
                                        checkedFields: [...cf.filter(f => !['text', 'lemma', 'gloss', 'strong'].includes(f)), fieldKey]
                                    },
                                    fieldN
                                )
                            }
                        }
                    }
                />
            </IonCol>
            <IonCol size={fieldWidth || 2}>
                <IonInput
                    placeholder={fieldLabel}
                    value={searchField[fieldKey]}
                    disabled={!cf.includes(fieldKey)}
                    onIonChange={
                        e => {
                            const newOb = {...searchField};
                            newOb[fieldKey] = e.detail.value;
                            updateSearchField(newOb, fieldN);
                        }
                    }
                    debounce={1000}
                />
            </IonCol>
        </>
    }
    return <>
            <IonRow>
                <TreeSearchField fieldKey="text" fieldLabel="Word"/>
                <TreeSearchField fieldKey="lemma" fieldLabel="Lemma"/>
                <TreeSearchField fieldKey="gloss" fieldLabel="Gloss"/>
                <TreeSearchField fieldKey="strong" fieldLabel="Strongs"/>
            </IonRow>
            <IonRow>
                <TreeSearchField fieldKey="parsing"  fieldLabel="Parsing" fieldWidth={10}/>
                <IonCol size={1}>
                    <IonButton
                        color="secondary"
                        fill="clear"
                        onClick={
                            () => {
                                removeSearchField(fieldN);
                            }
                        }
                    >
                        <IonIcon icon={trash}/>
                    </IonButton>
                </IonCol>
            </IonRow>
        </>
}

export default TreeSearchForm;
