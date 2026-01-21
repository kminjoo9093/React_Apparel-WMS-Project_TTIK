import React, { useState, useEffect } from 'react';
import stylePlans from "../../css/plarns.module.css";
import PlanRegister from './PlanRegister';
import serverUrl from "../../db/server.json";
import { useLocation, useNavigate } from 'react-router-dom';

function StockPlans() {
    const navigate = useNavigate();
    const location = useLocation(); // useState보다 위에 선언해야 초기값으로 사용 가능합니다.

    // 1. 초기값 설정: 상세페이지에서 뒤로가기 시 전달한 activeTab 확인, 없으면 "InBound"
    const [plansType, setPlansType] = useState(location.state?.activeTab || "InBound");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inboundList, setInboundList] = useState([]);
    const [outboundList, setOutboundList] = useState([]);
    const [loading, setLoading] = useState(false);
    const SERVER_URL = serverUrl.SERVER_URL;
    
    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 5;

    // 데이터 호출 함수
    const fetchStockPlanList = async () => {
        if (!plansType) return;
        setLoading(true);
        try {
            const endpoint = plansType === "InBound" ? "inbound" : "outbound";
            const response = await fetch(`${SERVER_URL}/ttik/${endpoint}/list`);
            if (!response.ok) throw new Error('서버 응답 에러.');

            const data = await response.json();
            console.log(`${plansType} 데이터 로드:`, data);

            if (plansType === "InBound") setInboundList(data);
            else setOutboundList(data);
        } catch (error) {
            console.error(`${plansType} 로드 에러:`, error);
        } finally {
            setLoading(false);
        }
    };
    
    // 탭(plansType)이 변경될 때마다 데이터 재호출
    useEffect(() => {
        fetchStockPlanList();
    }, [plansType]);

    const handleTypeChange = (type) => {
        setPlansType(type);
        setCurrentPage(1); // 타입 변경 시 첫 페이지로 리셋
    };

    // --- 페이지네이션 로직 ---
    const currentList = plansType === "InBound" ? inboundList : outboundList;
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = currentList.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(currentList.length / postsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    

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
                    <div>
                        <div>
                            <h3>{plansType === "InBound" ? "📦 입고 예정 목록" : "🚚 출고 예정 목록"}</h3>
                        </div>

                        <table className={stylePlans.plansTable}>
                            <thead>
                                <tr>
                                    <th>순번</th>
                                    <th>날짜</th>
                                    <th>{plansType === "InBound" ? "입고처" : "출고처"}</th>
                                    <th>상품명</th>
                                    <th>수량</th>
                                    <th>단가</th>
                                    <th>총액</th>
                                    <th>상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="8" style={{textAlign:'center', padding:'2rem'}}>데이터를 불러오는 중입니다...</td></tr>
                                ) : currentPosts.length > 0 ? (
                                    currentPosts.map((item, index) => {
                                        const date = item.IN_PLAN_DATE || item.OUT_PLAN_DATE || item.PLAN_YMD;
                                        const target = item.BRAND_NM || item.PARTNER_NM || item.PARTNER_SN;
                                        const product = item.GDS_NM || item.GDS_CD;
                                        const price = item.UNTPRC || 0;
                                        const qty = plansType === "InBound" 
                                            ? (item.TOTAL_EA_QTY || 0) 
                                            : (item.OUT_PLAN_QTY || item.GDS_QTY || 0);

                                        const boxCount = item.BOX_COUNT || 1;

                                        return (
                                            <tr 
                                                key={item.IN_PLAN_SN || item.OUT_PLAN_SN || index} 
                                                onClick={() => {
                                                    // 1. 우선순위 1: API에서 직접 내려주는 GDS_CD 확인
                                                    let productCode = item.GDS_CD || item.gdsCd;

                                                    // 2. 우선순위 2: GDS_CD가 없다면 BOX_LIST에서 추출 
                                                    if (!productCode && item.BOX_LIST) {
                                                        const firstBox = item.BOX_LIST.split(',')[0].trim();
                                                        const parts = firstBox.split('-');
                                                        if (parts.length >= 3) {
                                                            productCode = parts.slice(0, 3).join('-');
                                                        }
                                                    }
                                                    // 3. 우선순위 3: 그 외 BOX_CD 확인
                                                    if (!productCode && item.BOX_CD) {
                                                        productCode = item.BOX_CD.split('-').slice(0, 3).join('-');
                                                    }

                                                    console.log("최종 추출된 상품코드:", productCode);

                                                    if (!productCode || productCode === "undefined") {
                                                        alert(`상품 코드를 인식할 수 없습니다.`);
                                                        return;
                                                    }
                                                    
                                                    // 상세 페이지로 이동
                                                    navigate(`/stock/plans/${productCode}`, { 
                                                        state: { type: plansType } 
                                                    });
                                                }}
                                                style={{ cursor: 'pointer' }}
                                                className={stylePlans.tableRow}
                                            >
                                            {/* <tr key={item.IN_PLAN_SN || item.OUT_PLAN_SN || index}> */}
                                                <td>{index + 1 + (currentPage - 1) * postsPerPage}</td>
                                                <td>{date}</td>
                                                <td>{target}</td>
                                                <td>{product}</td>
                                                {/* <td>0 / {qty.toLocaleString()}</td>  */}
                                                <td>{0}/{qty.toLocaleString()}</td>
                                                <td>{price.toLocaleString()}</td>
                                                <td>{(qty * price).toLocaleString()}</td>
                                                <td>
                                                    <span className={stylePlans.statusBadge}>
                                                        {0 === qty ? '완료' : '대기'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan="8" style={{textAlign:'center', padding:'2rem'}}>조회된 내역이 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>

                        {/* --- 페이지네이션 UI --- */}
                        {currentList.length > 0 && (
                            <div className={stylePlans.pagination}>
                                <button 
                                    className={stylePlans.pageMoveBtn}
                                    disabled={currentPage === 1}
                                    onClick={() => paginate(currentPage - 1)}
                                >
                                    &lt;
                                </button>
                                
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => paginate(i + 1)}
                                        className={`${stylePlans.pageNumber} ${currentPage === i + 1 ? stylePlans.activePage : ''}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                
                                <button 
                                    className={stylePlans.pageMoveBtn}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    onClick={() => paginate(currentPage + 1)}
                                >
                                    &gt;
                                </button>
                            </div>
                        )}
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