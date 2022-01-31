import {IonCol, IonRow} from "@ionic/react";
import React from "react";

 const tableResultHeaderRow = (resultParaRecords) => <IonRow>
    <IonCol
        style={{
            backgroundColor: '#CCC',
            borderBottom: "solid 1px #CCC",
        }}
    >Book/Row</IonCol>
    {
        resultParaRecords[0] && resultParaRecords[0].headings && resultParaRecords[0].headings.map(
            (h, hn) => <IonCol
                key={hn}
                size={hn === (resultParaRecords[0].headings.length - 1) ? 11 - (resultParaRecords[0].headings.length - 1) : 1}
                style={{
                    backgroundColor: (hn % 2 === 0) ? "#DDD" : '#CCC',
                    borderBottom: "solid 1px #CCC",
                }}
            >
                {hn} - {h}
            </IonCol>
        )
    }
</IonRow>

export default tableResultHeaderRow;
