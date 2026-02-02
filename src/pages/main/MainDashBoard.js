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
  const [historyList, setHistoryList] = useState([]); 
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

  // 입출고 이력 데이터 로드 함수 추가
  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/ttik/history/list`, {
        params: { 
          startDate: '', 
          endDate: '', 
          search: '',
          storageName: selectedStorage // 선택된 'A', 'B', 'C' 또는 'ALL' 전달
        },
        withCredentials: true
      });
      setHistoryList(response.data);
    } catch (error) {
      console.error("이력 데이터 로드 실패:", error);
    }
  }, [SERVER_URL, selectedStorage]); 

  useEffect(() => { fetchStorages(); }, [fetchStorages]);
  useEffect(() => {
    fetchStats();
    fetchHistory(); 
    if (selectedStorage !== 'ALL') fetchRacks();
    
    const intervalId = setInterval(() => {
        fetchStats();
        fetchHistory(); 
    }, 10000);
    
    return () => clearInterval(intervalId); 
  }, [fetchStats, fetchRacks, fetchHistory, selectedStorage]);

const groupedRacks = useMemo(() => {
  const groups = {};
  if (!Array.isArray(rackData) || rackData.length === 0) return groups;

  rackData.forEach(rack => {
    if (rack && typeof rack.rackNm === 'string' && rack.rackNm.includes('-')) {
      const parts = rack.rackNm.split('-'); 
      const area = parts[0]; 
      const level = parts[1];
      
      if (!groups[area]) groups[area] = [];
      groups[area].push({ ...rack, displayLevel: level });
    }
  });
  return groups;
}, [rackData]);

  // 최근 입고/출고 데이터 필터링 (출고완료만 추출)
  const getGroupedHistory = (type) => {
    if (!Array.isArray(historyList)) return [];

    const grouped = historyList
      .filter(item => {
        const isOutbound = Number(item.type) === 1; // SQL에서 '출고' 포함 시 1로 정의됨
        const isRemarkComplete = item.remark && item.remark.includes('완료');
        const isRemarkInbound = item.remark && item.remark.includes('입고');

        if (type === 0) {
            // 입고 현황: 입고이면서 완료인 것
            return Number(item.type) === 0 && isRemarkInbound && isRemarkComplete;
        }
        if (type === 1) {
            // 출고 현황: 출고이면서 완료인 것만 필터링
            return isOutbound && isRemarkComplete;
        }
        return false;
      })
      .reduce((acc, current) => {
        const brand = current.brand_name || '';
        const key = `${current.date}-${current.target_name}-${brand}-${current.item_name}`;
        
        if (!acc[key]) {
          acc[key] = { 
            ...current, 
            quantity: 0,
            display_brand: brand
          };
        }
        acc[key].quantity += 1; // 낱개출고 한 건당 1씩 가산
        return acc;
      }, {});

    return Object.values(grouped)
      .sort((a, b) => {
        const dateTimeA = new Date(`${a.date.replace(/\./g, '-')} ${a.time}`);
        const dateTimeB = new Date(`${b.date.replace(/\./g, '-')} ${b.time}`);
        return dateTimeB - dateTimeA;
      })
      .slice(0, 5);
  };

  // 최근 입고/출고 데이터 (그룹화 적용)
  const recentInbound = useMemo(() => getGroupedHistory(0), [historyList]);
  const recentOutbound = useMemo(() => getGroupedHistory(1), [historyList]);
  

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
        <StatCard 
          title={selectedStorage === 'ALL' ? "현재 재고 보유" : "전체 재고 보유"} 
          value={stats.inStockProducts} 
          unit="건" 
          trend={stats.inStockTrend} 
        />
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
            {recentInbound.length > 0 ? (
                recentInbound.map((item, index) => (
                  <div key={`inbound-${index}`} className={styleMainDashBoard.listItem}>
                    <div className={styleMainDashBoard.itemInfo}>
                      <div className={styleMainDashBoard.itemName}>
                        {/* 브랜드명 뱃지화 */}
                        {item.brand_name && (
                          <span className={styleMainDashBoard.brandBadge}>
                            {item.brand_name}
                          </span>
                        )}
                        {/* 상품명 텍스트 분리 */}
                        <span className={styleMainDashBoard.nameText}>
                          {item.item_name}
                        </span>
                      </div>
                      <span className={styleMainDashBoard.itemDate}>
                        {item.date} <span style={{ opacity: 0.7, marginLeft: '4px' }}>{item.time}</span>
                      </span>
                    </div>
                    <span className={styleMainDashBoard.itemQtyPlus}>
                      +{item.quantity?.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className={styleMainDashBoard.listItem}>데이터가 없습니다.</div>
              )}
          </div>
        </div>

        <div className={styleMainDashBoard.dataPanel}>
          <div className={styleMainDashBoard.panelHeader}>
            <h3>최근 출고 현황</h3>
            <button className={styleMainDashBoard.viewAll} onClick={() => navigate("/stock/history")}>전체보기</button>
          </div>
          <div className={styleMainDashBoard.customList}>
            {recentOutbound.length > 0 ? (
              recentOutbound.map((item) => (
                <div key={item.id} className={styleMainDashBoard.listItem}>
                  <div className={styleMainDashBoard.itemInfo}>
                    <span className={styleMainDashBoard.itemName}>
                      {item.brand_name && (
                          <span className={styleMainDashBoard.brandBadge}>
                            {item.brand_name}
                          </span>
                        )}
                        <span className={styleMainDashBoard.nameText}>
                          {item.item_name}
                        </span>
                    </span>
                    <span className={styleMainDashBoard.itemDate}>
                        {item.date} <span style={{ opacity: 0.7, marginLeft: '4px' }}>{item.time}</span>
                    </span>
                  </div>
                  <span className={styleMainDashBoard.itemQtyMinus}>-{item.quantity?.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <div className={styleMainDashBoard.listItem}>데이터가 없습니다.</div>
            )}
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
                  Object.keys(groupedRacks).sort().map(area => (
                    <div key={area} style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: '8px' }}>
                      <span className={styleMainDashBoard.rowLabel} style={{ marginTop: '8px', border: 'none', width: 'auto', fontWeight: 'bold' }}>
                        {area}
                      </span>
                      
                      <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '5px' }}>
                        {groupedRacks[area] && groupedRacks[area]
                          .sort((a, b) => {
                            const valA = parseInt(a.displayLevel) || 0;
                            const valB = parseInt(b.displayLevel) || 0;
                            return valA - valB;
                          })
                          .map(rack => (
                            <div 
                              key={rack.rackSn} 
                              className={`${styleMainDashBoard.rackBox} ${getRackClass(rack)}`} 
                              title={rack.rackNm}
                              onClick={() => navigate('/storage', { state: { autoOpenRackSn: rack.rackSn, autoOpenStorageNm: selectedStorage } })} 
                              style={{ margin: 0 }} 
                            >
                              {rack.displayLevel || '1'}F
                            </div>
                          ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94a3b8', padding: '20px' }}>표시할 랙 데이터가 없습니다.</p>
                )}
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainDashboard;