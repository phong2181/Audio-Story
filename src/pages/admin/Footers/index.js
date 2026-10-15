import React, { useState, useEffect } from "react";
import {
  FaSlidersH,
  FaInfoCircle,
  FaLink,
  FaImages,
  FaSave,
  FaFacebook,
  FaYoutube,
  FaTiktok,
  FaTelegram,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaEye,
  FaCheck,
  FaSpinner,
  FaCopyright,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaGlobe,
  FaBuilding,
  FaTag,
  FaHeading,
  FaExternalLinkAlt,
  FaShieldAlt,
  FaDesktop,
  FaTabletAlt,
  FaMobileAlt,
  FaLayerGroup,
  FaMagic,
  FaCheckCircle,
} from "react-icons/fa";
import {
  useGetFootersAD,
  useAddFooterAD,
  useUpdateFooterAD,
  useDeleteFooterAD,
  useGetPublicHeaderSettings,
} from "api/homePage/queries";
import Swal from "sweetalert2";
import "./style.scss";

// =========================================================================
// 1. COMPONENT CON: QUẢN LÝ THÔNG TIN THƯƠNG HIỆU & MXH (BRAND & SOCIAL)
// =========================================================================
const BrandColumnForm = ({ footers, updateMutation }) => {
  const [formData, setFormData] = useState({
    title: "Audio Story",
    desc: "",
    facebook: "",
    youtube: "",
    tiktok: "",
    telegram: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (footers?.data?.brand) {
      const b = footers.data.brand;
      setFormData({
        title: b.title || "Audio Story",
        desc: b.desc || "",
        facebook: b.facebook || "",
        youtube: b.youtube || "",
        tiktok: b.tiktok || "",
        telegram: b.telegram || "",
        email: b.email || "",
        phone: b.phone || "",
        address: b.address || "",
      });
    }
  }, [footers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({ type: "brand", data: formData });
      Swal.fire({
        icon: "success",
        title: "Đã lưu thành công!",
        text: "Thông tin thương hiệu, mạng xã hội và kênh liên hệ chân trang đã được cập nhật.",
        confirmButtonColor: "#4f46e5",
      });
    } catch (error) {
      console.error("Lỗi cập nhật brand:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi lưu dữ liệu",
        text: "Không thể lưu thông tin thương hiệu. Vui lòng thử lại.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="wp-luxury-customizer-form">
      {/* 1.1 Khối Nhận diện Thương hiệu */}
      <div className="luxury-form-card">
        <div className="card-header-row">
          <div className="header-icon-badge purple">
            <FaBuilding />
          </div>
          <div>
            <h3 className="card-heading">Nhận diện Thương hiệu & Tôn chỉ</h3>
            <p className="card-subheading">
              Tên thương hiệu và đoạn giới thiệu ngắn hiển thị tại Cột 1 của chân trang.
            </p>
          </div>
        </div>

        <div className="form-fields-grid">
          <div className="field-group">
            <label className="field-label">
              <FaGlobe className="label-icon" /> Tên thương hiệu chân trang
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                name="title"
                className="luxury-input"
                value={formData.title}
                onChange={handleChange}
                placeholder="VD: Audio Story"
                required
              />
            </div>
            <span className="field-hint">Tên hiển thị dạng logo chữ ở vị trí đầu cột 1.</span>
          </div>

          <div className="field-group full-width">
            <label className="field-label">
              <FaInfoCircle className="label-icon" /> Mô tả ngắn giới thiệu nền tảng
            </label>
            <div className="input-wrapper">
              <textarea
                name="desc"
                className="luxury-textarea"
                rows="3"
                placeholder="Nền tảng chia sẻ và nghe truyện audio chất lượng cao. Đem lại những giây phút thư giãn tuyệt vời cho thính giả mọi lúc mọi nơi..."
                value={formData.desc}
                onChange={handleChange}
                required
              />
            </div>
            <span className="field-hint">Đoạn văn ngắn xuất hiện ngay dưới tên thương hiệu ở chân trang.</span>
          </div>
        </div>
      </div>

      {/* 1.2 Khối Mạng Xã Hội Chính Thức */}
      <div className="luxury-form-card">
        <div className="card-header-row">
          <div className="header-icon-badge blue">
            <FaGlobe />
          </div>
          <div>
            <h3 className="card-heading">Kênh Mạng Xã Hội (Social Channels)</h3>
            <p className="card-subheading">
              Gắn liên kết các trang mạng xã hội chính thức để người dùng theo dõi và kết nối.
            </p>
          </div>
        </div>

        <div className="social-cards-grid">
          {/* Facebook */}
          <div className="social-channel-item fb">
            <div className="channel-badge fb">
              <FaFacebook />
              <span>Facebook</span>
            </div>
            <input
              type="url"
              name="facebook"
              className="luxury-input"
              placeholder="https://facebook.com/yourpage"
              value={formData.facebook}
              onChange={handleChange}
            />
          </div>

          {/* YouTube */}
          <div className="social-channel-item yt">
            <div className="channel-badge yt">
              <FaYoutube />
              <span>YouTube</span>
            </div>
            <input
              type="url"
              name="youtube"
              className="luxury-input"
              placeholder="https://youtube.com/@yourchannel"
              value={formData.youtube}
              onChange={handleChange}
            />
          </div>

          {/* TikTok */}
          <div className="social-channel-item tk">
            <div className="channel-badge tk">
              <FaTiktok />
              <span>TikTok</span>
            </div>
            <input
              type="url"
              name="tiktok"
              className="luxury-input"
              placeholder="https://tiktok.com/@yourprofile"
              value={formData.tiktok}
              onChange={handleChange}
            />
          </div>

          {/* Telegram */}
          <div className="social-channel-item tg">
            <div className="channel-badge tg">
              <FaTelegram />
              <span>Telegram</span>
            </div>
            <input
              type="url"
              name="telegram"
              className="luxury-input"
              placeholder="https://t.me/yourchannel"
              value={formData.telegram}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* 1.3 Khối Kênh Liên Hệ Chân Trang */}
      <div className="luxury-form-card">
        <div className="card-header-row">
          <div className="header-icon-badge emerald">
            <FaPhoneAlt />
          </div>
          <div>
            <h3 className="card-heading">Kênh Liên Hệ & Hỗ Trợ (Contact Info)</h3>
            <p className="card-subheading">
              Hiển thị thông tin liên lạc chính thức để khách hàng dễ dàng tìm kiếm sự trợ giúp.
            </p>
          </div>
        </div>

        <div className="form-fields-grid three-cols">
          <div className="field-group">
            <label className="field-label">
              <FaEnvelope className="label-icon text-indigo" /> Email hỗ trợ
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                name="email"
                className="luxury-input"
                placeholder="support@bookaudio.vn"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">
              <FaPhoneAlt className="label-icon text-emerald" /> Hotline / CSKH
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                name="phone"
                className="luxury-input"
                placeholder="1900 xxxx hoặc 0988 xxx xxx"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">
              <FaMapMarkerAlt className="label-icon text-rose" /> Địa chỉ trụ sở
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                name="address"
                className="luxury-input"
                placeholder="Hà Nội, Việt Nam"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="luxury-action-bar">
        <button
          type="submit"
          className="btn-luxury-primary"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <>
              <FaSpinner className="fa-spin" /> Đang cập nhật dữ liệu...
            </>
          ) : (
            <>
              <FaSave /> Lưu Thay Đổi Cột 1
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// =========================================================================
// 2. COMPONENT CON: QUẢN LÝ DANH MỤC LIÊN KẾT (LINKS MENU BUILDER)
// =========================================================================
const LinksColumnForm = ({ footers, addMutation, updateMutation, deleteMutation }) => {
  const [links, setLinks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ label: "", url: "" });

  useEffect(() => {
    if (footers?.data?.links) {
      setLinks(footers.data.links);
    }
  }, [footers]);

  const handleEdit = (link) => {
    setEditingId(link.id);
    setFormData({ label: link.label, url: link.url });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ label: "", url: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, type: "link", data: formData });
        setEditingId(null);
        Swal.fire({
          icon: "success",
          title: "Đã cập nhật liên kết!",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await addMutation.mutateAsync({ type: "link", data: formData });
        Swal.fire({
          icon: "success",
          title: "Đã thêm liên kết mới!",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      setFormData({ label: "", url: "" });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Lỗi lưu liên kết",
        text: "Vui lòng kiểm tra lại dữ liệu.",
      });
    }
  };

  const handleDelete = async (id, label) => {
    const result = await Swal.fire({
      title: `Xóa liên kết "${label}"?`,
      text: "Liên kết này sẽ bị gỡ bỏ khỏi menu chân trang.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Xác nhận xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      await deleteMutation.mutateAsync({ id, type: "link" });
      Swal.fire({
        icon: "success",
        title: "Đã xóa liên kết!",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  // Nút thêm nhanh các liên kết mẫu
  const handleAddSampleLinks = async () => {
    const sampleLinks = [
      { label: "Trang chủ", url: "/" },
      { label: "Kho truyện audio", url: "/truyen" },
      { label: "Bài viết tin tức", url: "/bai-viet" },
      { label: "Gói thành viên VIP", url: "/membership" },
      { label: "Điều khoản dịch vụ", url: "/terms" },
      { label: "Chính sách bảo mật", url: "/privacy" },
    ];

    for (const item of sampleLinks) {
      const exists = links.some((l) => l.url === item.url);
      if (!exists) {
        await addMutation.mutateAsync({ type: "link", data: item });
      }
    }

    Swal.fire({
      icon: "success",
      title: "Đã chèn các liên kết mẫu!",
      timer: 1800,
      showConfirmButton: false,
    });
  };

  return (
    <div className="wp-luxury-customizer-form">
      {/* 2.1 Form Thêm / Chỉnh Sửa Liên Kết */}
      <div className="luxury-form-card">
        <div className="card-header-row">
          <div className="header-icon-badge amber">
            <FaLink />
          </div>
          <div className="header-text-flex">
            <div>
              <h3 className="card-heading">
                {editingId ? "Chỉnh sửa Liên kết Điều hướng" : "Thêm Liên kết Mới vào Cột 2"}
              </h3>
              <p className="card-subheading">
                Tạo danh sách liên kết dẫn tới các trang quan trọng trong hệ thống website.
              </p>
            </div>
            <button
              type="button"
              className="btn-luxury-secondary sample-btn"
              onClick={handleAddSampleLinks}
              title="Tự động thêm các liên kết cơ bản"
            >
              <FaMagic /> Chèn nhanh menu mẫu
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="link-builder-form">
          <div className="form-fields-grid two-cols">
            <div className="field-group">
              <label className="field-label">
                <FaTag className="label-icon text-amber" /> Tên hiển thị (Anchor Text)
              </label>
              <input
                type="text"
                className="luxury-input"
                placeholder="VD: Kho truyện audio"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label">
                <FaExternalLinkAlt className="label-icon text-blue" /> Đường dẫn đích (URL)
              </label>
              <input
                type="text"
                className="luxury-input"
                placeholder="VD: /truyen hoặc https://..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="link-actions-row">
            <button
              type="submit"
              className="btn-luxury-primary"
              disabled={addMutation.isPending || updateMutation.isPending}
            >
              <FaSave /> {editingId ? "Lưu Cập Nhật Liên Kết" : "Thêm Vào Menu Cột 2"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn-luxury-secondary"
                onClick={handleCancel}
              >
                <FaTimes /> Hủy Chỉnh Sửa
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 2.2 Danh Sách Liên Kết Đang Hiển Thị */}
      <div className="luxury-form-card">
        <div className="card-header-row">
          <div className="header-icon-badge indigo">
            <FaLayerGroup />
          </div>
          <div>
            <h3 className="card-heading">
              Danh sách liên kết đang hoạt động <span className="counter-pill">{links.length}</span>
            </h3>
            <p className="card-subheading">
              Các liên kết sẽ được tự động xếp thành danh sách điều hướng ở Cột 2.
            </p>
          </div>
        </div>

        {links.length === 0 ? (
          <div className="empty-links-box">
            <FaLink className="empty-icon" />
            <p className="empty-title">Chưa có liên kết nào</p>
            <p className="empty-desc">
              Hãy thêm liên kết mới ở biểu mẫu phía trên hoặc nhấn "Chèn nhanh menu mẫu".
            </p>
          </div>
        ) : (
          <div className="links-table-wrapper">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th style={{ width: "38%" }}>Tên hiển thị</th>
                  <th>Đường dẫn đích (URL)</th>
                  <th style={{ width: "160px", textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id}>
                    <td>
                      <div className="link-title-cell">
                        <span className="bullet-dot"></span>
                        <strong>{link.label}</strong>
                      </div>
                    </td>
                    <td>
                      <code className="luxury-url-code">{link.url}</code>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="row-action-btns">
                        <button
                          type="button"
                          className="btn-action-pill edit"
                          onClick={() => handleEdit(link)}
                          title="Chỉnh sửa liên kết"
                        >
                          <FaEdit /> Sửa
                        </button>
                        <button
                          type="button"
                          className="btn-action-pill delete"
                          onClick={() => handleDelete(link.id, link.label)}
                          title="Xóa liên kết này"
                        >
                          <FaTrash /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// =========================================================================
// 3. COMPONENT CON: QUẢN LÝ SLIDER TRÌNH CHIẾU KHÁM PHÁ (IMAGE SLIDER)
// =========================================================================
const SliderColumnForm = ({ footers, addMutation, updateMutation, deleteMutation }) => {
  const [slides, setSlides] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: "", imageUrl: "", linkUrl: "" });

  useEffect(() => {
    if (footers?.data?.slides) {
      setSlides(footers.data.slides);
    }
  }, [footers]);

  const handleEdit = (slide) => {
    setEditingId(slide.id);
    setFormData({
      title: slide.title || "",
      imageUrl: slide.imageUrl || "",
      linkUrl: slide.linkUrl || "",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ title: "", imageUrl: "", linkUrl: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, type: "slide", data: formData });
        setEditingId(null);
        Swal.fire({
          icon: "success",
          title: "Đã cập nhật slide!",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await addMutation.mutateAsync({ type: "slide", data: formData });
        Swal.fire({
          icon: "success",
          title: "Đã thêm ảnh slide mới!",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      setFormData({ title: "", imageUrl: "", linkUrl: "" });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Lỗi lưu slide",
        text: "Vui lòng kiểm tra lại URL ảnh.",
      });
    }
  };

  const handleDelete = async (id, title) => {
    const result = await Swal.fire({
      title: `Xóa ảnh slide "${title || 'này'}"?`,
      text: "Ảnh này sẽ không còn hiển thị trong slider chân trang.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Xác nhận xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      await deleteMutation.mutateAsync({ id, type: "slide" });
      Swal.fire({
        icon: "success",
        title: "Đã xóa ảnh slide!",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="wp-luxury-customizer-form">
      {/* 3.1 Form Thêm / Chỉnh Sửa Slide */}
      <div className="luxury-form-card">
        <div className="card-header-row">
          <div className="header-icon-badge rose">
            <FaImages />
          </div>
          <div>
            <h3 className="card-heading">
              {editingId ? "Chỉnh sửa Slide Trình Chiếu" : "Thêm Slide Khám Phá Mới (Cột 3)"}
            </h3>
            <p className="card-subheading">
              Cột 3 chân trang hiển thị trình chiếu tự động các hình ảnh nổi bật thu hút người nghe.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="slide-builder-form">
          <div className="form-fields-grid two-cols">
            <div className="field-group">
              <label className="field-label">
                <FaHeading className="label-icon text-rose" /> Tiêu đề ảnh (Chú thích)
              </label>
              <input
                type="text"
                className="luxury-input"
                placeholder="VD: Thế giới Audio phong phú"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label">
                <FaExternalLinkAlt className="label-icon text-blue" /> Liên kết khi click (Tùy chọn)
              </label>
              <input
                type="text"
                className="luxury-input"
                placeholder="VD: /truyen hoặc để trống"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              />
            </div>

            <div className="field-group full-width">
              <label className="field-label">
                <FaImages className="label-icon text-amber" /> Đường dẫn ảnh (Image URL)
              </label>
              <input
                type="url"
                className="luxury-input"
                placeholder="https://picsum.photos/600/350 hoặc link ảnh CDN..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                required
              />

              {formData.imageUrl && (
                <div className="slide-preview-live-card">
                  <span className="preview-tag">Xem trước ảnh:</span>
                  <div className="preview-img-box">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <div className="caption-overlay">{formData.title || "Tiêu đề ảnh"}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="slide-actions-row">
            <button
              type="submit"
              className="btn-luxury-primary"
              disabled={addMutation.isPending || updateMutation.isPending}
            >
              <FaSave /> {editingId ? "Cập Nhật Slide" : "Thêm Vào Slider Cột 3"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn-luxury-secondary"
                onClick={handleCancel}
              >
                <FaTimes /> Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 3.2 Thư viện Slide Hiện Hành */}
      <div className="luxury-form-card">
        <div className="card-header-row">
          <div className="header-icon-badge purple">
            <FaSlidersH />
          </div>
          <div>
            <h3 className="card-heading">
              Thư viện Slide đang trình chiếu <span className="counter-pill">{slides.length}</span>
            </h3>
            <p className="card-subheading">
              Hệ thống tự động chuyển đổi giữa các slide này trên giao diện người dùng.
            </p>
          </div>
        </div>

        {slides.length === 0 ? (
          <div className="empty-links-box">
            <FaImages className="empty-icon" />
            <p className="empty-title">Chưa có slide nào được thiết lập</p>
            <p className="empty-desc">
              Hãy thêm hình ảnh banner hoặc bìa truyện để làm sinh động chân trang.
            </p>
          </div>
        ) : (
          <div className="luxury-slides-grid">
            {slides.map((slide) => (
              <div key={slide.id} className="luxury-slide-card">
                <div className="slide-thumbnail-box">
                  <img src={slide.imageUrl} alt={slide.title} />
                  <div className="slide-caption-bar">
                    <span className="slide-title-text">{slide.title}</span>
                  </div>
                </div>
                <div className="slide-card-bottom">
                  {slide.linkUrl && (
                    <span className="slide-link-target" title={slide.linkUrl}>
                      🔗 {slide.linkUrl}
                    </span>
                  )}
                  <div className="slide-card-actions">
                    <button
                      type="button"
                      className="btn-action-pill edit"
                      onClick={() => handleEdit(slide)}
                    >
                      <FaEdit /> Sửa
                    </button>
                    <button
                      type="button"
                      className="btn-action-pill delete"
                      onClick={() => handleDelete(slide.id, slide.title)}
                    >
                      <FaTrash /> Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// =========================================================================
// 4. COMPONENT CON: BẢN QUYỀN & GIAO DIỆN CHÂN TRANG (COPYRIGHT & STYLES)
// =========================================================================
const CopyrightColumnForm = ({ footers, updateMutation }) => {
  const [formData, setFormData] = useState({
    text: "",
    author: "Book Audio",
    show_badge: true,
  });

  useEffect(() => {
    if (footers?.data?.copyright) {
      const c = footers.data.copyright;
      setFormData({
        text: c.text || `© ${new Date().getFullYear()} Book Audio. Nền tảng truyện audio hàng đầu.`,
        author: c.author || "Book Audio",
        show_badge: c.show_badge !== false,
      });
    } else {
      setFormData({
        text: `© ${new Date().getFullYear()} Book Audio. Nền tảng truyện audio hàng đầu.`,
        author: "Book Audio",
        show_badge: true,
      });
    }
  }, [footers]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({ type: "copyright", data: formData });
      Swal.fire({
        icon: "success",
        title: "Đã lưu bản quyền!",
        text: "Dòng chữ bản quyền chân trang đã được cập nhật thành công.",
        confirmButtonColor: "#4f46e5",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Lỗi lưu bản quyền",
        text: "Vui lòng thử lại.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="wp-luxury-customizer-form">
      <div className="luxury-form-card">
        <div className="card-header-row">
          <div className="header-icon-badge amber">
            <FaCopyright />
          </div>
          <div>
            <h3 className="card-heading">Dòng Bản Quyền & Xác Thực (Copyright & Badge)</h3>
            <p className="card-subheading">
              Cấu hình nội dung bảo lưu quyền tác giả và huy hiệu chứng thực bản quyền ở đáy trang.
            </p>
          </div>
        </div>

        <div className="form-fields-grid two-cols">
          <div className="field-group full-width">
            <label className="field-label">
              <FaCopyright className="label-icon text-amber" /> Nội dung dòng chữ bản quyền
            </label>
            <input
              type="text"
              name="text"
              className="luxury-input"
              value={formData.text}
              onChange={handleChange}
              placeholder={`© ${new Date().getFullYear()} Audio Story. Tất cả quyền được bảo lưu.`}
              required
            />
            <span className="field-hint">Dòng chữ này xuất hiện trang trọng ở thanh dưới cùng của website.</span>
          </div>

          <div className="field-group">
            <label className="field-label">
              <FaBuilding className="label-icon text-indigo" /> Tên đơn vị / Chủ sở hữu
            </label>
            <input
              type="text"
              name="author"
              className="luxury-input"
              value={formData.author}
              onChange={handleChange}
              placeholder="Book Audio Team"
              required
            />
          </div>

          <div className="field-group toggle-field">
            <label className="field-label">
              <FaShieldAlt className="label-icon text-emerald" /> Huy hiệu chứng nhận an toàn
            </label>
            <label className="luxury-switch-label">
              <input
                type="checkbox"
                name="show_badge"
                checked={formData.show_badge}
                onChange={handleChange}
              />
              <span className="luxury-switch-slider"></span>
              <span className="switch-text">
                Hiển thị huy hiệu <strong>"Đã xác thực & Bản quyền an toàn"</strong>
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="luxury-action-bar">
        <button
          type="submit"
          className="btn-luxury-primary"
          disabled={updateMutation.isPending}
        >
          <FaSave /> Lưu Thông Tin Bản Quyền
        </button>
      </div>
    </form>
  );
};

// =========================================================================
// 5. COMPONENT CON: XEM TRƯỚC TRỰC TIẾP CHÂN TRANG (LIVE SIMULATOR)
// =========================================================================
const LiveFooterPreview = ({ footers, settingsRes }) => {
  const brand = footers?.data?.brand || {};
  const links = footers?.data?.links || [];
  const slides = footers?.data?.slides || [];
  const copyright = footers?.data?.copyright || {};
  const season = settingsRes?.data?.effective_season || "spring_tet";

  const [slideIdx, setSlideIdx] = useState(0);
  const [deviceView, setDeviceView] = useState("desktop"); // desktop, tablet, mobile

  useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(() => {
        setSlideIdx((prev) => (prev + 1) % slides.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [slides.length]);

  return (
    <div className="wp-footer-simulator-wrapper">
      {/* Device & Season Controller Bar */}
      <div className="simulator-control-bar">
        <div className="sim-info-group">
          <span className="live-pulse-dot"></span>
          <span className="sim-title">Mô Phỏng Trực Tiếp Giao Diện Client</span>
          <span className="season-pill">Mùa: {season}</span>
        </div>

        <div className="device-switcher-buttons">
          <button
            type="button"
            className={`device-btn ${deviceView === "desktop" ? "active" : ""}`}
            onClick={() => setDeviceView("desktop")}
            title="Màn hình Máy tính (Desktop)"
          >
            <FaDesktop /> <span>Máy tính</span>
          </button>
          <button
            type="button"
            className={`device-btn ${deviceView === "tablet" ? "active" : ""}`}
            onClick={() => setDeviceView("tablet")}
            title="Màn hình Máy tính bảng (Tablet)"
          >
            <FaTabletAlt /> <span>Tablet</span>
          </button>
          <button
            type="button"
            className={`device-btn ${deviceView === "mobile" ? "active" : ""}`}
            onClick={() => setDeviceView("mobile")}
            title="Màn hình Điện thoại (Mobile)"
          >
            <FaMobileAlt /> <span>Điện thoại</span>
          </button>
        </div>
      </div>

      {/* Simulator Device Frame */}
      <div className={`simulator-frame-viewport device-${deviceView}`}>
        <footer className={`simulated-luxury-footer season-${season}`}>
          <div className="sim-content-container">
            {/* Cột 1: Thương hiệu */}
            <div className="sim-col sim-brand-col">
              <div className="sim-brand-header">
                <span className="sim-brand-logo">{brand.title || "Audio Story"}</span>
              </div>
              <p className="sim-brand-bio">
                {brand.desc ||
                  "Nền tảng nghe truyện audio chất lượng cao. Đem lại những giây phút thư giãn tuyệt vời cho thính giả mọi lúc mọi nơi."}
              </p>

              <div className="sim-social-icons-row">
                {brand.facebook && (
                  <span className="soc-bubble fb" title="Facebook">
                    <FaFacebook />
                  </span>
                )}
                {brand.youtube && (
                  <span className="soc-bubble yt" title="YouTube">
                    <FaYoutube />
                  </span>
                )}
                {brand.tiktok && (
                  <span className="soc-bubble tk" title="TikTok">
                    <FaTiktok />
                  </span>
                )}
                {brand.telegram && (
                  <span className="soc-bubble tg" title="Telegram">
                    <FaTelegram />
                  </span>
                )}
              </div>

              {(brand.email || brand.phone || brand.address) && (
                <div className="sim-contact-meta">
                  {brand.email && (
                    <div className="meta-line">
                      <FaEnvelope className="icon" /> <span>{brand.email}</span>
                    </div>
                  )}
                  {brand.phone && (
                    <div className="meta-line">
                      <FaPhoneAlt className="icon" /> <span>{brand.phone}</span>
                    </div>
                  )}
                  {brand.address && (
                    <div className="meta-line">
                      <FaMapMarkerAlt className="icon" /> <span>{brand.address}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cột 2: Danh mục liên kết */}
            <div className="sim-col sim-links-col">
              <h4 className="sim-col-title">Danh mục điều hướng</h4>
              <ul className="sim-nav-links">
                {links.length > 0 ? (
                  links.slice(0, 8).map((l) => (
                    <li key={l.id}>
                      <span className="link-item">
                        <span className="arrow-sym">›</span> {l.label}
                      </span>
                    </li>
                  ))
                ) : (
                  <>
                    <li><span className="link-item">› Trang chủ</span></li>
                    <li><span className="link-item">› Kho truyện audio</span></li>
                    <li><span className="link-item">› Bài viết & Tin tức</span></li>
                    <li><span className="link-item">› Gói thành viên VIP</span></li>
                  </>
                )}
              </ul>
            </div>

            {/* Cột 3: Slider khám phá */}
            <div className="sim-col sim-slider-col">
              <h4 className="sim-col-title">Khám phá Audio</h4>
              <div className="sim-showcase-box">
                {slides.length > 0 ? (
                  <div className="sim-slide-viewport">
                    <img src={slides[slideIdx]?.imageUrl} alt="Slide preview" />
                    <div className="sim-slide-overlay-tag">
                      <span>{slides[slideIdx]?.title}</span>
                    </div>
                    {slides.length > 1 && (
                      <div className="sim-slider-dots">
                        {slides.map((_, i) => (
                          <span
                            key={i}
                            className={`dot ${i === slideIdx ? "active" : ""}`}
                            onClick={() => setSlideIdx(i)}
                          ></span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="sim-slide-placeholder">
                    <FaImages className="icon" />
                    <span>Trình chiếu hình ảnh khám phá</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dòng bản quyền đáy */}
          <div className="sim-copyright-bar">
            <p className="copyright-text">
              {copyright.text || `© ${new Date().getFullYear()} Book Audio. Tất cả quyền được bảo lưu.`}
            </p>
            {copyright.show_badge && (
              <div className="sim-verified-badge">
                <FaShieldAlt /> <span>Verified & Protected</span>
              </div>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

// =========================================================================
// 6. COMPONENT CHA CHÍNH: FOOTERS (TÙY BIẾN CHÂN TRANG CHUẨN WORDPRESS)
// =========================================================================
const Footers = () => {
  useEffect(() => {
    document.title = "Tùy biến & Quản trị Chân trang (Footer Customizer) | WordPress Admin";
  }, []);

  const [activeTab, setActiveTab] = useState("brand");

  const { data: footers, isLoading, error } = useGetFootersAD();
  const { data: settingsRes } = useGetPublicHeaderSettings();

  const addMutation = useAddFooterAD();
  const updateMutation = useUpdateFooterAD();
  const deleteMutation = useDeleteFooterAD();

  const linksCount = footers?.data?.links?.length || 0;
  const slidesCount = footers?.data?.slides?.length || 0;

  if (isLoading) {
    return (
      <div className="wp-luxury-customizer-wrap">
        <div className="customizer-loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tải cấu hình tùy biến chân trang...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wp-luxury-customizer-wrap">
        <div className="customizer-error-notice">
          <p>Lỗi kết nối máy chủ: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wp-luxury-customizer-wrap">
      {/* 1. Header Sang Trọng (Hero Header) */}
      <div className="luxury-customizer-header">
        <div className="header-left-col">
          <div className="header-icon-bubble">
            <FaLayerGroup />
          </div>
          <div>
            <div className="header-title-flex">
              <h1 className="header-title">Quản lý & Tùy biến Chân trang</h1>
              <span className="header-badge-live">
                <span className="live-dot"></span> Đang áp dụng Live
              </span>
            </div>
            <p className="header-subtitle">
              Cá nhân hóa chân trang chuyên nghiệp: Thương hiệu & MXH, Menu liên kết điều hướng, Slider trình chiếu và Bản quyền
            </p>
          </div>
        </div>

        <div className="header-right-col">
          <button
            type="button"
            className={`btn-preview-mode ${activeTab === "preview" ? "active" : ""}`}
            onClick={() => setActiveTab("preview")}
          >
            <FaEye /> <span>Xem trước trực tiếp</span>
          </button>
        </div>
      </div>

      {/* 2. Thanh Điều Hướng Tab Sang Trọng (Luxury Tab Bar) */}
      <div className="luxury-nav-tab-bar">
        <button
          type="button"
          className={`luxury-tab-item ${activeTab === "brand" ? "active" : ""}`}
          onClick={() => setActiveTab("brand")}
        >
          <FaInfoCircle className="tab-icon" />
          <span>Cột 1: Thương hiệu & MXH</span>
        </button>

        <button
          type="button"
          className={`luxury-tab-item ${activeTab === "links" ? "active" : ""}`}
          onClick={() => setActiveTab("links")}
        >
          <FaLink className="tab-icon" />
          <span>Cột 2: Danh mục liên kết</span>
          <span className="tab-count-pill">{linksCount}</span>
        </button>

        <button
          type="button"
          className={`luxury-tab-item ${activeTab === "slider" ? "active" : ""}`}
          onClick={() => setActiveTab("slider")}
        >
          <FaImages className="tab-icon" />
          <span>Cột 3: Slider trình chiếu</span>
          <span className="tab-count-pill">{slidesCount}</span>
        </button>

        <button
          type="button"
          className={`luxury-tab-item ${activeTab === "copyright" ? "active" : ""}`}
          onClick={() => setActiveTab("copyright")}
        >
          <FaCopyright className="tab-icon" />
          <span>Bản quyền & Giao diện</span>
        </button>

        <button
          type="button"
          className={`luxury-tab-item preview-tab ${activeTab === "preview" ? "active" : ""}`}
          onClick={() => setActiveTab("preview")}
        >
          <FaEye className="tab-icon" />
          <span>Mô phỏng Chân trang</span>
        </button>
      </div>

      {/* 3. Thân Tab Panels */}
      <div className="luxury-customizer-body">
        {activeTab === "brand" && (
          <BrandColumnForm footers={footers} updateMutation={updateMutation} />
        )}
        {activeTab === "links" && (
          <LinksColumnForm
            footers={footers}
            addMutation={addMutation}
            updateMutation={updateMutation}
            deleteMutation={deleteMutation}
          />
        )}
        {activeTab === "slider" && (
          <SliderColumnForm
            footers={footers}
            addMutation={addMutation}
            updateMutation={updateMutation}
            deleteMutation={deleteMutation}
          />
        )}
        {activeTab === "copyright" && (
          <CopyrightColumnForm footers={footers} updateMutation={updateMutation} />
        )}
        {activeTab === "preview" && (
          <LiveFooterPreview footers={footers} settingsRes={settingsRes} />
        )}
      </div>
    </div>
  );
};

export default Footers;