/**
 * Admin authentication utilities.
 * Manages admin token & user info in localStorage.
 */

const ADMIN_TOKEN_KEY = 'adminToken';
const ADMIN_INFO_KEY = 'adminInfo';

/**
 * Save admin authentication data to localStorage.
 * @param {string} token - JWT token from backend
 * @param {object} user - User object (id, name, email, avatar, etc.)
 */
export function saveAdminAuth(token, user) {
  if (token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
  if (user) {
    localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(user));
  }
}

/**
 * Check if admin is currently logged in.
 * @returns {boolean}
 */
export function isAdminLoggedIn() {
  return !!localStorage.getItem(ADMIN_TOKEN_KEY);
}

/**
 * Logout admin: remove token & info from localStorage.
 */
export function logoutAdmin() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_INFO_KEY);
}

/**
 * Get admin user info object from localStorage.
 * @returns {object|null} Parsed user info or null
 */
export function getAdminInfo() {
  try {
    const raw = localStorage.getItem(ADMIN_INFO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Get admin JWT token from localStorage.
 * @returns {string|null}
 */
export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

