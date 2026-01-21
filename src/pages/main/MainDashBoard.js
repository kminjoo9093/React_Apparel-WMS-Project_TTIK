import { useState, useEffect } from 'react';
import axios from 'axios';
import styleMainDashBoard from '../../css/MainDashboard.module.css';
import StatCard from '../../components/StatCard';
import serverUrl from "../../db/server.json";
import { Link, useNavigate } from 'react-router-dom';

const MainDashboard = () => {
  // 1. 초기 상태값에 trend 필드 추가 (DTO 구조와 일치)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalTrend: 0,
    inStockProducts: 0,
    inStockTrend: 0,
    lowStockProducts: 0,
    lowStockTrend: 0
  });

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const SERVER_URL = serverUrl.SERVER_URL;
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/ttik/dashboard/stats`);
      // 백엔드에서 GDS_ENABLED='Y' 조건이 적용된 데이터를 받아옴
      setStats(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("데이터 동기화 실패:", error);
    }
  };

  useEffect(() => {
    fetchStats(); // 초기 로드

    const intervalId = setInterval(fetchStats, 10000); // 10초마다 갱신
    return () => clearInterval(intervalId); 
  }, []);



  return (
    <div className={styleMainDashBoard.modernDashboard}>
      <div className={styleMainDashBoard.welcomeSection}>
        <h1>Overview</h1>
        <p>실시간 재고 현황을 확인하세요.</p>
        <p>(최근 업데이트: {lastUpdated.toLocaleTimeString()})</p>
      </div>

     <div className={styleMainDashBoard.statsGrid}>
        <StatCard 
          title="전체 등록 상품" 
          value={stats.totalProducts} 
          unit="건"
          trend={stats.totalTrend} 
        />
        <StatCard 
          title="현재 재고 보유" 
          value={stats.inStockProducts} 
          unit="건"
          trend={stats.inStockTrend} 
        />
        <StatCard 
          title="재고 부족 품목" 
          value={stats.lowStockProducts} 
          unit="건" 
          trend={stats.lowStockTrend} 
          isWarning={true} 
        />
      </div>

      {/* 하단 상세 데이터 섹션 */}
      <div className={styleMainDashBoard.contentGrid}>
        {/* 최근 입고 현황 패널 */}
        <div className={styleMainDashBoard.dataPanel}>
          <div className={styleMainDashBoard.panelHeader}>
            <h3>최근 입고 현황</h3>
            <button className={styleMainDashBoard.viewAll} onClick={() => navigate("/productList")}>전체보기</button>
          </div>
          <div className={styleMainDashBoard.customList}>
            {[1, 2, 3].map((i) => (
              <div key={`in-${i}`} className={styleMainDashBoard.listItem}>
                <div className={styleMainDashBoard.itemInfo}>
                  <span className={styleMainDashBoard.itemName}>나이키 에어맥스 {i}</span>
                  <span className={styleMainDashBoard.itemDate}>2026.1.02 14:20</span>
                </div>
                <span className={styleMainDashBoard.itemQtyPlus}>+15</span>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 출고 현황 패널 */}
        <div className={styleMainDashBoard.dataPanel}>
          <div className={styleMainDashBoard.panelHeader}>
            <h3>최근 출고 현황</h3>
            <button className={styleMainDashBoard.viewAll}>전체보기</button>
          </div>
          <div className={styleMainDashBoard.customList}>
            {[1, 2].map((i) => (
              <div key={`out-${i}`} className={styleMainDashBoard.listItem}>
                <div className={styleMainDashBoard.itemInfo}>
                  <span className={styleMainDashBoard.itemName}>아디다스 비니 {i}</span>
                  <span className={styleMainDashBoard.itemDate}>2026.1.02 15:45</span>
                </div>
                <span className={styleMainDashBoard.itemQtyMinus}>-2</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;