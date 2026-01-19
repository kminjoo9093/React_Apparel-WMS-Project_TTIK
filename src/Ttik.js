import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { useEffect, useState } from "react";
import Layout from "../src/pages/main/Layout";
import MainDashboard from "../src/pages/main/MainDashBoard";
import Login from "../src/pages/main/Login";
import Error404Page from "./Error404Page";
import serverUrl from "./db/server.json"
import RegisterAdmin from "./pages/main/RegisterAdmin";
import ProductRegister from "./pages/product/ProductRegister";
import ProductDetail from "../src/pages/product/ProductDetail";
import ProductModify from "../src/pages/product/ProductModify";
import ProductArchive from "../src/pages/product/ProductArchive";
import ProductList from "./pages/product/ProductList";
import Brand from "../src/pages/Brand/BrandList";
import Plans from "../src/pages/stock/StockPlans";
import QRsave from "./pages/qrcode/QRsave";

function Ttik() {
  const location = useLocation();
  const hideLayoutRoutes = ["/login"];
  const hideLayout = hideLayoutRoutes.includes(location.pathname);

  const [user, setUser] = useState(null); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); 
  //const SERVER_URL = serverUrl.SERVER_URL;

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${serverUrl.SERVER_URL}/ttik/me`, {
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
              <Route path="/stock/plans" element={ <Plans /> } />
              <Route path="/register" element={<ProductRegister/>}/>
              <Route path="/register-admin" element={<RegisterAdmin />} />
              <Route path="/productList" element={<ProductList />} />
              <Route path="/product/productDetail" element={<ProductDetail />} />
              <Route path="/product/productModify" element={<ProductModify />} />
              <Route path="/product/productArchive" element={<ProductArchive />} />
              <Route path="/register" element={<ProductRegister/>}/>
              <Route path="/stock/plans/qr/print" element={<QRsave />}/>
              <Route path="*" element={<Error404Page />} />
            </Routes>
          </Layout>
        ) : (
          /* 로그인 안됐는데 /ttik 등으로 접속하면 로그인으로 보냄 */
          <Navigate to="/login" replace />
        )
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/ttik" replace />} />

          <Route path="/ttik" element={<MainDashboard />} />
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
