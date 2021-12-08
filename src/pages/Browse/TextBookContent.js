import {IonCol, IonGrid, IonRow, IonText} from "@ionic/react";
import VerseDetails from "./VerseDetails";
import React, {useContext, useEffect, useRef, useState} from "react";
import {ScriptureDocSet, ScriptureParaModel, ScriptureParaModelQuery} from "proskomma-render";
import BrowseDocumentModel from "./BrowseDocumentModel";
import PkContext from "../../contexts/PkContext";
import DocSetsContext from "../../contexts/DocSetsContext";

const TextBookContent = (
    {
        currentDocSet,
        currentDocId,
        currentBookCode,
        selectedChapter,
        setSelectedChapter,
        selectedVerses,
        setSelectedVerses,
    }) => {
    const pk = useContext(PkContext);
    const docSets = useContext(DocSetsContext);
    const [renderedSequence, setRenderedSequence] = useState([]);
    const [showDetails, setShowDetails] = useState(false);
    const selectedVerseRef = useRef(null);
    const topDocRef = useRef(null);
    const scrollToSelectedVerse = () => {
        if (selectedVerseRef.current) {
            selectedVerseRef.current.scrollIntoView({block: "center"});
        }
        return true;
    }
    const scrollToTopDoc = () => {
        if (topDocRef.current) {
            topDocRef.current.scrollIntoView({block: "start"});
        }
        return true;
    }

    useEffect(() => {
        const doQuery = async () => {
            if (currentDocSet &&
                docSets[currentDocSet].documents[currentBookCode] &&
                docSets[currentDocSet].documents[currentBookCode].tags.includes('doctype:text')) {
                const resData = await ScriptureParaModelQuery(pk, [currentDocSet], [currentDocId]);
                if (resData.docSets && resData.docSets[0]) {
                    const config = {
                        rendered: [],
                        versesCallback: ((chapter, verses) => {
                            setSelectedChapter(chapter);
                            setSelectedVerses(verses);
                            setShowDetails(true);
                        }),
                        selectedChapter,
                        selectedVerses,
                        selectedVerseRef,
                        topDocRef,
                    };
                    const model = new ScriptureParaModel(resData, config);
                    const docSetModel = new ScriptureDocSet(resData, model.context, config);
                    docSetModel.addDocumentModel("default", new BrowseDocumentModel(resData, model.context, config));
                    model.addDocSetModel('default', docSetModel);
                    model.render();
                    setRenderedSequence(config.rendered);
                }
            }
        };
        if (currentDocSet && currentBookCode) {
            doQuery();
        }
    }, [currentBookCode, currentDocSet, selectedChapter, selectedVerses, pk]);
    useEffect(() => {
        if (selectedVerses && selectedVerseRef) {
            scrollToSelectedVerse();
        } else if (topDocRef) {
            scrollToTopDoc();
        }
    }, [selectedVerses, selectedVerseRef, topDocRef, showDetails, renderedSequence]);

    return <IonGrid>
        {
            !showDetails &&
            <IonRow>
                <IonCol>
                    <IonText>{renderedSequence}</IonText>
                </IonCol>
            </IonRow>
        }
        {
            showDetails &&
            <VerseDetails
                currentDocSet={currentDocSet}
                currentBookCode={currentBookCode}
                selectedChapter={selectedChapter}
                selectedVerses={selectedVerses}
                setShowDetails={setShowDetails}
            />
        };
    </IonGrid>;
}

export default TextBookContent;
