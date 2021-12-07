const textStyle = {
    display: "block",
    textAlign: "center",
};
const glossStyle = {
    display: "block",
    color: "#888",
    textAlign: "center",
};
const rcStyle = {
    display: "inline-block",
    paddingRight: "0.5em",
    marginTop: "10px"
};

const InterlinearNode = ({content}) => {
    return <div style={rcStyle}>
        <div style={textStyle}>{content.text}</div>
        <div style={glossStyle}>{content.gloss}</div>
    </div>;
}

export default InterlinearNode;
