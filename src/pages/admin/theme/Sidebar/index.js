import { memo, useState } from "react";
import {
  FaTachometerAlt,
  FaMailBulk,
  FaUser,
  FaChevronDown,
  FaBars,
  FaTimes,
  FaCrown,
  FaMoneyCheckAlt,
} from "react-icons/fa";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { BsFillFilePostFill } from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import { SiAudioboom } from "react-icons/si";
import "./style.scss";
import { ROUTES } from "utils/route";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  // Thêm state để phân biệt "collapsed vĩnh viễn" vs "collapsed tạm thời"
  const [isPinned, setIsPinned] = useState(false); // true = user đã bấm nút pin
  const [isCollapsed, setIsCollapsed] = useState(true); // mặc định thu gọn

  const handleMouseEnter = () => setIsCollapsed(false);
  const handleMouseLeave = () => {
    if (!isPinned) setIsCollapsed(true);
};

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: <FaTachometerAlt />,
      path: ROUTES.ADMIN.DASHBOARD,
    },
    {
      label: "Giao Diện",
      icon: <MdOutlineDashboardCustomize />,
      children: [
        { label: "Quản lý footer", path: ROUTES.ADMIN.FOOTERS },
      ],
    },
    {
      label: "Bài Viết",
      icon: <BsFillFilePostFill />,
      children: [
        { label: "Thêm bài viết mới", path: ROUTES.ADMIN.POSTS_ADD },
        { label: "Tất cả bài viết", path: ROUTES.ADMIN.All_POSTS },
        { label: "Danh mục bài viết", path: ROUTES.ADMIN.POSTS_CATEGORY },
      ],
    },
{
      label: "Truyện Audio",
      icon: <SiAudioboom />,
      children: [
        { label: "Đăng truyện mới", path: ROUTES.ADMIN.AUDIO_ADD },
        { label: "Thể loại truyện", path: ROUTES.ADMIN.MANAGE_AUDIO_CATEGORY },
        { label: "Quản lý bộ truyện", path: ROUTES.ADMIN.MANAGE_COMMENTS_AUDIO },
        { label: "Quản lý nhạc nền", path: ROUTES.ADMIN.MANAGE_BACKGROUND_MUSIC },
      ],
    },
    {
      label: "Thư Tín",
      icon: <FaMailBulk />,
      children: [
        { label: "Phản hồi từ người dùng", path: ROUTES.ADMIN.LETTER_FEEDBACK },
        { label: "Thông báo", path: ROUTES.ADMIN.NOTEIFICATION },
      ],
    },
    {
      label: "Membership",
      icon: <FaCrown />,
      children: [
        { label: "Gói đăng ký", path: ROUTES.ADMIN.ADD_MEMBERSHIP },
        { label: "Quản lý thành viên", path: ROUTES.ADMIN.MANAGE_USERS_MEMBERSHIP },
      ],
    },
    {
      label: "Doanh Thu",
      icon: <FaMoneyCheckAlt />,
      children: [
        { label: "Thống kê doanh thu", path: ROUTES.ADMIN.REVENUE_STATISTICS },
        { label: "Quản lý giao dịch", path: ROUTES.ADMIN.MANAGE_TRANSACTIONS },
      ],
    }
  ];

  const accountItems = [
    {
      label: "Tài Khoản",
      icon: <FaUser />,
      children: [
        { label: "Thông tin cá nhân", path: ROUTES.ADMIN.INFOMATION_AUTHORS },
        { label: "Thành viên quảng trị", path: ROUTES.ADMIN.MANAGE_USERS_AUTHORS },
        { label: "Người dùng chưa kích hoạt", path: ROUTES.ADMIN.MANAGE_VIP_APPROVAL },
      ],
    },
  ];

  const renderMenu = (items) =>
    items.map((item) => {
      if (item.children) {
        const isOpen = openMenus[item.label];
        return (
          <div key={item.label} className="sidebar-dropdown">
            <button
              className={`sidebar-item ${isOpen ? "open" : ""}`}
              onClick={() => toggleMenu(item.label)}
              type="button"
            >
              <span className="icon">{item.icon}</span>
              {!isCollapsed && (
                <>
                  <span className="label">{item.label}</span>
                  <FaChevronDown className="chevron" />
                </>
              )}
            </button>
            {isOpen && !isCollapsed && (
              <div className="sidebar-submenu">
                {item.children.map((child) => (
                  <button
                    key={child.path}
                    className={`sidebar-subitem ${
                      location.pathname === child.path ? "active" : ""
                    }`}
                    onClick={() => navigate(child.path)}
                    type="button"
                  >
                    <span className="dot"></span>
                    {child.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      }

      return (
        <button
          key={item.path}
          className={`sidebar-item ${
            location.pathname === item.path ? "active" : ""
          }`}
          onClick={() => navigate(item.path)}
          type="button"
        >
          <span className="icon">{item.icon}</span>
          {!isCollapsed && <span className="label">{item.label}</span>}
        </button>
      );
    });

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="logo-section">
          {!isCollapsed && <span className="logo-text">Blog Admin</span>}
        </div>
        <button
          className={`collapse-btn ${isPinned ? "pinned" : ""}`}
          onClick={() => setIsPinned(!isPinned)}
          type="button"
          title={isPinned ? "Bỏ ghim (tự thu gọn khi rời chuột)" : "Ghim mở cố định"}
        >
          {isPinned ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Main Menu */}
      <nav className="sidebar-menu">
        <div className="menu-section">
          {!isCollapsed && <div className="section-title">Menu</div>}
          <div className="menu-items">{renderMenu(menuItems)}</div>
        </div>
      </nav>

      {/* Account Section */}
      <div className="sidebar-bottom">
        <div className="menu-section account-section">
          {!isCollapsed && <div className="section-title">Tài Khoản</div>}
          <div className="menu-items">{renderMenu(accountItems)}</div>
        </div>
      </div>
    </aside>
  );
};

export default memo(Sidebar);
