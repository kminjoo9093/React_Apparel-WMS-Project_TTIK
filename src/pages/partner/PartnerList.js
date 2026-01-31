import React, { useState, useEffect } from 'react';
import PartnerRegister from './PartnerRegister';
import stylePartner from "../../css/Partner.module.css";
import serverUrl from "../../db/server.json";
import Modal from '../../components/Modal';

function PartnerList() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [partners, setPartners] = useState([]); // 변수명 소문자 권장
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
    const closeModal = () => setModal({ ...modal, isOpen: false });
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10; 

    const [searchTerm, setSearchTerm] = useState(""); 
    const [selectedIds, setSelectedIds] = useState([]);

    const SERVER_URL = serverUrl.SERVER_URL;

    // 1. 서버에서 목록 가져오기
    const fetchPartnerList = async () => {
        setLoading(true);
        try {
            // 보안 및 컨트롤러 매핑을 위해 소문자 '/ttik/partner/list' 사용
            const response = await fetch(`${SERVER_URL}/ttik/partner/list`, {
                method: 'GET',
                credentials: 'include', 
                headers: {
                    'Accept': 'application/json'
                }
            }); 
            if (!response.ok) throw new Error('서버 응답 에러.');
            const data = await response.json();
            setPartners(data);
        } catch (error) {
            console.error("Fetch 에러:", error);
        } finally {
            setLoading(false);
        }
    };

    // 처음 렌더링될 때 목록 호출
    useEffect(() => {
        fetchPartnerList();
    }, []);

    // 2. 검색 필터링 로직 (엔티티 필드명 partnerNm, telNo, brNo 사용)
    const filteredPartners = partners.filter((partner) => {
        const nameMatch = partner.partnerNm?.toLowerCase().includes(searchTerm.toLowerCase());
        const telMatch = partner.telNo?.includes(searchTerm);
        const brNoMatch = partner.brNo?.includes(searchTerm);
        return nameMatch || telMatch || brNoMatch;
    });

    // 3. 페이지네이션 계산 로직
    const indexOfLast = currentPage * postsPerPage;
    const indexOfFirst = indexOfLast - postsPerPage;
    const currentPartners = filteredPartners.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredPartners.length / postsPerPage);

    const handleCheckboxChange = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // 4. 삭제 로직
    const handleDelete = async () => {
        if (selectedIds.length === 0) {
            setModal({
                isOpen: true,
                title: 'Again',
                message: '삭제할 거래처를 선택해 주세요.',
                onConfirm: closeModal
            });  
            return;
        }
        if (window.confirm(`선택한 ${selectedIds.length}개의 거래처를 삭제하시겠습니까?`)) {
            try {
                const response = await fetch(`${SERVER_URL}/ttik/partner/delete`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(selectedIds), 
                });
                if (response.ok) {
                    setModal({
                        isOpen: true,
                        title: 'DELETE',
                        message: '삭제되었습니다.',
                        onConfirm: closeModal
                    }); 
                    // 서버를 다시 호출하는 대신 로컬 상태에서 즉시 제거 (성능 최적화)
                    setPartners(prev => prev.filter(p => !selectedIds.includes(p.partnerSn)));
                    setSelectedIds([]);
                } else {
                    setModal({
                        isOpen: true,
                        title: 'Error',
                        message: '삭제 실패',
                        onConfirm: closeModal
                    }); 
                }
            } catch (error) {
                console.error("삭제 에러:", error);
            }
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // 검색 시 1페이지로 리셋
    };

    return (
        <>
        <Modal
            {...modal} 
        />
        <div> 
            {/* CSS Module 클래스명은 소문자로 시작하는 파일 내용과 일치시킴 */}
            <h1 className={stylePartner.partnerTitle}>Partner</h1>
            <p className={stylePartner.partnerSubTitle}>거래처를 관리 하세요.</p>

            <div className={stylePartner.partnerListbox}>
                <div className={stylePartner.searchBox}>
                    <label style={{fontWeight: "bold", marginLeft: "0.5rem"}}>거래처 검색</label>
                    <input 
                        className={stylePartner.searchInput}
                        type="text"
                        placeholder="거래처 정보 검색"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <button className={stylePartner.partnerBtn} onClick={() => setIsModalOpen(true)} >거래처 등록</button>
                    <button className={stylePartner.partnerBtn} onClick={handleDelete} >삭제</button>
                </div>

                {/* 등록 모달 컴포넌트 */}
                <PartnerRegister 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onRegisterSuccess={fetchPartnerList}
                />

                <div className={stylePartner.tableContainer}>
                    {loading ? (
                        <p>로딩 중...</p>
                    ) : (
                        <table className={stylePartner.partnerTable}>
                            <thead>
                                <tr>
                                    <th>선택</th>
                                    <th>거래처명</th>
                                    <th>사업자번호</th>
                                    <th>연락처</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentPartners.length > 0 ? (
                                    currentPartners.map((partner) => (
                                        <tr key={partner.partnerSn}>
                                            <td>
                                                <input 
                                                    type='checkbox' 
                                                    checked={selectedIds.includes(partner.partnerSn)}
                                                    onChange={() => handleCheckboxChange(partner.partnerSn)}
                                                />
                                            </td>
                                            <td className={stylePartner.partnerNameCell}>
                                                <span>{partner.partnerNm}</span>
                                            </td>
                                            <td>{partner.brNo}</td>
                                            <td>{partner.telNo}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className={stylePartner.noData}>데이터가 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* 페이지네이션 UI */}
                {filteredPartners.length > 0 && (
                    <div className={stylePartner.pagination}>
                        <button 
                            className={stylePartner.pageMoveBtn}
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            &lt;
                        </button>
                        
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`${stylePartner.pageNumber} ${currentPage === i + 1 ? stylePartner.activePage : ''}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        
                        <button 
                            className={stylePartner.pageMoveBtn}
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </div>
        </div>
        </>
    );
}

export default PartnerList;