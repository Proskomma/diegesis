import React, {useContext, useEffect} from "react";
import PkContext from "../../contexts/PkContext";
import CollapsingRows from "../../components/CollapsingRows";
import SyntaxTreeRow from "../../components/SyntaxTreeRow";

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
                (tr, n) => <SyntaxTreeRow
                    treeData={tr}
                    rowKey={n}
                    isOpen={true}
                    />
            )
        }
    </CollapsingRows>
}

export default SyntaxTrees;
