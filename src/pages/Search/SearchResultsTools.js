import {IonButton, IonIcon, IonTitle} from "@ionic/react";
import {arrowBack, arrowForward} from "ionicons/icons";
import React from "react";

const SearchResultTools = (
    {
        resultsPage,
        setResultsPage,
        nResultsPerPage,
        resultParaRecords,
        booksToSearch,
        setSearchAllBooks
    }
) => <IonTitle>
    <IonButton
        fill="clear"
        color="secondary"
        disabled={resultsPage === 0}
        onClick={() => setResultsPage(resultsPage - 1)}
    >{
        <IonIcon icon={arrowBack}/>
    }</IonButton>
    {`
        ${(resultsPage * nResultsPerPage) + 1}-${Math.min((resultsPage * nResultsPerPage) + nResultsPerPage, resultParaRecords.length)}
                                    of
                                    ${booksToSearch.length > 0 ? 'at least' : ""}
                                    ${resultParaRecords.length} result${resultParaRecords.length !== 1 ? 's' : ''}
                                    `}
                                    {
        booksToSearch.length > 0 ?
            <span
                onClick={() => setSearchAllBooks(true)}>{` (${booksToSearch.length} unsearched book${booksToSearch.length === 1 ? '' : 's'})`}</span> :
            ''
    }
    <IonButton
        fill="clear"
        color="secondary"
        disabled={booksToSearch.length === 0 && (resultsPage * nResultsPerPage) + nResultsPerPage >= resultParaRecords.length}
        onClick={() => setResultsPage(resultsPage + 1)}
    >{
        <IonIcon icon={arrowForward}/>
    }</IonButton>
</IonTitle>

export default SearchResultTools;
