import React, {useContext, useEffect, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import Tree from 'react-d3-tree';
import {IonButton, IonCol, IonRow, IonText, IonTitle} from '@ionic/react';
import './BrowseTab.css';
import './TreeSVG.css';
import useWindowDimensions from '../../components/useWindowDimensions';
import PkContext from "../../contexts/PkContext";

const xre = require('xregexp');

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

const syntaxTreeToD3 = tribosTree => {
    if (tribosTree.children && tribosTree.children.length === 1) {
        return syntaxTreeToD3(tribosTree.children[0]);
    } else {
        return {
            name:
                tribosTree.content.elementType === 'w' ?
                    tribosTree.content.text :
                    tribosTree.content.class || JSON.stringify(tribosTree.content),
            attributes:
                tribosTree.content.elementType === 'w' ?
                    {
                        gloss: tribosTree.content.gloss,
                        class: tribosTree.content.class
                    } :
                    {},
            children:
                tribosTree.children ?
                    tribosTree.children
                        .filter(n => n.content.elementType !== 'pc')
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

const VerseDetails = ({
                          currentDocSet,
                          currentBookCode,
                          selectedChapter,
                          selectedVerses,
                          setShowDetails,
                      }) => {
    const pk = useContext(PkContext);
    const [result, setResult] = React.useState({});
    useEffect(() => {
        const doQuery = async () => {
            const res = await pk.gqlQuery(`{
             verseText: docSet(id:"${currentDocSet}") {
               document(bookCode:"${currentBookCode}") {cv(chapterVerses:"${selectedChapter}:${selectedVerses}") { text } }
             }
             grcVerseText: docSet(id:"grc_ugnt") {
               document(bookCode:"${currentBookCode}") {cv(chapterVerses:"${selectedChapter}:${selectedVerses}") { text } }
             }
             translationNotes: docSet(id:"eng_uwtn") {
               document(bookCode:"${currentBookCode}") {
                 tableSequences { rows(equals:[{colN:1 values:["${selectedChapter}"]}, {colN:2 values:["${selectedVerses}"]}], columns:[5, 7, 8]) { text } }
               }
             }
             studyNotes: docSet(id:"eng_uwsn") {
               document(bookCode:"${currentBookCode}") {
                 tableSequences { rows(equals:[{colN:0 values:["${selectedChapter}:${selectedVerses}"]}], columns:[4, 6]) { text } }
               }
             }
             syntaxTree: docSet(id:"eng_cblft") {
               document(bookCode:"${currentBookCode}") {
                 treeSequences {
                   id
                   verseTrees: tribos(query:"nodes[or(not(hasContent('chapter')), not(hasContent('verse')), not(==(content('chapter'),'${selectedChapter}')), not(==(content('verse'), '${selectedVerses}')))]/children[and(==(content('chapter'), '${selectedChapter}'), ==(content('verse'), '${selectedVerses}'))]/branch{children, @text, @gloss, @elementType, @role, @class}")
                 }
               }
             }
             }`);
            setResult(res);
            const refs = new Set();
            for (const [resourceName, resourceCol] of [['translationNotes', 2], ['studyNotes', 1]]) {
                if (res.data && res.data[resourceName] && res.data[resourceName].document && res.data[resourceName].document.tableSequences) {
                    for (const row of res.data[resourceName].document.tableSequences[0].rows) {
                        for (const linkPhrase of xre.match(row[resourceCol].text, /\(See: \[\[(.*?)\]\]\)/g)) {
                            const link = xre.exec(linkPhrase, /\[\[rc:\/\/(.*?)\]\]/)[1];
                            if (link.startsWith('en/ta')) {
                                refs.add(link);
                            }
                        }
                    }
                }
            }
            // console.log(Array.from(refs));
        };
        doQuery();
    }, []);
    const windowDimensions = useWindowDimensions();
    return <>
        <IonRow>
            <IonCol size={8}>
                <IonTitle>{currentBookCode} {selectedChapter}:{selectedVerses}</IonTitle>
            </IonCol>
            <IonCol size={4} className="ion-text-end">
                <IonButton
                    size="small"
                    onClick={
                        () => {
                            setShowDetails(false);
                        }
                    }
                >
                    Dismiss
                </IonButton>
            </IonCol>
        </IonRow>
        {
            result.data && result.data.verseText &&
            <IonRow>
                <IonCol>
                    <IonText color="primary">
                        {result.data.verseText.document.cv.map(cve => cve.text).join(' ')}
                    </IonText>
                </IonCol>
            </IonRow>
        }
        {
            currentDocSet !== 'grc_ugnt' && result.data && result.data.grcVerseText &&
            <IonRow>
                <IonCol>
                    <IonText color="secondary">
                        {result.data.grcVerseText.document.cv.map(cve => cve.text).join(' ')}
                    </IonText>
                </IonCol>
            </IonRow>
        }
        {
            result.data && result.data.translationNotes && result.data.translationNotes.document && result.data.translationNotes.document.tableSequences[0].rows.length > 0 &&
            <>
                <IonRow>
                    <IonCol>
                        <IonTitle>unfoldingWord Translation Notes</IonTitle>
                    </IonCol>
                </IonRow>
                {
                    result.data.translationNotes.document.tableSequences[0].rows.map(
                        (r, n) => <IonRow key={n} className="tableRow">
                            <IonCol size={4}>
                                <IonRow>
                                    <IonCol>
                                        <IonText color="primary">
                                            {r[1].text}
                                        </IonText>
                                    </IonCol>
                                </IonRow>
                                <IonRow>
                                    <IonCol>
                                        <IonText color="secondary">
                                            {r[0].text}
                                        </IonText>
                                    </IonCol>
                                </IonRow>
                            </IonCol>
                            <IonCol size={8}>
                                <ReactMarkdown>{r[2].text.replace(/\(See: .+\)/g, "")}</ReactMarkdown>
                            </IonCol>
                        </IonRow>
                    )
                }
            </>
        }
        {
            result.data && result.data.studyNotes && result.data.studyNotes.document && result.data.studyNotes.document.tableSequences[0].rows.length > 0 &&
            <>
                <IonRow>
                    <IonCol>
                        <IonTitle>unfoldingWord Study Notes</IonTitle>
                    </IonCol>
                </IonRow>
                {
                    result.data.studyNotes.document.tableSequences[0].rows.map(
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
                }
            </>
        }
        {
            result.data && result.data.syntaxTree && result.data.syntaxTree.document && result.data.syntaxTree.document.treeSequences[0] && result.data.syntaxTree.document.treeSequences[0].verseTrees &&
            <>
                <IonRow>
                    <IonCol>
                        <IonTitle>Clear.Bible Syntax Trees</IonTitle>
                    </IonCol>
                </IonRow>
                {
                    JSON.parse(result.data.syntaxTree.document.treeSequences[0].verseTrees).data.map(
                        tr =>
                            <IonRow style={{height: `${d3TreeDepth(syntaxTreeToD3(tr)) * (90 * (Math.min(1, 12.0 / d3TreeLeaves(syntaxTreeToD3(tr)))))}px`}}>
                                <IonCol>
                                    <Tree
                                        data={syntaxTreeToD3(tr)}
                                        orientation="vertical"
                                        separation={{ nonSiblings: 0.5, siblings: 0.5 }}
                                        nodeSize={{x:300, y:60}}
                                        translate={{x: windowDimensions.width/2, y: 100}}
                                        zoom={Math.min(1, 12.0/d3TreeLeaves(syntaxTreeToD3(tr)))}
                                        rootNodeClassName="treeBranchNode"
                                        branchNodeClassName="treeBranchNode"
                                        leafNodeClassName="treeLeafNode"
                                    />
                                </IonCol>
                            </IonRow>
                    )

                }
            </>
        }
    </>
}

export default VerseDetails;
