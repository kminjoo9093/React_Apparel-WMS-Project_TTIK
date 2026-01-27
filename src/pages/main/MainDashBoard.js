import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styleMainDashBoard from '../../css/MainDashboard.module.css';
import StatCard from '../../components/StatCard';
import serverUrl from "../../db/server.json";
import { useNavigate } from 'react-router-dom';

const MainDashboard = ({ user }) => { // Ttik.js에서 넘겨준 user 객체 수신
  // 권한에 따른 초기 창고 설정 (ALL 권한이 아니면 본인 담당 창고로 고정)
  const initialStorage = user?.tkcgStorage === 'ALL' ? 'ALL' : user?.tkcgStorage;

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalTrend: 0,
    inStockProducts: 0,
    inStockTrend: 0,
    lowStockProducts: 0,
    lowStockTrend: 0
  });

  const [selectedStorage, setSelectedStorage] = useState(initialStorage);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const SERVER_URL = serverUrl.SERVER_URL;
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/ttik/dashboard/stats`, {
        params: { storageName: selectedStorage },
        withCredentials: true // 이 부분이 있어야 쿠키(로그인 세션)가 서버로 전달됩니다!
      });
      setStats(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("데이터 동기화 실패:", error);
    }
  }, [SERVER_URL, selectedStorage]);

  useEffect(() => {
    fetchStats();
    const intervalId = setInterval(fetchStats, 10000);
    return () => clearInterval(intervalId); 
  }, [fetchStats]);

  return (
    <div className={styleMainDashBoard.modernDashboard}>
      <div className={styleMainDashBoard.welcomeSection}>
        <div className={styleMainDashBoard.welcomeFlex}>
          <div>
            <h1>Overview</h1>
            <p>
              {selectedStorage === 'ALL' ? '실시간 통합 재고 현황' : `${selectedStorage} 창고 실시간 현황`}을 확인하세요.
            </p>
            <p className={styleMainDashBoard.updateTime}>(최근 업데이트: {lastUpdated.toLocaleTimeString()})</p>
          </div>

          {/* 창고 선택 탭: 'ALL' 권한자에게만 모든 탭을 보여줍니다. */}
          <div className={styleMainDashBoard.storageTabs}>
            {user?.tkcgStorage === 'ALL' ? (
              // 1. 전체 관리자인 경우: 모든 탭 노출
              ['ALL', 'A', 'B'].map((type) => (
                <button
                  key={type}
                  className={`${styleMainDashBoard.tabBtn} ${selectedStorage === type ? styleMainDashBoard.activeTab : ''}`}
                  onClick={() => setSelectedStorage(type)}
                >
                  {type === 'ALL' ? '전체' : `${type} 창고`}
                </button>
              ))
            ) : (
              // 2. 창고 관리자인 경우: 본인 창고 탭만 활성화된 상태로 고정 노출
              <button className={`${styleMainDashBoard.tabBtn} ${styleMainDashBoard.activeTab}`}>
                {user?.tkcgStorage} 창고
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styleMainDashBoard.statsGrid}>
        <StatCard title="전체 등록 상품" value={stats.totalProducts} unit="건" trend={stats.totalTrend} />
        <StatCard title="현재 재고 보유" value={stats.inStockProducts} unit="건" trend={stats.inStockTrend} />
        <StatCard title="재고 부족 품목" value={stats.lowStockProducts} unit="건" trend={stats.lowStockTrend} isWarning={true} />
      </div>

      <div className={styleMainDashBoard.contentGrid}>
        <div className={styleMainDashBoard.dataPanel}>
          <div className={styleMainDashBoard.panelHeader}>
            <h3>최근 입고 현황</h3>
            <button className={styleMainDashBoard.viewAll} onClick={() => navigate("/stock/history")}>전체보기</button>
          </div>
          <div className={styleMainDashBoard.customList}>
            {/* 실제 구현 시 최근 입고 목록도 selectedStorage에 따라 서버에서 받아와야 합니다. */}
            {[1, 2, 3].map((i) => (
              <div key={`in-${i}`} className={styleMainDashBoard.listItem}>
                <div className={styleMainDashBoard.itemInfo}>
                  <span className={styleMainDashBoard.itemName}>샘플 상품 {i}</span>
                  <span className={styleMainDashBoard.itemDate}>2026.1.02 14:20</span>
                </div>
                <span className={styleMainDashBoard.itemQtyPlus}>+15</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styleMainDashBoard.dataPanel}>
          <div className={styleMainDashBoard.panelHeader}>
            <h3>최근 출고 현황</h3>
            <button className={styleMainDashBoard.viewAll} onClick={() => navigate("/stock/history")}>전체보기</button>
          </div>
          <div className={styleMainDashBoard.customList}>
            {[1, 2].map((i) => (
              <div key={`out-${i}`} className={styleMainDashBoard.listItem}>
                <div className={styleMainDashBoard.itemInfo}>
                  <span className={styleMainDashBoard.itemName}>샘플 상품 {i}</span>
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