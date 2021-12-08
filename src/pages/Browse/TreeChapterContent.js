import InterlinearNode from "./InterlinearNode";
import React, {useContext, useEffect, useState} from "react";
import {
    IonCol,
    IonGrid,
    IonIcon,
    IonButton,
    IonRow,
} from '@ionic/react';
import PkContext from "../../contexts/PkContext";
import DocSetsContext from "../../contexts/DocSetsContext";
import {arrowBack, arrowForward} from "ionicons/icons";

const leaves = (nodes, cv) => {
    const ret = [];
    for (const node of nodes) {
        if (node.children && node.children.length > 0) {
            for (const child of leaves(node.children, cv)) {
                ret.push(child);
            }
        } else {
            ret.push(node.content);
        }
    }
    return ret;
}

const detailLevels = [null, 'text', 'text and gloss', 'text, gloss and lemma', 'all'];
const TreeChapterContent = (
    {
        currentDocSet,
        currentBookCode,
        selectedChapter,
        setSelectedChapter,
        selectedVerses,
    }
) => {
    const pk = useContext(PkContext);
    const docSets = useContext(DocSetsContext);
    const [chapterNodes, setChapterNodes] = useState([]);
    const [leafDetailLevel, setLeafDetailLevel] = useState(1);
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
                   chapterTrees: tribos(query:"nodes[startsWith(content('cv'), '${selectedChapter || 1}:')]/branch{children, content}")
                 }
               }
             }}`);
                setChapterNodes(JSON.parse(res.data.docSet.document.treeSequences[0].chapterTrees).data);
                if (!selectedChapter) {setSelectedChapter(1)}
            }
        };
        if (currentDocSet && currentBookCode) {
            doQuery();
        }
    }, [currentBookCode, currentDocSet, selectedChapter, selectedVerses, pk]);
    return <IonGrid>
        <IonRow>
            <IonCol size={1}>
                <IonButton
                    color="secondary"
                    fill="clear"
                    onClick={() => setSelectedChapter(selectedChapter - 1)}
                >
                    <IonIcon icon={arrowBack}/>
                </IonButton>
            </IonCol>
            <IonCol size={4}>
                Ch {selectedChapter}
            </IonCol>
            <IonCol size={1}>
                <IonButton
                    color="secondary"
                    fill="clear"
                    onClick={() => setSelectedChapter(selectedChapter + 1)}
                >
                    <IonIcon icon={arrowForward}/>
                </IonButton>
            </IonCol>
            <IonCol size={1}>
                <IonButton
                    color="secondary"
                    fill="clear"
                    disabled={leafDetailLevel <= 1}
                    onClick={() => setLeafDetailLevel(leafDetailLevel - 1)}
                >
                    <IonIcon icon={arrowBack}/>
                </IonButton>
            </IonCol>
            <IonCol size={4}>
                display {detailLevels[leafDetailLevel]}
            </IonCol>
            <IonCol size={1}>
                <IonButton
                    color="secondary"
                    fill="clear"
                    disabled={leafDetailLevel >= 4}
                    onClick={() => setLeafDetailLevel(leafDetailLevel + 1)}
                >
                    <IonIcon icon={arrowForward}/>
                </IonButton>
            </IonCol>
        </IonRow>
        <IonRow>
            <IonCol>
                {
                    leaves(chapterNodes, '')
                        .map(
                            (node, n) =>
                                <InterlinearNode key={n} content={node} detailLevel={leafDetailLevel}/>
                        )
                }
            </IonCol>
        </IonRow>
    </IonGrid>;
};

export default TreeChapterContent;
