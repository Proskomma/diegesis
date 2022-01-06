const textStyle = {
    display: "block",
    textAlign: "center",
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
    fontStyle: "italic",
};
const lemmaStyle = {
    display: "block",
    color: "#555",
    textAlign: "center",
    fontSize: "smaller",
};
const wordRcStyle = {
    display: "inline-block",
    paddingLeft: "0.5em",
    paddingRight: "0.5em",
    marginTop: "10px",
    verticalAlign: "top",
};
const cvRcStyle = {
    display: "inline-block",
    paddingLeft: "0.5em",
    paddingRight: "0.5em",
    marginTop: "10px",
    verticalAlign: "top",
    fontWeight: "bold",
    fontStyle: "italic",
    fontSize: "smaller",
};

const formatParsing = (terms, l, c) => {
    if (terms.length === 0) {
        return [];
    }
    const ret = [];
    l = l || 0;
    c = c || 0;
    if (l > 15) {
        ret.push(<br key={c++}/>);
        ret.push(<span key={c++}>{terms[0]}</span>);
        l = (terms[0].length + 1);
    } else {
        ret.push(<span key={c++}>{" "}</span>);
        ret.push(<span key={c++}>{terms[0]}</span>);
        l += (terms[0].length + 1);
    }
    return ret.concat(formatParsing(terms.slice(1), l, c));
}

const parsingInfo = content => {
    const ret = [];
    const maybePush = e => {
        if (e) {
            ret.push(e);
        }
    }
    if (['noun', 'adv', 'det', 'pron', 'adj', 'conj', 'prep', 'ptcl', 'num'].includes(content.class)) {
        maybePush(content.gender);
        maybePush(content.case);
        maybePush(content.number);
    } else if (content.class === 'verb') {
        if (['indicative', 'imperative', 'subjunctive', 'infinitive'].includes(content.mood)) {
            maybePush(content.person);
            maybePush(content.number);
            maybePush(content.tense);
            maybePush(content.voice);
            maybePush(content.mood);
        } else {
            maybePush(content.gender);
            maybePush(content.case);
            maybePush(content.number);
            maybePush(content.tense);
            maybePush(content.voice);
            maybePush(content.mood);
        }
    } else {
        console.log("Unknown content class", content.class);
        Object.entries(content)
            .forEach(
                kv => {
                    maybePush(kv[0]);
                    maybePush(kv[1]);
                }
            )
    }
    return <div style={parsingStyle}>{formatParsing(ret)}</div>;
}

const InterlinearNode = ({content, detailLevel}) => {
    return <>
        {content.sentence && <><br/><span style={{paddingLeft: "3em"}}> </span></>}
        {content.cv && <div style={cvRcStyle}>{content.cv.split(':')[1]}</div>}
        <div style={wordRcStyle}>
            {content.text && <div style={textStyle}>{content.text}</div>}
            {detailLevel > 1 && content.gloss &&
            <div style={glossStyle}>
                {content.gloss}{content.class ? ` (${content.type && content.class !== 'verb' ? `${content.type} ` : ''}${content.class})` : ''}
            </div>}
            {detailLevel > 2 && content.lemma &&
            <div style={lemmaStyle}>from {content.lemma}{content.strong ? ` (${content.strong})` : ''}</div>}
            {
                detailLevel > 3 && parsingInfo(content)
            }
        </div>
        </>
}

export default InterlinearNode;
