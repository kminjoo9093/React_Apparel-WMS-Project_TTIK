import { Link } from "react-router-dom";
import styleMainDashBoard from "../css/MainDashboard.module.css"; 

const StatCard = ({ title, value, unit, isWarning, trend }) => {
  const getTrendClass = () => {
    if (trend === 0) return styleMainDashBoard.neutral;
    if (isWarning) {
      return trend > 0 ? styleMainDashBoard.down : styleMainDashBoard.up;
    }
    return trend > 0 ? styleMainDashBoard.up : styleMainDashBoard.down;
  };

  const getArrow = () => {
    if (trend > 0) return '↑';
    if (trend < 0) return '↓';
    return '-';
  };

  // 재고 부족 품목 카드일 경우 필터 조건을 주소에 포함
  const targetPath = isWarning ? "/productList?status=부족" : "/productList";

  return (
    <div className={`${styleMainDashBoard.modernCard} ${isWarning ? styleMainDashBoard.warning : ''}`}>
      <div className={styleMainDashBoard.cardContent}>
        <div className={styleMainDashBoard.panelHeader}>
          <p className={styleMainDashBoard.cardLabel}>
            {isWarning && <span style={{ marginRight: '5px' }}>🚨</span>} 
            {title}
          </p>
          {/* button을 Link로 교체하여 쿼리 스트링 전달 */}
          <Link to={targetPath} className={styleMainDashBoard.viewAll}>
            전체보기
          </Link>
        </div>
        <h3 className={styleMainDashBoard.cardValue}>
          {value}<span className={styleMainDashBoard.cardUnit}>{unit}</span>
        </h3>
        <div className={styleMainDashBoard.cardFooter}>
          <span className={`${styleMainDashBoard.trend} ${getTrendClass()}`}>
            {getArrow()} {Math.abs(trend)}%
          </span>
          <span className={styleMainDashBoard.trendLabel}>전월 대비</span>
        </div>
      </div>
      {isWarning && <div className={styleMainDashBoard.warningGlow}></div>}
    </div>
  );
};

export default StatCard;