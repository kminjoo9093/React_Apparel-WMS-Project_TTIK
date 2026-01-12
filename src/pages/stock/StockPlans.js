import React, { useState, useEffect } from 'react';
import stylePlans from "../../css/plarns.module.css";
import PlanRegister from './PlanRegister';

function StockPlans() {
    const [plansType, setPlansType] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inboundList, setInboundList] = useState([]);
    const [outboundList, setOutboundList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;

    const fetchStockPlanList = async () => {
        if (!plansType) return;

        setLoading(true);
        try {
            const endpoint = plansType === "InBound" ? "inbound" : "outbound";
            const response = await fetch(`http://localhost:3001/ttik/${endpoint}/list`);

            if (!response.ok) throw new Error('서버 응답 에러.');

            const data = await response.json();
            
            if (plansType === "InBound") setInboundList(data);
            else setOutboundList(data);

        } catch (error) {
            console.error(`${plansType} 로드 에러:`, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStockPlanList();
    }, [plansType, currentPage]);

    const handleTypeChange = (type) => {
        setPlansType(type);
        setCurrentPage(1);
    };

    const currentList = plansType === "InBound" ? inboundList : outboundList;

    return (
        <div>
            <h1 className={stylePlans.plansTitle}>Stock Plans</h1>
            <p className={stylePlans.plansSubTitle}>입·출고 예정을 확인하고 관리하세요.</p>
            
            <div className={stylePlans.plansListbox}>
                <div>
                    <button 
                        className={`${stylePlans.plansBtn} ${plansType === 'InBound' ? stylePlans.active : ''}`} 
                        onClick={() => handleTypeChange("InBound")}
                    >
                        입고 예정 조회
                    </button>
                    <button 
                        className={`${stylePlans.plansBtn} ${plansType === 'OutBound' ? stylePlans.active : ''}`} 
                        onClick={() => handleTypeChange("OutBound")}
                    >
                        출고 예정 조회
                    </button>
                    <button
                        style={plansType === null ? { display: 'none' } : {}}
                        className={stylePlans.plansBtn} 
                        onClick={() => setIsModalOpen(true)}
                    >
                        + 새 일정 등록
                    </button>
                </div>


                {/* 테이블 영역 */}
                {plansType ? (
                    <div className={stylePlans.tableContainer}>
                        <div className={stylePlans.tableHeader}>
                            <h3>{plansType === "InBound" ? "📦 입고 예정 목록" : "🚚 출고 예정 목록"}</h3>
                        </div>

                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>번호</th>
                                    <th>날짜</th>
                                    <th>품목명</th>
                                    <th>수량</th>
                                    <th>{plansType === "InBound" ? "입고처" : "출고처"}</th>
                                    <th>상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6">데이터를 불러오는 중입니다...</td></tr>
                                ) : currentList.length > 0 ? (
                                    currentList.map((item, index) => (
                                        <tr key={item.id || index}>
                                            <td>{index + 1 + (currentPage - 1) * postsPerPage}</td>
                                            <td>{item.date}</td>
                                            <td>{item.itemName}</td>
                                            <td>{item.quantity?.toLocaleString()}</td>
                                            <td>{plansType === "InBound" ? item.supplier : item.customer}</td>
                                            <td>
                                                <span className={stylePlans.statusBadge}>{item.status}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6">조회된 내역이 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div>
                        <p>상단의 버튼을 클릭하여 입고 또는 출고 내역을 확인하세요.</p>
                    </div>
                )}
            </div>

            {/* 모달 컴포넌트 */}
            {isModalOpen && (
                <PlanRegister 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onRegisterSuccess={fetchStockPlanList}
                    currentType={plansType}
                />
            )}
        </div>
    );
}

export default StockPlans;