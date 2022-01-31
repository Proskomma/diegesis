import {IonCol, IonRow} from "@ionic/react";
import ReactMarkdown from "react-markdown";
import React from "react";

const tableResultCellContent = (
    resultParaRecords,
    resultsPage,
    nResultsPerPage,
) => {
    const resultsToShow = resultParaRecords
        .slice(resultsPage * nResultsPerPage, (resultsPage * nResultsPerPage) + nResultsPerPage);
    return !resultsToShow ?
        [] :
        resultsToShow.map(
            r => <IonRow>
                <IonCol
                    style={{
                        backgroundColor: '#F7F7F7',
                        borderBottom: "solid 1px #CCC",
                    }}
                >
                    <ReactMarkdown>{
                        `${r.book}/${r.row}`
                    }</ReactMarkdown>
                </IonCol>
                {
                    r.fields && r.fields
                        .map((f, n) => <IonCol
                            size={n === (resultParaRecords[0].headings.length - 1) ? 11 - (resultParaRecords[0].headings.length - 1) : 1}
                            style={{
                                backgroundColor: (n % 2 === 0) ? "#FFF" : '#F7F7F7',
                                borderBottom: "solid 1px #CCC",
                            }}
                        >
                            {<ReactMarkdown>{
                                f
                                    .replace(/<br>/g, '\n')
                                    .replace(/\\n/g, '\n')
                                    .replace(/\(See: .+\)/g, "")
                            }</ReactMarkdown>}
                        </IonCol>)
                }
            </IonRow>
        );
}

export default tableResultCellContent;
