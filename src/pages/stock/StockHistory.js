import React, { useState, useEffect } from 'react';
import styleHistory from "../../css/History.module.css";
import serverUrl from "../../db/server.json";

function StockHistory() {
    // 1. 상태 선언 (반드시 컴포넌트 내부)
    const [startDate, setStartDate] = useState(''); 
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [historyList, setHistoryList] = useState([]);
    const [loading, setLoading] = useState(false);
    const SERVER_URL = serverUrl.SERVER_URL;

    // 2. 검색 핸들러
    const handleSearch = async () => {
        setLoading(true);
        try {
            // 서버에 날짜와 검색어를 포함하여 요청
            const response = await fetch(`${SERVER_URL}/ttik/history/list?startDate=${startDate}&endDate=${endDate}&search=${searchTerm}`, {
                method: 'GET',
                credentials: 'include'
            }); 
            const data = await response.json();
            setHistoryList(data);
        } catch (error) {
            console.error("이력 로드 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    // 3. 페이지 로드 시 초기 데이터 가져오기
    useEffect(() => {
        handleSearch();
    }, []);

    return (
        <div>
            <h1 className={styleHistory.HistoryTitle}>Stock History</h1>
            <p className={styleHistory.HistorySubTitle}>입·출고 이력을 확인하세요.</p>
            
            <div className={styleHistory.HistoryListbox}>
                <div className={styleHistory.searchBox}>
                    {/* 왼쪽: 날짜 영역 */}
                    <div className={styleHistory.dateGroup}>
                        <label>날짜</label>
                        <input
                            className={styleHistory.dateInput}
                            type='date'
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span className={styleHistory.dash}>~</span>
                        <input
                            className={styleHistory.dateInput}
                            type='date'
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    {/* 오른쪽: 상품 검색 영역 */}
                    <div className={styleHistory.searchInput}>
                        <label>상품 검색</label>
                        <input 
                            type="text"
                            placeholder="상품명 또는 코드를 입력하세요."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} // 엔터키 검색
                        />
                        <button className={styleHistory.HistoryBtn} onClick={handleSearch}>검색</button>
                    </div>   
                </div>

                <table className={styleHistory.HistoryTable}>
                    <thead>
                        <tr>
                            <th>구분</th>
                            <th>날짜</th>
                            <th>시간</th>
                            <th>거래처</th>
                            <th>상품명</th>
                            <th>수량</th>
                            <th>단가</th>
                            <th>총액</th>
                            <th>재고</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="10">데이터를 불러오는 중입니다...</td></tr>
                        ) : historyList.length > 0 ? (
                            historyList.map((item) => (
                                <tr key={item.id} className={styleHistory.tableRow}>
                                    <td className={item.type === 0 ? styleHistory.in : styleHistory.out}>
                                        {item.type === 0 ? "입고" : "출고"}
                                    </td>
                                    <td>{item.date}</td>
                                    <td>{item.time}</td>
                                    <td>{item.target_name}</td>
                                    <td>{item.item_name}</td>
                                    <td className={styleHistory.num}>{item.quantity?.toLocaleString()}</td>
                                    <td className={styleHistory.num}>{item.unit_price?.toLocaleString()}</td>
                                    <td className={styleHistory.num}>{item.total_price?.toLocaleString()}</td>
                                    <td className={styleHistory.num}>{item.current_stock?.toLocaleString()}</td>
                                    <td>
                                        <span className={`${styleHistory.statusBadge} ${styleHistory[`status${item.status}`]}`}>
                                            {item.status === 0 ? "완료" : item.status === 1 ? "반품" : "취소"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="10">데이터가 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default StockHistory;