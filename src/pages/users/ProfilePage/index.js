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
    FaGem
} from "react-icons/fa";
import { useUpdateProfile, useGetUserActivityHistory, useGetFavorites } from "api/homePage";
import "./style.scss";

const ProfilePage = () => {
    const [userInfo, setUserInfo] = useState(null);
    console.log("Hiện: ", userInfo)
    const [isEditing, setIsEditing] = useState(false);
    
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
        document.title = "Thông tin cá nhân";
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
                    setAvatarPreview(`${process.env.REACT_APP_STORAGE_URL || 'http://bloger.test'}/storage/${storedUser.avatar}`);
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
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification.show]);

    const getInitials = (fullName) => {
        if (!fullName) return "?";
        const words = fullName.trim().split(" ");
        const lastWord = words[words.length - 1];
        return lastWord ? lastWord.charAt(0).toUpperCase() : "?";
    };

    // 🎯 HÀM KIỂM TRA TRẠNG THÁI THÀNH VIÊN (Đã sửa đổi logic loại trừ Admin/Staff)
    const checkMembershipStatus = () => {
        if (!userInfo) {
            return { isVip: false, isAdminOrStaff: false, message: "Chưa đăng ký gói" };
        }

        // 🌟 Bước 1: Nếu là Admin hoặc Staff, mặc định cấp đặc quyền VIP vĩnh viễn
        if (userInfo.role === "admin" || userInfo.role === "staff") {
            return {
                isVip: true,
                isAdminOrStaff: true,
                message: `Tài khoản ${userInfo.role === "admin" ? "Quản trị viên" : "Nhân viên"}`
            };
        }
        
        // Bước 2: Đối với User thường (Client) -> Kiểm tra hạn VIP bình thường
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
                message: `Bạn đã là Thành viên (Hết hạn: ${expireDate.toLocaleDateString("vi-VN")})` 
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
                            setAvatarPreview(`${process.env.REACT_APP_STORAGE_URL || 'http://bloger.test'}/storage/${userData.avatar}`);
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
        <div className="container profile-page">
            {notification.show && (
                <div style={{
                    position: "fixed",
                    top: "80px",
                    right: "24px",
                    backgroundColor: notification.type === "success" ? "#28a745" : "#dc3545",
                    color: "#ffffff",
                    padding: "12px 20px",
                    borderRadius: "6px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    zIndex: "9999",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "14px",
                    fontWeight: "500",
                    animation: "slideIn 0.3s ease-in-out",
                }}>
                    {notification.message}
                    <style>{`
                        @keyframes slideIn {
                            from { transform: translateX(100px); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
                        }
                    `}</style>
                </div>
            )}

            <div className="row">
                <div className="col-lg-4">
                    <div className="profile-header">
                        <div className="avatar-wrapper">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Profile Avatar" className="profile-avatar" />
                            ) : (
                                <div className="profile-avatar-initials">{getInitials(userInfo?.name)}</div>
                            )}

                            {isEditing && (
                                <label className="change-avatar-btn" title="Thay đổi ảnh đại diện">
                                    <FaCamera />
                                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                                </label>
                            )}
                        </div>
                        <h1 className="profile-name">{userInfo ? userInfo.name : "Tên thành viên"}</h1>
                        <p className="profile-email">{userInfo ? userInfo.email : "email@example.com"}</p>
                        
                        {/* Định dạng badge dựa theo trạng thái VIP */}
                        <span className={`badge-role ${membership.isVip ? "role-vip" : ""}`}>
                            {membership.isAdminOrStaff ? (
                                <>{userInfo?.role === 'admin' ? 'Quản Trị Viên' : 'Thành Viên Quản Trị'}</>
                            ) : membership.isVip ? (
                                <><FaCrown /> Thành viên VIP</>
                            ) : (
                                "Thành viên thường"
                            )}
                        </span>
                    </div>

                    {/* 🎯 KHU VỰC HIỂN THỊ THÔNG TIN GÓI THÀNH VIÊN (Yêu cầu mới) */}
                    {/* 🎯 KHU VỰC HIỂN THỊ THÔNG TIN GÓI THÀNH VIÊN */}
                    <div className="membership-card-status">
                        {membership.isVip ? (
                            <div className="membership-active">
                                <div className="status-icon"><FaCrown /></div>
                                {/* Kiểm tra nếu là Admin/Staff thì hiển thị thông báo đặc quyền */}
                                {membership.isAdminOrStaff ? (
                                    <>
                                        <h4>Tài khoản Đặc quyền</h4>
                                        <p>Vai trò: <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{userInfo?.role === 'admin' ? 'Quản Trị Viên' : 'Thành Viên Quản Trị'}</span></p>
                                        <small>Bạn có toàn quyền truy cập và quản lý nội dung trên hệ thống.</small>
                                    </>
                                ) : (
                                    <>
                                        <h4>Bạn đã là thành viên VIP</h4>
                                        <p>Ngày hết hạn: <span>{membership.dateString}</span></p>
                                        <small>Cảm ơn bạn đã ủng hộ nền tảng đọc truyện!</small>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="membership-expired">
                                <div className="status-icon"><FaGem /></div>
                                <h4>Gói dịch vụ cao cấp</h4>
                                <p>Đăng ký gói hội viên để nghe những bộ truyện giới hạn.</p>
                                <Link to="/membership" className="btn-register-vip">
                                    Xem các gói đăng ký <FaChevronRight />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-lg-8">
                    <div className="profile-content">
                        <div className="content-header">
                            <h2>Hồ sơ của bạn</h2>
                            <button className="edit-toggle-btn" onClick={() => setIsEditing(!isEditing)}>
                                <FaEdit /> {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa hồ sơ"}
                            </button>
                        </div>

                        {!isEditing ? (
                            <div className="profile-info-view">
                                <div className="info-group">
                                    <label><FaUser /> Họ và tên:</label>
                                    <span>{userInfo ? userInfo.name : "Chưa cập nhật"}</span>
                                </div>
                                <div className="info-group">
                                    <label><FaEnvelope /> Email:</label>
                                    <span>{userInfo ? userInfo.email : "Chưa cập nhật"}</span>
                                </div>
                            </div>
                        ) : (
                            <form className="profile-form" onSubmit={handleSave}>
                                <div className="form-group">
                                    <label>Họ và tên</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Email đăng nhập</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>

                                <div className="divider-line"></div>

                                <h4 className="form-section-title"><FaLock /> Đổi mật khẩu (Không bắt buộc)</h4>
                                <div className="form-group">
                                    <label>Mật khẩu hiện tại</label>
                                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
                                </div>
                                <div className="form-group">
                                    <label>Mật khẩu mới</label>
                                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
                                </div>

                                <button type="submit" className="save-btn" disabled={updateProfileMutation.isPending}>
                                    <FaSave /> {updateProfileMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Lịch sử hoạt động */}  
                    <div className="history-section">
                        <h3><FaHistory /> Lịch sử hoạt động</h3>
                        {isActivityHistoryLoading ? (
                            <LoadingState type="profile" />
                        ) : (
                            <ul className="history-list">
                                {activityHistoryData?.data && activityHistoryData.data.length > 0 ? (
                                    activityHistoryData.data.map((item) => (
                                        <li key={`${item.type}-${item.id}`} className="history-item">
                                            <div className="history-info">
                                                {item.type === 'view' && (
                                                    <><span className="activity-type view">Đọc truyện</span><span className="story-title">{item.story?.name || "Truyện không xác định"}</span><span className="chapter-title">Chương: {item.chapter?.name || "Chưa cập nhật"}</span></>
                                                )}
                                                {item.type === 'comment' && (
                                                    <><span className="activity-type comment">Bình luận</span><span className="story-title">{item.story?.name || "Truyện không xác định"}</span><span className="chapter-title">Chương: {item.chapter?.name || "Chưa cập nhật"}</span><span className="comment-content">"{item.content?.substring(0, 100)}{item.content?.length > 100 ? '...' : ''}"</span></>
                                                )}
                                                {item.type === 'review' && (
                                                    <><span className="activity-type review">Đánh giá</span><span className="story-title">{item.story?.name || "Truyện không xác định"}</span><span className="rating">⭐ {item.rating}/5</span>{item.content && (<span className="review-content">"{item.content?.substring(0, 100)}{item.content?.length > 100 ? '...' : ''}"</span>)}</>
                                                )}
                                            </div>
                                            <span className="history-time">{new Date(item.created_at).toLocaleString("vi-VN")}</span>
                                        </li>
                                    ))
                                ) : ( <p className="empty-text">Chưa có lịch sử hoạt động nào.</p> )}
                            </ul>
                        )}
                    </div>

                    {/* Danh sách yêu thích */}
                    <div className="favorites-section">
                        <h3><FaHeart /> Danh sách bộ truyện yêu thích</h3>
                        {isFavoritesLoading ? (
                            <LoadingState type="profile" />
                        ) : (
                            <div className="favorites-list">
                                {favoritesData && favoritesData.length > 0 ? (
                                    favoritesData.map((story) => (
                                        <div key={story.id} className="favorite-item">
                                            <img src={story.thumbnail || "https://picsum.photos/100/150"} alt={story.title} className="favorite-image" />
                                            <div className="favorite-info">
                                                <h4 className="favorite-title">{story.title}</h4>
                                                <p className="favorite-author">Tác giả: {story.author || "Chưa cập nhật"}</p>
                                                <p className="favorite-category">Thể loại: {story.category || "Chưa cập nhật"}</p>
                                            </div>
                                            <Link to={`/story/${story.slug}`} className="favorite-link" title="Xem chi tiết"><FaChevronRight /></Link>
                                        </div>
                                    ))
                                ) : ( <p className="empty-text">Chưa có bộ truyện yêu thích nào.</p> )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const LoadingState = ({ type = "default" }) => {
    return (
        <div className={`loading-wrapper ${type}`}>
            <div className="loading-card">
                <div className="loading-avatar shimmer"></div>
                <div className="loading-lines">
                    <div className="line shimmer w-80"></div>
                    <div className="line shimmer w-60"></div>
                </div>
            </div>

            <div className="loading-list">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div className="loading-item" key={i}>
                        <div className="shimmer box"></div>
                        <div className="loading-text">
                            <div className="line shimmer w-90"></div>
                            <div className="line shimmer w-70"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfilePage;