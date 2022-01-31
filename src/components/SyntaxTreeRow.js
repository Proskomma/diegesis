import React from "react";
import {IonCol, IonRow} from "@ionic/react";
import Tree from "react-d3-tree";
import useWindowDimensions from "./useWindowDimensions";
import './TreeSVG.css';

const syntaxTreeToD3 = tribosTree => {
    if (tribosTree.children && tribosTree.children.length === 1) {
        return syntaxTreeToD3(tribosTree.children[0]);
    } else {
        return {
            name:
                tribosTree.content.text || tribosTree.content.class || (tribosTree.content.cv && ' ') || JSON.stringify(tribosTree.content),
            attributes:
                tribosTree.children && tribosTree.children.length > 0 ?
                    {} :
                    {
                        gloss: tribosTree.content.gloss,
                        class: tribosTree.content.class,
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

const SyntaxTreeRow = ({rowKey, treeData}) => {
    const windowDimensions = useWindowDimensions();
    return <IonRow
        key={rowKey}
        style={{height: `${d3TreeDepth(syntaxTreeToD3(treeData)) * (90 * (Math.min(1, 24.0 / d3TreeLeaves(syntaxTreeToD3(treeData)))))}px`}}>
        <IonCol>
            <Tree
                data={syntaxTreeToD3(treeData)}
                orientation="vertical"
                separation={{nonSiblings: 0.5, siblings: 0.5}}
                nodeSize={{x: 300, y: 60}}
                translate={{x: windowDimensions.width / 2, y: 100}}
                zoom={Math.min(1, 12.0 / d3TreeLeaves(syntaxTreeToD3(treeData)))}
                rootNodeClassName="treeBranchNode"
                branchNodeClassName="treeBranchNode"
                leafNodeClassName="treeLeafNode"
            />
        </IonCol>
    </IonRow>
}

export default SyntaxTreeRow;
