import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "../src/pages/main/Layout"
import MainDashboard from "../src/pages/main/MainDashBoard"
import Login from "../src/pages/main/Login"

function Ttik() {
  const location = useLocation();
  const hideLayoutRoutes = ["/login"];
  // const hideFooterRoutes = ["/login"];

  // const hideFooter = hideFooterRoutes.includes(location.pathname);
  const hideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
  <div>
    {hideLayout ? (
      /* 레이아웃이 필요 없는 페이지 (로그인 등) */
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    ) : (
      /* 레이아웃이 필요한 페이지들 */
      // <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/main" replace />} />
          <Route path="/ttik" element={<MainDashboard />} />
          {/* 상품관리, 입출고 등 다른 페이지들도 여기에 추가 */}
        </Routes>
      // </Layout>
    )}
  </div>
);
}

export default Ttik;
