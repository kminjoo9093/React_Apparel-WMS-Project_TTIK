import React, { useState, useEffect } from 'react';
import stylePlans from "../../css/plarns.module.css";
import PlanRegister from './PlanRegister';
import { useNavigate } from 'react-router-dom';

function StockPlans() {
    const [plansType, setPlansType] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inboundList, setInboundList] = useState([]);
    const [outboundList, setOutboundList] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 5;

    // 데이터 호출 함수
    const fetchStockPlanList = async () => {
        if (!plansType) return;
        setLoading(true);
        try {
            const endpoint = plansType === "InBound" ? "inbound" : "outbound";
            const response = await fetch(`https://localhost:3001/ttik/${endpoint}/list`);
            if (!response.ok) throw new Error('서버 응답 에러.');

            const data = await response.json();
            console.log("받아온 데이터:", data); // 데이터 구조 확인용

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
    }, [plansType]);

    const handleTypeChange = (type) => {
        setPlansType(type);
        setCurrentPage(1);
    };

    // 현재 표시할 리스트 선택
    const currentList = plansType === "InBound" ? inboundList : outboundList;

    return (
        <div>
            <h1 className={stylePlans.plansTitle}>Stock Plans</h1>
            <p className={stylePlans.plansSubTitle}>입·출고 예정을 확인하고 관리하세요.</p>
            
            <div className={stylePlans.plansListbox}>
                <div className={stylePlans.buttonGroup}>
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
                    <button 
                        style={{backgroundColor: "var(--primary-color)", color:"white"}} 
                        className={stylePlans.plansBtn}
                        onClick={()=> navigate("qr/print")}
                    >
                        🖨️ QR코드 인쇄
                    </button>
                </div>
                

                {plansType ? (
                    <div className={stylePlans.tableContainer}>
                        <div className={stylePlans.tableHeader}>
                            <h3>{plansType === "InBound" ? "📦 입고 예정 목록" : "🚚 출고 예정 목록"}</h3>
                        </div>

                        <table className={stylePlans.dataTable}>
                            <thead>
                                <tr>
                                    <th>순번</th>
                                    <th>날짜</th>
                                    <th>{plansType === "InBound" ? "입고처" : "출고처"}</th>
                                    <th>상품명</th>
                                    <th>예정수량</th>
                                    <th>단가</th>
                                    <th>총액</th>
                                    <th>상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="8">데이터를 불러오는 중입니다...</td></tr>
                                ) : currentList.length > 0 ? (
                                    currentList.map((item, index) => {
                                        // 💡 리액트에서 서버 데이터(대문자)를 변수에 매핑
                                        const date = item.IN_PLAN_DATE || item.OUT_PLAN_DATE || item.PLAN_YMD;
                                        const target = item.BRAND_NM || item.PARTNER_NM || item.PARTNER_SN;
                                        const product = item.GDS_NM || item.GDS_CD;
                                        const qty = item.IN_PLAN_QTY || item.OUT_PLAN_QTY || item.GDS_QTY || 0;
                                        const price = item.UNTPRC || 0;

                                        return (
                                            <tr key={item.IN_PLAN_SN || item.OUT_PLAN_SN || index}>
                                                <td>{index + 1 + (currentPage - 1) * postsPerPage}</td>
                                                <td>{date}</td>
                                                <td>{target}</td>
                                                <td>{product}</td>
                                                <td>{qty.toLocaleString()}</td>
                                                <td>{price.toLocaleString()}</td>
                                                <td>{(qty * price).toLocaleString()}</td>
                                                <td>
                                                    <span className={stylePlans.statusBadge}>
                                                        {item.BOX_CD ? '대기' : '완료'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan="8">조회된 내역이 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={stylePlans.emptyState}>
                        <p>상단의 버튼을 클릭하여 입고 또는 출고 내역을 확인하세요.</p>
                    </div>
                )}
            </div>

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