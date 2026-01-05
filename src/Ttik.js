import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "../src/pages/main/Layout"
import MainDashboard from "../src/pages/main/MainDashBoard"
import Login from "../src/pages/main/Login"
import Error404Page from "./Error404Page";

function Ttik() {
  const location = useLocation();
  const hideLayoutRoutes = ["/login"];
  // const hideFooterRoutes = ["/login"];

  // const hideFooter = hideFooterRoutes.includes(location.pathname);
  const hideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <div>
      {/* 레이아웃이 필요한 페이지들 */}
      {!hideLayout ? (
        <Layout>
          <Routes>
            <Route path="/ttik" element={<MainDashboard />} />
            <Route path="/" element={<Navigate to="/ttik" replace />} />
            <Route path="*" element={<Error404Page />} />
          </Routes>
        </Layout>
      ) : (
        /* 레이아웃이 필요 없는 로그인 전용 경로 */
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Error404Page />} />
        </Routes>
      )}
    </div>
  );
}

export default Ttik;
