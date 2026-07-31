// Admin authentication utilities

export const AUTH_KEYS = {
  TOKEN: "adminToken",
  INFO: "adminInfo",
};

/**
 * Save admin authentication
 */
export const saveAdminAuth = (token, adminInfo) => {
  localStorage.setItem(AUTH_KEYS.TOKEN, token);
  localStorage.setItem(AUTH_KEYS.INFO, JSON.stringify(adminInfo));
};

/**
 * Get admin token
 */
export const getAdminToken = () => {
  return localStorage.getItem(AUTH_KEYS.TOKEN);
};

/**
 * Get admin info
 */
export const getAdminInfo = () => {
  try {
    const info = localStorage.getItem(AUTH_KEYS.INFO);
    return info ? JSON.parse(info) : null;
  } catch (error) {
    console.error("Failed to parse admin info:", error);
    return null;
  }
};

/**
 * Check if admin is logged in
 */
export const isAdminLoggedIn = () => {
  return !!getAdminToken() && !!getAdminInfo();
};

/**
 * Logout admin
 */
export const logoutAdmin = () => {
  localStorage.removeItem(AUTH_KEYS.TOKEN);
  localStorage.removeItem(AUTH_KEYS.INFO);
};

/**
 * Validate admin token
 */
export const validateAdminToken = () => {
  const token = getAdminToken();
  const info = getAdminInfo();

  if (!token || !info) {
    return false;
  }

  // Add token expiration check if needed
  // const tokenExpiry = localStorage.getItem(AUTH_KEYS.TOKEN_EXPIRY);
  // if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
  //   logoutAdmin();
  //   return false;
  // }

  return true;
};
