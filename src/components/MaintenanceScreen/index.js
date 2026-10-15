import React, { useState, useEffect } from "react";
import {
  FaTools,
  FaClock,
  FaSyncAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaShieldAlt,
  FaServer,
  FaCheckCircle,
} from "react-icons/fa";
import "./style.scss";

// Tính toán thời gian đếm ngược đến end_time
const calculateTimeLeft = (endTimeStr) => {
  if (!endTimeStr) return null;
  const difference = new Date(endTimeStr) - new Date();
  if (difference <= 0) return null;

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

// Format ngày giờ thân thiện tiếng Việt
const formatVNDateTime = (isoString) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const MaintenanceScreen = ({ data = {} }) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(data.end_time));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startTimeStr = formatVNDateTime(data.start_time);
  const endTimeStr = formatVNDateTime(data.end_time);

  // Đếm ngược mỗi giây
  useEffect(() => {
    if (!data.end_time) return;

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft(data.end_time);
      setTimeLeft(remaining);
      if (!remaining) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data.end_time]);

  // Nút Tải lại trang kiểm tra xem bảo trì đã kết thúc chưa
  const handleReload = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="maintenance-screen-fullscreen">
      {/* Background ambient lighting */}
      <div className="ambient-glow glow-top"></div>
      <div className="ambient-glow glow-bottom"></div>

      <div className="maintenance-card-wrapper">
        {/* Animated Icon */}
        <div className="maintenance-icon-halo">
          <div className="gear-outer">
            <FaTools className="icon-tools" />
          </div>
          <div className="server-dot">
            <span className="dot-pulse"></span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="badge-pill">
          <span className="pill-dot"></span>
          BẢO TRÌ & NÂNG CẤP HỆ THỐNG
        </div>

        {/* Title */}
        <h1 className="maintenance-headline">
          {data.title || "Hệ Thống Audio Story Đang Nâng Cấp"}
        </h1>

        {/* Message */}
        <p className="maintenance-description">
          {data.message ||
            "Chúng mình đang tiến hành nâng cấp máy chủ định kỳ nhằm tối ưu hóa trải nghiệm nghe truyện và cải thiện tốc độ tải. Mọi dữ liệu tài khoản và quyền lợi của bạn được bảo toàn tuyệt đối."}
        </p>

        {/* Khung thời gian bảo trì */}
        {(startTimeStr || endTimeStr) && (
          <div className="timeframe-card">
            <div className="time-col">
              <span className="col-label">Bắt đầu</span>
              <span className="col-time">{startTimeStr || "Đang diễn ra"}</span>
            </div>
            <div className="time-divider">
              <span className="arrow-line"></span>
            </div>
            <div className="time-col">
              <span className="col-label">Dự kiến hoàn tất</span>
              <span className="col-time highlight">{endTimeStr || "Sẽ mở lại sớm"}</span>
            </div>
          </div>
        )}

        {/* Đồng hồ đếm ngược nếu có end_time */}
        {timeLeft && (
          <div className="countdown-container">
            <div className="countdown-title">
              <FaClock /> Dự kiến mở lại sau:
            </div>
            <div className="countdown-grid">
              {timeLeft.days > 0 && (
                <div className="countdown-box">
                  <span className="box-number">{String(timeLeft.days).padStart(2, "0")}</span>
                  <span className="box-unit">Ngày</span>
                </div>
              )}
              <div className="countdown-box">
                <span className="box-number">{String(timeLeft.hours).padStart(2, "0")}</span>
                <span className="box-unit">Giờ</span>
              </div>
              <div className="countdown-box">
                <span className="box-number">{String(timeLeft.minutes).padStart(2, "0")}</span>
                <span className="box-unit">Phút</span>
              </div>
              <div className="countdown-box">
                <span className="box-number highlight">{String(timeLeft.seconds).padStart(2, "0")}</span>
                <span className="box-unit">Giây</span>
              </div>
            </div>
          </div>
        )}

        {/* Thanh trạng thái nâng cấp */}
        <div className="system-status-indicator">
          <div className="status-item done">
            <FaCheckCircle className="status-icon" />
            <span>Sao lưu dữ liệu</span>
          </div>
          <div className="status-separator"></div>
          <div className="status-item active">
            <span className="spinner-mini"></span>
            <span>Nâng cấp máy chủ</span>
          </div>
          <div className="status-separator"></div>
          <div className="status-item pending">
            <span className="circle-pending"></span>
            <span>Khởi chạy dịch vụ</span>
          </div>
        </div>

        {/* Nút tải lại trang */}
        <div className="action-row">
          <button
            type="button"
            className="btn-reload-system"
            onClick={handleReload}
            disabled={isRefreshing}
          >
            <FaSyncAlt className={isRefreshing ? "spin-fast" : ""} />
            {isRefreshing ? "Đang kiểm tra..." : "Kiểm Tra Trạng Thái / Tải Lại Trang"}
          </button>
        </div>

        {/* Kênh hỗ trợ */}
        {(data.contact_email || data.contact_hotline) && (
          <div className="contact-footer">
            <span>Cần trợ giúp khẩn cấp?</span>
            <div className="contact-links">
              {data.contact_email && (
                <a href={`mailto:${data.contact_email}`} className="contact-item">
                  <FaEnvelope /> {data.contact_email}
                </a>
              )}
              {data.contact_hotline && (
                <a href={`tel:${data.contact_hotline}`} className="contact-item">
                  <FaPhoneAlt /> Hotline: {data.contact_hotline}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Admin Login shortcut */}
        <div className="admin-shortcut">
          <span>
            Bạn là Quản trị viên? <a href="/admin/login">Đăng nhập Quản Trị</a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceScreen;
