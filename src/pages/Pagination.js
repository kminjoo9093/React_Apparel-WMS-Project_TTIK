import { useState } from "react";
import styles from "../css/Pagination.module.css";

function Pagination({targetList, postsPerPage, currentPage, setCurrentPage, blockSize}){
    // const [currentPage, setCurrentPage] = useState(1);
    // const postsPerPage = 10; // 한페이지에 10개씩

    const totalPages = Math.ceil(targetList.length / postsPerPage);

    const currentBlock = Math.floor((currentPage - 1) / blockSize);
    const startPage = currentBlock * blockSize + 1;
    const endPage = Math.min(startPage + blockSize - 1, totalPages);

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

    if (totalPages === 0) return null;

    const goFirst = () =>{
        if( currentPage > 1 ) setCurrentPage(1);
    };
    const goPrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const goNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
    const goLast = () =>{
        if( currentPage < totalPages ) setCurrentPage(totalPages);
    };

    return (
            <div className={styles.paginationContainer}>
                <button onClick={goFirst} disabled={currentPage === 1}> {"<<"} </button>
                <button onClick={goPrev} disabled={currentPage === 1}>{"<"}</button>
                {pageNumbers.map((page) => (
                <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`${styles.pageButton} ${page === currentPage ? styles.activeButton : ""}`}
                >
                    {page}
                </button>
                ))}
                <button onClick={goNext} disabled={currentPage === totalPages}>{">"}</button>
                <button onClick={goLast} disabled={currentPage === totalPages}>{">>"}</button>
            </div>
    )
}

export default Pagination;