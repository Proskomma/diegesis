const leaves1 = nodes => {
    const ret = [];
    for (const node of nodes) {
        if (node.children && node.children.length > 0) {
            for (const child of leaves1(node.children)) {
                if (!child.cv) {
                    child.cv = node.cv
                }
                ret.push(child);
            }
        } else {
            ret.push(node.content);
        }
    }
    return ret;
}

const leaves = (nodes, cv, sentence) => {
    if (nodes.length === 0) {
        return [];
    }
    const node = nodes[0];
    if (node.cv && node.cv !== cv) {
        cv = node.cv;
    } else {
        delete node.cv;
    }
    if (node.sentence && node.sentence !== sentence) {
        sentence = node.sentence;
    } else {
        delete node.sentence;
    }
    return [node].concat(leaves(nodes.slice(1), cv, sentence));
}

export {leaves, leaves1};
