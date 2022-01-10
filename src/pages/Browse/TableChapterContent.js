import {IonButton, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonRow} from '@ionic/react';
import React, {useContext, useEffect, useState} from "react";
import ReactMarkdown from "react-markdown";
import PkContext from "../../contexts/PkContext";
import DocSetsContext from "../../contexts/DocSetsContext";
import TranslationNavigation from "../../components/TranslationNavigation";
import {arrowBack, arrowForward} from "ionicons/icons";

const TableChapterContent = (
    {
        currentDocSet,
        setCurrentDocSet,
        currentBookCode,
        setCurrentBookCode,
        selectedChapter,
        setSelectedChapter,
        selectedVerses,
        setSelectedVerses,
        mutationId,

    }
) => {
    const pk = useContext(PkContext);
    const docSets = useContext(DocSetsContext);
    const [rows, setRows] = useState([]);
    const [headings, setHeadings] = useState([]);
    const [selectedRow, setSelectedRow] = useState(0);
    const [nDisplayedRows, setNDisplayedRows] = useState(10);
    const [displayedCols, setDisplayedCols] = useState([]);
    useEffect(() => {
        const doQuery = async () => {
            if (currentDocSet &&
                currentBookCode &&
                docSets[currentDocSet].documents[currentBookCode] &&
                docSets[currentDocSet].documents[currentBookCode].tags.includes('doctype:table')) {
                const res = await pk.gqlQuery(`{docSet(id:"${currentDocSet}") {
               document(bookCode:"${currentBookCode}") {
                 tableSequences {
                   id
                   headings
                   rows {
                     text
                   }
                 }
               }
             }}`);
                if (res.data.docSet.document.tableSequences.length > 0) {
                    setHeadings(res.data.docSet.document.tableSequences[0].headings)
                    setDisplayedCols(res.data.docSet.document.tableSequences[0].headings)
                    setRows(res.data.docSet.document.tableSequences[0].rows.map(r => r.map(c => c.text)));
                    setSelectedRow(0);
                }
            }
        };
        if (currentDocSet && currentBookCode) {
            doQuery();
        }
    }, [currentBookCode, currentDocSet, mutationId, pk]);
    const Navigation = ({transType}) => <TranslationNavigation
        transType={transType}
        currentDocSet={currentDocSet}
        setCurrentDocSet={setCurrentDocSet}
        currentBookCode={currentBookCode}
        setCurrentBookCode={setCurrentBookCode}
        selectedChapter={selectedChapter}
        setSelectedChapter={setSelectedChapter}
        maxChapter={1}
        selectedVerses={selectedVerses}
        setSelectedVerses={setSelectedVerses}
    >
        <IonCol size={1} style={{textAlign: "right"}}>
            <IonButton
                color="secondary"
                fill="clear"
                disabled={selectedRow <= 0}
                onClick={() => setSelectedRow(selectedRow - nDisplayedRows)}
            >
                <IonIcon icon={arrowBack}/>
            </IonButton>
        </IonCol>
        <IonCol size={1} style={{textAlign: "center"}}>
            Rows {selectedRow} - {Math.min(selectedRow + (nDisplayedRows - 1), rows.length)}
        </IonCol>
        <IonCol size={1}>
            <IonButton
                color="secondary"
                fill="clear"
                disabled={selectedRow + nDisplayedRows >= rows.length - 1}
                onClick={() => setSelectedRow(selectedRow + nDisplayedRows)}
            >
                <IonIcon icon={arrowForward}/>
            </IonButton>
        </IonCol>
        <IonCol size={3}>{
            headings.map(
                (h, hn) =>
                    <IonButton
                        key={hn}
                        size="small"
                        color="medium"
                        fill={displayedCols.includes(h) ? 'solid' : 'outline'}
                        onClick={() => {
                            if (displayedCols.includes(h)) {
                                setDisplayedCols(displayedCols.filter(c => c !== h))
                            } else {
                                setDisplayedCols([...displayedCols, h]);
                            }
                        }}
                    >
                        {h}
                    </IonButton>
            )
        }</IonCol>
    </TranslationNavigation>
    return <>
        <IonHeader>
            <Navigation transType="table"/>
        </IonHeader>
        <IonContent>
            <IonGrid>
                <IonRow>
                    {
                        displayedCols.map(
                            (h, hn) => <IonCol
                                key={hn}
                                size={hn === (displayedCols.length - 1) ? 12 - (displayedCols.length - 1) : 1}
                                style={{
                                    backgroundColor: (hn % 2 === 0) ? "#DDD" : '#CCC',
                                    borderBottom: "solid 1px #CCC",
                                }}
                            >
                                {h}
                            </IonCol>
                        )
                    }
                </IonRow>
                {
                    rows.slice(selectedRow, selectedRow + nDisplayedRows).map(
                        (r, rn) => <IonRow key={rn}>
                            {
                                displayedCols.map(
                                    (dc, dcn) => <IonCol
                                        key={dcn}
                                        size={dcn === (displayedCols.length - 1) ? 12 - (displayedCols.length - 1) : 1}
                                        style={{
                                            backgroundColor: (dcn % 2 === 0) ? "#FFF" : '#F7F7F7',
                                            borderBottom: "solid 1px #CCC",
                                        }}
                                    >
                                        {
                                            r[headings.indexOf(dc)] && <ReactMarkdown>{
                                                r[headings.indexOf(dc)]
                                                    .replace(/<br>/g, '\n')
                                                    .replace(/\\n/g, '\n')
                                                    .replace(/\(See: .+\)/g, "")
                                            }</ReactMarkdown>
                                        }
                                    </IonCol>
                                )
                            }
                        </IonRow>
                    )
                }
            </IonGrid>
        </IonContent>
    </>
};

export default TableChapterContent;
