import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styleLayout from '../../css/Layout.module.css';
import Modal from '../../components/Modal';
import serverUrl from "../../db/server.json"

const Layout = ({ children, user }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const SERVER_URL = serverUrl.SERVER_URL;
  
  const [modal, setModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: null 
  });

  const closeModal = () => setModal({ ...modal, isOpen: false });

  const handleLogout = () => {
    setModal({
      isOpen: true,
      title: 'Logout',
      message: '정말 로그아웃 하시겠습니까?',
      onConfirm: async () => {
        try {
          const response = await fetch(`${SERVER_URL}/logout`, {
            method: 'POST', 
            credentials: 'include',
          });

          if (response.ok) {
            closeModal();
            // 페이지 전체를 새로고침하며 로그인으로 이동
            window.location.href = '/login'; 
          }
        } catch (error) {
          console.error("로그아웃 실패:", error);
          setModal({
            isOpen: true,
            title: 'Error',
            message: '로그아웃 중 오류가 발생했습니다.',
            onConfirm: closeModal
          });
        }
      },
      onCancel: closeModal 
    });
  };

  const menus = [
    { path: '/ttik', name: '대시보드', icon: '📊' },
    { path: '/product/productDetail', name: '상품 관리', icon: '📦' },
    { path: '/stock/plans', name: '입출고 관리', icon: '🔄' },
    { path: '/register', name: '등록하기', icon: '➕' },
    { path: '/history', name: '이력 조회', icon: '📜' },
    { path: '/brand', name: '브랜드', icon: '🏷️' },
    { path: '/register-admin', name: '관리자 등록', icon: '👤' }
  ];

  const closeSidebar = () => setIsSidebarOpen(false);
  
  return (
    <div className={styleLayout.appContainer}>
      <Modal 
        isOpen={modal.isOpen} 
        title={modal.title} 
        message={modal.message} 
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel} 
      />

      <div 
        className={`${isSidebarOpen ? styleLayout.overlayActive : ''}`} 
        onClick={closeSidebar}
      ></div>

      <aside className={`${styleLayout.sidebar} ${isSidebarOpen ? styleLayout.sidebarActive : ''}`}>
        <div className={styleLayout.sidebarLogo}>
          <div className={styleLayout.logoMain}> <Link to="/ttik">TTIK</Link></div>
          <div className={styleLayout.logoSub}>Tap To Inventory Keeping</div>
        </div>
        
        <div className={styleLayout.sidebarProfile}>
          <div className={styleLayout.profileInfo}>
            <span style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
              Warehouse Admin
            </span>
            <span className={styleLayout.profileName}>
              {user?.nickname || '관리자'}
            </span> 
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

      <div className={styleLayout.mainContent}>
        <header className={styleLayout.topBar}>
          <div className={styleLayout.topBarLeft} style={{ display: 'flex', alignItems: 'center' }}>
            <button className={styleLayout.menuToggle} onClick={() => setIsSidebarOpen(true)}>☰</button>
            <h2 className={styleLayout.sageTitle}>
              {menus.find(m => m.path === location.pathname)?.name || "QR코드 PDF저장 페이지" }
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
            <button className={styleLayout.logoutBtn} onClick={handleLogout}>로그아웃</button>
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