import React, { useState } from 'react';
import {IonGrid, IonRow, IonCol, IonInput, IonCheckbox, IonButton, IonIcon} from '@ionic/react'
import {search, refresh} from "ionicons/icons";

const TreeSearchForm = () => {
    const [checkedFields, setCheckedFields] = useState([]);
    const [word, setWord] = useState('');
    const [lemma, setLemma] = useState('');
    const [gloss, setGloss] = useState('');
    const [type, setType] = useState('');
    const [strongs, setStrongs] = useState('');
    const [parsing, setParsing] = useState('');
    const TreeSearchField = ({fieldString, fieldAccessor, fieldModifier}) => {
        return <>
                <IonCol size={1}>
                    <IonCheckbox
                        checked={checkedFields.includes(fieldString)}
                        onIonChange={
                            () =>
                                checkedFields.includes(fieldString) ?
                                    setCheckedFields(checkedFields.filter(f => f !== fieldString)) :
                                    setCheckedFields([...checkedFields, fieldString])
                        }
                    />
                </IonCol>
                <IonCol size={3}>
                    <IonInput
                        placeholder={fieldString[0].toUpperCase() + fieldString.substring(1)}
                        value={fieldAccessor}
                        disabled={!checkedFields.includes(fieldString)}
                        onIonChange={e => fieldModifier(e.detail.value)}
                        debounce={1000}
                    />
                </IonCol>
            </>
    }
    return <IonGrid>
        <IonRow>
            <TreeSearchField fieldString="word" fieldAccessor={word} fieldModifier={setWord}/>
            <TreeSearchField fieldString="lemma" fieldAccessor={lemma} fieldModifier={setLemma}/>
            <TreeSearchField fieldString="gloss" fieldAccessor={gloss} fieldModifier={setGloss}/>
        </IonRow>
        <IonRow>
            <TreeSearchField fieldString="type" fieldAccessor={type} fieldModifier={setType}/>
            <TreeSearchField fieldString="strongs" fieldAccessor={strongs} fieldModifier={setStrongs}/>
            <TreeSearchField fieldString="parsing" fieldAccessor={parsing} fieldModifier={setParsing}/>
        </IonRow>
        <IonRow>
            <IonCol size={1}>
                <IonButton
                    className="ion-float-end"
                    color="secondary"
                    fill="clear"
                    onClick={() => console.log('reset')}
                >
                    <IonIcon float-right icon={refresh}/>
                </IonButton>
            </IonCol>
            <IonCol size={10}> </IonCol>
            <IonCol size={1}>
                <IonButton
                    color="primary"
                    fill="clear"
                    className="ion-float-start"
                    onClick={
                        () => {
                            console.log('search');
                        }
                    }
                >
                    <IonIcon icon={search}/>
                </IonButton>
            </IonCol>

        </IonRow>
    </IonGrid>
}

export default TreeSearchForm;
