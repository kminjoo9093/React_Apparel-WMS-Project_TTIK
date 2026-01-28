import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styleLayout from '../../css/Layout.module.css';
import Modal from '../../components/Modal';
import serverUrl from "../../db/server.json"

const Layout = ({ children, user, setUser, setIsLoggedIn }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const SERVER_URL = serverUrl.SERVER_URL;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(""); 
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notiRef = useRef(null);

  const [modal, setModal] = useState({ 
    isOpen: false, title: '', message: '', onConfirm: null 
  });

  const closeModal = () => setModal({ ...modal, isOpen: false });

  // 사이드바 노출 권한 정의: ALL(전체관리자), U(창고이용자)
  const hasSidebarPermission = ['ALL', 'U'].includes(user?.tkcgStorage);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/ttik/product/list`, {
          method: 'GET',
          credentials: 'include', 
      });
      if (!response.ok) throw new Error("데이터 로드 실패");
      const data = await response.json();

      const readIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      const combinedNotis = [];
      const now = new Date();

      data.forEach(item => {
        if (readIds.includes(item.productCd)) return;
        if (item.gdsEnabled !== 'Y') return;

        if (user?.tkcgStorage !== 'ALL' && item.storageName !== user?.tkcgStorage) return;

        const isLowStock = (item.stkQty || 0) <= (item.threshold || 0);
        const regDate = new Date(item.frstRegDt);
        const isNewArrival = (now - regDate) < (24 * 60 * 60 * 1000); 

        if (isLowStock) {
          combinedNotis.push({
            id: item.productCd,
            type: 'warning',
            msg: `[재고부족] ${item.productNm}(${item.stkQty}개)`,
          });
        } else if (isNewArrival) {
          combinedNotis.push({
            id: item.productCd,
            type: 'info',
            msg: `[신규등록] ${item.productNm} 상품 입고`,
          });
        }
      });
      setNotifications(combinedNotis);
    } catch (error) {
      console.error("알림 업데이트 오류:", error);
    }
  };

  useEffect(() => {
    fetchNotifications(); 
    const intervalId = setInterval(fetchNotifications, 10000); 
    return () => clearInterval(intervalId); 
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notiRef.current && !notiRef.current.contains(e.target)) {
        setIsNotiOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (id) => {
    const readIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      if (!readIds.includes(id)) {
        const newReadIds = [...readIds, id];
        localStorage.setItem('readNotifications', JSON.stringify(newReadIds));
      }
      setNotifications(prev => prev.filter(n => n.id !== id));

      if (id) {
      navigate(`/product/list?search=${encodeURIComponent(id)}`);
    }
  };
  //알림 모두 읽음 --> 현재 테스트 초기화 부분을 추후 알림 모두 읽음으로 변경
    const handleAllRead = () => {
      if (notifications.length === 0) return;
      const currentReadIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      const allIds = notifications.map(n => n.id);
      const newReadIds = Array.from(new Set([...currentReadIds, ...allIds]));
      localStorage.setItem('readNotifications', JSON.stringify(newReadIds));
      setNotifications([]); 
      
    }

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
            setIsLoggedIn(false);
            setUser(null);
            window.location.href = '/login'; 
          }
        } catch (error) {
          console.error("로그아웃 실패:", error);
        }
      },
      onCancel: closeModal 
    });
  };
  const allMenus = [
    { path: '/ttik', name: '대시보드', icon: '📊', roles: ['ALL', 'U'] },
    { path: '/product/list', name: '상품 관리', icon: '📦', roles: ['ALL'] },
    { path: '/product/productArchive', name: '관리 제외 품목 (Archive)', icon: '📦', roles: ['ALL'] },
    { path: '/stock/plans', name: '입출고 관리', icon: '🔄', roles: ['ALL', 'U'] },
    { path: '/stock/history', name: '이력 조회', icon: '📜', roles: ['ALL'] },
    { path: '/brand', name: '브랜드', icon: '🏷️', roles: ['ALL'] },
    { path: '/partner', name: '거래처', icon: '💼', roles: ['ALL'] },
    { path: '/storage', name: '창고 관리', icon: '🕋', roles: ['ALL', 'U'] },
    { path: '/register/admin', name: '관리자 등록', icon: '👤', roles: ['ALL'] }
  ];

  const menus = allMenus.filter(m => m.roles.includes(user?.tkcgStorage));
  const closeSidebar = () => setIsSidebarOpen(false);
  
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      if (searchKeyword.trim() === "") {
        navigate('/product/list');
      } else {
        navigate(`/product/list?search=${encodeURIComponent(searchKeyword)}`);
      }
      setSearchKeyword("");
    }
  };

  

  return (
    <div className={styleLayout.appContainer}>
      <Modal 
        isOpen={modal.isOpen} 
        title={modal.title} 
        message={modal.message} 
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel} 
      />

      {hasSidebarPermission && (
        <>
          <div className={`${isSidebarOpen ? styleLayout.overlayActive : ''}`} onClick={closeSidebar}></div>
          <aside className={`${styleLayout.sidebar} ${isSidebarOpen ? styleLayout.sidebarActive : ''}`}>
            <div className={styleLayout.sidebarLogo}>
              <div className={styleLayout.logoMain}> <Link to="/ttik">TTIK</Link></div>
              <div className={styleLayout.logoSub}>Tap To Inventory Keeping</div>
            </div>
            
            <div className={styleLayout.sidebarProfile}>
              <div className={styleLayout.profileInfo}>
                <span style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  {user?.tkcgStorage === 'ALL' ? 'Main Admin' : 'Warehouse User'}
                </span>
                <span className={styleLayout.profileName}>{user?.nickname || '관리자'}</span> 
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
        </>
      )}

      <div className={`${styleLayout.mainContent} ${!hasSidebarPermission ? styleLayout.fullWidth : ''}`}>
        <header className={styleLayout.topBar}>
          <div className={styleLayout.topBarLeft} style={{ display: 'flex', alignItems: 'center' }}>
            {hasSidebarPermission && (
              <button className={styleLayout.menuToggle} onClick={() => setIsSidebarOpen(true)}>☰</button>
            )}
            <h2 className={styleLayout.sageTitle}>
              {allMenus.find(m => m.path === location.pathname)?.name || (user?.tkcgStorage.toUpperCase() + " 모니터링") }
            </h2>
          </div>

          <div className={styleLayout.topBarRight}>
            <div className={styleLayout.searchBox}>
              <span className={styleLayout.searchIcon}>🔍</span>
              <input 
                type="text" 
                placeholder="상품명 또는 코드 검색" 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>

            <div className={styleLayout.statusGroup}>
              <div className={styleLayout.notificationContainer} ref={notiRef}>
                <div 
                  className={`${styleLayout.notificationBell} ${notifications.length > 0 ? styleLayout.hasNoti : ''}`}
                  onClick={() => setIsNotiOpen(!isNotiOpen)}
                >
                  🔔
                  {notifications.length > 0 && (
                    <span className={styleLayout.bellBadge}>{notifications.length}</span>
                  )}
                </div>

                {isNotiOpen && (
                  <div className={styleLayout.notiDropdown}>
                    <div className={styleLayout.notiHeader}>
                      <span>최근 알림</span>
                      <button 
                        onClick={() => {
                          localStorage.removeItem('readNotifications');
                          window.location.reload();
                        }}
                        style={{ fontSize: '10px', color: '#ef4444', cursor: 'pointer', border: 'none', background: 'none' }}
                          // onClick={handleAllRead} // 분리한 함수 연결
                          // style={{ 
                          //   fontSize: '12px', 
                          //   color: '#64748b', 
                          //   cursor: 'pointer', 
                          //   border: 'none', 
                          //   background: 'none', 
                          //   fontWeight: '500' 
                          // }}
                      >
                        [테스트 초기화]
                      </button>
                    </div>
                    <ul className={styleLayout.notiList}>
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <li 
                            key={n.id} 
                            className={`${styleLayout.notiItem} ${n.type === 'info' ? styleLayout.typeInfo : styleLayout.typeWarn}`} 
                            onClick={() => handleNotificationClick(n.id, '/product/list')}
                          >
                            <div className={styleLayout.notiContent}>
                              <p className={n.type === 'warning' ? styleLayout.textWarn : ''}>
                                {n.msg.includes(']') ? (
                                  <>
                                    <span style={{ 
                                      display: 'block', 
                                      color: n.type === 'warning' ? '#e11d48' : '#2563eb' // 경고면 빨강, 정보면 파랑
                                    }}>
                                      {`${n.msg.split(']')[0]}]`}
                                    </span>
                                    
                                    {/* 2. 상품명 - 진한 회색/검정색 */}
                                    <span style={{ 
                                      color: '#334155', 
                                      fontSize: '13px',
                                    }}>
                                      {n.msg.split(']')[1]?.split('(')[0]?.trim()}
                                    </span>

                                    {/* 3. (수량) - 상품명 뒤에 붙는 강조색 */}
                                    {n.msg.includes('(') && (
                                      <span style={{ 
                                        color: n.type === 'warning' ? '#e11d48' : '#64748b',
                                        fontSize: '12px',
                                        marginLeft: '4px',
                                        whiteSpace: 'nowrap'
                                      }}>
                                        {`(${n.msg.split('(')[1]}`}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span style={{ color: '#334155' }}>{n.msg}</span>
                                )}
                              </p>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className={styleLayout.notiEmpty}>
                          <div className={styleLayout.emptyIcon}>✨</div>
                          <p>지금은 모든 재고가 충분해요!</p>
                          <span>새로운 알림이 오면 알려드릴게요.</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
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