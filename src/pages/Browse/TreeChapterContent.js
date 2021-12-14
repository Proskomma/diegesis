import InterlinearNode from "./InterlinearNode";
import React, {useContext, useEffect, useState} from "react";
import {
    IonCol,
    IonGrid,
    IonRow,
} from '@ionic/react';
import PkContext from "../../contexts/PkContext";
import DocSetsContext from "../../contexts/DocSetsContext";
import TreeDisplayLevel from "./TreeDisplayLevel";

const leaves1 = nodes => {
    const ret = [];
    for (const node of nodes) {
        if (node.children && node.children.length > 0) {
            for (const child of leaves1(node.children)) {
                if (!child.cv) {
                    child.cv = node.cv
                }
                ret.push(child);
            }
        } else {
            ret.push(node.content);
        }
    }
    return ret;
}

const leaves = (nodes, cv, sentence) => {
    if (nodes.length === 0) {
        return [];
    }
    const node = nodes[0];
    if (node.cv && node.cv !== cv) {
        cv = node.cv;
    } else {
        delete node.cv;
    }
    if (node.sentence && node.sentence !== sentence) {
        sentence = node.sentence;
    } else {
        delete node.sentence;
    }
    return [node].concat(leaves(nodes.slice(1), cv, sentence));
}

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
                   chapterTrees: tribos(query:"nodes[not(hasContent('cv'))]/children[startsWith(content('cv'), '${selectedChapter || 1}:')]/branch{children, content}")
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
            <IonCol size={3}></IonCol>
            <TreeDisplayLevel
                leafDetailLevel={leafDetailLevel}
                setLeafDetailLevel={setLeafDetailLevel}
            />
            <IonCol size={3}></IonCol>
        </IonRow>
        <IonRow>
            <IonCol>
                {
                    leaves(leaves1(chapterNodes, ''), '', '')
                        .map(
                            (node, n) =>
                                <InterlinearNode key={n} content={node} detailLevel={leafDetailLevel}/>
                        )
                }
            </IonCol>
        </IonRow>
    </IonGrid>
};

export default TreeChapterContent;
