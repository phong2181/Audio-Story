import React, { memo, useEffect, useState } from "react";
import { getAdminInfo, saveAdminAuth, getAdminToken } from "utils/adminAuth";
import {
  FaUser,
  FaCamera,
  FaFacebook,
  FaTiktok,
  FaQrcode,
  FaLock,
  FaSave,
  FaShieldAlt,
  FaBookOpen,
  FaFileAlt,
  FaCheckCircle,
  FaKey,
  FaImage
} from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { uploadAvatarAPI, changePasswordAPI } from "api/homePage/request";
import { useUpdateProfileAdmin, useGetAuthorContent } from "api/homePage/queries";
import { toast } from "react-toastify";
import { STORAGE_URL } from "config/config";
import "./style.scss";

const ProfileAdmin = () => {
  useEffect(() => {
    document.title = "Hồ sơ cá nhân | WordPress Admin";
  }, []);

  const adminInfo = getAdminInfo();
  const token = getAdminToken();

  const defaultAvatarUrl = "https://www.w3schools.com/howto/img_avatar.png";
  const defaultCoverUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200";

  // TanStack Query & Mutation hooks
  const updateProfileMutation = useUpdateProfileAdmin();
  const { data: contentData, isLoading: isContentLoading } = useGetAuthorContent();

  const rawData = contentData?.data?.status === "success" ? contentData?.data?.data : contentData?.data;
  const userPosts = rawData?.posts || [];
  const userSeries = rawData?.stories || [];

  // Form states
  const [name, setName] = useState(adminInfo?.name || "");
  const [socialLinks, setSocialLinks] = useState({
    facebook: adminInfo?.social_links?.facebook || "",
    tiktok: adminInfo?.social_links?.tiktok || "",
    zalo: adminInfo?.social_links?.zalo || "",
    phone: adminInfo?.social_links?.phone || ""
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    adminInfo?.avatar ? (adminInfo.avatar.startsWith("http") ? adminInfo.avatar : `${STORAGE_URL}/${adminInfo.avatar}`) : defaultAvatarUrl
  );

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(
    adminInfo?.cover_url ? (adminInfo.cover_url.startsWith("http") ? adminInfo.cover_url : `${STORAGE_URL}/${adminInfo.cover_url}`) : defaultCoverUrl
  );

  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState(
    adminInfo?.qr_url ? (adminInfo.qr_url.startsWith("http") ? adminInfo.qr_url : `${STORAGE_URL}/${adminInfo.qr_url}`) : null
  );

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: ""
  });

  useEffect(() => {
    if (adminInfo) {
      setName(adminInfo.name || "");
      if (adminInfo.social_links) {
        setSocialLinks({
          facebook: adminInfo.social_links.facebook || "",
          tiktok: adminInfo.social_links.tiktok || "",
          zalo: adminInfo.social_links.zalo || "",
          phone: adminInfo.social_links.phone || ""
        });
      }
    }
  }, [adminInfo?.name]);

  // Handle avatar file selection
  const handleAvatarFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle cover file selection
  const handleCoverFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle QR code file selection
  const handleQrFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setQrPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Mutation change password
  const passwordMutation = useMutation({
    mutationFn: (data) => changePasswordAPI(data),
    onSuccess: () => {
      toast.success("Đổi mật khẩu bảo mật thành công!");
      setPasswordForm({ current_password: "", new_password: "", new_password_confirmation: "" });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Lỗi đổi mật khẩu!");
    }
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.current_password) {
      toast.warn("Vui lòng nhập mật khẩu hiện tại!");
      return;
    }
    if (!passwordForm.new_password || passwordForm.new_password.length < 6) {
      toast.warn("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast.warn("Xác nhận mật khẩu mới không khớp!");
      return;
    }
    passwordMutation.mutate(passwordForm);
  };

  // Save profile information
  const handleSaveProfile = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", socialLinks.phone);
    formData.append("facebook", socialLinks.facebook);
    formData.append("tiktok", socialLinks.tiktok);
    formData.append("zalo", socialLinks.zalo);

    if (avatarFile) formData.append("avatar", avatarFile);
    if (coverFile) formData.append("cover", coverFile);
    if (qrFile) formData.append("qr_code", qrFile);

    updateProfileMutation.mutate(formData, {
      onSuccess: (res) => {
        const responseData = res?.data?.data ? res.data.data : res?.data ? res.data : res;
        const userData = responseData?.user;

        if (userData) {
          const updatedInfo = {
            ...adminInfo,
            name: userData.name || name,
            avatar: userData.avatar || adminInfo?.avatar,
            cover_url: userData.cover_url || adminInfo?.cover_url,
            qr_url: userData.qr_url || adminInfo?.qr_url,
            social_links: userData.social_links || socialLinks
          };
          saveAdminAuth(token, updatedInfo);
        }
        toast.success("Cập nhật thông tin hồ sơ thành công!");
        setAvatarFile(null);
        setCoverFile(null);
        setQrFile(null);
      },
      onError: (err) => {
        console.error(err);
        toast.error(err.response?.data?.message || "Lỗi khi cập nhật hồ sơ!");
      }
    });
  };

  const roleLabel = adminInfo?.role === "admin" ? "Quản trị viên (Administrator)" : "Nhân viên biên tập (Editor / Staff)";

  return (
    <div className="wp-profile-wrap">
      {/* WordPress Page Header */}
      <div className="wp-profile-header">
        <div className="header-left">
          <FaUser className="header-icon" />
          <div>
            <h1>Hồ Sơ Cá Nhân</h1>
            <p className="subtitle">
              Quản lý thông tin tài khoản, danh tính hiển thị công khai, mạng xã hội và mật khẩu bảo mật theo tiêu chuẩn WordPress.
            </p>
          </div>
        </div>
        <div className="header-badge">
          <span className="role-tag">
            <FaShieldAlt /> {roleLabel}
          </span>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="wp-profile-form">
        {/* Section 1: Tên & Danh tính */}
        <div className="wp-section-box">
          <h2 className="section-title">Danh tính & Hiển thị</h2>
          <table className="form-table">
            <tbody>
              <tr>
                <th>
                  <label>Tên đăng nhập (Email)</label>
                </th>
                <td>
                  <input
                    type="text"
                    disabled
                    value={adminInfo?.email || "admin@audiostory.com"}
                    className="regular-text disabled-input"
                  />
                  <p className="description">Không thể thay đổi địa chỉ email đăng nhập của tài khoản quản trị.</p>
                </td>
              </tr>
              <tr>
                <th>
                  <label htmlFor="display_name">Tên hiển thị công khai <span className="required">*</span></label>
                </th>
                <td>
                  <input
                    type="text"
                    id="display_name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="regular-text"
                    required
                  />
                  <p className="description">Tên này sẽ xuất hiện dưới các bài viết và bộ truyện audio bạn xuất bản.</p>
                </td>
              </tr>
              <tr>
                <th>
                  <label>Vai trò hệ thống</label>
                </th>
                <td>
                  <span className="wp-role-pill">
                    <FaShieldAlt /> {roleLabel}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Ảnh đại diện & Ảnh bìa */}
        <div className="wp-section-box">
          <h2 className="section-title">Hình ảnh đại diện & Ảnh bìa</h2>
          <table className="form-table">
            <tbody>
              <tr>
                <th>
                  <label>Ảnh đại diện (Avatar)</label>
                </th>
                <td>
                  <div className="avatar-upload-row">
                    <img src={avatarPreview} alt="Avatar" className="wp-avatar-preview" />
                    <div className="upload-actions">
                      <label htmlFor="avatar-file-input" className="btn-wp-secondary">
                        <FaCamera /> Chọn ảnh mới
                      </label>
                      <input
                        id="avatar-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFile}
                        hidden
                      />
                      <p className="description">Hỗ trợ JPG, PNG, WEBP (Tối đa 2MB). Hiển thị tròn 96x96px.</p>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <th>
                  <label>Ảnh bìa hồ sơ (Cover)</label>
                </th>
                <td>
                  <div className="cover-upload-box">
                    <img src={coverPreview} alt="Cover" className="wp-cover-preview" />
                    <label htmlFor="cover-file-input" className="upload-cover-btn">
                      <FaImage /> Thay ảnh bìa
                    </label>
                    <input
                      id="cover-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFile}
                      hidden
                    />
                  </div>
                  <p className="description">Ảnh nền hiển thị trên trang hồ sơ tác giả công khai.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Thông tin liên hệ & Mạng xã hội */}
        <div className="wp-section-box">
          <h2 className="section-title">Thông tin liên hệ & Mạng xã hội</h2>
          <table className="form-table">
            <tbody>
              <tr>
                <th>
                  <label htmlFor="contact_phone">Số điện thoại (Zalo)</label>
                </th>
                <td>
                  <div className="input-with-icon">
                    <SiZalo className="field-icon zalo-icon" />
                    <input
                      type="text"
                      id="contact_phone"
                      value={socialLinks.phone}
                      onChange={(e) => setSocialLinks({ ...socialLinks, phone: e.target.value })}
                      placeholder="0912 345 678"
                      className="regular-text"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <th>
                  <label htmlFor="contact_fb">Facebook cá nhân / Fanpage</label>
                </th>
                <td>
                  <div className="input-with-icon">
                    <FaFacebook className="field-icon fb-icon" />
                    <input
                      type="text"
                      id="contact_fb"
                      value={socialLinks.facebook}
                      onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                      placeholder="https://facebook.com/username"
                      className="regular-text"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <th>
                  <label htmlFor="contact_tiktok">Kênh TikTok</label>
                </th>
                <td>
                  <div className="input-with-icon">
                    <FaTiktok className="field-icon tiktok-icon" />
                    <input
                      type="text"
                      id="contact_tiktok"
                      value={socialLinks.tiktok}
                      onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                      placeholder="https://tiktok.com/@username"
                      className="regular-text"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <th>
                  <label>Mã QR ủng hộ / Nhận tip</label>
                </th>
                <td>
                  <div className="qr-upload-row">
                    {qrPreview ? (
                      <img src={qrPreview} alt="QR Code" className="wp-qr-preview" />
                    ) : (
                      <div className="no-qr-placeholder">
                        <FaQrcode />
                        <span>Chưa có mã QR</span>
                      </div>
                    )}
                    <div className="upload-actions">
                      <label htmlFor="qr-file-input" className="btn-wp-secondary">
                        <FaQrcode /> Tải lên mã QR ngân hàng
                      </label>
                      <input
                        id="qr-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleQrFile}
                        hidden
                      />
                      <p className="description">Được hiển thị cho độc giả gửi donate ủng hộ tác giả audio.</p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Nút lưu hồ sơ chung */}
        <div className="wp-submit-box">
          <button
            type="submit"
            className="btn-wp-primary"
            disabled={updateProfileMutation.isPending}
          >
            <FaSave /> {updateProfileMutation.isPending ? "Đang lưu..." : "Cập nhật hồ sơ"}
          </button>
        </div>
      </form>

      {/* Section 4: Quản lý bảo mật & Mật khẩu */}
      <div className="wp-section-box security-section">
        <h2 className="section-title">
          <FaKey className="title-icon" /> Quản lý mật khẩu & Bảo mật
        </h2>
        <form onSubmit={handlePasswordSubmit}>
          <table className="form-table">
            <tbody>
              <tr>
                <th>
                  <label htmlFor="curr_pass">Mật khẩu hiện tại <span className="required">*</span></label>
                </th>
                <td>
                  <input
                    type="password"
                    id="curr_pass"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="regular-text"
                    required
                  />
                </td>
              </tr>
              <tr>
                <th>
                  <label htmlFor="new_pass">Mật khẩu mới <span className="required">*</span></label>
                </th>
                <td>
                  <input
                    type="password"
                    id="new_pass"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="regular-text"
                    placeholder="Tối thiểu 6 ký tự"
                    required
                  />
                </td>
              </tr>
              <tr>
                <th>
                  <label htmlFor="conf_pass">Xác nhận mật khẩu mới <span className="required">*</span></label>
                </th>
                <td>
                  <input
                    type="password"
                    id="conf_pass"
                    value={passwordForm.new_password_confirmation}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                    className="regular-text"
                    required
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="wp-submit-box">
            <button
              type="submit"
              className="btn-wp-secondary btn-change-pw"
              disabled={passwordMutation.isPending}
            >
              <FaLock /> {passwordMutation.isPending ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </div>
        </form>
      </div>

      {/* Section 5: Thống kê nội dung tác giả */}
      <div className="wp-section-box content-stats-section">
        <h2 className="section-title">Nội dung đã xuất bản</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <FaFileAlt className="stat-icon post-icon" />
            <div className="stat-info">
              <span className="stat-value">{userPosts.length}</span>
              <span className="stat-label">Bài viết đã tạo</span>
            </div>
          </div>
          <div className="stat-card">
            <FaBookOpen className="stat-icon story-icon" />
            <div className="stat-info">
              <span className="stat-value">{userSeries.length}</span>
              <span className="stat-label">Bộ truyện quản lý</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ProfileAdmin);