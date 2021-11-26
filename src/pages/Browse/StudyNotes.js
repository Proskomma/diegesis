import {IonCol, IonRow, IonText} from "@ionic/react";
import ReactMarkdown from "react-markdown";
import React, {useContext, useEffect} from "react";
import PkContext from "../../contexts/PkContext";
import CollapsingRows from "../../components/CollapsingRows";

const StudyNotes = ({currentBookCode, selectedChapter, selectedVerses, isOpen, setIsOpen}) => {
    const [result, setResult] = React.useState({});
    const pk = useContext(PkContext);
    useEffect(() => {
        if (currentBookCode && selectedChapter && selectedVerses && isOpen) {
            const doQuery = async () => {
                const res = await pk.gqlQuery(`{docSet(id:"eng_uwsn") {
               document(bookCode:"${currentBookCode}") {
                 tableSequences { rows(equals:[{colN:0 values:["${selectedChapter}:${selectedVerses}"]}], columns:[4, 6]) { text } }
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
        heading={`unfoldingWord Study Notes ${nRows > 0 ? `(${nRows})` : ''}`}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
    >
        {
            (nRows > 0) ?
                tableSequence.rows.map(
                    (r, n) => <IonRow key={n} className="tableRow">
                        <IonCol size={4}>
                            <IonText color="secondary">
                                {r[0].text}
                            </IonText>
                        </IonCol>
                        <IonCol size={8}>
                            <ReactMarkdown>{r[1].text}</ReactMarkdown>
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
    </CollapsingRows>;
}

export default StudyNotes;

