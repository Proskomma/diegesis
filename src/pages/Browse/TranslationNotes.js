import React, {useContext, useEffect} from "react";
import ReactMarkdown from "react-markdown";
import {IonCol, IonRow, IonText} from "@ionic/react";
import CollapsingRows from "../../components/CollapsingRows";
import PkContext from "../../contexts/PkContext";

const TranslationNotes = ({currentBookCode, selectedChapter, selectedVerses, isOpen, setIsOpen}) => {
    const [result, setResult] = React.useState({});
    const pk = useContext(PkContext);
    useEffect(() => {
        if (currentBookCode && selectedChapter && selectedVerses && isOpen) {
            const doQuery = async () => {
                const res = await pk.gqlQuery(`{docSet(id:"eng_uwtn") {
               document(bookCode:"${currentBookCode}") {
                 tableSequences { rows(equals:[{colN:1 values:["${selectedChapter}"]}, {colN:2 values:["${selectedVerses}"]}], columns:[5, 7, 8]) { text } }
               }
             }}`);
                setResult(res);
            }
            doQuery();
        }
    }, [currentBookCode, selectedChapter, selectedVerses, isOpen, pk]);

    const tableSequence =
        result.data &&
        result.data.docSet &&
        result.data.docSet.document &&
        result.data.docSet.document.tableSequences[0];
    const nRows = tableSequence ? tableSequence.rows.length : 0;
    return <CollapsingRows
        hasData={true}
        heading={`unfoldingWord Translation Notes ${nRows > 0 ? `(${nRows})` : ''}`}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
    >
        {
            (nRows > 0) ?
                tableSequence.rows.map(
                    (r, n) => <IonRow key={n} className="tableRow">
                        <IonCol size={4}>
                            <IonRow>
                                <IonCol>
                                    <IonText color="primary">
                                        {r[1].text}
                                    </IonText>
                                </IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>
                                    <IonText color="secondary">
                                        {r[0].text}
                                    </IonText>
                                </IonCol>
                            </IonRow>
                        </IonCol>
                        <IonCol size={8}>
                            <ReactMarkdown>{r[2].text.replace(/\(See: .+\)/g, "")}</ReactMarkdown>
                        </IonCol>
                    </IonRow>
                )
                :
                <IonRow>
                    <IonCol>
                        <IonText color="primary">no notes found</IonText>
                    </IonCol>
                </IonRow>
        }
    </CollapsingRows>
}

export default TranslationNotes;
