import { useState, useEffect } from 'react';
import styleMainDashBoard from '../../css/MainDashboard.module.css';
import StatCard from '../../components/StatCard';

const MainDashboard = () => {
  // 업데이트 시간을 확인하기 위한 상태 (데이터 연동 시 여기에 실제 데이터를 저장)
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    // 10초마다 실행될 함수
    const refreshData = () => {
      console.log("10초 경과: 데이터를 실시간으로 동기화합니다.");
      setLastUpdated(new Date());
      
      // 실제 API 연동 시 여기에 호출 로직 작성
      // axios.get('/api/inventory').then(res => setData(res.data));
    };

    // 인터벌 설정 (10초)
    const intervalId = setInterval(refreshData, 10000);

    // 컴포넌트 언마운트 시 인터벌 제거 (메모리 누수 방지)
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className={styleMainDashBoard.modernDashboard}>
      <div className={styleMainDashBoard.welcomeSection}>
        <h1>Overview</h1>
        <p>실시간 재고 현황을 확인하세요. </p>
        <p>(최근 업데이트: {lastUpdated.toLocaleTimeString()})</p>
      </div>

      {/* 상단 통계 그리드 */}
      <div className={styleMainDashBoard.statsGrid}>
        <StatCard title="전체 등록 상품" value="1,240" unit="건" trend={12} />
        <StatCard title="현재 재고 보유" value="1,120" unit="건" trend={-2} />
        <StatCard title="재고 부족 품목" value="12" unit="건" trend={5} isWarning={true} />
      </div>

      {/* 하단 상세 데이터 섹션 */}
      <div className={styleMainDashBoard.contentGrid}>
        {/* 최근 입고 현황 패널 */}
        <div className={styleMainDashBoard.dataPanel}>
          <div className={styleMainDashBoard.panelHeader}>
            <h3>최근 입고 현황</h3>
            <button className={styleMainDashBoard.viewAll}>전체보기</button>
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