import styleMainDashBoard from '../../css/MainDashboard.module.css';

const StatCard = ({ title, value, unit, isWarning, trend }) => (
  <div className={`${styleMainDashBoard.modernCard} ${isWarning ? styleMainDashBoard.warning : ''}`}>
    <div className={styleMainDashBoard.cardContent}>
      <div className={styleMainDashBoard.panelHeader}>
        <p className={styleMainDashBoard.cardLabel}>{isWarning && <span>🚨</span>} {title}</p>
      <button className={styleMainDashBoard.viewAll}>전체보기</button>
      </div>
      <h3 className={styleMainDashBoard.cardValue}>
        {value}<span className={styleMainDashBoard.cardUnit}>{unit}</span>
      </h3>
      <div className={styleMainDashBoard.cardFooter}>
        <span className={`${styleMainDashBoard.trend} ${trend > 0 ? 'up' : 'down'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
        <span className={styleMainDashBoard.trendLabel}>전월 대비</span>
      </div>
    </div>
    {isWarning && <div className={styleMainDashBoard.warningGlow}></div>}
  </div>
);

const MainDashboard = () => {
  return (
    <div className={styleMainDashBoard.modernDashboard}>
      <div className={styleMainDashBoard.welcomeSection}>
        <h1>Overview</h1>
        <p>실시간 재고 현황을 확인하세요.</p>
      </div>

      <div className={styleMainDashBoard.statsGrid}>
        <StatCard title="전체 등록 상품" value="1,240" unit="건" trend={12} />
        <StatCard title="현재 재고 보유" value="1,120" unit="건" trend={-2} />
        <StatCard title="재고 부족 품목" value="12" unit="건" trend={5} isWarning />
      </div>

      <div className={styleMainDashBoard.contentGrid}>
        <div className={styleMainDashBoard.dataPanel}>
          <div className={styleMainDashBoard.panelHeader}>
            <h3>최근 입고 현황</h3>
            <button className={styleMainDashBoard.viewAll}>전체보기</button>
          </div>
          <div className={styleMainDashBoard.customList}>
            {[1, 2, 3].map(i => (
              <div key={i} className={styleMainDashBoard.listItem}>
                <div className={styleMainDashBoard.itemInfo}>
                  <span className={styleMainDashBoard.itemName}>나이키 신발 {i}</span>
                  <span className={styleMainDashBoard.itemDate}>2023.12.30</span>
                </div>
                <span className={styleMainDashBoard.itemQtyPlus}>+15</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styleMainDashBoard.dataPanel}>
          <div className={styleMainDashBoard.panelHeader}>
            <h3>최근 출고 현황</h3>
            <button className={styleMainDashBoard.viewAll}>전체보기</button>
          </div>
          <div className={styleMainDashBoard.customList}>
            {[1, 2].map(i => (
              <div key={i} className={styleMainDashBoard.listItem}>
                <div className={styleMainDashBoard.itemInfo}>
                  <span className={styleMainDashBoard.itemName}>아디다스 모자</span>
                  <span className={styleMainDashBoard.itemDate}>2023.12.30</span>
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