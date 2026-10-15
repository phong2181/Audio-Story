import React, { useState, useEffect } from "react";
import {
  FaTools,
  FaPowerOff,
  FaBullhorn,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSave,
  FaUsers,
  FaEnvelope,
  FaPhoneAlt,
  FaDesktop,
  FaHistory,
  FaMagic,
  FaShieldAlt,
  FaTimes,
  FaSyncAlt,
  FaInfoCircle,
} from "react-icons/fa";
import {
  useGetAdminMaintenanceSettings,
  useUpdateAdminMaintenanceSettings,
  useSendMaintenanceNotification,
} from "api/homePage";
import { toast } from "react-toastify";
import "./style.scss";

// Chuyển đổi định dạng ISO string sang YYYY-MM-DDTHH:mm cho input datetime-local
const toDateTimeLocal = (isoString) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
};

// Format ngày giờ thân thiện tiếng Việt
const formatVNDateTime = (isoString) => {
  if (!isoString) return "Chưa thiết lập";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Không hợp lệ";
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "Không hợp lệ";
  }
};

const TEMPLATES = [
  {
    name: "⚡ Nâng cấp máy chủ & Tối ưu tốc độ",
    title: "Bảo Trì Nâng Cấp Máy Chủ & Tối Ưu Tốc Độ Audio Story",
    message:
      "Audio Story đang tiến hành nâng cấp hạ tầng máy chủ và tối ưu hóa hệ thống lưu trữ nhằm mang lại tốc độ tải trang và trải nghiệm nghe truyện mượt mà hơn.\nTrong thời gian này, các tính năng đọc và nghe truyện tạm thời gián đoạn. Rất mong quý thính giả thông cảm!",
  },
  {
    name: "🛠️ Bảo trì định kỳ hệ thống",
    title: "Bảo Trì Định Kỳ Hệ Thống Audio Story",
    message:
      "Nhằm đảm bảo sự ổn định và an toàn thông tin, hệ thống sẽ bảo trì định kỳ trong khoảng thời gian đã thông báo.\nMọi dữ liệu tài khoản, lịch sử nghe và quyền lợi VIP của bạn được bảo toàn tuyệt đối. Cảm ơn bạn đã luôn đồng hành!",
  },
  {
    name: "✨ Phát hành phiên bản & Tính năng mới",
    title: "Tạm Ngưng Dịch Vụ Để Cập Nhật Phiên Bản Mới",
    message:
      "Chúng mình đang chuẩn bị ra mắt các tính năng hấp dẫn mới cho Audio Story! Hệ thống sẽ tạm đóng để cập nhật dữ liệu và kiểm thử chất lượng trước khi mở lại.\nHãy đón chờ diện mạo mới của Audio Story nhé!",
  },
];

