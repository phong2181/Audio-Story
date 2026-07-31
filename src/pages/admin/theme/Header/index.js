import { FaSignOutAlt } from "react-icons/fa";
import { MdEmail, MdNotifications } from "react-icons/md";
import "./style.scss";
import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "utils/route";
import { logoutAdmin, getAdminInfo } from "utils/adminAuth";
import { STORAGE_URL } from "config/config";


const HeaderAD = ({ child, ...props }) => {
  const navigate = useNavigate();
  const adminInfo = getAdminInfo();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  

  const handleLogout = () => {
    logoutAdmin();
    navigate(ROUTES.ADMIN.LOGIN);
  };

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
          {/* Notifications */}
          <button className="action-btn notification-btn" title="Thông báo">
            <MdNotifications className="icon" />
            <span className="badge">3</span>
          </button>

          {/* Messages */}
          <button className="action-btn mail-btn" title="Tin nhắn">
            <MdEmail className="icon" />
            <span className="badge">5</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="user-menu">
            <button
              className="user-trigger"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              {adminInfo?.avatar ? (
                <img
                  src={`${STORAGE_URL}${adminInfo.avatar}`}
                  alt={adminInfo?.name}
                  className="user-avatar"
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
                      src={adminInfo.avatar}
                      alt={adminInfo?.username || adminInfo?.name}
                      className="dropdown-avatar"
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
