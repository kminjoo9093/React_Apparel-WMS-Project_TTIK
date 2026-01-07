import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { useEffect, useState } from "react";
import Layout from "../src/pages/main/Layout";
import MainDashboard from "../src/pages/main/MainDashBoard";
import Login from "../src/pages/main/Login";
import Error404Page from "./Error404Page";
import ProductRegister from "./pages/product/ProductRegister";
import Brand from "../src/pages/Brand/BrandList";

function Ttik() {
  const location = useLocation();
  const hideLayoutRoutes = ["/login"];
  const hideLayout = hideLayoutRoutes.includes(location.pathname);

  // 로그인 상태 정의
  const [user, setUser] = useState(null); 
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [isInitialized, setIsInitialized] = useState(false); 

  // 앱 시작 시 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // 백엔드 세션 확인 API 호출
        const response = await fetch('http://localhost:3001/ttik/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data); 
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("로그인 상태 확인 실패:", error);
      } finally {
        setIsInitialized(true); 
      }
    };

    checkLoginStatus();
  }, []);

  if (!isInitialized) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      {!hideLayout ? (
        /* 로그인한 사용자만 들어올 수 있게 보호 */
        isLoggedIn ? (
          <Layout user={user} setUser={setUser} setIsLoggedIn={setIsLoggedIn}>
            <Routes>
              <Route path="/ttik" element={<MainDashboard user={user} />} />
              <Route path="/" element={<Navigate to="/ttik" replace />} />
              <Route path="/brand" element={ <Brand /> } />
              {/* 추가할 메뉴들 */}
              <Route path="/products" element={<div>상품관리 페이지</div>} />
              <Route path="*" element={<Error404Page />} />
            </Routes>
          </Layout>
        ) : (
          /* 로그인 안됐는데 /ttik 등으로 접속하면 로그인으로 보냄 */
          <Navigate to="/login" replace />
        )
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/main" replace />} />
          <Route path="/ttik" element={<MainDashboard />} />
          {/* 상품관리, 입출고 등 다른 페이지들도 여기에 추가 */}
          <Route path="/register" element={<ProductRegister/>}/>

          {/* Login 컴포넌트에 상태 변경 함수 전달 */}
          <Route 
            path="/login"
            element={<Login setUser={setUser} setIsLoggedIn={setIsLoggedIn} />} 
          />
        </Routes>

      )}
    </div>
  );
}

export default Ttik;