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
import Brand from "../src/pages/Brand/BrandList";
import ProductList from "./pages/product/ProductList";
import Plans from "../src/pages/stock/StockPlans";
import QRsave from "./pages/qrcode/QRsave";
import History from "../src/pages/stock/StockHistory";
import StockDetail from "./pages/stock/StockDetail";

function Ttik() {
  const [user, setUser] = useState(null); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); 

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
        }
      } catch (error) {
        console.error("로그인 상태 확인 실패:", error);
      } finally {
        setIsInitialized(true); 
      }
    };
    checkLoginStatus();
  }, []);

  if (!isInitialized) return <div>로딩 중...</div>;

  return (
    <Routes>
      {/* 1. 로그인이 필요 없는 경로 */}
      <Route path="/login" element={<Login setUser={setUser} setIsLoggedIn={setIsLoggedIn} />} />

      {/* 2. 로그인이 필요한 모든 경로 */}
      <Route 
        path="*" 
        element={
          isLoggedIn ? (
            <Layout user={user} setUser={setUser} setIsLoggedIn={setIsLoggedIn}>
              <Routes>
                <Route path="/ttik" element={<MainDashboard user={user} />} />
                <Route path="/productList" element={<ProductList />} />
                <Route path="/brand" element={<Brand />} />
                <Route path="/stock/plans" element={<Plans />} />
                <Route path="/stock/plans/:productCd" element={<StockDetail />} />
                <Route path="/product/register" element={<ProductRegister />} />
                <Route path="/register-admin" element={<RegisterAdmin />} />
                <Route path="/product/productDetail" element={<ProductDetail />} />
                <Route path="/product/productModify" element={<ProductModify />} />
                <Route path="/product/productArchive" element={<ProductArchive />} />
                <Route path="/stock/plans/qr/print" element={<QRsave />} />
                <Route path="/stock/history" element={<History />} />
                <Route path="/" element={<Navigate to="/ttik" replace />} />
                <Route path="*" element={<Error404Page />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
    </Routes>
  );
}

export default Ttik;