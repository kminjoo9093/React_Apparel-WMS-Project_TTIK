import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../src/pages/main/Layout";
import MainDashboard from "../src/pages/main/MainDashBoard";
import Login from "../src/pages/main/Login";
import Error404Page from "./Error404Page";
import serverUrl from "./db/server.json";
import RegisterAdmin from "./pages/main/RegisterAdmin";
import ProductRegister from "./pages/product/ProductRegister";
import ProductDetail from "../src/pages/product/ProductDetail";
import ProductModify from "../src/pages/product/ProductModify";
import ProductArchive from "../src/pages/product/ProductArchive";
import Brand from "./pages/Brand/BrandList";
import Partner from "../src/pages/partner/PartnerList";
import ProductList from "./pages/product/ProductList";
import Plans from "../src/pages/stock/StockPlans";
import QRsave from "./pages/qrcode/QRsave";
import History from "../src/pages/stock/StockHistory";
import StockDetailInbound from "./pages/stock/StockDetailInbound";
import StockDetailOutbound from "./pages/stock/StockDetailOutbound";
import Storage from "./pages/storage/Storage";
import ProductDataProvider, {
  ProductContext,
} from "./pages/product/ProductDataProvider";

function Ttik() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${serverUrl.SERVER_URL}/ttik/me`, {
          method: "GET",
          credentials: "include",
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

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user?.tkcgStorage)) {
      return <Navigate to="/ttik" replace />;
    }
    return children;
  };

  if (!isInitialized) return <div>로딩 중...</div>;

  return (
    <Routes>
      {/* 1. 로그인 페이지를 최상단에 배치하고 /* 경로와 분리 */}
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to="/ttik" replace />
          ) : (
            <Login setUser={setUser} setIsLoggedIn={setIsLoggedIn} />
          )
        }
      />

      {/* 2. 로그인이 필요한 모든 경로는 Layout 내부에서 처리 */}
      {isLoggedIn ? (
        <Route
          path="/*"
          element={
            <Layout user={user} setUser={setUser} setIsLoggedIn={setIsLoggedIn}>
              <Routes>
                <Route path="/ttik" element={<MainDashboard user={user} />} />
                <Route path="/brand" element={<Brand />} />
                <Route path="/partner" element={<Partner />} />
                <Route path="/stock/plans" element={<Plans />} />
                <Route
                  path="/stock/plans/inbound/:productCd"
                  element={<StockDetailInbound />}
                />
                <Route
                  path="/stock/plans/outbound/:productCd"
                  element={<StockDetailOutbound />}
                />
                <Route path="/product" element={<ProductDataProvider />}>
                  <Route path="list" element={<ProductList />} />
                  <Route path="register" element={<ProductRegister />} />
                </Route>
                <Route path="/register/admin" element={<RegisterAdmin />} />
                <Route
                  path="/product/productDetail/:gds_cd"
                  element={<ProductDetail />}
                />
                <Route
                  path="/product/productModify"
                  element={<ProductModify />}
                />
                <Route
                  path="/product/productArchive"
                  element={<ProductArchive />}
                />
                <Route path="/stock/plans/qr/print" element={<QRsave />} />
                <Route path="/stock/history" element={<History />} />
                <Route path="/storage" element={<Storage />} />

                <Route
                  path="/register-admin"
                  element={
                    <ProtectedRoute allowedRoles={["ALL", "A", "B"]}>
                      <RegisterAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/ttik" replace />} />
                <Route path="*" element={<Error404Page />} />
              </Routes>
            </Layout>
          }
        />
      ) : (
        /* 로그인 안된 상태에서 /login 이외의 모든 경로는 로그인으로 강제 이동 */
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

export default Ttik;
