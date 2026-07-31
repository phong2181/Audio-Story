import { Navigate } from "react-router-dom";
import { ROUTES } from "utils/route";
import { validateAdminToken, getAdminInfo } from "utils/adminAuth";

const ProtectedRoute = ({ children, requiredRole = "admin" }) => {
  // Kiểm tra token hợp lệ
  const isValid = validateAdminToken();

  if (!isValid) {
    return <Navigate to={ROUTES.ADMIN.LOGIN} replace />;
  }

  const admin = getAdminInfo();

  // Có thể thêm kiểm tra role ở đây nếu cần
  // if (admin.role !== requiredRole) {
  //   return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
  // }

  return children;
};

export default ProtectedRoute;
