import { memo, useState, useEffect } from "react";
import {
  FaTachometerAlt, FaMailBulk, FaUser, FaChevronDown,
  FaTimes, FaCrown, FaMoneyCheckAlt, FaThumbtack,
  FaBullhorn, FaAd,
} from "react-icons/fa";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { BsFillFilePostFill } from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import { SiAudioboom } from "react-icons/si";
import "./style.scss";
import { ROUTES } from "utils/route";

const MENU_ITEMS = [
  { label: "Dashboard", icon: <FaTachometerAlt />, path: ROUTES.ADMIN.DASHBOARD },
  {
    label: "Giao Diện",
    icon: <MdOutlineDashboardCustomize />,
    children: [
      { label: "Tùy biến Header & Mùa", path: ROUTES.ADMIN.HEADER_CUSTOMIZER },
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
      { label: "Quản lý bộ truyện", path: ROUTES.ADMIN.MANAGE_COMMENTS_AUDIO },
      { label: "Quản lý chương truyện", path: ROUTES.ADMIN.AUDIO_ADD },
      { label: "Thể loại truyện", path: ROUTES.ADMIN.MANAGE_AUDIO_CATEGORY },
      { label: "Studio Giọng đọc AI", path: ROUTES.ADMIN.ADDFILEREAD },
      { label: "Quản lý nhạc nền", path: ROUTES.ADMIN.MANAGE_BACKGROUND_MUSIC },
    ],
  },
  {
    label: "Thông Báo & Cập Nhật",
    icon: <FaBullhorn />,
    children: [
      { label: "Bảo trì & Cập nhật", path: ROUTES.ADMIN.MAINTENANCE },
      { label: "Thông báo hệ thống", path: ROUTES.ADMIN.NOTEIFICATION },
      { label: "Quản lý Quảng cáo", path: ROUTES.ADMIN.MANAGE_ADVERTISEMENTS },
      { label: "Quản lý Tố cáo", path: ROUTES.ADMIN.MANAGE_REPORTS },
    ],
  },
  {
    label: "Membership",
    icon: <FaCrown />,
    children: [
      { label: "Gói đăng ký", path: ROUTES.ADMIN.ADD_MEMBERSHIP },
      { label: "Quản lý thành viên", path: ROUTES.ADMIN.MANAGE_USERS_MEMBERSHIP },
      { label: "Liên kết ngân hàng VietQR", path: ROUTES.ADMIN.MEMBERSHIP_VIETQR },
    ],
  },
  {
    label: "Doanh Thu",
    icon: <FaMoneyCheckAlt />,
    children: [
      { label: "Thống kê Doanh thu", path: ROUTES.ADMIN.REVENUE_STATISTICS },
      { label: "Quản lý giao dịch", path: ROUTES.ADMIN.MANAGE_TRANSACTIONS },
    ],
  },
];

const ACCOUNT_ITEMS = [
  {
    label: "  Tài Khoản",
    icon: <FaUser />,
    children: [
      { label: "Thông tin cá nhân", path: ROUTES.ADMIN.INFOMATION_AUTHORS },
      { label: "Thành viên quản trị", path: ROUTES.ADMIN.MANAGE_USERS_AUTHORS },
      { label: "Người dùng chưa kích hoạt", path: ROUTES.ADMIN.MANAGE_VIP_APPROVAL },
    ],
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const [isPinned, setIsPinned] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMouseEnter = () => setIsExpanded(true);
  const handleMouseLeave = () => {
    if (!isPinned) setIsExpanded(false);
  };

  const handleTogglePin = () => {
    const next = !isPinned;
    setIsPinned(next);
    // Khi ghim: giu expanded. Khi bo ghim: thu gon ngay
    if (!next) setIsExpanded(false);
    else setIsExpanded(true);
  };

  useEffect(() => {
    const mainContent = document.querySelector(".main-content");
    if (!mainContent) return;
    if (isExpanded) {
      mainContent.classList.add("sidebar-expanded");
    } else {
      mainContent.classList.remove("sidebar-expanded");
    }
  }, [isExpanded]);

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ [label]: !prev[label] }));
    if (!isExpanded) setIsExpanded(true);
  };

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
              <span className="sidebar-item__icon">{item.icon}</span>
              <span className="sidebar-item__label">{item.label}</span>
              <FaChevronDown className="sidebar-item__chevron" />
            </button>
            <div className={`sidebar-submenu ${isOpen && isExpanded ? "is-open" : ""}`}>
              {item.children.map((child) => (
                <button
                  key={child.path}
                  className={`sidebar-subitem ${location.pathname === child.path ? "active" : ""}`}
                  onClick={() => navigate(child.path)}
                  type="button"
                >
                  <span className="dot" />
                  <span className="sidebar-item__label">{child.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      }
      return (
        <button
          key={item.path}
          className={`sidebar-item ${location.pathname === item.path ? "active" : ""}`}
          onClick={() => navigate(item.path)}
          type="button"
        >
          <span className="sidebar-item__icon">{item.icon}</span>
          <span className="sidebar-item__label">{item.label}</span>
        </button>
      );
    });

  return (
    <aside
      className={`sidebar ${isExpanded ? "is-expanded" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-header__logo">
          <span className="sidebar-item__label sidebar-header__title">Blog Admin</span>
        </div>
        <button
          className={`sidebar-header__pin-btn ${isPinned ? "is-pinned" : ""}`}
          onClick={handleTogglePin}
          type="button"
          title={isPinned ? "Bo ghim (tu thu gon khi roi chuot)" : "Ghim mo co dinh"}
        >
          {isPinned ? <FaTimes /> : <FaThumbtack />}
        </button>
      </div>

      {/* Main Menu */}
      <nav className="sidebar-menu">
        <div className="menu-section">
          <div className="section-title sidebar-item__label">Menu</div>
          <div className="menu-items">{renderMenu(MENU_ITEMS)}</div>
        </div>
      </nav>

      {/* Account Section */}
      <div className="sidebar-bottom">
        <div className="menu-section">
          <div className="section-title sidebar-item__label">Tai Khoan</div>
          <div className="menu-items">{renderMenu(ACCOUNT_ITEMS)}</div>
        </div>
      </div>
    </aside>
  );
};

export default memo(Sidebar);