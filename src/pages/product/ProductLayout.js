import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  LayoutDashboard, 
  Edit3, 
  Archive, 
  ChevronLeft 
} from 'lucide-react'; 
import styles from './ProductLayout.module.css'; // CSS 파일명 변경 반영
const ProductLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 사이드바 열림/닫힘 상태 관리
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  // 메뉴 아이템 정의
  const menuItems = [
    { 
      id: 'detail', 
      label: '상품 상세 현황', 
      path: '/product/productDetail', 
      icon: <LayoutDashboard size={22} /> 
    },
    { 
      id: 'modify', 
      label: '상품 정보 수정', 
      path: '/product/productModify', 
      icon: <Edit3 size={22} /> 
    },
    { 
      id: 'archive', 
      label: '상품 보관함', 
      path: '/product/productArchive', 
      icon: <Archive size={22} /> 
    },
  ];
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <div className={styles.container}>
      {/* 사이드바 영역 */}
      <aside className={`${styles.sidebar} ${!isMenuOpen ? styles.collapsed : ''}`}>
        
        {/* 상단: 석 삼(三) 아이콘 및 로고 */}
        <div className={styles.menuHeader} onClick={toggleMenu}>
          <Menu className={styles.hamburger} size={24} />
          {isMenuOpen && <span className={styles.logoText}>INV-MANAGER</span>}
        </div>
        {/* 메뉴 리스트 */}
        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <div 
              key={item.id}
              className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
              onClick={() => navigate(item.path)}
            >
              <div className={styles.iconWrapper}>{item.icon}</div>
              {isMenuOpen && <span className={styles.menuLabel}>{item.label}</span>}
            </div>
          ))}
        </nav>
        {/* 하단 접기 버튼 */}
        <div className={styles.sidebarFooter} onClick={toggleMenu}>
           {isMenuOpen ? <ChevronLeft size={20} /> : <div style={{width: '20px'}} />}
        </div>
      </aside>
      {/* 컨텐츠 영역 */}
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
};
export default ProductLayout;