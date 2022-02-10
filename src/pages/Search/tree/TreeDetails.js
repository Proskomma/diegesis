import {IonContent, IonGrid, IonRow, IonCol, IonTitle, IonButton} from "@ionic/react";
import React from "react";
import {Link} from "react-router-dom";

const TreeDetails = ({selectedNode, setSelectedNode, currentContent}) => {
    const makeFirstTerm = node => {
        const ret = {};
        for (const k of Object.keys(node).filter(k => k.endsWith('_2'))) {
            ret[k.split('_2')[0]] = node[k];
        }
        return ret;
    }
    const makeSecondTerm = node => {
        const ret = {};
        for (const k of Object.keys(node)) {
            ret[`${k}_2`] = node[k];
        }
        return ret;
    }
    const firstTermOnly = node => {
        const ret = {};
        for (const k of Object.keys(node).filter(k => !k.endsWith('_2'))) {
            ret[k] = node[k];
        }
        return ret;
    }
    const secondTermOnly = node => {
        const ret = {};
        for (const k of Object.keys(node).filter(k => k.endsWith('_2'))) {
            ret[k] = node[k];
        }
        return ret;
    }
    return <IonContent>
        <IonGrid>
            <IonRow>
                <IonCol size={8}>
                    <IonTitle>New Search Term <b>'{selectedNode.text}'</b> (previously '{currentContent.text}'{`${currentContent.text_2 ? ` and '${currentContent.text_2}'` : ""}`})</IonTitle>
                </IonCol>
                <IonCol size={4} className="ion-text-end">
                    <IonButton
                        size="small"
                        onClick={
                            () => {
                                setSelectedNode(null);
                            }
                        }
                    >
                        Dismiss
                    </IonButton>
                </IonCol>
            </IonRow>
            <IonRow>
                <IonCol>
                    <IonButton
                        style={{textTransform: "none"}}
                        color="secondary"
                        fill="outline"
                    >
                    <Link
                        style={{textDecoration: "none", "color": "#000"}}
                        to={{
                            pathname: "/search/tree",
                            state: {content: selectedNode, referer: "newSearch"},
                        }}
                    >
                        {`Search for '${selectedNode.text}'`}
                    </Link>
                    </IonButton>
                </IonCol>
            </IonRow>
            <IonRow>
                <IonCol>
                    <IonButton
                        style={{textTransform: "none"}}
                        color="secondary"
                        fill="outline"
                    >
                    <Link
                        style={{textDecoration: "none", "color": "#000"}}
                        to={{
                            pathname: "/search/tree",
                            state: {content: {...firstTermOnly(currentContent), ...makeSecondTerm(selectedNode)}, referer: "addSearch"},
                        }}
                    >
                        {`Search for '${currentContent.text}' and '${selectedNode.text}'`}
                    </Link>
                    </IonButton>
                </IonCol>
            </IonRow>
            { currentContent.text_2 &&
                <IonRow>
                    <IonCol>
                        <IonButton
                            style={{textTransform: "none"}}
                            color="secondary"
                            fill="outline"
                        >
                        <Link
                            style={{textDecoration: "none", "color": "#000"}}
                            to={{
                                pathname: "/search/tree",
                                state: {content: {...makeFirstTerm(secondTermOnly(currentContent)), ...makeSecondTerm(selectedNode)}, referer: "addSearch"},
                            }}
                        >
                            {`Search for '${currentContent.text_2}' and '${selectedNode.text}'`}
                        </Link>
                        </IonButton>
                    </IonCol>
                </IonRow>
            }
        </IonGrid>
    </IonContent>;
}

export default TreeDetails;
