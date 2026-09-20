import React, { useState, useEffect, useRef } from "react";
import {
    FaBook,
    FaHome,
    FaBars,
    FaTimes,
    FaSignOutAlt,
    FaUser,
    FaCrown,
    FaMoon,
    FaSun
} from "react-icons/fa";
import { RiArticleLine } from "react-icons/ri";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import AuthDialog from "../../LoginRigister/index";
import "./style.scss";
import { STORAGE_URL } from "config/config";
import { useTheme } from "context/ThemeContext";

// Helper lấy URL avatar đúng
const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith("http")) return avatar;
    return `${STORAGE_URL}/${avatar}`;
};

// Component Avatar nhỏ dùng cho Header
const UserAvatar = ({ avatar, name, size = 36 }) => {
    const [imgError, setImgError] = useState(false);
    const avatarUrl = getAvatarUrl(avatar);

    return (
        <div style={{
            width: size, height: size, borderRadius: "50%",
            overflow: "hidden", flexShrink: 0,
            backgroundColor: "#6c63ff",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #fff",
            cursor: "pointer",
        }}>
            {avatarUrl && !imgError ? (
                <img
                    src={avatarUrl}
                    alt={name || "avatar"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={() => setImgError(true)}
                />
            ) : (
                <span style={{ color: "#fff", fontWeight: "bold", fontSize: size * 0.4 }}>
                    {name?.[0]?.toUpperCase() || <FaUser />}
                </span>
            )}
        </div>
    );
};

const ThemeToggleButton = ({ className = "" }) => {
    const { isDark, toggleTheme } = useTheme();
    return (
        <button
            type="button"
            className={`theme-toggle ${className}`}
            onClick={toggleTheme}
            title={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? <FaSun /> : <FaMoon />}
            <span className="theme-toggle-label">{isDark ? "Sáng" : "Tối"}</span>
        </button>
    );
};

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(true);
    const headerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Nếu click ra ngoài headerRef thì đóng mobile menu
            if (headerRef.current && !headerRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    const userInfo = JSON.parse(localStorage.getItem("USER"));
    const isUserVip = userInfo?.membership_plan_id === 1 || userInfo?.membership_plan_id === "";

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("USER");
        localStorage.removeItem("ACCESS_TOKEN");
        navigate("/");
        window.location.reload();
    };

    const handleOpenLogin = () => {
        setIsLoginMode(true);
        setIsAuthOpen(true);
    };

    const location = useLocation();

    const navClass = (path) => {
        const current = location.pathname;
        if (path === "/") {
            return current === "/" ? "nav-item active" : "nav-item";
        }

        if (path === "/truyen") {
            const isActive = current.startsWith("/truyen") || current.startsWith("/story");
            return isActive ? "nav-item active" : "nav-item";
        }

        if (path === "/bai-viet") {
            const isActive = current.startsWith("/bai-viet") || current.startsWith("/post");
            return isActive ? "nav-item active" : "nav-item";
        }
        return current.startsWith(path) ? "nav-item active" : "nav-item";
    };

    const mobileNavItems = [
        { to: "/", className: navClass("/"), end: true, icon: <FaHome />, label: "Trang chủ" },
        { to: "/truyen", className: navClass("/truyen"), icon: <FaBook />, label: "Truyện" },
        { to: "/bai-viet", className: navClass("/bai-viet"), icon: <RiArticleLine />, label: "Bài viết" },
    ];

    return (
        <header className="site-header" ref={headerRef}>
            <div className="header-container">
                {/* Logo */}
                <Link to="/" className="logo-wrapper">
                    <div className="logo-icon">
                        <img src={process.env.PUBLIC_URL + "/logoaudio.ico"} alt="BookAudio Logo" className="footer-brand-img" />
                    </div>
                    <span className="logo-text">Audio <span className="logo-sub">Sotry</span></span>
                </Link>


                {/* Menu điều hướng desktop */}
                <nav className="nav-menu">
                    <NavLink to="/" className={navClass("/")} end>
                        <FaHome /> Trang chủ
                    </NavLink>
                    <NavLink to="/truyen" className={navClass("/truyen")}>
                        <FaBook /> Kho truyện
                    </NavLink>
                    <NavLink to="/bai-viet" className={navClass("/bai-viet")}>
                        <RiArticleLine /> Bài Viết
                    </NavLink>
                </nav>

                {/* Khu vực tài khoản */}
                <div className="user-section">
                    <div className="user-actions">
                        {/* Nút chuyển chế độ sáng/tối */}
                        <ThemeToggleButton />

                        {userInfo ? (
                            <div className="user-logged">
                                {/* Avatar thay cho tên + icon */}
                                {!isUserVip && (
                                    <Link to="/membership" title="Mở Thành Viên">
                                        <FaCrown />
                                    </Link>
                                )}
                                <Link to="/profile" title={userInfo.name}>
                                    <UserAvatar avatar={userInfo.avatar} name={userInfo.name} size={36} />
                                </Link>
                                <button className="logout-btn" onClick={handleLogout} title="Đăng xuất">
                                    <FaSignOutAlt />
                                </button>
                            </div>
                        ) : (
                            <div className="user-guest">
                                <button className="login-btn" onClick={handleOpenLogin}>
                                    Đăng nhập
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Nút mở menu mobile */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* Menu mobile */}
            <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
                <nav className="mobile-nav-links">
                    {/* Nút chuyển chế độ sáng/tối trên mobile */}
                    <ThemeToggleButton className="mobile-theme-toggle" />
                    {!userInfo ? (
                        <button className="mobile-login" onClick={() => { handleOpenLogin(); setIsMobileMenuOpen(false); }}>
                            Đăng nhập
                        </button>
                    ) : (
                        <>
                            {/* Avatar + tên trong mobile menu */}
                            {!isUserVip && (
                                <Link to="/membership" title="Mở Thành Viên">
                                    <FaCrown style={{ color: "#ed1b33", bottom: 10, width: "18px", height: "18px", border: "2px solid #fff", borderRadius: "50%" }} /> Mở Thành Viên
                                </Link>
                            )}
                            <button className="mobile-logout" onClick={handleLogout}>
                                <FaSignOutAlt /> Đăng xuất
                            </button>
                        </>
                    )}
                </nav>
            </div>

            {isAuthOpen && (
                <AuthDialog
                    onClose={() => setIsAuthOpen(false)}
                    isLogin={isLoginMode}
                />
            )}

            <div className="mobile-bottom-nav">
                {mobileNavItems.map((item) => {
                    const current = location.pathname;
                    let active = false;

                    if (item.to === "/") {
                        active = current === "/";
                    } else if (item.to === "/truyen") {
                        active =
                            current.startsWith("/truyen") ||
                            current.startsWith("/story");
                    } else if (item.to === "/bai-viet") {
                        active =
                            current.startsWith("/bai-viet") ||
                            current.startsWith("/post");
                    }

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={
                                active
                                    ? "bottom-nav-item active"
                                    : "bottom-nav-item"
                            }
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {item.icon}
                            <span className="nav-label">{item.label}</span>
                        </NavLink>
                    );
                })}
                {userInfo ? (
                    <NavLink
                        to="/profile"
                        className={({ isActive }) => isActive ? "bottom-nav-item active" : "bottom-nav-item"}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <FaUser />
                        <span className="nav-label">Tài khoản</span>
                    </NavLink>
                ) : (
                    <button
                        type="button"
                        className="bottom-nav-item"
                        onClick={() => { handleOpenLogin(); setIsMobileMenuOpen(false); }}
                    >
                        <FaUser />
                        <span className="nav-label">Đăng nhập</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;