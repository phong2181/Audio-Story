import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdminLoggedIn } from '../utils/adminAuth';
import { ROUTES } from '../utils/route';

/**
 * ProtectedRoute component.
 * Redirects to admin login if user is not authenticated.
 * Otherwise renders the children (protected content).
 */
const ProtectedRoute = ({ children }) => {
  if (!isAdminLoggedIn()) {
    return <Navigate to={ROUTES.ADMIN.LOGIN} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

