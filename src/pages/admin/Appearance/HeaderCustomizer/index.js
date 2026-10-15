import React, { useState, useEffect } from "react";
import "./style.scss";
import {
  FaSlidersH,
  FaPalette,
  FaEye,
  FaSave,
  FaImage,
  FaCheck,
  FaSun,
  FaMoon,
  FaSearch,
  FaCrown,
  FaBell,
  FaSnowflake,
  FaLeaf,
  FaUmbrellaBeach,
  FaSpinner,
  FaInfoCircle,
  FaDesktop,
  FaMobileAlt,
  FaTrashAlt,
  FaUpload,
  FaBullhorn,
  FaMagic,
  FaCheckCircle,
} from "react-icons/fa";
import { RiFlowerLine } from "react-icons/ri";
import { useGetHeaderSettings, useUpdateHeaderSettings } from "api/homePage/queries";
import { STORAGE_URL } from "config/config";
import Swal from "sweetalert2";

const SEASONS_LIST = [
  {
    key: "spring_tet",
    name: "Mùa Xuân & Tết Nguyên Đán",
    icon: <RiFlowerLine />,
    tag: "Tết / Xuân",
    desc: "Sắc đỏ may mắn & vàng kim rực rỡ, cánh hoa đào hoa mai rơi nhẹ nhàng đón chào năm mới.",
    primaryColor: "#dc2626",
    accentColor: "#f59e0b",
    gradient: "linear-gradient(135deg, #b91c1c 0%, #d97706 100%)",
    particles: "🌸 💮 🧧",
  },
  {
    key: "summer",
    name: "Mùa Hè Nhiệt Đới",
    icon: <FaUmbrellaBeach />,
    tag: "Hạ / Nắng",
    desc: "Sắc xanh đại dương & ngọc bích tươi mát, ánh nắng rạng ngời sảng khoái.",
    primaryColor: "#0284c7",
    accentColor: "#0d9488",
    gradient: "linear-gradient(135deg, #0284c7 0%, #0d9488 100%)",
    particles: "☀️ ✨ 🌊",
  },
  {
    key: "autumn",
    name: "Mùa Thu & Tết Trung Thu",
    icon: <FaLeaf />,
    tag: "Thu / Rằm",
    desc: "Sắc vàng mật ong & cam ấm áp hoài niệm, lá phong bay lượn và ánh trăng rằm.",
    primaryColor: "#ea580c",
    accentColor: "#d97706",
    gradient: "linear-gradient(135deg, #ea580c 0%, #b45309 100%)",
    particles: "🍂 🍁 🌕",
  },
  {
    key: "winter_xmas",
    name: "Mùa Đông & Giáng Sinh",
    icon: <FaSnowflake />,
    tag: "Đông / Noel",
    desc: "Sắc xanh rừng thông & đỏ Noel lễ hội, hoa tuyết trắng rơi êm ái.",
    primaryColor: "#15803d",
    accentColor: "#dc2626",
    gradient: "linear-gradient(135deg, #15803d 0%, #991b1b 100%)",
    particles: "❄️ ❅ 🔔",
  },
  {
    key: "default",
    name: "Mặc định (Tiêu chuẩn)",
    icon: <FaPalette />,
    tag: "Classic",
    desc: "Giao diện hiện đại nguyên bản của Book Audio với sắc tím chàm thanh lịch.",
    primaryColor: "#6c63ff",
    accentColor: "#ff6584",
    gradient: "linear-gradient(135deg, #6c63ff 0%, #3b82f6 100%)",
    particles: "✨ ✨ ✨",
  },
];

