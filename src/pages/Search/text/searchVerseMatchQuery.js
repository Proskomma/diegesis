const searchVerseMatchQuery =
    (
         currentDocSet,
         bookToSearch,
         payloadSearchTerms,
         attSearchTerms
     ) => {
    const payloadTermsClause = payloadSearchTerms && payloadSearchTerms.length > 0 ?
        "         withMatchingChars: [%payloadSearchTerms%]\n" :
        "";
    const attTermsClause = attSearchTerms && attSearchTerms.length > 0 ?
        "         withScopes: [%attSearchTerms%]\n" :
        "";
    const ret = ("{\n" +
        '  docSet(id:"%docSetId%") {\n' +
        "    document(\n" +
        '      bookCode:"%bookCode%" \n' +
        "    ) {\n" +
        "      id\n" +
        '      bookCode: header(id: "bookCode")\n' +
        '      title: header(id: "toc2")\n' +
        "      cvMatching(\n" +
        "        allChars : true\n" +
        "        allScopes : true\n" +
        payloadTermsClause +
        attTermsClause +
        "      ) {\n" +
        "        scopeLabels\n" +
        "        text\n" +
        "        tokens {\n" +
        "          subType\n" +
        "          payload\n" +
        "          scopes(\n" +
        "            startsWith:[\n" +
        "              \"attribute/spanWithAtts/w/\"\n" +
        "              \"attribute/milestone/zaln/\"\n" +
        "            ]\n" +
        "          )\n" +
        "        }\n" +
        "      }\n" +
        "    }\n" +
        '    matches: enumRegexIndexesForString (enumType:"wordLike" searchRegex:"%searchTermsRegex%") { matched }\n' +
        "  }\n" +
        "}"
    ).replace('%docSetId%', currentDocSet)
        .replace('%bookCode%', bookToSearch)
        .replace(
            '%payloadSearchTerms%',
            (payloadSearchTerms || [])
                .map(st => `"""${st.toLowerCase()}"""`)
                .join(", ")
        )
        .replace(
            '%attSearchTerms%',
            (attSearchTerms || [])
                .map(st => st[0].startsWith('x-') ? `"""attribute/milestone/zaln/${st[0]}/0/${st[1]}"""` : `"""attribute/spanWithAtts/w/${st[0]}/0/${st[1]}"""`)
                .join(", ")
        )
        .replace(
            '%searchTermsRegex%',
            (payloadSearchTerms && payloadSearchTerms.length > 0) ?
                payloadSearchTerms
                    .map(st => `(${st})`)
                    .join('|') :
                "xxxxx"
        );
    return ret;
}

export default searchVerseMatchQuery;
