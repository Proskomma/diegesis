import InterlinearNode from "./InterlinearNode";

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
        chapterNodes,
        currentDocSet,
        currentBookCode,
        selectedChapter,
        selectedVerses,
        setShowDetails,
    }
) => {
    return <div>{leaves(chapterNodes, '').map(n => <InterlinearNode content={n}/>)}</div>;
};

export default TreeChapterContent;
