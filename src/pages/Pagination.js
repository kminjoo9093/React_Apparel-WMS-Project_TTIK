import { useState } from "react";

function Pagination({targetList, postsPerPage, currentPage, setCurrentPage}){
    // const [currentPage, setCurrentPage] = useState(1);
    // const postsPerPage = 10; // 한페이지에 10개씩

    const totalPages = Math.ceil(targetList.length / postsPerPage);

    if (totalPages === 0) return null;

    const handlePageChange = (page) => setCurrentPage(page);

    return (
            <div className="pagination" style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={{
                    padding: "5px 10px",
                    backgroundColor: page === currentPage ? "#333" : "#fff",
                    color: page === currentPage ? "#fff" : "#333",
                    border: "1px solid #ccc",
                    cursor: "pointer"
                    }}
                >
                    {page}
                </button>
                ))}
            </div>
    )
}

export default Pagination;