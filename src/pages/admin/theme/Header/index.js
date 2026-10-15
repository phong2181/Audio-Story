import { FaSignOutAlt, FaBell, FaCheck, FaSun, FaMoon } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import "./style.scss";
import { memo, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "utils/route";
import { logoutAdmin, getAdminInfo } from "utils/adminAuth";
import { getStorageUrl } from "config/config";
import { useTheme } from "context/ThemeContext";
import {
  getAdminNotificationsAPI,
  getAdminUnreadCountAPI,
  markNotificationReadAPI,
  markAllNotificationsReadAPI,
} from "api/homePage/request";

const POLL_INTERVAL_MS = 60000; // poll unread count mỗi 60 giây

const formatRelativeTime = (isoString) => {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${diffDays} ngày trước`;
};

const getNotificationIcon = (type) => {
  switch (type) {
    case "comment": return "💬";
    case "review": return "⭐";
    case "favorite": return "❤️";
    default: return "🔔";
  }
};

const HeaderAD = ({ child, ...props }) => {
  const navigate = useNavigate();
  const adminInfo = getAdminInfo();
  const { isDark, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotif, setIsLoadingNotif] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const handleLogout = () => {
    logoutAdmin();
    navigate(ROUTES.ADMIN.LOGIN);
  };

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getAdminUnreadCountAPI();
      setUnreadCount(res?.count ?? 0);
    } catch {
      // bỏ qua lỗi poll ngầm
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setIsLoadingNotif(true);
    try {
      const res = await getAdminNotificationsAPI();
      setNotifications(res?.data ?? []);
    } catch {
      // bỏ qua lỗi fetch
    } finally {
      setIsLoadingNotif(false);
    }
  }, []);

  const handleToggleNotif = async () => {
    const willOpen = !notifOpen;
    setNotifOpen(willOpen);
    setUserMenuOpen(false);
    if (willOpen) {
      await fetchNotifications();
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationReadAPI(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // bỏ qua
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadAPI();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // bỏ qua
    }
  };

  // Poll unread count định kỳ
  useEffect(() => {
    fetchUnreadCount();
    const timer = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchUnreadCount]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userMenuItems = [
    {
      path: ROUTES.ADMIN.INFOMATION_AUTHORS,
      label: "Hồ sơ",
      icon: "👤",
      onClick: () => navigate(ROUTES.ADMIN.INFOMATION_AUTHORS),
    },
    {
      path: ROUTES.ADMIN.LOGOUT,
      label: "Đăng xuất",
      icon: <FaSignOutAlt />,
      onClick: handleLogout,
      isDanger: true,
    },
  ];

  return (
    <header className="admin-header">
      <div className="header-container">
        {/* Brand/Logo */}
        <div className="header-brand">
          <div
            className="logo"
            onClick={() => navigate(ROUTES.ADMIN.DASHBOARD)}
          >
            <span className="logo-icon">
              <img src={process.env.PUBLIC_URL + "/logoaudio.ico"} alt="BookAudio Logo" className="footer-brand-img" />
            </span>
            <span className="logo-text">Book Audio Management</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="header-actions">
          {/* Theme Toggle */}
          <button
            className="action-btn theme-toggle-btn"
            onClick={toggleTheme}
            title={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
            aria-label="Toggle theme"
            type="button"
          >
            {isDark ? <FaSun className="icon icon--sun" /> : <FaMoon className="icon" />}
          </button>

          {/* Notifications */}
          <div className="notif-wrapper" ref={notifRef}>
            <button
              className={`action-btn notification-btn ${notifOpen ? "active" : ""}`}
              title="Thông báo"
              onClick={handleToggleNotif}
            >
              <FaBell className={`icon${unreadCount > 0 ? " icon--unread" : ""}`} />
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
              )}
            </button>

            {notifOpen && (
              <div className="notif-dropdown">
                <div className="notif-header">
                  <h4 className="notif-title">Thông báo</h4>
                  {unreadCount > 0 && (
                    <button className="notif-mark-all" onClick={handleMarkAllRead}>
                      <FaCheck /> Đánh dấu tất cả đã xem
                    </button>
                  )}
                </div>

                <div className="notif-list">
                  {isLoadingNotif ? (
                    <div className="notif-loading">
                      <div className="notif-skeleton" />
                      <div className="notif-skeleton" />
                      <div className="notif-skeleton" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="notif-empty">
                      <span className="notif-empty-icon">🔔</span>
                      <p>Không có thông báo nào</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`notif-item ${!notif.is_read ? "unread" : ""}`}
                        onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                      >
                        <div className="notif-avatar-wrap">
                          {notif.actor?.avatar ? (
                            <img
                              src={getStorageUrl(notif.actor.avatar)}
                              alt={notif.actor.name}
                              className="notif-avatar"
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.actor?.name ?? "U")}&background=667eea&color=fff`;
                              }}
                            />
                          ) : (
                            <div className="notif-avatar notif-avatar-fallback">
                              {(notif.actor?.name ?? "U").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="notif-type-icon">
                            {getNotificationIcon(notif.type)}
                          </span>
                        </div>

                        <div className="notif-body">
                          <p className={`notif-message ${!notif.is_read ? "bold" : ""}`}>
                            {notif.message}
                          </p>
                          <span className="notif-time">
                            {formatRelativeTime(notif.created_at)}
                          </span>
                        </div>

                        {!notif.is_read && <span className="notif-dot" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="user-menu" ref={userMenuRef}>
            <button
              className="user-trigger"
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setNotifOpen(false);
              }}
            >
              {adminInfo?.avatar ? (
                <img
                  src={getStorageUrl(adminInfo.avatar)}
                  alt={adminInfo?.name || "Admin"}
                  className="user-avatar"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(adminInfo?.name || "Admin")}&background=2271b1&color=fff`;
                  }}
                />
              ) : (
                <div className="user-avatar avatar-fallback">
                  {adminInfo?.name ? adminInfo.name.charAt(0).toUpperCase() : "A"}
                </div>
              )}
              <span className="user-name">{adminInfo?.name || "Admin"}</span>
              <span className={`dropdown-arrow ${userMenuOpen ? "open" : ""}`}>
                ▼
              </span>
            </button>

            {userMenuOpen && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  {adminInfo?.avatar ? (
                    <img
                      src={getStorageUrl(adminInfo.avatar)}
                      alt={adminInfo?.username || adminInfo?.name || "Admin"}
                      className="dropdown-avatar"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(adminInfo?.name || "Admin")}&background=2271b1&color=fff`;
                      }}
                    />
                  ) : (
                    <div className="dropdown-avatar avatar-fallback">
                      {adminInfo?.name ? adminInfo.name.charAt(0).toUpperCase() : "A"}
                    </div>
                  )}
                  <div className="user-info">
                    <p className="user-full-name">
                      {adminInfo?.name || adminInfo?.className}
                    </p>
                    <p className="user-email">
                      {adminInfo?.email || "admin@blog.com"}
                    </p>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-menu">
                  {userMenuItems.map((item) => (
                    <button
                      key={item.path}
                      className={`dropdown-item ${item.isDanger ? "danger" : ""}`}
                      onClick={() => {
                        item.onClick();
                        setUserMenuOpen(false);
                      }}
                    >
                      <span className="item-icon">{item.icon}</span>
                      <span className="item-label">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default memo(HeaderAD);
