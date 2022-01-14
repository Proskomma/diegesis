import {IonCol, IonRow, IonText} from "@ionic/react";
import {Link} from "react-router-dom";
import React from "react";

const textResultCellContent = (
    resultParaRecords,
    resultsPage,
    nResultsPerPage,
    setWordDetails,
    attSearchTerms,
    setCurrentBookCode,
    setSelectedChapter,
    setSelectedVerses,
) => {
    const jumpToVerse = (book, chapter, verses) => {
        setCurrentBookCode(book);
        setSelectedChapter(chapter);
        setSelectedVerses(verses);
    }

    return resultParaRecords
        .slice(resultsPage * nResultsPerPage, (resultsPage * nResultsPerPage) + nResultsPerPage)
        .map(
            (rr, n) => {
                if (!rr || !rr.verses) {
                    return '';
                }
                const fromVerse = Math.min(...rr.verses);
                const toVerse = Math.max(...rr.verses);
                return <IonRow key={n}>
                    <IonCol size={1}
                            style={{fontSize: "smaller", fontWeight: "bold"}}>
                        {`${rr.book} ${rr.chapter}:${fromVerse}`}
                        {toVerse > fromVerse && `-${toVerse}`}
                    </IonCol>
                    <IonCol size={11}>
                        {
                            rr.itemGroups
                                .map(
                                    (ig, n) =>
                                        <span key={n}>
                                                                            <Link
                                                                                to="/browse"
                                                                                onClick={
                                                                                    () => jumpToVerse(
                                                                                        rr.book,
                                                                                        rr.chapter,
                                                                                        ig.scopeLabels.filter(s => s.startsWith('verses/'))[0].split('/')[1]
                                                                                    )
                                                                                }
                                                                                className="verseNumber">{
                                                                                ig.scopeLabels.filter(s => s.startsWith('verses/'))[0].split('/')[1]
                                                                            }</Link>
                                            {
                                                ig.tokens.map(
                                                    (t, n) =>
                                                        t.subType === 'wordLike' ?
                                                            <span
                                                                key={n}
                                                                onClick={
                                                                    () => {
                                                                        setWordDetails({
                                                                            ...t,
                                                                            book: rr.book,
                                                                            chapter: rr.chapter,
                                                                            verse: ig.scopeLabels[0].split('/')[1]
                                                                        });
                                                                    }
                                                                }
                                                            >
                                                                                                {
                                                                                                    t.subType === 'wordLike' ?
                                                                                                        rr.matches.includes(t.payload) ?
                                                                                                            <IonText
                                                                                                                color="primary"
                                                                                                                key={n}>
                                                                                                                {t.payload}
                                                                                                            </IonText> :
                                                                                                            t.scopes.filter(s => attSearchTerms.map(st => st[1]).includes(s.split('/')[5])).length > 0 ?
                                                                                                                <IonText
                                                                                                                    color="secondary"
                                                                                                                    key={n}>
                                                                                                                    {t.payload}
                                                                                                                </IonText> :
                                                                                                                t.payload :
                                                                                                        t.payload
                                                                                                }
                                                                                            </span>
                                                            :
                                                            t.payload
                                                )
                                            }
                                                                        </span>
                                )
                        }
                    </IonCol>
                </IonRow>;
            }
        );
}

export default textResultCellContent;
