import React, {useContext, useEffect} from "react";
import {IonCol, IonRow, IonTitle} from "@ionic/react";
import Tree from "react-d3-tree";
import useWindowDimensions from "../../components/useWindowDimensions";
import './TreeSVG.css';
import PkContext from "../../contexts/PkContext";
import CollapsingRows from "../../components/CollapsingRows";

/*
const renderSyntaxTree = tribos => {
    return tribos.filter(n => n.content.elementType !== 'pc').map(
        tree =>
            tree.children && tree.children.length === 1 ?
                renderSyntaxTree([tree.children[0]]) :
                <li>
                    {tree.content.elementType === 'w' ? `${tree.content.text} - ${tree.content.gloss} (${tree.content.class})` : tree.content.class || JSON.stringify(tree.content)}
                    {tree.children && <ul>{renderSyntaxTree(tree.children)}</ul>}
                </li>
    )
}
 */

const syntaxTreeToD3 = tribosTree => {
    if (tribosTree.children && tribosTree.children.length === 1) {
        return syntaxTreeToD3(tribosTree.children[0]);
    } else {
        return {
            name:
                    tribosTree.content.text || tribosTree.content.class || JSON.stringify(tribosTree.content),
            attributes:
                tribosTree.children && tribosTree.children.length > 0 ?
                    {} :
                    {
                        gloss: tribosTree.content.gloss,
                        class: tribosTree.content.class
                    },
            children:
                tribosTree.children ?
                    tribosTree.children
                        .map(ch => syntaxTreeToD3(ch)) :
                    [],
        }
    }
}

const d3TreeDepth = (d3Tree, depth) => {
    depth = depth || 1;
    if (!d3Tree.children || d3Tree.children.length === 0) {
        return depth;
    } else {
        return Math.max(...d3Tree.children.map(ch => d3TreeDepth(ch, depth + 1)))
    }
}

const d3TreeLeaves = d3Tree => {
    if (!d3Tree.children || d3Tree.children.length === 0) {
        return 1.0;
    } else {
        return d3Tree.children
            .map(ch => d3TreeLeaves(ch))
            .reduce((a, b) => a + b);
    }
}

const SyntaxTrees = ({currentBookCode, selectedChapter, selectedVerses, isOpen, setIsOpen}) => {
    const [result, setResult] = React.useState({});
    const pk = useContext(PkContext);
    useEffect(() => {
        if (currentBookCode && selectedChapter && selectedVerses && isOpen) {
            const doQuery = async () => {
                const cv = `${selectedChapter}:${selectedVerses}`;
                const res = await pk.gqlQuery(`{docSet(id:"eng_cblft") {
               document(bookCode:"${currentBookCode}") {
                 treeSequences {
                   id
                   verseTrees: tribos(query:"nodes[not(hasContent('cv'))]/children[==(content('cv'), '${cv}')]/branch{children, @text, @gloss, @class}")
                 }
               }
             }}`);
                setResult(res);
            }
            doQuery();
        }
    }, [currentBookCode, selectedChapter, selectedVerses, isOpen, pk]);
    const windowDimensions = useWindowDimensions();
    const tribos =
        result.data &&
        result.data.docSet &&
        result.data.docSet.document &&
        result.data.docSet.document.treeSequences[0] &&
        result.data.docSet.document.treeSequences[0].verseTrees &&
        JSON.parse(result.data.docSet.document.treeSequences[0].verseTrees).data;
    const nTrees = tribos ? tribos.length : 0;
    return <CollapsingRows
        hasData={true}
        heading={`Clear.Bible Syntax Trees ${nTrees > 0 ? `(${nTrees})` : ''}`}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
    >
        {
            (nTrees > 0) && tribos.map(
                (tr, n) =>
                    <IonRow
                        key={n}
                        style={{height: `${d3TreeDepth(syntaxTreeToD3(tr)) * (90 * (Math.min(1, 12.0 / d3TreeLeaves(syntaxTreeToD3(tr)))))}px`}}>
                        <IonCol>
                            <Tree
                                data={syntaxTreeToD3(tr)}
                                orientation="vertical"
                                separation={{nonSiblings: 0.5, siblings: 0.5}}
                                nodeSize={{x: 300, y: 60}}
                                translate={{x: windowDimensions.width / 2, y: 100}}
                                zoom={Math.min(1, 12.0 / d3TreeLeaves(syntaxTreeToD3(tr)))}
                                rootNodeClassName="treeBranchNode"
                                branchNodeClassName="treeBranchNode"
                                leafNodeClassName="treeLeafNode"
                            />
                        </IonCol>
                    </IonRow>
            )
        }
    </CollapsingRows>;
}

export default SyntaxTrees;
