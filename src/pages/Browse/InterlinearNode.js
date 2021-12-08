const textStyle = {
    display: "block",
    textAlign: "center",
    fontWeight: "bold",
};
const glossStyle = {
    display: "block",
    textAlign: "center",
    fontSize: "smaller",
};
const parsingStyle = {
    display: "block",
    color: "#666",
    textAlign: "center",
    fontSize: "smaller",
};
const rcStyle = {
    display: "inline-block",
    paddingRight: "0.5em",
    marginTop: "10px",
    verticalAlign: "top",
};

const InterlinearNode = ({content, detailLevel}) => {
    return <div style={rcStyle}>
        {content.text && <div style={textStyle}>{content.text}</div>}
        {detailLevel > 1 && content.gloss && <div style={glossStyle}>{content.gloss}{content.class ? ` (${content.type && content.class !== 'verb' ? `${content.type} `: ''}${content.class})` : ''}</div>}
        {detailLevel > 2 && content.lemma && content.lemma !== content.text && <div style={parsingStyle}>from {content.lemma}</div>}
        {
            detailLevel > 3 && Object.entries(content)
                .filter(c => !['lemma', 'gloss', 'text', 'type', 'class'].includes(c[0]))
                .map((c, n) => <div key={n} style={parsingStyle}>{c[0]}: {c[1]}</div>)
        }
    </div>;
}

export default InterlinearNode;
