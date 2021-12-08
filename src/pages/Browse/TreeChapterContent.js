import InterlinearNode from "./InterlinearNode";
import {useContext, useEffect, useState} from "react";
import PkContext from "../../contexts/PkContext";
import DocSetsContext from "../../contexts/DocSetsContext";

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

const TreeChapterContent = (
    {
        showDetails,
        currentDocSet,
        currentBookCode,
        selectedChapter,
        selectedVerses,
        setShowDetails,
    }
) => {
    const pk = useContext(PkContext);
    const docSets = useContext(DocSetsContext);
    const [chapterNodes, setChapterNodes] = useState([]);
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
                   chapterTrees: tribos(query:"nodes[startsWith(content('cv'), '${selectedChapter || '1'}:')]/branch{children, @text, @gloss, @class}")
                 }
               }
             }}`);
                setChapterNodes(JSON.parse(res.data.docSet.document.treeSequences[0].chapterTrees).data);
            }
        };
        if (currentDocSet && currentBookCode) {
            doQuery();
        }
    }, [currentBookCode, currentDocSet, selectedChapter, selectedVerses, pk]);
    return <div>{leaves(chapterNodes, '').map(n => <InterlinearNode content={n}/>)}</div>;
};

export default TreeChapterContent;
