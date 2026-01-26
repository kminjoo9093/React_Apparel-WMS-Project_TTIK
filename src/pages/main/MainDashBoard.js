import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import styleMainDashBoard from '../../css/MainDashboard.module.css';
import StatCard from '../../components/StatCard';
import serverUrl from "../../db/server.json";
import { useNavigate } from 'react-router-dom';

const MainDashboard = ({ user }) => { 
  const isSpecialUser = user?.tkcgStorage === 'ALL' || user?.tkcgStorage === 'U';
  const initialStorage = isSpecialUser ? 'ALL' : user?.tkcgStorage;

  const [stats, setStats] = useState({
    totalProducts: 0, totalTrend: 0,
    inStockProducts: 0, inStockTrend: 0,
    lowStockProducts: 0, lowStockTrend: 0
  });

  const [storageList, setStorageList] = useState([]);
  const [rackData, setRackData] = useState([]);
  const [selectedStorage, setSelectedStorage] = useState(initialStorage);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const SERVER_URL = serverUrl.SERVER_URL;
  const navigate = useNavigate();

  const fetchStorages = useCallback(async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/ttik/dashboard/storages`, { withCredentials: true });
      
      if (user?.tkcgStorage === 'ALL' || user?.tkcgStorage === 'U') {
        setStorageList(['ALL', ...response.data]);
      } else {
        setStorageList(response.data);
      }
    } catch (error) {
      console.error("창고 목록 로드 실패:", error);
    }
  }, [SERVER_URL, user?.tkcgStorage]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/ttik/dashboard/stats`, {
        params: { 
          storageName: selectedStorage 
        },
        withCredentials: true 
      });
      
      setStats(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("데이터 동기화 실패:", error);
    }
  }, [SERVER_URL, selectedStorage]);
  
  const fetchRacks = useCallback(async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/ttik/dashboard/racks`, {
        params: { storageName: selectedStorage },
        withCredentials: true
      });
      setRackData(response.data);
    } catch (error) {
      console.error("랙 데이터 로드 실패:", error);
    }
  }, [SERVER_URL, selectedStorage]);

  useEffect(() => { fetchStorages(); }, [fetchStorages]);
  useEffect(() => {
    fetchStats();
    if (selectedStorage !== 'ALL') fetchRacks();
    const intervalId = setInterval(fetchStats, 10000);
    return () => clearInterval(intervalId); 
  }, [fetchStats, fetchRacks, selectedStorage]);

  const groupedRacks = useMemo(() => {
    const groups = {};
    rackData.forEach(rack => {
      const parts = rack.rackNm.split('-'); // 1-A 형태
      const level = parts[0]; // 첫 번째 요소가 층수
      if (!groups[level]) groups[level] = [];
      groups[level].push(rack);
    });
    return groups;
  }, [rackData]);

  const getRackClass = (rack) => {
    if (rack.rackEnabled === 'N') return styleMainDashBoard.enabledN;
    return rack.rackStts === 'Y' ? styleMainDashBoard.sttsY : styleMainDashBoard.sttsN;
  };

  return (
    <div className={styleMainDashBoard.modernDashboard}>
      <div className={styleMainDashBoard.welcomeSection}>
        <div className={styleMainDashBoard.welcomeFlex}>
          <div>
            <h1>Overview</h1>
            <p>{selectedStorage === 'ALL' ? '실시간 통합 재고 현황' : `${selectedStorage} 창고 실시간 현황`}을 확인하세요.</p>
            <p className={styleMainDashBoard.updateTime}>(최근 업데이트: {lastUpdated.toLocaleTimeString()})</p>
          </div>
          <div className={styleMainDashBoard.storageTabs}>
            {(user?.tkcgStorage === 'ALL' || user?.tkcgStorage === 'U') ? (
              storageList.map((type) => (
                <button
                  key={type}
                  className={`${styleMainDashBoard.tabBtn} ${selectedStorage === type ? styleMainDashBoard.activeTab : ''}`}
                  onClick={() => setSelectedStorage(type)}
                >
                  {type === 'ALL' ? '전체' : `${type} 창고`}
                </button>
              ))
            ) : (
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

      <div 
        className={styleMainDashBoard.contentGrid}
        style={{ gridTemplateColumns: selectedStorage === 'ALL' ? '1fr 1fr' : '1fr 1fr 1fr' }}
      >
        <div className={styleMainDashBoard.dataPanel}>
          <div className={styleMainDashBoard.panelHeader}>
            <h3>최근 입고 현황</h3>
            <button className={styleMainDashBoard.viewAll} onClick={() => navigate("/stock/history")}>전체보기</button>
          </div>
          <div className={styleMainDashBoard.customList}>
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

        {selectedStorage !== 'ALL' && (
          <div className={styleMainDashBoard.dataPanel}>
            <div className={styleMainDashBoard.panelHeader}>
              <div className={styleMainDashBoard.titleWithLegend}>
                <h3>창고 적재 현황 (단면도)</h3>
                <div className={styleMainDashBoard.legend}>
                  <span className={styleMainDashBoard.legendItem}>
                    <span className={`${styleMainDashBoard.dot} ${styleMainDashBoard.sttsY}`}></span>적재가능
                  </span>
                  <span className={styleMainDashBoard.legendItem}>
                    <span className={`${styleMainDashBoard.dot} ${styleMainDashBoard.sttsN}`}></span>적재완료
                  </span>
                  <span className={styleMainDashBoard.legendItem}>
                    <span className={`${styleMainDashBoard.dot} ${styleMainDashBoard.enabledN}`}></span>사용불가
                  </span>
                </div>
              </div>
            </div>
            
            
            <div className={styleMainDashBoard.rackGrid} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: '2rem', overflowX: 'auto', paddingBottom: '10px' }}>
              {Object.keys(groupedRacks).length > 0 ? (
                // 구역을 가로로 나열
                Object.keys(groupedRacks).sort().map(area => (
                  <div key={area} style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: '8px' }}>
                    {/* 하단 구역 라벨 */}
                    <span className={styleMainDashBoard.rowLabel} style={{ marginTop: '8px', border: 'none', width: 'auto' }}>{area}</span>
                    {/* 층수를 아래에서 위로 */}
                    <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '5px' }}>
                      {groupedRacks[area].sort((a, b) => Number(a.rackNm.split('-')[0]) - Number(b.rackNm.split('-')[0])).map(rack => (
                        <div 
                          key={rack.rackSn} 
                          className={`${styleMainDashBoard.rackBox} ${getRackClass(rack)}`} 
                          title={rack.rackNm}
                          onClick={() => navigate('/storage')}
                          style={{ margin: 0 }} 
                        >
                          {rack.rackNm.split('-')[0]}F
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : <p>데이터가 없습니다.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainDashboard;