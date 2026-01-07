import React, { useState, useEffect } from 'react';
import BrandRegister from './BrandRegister';
import styleBrand from "../../css/Brand.module.css";

function BrandList() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 브랜드 리스트 받아오기
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10; // 한페이지에 10개씩

    const [searchTerm, setSearchTerm] = useState(""); 
    const [selectedIds, setSelectedIds] = useState([]);

    const filteredBrands = brands.filter((brand) => {
        const nameMatch = brand.brandNm?.toLowerCase().includes(searchTerm.toLowerCase());
        const telMatch = brand.telNo?.includes(searchTerm);
        const brNoMatch = brand.brNo?.includes(searchTerm);
        return nameMatch || telMatch || brNoMatch;
    });

    const fetchBrandList = async () => {
        setLoading(true);
        try {

            const response = await fetch('http://localhost:3001/ttik/brand/list'); 
            
            const contentType = response.headers.get("content-type");
            
            if (!response.ok) {
                throw new Error('서버 응답 에러.');
            }

            const data = await response.json();
            console.log("성공! 서버 데이터:", data);
            setBrands(data);

        } catch (error) {
            console.error("Fetch 에러:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleDelete = async () => {
        if (selectedIds.length === 0) {
            alert("삭제할 브랜드를 선택해 주세요.");
            return;
        }

        if (window.confirm(`선택한 ${selectedIds.length}개의 브랜드를 삭제하시겠습니까?`)) {
            try {
                const response = await fetch('http://localhost:3001/ttik/brand/delete', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(selectedIds), 
                });

                if (response.ok) {
                    alert("삭제되었습니다.");
                    setBrands(prev => prev.filter(brand => !selectedIds.includes(brand.brandSn)));
                    setSelectedIds([]);
                } else {
                    alert("삭제 실패");
                }
            } catch (error) {
                console.error("삭제 에러:", error);
            }
        }
    };

    useEffect(() => {
        fetchBrandList();
        setSelectedIds([]);
    }, [currentPage]);

    const indexOfLast = currentPage * postsPerPage;
    const indexOfFirst = indexOfLast - postsPerPage;
    const currentBrands = filteredBrands.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredBrands.length / postsPerPage);

    const handlePageChange = (page) => setCurrentPage(page);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="container">
            <h1 className={styleBrand.brandTitle}>Brand</h1>
            <p className={styleBrand.brandSubTitle}>브랜드 관리</p>

            <div className={styleBrand.brandListbox}>
                <div className={styleBrand.searchBox}>
                    <label style={{fontWeight: "bold", marginLeft: "0.5rem"}}>브랜드 검색</label>
                    <input 
                        className={styleBrand.searchInput}
                        type="text"
                        placeholder="브랜드 정보 검색"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <button className={styleBrand.brandBtn} onClick={() => setIsModalOpen(true)} >브랜드 등록</button>
                    <button className={styleBrand.brandBtn} onClick={handleDelete} >삭제</button>
                </div>

                {/* 모달 컴포넌트 호출 */}
                <BrandRegister 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onRegisterSuccess={fetchBrandList}
                />

                <div className={styleBrand.tableContainer}>
                    {loading ? (
                        <p>로딩 중...</p>
                    ) : (
                        <table className={styleBrand.brandTable}>
                            <thead>
                                <tr>
                                    <th>선택</th>
                                    <th>브랜드명</th>
                                    <th>사업자번호</th>
                                    <th>연락처</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentBrands.length > 0 ? (
                                    currentBrands.map((brand, index) => (
                                        <tr key={brand.brandSn}>
                                            <td>
                                                <input 
                                                    type='checkbox' 
                                                    checked={selectedIds.includes(brand.brandSn)}
                                                    onChange={() => handleCheckboxChange(brand.brandSn)}
                                                />
                                            </td>
                                            <td className={styleBrand.brandNameCell}>
                                                <span>{brand.brandNm}</span>
                                            </td>
                                            <td>{brand.brNo}</td>
                                            <td>{brand.telNo}</td>

                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className={styleBrand.noData}>데이터가 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

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
            </div>
        </div>
    );
}

export default BrandList;