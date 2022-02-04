import InterlinearNode from "./InterlinearNode";
import React, {useContext, useEffect, useState} from "react";
import {IonCol, IonContent, IonGrid, IonHeader, IonRow,} from '@ionic/react';
import PkContext from "../../contexts/PkContext";
import DocSetsContext from "../../contexts/DocSetsContext";
import TreeDisplayLevel from "./TreeDisplayLevel";
import TranslationNavigation from "../../components/TranslationNavigation";
import {leaves, leaves1} from "../../components/treeLeaves";
import VerseDetails from "./VerseDetails";

const TreeChapterContent = (
    {
        currentDocSet,
        setCurrentDocSet,
        currentBookCode,
        setCurrentBookCode,
        selectedChapter,
        setSelectedChapter,
        selectedVerses,
        setSelectedVerses,
    }
) => {
    const pk = useContext(PkContext);
    const docSets = useContext(DocSetsContext);
    const [chapterNodes, setChapterNodes] = useState([]);
    const [leafDetailLevel, setLeafDetailLevel] = useState(1);
    const [showDetails, setShowDetails] = useState(false);
    const [maxC, setMaxC] = useState(0);
    useEffect(() => {
        const doQuery = async () => {
            if (currentDocSet &&
                currentBookCode &&
                docSets[currentDocSet].documents[currentBookCode] &&
                docSets[currentDocSet].documents[currentBookCode].tags.includes('doctype:tree')) {
                const res = await pk.gqlQuery(`{docSet(id:"${currentDocSet}") {
               document(bookCode:"${currentBookCode}") {
                 treeSequences {
                   id
                   chapterTrees: tribos(query:
                     "nodes[not(hasContent('cv'))]/children[startsWith(content('cv'), '${selectedChapter || 1}:')]/branch{children, content}"
                   )
                   cvs: tribos(query: "nodes/values{@cv}")
                 }
               }
             }}`);
                setChapterNodes(JSON.parse(res.data.docSet.document.treeSequences[0].chapterTrees).data);
                setMaxC(
                    Math.max(
                        ...JSON.parse(
                            res.data.docSet.document.treeSequences[0].cvs
                        )
                            .data.cv.map(
                                cv => cv.split(':').map(cvv => parseInt(cvv))[0]
                            )
                    )
                );
                if (!selectedChapter) {
                    setSelectedChapter(1)
                }
            }
        };
        if (currentDocSet && currentBookCode) {
            doQuery();
        }
    }, [currentBookCode, currentDocSet, selectedChapter, selectedVerses, pk]);
    const Navigation = ({transType}) => <TranslationNavigation
        transType={transType}
        currentDocSet={currentDocSet}
        setCurrentDocSet={setCurrentDocSet}
        currentBookCode={currentBookCode}
        setCurrentBookCode={setCurrentBookCode}
        selectedChapter={selectedChapter}
        setSelectedChapter={setSelectedChapter}
        maxChapter={maxC}
        selectedVerses={selectedVerses}
        setSelectedVerses={setSelectedVerses}
    >
        <TreeDisplayLevel
            leafDetailLevel={leafDetailLevel}
            setLeafDetailLevel={setLeafDetailLevel}
        />
    </TranslationNavigation>;
    return <>
        <IonHeader>
            <Navigation transType="tree"/>
        </IonHeader>
        <IonContent>
            <IonGrid>
                {
                    showDetails &&
                    <VerseDetails
                        currentDocSet={currentDocSet}
                        currentBookCode={currentBookCode}
                        selectedChapter={selectedChapter}
                        selectedVerses={selectedVerses}
                        setShowDetails={setShowDetails}
                    />
                }
                {
                    !showDetails &&
                    <IonRow>
                        <IonCol>
                            {
                                leaves(leaves1(chapterNodes, ''), '', '')
                                    .map(
                                        (node, n) =>
                                            <InterlinearNode
                                                key={n}
                                                content={node}
                                                detailLevel={leafDetailLevel}
                                                setSelectedChapter={setSelectedChapter}
                                                setSelectedVerses={setSelectedVerses}
                                                setShowDetails={setShowDetails}
                                            />
                                    )
                            }
                        </IonCol>
                    </IonRow>
                }
            </IonGrid>
        </IonContent>
    </>
};

export default TreeChapterContent;
