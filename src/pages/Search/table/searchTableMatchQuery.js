const searchTableMatchQuery = (
    tableSearchTerms,
    currentDocSet,
    bookToSearch
) => {
    const matches = '[' + tableSearchTerms.map(tst => `{colN:${tst[1]} matching:"${tst[0] === '=' ? '^' : ''}${tst[2]}${tst[0] === '=' ? '$' : ''}"}`).join(', ') + ']';
    return `{
                          docSet(id:"%docSetId%") {
                            document(bookCode:"%bookCode%") {
                              bookCode: header(id: "bookCode")
                              tableSequences {
                                headings
                                rows(matches:%matches%) {
                                  rows
                                  text
                                }
                              }
                            }
                          }
                        }`
        .replace(/%docSetId%/g, currentDocSet)
        .replace(/%bookCode%/g, bookToSearch)
        .replace(/%matches%/g, matches);
}

export default searchTableMatchQuery;
