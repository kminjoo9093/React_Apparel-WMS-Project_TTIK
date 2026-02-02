import React, { useState, useEffect } from 'react';
import styleHistory from "../../css/History.module.css";
import serverUrl from "../../db/server.json";
import Modal from '../../components/Modal';

function StockHistory() {
    // 날짜 상태는 유지하되, 이번 요구사항에 따라 검색 시에는 필수로 쓰지 않도록 처리
    const [searchTerm, setSearchTerm] = useState('');
    const [historyList, setHistoryList] = useState([]);
    const [loading, setLoading] = useState(false);
    const SERVER_URL = serverUrl.SERVER_URL;
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
    const closeModal = () => setModal({ ...modal, isOpen: false });

    // 검색 핸들러
    const handleSearch = async () => {
        // 개별 아이템 코드로만 검색하기로 했으므로 검색어 체크
        if (!searchTerm.trim()) {
            // 초기 로딩 시(useEffect)에는 경고창을 띄우지 않기 위해 조건부 처리
            return;
        }

        setLoading(true);
        try {
            // 날짜 파라미터는 보내되, 빈 값으로 보내서 백엔드 XML의 <if>문에서 걸러지게 함
            const response = await fetch(
                `${SERVER_URL}/ttik/history/list?search=${searchTerm}`,
                { method: 'GET', credentials: 'include' }
            );

            if (!response.ok) {
                throw new Error(`서버 에러: ${response.status}`);
            }

            const data = await response.json();
            setHistoryList(data);
        } catch (error) {
            console.error("이력 로드 실패:", error);
            setModal({
                isOpen: true,
                title: 'Error',
                message: '이력을 불러오는 중 오류가 발생했습니다. (백엔드 로그 확인 필요)',
                onConfirm: closeModal
            });
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 실행 (초기값이 없을 때는 실행하지 않거나 기본값 설정 가능)
    useEffect(() => {
        if(searchTerm) handleSearch();
    }, []);

    return (
        <>
        <Modal
            {...modal} 
        />
        <div className={styleHistory.HistoryContainer}>
            <h1 className={styleHistory.HistoryTitle}>Stock History</h1>
            <p className={styleHistory.HistorySubTitle}>상품 이력을 확인하세요.</p>
            
            <div className={styleHistory.HistoryListbox}>
                {/* 검색 영역 */}
                <div className={styleHistory.searchBox}>
                    <div className={styleHistory.searchInput}>
                        <input 
                            type="text"
                            placeholder="상품 및 박스 코드를 입력하세요"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button className={styleHistory.HistoryBtn} onClick={handleSearch}>조회</button>
                    </div>   
                </div>

                {/* 타임라인 영역 (정의서 3번 영역) */}
                <div className={styleHistory.timelineContainer}>
                    {loading ? (
                        <div className={styleHistory.loadingText}>데이터를 불러오는 중입니다...</div>
                    ) : historyList.length > 0 ? (
                        historyList.map((item) => (
                            <div key={item.id} className={styleHistory.timelineItem}>
                                <div className={`${styleHistory.timelineDot} ${item.type === 0 ? styleHistory.inDot : styleHistory.outDot}`}></div>
                                
                                {/* 오른쪽 내용 박스 */}
                                <div className={styleHistory.timelineContent}>
                                    <div className={styleHistory.contentTop}>
                                        <span className={item.type === 0 ? styleHistory.inBadge : styleHistory.outBadge}>
                                            처리일 - 
                                        </span>
                                        <span className={styleHistory.timeText}>
                                            {item.date} / {item.time}
                                        </span>
                                    </div>

                                    {/* {item.remark.includes('입고') && (
                                        <span className={styleHistory.targetText}>
                                            거래처 {item.target_name}
                                        </span>
                                    )}


                                    {item.remark.includes('출고') && (
                                        <span className={styleHistory.targetText}>
                                            거래처 {item.target_name}
                                        </span>
                                    )} */}

                                    <div className={styleHistory.contentBottom}>
                                        <span className={styleHistory.remarkText}>
                                            {/* 비고(remark)에 저장된 창고 위치나 상세 상태 출력 */}
                                            {item.remark || "상세 내역 없음"}
                                            
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styleHistory.emptyText}>
                            {searchTerm ? "조회된 이력이 없습니다." : "검색어를 입력 해주세요"}
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
}

export default StockHistory;