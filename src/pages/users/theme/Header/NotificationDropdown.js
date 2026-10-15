import React, { useState, useRef, useEffect } from "react";
import {
  FaBell,
  FaGavel,
  FaBook,
  FaHeadphones,
  FaCheckDouble,
  FaTimes,
  FaExclamationTriangle,
  FaShieldAlt,
  FaInfoCircle,
  FaTools,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  useGetUserNotifications,
  useMarkUserNotificationRead,
  useMarkAllUserNotificationsRead,
} from "api/homePage";

// Format thời gian hiển thị thân thiện tiếng Việt
const formatTimeAgo = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / (1000 * 60));
    if (diffMin < 1) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "";
  }
};

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread'
  const [selectedPunishment, setSelectedPunishment] = useState(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("ACCESS_TOKEN");
  const userInfo = JSON.parse(localStorage.getItem("USER") || "null");

  // Fetch thông báo nếu người dùng đã đăng nhập
  const { data: response = {}, isLoading } = useGetUserNotifications(
    { filter },
    { enabled: !!token && !!userInfo }
  );

  const markReadMutation = useMarkUserNotificationRead();
  const markAllReadMutation = useMarkAllUserNotificationsRead();

  const notifications = response?.data || [];
  const unreadCount = response?.unread_count || 0;

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Click vào thông báo
  const handleItemClick = (notif) => {
    // Đánh dấu đã đọc nếu chưa đọc
    if (!notif.is_read) {
      markReadMutation.mutate(notif.id);
    }

    if (notif.type === "punishment") {
      // Mở modal chi tiết xử phạt
      setSelectedPunishment(notif);
      setIsOpen(false);
    } else if (notif.type === "maintenance") {
      // Mở modal chi tiết thông báo bảo trì
      setSelectedMaintenance(notif);
      setIsOpen(false);
    } else if (notif.type === "new_story") {
      const slug = notif.data?.slug;
      if (slug) {
        navigate(`/truyen/${slug}`);
      } else {
        navigate("/truyen");
      }
      setIsOpen(false);
    } else if (notif.type === "favorite_chapter") {
      const slug = notif.data?.slug;
      if (slug) {
        navigate(`/truyen/${slug}`);
      }
      setIsOpen(false);
    }
  };

  // Đánh dấu tất cả đã đọc
  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    if (unreadCount > 0) {
      markAllReadMutation.mutate();
    }
  };

  // Icon và màu sắc tương ứng với từng loại thông báo
  const renderNotifIcon = (type) => {
    switch (type) {
      case "punishment":
        return (
          <div className="notif-type-icon punishment" title="Xử phạt vi phạm">
            <FaGavel />
          </div>
        );
      case "new_story":
        return (
          <div className="notif-type-icon new-story" title="Bộ truyện mới">
            <FaBook />
          </div>
        );
      case "favorite_chapter":
        return (
          <div className="notif-type-icon favorite-chapter" title="Tập truyện mới">
            <FaHeadphones />
          </div>
        );
      case "maintenance":
        return (
          <div className="notif-type-icon maintenance" title="Thông báo bảo trì hệ thống">
            <FaTools />
          </div>
        );
      default:
        return (
          <div className="notif-type-icon general" title="Thông báo hệ thống">
            <FaBell />
          </div>
        );
    }
  };

  return (
    <div className="header-notification-wrapper" ref={dropdownRef}>
      {/* Nút Chuông Thông Báo */}
      <button
        type="button"
        className={`notification-bell-btn ${isOpen ? "active" : ""} ${unreadCount > 0 ? "has-unread" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title={unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa xem` : "Thông báo"}
        aria-label="Thông báo"
      >
        <FaBell className="bell-icon" />
        {unreadCount > 0 && (
          <span className="notification-badge" aria-label={`${unreadCount} thông báo chưa đọc`}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu Danh Sách Thông Báo */}
      {isOpen && (
        <div className="notification-dropdown-menu">
          {/* Header của Dropdown */}
          <div className="dropdown-header">
            <div className="header-title-box">
              <span className="header-title">Thông báo</span>
              {unreadCount > 0 && (
                <span className="unread-counter-tag">{unreadCount} mới</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="mark-all-read-btn"
                onClick={handleMarkAllRead}
                disabled={markAllReadMutation.isPending}
                title="Đánh dấu tất cả là đã đọc"
              >
                <FaCheckDouble /> Đã xem tất cả
              </button>
            )}
          </div>

          {/* Bộ lọc tab: Tất cả / Chưa xem */}
          <div className="dropdown-tabs">
            <button
              type="button"
              className={`tab-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Tất cả
            </button>
            <button
              type="button"
              className={`tab-btn ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          {/* Danh sách thông báo */}
          <div className="notification-list-body">
            {isLoading ? (
              <div className="notif-loading">
                <div className="loading-spinner"></div>
                <span>Đang tải thông báo...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty">
                <div className="empty-icon-wrap">
                  <FaBell />
                </div>
                <p className="empty-text">
                  {filter === "unread" ? "Không có thông báo chưa đọc" : "Bạn chưa có thông báo nào"}
                </p>
                <span className="empty-sub">
                  Các thông báo về xử phạt, truyện mới và tập mới sẽ hiển thị tại đây
                </span>
              </div>
            ) : (
              notifications.map((item) => {
                const isUnread = !item.is_read;
                return (
                  <div
                    key={item.id}
                    className={`notification-item ${isUnread ? "unread" : "read"} type-${item.type}`}
                    onClick={() => handleItemClick(item)}
                    role="button"
                    tabIndex={0}
                  >
                    {/* Icon đại diện */}
                    {renderNotifIcon(item.type)}

                    {/* Nội dung thông báo */}
                    <div className="notif-content-box">
                      <div className="notif-item-header">
                        <span className="notif-title">{item.title}</span>
                        {/* Đánh dấu chưa xem (dấu chấm xanh/đỏ) */}
                        {isUnread && (
                          <span className="unread-dot-badge" title="Chưa xem"></span>
                        )}
                      </div>
                      <p className="notif-message">{item.message}</p>
                      <div className="notif-item-footer">
                        <span className="notif-time">{formatTimeAgo(item.created_at)}</span>
                        {item.type === "punishment" && (
                          <span className="notif-action-hint">Nhấn xem chi tiết &raquo;</span>
                        )}
                        {(item.type === "new_story" || item.type === "favorite_chapter") && (
                          <span className="notif-action-hint">Nghe ngay &raquo;</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT QUYẾT ĐỊNH XỬ PHẠT TỪ ADMIN */}
      {selectedPunishment && (
        <div className="punishment-modal-overlay" onClick={() => setSelectedPunishment(null)}>
          <div
            className="punishment-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="modal-top">
              <div className="modal-title-wrap">
                <div className="icon-shield-wrap">
                  <FaShieldAlt />
                </div>
                <div>
                  <h3 className="modal-title">Quyết định Xử phạt Vi phạm</h3>
                  <span className="modal-subtitle">Từ Ban Quản Trị Hệ Thống Audio Story</span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedPunishment(null)}
                aria-label="Đóng"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-content-area">
              {/* Cảnh báo vi phạm */}
              <div className="punishment-alert-banner">
                <FaExclamationTriangle className="alert-icon" />
                <div>
                  <strong>Tài khoản bị tạm cấm bình luận & đánh giá</strong>
                  <p>
                    Hệ thống ghi nhận bình luận của bạn đã vi phạm Tiêu chuẩn Cộng đồng và có hành vi không phù hợp.
                  </p>
                </div>
              </div>

              {/* Thông tin mức phạt */}
              <div className="punishment-info-grid">
                <div className="info-cell">
                  <span className="cell-label">Hình thức xử lý:</span>
                  <span className="cell-value danger">
                    Cấm bình luận & đánh giá trong {selectedPunishment.data?.days || 7} ngày
                  </span>
                </div>

                <div className="info-cell">
                  <span className="cell-label">Thời hạn hiệu lực đến:</span>
                  <span className="cell-value highlight">
                    {selectedPunishment.data?.banned_until_formatted || "7 ngày tới"}
                  </span>
                </div>

                <div className="info-cell full-width">
                  <span className="cell-label">Lý do vi phạm:</span>
                  <span className="cell-value">
                    {selectedPunishment.data?.reason || "Vi phạm quy định văn hóa ứng xử"}
                  </span>
                </div>
              </div>

              {/* Chi tiết nội dung / Ghi chú từ admin */}
              <div className="punishment-message-card">
                <div className="card-label">Nội dung quyết định:</div>
                <div className="card-body-text">{selectedPunishment.message}</div>
                {selectedPunishment.data?.admin_note && (
                  <div className="admin-note-box">
                    <strong>Ghi chú từ Kiểm duyệt viên:</strong>{" "}
                    {selectedPunishment.data?.admin_note}
                  </div>
                )}
              </div>

              {/* Hướng dẫn tuân thủ */}
              <div className="community-guideline-box">
                <FaInfoCircle className="guideline-icon" />
                <p>
                  Trong thời gian bị cấm bình luận & đánh giá, bạn vẫn có thể nghe và trải nghiệm các bộ truyện bình thường. Hãy cùng chung tay xây dựng cộng đồng nghe truyện văn minh, tôn trọng lẫn nhau!
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-bottom-actions">
              <button
                type="button"
                className="modal-btn-confirm"
                onClick={() => setSelectedPunishment(null)}
              >
                Tôi đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT THÔNG BÁO BẢO TRÌ */}
      {selectedMaintenance && (
        <div className="punishment-modal-overlay" onClick={() => setSelectedMaintenance(null)}>
          <div
            className="punishment-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-top">
              <div className="modal-title-wrap">
                <div className="icon-shield-wrap" style={{ background: "#fef3c7", color: "#d97706" }}>
                  <FaTools />
                </div>
                <div>
                  <h3 className="modal-title">{selectedMaintenance.title || "Thông Báo Bảo Trì Hệ Thống"}</h3>
                  <span className="modal-subtitle">Từ Ban Quản Trị Hệ Thống Audio Story</span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedMaintenance(null)}
                aria-label="Đóng"
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-content-area">
              <div className="punishment-alert-banner" style={{ background: "#fffbeb", borderColor: "#fcd34d", color: "#92400e" }}>
                <FaTools className="alert-icon" style={{ color: "#d97706" }} />
                <div>
                  <strong style={{ color: "#92400e" }}>Hệ thống tiến hành nâng cấp & bảo trì</strong>
                  <p style={{ color: "#b45309" }}>
                    Trong thời gian bảo trì, các tính năng nghe truyện và đọc bài viết có thể tạm thời gián đoạn.
                  </p>
                </div>
              </div>

              <div className="punishment-info-grid">
                <div className="info-cell">
                  <span className="cell-label">Thời gian bắt đầu:</span>
                  <span className="cell-value highlight">
                    {selectedMaintenance.data?.start_time_formatted || "Đang diễn ra"}
                  </span>
                </div>

                <div className="info-cell">
                  <span className="cell-label">Dự kiến hoàn tất:</span>
                  <span className="cell-value highlight">
                    {selectedMaintenance.data?.end_time_formatted || "Sẽ cập nhật sau"}
                  </span>
                </div>

                {selectedMaintenance.data?.contact_hotline && (
                  <div className="info-cell">
                    <span className="cell-label">Hotline hỗ trợ:</span>
                    <span className="cell-value">{selectedMaintenance.data.contact_hotline}</span>
                  </div>
                )}

                {selectedMaintenance.data?.contact_email && (
                  <div className="info-cell">
                    <span className="cell-label">Email hỗ trợ:</span>
                    <span className="cell-value">{selectedMaintenance.data.contact_email}</span>
                  </div>
                )}
              </div>

              <div className="punishment-message-card">
                <div className="card-label">Nội dung thông báo:</div>
                <div className="card-body-text" style={{ whiteSpace: "pre-line" }}>
                  {selectedMaintenance.message}
                </div>
              </div>

              <div className="community-guideline-box">
                <FaInfoCircle className="guideline-icon" />
                <p>
                  Mọi dữ liệu tài khoản, lịch sử nghe và quyền lợi VIP của bạn được bảo toàn tuyệt đối. Cảm ơn bạn đã luôn đồng hành cùng Audio Story!
                </p>
              </div>
            </div>

            <div className="modal-bottom-actions">
              <button
                type="button"
                className="modal-btn-confirm"
                onClick={() => setSelectedMaintenance(null)}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
