const textSearchDocumentQuery = (payloadTerms, attTerms, currentDocSet) => {
    const payloadTermsClause = payloadTerms.length > 0 ?
        "         withMatchingChars: [%payloadSearchTerms%]\n" :
        "";
    const attTermsClause = attTerms.length > 0 ?
        "         withScopes: [%attSearchTerms%]\n" :
        "";
    return (
        "{" +
        '  docSet(id:"%docSetId%") {\n' +
        "    documents(" +
        "         sortedBy:\"paratext\"" +
        "         allChars: true " +
        payloadTermsClause +
        "         allScopes: true " +
        attTermsClause +
        "         ) {\n" +
        '           bookCode: header(id:"bookCode") ' +
        "         }\n" +
        "       }\n" +
        "}"
    ).replace('%docSetId%', currentDocSet)
        .replace(
            '%payloadSearchTerms%',
            payloadTerms
                .map(st => `"""${st}"""`)
                .join(", ")
        )
        .replace(
            '%attSearchTerms%',
            attTerms
                .map(st => `"""attribute/${st[0].startsWith('x-') ? 'milestone' : 'spanWithAtts'}/${st[0].startsWith('x-') ? 'zaln' : 'w'}/${st[0]}/0/${st[1]}"""`)
                .join(", ")
        )
}

export default textSearchDocumentQuery;
