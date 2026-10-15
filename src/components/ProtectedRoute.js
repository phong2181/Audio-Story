import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdminLoggedIn, getAdminInfo } from '../utils/adminAuth';
import { ROUTES } from '../utils/route';

/**
 * ProtectedRoute component.
 * Redirects to admin login if user is not authenticated or not an admin/staff.
 * Otherwise renders the children (protected content).
 */
const ProtectedRoute = ({ children }) => {
  const adminInfo = getAdminInfo();
  const hasAdminRole = adminInfo && (adminInfo.role === 'admin' || adminInfo.role === 'staff');

  if (!isAdminLoggedIn() || !hasAdminRole) {
    return <Navigate to={ROUTES.ADMIN.LOGIN} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