const MaintenanceManager = () => {
  const { data: resData, isLoading, refetch } = useGetAdminMaintenanceSettings();
  const updateMutation = useUpdateAdminMaintenanceSettings();
  const notifyMutation = useSendMaintenanceNotification();

  const [activeTab, setActiveTab] = useState("settings"); // 'settings' | 'broadcast' | 'preview'
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allowAdminBypass, setAllowAdminBypass] = useState(true);
  const [contactEmail, setContactEmail] = useState("support@audiostory.vn");
  const [contactHotline, setContactHotline] = useState("1900 6868");
  const [notifyOnSave, setNotifyOnSave] = useState(false);

  // Modal xác nhận phát thông báo
  const [showNotifyModal, setShowNotifyModal] = useState(false);

  // Sync data từ backend khi fetch thành công
  useEffect(() => {
    if (resData?.data) {
      const s = resData.data;
      setIsMaintenance(Boolean(s.is_maintenance));
      setTitle(s.title || "Bảo Trì & Nâng Cấp Hệ Thống Audio Story");
      setMessage(s.message || "");
      setStartTime(toDateTimeLocal(s.start_time));
      setEndTime(toDateTimeLocal(s.end_time));
      setAllowAdminBypass(s.allow_admin_bypass !== false);
      setContactEmail(s.contact_email || "support@audiostory.vn");
      setContactHotline(s.contact_hotline || "1900 6868");
    }
  }, [resData]);

  const rawSettings = resData?.data || {};
  const totalUsers = resData?.total_users || 0;
  const isCurrentlyActive = rawSettings.is_active_now;

  // Áp dụng template nhanh
  const handleApplyTemplate = (tpl) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    toast.info(`Đã áp dụng mẫu: "${tpl.name}"`);
  };

  // Quick Preset: Bắt đầu ngay
  const handleSetStartNow = () => {
    const now = new Date();
    setStartTime(toDateTimeLocal(now.toISOString()));
    toast.info("Đã đặt thời gian bắt đầu là ngay bây giờ");
  };

  // Quick Preset: Thêm số giờ
  const handleAddHoursToEnd = (hours) => {
    const base = startTime ? new Date(startTime) : new Date();
    const future = new Date(base.getTime() + hours * 60 * 60 * 1000);
    setEndTime(toDateTimeLocal(future.toISOString()));
    if (!startTime) {
      setStartTime(toDateTimeLocal(base.toISOString()));
    }
    toast.info(`Đã đặt thời gian kết thúc dự kiến sau ${hours} giờ`);
  };

  // Quick Preset: Đêm nay (00:00 - 04:00 sáng mai)
  const handleSetTonight = () => {
    const tonight = new Date();
    tonight.setHours(24, 0, 0, 0); // 00:00 sáng mai
    const tomorrowMorning = new Date(tonight.getTime() + 4 * 60 * 60 * 1000); // 04:00 sáng mai
    setStartTime(toDateTimeLocal(tonight.toISOString()));
    setEndTime(toDateTimeLocal(tomorrowMorning.toISOString()));
    toast.info("Đã đặt khung giờ bảo trì: 00:00 - 04:00 đêm nay");
  };

  // Xử lý Lưu cấu hình
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề thông báo bảo trì.");
      return;
    }

    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      toast.error("Thời gian kết thúc phải diễn ra sau thời gian bắt đầu.");
      return;
    }

    const payload = {
      is_maintenance: isMaintenance,
      title: title.trim(),
      message: message.trim(),
      start_time: startTime ? new Date(startTime).toISOString() : null,
      end_time: endTime ? new Date(endTime).toISOString() : null,
      allow_admin_bypass: allowAdminBypass,
      contact_email: contactEmail.trim(),
      contact_hotline: contactHotline.trim(),
      notify_users: notifyOnSave,
    };

    updateMutation.mutate(payload, {
      onSuccess: (res) => {
        toast.success(res?.message || "Cập nhật cấu hình bảo trì thành công!");
        setNotifyOnSave(false);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Lỗi cập nhật cấu hình bảo trì.");
      },
    });
  };

  // Xử lý gửi thông báo độc lập tới tất cả User
  const handleBroadcastNotification = () => {
    notifyMutation.mutate(
      {
        title: title.trim(),
        message: message.trim(),
      },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Đã gửi thông báo đến người dùng thành công!");
          setShowNotifyModal(false);
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Lỗi gửi thông báo đến người dùng.");
        },
      }
    );
  };

  return (
    <div className="maintenance-manager-container">
      {/* HEADER BAR */}
      <div className="header-card">
        <div className="header-title-box">
          <div className="icon-wrapper">
            <FaTools className="main-icon" />
          </div>
          <div>
            <div className="title-row">
              <h1>Quản Lý Cập Nhật & Bảo Trì Hệ Thống</h1>
              {isCurrentlyActive ? (
                <span className="status-pill status-active">
                  <span className="dot pulse"></span>
                  ĐANG BẢO TRÌ (CHẶN USER)
                </span>
              ) : isMaintenance ? (
                <span className="status-pill status-scheduled">
                  <span className="dot"></span>
                  ĐÃ BẬT BẢO TRÌ
                </span>
              ) : (
                <span className="status-pill status-normal">
                  <span className="dot"></span>
                  HOẠT ĐỘNG BÌNH THƯỜNG
                </span>
              )}
            </div>
            <p className="subtitle">
              Điều khiển chế độ bảo trì toàn trang, thiết lập khung giờ và gửi thông báo trực tiếp đến hộp thư của mọi người dùng.
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-refresh"
            onClick={() => refetch()}
            title="Làm mới dữ liệu"
          >
            <FaSyncAlt className={isLoading ? "spinning" : ""} />
            Làm mới
          </button>
        </div>
      </div>

      {/* QUICK STATUS & TOGGLE STRIP */}
      <div className={`quick-status-strip ${isMaintenance ? "mode-maintenance" : "mode-normal"}`}>
        <div className="status-info">
          <div className="toggle-wrapper">
            <label className="switch">
              <input
                type="checkbox"
                checked={isMaintenance}
                onChange={(e) => setIsMaintenance(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
            <div className="toggle-label-group">
              <span className="toggle-title">
                {isMaintenance ? "Chế độ Bảo Trì đang BẬT" : "Chế độ Bảo Trì đang TẮT"}
              </span>
              <span className="toggle-hint">
                {isMaintenance
                  ? "Chỉ Admin có thể sử dụng. Phía User bị ẩn toàn bộ nội dung và hiển thị thông báo bảo trì."
                  : "Mọi người dùng và khách vãng lai truy cập website bình thường."}
              </span>
            </div>
          </div>
        </div>

        <div className="quick-metrics">
          <div className="metric-item">
            <FaUsers className="metric-icon" />
            <div>
              <span className="metric-val">{totalUsers}</span>
              <span className="metric-lbl">Người dùng</span>
            </div>
          </div>
          <div className="metric-item">
            <FaBullhorn className="metric-icon" />
            <div>
              <span className="metric-val">{rawSettings.notified_count || 0}</span>
              <span className="metric-lbl">Đã nhận thông báo</span>
            </div>
          </div>
          <div className="metric-item">
            <FaClock className="metric-icon" />
            <div>
              <span className="metric-val">
                {rawSettings.last_notified_at ? formatVNDateTime(rawSettings.last_notified_at) : "Chưa gửi"}
              </span>
              <span className="metric-lbl">Lần gửi gần nhất</span>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="tabs-bar">
        <button
          type="button"
          className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <FaTools /> Cấu Hình & Lịch Trình
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "broadcast" ? "active" : ""}`}
          onClick={() => setActiveTab("broadcast")}
        >
          <FaBullhorn /> Gửi Thông Báo Cho User
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "preview" ? "active" : ""}`}
          onClick={() => setActiveTab("preview")}
        >
          <FaDesktop /> Xem Trước Giao Diện User
        </button>
      </div>

      {/* TAB CONTENT 1: CẤU HÌNH & LỊCH TRÌNH */}
      {activeTab === "settings" && (
        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* CỘT TRÁI: NỘI DUNG VÀ THỜI GIAN */}
            <div className="col-main">
              <div className="card-box">
                <div className="card-header">
                  <h3>
                    <FaInfoCircle className="card-icon" /> Thông Điệp & Nội Dung Bảo Trì
                  </h3>
                </div>
                <div className="card-body">
                  {/* MẪU CÓ SẴN */}
                  <div className="templates-section">
                    <span className="templates-label">
                      <FaMagic /> Chọn mẫu soạn nhanh:
                    </span>
                    <div className="template-chips">
                      {TEMPLATES.map((tpl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="template-chip"
                          onClick={() => handleApplyTemplate(tpl)}
                        >
                          {tpl.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TIÊU ĐỀ */}
                  <div className="form-group">
                    <label className="required">Tiêu Đề Thông Báo Bảo Trì</label>
                    <input
                      type="text"
                      className="form-control"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ví dụ: Bảo Trì & Nâng Cấp Hệ Thống Audio Story"
                      required
                    />
                  </div>

                  {/* NỘI DUNG LỜI NHẮN */}
                  <div className="form-group">
                    <label>Thông Điệp / Lời Nhắn Gửi Đến Độc Giả</label>
                    <textarea
                      className="form-control textarea"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Nhập lý do bảo trì, thời gian dự kiến và lời nhắn gửi đến thính giả..."
                    />
                    <small className="help-text">
                      Nội dung này sẽ hiển thị trên Màn hình bảo trì toàn trang của User và trong mục Hộp thư thông báo của họ.
                    </small>
                  </div>
                </div>
              </div>

              {/* CARD THỜI GIAN & LỊCH TRÌNH */}
              <div className="card-box">
                <div className="card-header">
                  <h3>
                    <FaClock className="card-icon" /> Khung Thời Gian Bảo Trì
                  </h3>
                </div>
                <div className="card-body">
                  {/* PRESET BUTTONS */}
                  <div className="time-presets">
                    <span className="preset-label">Phím tắt thời gian:</span>
                    <button type="button" className="btn-preset" onClick={handleSetStartNow}>
                      Bắt đầu ngay
                    </button>
                    <button type="button" className="btn-preset" onClick={() => handleAddHoursToEnd(1)}>
                      +1 Giờ
                    </button>
                    <button type="button" className="btn-preset" onClick={() => handleAddHoursToEnd(2)}>
                      +2 Giờ
                    </button>
                    <button type="button" className="btn-preset" onClick={() => handleAddHoursToEnd(4)}>
                      +4 Giờ
                    </button>
                    <button type="button" className="btn-preset highlight" onClick={handleSetTonight}>
                      Đêm nay (00h - 04h)
                    </button>
                  </div>

                  <div className="time-inputs-row">
                    <div className="form-group flex-1">
                      <label>Thời Gian Bắt Đầu</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                      <small className="help-text">
                        {startTime ? formatVNDateTime(startTime) : "Chưa chọn (Có hiệu lực ngay khi bật)"}
                      </small>
                    </div>

                    <div className="form-group flex-1">
                      <label>Thời Gian Dự Kiến Hoàn Tất</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                      <small className="help-text">
                        {endTime ? formatVNDateTime(endTime) : "Chưa chọn (Không giới hạn thời gian kết thúc)"}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: QUYỀN TRUY CẬP & LIÊN HỆ */}
            <div className="col-side">
              {/* QUYỀN HẠN & NGOẠI LỆ */}
              <div className="card-box">
                <div className="card-header">
                  <h3>
                    <FaShieldAlt className="card-icon" /> Quyền Quản Trị Viên
                  </h3>
                </div>
                <div className="card-body">
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="allowBypassCheck"
                      checked={allowAdminBypass}
                      onChange={(e) => setAllowAdminBypass(e.target.checked)}
                    />
                    <label htmlFor="allowBypassCheck">
                      <strong>Cho phép Admin/Staff tiếp tục sử dụng</strong>
                      <p>
                        Khi bật, các tài khoản quản trị viên và nhân viên vẫn có thể đăng nhập và truy cập trang quản trị bình thường.
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              {/* THÔNG TIN HỖ TRỢ */}
              <div className="card-box">
                <div className="card-header">
                  <h3>
                    <FaEnvelope className="card-icon" /> Kênh Hỗ Trợ Khách Hàng
                  </h3>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label>
                      <FaEnvelope /> Email Hỗ Trợ
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="support@audiostory.vn"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FaPhoneAlt /> Hotline Hỗ Trợ
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={contactHotline}
                      onChange={(e) => setContactHotline(e.target.value)}
                      placeholder="1900 6868"
                    />
                  </div>
                </div>
              </div>

              {/* GỬI THÔNG BÁO KÈM THEO */}
              <div className="card-box notify-option-card">
                <div className="card-body">
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="notifyOnSaveCheck"
                      checked={notifyOnSave}
                      onChange={(e) => setNotifyOnSave(e.target.checked)}
                    />
                    <label htmlFor="notifyOnSaveCheck">
                      <strong>Gửi thông báo đến hộp thư người dùng</strong>
                      <p>
                        Tự động phát thông báo bảo trì kèm khung giờ đến tất cả {totalUsers} người dùng ngay khi bấm Lưu.
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              {/* ACTION SUBMIT */}
              <div className="submit-card">
                <button
                  type="submit"
                  className="btn-submit-main"
                  disabled={updateMutation.isPending}
                >
                  <FaSave />
                  {updateMutation.isPending ? "Đang lưu cấu hình..." : "Lưu Cài Đặt Bảo Trì"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB CONTENT 2: GỬI THÔNG BÁO CHO USER */}
      {activeTab === "broadcast" && (
        <div className="broadcast-tab-view">
          <div className="broadcast-hero-card">
            <div className="broadcast-icon-box">
              <FaBullhorn />
            </div>
            <div className="broadcast-intro">
              <h2>Gửi Thông Báo Bảo Trì Trực Tiếp Đến Từng User</h2>
              <p>
                Tính năng này sẽ tạo bản ghi thông báo trong mục <strong>Thông Báo (Notification Bell)</strong> của tất cả <strong>{totalUsers} tài khoản người dùng</strong> trong hệ thống.
                Người dùng sẽ biết trước thời gian bảo trì để chủ động sắp xếp thời gian nghe truyện.
              </p>
            </div>
          </div>

          <div className="broadcast-preview-container">
            <div className="preview-label-tag">Mẫu thông báo sẽ gửi đến hộp thư người dùng:</div>
            <div className="inbox-notification-card">
              <div className="inbox-notif-header">
                <div className="icon-circle maintenance">
                  <FaTools />
                </div>
                <div className="header-meta">
                  <h4>{title || "Thông Báo Bảo Trì Hệ Thống Audio Story"}</h4>
                  <span className="notif-badge">Hệ Thống</span>
                </div>
              </div>

              <div className="inbox-notif-body">
                <div className="schedule-box">
                  <div className="schedule-row">
                    <span className="lbl">Bắt đầu:</span>
                    <span className="val highlight">{startTime ? formatVNDateTime(startTime) : "Đang diễn ra"}</span>
                  </div>
                  <div className="schedule-row">
                    <span className="lbl">Dự kiến xong:</span>
                    <span className="val highlight">{endTime ? formatVNDateTime(endTime) : "Sẽ cập nhật sau"}</span>
                  </div>
                </div>

                <p className="notif-content-text">
                  {message || "Hệ thống đang tiến hành bảo trì nhằm nâng cao trải nghiệm nghe truyện của quý thính giả. Trong thời gian bảo trì, các tính năng đọc và nghe truyện tạm thời bị khóa. Xin quý thính giả thông cảm!"}
                </p>

                <div className="notif-support-footer">
                  <span>Hỗ trợ: {contactEmail} | {contactHotline}</span>
                </div>
              </div>
            </div>

            <div className="broadcast-actions-box">
              <button
                type="button"
                className="btn-trigger-broadcast"
                onClick={() => setShowNotifyModal(true)}
                disabled={notifyMutation.isPending}
              >
                <FaBullhorn />
                {notifyMutation.isPending
                  ? "Đang gửi thông báo..."
                  : `Phát Lệnh Gửi Thông Báo Đến Toàn Bộ (${totalUsers}) Người Dùng`}
              </button>
              {rawSettings.last_notified_at && (
                <p className="broadcast-history-note">
                  <FaHistory /> Lần gần nhất phát thông báo: <strong>{formatVNDateTime(rawSettings.last_notified_at)}</strong> (Đã gửi tới {rawSettings.notified_count || 0} tài khoản)
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: XEM TRƯỚC GIAO DIỆN USER */}
      {activeTab === "preview" && (
        <div className="preview-tab-view">
          <div className="preview-notice-bar">
            <FaDesktop />
            <span>
              Đây là giao diện Màn hình Bảo trì toàn trang mà Người Dùng và Khách Vãng Lai sẽ nhìn thấy khi truy cập website trong thời gian bảo trì. Toàn bộ nội dung khác (truyện, audio, bài viết) đều bị ẩn đi.
            </span>
          </div>

          <div className="mock-browser-frame">
            <div className="browser-header">
              <div className="browser-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="browser-address">https://audiostory.vn</div>
            </div>

            <div className="mock-browser-viewport">
              {/* MÀN HÌNH BẢO TRÌ MẪU */}
              <div className="preview-maintenance-screen">
                <div className="preview-center-box">
                  <div className="preview-animated-gear">
                    <FaTools className="gear-icon" />
                  </div>

                  <span className="preview-maintenance-badge">
                    BẢO TRÌ & NÂNG CẤP HỆ THỐNG
                  </span>

                  <h2 className="preview-title">
                    {title || "Hệ Thống Audio Story Đang Bảo Trì"}
                  </h2>

                  <p className="preview-message">
                    {message || "Audio Story đang tiến hành nâng cấp máy chủ định kỳ nhằm tối ưu hóa trải nghiệm nghe truyện và cải thiện tốc độ tải. Chúng tôi sẽ quay trở lại trong thời gian sớm nhất!"}
                  </p>

                  <div className="preview-time-card">
                    <div className="time-block">
                      <span className="time-title">Bắt Đầu</span>
                      <span className="time-val">{startTime ? formatVNDateTime(startTime) : "Ngay bây giờ"}</span>
                    </div>
                    <div className="time-arrow">➜</div>
                    <div className="time-block">
                      <span className="time-title">Dự Kiến Hoàn Tất</span>
                      <span className="time-val highlight">{endTime ? formatVNDateTime(endTime) : "Sớm nhất có thể"}</span>
                    </div>
                  </div>

                  <div className="preview-countdown-strip">
                    <div className="countdown-cell">
                      <span className="num">02</span>
                      <span className="unit">Giờ</span>
                    </div>
                    <div className="countdown-cell">
                      <span className="num">45</span>
                      <span className="unit">Phút</span>
                    </div>
                    <div className="countdown-cell">
                      <span className="num">18</span>
                      <span className="unit">Giây</span>
                    </div>
                  </div>

                  <div className="preview-contact-bar">
                    <span>Email: <strong>{contactEmail}</strong></span>
                    <span>Hotline: <strong>{contactHotline}</strong></span>
                  </div>

                  <div className="preview-admin-bypass-link">
                    <span>Bạn là Quản trị viên? <a href="/admin/login" onClick={(e) => e.preventDefault()}>Đăng nhập Admin</a></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN PHÁT THÔNG BÁO CHO TOÀN BỘ NGƯỜI DÙNG */}
      {showNotifyModal && (
        <div className="maintenance-modal-backdrop" onClick={() => setShowNotifyModal(false)}>
          <div className="maintenance-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div className="modal-title-group">
                <FaBullhorn className="modal-icon" />
                <h3>Xác Nhận Phát Thông Báo</h3>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setShowNotifyModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-content-text">
              <div className="warning-banner">
                <FaExclamationTriangle />
                <div>
                  <strong>Cảnh báo: Hành động này sẽ gửi thông báo đến {totalUsers} tài khoản!</strong>
                  <p>Mỗi người dùng sẽ nhận được một thông báo trong mục Hộp Thư Thông Báo của họ.</p>
                </div>
              </div>

              <div className="confirm-details">
                <div className="detail-line">
                  <span className="label">Tiêu đề:</span>
                  <span className="value font-bold">{title}</span>
                </div>
                <div className="detail-line">
                  <span className="label">Thời gian:</span>
                  <span className="value">
                    {startTime ? formatVNDateTime(startTime) : "Đang diễn ra"} ➜{" "}
                    {endTime ? formatVNDateTime(endTime) : "Chưa xác định"}
                  </span>
                </div>
                <div className="detail-line">
                  <span className="label">Người nhận:</span>
                  <span className="value highlight">{totalUsers} tài khoản người dùng</span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowNotifyModal(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn-confirm-send"
                onClick={handleBroadcastNotification}
                disabled={notifyMutation.isPending}
              >
                <FaBullhorn />
                {notifyMutation.isPending ? "Đang gửi..." : "Xác Nhận Gửi Ngay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceManager;