const HeaderCustomizer = () => {
  const { data: settingsRes, isLoading } = useGetHeaderSettings();
  const updateMutation = useUpdateHeaderSettings();

  const [activeTab, setActiveTab] = useState("header"); // header, seasons, preview
  const [previewDevice, setPreviewDevice] = useState("desktop"); // desktop, mobile
  const [previewTheme, setPreviewTheme] = useState("light"); // light, dark

  // Form State
  const [formData, setFormData] = useState({
    site_title: "Audio Story",
    tagline: "Nền Tảng Truyện Audio & Tin Tức Hàng Đầu",
    logo_url: "",
    is_sticky: true,
    show_search: true,
    show_theme_toggle: true,
    show_vip_button: true,
    show_notifications: true,
    header_height: "normal",
    season_mode: "auto",
    active_season: "spring_tet",
    enable_particles: true,
    particle_intensity: "medium",
    custom_announcement: "Chào đón năm mới cùng Audio Story - Nghe truyện thỏa thích!",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // Sync settings when loaded from API
  useEffect(() => {
    if (settingsRes?.data) {
      const d = settingsRes.data;
      setFormData({
        site_title: d.site_title || "Audio Story",
        tagline: d.tagline || "",
        logo_url: d.logo_url || "",
        is_sticky: d.is_sticky !== false,
        show_search: d.show_search !== false,
        show_theme_toggle: d.show_theme_toggle !== false,
        show_vip_button: d.show_vip_button !== false,
        show_notifications: d.show_notifications !== false,
        header_height: d.header_height || "normal",
        season_mode: d.season_mode || "auto",
        active_season: d.active_season || "spring_tet",
        enable_particles: d.enable_particles !== false,
        particle_intensity: d.particle_intensity || "medium",
        custom_announcement: d.custom_announcement || "",
      });

      if (d.logo_url) {
        const fullUrl = d.logo_url.startsWith("http")
          ? d.logo_url
          : `${STORAGE_URL}/${d.logo_url}`;
        setLogoPreview(fullUrl);
      }
    }
  }, [settingsRes]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setIsDirty(true);
  };

  const handleToggle = (name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
    setIsDirty(true);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setIsDirty(true);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFormData((prev) => ({ ...prev, logo_url: "" }));
    setIsDirty(true);
  };

  const handleSelectSeason = (seasonKey) => {
    setFormData((prev) => ({
      ...prev,
      active_season: seasonKey,
      season_mode: "manual",
    }));
    setIsDirty(true);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
      });

      if (logoFile) {
        payload.append("logo", logoFile);
      }

      await updateMutation.mutateAsync(payload);
      setIsDirty(false);

      Swal.fire({
        icon: "success",
        title: "Đã lưu cài đặt!",
        text: "Giao diện Header & hiệu ứng mùa đã được cập nhật thành công.",
        confirmButtonColor: "#4f46e5",
      });
    } catch (err) {
      console.error("Lỗi cập nhật cấu hình Header:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi lưu cài đặt",
        text: "Không thể lưu thay đổi. Vui lòng thử lại.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  // Tính mùa có hiệu lực trong preview
  const currentEffectiveSeason =
    formData.season_mode === "auto"
      ? settingsRes?.data?.effective_season || "spring_tet"
      : formData.active_season;

  const currentSeasonMeta =
    SEASONS_LIST.find((s) => s.key === currentEffectiveSeason) || SEASONS_LIST[0];

  return (
    <div className="wp-customizer-wrap">
      {/* Modern Top Hero Header */}
      <div className="customizer-header-card">
        <div className="header-left">
          <div className="header-icon-box">
            <FaMagic />
          </div>
          <div className="header-text-group">
            <div className="header-title-row">
              <h1>Tùy biến Header & Mùa lễ hội</h1>
              <span className="badge-theme">Theme Studio</span>
              {isDirty && <span className="dirty-pill">• Có thay đổi chưa lưu</span>}
            </div>
            <p className="header-subtitle">
              Tùy biến thương hiệu, nhận diện logo, bố cục thanh điều hướng và hiệu ứng sắc màu lễ hội thời gian thực.
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-customizer-save"
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <FaSpinner className="spin" /> Đang lưu...
              </>
            ) : (
              <>
                <FaSave /> Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>

      {/* Segmented Navigation Tab Bar */}
      <div className="customizer-tabs-container">
        <div className="customizer-tabs">
          <button
            type="button"
            className={`tab-item ${activeTab === "header" ? "active" : ""}`}
            onClick={() => setActiveTab("header")}
          >
            <FaSlidersH className="tab-icon" />
            <span>Cấu hình Đầu trang (Header)</span>
          </button>

          <button
            type="button"
            className={`tab-item ${activeTab === "seasons" ? "active" : ""}`}
            onClick={() => setActiveTab("seasons")}
          >
            <FaPalette className="tab-icon" />
            <span>Màu sắc động & Mùa lễ tết</span>
            <span className="tab-season-indicator" style={{ background: currentSeasonMeta.primaryColor }}>
              {currentSeasonMeta.tag}
            </span>
          </button>

          <button
            type="button"
            className={`tab-item ${activeTab === "preview" ? "active" : ""}`}
            onClick={() => setActiveTab("preview")}
          >
            <FaEye className="tab-icon" />
            <span>Xem trước trực tiếp (Live Studio)</span>
          </button>
        </div>
      </div>

      <div className="customizer-content-grid">
        {/* ========================================================
            TAB 1: CẤU HÌNH ĐẦU TRANG (HEADER SETTINGS)
           ======================================================== */}
        {activeTab === "header" && (
          <div className="customizer-sections-flow">
            {/* 1.1 Brand Identity Section */}
            <div className="customizer-panel-card">
              <div className="panel-header">
                <div className="panel-title-group">
                  <h3>Nhận diện thương hiệu & Logo</h3>
                  <p>Thiết lập tên trang web, khẩu hiệu và hình ảnh logo trên thanh Header.</p>
                </div>
              </div>

              <div className="panel-body">
                <div className="form-grid-2col">
                  <div className="custom-form-field">
                    <label htmlFor="site_title">
                      Tên trang web <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="site_title"
                      name="site_title"
                      className="custom-input"
                      value={formData.site_title}
                      onChange={handleChange}
                      placeholder="VD: Audio Story, Book Audio..."
                    />
                    <span className="field-hint">Tên thương hiệu chính hiển thị trên thanh điều hướng.</span>
                  </div>

                  <div className="custom-form-field">
                    <label htmlFor="tagline">Khẩu hiệu phụ (Tagline)</label>
                    <input
                      type="text"
                      id="tagline"
                      name="tagline"
                      className="custom-input"
                      value={formData.tagline}
                      onChange={handleChange}
                      placeholder="VD: Nền Tảng Truyện Audio & Tin Tức Hàng Đầu"
                    />
                    <span className="field-hint">Mô tả ngắn gọn, xuất hiện bên dưới hoặc cạnh tiêu đề.</span>
                  </div>
                </div>

                {/* Logo Upload Zone */}
                <div className="logo-upload-section">
                  <label className="section-inner-label">Logo thanh Header</label>
                  <div className="logo-upload-dropzone">
                    {logoPreview ? (
                      <div className="logo-preview-active">
                        <div className="logo-img-frame">
                          <img src={logoPreview} alt="Logo Preview" />
                        </div>
                        <div className="logo-details">
                          <span className="logo-status-tag">
                            <FaCheckCircle /> Đã tải lên logo tùy chỉnh
                          </span>
                          <div className="logo-btn-row">
                            <label className="btn-upload-label">
                              <FaUpload /> Đổi ảnh logo
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                style={{ display: "none" }}
                              />
                            </label>
                            <button
                              type="button"
                              className="btn-remove-logo"
                              onClick={handleRemoveLogo}
                            >
                              <FaTrashAlt /> Xóa logo (Dùng mặc định)
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="logo-placeholder-box">
                        <div className="placeholder-icon">
                          <FaImage />
                        </div>
                        <div className="placeholder-text">
                          <strong>Chưa có logo tùy chỉnh</strong>
                          <span>Hệ thống đang sử dụng biểu tượng sách mặc định. Hỗ trợ định dạng PNG, SVG, JPG.</span>
                        </div>
                        <label className="btn-upload-primary">
                          <FaUpload /> Tải lên Logo mới
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            style={{ display: "none" }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 1.2 Header Dimensions & Height */}
            <div className="customizer-panel-card">
              <div className="panel-header">
                <div className="panel-title-group">
                  <h3>Kích thước & Chiều cao Header</h3>
                  <p>Chọn kích thước phù hợp nhất với phong cách trang web của bạn.</p>
                </div>
              </div>

              <div className="panel-body">
                <div className="height-selector-cards">
                  {[
                    {
                      key: "compact",
                      title: "Gọn gàng (Compact)",
                      height: "56px",
                      desc: "Tối ưu không gian hiển thị bài viết và truyện, phù hợp giao diện tinh gọn.",
                    },
                    {
                      key: "normal",
                      title: "Tiêu chuẩn (Standard)",
                      height: "64px",
                      desc: "Kích thước hoàn hảo, cân đối hài hòa giữa logo và các nút chức năng.",
                    },
                    {
                      key: "spacious",
                      title: "Rộng rãi (Spacious)",
                      height: "76px",
                      desc: "Phong cách sang trọng hiện đại, làm nổi bật logo lớn và thanh tìm kiếm.",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className={`height-card ${formData.header_height === item.key ? "selected" : ""}`}
                      onClick={() => {
                        setFormData((p) => ({ ...p, header_height: item.key }));
                        setIsDirty(true);
                      }}
                    >
                      <div className="height-card-header">
                        <span className="height-badge">{item.height}</span>
                        {formData.header_height === item.key && (
                          <span className="active-dot"><FaCheck /></span>
                        )}
                      </div>
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 1.3 Controls & Feature Toggles */}
            <div className="customizer-panel-card">
              <div className="panel-header">
                <div className="panel-title-group">
                  <h3>Các thành phần & Nút tính năng</h3>
                  <p>Bật hoặc tắt linh hoạt từng chức năng hiển thị trên thanh Header người dùng.</p>
                </div>
              </div>

              <div className="panel-body">
                <div className="toggles-list-grid">
                  {[
                    {
                      name: "is_sticky",
                      icon: <FaSlidersH />,
                      title: "Cố định thanh Header khi cuộn trang (Sticky Header)",
                      desc: "Header luôn dính ở mép trên cùng với hiệu ứng kính mờ (glassmorphism) sang trọng khi người dùng cuộn xem truyện.",
                    },
                    {
                      name: "show_search",
                      icon: <FaSearch />,
                      title: "Hộp tìm kiếm nhanh",
                      desc: "Cho phép độc giả gõ từ khóa tìm kiếm tên tác phẩm, truyện audio hoặc bài viết ngay tại Header.",
                    },
                    {
                      name: "show_theme_toggle",
                      icon: <FaSun />,
                      title: "Nút chuyển đổi chế độ Sáng / Tối (Dark Mode)",
                      desc: "Cung cấp nút bấm chuyển đổi giữa giao diện nền sáng và nền tối êm dịu cho mắt.",
                    },
                    {
                      name: "show_vip_button",
                      icon: <FaCrown />,
                      title: "Nút nâng cấp Thành viên VIP",
                      desc: "Nút vương miện nổi bật điều hướng đến trang gói hội viên ủng hộ tác giả.",
                    },
                    {
                      name: "show_notifications",
                      icon: <FaBell />,
                      title: "Chuông thông báo hệ thống",
                      desc: "Hiển thị chuông cập nhật tin tức, thông báo chương mới và giao dịch.",
                    },
                  ].map((toggle) => (
                    <div
                      key={toggle.name}
                      className={`toggle-row-item ${formData[toggle.name] ? "is-active" : ""}`}
                      onClick={() => handleToggle(toggle.name)}
                    >
                      <div className="toggle-icon-wrap">{toggle.icon}</div>
                      <div className="toggle-info">
                        <h4>{toggle.title}</h4>
                        <p>{toggle.desc}</p>
                      </div>
                      <div className="toggle-switch-wrapper">
                        <div className={`modern-switch ${formData[toggle.name] ? "checked" : ""}`}>
                          <div className="switch-thumb" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: MÀU SẮC ĐỘNG & MÙA LỄ TẾT (SEASONS & FESTIVITIES)
           ======================================================== */}
        {activeTab === "seasons" && (
          <div className="customizer-sections-flow">
            {/* Mode Switcher */}
            <div className="customizer-panel-card">
              <div className="panel-header">
                <div className="panel-title-group">
                  <h3>Cơ chế kích hoạt giao diện theo mùa</h3>
                  <p>Chọn cách hệ thống tự động đổi màu sắc lễ hội hoặc ấn định cố định theo ý bạn.</p>
                </div>
              </div>

              <div className="panel-body">
                <div className="season-mode-switcher">
                  <div
                    className={`mode-option-card ${formData.season_mode === "auto" ? "active" : ""}`}
                    onClick={() => {
                      setFormData((p) => ({ ...p, season_mode: "auto" }));
                      setIsDirty(true);
                    }}
                  >
                    <div className="mode-radio-circle">
                      {formData.season_mode === "auto" && <span className="inner-dot" />}
                    </div>
                    <div className="mode-option-content">
                      <h4>🌸 Tự động theo lịch 4 mùa & Lễ Tết (Khuyên dùng)</h4>
                      <p>
                        Hệ thống thông minh tự nhận biết thời điểm trong năm: Tết Nguyên Đán (Xuân), Mùa hè, Tết Trung Thu (Thu), Mùa Giáng Sinh (Đông).
                      </p>
                    </div>
                  </div>

                  <div
                    className={`mode-option-card ${formData.season_mode === "manual" ? "active" : ""}`}
                    onClick={() => {
                      setFormData((p) => ({ ...p, season_mode: "manual" }));
                      setIsDirty(true);
                    }}
                  >
                    <div className="mode-radio-circle">
                      {formData.season_mode === "manual" && <span className="inner-dot" />}
                    </div>
                    <div className="mode-option-content">
                      <h4>⚙️ Chỉ định thủ công theo ý muốn</h4>
                      <p>
                        Cố định một chủ đề lễ hội bất kỳ theo chiến dịch hoặc sự kiện đặc biệt của trang web.
                      </p>
                    </div>
                  </div>
                </div>

                {formData.season_mode === "auto" && (
                  <div className="auto-season-badge-notice">
                    <FaInfoCircle className="info-icon" />
                    <span>
                      Chủ đề đang tự động kích hoạt hiện tại: <strong>{currentSeasonMeta.name}</strong> ({currentSeasonMeta.tag})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Seasons Selection Studio */}
            <div className="customizer-panel-card">
              <div className="panel-header">
                <div className="panel-title-group">
                  <h3>Bộ sưu tập 5 chủ đề màu sắc lễ hội</h3>
                  <p>Nhấp vào bất kỳ chủ đề nào dưới đây để xem trước và kích hoạt.</p>
                </div>
              </div>

              <div className="panel-body">
                <div className="seasons-gallery-grid">
                  {SEASONS_LIST.map((season) => {
                    const isSelected =
                      formData.season_mode === "manual"
                        ? formData.active_season === season.key
                        : currentEffectiveSeason === season.key;

                    return (
                      <div
                        key={season.key}
                        className={`season-showcase-card ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSelectSeason(season.key)}
                      >
                        <div className="card-top-banner" style={{ background: season.gradient }}>
                          <div className="banner-icon">{season.icon}</div>
                          <span className="banner-tag">{season.tag}</span>
                          {isSelected && (
                            <div className="active-badge-pill">
                              <FaCheck /> Đang dùng
                            </div>
                          )}
                        </div>

                        <div className="card-body-content">
                          <h4 className="season-title">{season.name}</h4>
                          <p className="season-text">{season.desc}</p>

                          <div className="card-footer-meta">
                            <div className="color-dots">
                              <span
                                className="color-circle"
                                style={{ background: season.primaryColor }}
                                title="Màu chủ đạo"
                              />
                              <span
                                className="color-circle"
                                style={{ background: season.accentColor }}
                                title="Màu điểm nhấn"
                              />
                            </div>
                            <span className="particles-tag">{season.particles}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Particle Effects Engine & Announcement */}
            <div className="customizer-panel-card">
              <div className="panel-header">
                <div className="panel-title-group">
                  <h3>Hiệu ứng hạt rơi động & Dải băng thông báo</h3>
                  <p>Tạo không khí lễ hội ngập tràn với cánh hoa, hoa tuyết hoặc lá bay lượn trên màn hình.</p>
                </div>
              </div>

              <div className="panel-body">
                <div className="particles-config-grid">
                  <div
                    className={`toggle-row-item ${formData.enable_particles ? "is-active" : ""}`}
                    onClick={() => handleToggle("enable_particles")}
                  >
                    <div className="toggle-icon-wrap"><FaMagic /></div>
                    <div className="toggle-info">
                      <h4>Bật hiệu ứng hạt rơi theo mùa</h4>
                      <p>Cánh hoa mai, hoa đào, tuyết rơi hoặc lá vàng bay lượn tự nhiên trên nền web.</p>
                    </div>
                    <div className="toggle-switch-wrapper">
                      <div className={`modern-switch ${formData.enable_particles ? "checked" : ""}`}>
                        <div className="switch-thumb" />
                      </div>
                    </div>
                  </div>

                  <div className="custom-form-field">
                    <label>Mức độ mật độ hạt rơi</label>
                    <div className="intensity-chips">
                      {[
                        { key: "low", label: "Nhẹ nhàng (12 hạt)", desc: "Mượt mà trên máy yếu" },
                        { key: "medium", label: "Tiêu chuẩn (20 hạt)", desc: "Đẹp và cân đối" },
                        { key: "high", label: "Lộng lẫy (32 hạt)", desc: "Hiệu ứng rực rỡ nhất" },
                      ].map((chip) => (
                        <button
                          key={chip.key}
                          type="button"
                          className={`chip-btn ${formData.particle_intensity === chip.key ? "active" : ""}`}
                          onClick={() => {
                            setFormData((p) => ({ ...p, particle_intensity: chip.key }));
                            setIsDirty(true);
                          }}
                        >
                          <strong>{chip.label}</strong>
                          <small>{chip.desc}</small>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="custom-form-field">
                    <label htmlFor="custom_announcement">
                      <FaBullhorn style={{ marginRight: 6 }} /> Dải băng thông báo nổi bật Header
                    </label>
                    <input
                      type="text"
                      id="custom_announcement"
                      name="custom_announcement"
                      className="custom-input"
                      value={formData.custom_announcement}
                      onChange={handleChange}
                      placeholder="VD: Chào đón năm mới cùng Audio Story - Thưởng thức trọn bộ truyện audio miễn phí!"
                    />
                    <span className="field-hint">
                      Xuất hiện ở vị trí trang trọng trên cùng của trang web với màu sắc theo mùa lễ hội.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: XEM TRƯỚC TRỰC QUAN (LIVE PREVIEW FRAME)
           ======================================================== */}
        {activeTab === "preview" && (
          <div className="customizer-preview-studio">
            {/* Preview Toolbar */}
            <div className="preview-studio-toolbar">
              <div className="toolbar-left">
                <span className="studio-badge">
                  <FaMagic /> Theme: <strong>{currentSeasonMeta.name}</strong>
                </span>
                <span className="season-swatch" style={{ background: currentSeasonMeta.primaryColor }}>
                  {currentSeasonMeta.tag}
                </span>
              </div>

              <div className="toolbar-controls">
                {/* Device switch */}
                <div className="control-group">
                  <button
                    type="button"
                    className={`btn-device ${previewDevice === "desktop" ? "active" : ""}`}
                    onClick={() => setPreviewDevice("desktop")}
                    title="Xem bản Máy tính"
                  >
                    <FaDesktop /> Máy tính
                  </button>
                  <button
                    type="button"
                    className={`btn-device ${previewDevice === "mobile" ? "active" : ""}`}
                    onClick={() => setPreviewDevice("mobile")}
                    title="Xem bản Điện thoại"
                  >
                    <FaMobileAlt /> Di động
                  </button>
                </div>

                {/* Theme switch */}
                <div className="control-group">
                  <button
                    type="button"
                    className={`btn-theme-preview ${previewTheme === "light" ? "active" : ""}`}
                    onClick={() => setPreviewTheme("light")}
                  >
                    <FaSun /> Sáng
                  </button>
                  <button
                    type="button"
                    className={`btn-theme-preview ${previewTheme === "dark" ? "active" : ""}`}
                    onClick={() => setPreviewTheme("dark")}
                  >
                    <FaMoon /> Tối
                  </button>
                </div>
              </div>
            </div>

            {/* Mock Browser Container */}
            <div className="mock-browser-outer">
              <div className={`mock-browser-window device-${previewDevice} theme-${previewTheme}`}>
                <div className="browser-chrome-bar">
                  <div className="browser-traffic-dots">
                    <span className="dot red" />
                    <span className="dot yellow" />
                    <span className="dot green" />
                  </div>
                  <div className="browser-url-input">
                    🔒 https://audiostory.vn/home
                  </div>
                  <div className="browser-action-placeholder" />
                </div>

                {/* Browser Viewport */}
                <div className="browser-viewport-screen">
                  {/* Simulated Announcement Banner */}
                  {formData.custom_announcement && (
                    <div
                      className="simulated-announcement-strip"
                      style={{ background: currentSeasonMeta.primaryColor }}
                    >
                      <span>{currentSeasonMeta.particles} {formData.custom_announcement}</span>
                    </div>
                  )}

                  {/* Simulated Client Header */}
                  <header
                    className={`sim-client-header height-${formData.header_height} ${previewTheme === "dark" ? "header-dark" : "header-light"}`}
                    style={{
                      borderBottom: `2.5px solid ${currentSeasonMeta.primaryColor}`,
                    }}
                  >
                    <div className="sim-client-container">
                      {/* Brand Logo & Title */}
                      <div className="sim-brand-zone">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="sim-logo-img" />
                        ) : (
                          <div
                            className="sim-logo-badge"
                            style={{ background: currentSeasonMeta.primaryColor }}
                          >
                            📖
                          </div>
                        )}
                        <div className="sim-titles">
                          <span className="sim-site-title">{formData.site_title}</span>
                          {formData.tagline && previewDevice === "desktop" && (
                            <span className="sim-tagline">{formData.tagline}</span>
                          )}
                        </div>
                      </div>

                      {/* Nav Links (Desktop only) */}
                      {previewDevice === "desktop" && (
                        <nav className="sim-nav-zone">
                          <span className="sim-nav-link active" style={{ color: currentSeasonMeta.primaryColor }}>
                            Trang chủ
                          </span>
                          <span className="sim-nav-link">Kho truyện audio</span>
                          <span className="sim-nav-link">Bài viết</span>
                          <span className="sim-nav-link">Bảng xếp hạng</span>
                        </nav>
                      )}

                      {/* Search Bar (if enabled) */}
                      {formData.show_search && previewDevice === "desktop" && (
                        <div className="sim-search-zone">
                          <FaSearch className="search-icon" />
                          <input type="text" placeholder="Tìm kiếm truyện audio..." readOnly />
                        </div>
                      )}

                      {/* User Actions */}
                      <div className="sim-actions-zone">
                        {formData.show_notifications && (
                          <div className="sim-action-icon" title="Thông báo">
                            <FaBell />
                            <span className="noti-dot" />
                          </div>
                        )}

                        {formData.show_theme_toggle && (
                          <div className="sim-action-icon" title="Chuyển chế độ giao diện">
                            {previewTheme === "dark" ? <FaSun /> : <FaMoon />}
                          </div>
                        )}

                        {formData.show_vip_button && (
                          <div
                            className="sim-vip-button"
                            style={{ background: currentSeasonMeta.accentColor }}
                          >
                            <FaCrown />
                            {previewDevice === "desktop" ? "Thành Viên VIP" : "VIP"}
                          </div>
                        )}

                        <div className="sim-user-avatar">
                          <span>A</span>
                        </div>
                      </div>
                    </div>
                  </header>

                  {/* Simulated Content Body */}
                  <div className="sim-page-content-mock">
                    <div className="mock-banner-hero">
                      <div className="mock-hero-text">
                        <h2>Thế Giới Truyện Audio Đỉnh Cao</h2>
                        <p>Lắng nghe từng trang sách sống động cùng giọng đọc truyền cảm.</p>
                      </div>
                    </div>

                    <div className="mock-cards-row">
                      <div className="mock-item-card" />
                      <div className="mock-item-card" />
                      <div className="mock-item-card" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informative Guidance */}
            <div className="preview-guide-card">
              <div className="guide-icon"><FaInfoCircle /></div>
              <div className="guide-text">
                <strong>Khung mô phỏng thời gian thực:</strong> Khi nhấn <em>"Lưu thay đổi"</em>, toàn bộ người dùng truy cập trang chủ và các trang con sẽ nhận được ngay giao diện màu sắc, dải thông báo và các hạt rơi của chủ đề <strong>{currentSeasonMeta.name}</strong>.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderCustomizer;
