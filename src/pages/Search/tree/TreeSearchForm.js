import React, {useEffect, useState} from 'react';
import {IonButton, IonCheckbox, IonCol, IonGrid, IonIcon, IonInput, IonRow} from '@ionic/react'
import {refresh, search} from "ionicons/icons";
import deepEqual from 'deep-equal';

const TreeSearchForm = (props) => {
    const [content, setContent] = useState({});
    const [checkedFields, setCheckedFields] = useState([]);
    useEffect(
        () => {
            if (props.content && !deepEqual(props.content, content)) {
                if (props.content.text) {
                    props.setWord(props.content.text)
                }
                if (props.content.lemma) {
                    props.setLemma(props.content.lemma)
                }
                if (props.content.gloss) {
                    props.setGloss(props.content.gloss)
                }
                if (props.content.strong) {
                    props.setStrongs(props.content.strong)
                }
                const parsingContent = Object.keys(props.content).filter(c => !['text', 'lemma', 'gloss', 'strong', 'class', 'type'].includes(c));
                if (parsingContent.length > 0) {
                    props.setParsing(parsingContent.map(k => `${k}:${props.content[k]}`).join(' '))
                }
                setContent(content);
            }
        },
        [props.content]
    )
    const TreeSearchField = ({fieldString, fieldAccessor, fieldModifier, fieldWidth}) => {
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
            <IonCol size={fieldWidth || 2}>
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
    return <>
            <IonRow>
                <TreeSearchField fieldString="word" fieldAccessor={props.word} fieldModifier={props.setWord}/>
                <TreeSearchField fieldString="lemma" fieldAccessor={props.lemma} fieldModifier={props.setLemma}/>
                <TreeSearchField fieldString="gloss" fieldAccessor={props.gloss} fieldModifier={props.setGloss}/>
                <TreeSearchField fieldString="strongs" fieldAccessor={props.strongs} fieldModifier={props.setStrongs}/>
            </IonRow>
            <IonRow>
                <TreeSearchField fieldString="parsing" fieldAccessor={props.parsing} fieldModifier={props.setParsing}
                                 fieldWidth={11}/>
            </IonRow>
        </>
}

export default TreeSearchForm;
