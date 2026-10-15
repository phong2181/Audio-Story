import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FaUser,
    FaEnvelope,
    FaLock,
    FaHistory,
    FaEdit,
    FaCamera,
    FaSave,
    FaHeart,
    FaChevronRight,
    FaCrown,
    FaGem,
    FaHome,
    FaHeadphones,
    FaCommentDots,
    FaStar,
    FaCheckCircle,
    FaArrowRight,
    FaShieldAlt
} from "react-icons/fa";
import { useUpdateProfile, useGetUserActivityHistory, useGetFavorites } from "api/homePage";
import { getStorageUrl } from "config/config";
import "./style.scss";

const ProfilePage = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState("account"); // 'account' | 'favorites' | 'history' | 'membership'

    // State quản lý thông báo
    const [notification, setNotification] = useState({
        show: false,
        message: "",
        type: "success" // "success" hoặc "error"
    });

    // Các state form
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");

    const updateProfileMutation = useUpdateProfile();
    const { data: activityHistoryData, isLoading: isActivityHistoryLoading } = useGetUserActivityHistory();
    const { data: favoritesData, isLoading: isFavoritesLoading } = useGetFavorites();

    useEffect(() => {
        document.title = "Hồ Sơ Thành Viên - Audio Story";
    }, []);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("USER"));
        if (storedUser) {
            setUserInfo(storedUser);
            setName(storedUser.name || "");
            setEmail(storedUser.email || "");

            if (storedUser.avatar) {
                if (storedUser.avatar.startsWith('http')) {
                    setAvatarPreview(storedUser.avatar);
                } else {
                    setAvatarPreview(getStorageUrl(storedUser.avatar));
                }
            } else {
                setAvatarPreview("");
            }
        }
    }, []);

    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [notification.show]);

    const getInitials = (fullName) => {
        if (!fullName) return "?";
        const words = fullName.trim().split(" ");
        const lastWord = words[words.length - 1];
        return lastWord ? lastWord.charAt(0).toUpperCase() : "?";
    };

    // Kiểm tra trạng thái gói thành viên
    const checkMembershipStatus = () => {
        if (!userInfo) {
            return { isVip: false, isAdminOrStaff: false, message: "Chưa đăng ký gói" };
        }

        if (userInfo.role === "admin" || userInfo.role === "staff") {
            return {
                isVip: true,
                isAdminOrStaff: true,
                message: `Tài khoản ${userInfo.role === "admin" ? "Quản trị viên" : "Nhân viên"}`
            };
        }

        if (!userInfo.vip_expires_at) {
            return { isVip: false, isAdminOrStaff: false, message: "Chưa đăng ký gói" };
        }

        const expireDate = new Date(userInfo.vip_expires_at);
        const now = new Date();

        if (expireDate > now) {
            return {
                isVip: true,
                isAdminOrStaff: false,
                dateString: expireDate.toLocaleDateString("vi-VN"),
                message: `Thành viên VIP (Hết hạn: ${expireDate.toLocaleDateString("vi-VN")})`
            };
        }

        return { isVip: false, isAdminOrStaff: false, message: "Gói thành viên đã hết hạn" };
    };

    const membership = checkMembershipStatus();

    const handleSave = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        if (avatarFile) {
            formData.append("avatar", avatarFile);
        }
        if (currentPassword && newPassword) {
            formData.append("current_password", currentPassword);
            formData.append("new_password", newPassword);
        }

        updateProfileMutation.mutate(formData, {
            onSuccess: (res) => {
                setNotification({
                    show: true,
                    message: "Cập nhật thông tin thành công!",
                    type: "success"
                });
                setIsEditing(false);

                const userData = res?.data?.user || res?.user || res;
                if (userData) {
                    setUserInfo(userData);
                    localStorage.setItem("USER", JSON.stringify(userData));

                    if (userData.avatar) {
                        if (userData.avatar.startsWith('http')) {
                            setAvatarPreview(userData.avatar);
                        } else {
                            setAvatarPreview(getStorageUrl(userData.avatar));
                        }
                    }
                }

                setCurrentPassword("");
                setNewPassword("");
            },
            onError: (err) => {
                setNotification({
                    show: true,
                    message: err.response?.data?.message || err.message || "Đã có lỗi xảy ra.",
                    type: "error"
                });
            }
        });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onload = (event) => setAvatarPreview(event.target.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="profile-wp-page">
            {/* Thông báo nổi (Toast Notification) */}
            {notification.show && (
                <div className={`wp-profile-toast ${notification.type}`}>
                    <span>{notification.message}</span>
                </div>
            )}

            <div className="container-wp">
                {/* WordPress Breadcrumb Bar */}
                <nav className="profile-wp-breadcrumbs" aria-label="Breadcrumb">
                    <Link to="/" className="crumb-link"><FaHome /> Trang chủ</Link>
                    <FaChevronRight className="crumb-sep" />
                    <span className="crumb-current">Tài khoản & Hồ sơ</span>
                </nav>

                {/* WordPress Hero Cover Banner & Profile Showcase */}
                <header className="profile-hero-showcase">
                    <div className="showcase-cover-bg" />
                    <div className="showcase-inner">
                        <div className="showcase-avatar-col">
                            <div className="avatar-frame">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="user-avatar-img" />
                                ) : (
                                    <div className="user-avatar-placeholder">{getInitials(userInfo?.name)}</div>
                                )}

                                <label className="btn-camera-upload" title="Thay đổi ảnh đại diện">
                                    <FaCamera />
                                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                                </label>
                            </div>
                        </div>

                        <div className="showcase-meta-col">
                            <div className="name-role-row">
                                <h1 className="user-display-name">{userInfo ? userInfo.name : "Thành viên"}</h1>
                                <span className={`wp-role-badge ${membership.isVip ? "is-vip" : ""}`}>
                                    {membership.isAdminOrStaff ? (
                                        <><FaShieldAlt /> {userInfo?.role === 'admin' ? 'Quản Trị Viên' : 'Nhân Viên'}</>
                                    ) : membership.isVip ? (
                                        <><FaCrown /> Thành Viên VIP</>
                                    ) : (
                                        "Thành Viên Thường"
                                    )}
                                </span>
                            </div>

                            <p className="user-email-text">{userInfo ? userInfo.email : "email@example.com"}</p>

                            <div className="quick-stats-row">
                                <div className="stat-pill" onClick={() => setActiveTab("favorites")}>
                                    <FaHeart className="stat-icon heart" />
                                    <span><strong>{favoritesData?.length || 0}</strong> truyện yêu thích</span>
                                </div>
                                <div className="stat-pill" onClick={() => setActiveTab("history")}>
                                    <FaHistory className="stat-icon history" />
                                    <span><strong>{activityHistoryData?.data?.length || 0}</strong> hoạt động</span>
                                </div>
                                <div className="stat-pill" onClick={() => setActiveTab("membership")}>
                                    <FaGem className="stat-icon gem" />
                                    <span>{membership.message}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Bố cục WordPress Member Portal: Sidebar Tabs (280px) + Main Content (1fr) */}
                <div className="profile-portal-layout">

                    {/* CỘT TRÁI: MENU ĐIỀU HƯỚNG TÀI KHOẢN (WORDPRESS MEMBER MENU) */}
                    <aside className="portal-sidebar-nav">
                        <div className="sidebar-menu-card">
                            <div className="menu-header">
                                <h3>Quản Lý Tài Khoản</h3>
                            </div>

                            <nav className="portal-tabs-menu">
                                <button
                                    className={`tab-menu-item ${activeTab === 'account' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('account')}
                                >
                                    <FaUser className="item-icon" />
                                    <span>Thông tin tài khoản</span>
                                    <FaChevronRight className="arrow-icon" />
                                </button>

                                <button
                                    className={`tab-menu-item ${activeTab === 'favorites' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('favorites')}
                                >
                                    <FaHeart className="item-icon" />
                                    <span>Truyện yêu thích</span>
                                    <span className="count-badge">{favoritesData?.length || 0}</span>
                                </button>

                                <button
                                    className={`tab-menu-item ${activeTab === 'history' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('history')}
                                >
                                    <FaHistory className="item-icon" />
                                    <span>Lịch sử hoạt động</span>
                                    <span className="count-badge">{activityHistoryData?.data?.length || 0}</span>
                                </button>

                                <button
                                    className={`tab-menu-item ${activeTab === 'membership' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('membership')}
                                >
                                    <FaCrown className="item-icon vip-icon" />
                                    <span>Gói thành viên VIP</span>
                                    <FaChevronRight className="arrow-icon" />
                                </button>
                            </nav>
                        </div>

                        {/* Thẻ quảng bá VIP nhỏ ở góc dưới sidebar */}
                        {!membership.isVip && (
                            <div className="sidebar-vip-ad-card">
                                <div className="ad-icon"><FaCrown /></div>
                                <h4>Nâng Cấp Gói VIP</h4>
                                <p>Mở khóa toàn bộ các chương audio độc quyền, không dính quảng cáo.</p>
                                <Link to="/membership" className="btn-ad-upgrade">
                                    Nâng cấp ngay <FaArrowRight />
                                </Link>
                            </div>
                        )}
                    </aside>

                    {/* CỘT PHẢI: NỘI DUNG TƯƠNG ỨNG TỪNG TAB */}
                    <main className="portal-content-main">

                        {/* TAB 1: THÔNG TIN TÀI KHOẢN (HỒ SƠ & ĐỔI MẬT KHẨU) */}
                        {activeTab === 'account' && (
                            <section className="portal-card account-card">
                                <div className="portal-card-header">
                                    <div>
                                        <h2 className="card-title">Hồ Sơ Cá Nhân</h2>
                                        <p className="card-subtitle">Quản lý và cập nhật thông tin tài khoản của bạn</p>
                                    </div>
                                    <button
                                        className={`btn-toggle-edit ${isEditing ? 'cancel' : ''}`}
                                        onClick={() => setIsEditing(!isEditing)}
                                    >
                                        <FaEdit /> {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa hồ sơ"}
                                    </button>
                                </div>

                                {!isEditing ? (
                                    <div className="account-details-grid">
                                        <div className="detail-row">
                                            <span className="detail-label"><FaUser /> Họ và tên</span>
                                            <span className="detail-value">{userInfo ? userInfo.name : "Chưa cập nhật"}</span>
                                        </div>

                                        <div className="detail-row">
                                            <span className="detail-label"><FaEnvelope /> Email đăng nhập</span>
                                            <span className="detail-value">{userInfo ? userInfo.email : "Chưa cập nhật"}</span>
                                        </div>

                                        <div className="detail-row">
                                            <span className="detail-label"><FaShieldAlt /> Vai trò tài khoản</span>
                                            <span className="detail-value">
                                                {membership.isAdminOrStaff ? (
                                                    <strong style={{ color: '#10b981' }}>Quản trị hệ thống</strong>
                                                ) : membership.isVip ? (
                                                    <strong style={{ color: '#f59e0b' }}>Hội viên VIP</strong>
                                                ) : (
                                                    "Người dùng cơ bản"
                                                )}
                                            </span>
                                        </div>

                                        <div className="detail-row">
                                            <span className="detail-label"><FaGem /> Trạng thái hội viên</span>
                                            <span className="detail-value">{membership.message}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <form className="wp-profile-form" onSubmit={handleSave}>
                                        <div className="form-group-row">
                                            <div className="form-group">
                                                <label>Họ và tên</label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    required
                                                    placeholder="Nhập họ và tên..."
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Email đăng nhập</label>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    placeholder="name@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-divider" />

                                        <h3 className="section-form-title"><FaLock /> Đổi mật khẩu đăng nhập</h3>
                                        <p className="section-form-hint">Để trống nếu bạn không có nhu cầu đổi mật khẩu</p>

                                        <div className="form-group-row">
                                            <div className="form-group">
                                                <label>Mật khẩu hiện tại</label>
                                                <input
                                                    type="password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Mật khẩu mới</label>
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-actions-bottom">
                                            <button
                                                type="submit"
                                                className="btn-save-profile"
                                                disabled={updateProfileMutation.isPending}
                                            >
                                                <FaSave /> {updateProfileMutation.isPending ? "Đang lưu thay đổi..." : "Lưu thay đổi"}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </section>
                        )}

                        {/* TAB 2: TRUYỆN YÊU THÍCH (FAVORITES) */}
                        {activeTab === 'favorites' && (
                            <section className="portal-card favorites-card">
                                <div className="portal-card-header">
                                    <div>
                                        <h2 className="card-title">Bộ Truyện Yêu Thích</h2>
                                        <p className="card-subtitle">Những bộ truyện audio bạn đã lưu vào thư viện cá nhân</p>
                                    </div>
                                    <span className="count-pill">{favoritesData?.length || 0} truyện</span>
                                </div>

                                {isFavoritesLoading ? (
                                    <div className="loading-state-box">
                                        <div className="spinner-small" />
                                        <span>Đang tải danh sách yêu thích...</span>
                                    </div>
                                ) : favoritesData && favoritesData.length > 0 ? (
                                    <div className="favorites-grid">
                                        {favoritesData.map((story) => (
                                            <div key={story.id} className="fav-story-card">
                                                <div className="fav-thumb-wrap">
                                                    <img
                                                        src={story.thumbnail ? getStorageUrl(story.thumbnail) : "https://picsum.photos/120/160"}
                                                        alt={story.title}
                                                        className="fav-thumb-img"
                                                        onError={(e) => { e.target.src = "https://picsum.photos/120/160"; }}
                                                    />
                                                </div>

                                                <div className="fav-info-wrap">
                                                    <h4 className="fav-story-title">{story.title}</h4>
                                                    <span className="fav-author">Tác giả: {story.author || "Chưa cập nhật"}</span>
                                                    <span className="fav-category">Thể loại: {story.category || "Audio Story"}</span>

                                                    <Link to={`/story/${story.slug}`} className="btn-listen-now">
                                                        <FaHeadphones /> Nghe ngay <FaChevronRight className="arrow" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-favorites-box">
                                        <FaHeart className="empty-icon" />
                                        <h4>Chưa có truyện nào trong danh sách yêu thích</h4>
                                        <p>Khám phá kho truyện audio hấp dẫn và bấm nút "Yêu thích" để lưu vào đây nhé.</p>
                                        <Link to="/truyen" className="btn-explore-link">
                                            Khám phá kho truyện <FaArrowRight />
                                        </Link>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* TAB 3: LỊCH SỬ HOẠT ĐỘNG (ACTIVITY TIMELINE) */}
                        {activeTab === 'history' && (
                            <section className="portal-card history-card">
                                <div className="portal-card-header">
                                    <div>
                                        <h2 className="card-title">Lịch Sử Hoạt Động</h2>
                                        <p className="card-subtitle">Nhật ký nghe truyện, bình luận và đánh giá của bạn</p>
                                    </div>
                                    <span className="count-pill">{activityHistoryData?.data?.length || 0} mục</span>
                                </div>

                                {isActivityHistoryLoading ? (
                                    <div className="loading-state-box">
                                        <div className="spinner-small" />
                                        <span>Đang tải lịch sử hoạt động...</span>
                                    </div>
                                ) : activityHistoryData?.data && activityHistoryData.data.length > 0 ? (
                                    <div className="activity-timeline-list">
                                        {activityHistoryData.data.map((item) => (
                                            <div key={`${item.type}-${item.id}`} className={`timeline-item ${item.type}`}>
                                                <div className="timeline-badge-icon">
                                                    {item.type === 'view' && <FaHeadphones />}
                                                    {item.type === 'comment' && <FaCommentDots />}
                                                    {item.type === 'review' && <FaStar />}
                                                </div>

                                                <div className="timeline-content-card">
                                                    <div className="timeline-top-row">
                                                        <span className={`activity-type-tag ${item.type}`}>
                                                            {item.type === 'view' && 'Nghe truyện'}
                                                            {item.type === 'comment' && 'Bình luận'}
                                                            {item.type === 'review' && 'Đánh giá'}
                                                        </span>
                                                        <span className="activity-date">
                                                            {new Date(item.created_at).toLocaleString("vi-VN")}
                                                        </span>
                                                    </div>

                                                    <h4 className="timeline-story-name">
                                                        {item.story?.name || "Bộ truyện audio"}
                                                    </h4>

                                                    {item.chapter?.name && (
                                                        <span className="timeline-chapter-name">
                                                            Tập: {item.chapter.name}
                                                        </span>
                                                    )}

                                                    {item.type === 'comment' && item.content && (
                                                        <blockquote className="timeline-quote">
                                                            "{item.content}"
                                                        </blockquote>
                                                    )}

                                                    {item.type === 'review' && (
                                                        <div className="timeline-rating-row">
                                                            <span className="stars-value">⭐ {item.rating}/5 sao</span>
                                                            {item.content && <p className="review-text">"{item.content}"</p>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-history-box">
                                        <FaHistory className="empty-icon" />
                                        <h4>Chưa ghi nhận hoạt động nào</h4>
                                        <p>Các tập truyện bạn nghe, bình luận và đánh giá sẽ được lưu lại tại đây.</p>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* TAB 4: GÓI THÀNH VIÊN VIP (MEMBERSHIP & PERKS) */}
                        {activeTab === 'membership' && (
                            <section className="portal-card membership-card">
                                <div className="portal-card-header">
                                    <div>
                                        <h2 className="card-title">Gói Hội Viên & Đặc Quyền</h2>
                                        <p className="card-subtitle">Trải nghiệm âm thanh không giới hạn, tốc độ cao không quảng cáo</p>
                                    </div>
                                </div>

                                <div className="membership-hero-box">
                                    {membership.isVip ? (
                                        <div className="vip-status-banner active">
                                            <div className="status-crown-icon"><FaCrown /></div>
                                            <div className="status-info">
                                                {membership.isAdminOrStaff ? (
                                                    <>
                                                        <h3>Tài Khoản Đặc Quyền Quản Trị</h3>
                                                        <p>Bạn đang đăng nhập với tư cách: <strong>{userInfo?.role === 'admin' ? 'Quản Trị Viên' : 'Thành Viên Quản Trị'}</strong></p>
                                                        <small>Toàn quyền truy cập mọi nội dung VIP và chức năng quản lý hệ thống.</small>
                                                    </>
                                                ) : (
                                                    <>
                                                        <h3>Bạn Đang Sở Hữu Gói Hội Viên VIP!</h3>
                                                        <p>Thời hạn gói: <strong>Đến hết ngày {membership.dateString}</strong></p>
                                                        <small>Cảm ơn bạn đã luôn đồng hành và ủng hộ nền tảng Audio Story!</small>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="vip-status-banner expired">
                                            <div className="status-crown-icon"><FaGem /></div>
                                            <div className="status-info">
                                                <h3>Bạn Đang Dùng Tài Khoản Cơ Bản</h3>
                                                <p>Nâng cấp lên gói VIP để mở khóa toàn bộ các tập truyện độc quyền và âm thanh chất lượng cao 320kbps.</p>
                                                <Link to="/membership" className="btn-upgrade-action">
                                                    Đăng ký gói VIP <FaArrowRight />
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    <div className="vip-perks-checklist">
                                        <h4>Đặc quyền dành riêng cho Hội viên VIP:</h4>
                                        <div className="perks-grid">
                                            <div className="perk-item">
                                                <FaCheckCircle className="check-icon" />
                                                <div>
                                                    <strong>Mở khóa toàn bộ chương VIP</strong>
                                                    <p>Nghe không giới hạn các chương truyện đặc sắc độc quyền.</p>
                                                </div>
                                            </div>
                                            <div className="perk-item">
                                                <FaCheckCircle className="check-icon" />
                                                <div>
                                                    <strong>Không dính quảng cáo</strong>
                                                    <p>Trải nghiệm nghe truyện liền mạch, thư giãn tuyệt đối.</p>
                                                </div>
                                            </div>
                                            <div className="perk-item">
                                                <FaCheckCircle className="check-icon" />
                                                <div>
                                                    <strong>Chất lượng âm thanh 320kbps</strong>
                                                    <p>Giọng đọc truyền cảm, trong trẻo, chân thực từng chi tiết.</p>
                                                </div>
                                            </div>
                                            <div className="perk-item">
                                                <FaCheckCircle className="check-icon" />
                                                <div>
                                                    <strong>Cập nhật tập mới sớm nhất</strong>
                                                    <p>Ưu tiên thưởng thức các tập mới ra mắt trước người dùng khác.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                    </main>

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;