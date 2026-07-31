import React, { memo, useEffect, useState } from "react";
import { getAdminInfo, saveAdminAuth, getAdminToken } from "utils/adminAuth";
import { 
  FaCamera, FaEdit, 
  FaFacebook, FaQrcode, FaBookOpen, FaFileAlt, FaLock, FaSave,
  FaTiktok
} from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { uploadAvatarAPI, changePasswordAPI } from "api/homePage/request"; 
import { useUpdateProfileAdmin, useGetAuthorContent } from "api/homePage/queries"; 
import { MdEmail } from "react-icons/md";
// 🔥 TÍCH HỢP: Import Toast và CSS đi kèm
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.scss";
import { STORAGE_URL } from "config/config";

// ─── COMPONENT: MEDIA HEADER (AVATAR & COVER) ───────────────────────────────
const MediaHeader = ({
  currentAvatar,
  currentCover,
  onAvatarChange,
  onCoverChange,
  isUploading,
  isEditingInfo
}) => {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const handleAvatarFile = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        onAvatarChange(file); // <-- gọi ngay
      };

      reader.readAsDataURL(file);
    }
  };

  const handleCoverFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
      if (onCoverChange) onCoverChange(file);
    }
  };

  return (
    <div className="profile-media-header">
      {/* Khung Ảnh Bìa */}
      <div className="cover-wrapper" style={{ width: "100%" }}>
        <img
            src={
                `${STORAGE_URL}${currentCover}` ||
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200"
            }
            alt="Cover"
            className="cover-img"
        />
        {isEditingInfo && (
            <>
              <label htmlFor="cover-input" className="upload-cover-btn">
                <FaCamera /> <span>Thay ảnh bìa</span>
              </label>

              <input
                id="cover-input"
                type="file"
                accept="image/*"
                onChange={handleCoverFile}
                hidden
              />
            </>
          )}
      </div>

      {/* Khung Ảnh Đại Diện (Avatar) */}
      <div className="avatar-position-box">
        <div className={`avatar-container ${isUploading ? "loading" : ""}`}>
          <img src={avatarPreview || `${STORAGE_URL}${currentAvatar}`} alt="Admin Avatar" className="main-avatar" />
          {isEditingInfo && (
            <>
              <label htmlFor="avatar-input" className="upload-avatar-badge">
                <FaCamera />
              </label>

              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                hidden
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT: PROFILE ADMIN ───────────────────────────────────────────
const ProfileAdmin = () => {
  useEffect(() => {
    document.title = "Thông tin cá nhân";
  }, []);

  const adminInfo = getAdminInfo();
  const token = getAdminToken();
  
  const defaultAvatarUrl = "https://www.w3schools.com/howto/img_avatar.png";
  const defaultQrUrl = "https://api.vietqr.io/image/970422-123456789-Q66V7wV.jpg?accountName=ADMIN&amount=50000&addInfo=Ung%20ho";

  // Các Hooks Mutation & Query kết nối Backend Laravel
  const updateProfileMutation = useUpdateProfileAdmin();
  const { data: contentData, isLoading: isContentLoading } = useGetAuthorContent();

  // Trích xuất mảng an toàn từ data trả về của TanStack Query
  const rawData = contentData?.data?.status === 'success' ? contentData?.data?.data : contentData?.data;
  const userPosts = rawData?.posts || [];
  const userSeries = rawData?.stories || [];

  // ─── States Quản Lý Giao Diện & Dữ Liệu ───
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  
  const [socialLinks, setSocialLinks] = useState({
    facebook: adminInfo?.social_links?.facebook || "",
    tiktok: adminInfo?.social_links?.tiktok || "",
    zalo: adminInfo?.social_links?.zalo || "",
    phone: adminInfo?.social_links?.phone || ""
  });

  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (adminInfo?.social_links) {
      setSocialLinks({
        facebook: adminInfo.social_links.facebook || "",
        tiktok: adminInfo.social_links.tiktok || "",
        zalo: adminInfo.social_links.zalo || "",
        phone: adminInfo.social_links.phone || ""
      });
    }
    if (adminInfo?.qr_url) {
      setQrPreview(adminInfo.qr_url);
    }
  }, [adminInfo?.qr_url]);

  const [coverFile, setCoverFile] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState(adminInfo?.qr_url ? adminInfo.qr_url : defaultQrUrl);

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  // Mutation Upload Avatar riêng lẻ
  const uploadMutation = useMutation({
    mutationFn: (formData) => uploadAvatarAPI(formData),
    onSuccess: (res) => {
      if (res && res.avatar_url) {
        const updatedInfo = { ...adminInfo, avatar: res.avatar_url };
        saveAdminAuth(token, updatedInfo);
        // 🔥 ĐÃ SỬA: Thay đổi sang toast.success
        toast.success("Cập nhật ảnh đại diện thành công!");
        setTimeout(() => window.location.reload(), 1200); 
      }
    },
    onError: (err) => toast.error(err.response?.data?.message || "Lỗi upload ảnh ảnh"),
  });

  // Mutation Đổi mật khẩu
  const passwordMutation = useMutation({
    mutationFn: (data) => changePasswordAPI(data),
    onSuccess: () => {
      // 🔥 ĐÃ SỬA: Thay đổi sang toast.success
      toast.success("Đổi mật khẩu bảo mật thành công!");
      setPasswordForm({ current_password: "", new_password: "", new_password_confirmation: "" });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Lỗi đổi mật khẩu"),
  });

  const handleQrChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý nút bấm "Lưu thông tin" (Gửi FormData tích hợp lên Laravel)
  const handleToggleEdit = () => {
    if (isEditingInfo) {
      // 🔍 BƯỚC KIỂM TRA: Nếu không đổi gì thì đóng form luôn, tránh gửi request rỗng làm crash backend
      const isSocialUnchanged = 
        socialLinks.facebook === (adminInfo?.social_links?.facebook || "") &&
        socialLinks.tiktok === (adminInfo?.social_links?.tiktok || "") &&
        socialLinks.zalo === (adminInfo?.social_links?.zalo || "") &&
        socialLinks.phone === (adminInfo?.social_links?.phone || "");

      if (!coverFile && !qrFile && isSocialUnchanged) {
        setIsEditingInfo(false);
        toast.info("Không có thông tin nào thay đổi.");
        return;
      }

      const formData = new FormData();
      formData.append("phone", socialLinks.phone);
      formData.append("facebook", socialLinks.facebook);
      formData.append("tiktok", socialLinks.tiktok);
      formData.append("zalo", socialLinks.zalo);

      if (avatarFile) formData.append("avatar", avatarFile);
      if (coverFile) formData.append("cover", coverFile);
      if (qrFile) formData.append("qr_code", qrFile);

      updateProfileMutation.mutate(formData, {
        onSuccess: (res) => {
          const responseData = res?.data?.data ? res.data.data : (res?.data ? res.data : res);
          const userData = responseData?.user;

          if (!userData) {
            setIsEditingInfo(false);
            toast.warn("Hồ sơ giữ nguyên do phản hồi trống từ Server.");
            return;
          }

          const updatedInfo = { 
            ...adminInfo, 
            cover_url: userData.cover_url,
            qr_url: userData.qr_url,
            social_links: userData.social_links
          };
          
          saveAdminAuth(token, updatedInfo);
          // 🔥 ĐÃ SỬA: Thay đổi sang toast.success ngọt ngào
          toast.success("Cập nhật thông tin tài khoản thành công!");
          setIsEditingInfo(false);
          setTimeout(() => window.location.reload(), 1200);
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Có lỗi xảy ra khi cập nhật hồ sơ!");
        }
      });
      return;
    }
    setIsEditingInfo(true);
  };

  console.log("Admin Info for Debugging:", adminInfo) // 🔍 DEBUG: Log thông tin admin để kiểm tra dữ liệu

  return (
    <div className="modern-profile-container">
      {/* 🔥 CONTAINER ĐỂ HIỂN THỊ CÁC THÔNG BÁO TOAST */}
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} />
      
      {/* 1. Khu Vực Media Header */}
      <MediaHeader
        currentAvatar={adminInfo?.avatar ? `${adminInfo.avatar}` : defaultAvatarUrl}
        
        currentCover={adminInfo?.cover_url ? adminInfo.cover_url : null}
        onAvatarChange={(file) => setAvatarFile(file)}
        onCoverChange={(file) => setCoverFile(file)}
        isUploading={uploadMutation.isPending}
        isEditingInfo={isEditingInfo}
      />

      {/* 2. Tiêu Đề Hồ Sơ & Nút Điều Khiển */}
      <div className="profile-meta-hero">
        <div className="user-title">
          <h2>{adminInfo?.name || "N/A"}</h2>
          <p>
            <span className="badge-role">
              {adminInfo?.role === "admin" ? "Quản Trị Viên" : adminInfo?.role === "staff" ? "Thành Viên Quản Trị" : "Biên tập viên"}
            </span> · {adminInfo?.email}
          </p>
        </div>
        <div className="hero-actions">
          <button 
            type="button" 
            className={`btn-edit-toggle ${isEditingInfo ? "active-editing" : ""}`} 
            disabled={updateProfileMutation.isPending}
            onClick={handleToggleEdit}
          >
            {updateProfileMutation.isPending ? (
              "Đang lưu dữ liệu..."
            ) : isEditingInfo ? (
              <>
                <FaSave style={{ marginRight: 6 }} /> Lưu thông tin
              </>
            ) : (
              <>
                <FaEdit style={{ marginRight: 6 }} /> Chỉnh sửa hồ sơ
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Bố Cục Lưới 2 Cột Biểu Mẫu */}
      <div className="profile-grid-layout">
        
        {/* ── CỘT TRÁI: SIDEBAR THÔNG TIN LIÊN HỆ & QR ── */}
        <aside className="profile-sidebar">
          <div className="sidebar-card">
            <h4 className="card-title">Thông tin liên hệ</h4>
            <div className="card-content">
              {isEditingInfo ? (
                <div className="edit-social-form">
                  <div className="input-field">
                    <label>Link Facebook</label>
                    <input type="text" value={socialLinks.facebook} onChange={e => setSocialLinks({...socialLinks, facebook: e.target.value})} />
                  </div>
                  <div className="input-field">
                    <label>Link TikTok</label>
                    <input type="text" value={socialLinks.tiktok} onChange={e => setSocialLinks({...socialLinks, tiktok: e.target.value})} />
                  </div>
                  <div className="input-field">
                    <label>Số Zalo</label>
                    <input type="text" value={socialLinks.zalo} onChange={e => setSocialLinks({...socialLinks, zalo: e.target.value})} />
                  </div>
                </div>
              ) : (
                <ul className="info-list-links">
                  <li><MdEmail className="icon web" /> <span style={{color: '#475569'}}>{adminInfo?.email}</span></li>
                  {socialLinks.facebook && <li><FaFacebook className="icon fb" /> <a href={socialLinks.facebook} target="_blank" rel="noreferrer">Facebook cá nhân</a></li>}
                  {socialLinks.tiktok && <li><FaTiktok className="icon gh" /> <a href={socialLinks.tiktok} target="_blank" rel="noreferrer">Kênh TikTok</a></li>}
                  {socialLinks.zalo && <li><SiZalo className="icon zl" style={{color: '#0068ff'}} /> <span style={{color: '#475569'}}>Zalo: {socialLinks.zalo}</span></li>}
                </ul>
              )}
            </div>
          </div>

          <div className="sidebar-card qr-donate-card">
            <h4 className="card-title"><FaQrcode /> Ủng hộ tác giả</h4>
            <p className="qr-hint">Quét mã QR để mời tác giả một ly cà phê nếu bạn yêu thích các nội dung chia sẻ.</p>
            
            <div className={`qr-image-wrapper ${isEditingInfo ? "editable" : ""}`}>
              <img src={`${STORAGE_URL}${qrPreview}`} alt="Mã QR Donate Ngân hàng" className="qr-code-img" />
              {isEditingInfo && (
                <label htmlFor="qr-file-input" className="change-qr-overlay">
                  <FaCamera />
                  <span>Thay mã QR</span>
                </label>
              )}
              <input id="qr-file-input" type="file" accept="image/*" onChange={handleQrChange} hidden />
            </div>
          </div>
        </aside>

        {/* ── CỘT PHẢI: NỘI DUNG TABS ĐỘNG DỮ LIỆU THẬT ── */}
        <main className="profile-main-content">
          <div className="profile-tabs-nav">
            <button className={`tab-btn ${activeTab === "posts" ? "active" : ""}`} onClick={() => setActiveTab("posts")}>
              <FaFileAlt /> Bài viết đã đăng ({isContentLoading ? "..." : userPosts.length})
            </button>
            <button className={`tab-btn ${activeTab === "series" ? "active" : ""}`} onClick={() => setActiveTab("series")}>
              <FaBookOpen /> Bộ truyện quản lý ({isContentLoading ? "..." : userSeries.length})
            </button>
            <button className={`tab-btn ${activeTab === "security" ? "active" : ""}`} onClick={() => setActiveTab("security")}>
              <FaLock /> Bảo mật tài khoản
            </button>
          </div>

          <div className="tab-body-container">
            {isContentLoading && <div className="loading-text" style={{padding: '20px', color: '#64748b'}}>Đang tải danh sách dữ liệu từ hệ thống...</div>}

            {/* TAB BÀI VIẾT */}
            {!isContentLoading && activeTab === "posts" && (
              <div className="posts-list-tab">
                {userPosts.length === 0 ? (
                  <p className="empty-hint" style={{padding: '20px', color: '#94a3b8', textAlign: 'center'}}>Bạn chưa có bài viết nào công khai trên hệ thống.</p>
                ) : (
                  userPosts.map(p => (
                    <div key={p.id} className="data-item-card">
                      <div className="item-details">
                        <h5>{p.title}</h5>
                        <span>Ngày đăng: {new Date(p.created_at).toLocaleDateString('vi-VN')} · 👁️ {p.views || 0} lượt xem</span>
                      </div>
                      <button className="btn-view-link">Xem chi tiết</button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB BỘ TRUYỆN */}
            {!isContentLoading && activeTab === "series" && (
              <div className="series-list-tab">
                {userSeries.length === 0 ? (
                  <p className="empty-hint" style={{padding: '20px', color: '#94a3b8', textAlign: 'center'}}>Tài khoản này chưa phụ trách bộ truyện nào.</p>
                ) : (
                  userSeries.map(s => (
                    <div key={s.id} className="data-item-card series-card">
                      <div className="item-details">
                        <h5>{s.title}</h5> 
                        <span>Quy mô: <strong>{s.chapters_count || 0} chương</strong> · Trạng thái: <em className="status-badge">{s.status || "Đang cập nhật"}</em></span>
                      </div>
                      <button className="btn-view-link btn-manage">Quản lý chương</button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB BẢO MẬT */}
            {activeTab === "security" && (
              <form className="password-form-wrapper" onSubmit={(e) => {
                e.preventDefault();
                if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
                  toast.warning("Mật khẩu xác nhận không trùng khớp!"); return;
                }
                passwordMutation.mutate(passwordForm);
              }}>
                <div className="form-group">
                  <label>Mật khẩu hiện tại</label>
                  <input type="password" value={passwordForm.current_password} onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})} placeholder="********" required />
                </div>
                <div className="form-group">
                  <label>Mật khẩu mới</label>
                  <input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})} placeholder="********" required />
                </div>
                <div className="form-group">
                  <label>Xác nhận mật khẩu mới</label>
                  <input type="password" value={passwordForm.new_password_confirmation} onChange={(e) => setPasswordForm({...passwordForm, new_password_confirmation: e.target.value})} placeholder="********" required />
                </div>
                <button type="submit" className="btn-update-password" disabled={passwordMutation.isPending}>
                  {passwordMutation.isPending ? "Đang xử lý..." : "Cập nhật mật khẩu bảo mật"}
                </button>
              </form>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default memo(ProfileAdmin);