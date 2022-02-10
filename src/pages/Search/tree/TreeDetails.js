import {IonContent, IonGrid, IonRow, IonCol, IonTitle, IonButton} from "@ionic/react";
import React from "react";
import {Link} from "react-router-dom";

const TreeDetails = ({selectedNode, setSelectedNode, currentContent}) => {
    return <IonContent>
        <IonGrid>
            <IonRow>
                <IonCol size={8}>
                    <IonTitle>New Search Term <b>'{selectedNode.text}'</b> (currently '{currentContent.text}')</IonTitle>
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
                    <Link
                        to={{
                            pathname: "/search/tree",
                            state: {content: selectedNode, referer: "newSearch"},
                        }}
                    >
                        {`Search for '${selectedNode.text}'`}
                    </Link>
                </IonCol>
            </IonRow>
        </IonGrid>
    </IonContent>;
}

export default TreeDetails;
