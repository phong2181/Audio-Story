import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaWordpress,
  FaTachometerAlt,
  FaPlus,
  FaBullhorn,
  FaUsers,
  FaUser,
  FaSignOutAlt,
  FaExternalLinkAlt,
  FaAd
} from "react-icons/fa";
import { getAdminInfo, isAdminLoggedIn, logoutAdmin } from "utils/adminAuth";
import { ROUTES } from "utils/route";
import { STORAGE_URL } from "config/config";
import "./style.scss";

const WPAdminBar = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Kiểm tra xem có adminInfo hoặc USER trong localStorage với role admin/staff
    let admin = getAdminInfo();
    if (!admin) {
      try {
        const rawUser = localStorage.getItem("USER");
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          if (parsed && (parsed.role === "admin" || parsed.role === "staff")) {
            admin = parsed;
          }
        }
      } catch (e) {
        console.error("Error reading user info:", e);
      }
    }

    if (admin && (admin.role === "admin" || admin.role === "staff")) {
      setCurrentUser(admin);
      document.body.classList.add("has-wpadminbar");
    } else {
      setCurrentUser(null);
      document.body.classList.remove("has-wpadminbar");
    }

    return () => {
      document.body.classList.remove("has-wpadminbar");
    };
  }, []);

  // Nếu là user thường (client) hoặc chưa đăng nhập admin -> KHÔNG HIỂN THỊ
  if (!currentUser) return null;

  const handleLogout = () => {
    logoutAdmin();
    // Xóa session client nếu có
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("ADMIN_TOKEN");
    localStorage.removeItem("USER");
    setCurrentUser(null);
    document.body.classList.remove("has-wpadminbar");
    navigate(ROUTES.USER.HOME);
    window.location.reload();
  };

  const avatarSrc = currentUser.avatar
    ? currentUser.avatar.startsWith("http")
      ? currentUser.avatar
      : `${STORAGE_URL}/${currentUser.avatar}`
    : null;

  return (
    <div id="wpadminbar" role="navigation" aria-label="Thanh quản trị WordPress">
      <div className="quicklinks">
        {/* Menu bên trái */}
        <ul className="ab-top-menu ab-left">
          {/* Logo WordPress */}
          <li className="menupop wp-logo-item">
            <Link to={ROUTES.ADMIN.DASHBOARD} className="ab-item" title="Bảng tin Quản trị Audio Story">
              <FaWordpress className="ab-icon wp-icon" />
            </Link>
          </li>

          {/* Tên Site + Dashboard */}
          <li className="menupop site-name-item">
            <Link to={ROUTES.ADMIN.DASHBOARD} className="ab-item">
              <FaTachometerAlt className="ab-icon" />
              <span className="ab-label">Bảng tin Quản trị</span>
            </Link>
            <div className="ab-sub-wrapper">
              <ul className="ab-submenu">
                <li>
                  <Link to={ROUTES.ADMIN.DASHBOARD} className="ab-item">
                    Dashboard chính
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.ADMIN.All_POSTS} className="ab-item">
                    Tất cả bài viết
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.ADMIN.MANAGE_COMMENTS_AUDIO} className="ab-item">
                    Quản lý bộ truyện
                  </Link>
                </li>
              </ul>
            </div>
          </li>

          {/* Nút Thêm mới (+ Mới) */}
          <li className="menupop new-content-item">
            <span className="ab-item">
              <FaPlus className="ab-icon" />
              <span className="ab-label">Thêm mới</span>
            </span>
            <div className="ab-sub-wrapper">
              <ul className="ab-submenu">
                <li>
                  <Link to={ROUTES.ADMIN.POSTS_ADD} className="ab-item">
                    Bài viết mới
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.ADMIN.AUDIO_ADD} className="ab-item">
                    Chương truyện mới
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.ADMIN.MANAGE_ADVERTISEMENTS} className="ab-item">
                    Banner Quảng cáo Brand
                  </Link>
                </li>
              </ul>
            </div>
          </li>

          {/* Lối tắt Thông báo hệ thống */}
          <li className="menupop noti-item">
            <Link to={ROUTES.ADMIN.NOTEIFICATION} className="ab-item" title="Cấu hình thông báo toàn website">
              <FaBullhorn className="ab-icon" />
              <span className="ab-label">Thông báo</span>
            </Link>
          </li>

          {/* Lối tắt Quản lý Quảng cáo */}
          <li className="menupop ad-item">
            <Link to={ROUTES.ADMIN.MANAGE_ADVERTISEMENTS} className="ab-item" title="Quản lý quảng cáo Brand">
              <FaAd className="ab-icon" />
              <span className="ab-label">Quảng cáo Brand</span>
            </Link>
          </li>

          {/* Lối tắt Người dùng */}
          <li className="menupop users-item">
            <Link to={ROUTES.ADMIN.MANAGE_USERS_AUTHORS} className="ab-item" title="Quản lý thành viên & kiểm duyệt">
              <FaUsers className="ab-icon" />
              <span className="ab-label">Thành viên</span>
            </Link>
          </li>
        </ul>

        {/* Menu bên phải: Chào admin + Tài khoản */}
        <ul className="ab-top-menu ab-right">
          <li className="menupop my-account-item">
            <Link to={ROUTES.ADMIN.INFOMATION_AUTHORS} className="ab-item">
              <span className="howdy">Chào, {currentUser.name || "Admin"}</span>
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" className="ab-avatar" />
              ) : (
                <span className="ab-avatar-fallback">
                  <FaUser />
                </span>
              )}
            </Link>
            <div className="ab-sub-wrapper ab-sub-right">
              <ul className="ab-submenu">
                <li className="user-profile-header">
                  {avatarSrc && <img src={avatarSrc} alt="Avatar" className="large-avatar" />}
                  <div className="user-info-text">
                    <strong>{currentUser.name}</strong>
                    <span className="user-role-badge">
                      {currentUser.role === "admin" ? "Quản trị viên" : "Nhân viên"}
                    </span>
                  </div>
                </li>
                <li className="divider"></li>
                <li>
                  <Link to={ROUTES.ADMIN.INFOMATION_AUTHORS} className="ab-item">
                    <FaUser className="ab-icon" /> Sửa hồ sơ của tôi
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.ADMIN.DASHBOARD} className="ab-item">
                    <FaTachometerAlt className="ab-icon" /> Vào trang quản trị Dashboard
                  </Link>
                </li>
                <li className="divider"></li>
                <li>
                  <button type="button" className="ab-item btn-logout-wp" onClick={handleLogout}>
                    <FaSignOutAlt className="ab-icon" /> Đăng xuất tài khoản
                  </button>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default WPAdminBar;
