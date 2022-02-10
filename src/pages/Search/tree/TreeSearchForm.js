import React, {useEffect, useState} from 'react';
import {IonButton, IonCheckbox, IonCol, IonGrid, IonIcon, IonInput, IonRow} from '@ionic/react'
import {refresh, search} from "ionicons/icons";
import deepEqual from 'deep-equal';

const TreeSearchForm = props => {
    const [content, setContent] = useState({});
    useEffect(
        () => {
            if (props.content && !deepEqual(props.content, content)) {
                const text = props.isSecond ? props.content.text_2 : props.content.text
                if (text) {
                    props.setWord(text)
                }
                const lemma = props.isSecond ? props.content.lemma_2 : props.content.lemma
                if (lemma) {
                    props.setLemma(lemma)
                }
                const gloss = props.isSecond ? props.content.gloss_2 : props.content.gloss
                if (gloss) {
                    props.setGloss(gloss)
                }
                const strong = props.isSecond ? props.content.strong_2 : props.content.strong
                if (strong) {
                    props.setStrongs(strong)
                }
                let parsingFields = ['text', 'lemma', 'gloss', 'strong', 'class', 'type'];
                if (props.isSecond) {
                    parsingFields = parsingFields.map(f => `${f}_2`)
                }
                const parsingContent = Object.keys(props.content)
                    .filter(c => !parsingFields.includes(c))
                    .filter(c => props.isSecond ? c.endsWith('_2') : !c.endsWith('_2'));
                if (parsingContent.length > 0) {
                    props.setParsing(parsingContent.map(k => `${k}:${props.content[k]}`).join(' '))
                }
                setContent(props.content);
            }
        },
        [props.content]
    )
    const TreeSearchField = ({fieldString, fieldAccessor, fieldModifier, fieldWidth}) => {
        return <>
            <IonCol size={1}>
                <IonCheckbox
                    checked={props.checkedFields.includes(fieldString)}
                    onIonChange={
                        () => {
                            if (props.checkedFields.includes(fieldString)) {
                                props.setCheckedFields(props.checkedFields.filter(f => f !== fieldString))
                            } else if (fieldString === 'parsing') {
                                props.setCheckedFields([...props.checkedFields, fieldString])
                            } else {
                                props.setCheckedFields([...props.checkedFields.filter(f => !['word', 'lemma', 'gloss', 'strongs'].includes(f)), fieldString])
                            }
                        }
                    }
                />
            </IonCol>
            <IonCol size={fieldWidth || 2}>
                <IonInput
                    placeholder={fieldString[0].toUpperCase() + fieldString.substring(1)}
                    value={fieldAccessor}
                    disabled={!props.checkedFields.includes(fieldString)}
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
