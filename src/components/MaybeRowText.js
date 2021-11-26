import React from 'react';

import {IonCol, IonRow, IonText} from '@ionic/react';

const MaybeRowText = ({hasData, color, text}) => {
    if (!hasData) {
        return '';
    } else {
        return <IonRow>
            <IonCol>
                <IonText color={color}>
                    {text}
                </IonText>
            </IonCol>
        </IonRow>;
    }
}

export default MaybeRowText;
