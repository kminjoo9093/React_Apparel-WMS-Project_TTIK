import { Link, useLocation } from 'react-router-dom';
import styleLayout from '../../css/Layout.module.css';

const Layout = ({ children }) => {
  const location = useLocation();

  const menus = [
    { path: '/main', name: '대시보드', icon: '📊' },
    { path: '/products', name: '상품 관리', icon: '📦' },
    { path: '/inventory', name: '입출고 관리', icon: '🔄' },
    { path: '/', name: '등록하기', icon: '➕' },
    { path: '/history', name: '이력 조회', icon: '📜' },
  ];

  return (
    <div className={styleLayout.appContainer}>
      {/* 1. 사이드바 (왼쪽 고정) */}
      <aside className={styleLayout.sidebar}>
        <div className={styleLayout.sidebarLogo}>
          <div className={styleLayout.logoMain}>TTIK</div>
          <div className={styleLayout.logoSub}>Tap To Inventory Keeping</div>
        </div>
      <div className={styleLayout.sidebarProfile}>
        <div className={styleLayout.profileInfo}>
          <span style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>System Admin</span>
          <span className={styleLayout.profileName}>관리자님, 환영합니다</span>
        </div>
      </div>

        <nav className={styleLayout.sidebarNav}>
          {menus.map((menu) => (
            <Link 
              key={menu.path} 
              to={menu.path}
              className={`${styleLayout.navItem} ${location.pathname === menu.path ? styleLayout.active : ''}`}
            >
              <span className={styleLayout.navIcon}>{menu.icon}</span>
              <span className={styleLayout.navText}>{menu.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* 2. 메인 콘텐츠 영역 (사이드바를 제외한 오른쪽 전체) */}
      <div className={styleLayout.mainContent}>
        {/* 상단바 */}
        <header className={styleLayout.topBar}>
          <div className={styleLayout.topBarLeft}>
            <h2 className={styleLayout.sageTitle}>
              {menus.find(m => m.path === location.pathname)?.name || "시스템"}
            </h2>
          </div>

          <div className={styleLayout.topBarRight}>
            <div className={styleLayout.searchBox}>
              <span className={styleLayout.searchIcon}>🔍</span>
              <input type="text" placeholder="상품 검색..." />
            </div>

            <div className={styleLayout.statusGroup}>
              <div className={styleLayout.notificationBell}>
                🔔<span className={styleLayout.bellBadge}>3</span>
              </div>
              <div className={styleLayout.systemStatus} >
                <span className={styleLayout.statusDot}></span>
                <span className={styleLayout.statusText}>Live</span>
              </div>
            </div>
            <button className={styleLayout.logoutBtn}>로그아웃</button>
          </div>
        </header>

        {/* 3. 실제 페이지 내용이 렌더링되는 곳*/}
        <main className={styleLayout.scrollArea}>
          {children} 
        </main>
      </div>
    </div>
  );
};

export default Layout;