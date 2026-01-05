import styleMainDashBoard from "../css/MainDashboard.module.css"; 

const StatCard = ({ title, value, unit, isWarning, trend }) => (
  <div className={`${styleMainDashBoard.modernCard} ${isWarning ? styleMainDashBoard.warning : ''}`}>
    <div className={styleMainDashBoard.cardContent}>
      <div className={styleMainDashBoard.panelHeader}>
        <p className={styleMainDashBoard.cardLabel}>
          {isWarning && <span style={{ marginRight: '5px' }}>🚨</span>} 
          {title}
        </p>
        <button className={styleMainDashBoard.viewAll}>전체보기</button>
      </div>
      <h3 className={styleMainDashBoard.cardValue}>
        {value}<span className={styleMainDashBoard.cardUnit}>{unit}</span>
      </h3>
      <div className={styleMainDashBoard.cardFooter}>
        <span className={`${styleMainDashBoard.trend} ${trend > 0 ? styleMainDashBoard.up : styleMainDashBoard.down}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
        <span className={styleMainDashBoard.trendLabel}>전월 대비</span>
      </div>
    </div>
    {isWarning && <div className={styleMainDashBoard.warningGlow}></div>}
  </div>
);

export default StatCard;