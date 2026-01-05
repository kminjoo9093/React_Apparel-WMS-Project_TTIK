import { useState } from 'react'; // useState 추가
import { Link, useLocation} from 'react-router-dom';
import styleLayout from '../../css/Layout.module.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 사이드바 상태

  const menus = [
    { path: '/ttik', name: '대시보드', icon: '📊' },
    { path: '/products', name: '상품 관리', icon: '📦' },
    { path: '/inventory', name: '입출고 관리', icon: '🔄' },
    { path: '/register', name: '등록하기', icon: '➕' },
    { path: '/history', name: '이력 조회', icon: '📜' },
  ];

  // 메뉴 클릭 시 사이드바 닫기 (모바일용)
  const closeSidebar = () => setIsSidebarOpen(false);
 
  return (
    <div className={styleLayout.appContainer}>
      {/* 모바일용 배경 어둡게 처리 */}
      <div 
        className={`${isSidebarOpen ? styleLayout.overlayActive : ''}`} 
        onClick={closeSidebar}
      ></div>

      {/* 사이드바 */}
      <aside className={`${styleLayout.sidebar} ${isSidebarOpen ? styleLayout.sidebarActive : ''}`}>
        <div className={styleLayout.sidebarLogo}>
          <div className={styleLayout.logoMain}> <Link to = "/ttik">TTIK</Link></div>
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
              onClick={closeSidebar}
            >
              <span className={styleLayout.navIcon}>{menu.icon}</span>
              <span className={styleLayout.navText}>{menu.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <div className={styleLayout.mainContent}>
        <header className={styleLayout.topBar}>
          <div className={styleLayout.topBarLeft} style={{ display: 'flex', alignItems: 'center' }}>
            {/* 모바일용 햄버거 버튼 추가 */}
            <button 
              className={styleLayout.menuToggle} 
              onClick={() => setIsSidebarOpen(true)}
            >
              ☰
            </button>
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
              <div className={styleLayout.systemStatus} id="mobile-hide">
                <span className={styleLayout.statusDot}></span>
                <span className={styleLayout.statusText}>Live</span>
              </div>
            </div>
            <button className={styleLayout.logoutBtn}>로그아웃</button>
          </div>
        </header>

        <main className={styleLayout.scrollArea}>
          {children} 
        </main>
      </div>
    </div>
  );
};

export default Layout;