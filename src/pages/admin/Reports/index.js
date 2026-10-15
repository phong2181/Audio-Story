import React, { useState, useEffect } from "react";
import {
  FaFlag,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaTrash,
  FaSyncAlt,
  FaEye,
  FaShieldAlt,
  FaCommentSlash,
  FaClock,
  FaBookOpen,
  FaNewspaper,
  FaTimes,
  FaGavel,
  FaFire,
  FaExclamationTriangle,
  FaQuoteLeft,
  FaUserShield,
  FaUser,
  FaCheck,
  FaFilter,
  FaExternalLinkAlt,
} from "react-icons/fa";
import {
  useGetAdminReports,
  useResolveAdminReport,
  useDismissAdminReport,
  useDeleteAdminReport,
  usePunishAdminReport,
} from "api/homePage";
import Swal from "sweetalert2";
import { STORAGE_URL } from "config/config";
import "./style.scss";

const REASON_CONFIG = {
  spam: { label: "Spam / Quảng cáo rác", color: "warning", icon: FaExclamationTriangle },
  provocation: { label: "Hành vi khiêu khích", color: "orange", icon: FaFire },
  cyberbullying: { label: "Bạo lực mạng / Xúc phạm", color: "danger", icon: FaShieldAlt },
  incitement: { label: "Kích động gây hấn", color: "purple", icon: FaExclamationTriangle },
  profanity: { label: "Lời nói thô tục", color: "red", icon: FaCommentSlash },
  other: { label: "Lý do khác", color: "slate", icon: FaFlag },
};

const getAvatarUrl = (avatar) => {
  if (!avatar) return "https://i.pravatar.cc/100?img=33";
  if (avatar.startsWith("http")) return avatar;
  return `${STORAGE_URL}${avatar}`;
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "---";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

// Component Avatar thông minh có fallback chữ cái đầu khi lỗi link
const UserAvatar = ({ user, isReported = false }) => {
  const [imgError, setImgError] = useState(false);
  const name = user?.name || (isReported ? "Bị tố cáo" : "Người dùng");
  const initial = name.trim().charAt(0).toUpperCase() || "U";
  const avatarUrl = getAvatarUrl(user?.avatar);

  if (imgError || !user?.avatar) {
    return (
      <div className={`user-avatar-initials ${isReported ? "reported" : ""}`}>
        {initial}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={name}
      className={`user-avatar-img ${isReported ? "reported" : ""}`}
      onError={() => setImgError(true)}
    />
  );
};

const ReportsManager = () => {
  useEffect(() => {
    document.title = "Trung tâm Kiểm duyệt & Tố cáo Bình luận | WordPress Admin";
  }, []);

  const [statusFilter, setStatusFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  // Modal Chi tiết & Xử lý
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteCommentChecked, setDeleteCommentChecked] = useState(true);
  const [adminNote, setAdminNote] = useState("");
  const [punishDays, setPunishDays] = useState(7);

  // React Query Hooks
  const { data: response = {}, isLoading, refetch, isFetching } = useGetAdminReports({
    status: statusFilter,
    reason: reasonFilter,
    search: searchTerm,
    page: page,
    per_page: 15,
  });

  const resolveMutation = useResolveAdminReport();
  const dismissMutation = useDismissAdminReport();
  const deleteMutation = useDeleteAdminReport();
  const punishMutation = usePunishAdminReport();

  const reportsList = response?.data || [];
  const metrics = response?.metrics || {
    total: 0,
    pending: 0,
    resolved: 0,
    dismissed: 0,
  };
  const pagination = response?.pagination || {
    current_page: 1,
    last_page: 1,
    total: 0,
  };

  const handleOpenModal = (report) => {
    setSelectedReport(report);
    setAdminNote(report.admin_note || "");
    setDeleteCommentChecked(true);
    setPunishDays(7);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
    setAdminNote("");
  };

  // Thao tác: Duyệt vi phạm & Xóa bình luận
  const handleResolve = async (report, shouldDelete = true) => {
    const result = await Swal.fire({
      title: "Xác nhận duyệt vi phạm",
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.6;">
          <p>Bạn có chắc chắn muốn phê duyệt vi phạm đối với tố cáo <strong>#${report.id}</strong>?</p>
          <div style="background: ${shouldDelete ? '#fef2f2' : '#eff6ff'}; border: 1px solid ${shouldDelete ? '#fecaca' : '#bfdbfe'}; color: ${shouldDelete ? '#b91c1c' : '#1d4ed8'}; padding: 10px 12px; border-radius: 6px; margin-top: 8px; font-weight: 500;">
            ${shouldDelete ? '⚠️ Bình luận vi phạm sẽ bị xóa vĩnh viễn khỏi hệ thống ngay lập tức!' : 'ℹ️ Bình luận sẽ được đánh dấu vi phạm nhưng giữ nguyên nội dung.'}
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: shouldDelete ? "Duyệt & Xóa bình luận" : "Xác nhận duyệt",
      cancelButtonText: "Hủy bỏ",
      confirmButtonColor: shouldDelete ? "#dc2626" : "#2563eb",
    });

    if (result.isConfirmed) {
      try {
        await resolveMutation.mutateAsync({
          id: report.id,
          data: {
            delete_comment: shouldDelete,
            admin_note: adminNote || "Đã xác minh vi phạm quy định cộng đồng.",
          },
        });

        Swal.fire({
          title: "Đã duyệt vi phạm!",
          text: "Đã xử lý hồ sơ tố cáo thành công.",
          icon: "success",
          confirmButtonColor: "#2563eb",
        });

        handleCloseModal();
      } catch (err) {
        Swal.fire({
          title: "Lỗi xử lý",
          text: err.response?.data?.message || "Không thể xử lý tố cáo.",
          icon: "error",
        });
      }
    }
  };

  // Thao tác: Bác bỏ tố cáo (Không vi phạm)
  const handleDismiss = async (report) => {
    const result = await Swal.fire({
      title: "Bác bỏ khiếu nại tố cáo?",
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.6;">
          <p>Xác nhận bác bỏ tố cáo đối với bình luận của <strong>${report.reported_user?.name || "người dùng"}</strong>.</p>
          <p style="color: #64748b; font-size: 13px; margin: 0;">
            Bình luận được giữ nguyên và đánh dấu là hợp lệ, không vi phạm tiêu chuẩn cộng đồng.
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Xác nhận Bác bỏ",
      cancelButtonText: "Đóng",
      confirmButtonColor: "#64748b",
    });

    if (result.isConfirmed) {
      try {
        await dismissMutation.mutateAsync({
          id: report.id,
          data: {
            admin_note: adminNote || "Bình luận không vi phạm tiêu chuẩn cộng đồng.",
          },
        });

        Swal.fire({
          title: "Đã bác bỏ!",
          text: "Đã đánh dấu tố cáo là không vi phạm.",
          icon: "info",
          confirmButtonColor: "#2563eb",
        });

        handleCloseModal();
      } catch (err) {
        Swal.fire({
          title: "Lỗi",
          text: err.response?.data?.message || "Không thể bác bỏ tố cáo.",
          icon: "error",
        });
      }
    }
  };

  // Thao tác: Xử phạt cấm bình luận & đánh giá X ngày
  const handlePunish = async (report) => {
    const reportedUserName = report.reported_user?.name || "Người dùng này";
    const result = await Swal.fire({
      title: "Thi hành kỷ luật & Xử phạt",
      html: `
        <div style="text-align: left; font-size: 13.5px; line-height: 1.6;">
          <p style="margin-bottom: 6px;">Đối tượng xử phạt: <strong style="color: #dc2626; font-size: 15px;">${reportedUserName}</strong></p>
          <p style="margin-bottom: 8px;">Hình thức kỷ luật: <strong>Đình chỉ bình luận & đánh giá trong ${punishDays} ngày</strong></p>
          <div style="color: #991b1b; font-size: 12.5px; background: #fee2e2; border: 1px solid #fecaca; padding: 10px; border-radius: 6px; margin-bottom: 8px;">
            ⚠️ Người dùng sẽ bị khóa tính năng bình luận/đánh giá toàn hệ thống và nhận thông báo kỷ luật trực tiếp trên trang cá nhân.
          </div>
          ${deleteCommentChecked ? '<div style="color: #b45309; font-size: 12.5px; font-weight: 500;">✓ Đồng thời xóa vĩnh viễn bình luận vi phạm khỏi cơ sở dữ liệu.</div>' : ''}
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Thi hành phạt ${punishDays} ngày`,
      cancelButtonText: "Hủy bỏ",
      confirmButtonColor: "#dc2626",
    });

    if (result.isConfirmed) {
      try {
        const res = await punishMutation.mutateAsync({
          id: report.id,
          data: {
            days: punishDays,
            delete_comment: deleteCommentChecked,
            admin_note: adminNote || `Xử phạt cấm bình luận & đánh giá ${punishDays} ngày do vi phạm chuẩn mực cộng đồng.`,
          },
        });

        Swal.fire({
          title: "Đã thi hành kỷ luật thành công!",
          text: res?.data?.message || `Đã áp dụng mức phạt cấm ${punishDays} ngày và gửi thông báo tới người dùng.`,
          icon: "success",
          confirmButtonColor: "#2563eb",
        });

        handleCloseModal();
      } catch (err) {
        Swal.fire({
          title: "Lỗi thi hành kỷ luật",
          text: err.response?.data?.message || "Không thể thực hiện xử phạt.",
          icon: "error",
        });
      }
    }
  };

  // Thao tác: Xóa hồ sơ tố cáo
  const handleDeleteRecord = async (reportId) => {
    const result = await Swal.fire({
      title: "Xóa hồ sơ tố cáo?",
      text: "Hồ sơ lưu trữ tố cáo này sẽ bị xóa vĩnh viễn khỏi trung tâm kiểm duyệt.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa hồ sơ",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#dc2626",
    });

    if (result.isConfirmed) {
      try {
        await deleteMutation.mutateAsync(reportId);
        Swal.fire({
          title: "Đã xóa!",
          text: "Hồ sơ tố cáo đã được xóa thành công.",
          icon: "success",
          confirmButtonColor: "#2563eb",
        });
      } catch (err) {
        Swal.fire({
          title: "Lỗi",
          text: err.response?.data?.message || "Không thể xóa hồ sơ.",
          icon: "error",
        });
      }
    }
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setReasonFilter("all");
    setSearchTerm("");
    setPage(1);
  };

  const hasActiveFilters = statusFilter !== "all" || reasonFilter !== "all" || searchTerm.trim() !== "";

  return (
    <div className="wp-reports-page">
      {/* 1. Header Trung tâm Kiểm duyệt */}
      <div className="wp-page-header">
        <div className="wp-header-left">
          <div className="title-row">
            <div className="title-icon-wrapper">
              <FaShieldAlt className="title-icon" />
            </div>
            <div>
              <h1 className="wp-page-title">
                Trung tâm Kiểm duyệt & Tố cáo
              </h1>
              <p className="wp-page-subtitle">
                Giám sát, xử lý khiếu nại vi phạm chuẩn mực văn hóa và chế tài kỷ luật tài khoản
              </p>
            </div>
          </div>
        </div>

        <div className="wp-header-right">
          {metrics.pending > 0 ? (
            <div className="pending-alert-badge">
              <span className="pulse-dot"></span>
              <span><strong>{metrics.pending}</strong> tố cáo đang chờ xử lý</span>
            </div>
          ) : (
            <div className="system-clean-badge">
              <FaCheckCircle />
              <span>Hệ thống an toàn</span>
            </div>
          )}

          <button
            type="button"
            className="wp-btn-refresh"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Tải lại danh sách tố cáo"
          >
            <FaSyncAlt className={isFetching ? "fa-spin" : ""} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* 2. Metric KPI Cards (Clickable Filter Cards) */}
      <div className="wp-metric-cards">
        <div
          className={`wp-metric-card total ${statusFilter === "all" ? "card-active" : ""}`}
          onClick={() => { setStatusFilter("all"); setPage(1); }}
          role="button"
          tabIndex={0}
        >
          <div className="card-top">
            <div className="metric-icon total">
              <FaFlag />
            </div>
            <span className="metric-chip total">Toàn bộ hồ sơ</span>
          </div>
          <div className="metric-info">
            <span className="metric-value">{metrics.total}</span>
            <span className="metric-label">Tổng lượt tố cáo ghi nhận</span>
          </div>
          <div className="card-indicator">
            <span className="indicator-text">Nhấn để lọc tất cả</span>
          </div>
        </div>

        <div
          className={`wp-metric-card pending ${statusFilter === "pending" ? "card-active" : ""}`}
          onClick={() => { setStatusFilter("pending"); setPage(1); }}
          role="button"
          tabIndex={0}
        >
          <div className="card-top">
            <div className="metric-icon pending">
              <FaClock />
            </div>
            <span className="metric-chip pending">
              <span className="mini-pulse"></span> Cần duyệt ngay
            </span>
          </div>
          <div className="metric-info">
            <span className="metric-value">{metrics.pending}</span>
            <span className="metric-label">Đang chờ xử lý</span>
          </div>
          <div className="card-indicator">
            <span className="indicator-text">
              {metrics.total > 0 ? `${Math.round((metrics.pending / metrics.total) * 100)}% tổng số hồ sơ` : "0% hồ sơ"}
            </span>
          </div>
        </div>

        <div
          className={`wp-metric-card resolved ${statusFilter === "resolved" ? "card-active" : ""}`}
          onClick={() => { setStatusFilter("resolved"); setPage(1); }}
          role="button"
          tabIndex={0}
        >
          <div className="card-top">
            <div className="metric-icon resolved">
              <FaCheckCircle />
            </div>
            <span className="metric-chip resolved">Đã xử phạt</span>
          </div>
          <div className="metric-info">
            <span className="metric-value">{metrics.resolved}</span>
            <span className="metric-label">Đã duyệt & xử lý</span>
          </div>
          <div className="card-indicator">
            <span className="indicator-text">
              {metrics.total > 0 ? `${Math.round((metrics.resolved / metrics.total) * 100)}% đã giải quyết` : "0%"}
            </span>
          </div>
        </div>

        <div
          className={`wp-metric-card dismissed ${statusFilter === "dismissed" ? "card-active" : ""}`}
          onClick={() => { setStatusFilter("dismissed"); setPage(1); }}
          role="button"
          tabIndex={0}
        >
          <div className="card-top">
            <div className="metric-icon dismissed">
              <FaTimesCircle />
            </div>
            <span className="metric-chip dismissed">Không vi phạm</span>
          </div>
          <div className="metric-info">
            <span className="metric-value">{metrics.dismissed}</span>
            <span className="metric-label">Đã bác bỏ khiếu nại</span>
          </div>
          <div className="card-indicator">
            <span className="indicator-text">
              {metrics.total > 0 ? `${Math.round((metrics.dismissed / metrics.total) * 100)}% khiếu nại sai` : "0%"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Control Bar (Status Pills, Filters & Search) */}
      <div className="wp-control-bar">
        <div className="wp-status-tabs">
          <button
            type="button"
            className={`tab-btn ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => { setStatusFilter("all"); setPage(1); }}
          >
            <FaFlag className="tab-icon" />
            <span>Tất cả</span>
            <span className="count-pill">{metrics.total}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${statusFilter === "pending" ? "active" : ""}`}
            onClick={() => { setStatusFilter("pending"); setPage(1); }}
          >
            <FaClock className="tab-icon" />
            <span>Chờ xử lý</span>
            <span className="count-pill pending">{metrics.pending}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${statusFilter === "resolved" ? "active" : ""}`}
            onClick={() => { setStatusFilter("resolved"); setPage(1); }}
          >
            <FaCheckCircle className="tab-icon" />
            <span>Đã xử lý</span>
            <span className="count-pill resolved">{metrics.resolved}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${statusFilter === "dismissed" ? "active" : ""}`}
            onClick={() => { setStatusFilter("dismissed"); setPage(1); }}
          >
            <FaTimesCircle className="tab-icon" />
            <span>Đã bác bỏ</span>
            <span className="count-pill dismissed">{metrics.dismissed}</span>
          </button>
        </div>

        <div className="wp-filters-group">
          {/* Lọc theo lý do vi phạm */}
          <div className="filter-select-wrapper">
            <FaFilter className="select-icon" />
            <select
              className="wp-select"
              value={reasonFilter}
              onChange={(e) => { setReasonFilter(e.target.value); setPage(1); }}
            >
              <option value="all">Tất cả hành vi vi phạm</option>
              {Object.entries(REASON_CONFIG).map(([k, cfg]) => (
                <option key={k} value={k}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          {/* Ô tìm kiếm */}
          <div className="wp-search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Tìm user, nội dung vi phạm..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => { setSearchTerm(""); setPage(1); }}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={handleResetFilters}
              title="Đặt lại toàn bộ bộ lọc"
            >
              <FaTimes /> Đặt lại
            </button>
          )}
        </div>
      </div>

      {/* 4. Data Table Container */}
      <div className="wp-table-container">
        {isLoading ? (
          <div className="wp-loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách kiểm duyệt dữ liệu...</p>
          </div>
        ) : reportsList.length === 0 ? (
          <div className="wp-empty-state">
            <div className="empty-icon-shield">
              <FaShieldAlt />
            </div>
            <h4>Không tìm thấy báo cáo tố cáo nào</h4>
            <p>
              {hasActiveFilters
                ? "Không có dữ liệu thỏa mãn bộ lọc hiện tại. Hãy thử thay đổi tiêu chí tìm kiếm."
                : "Không có bình luận nào bị cộng đồng báo cáo vi phạm. Hệ thống thảo luận rất văn minh!"}
            </p>
            {hasActiveFilters && (
              <button type="button" className="btn-clear-empty" onClick={handleResetFilters}>
                Xóa bộ lọc tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <div className="wp-table-responsive">
            <table className="wp-reports-table">
              <thead>
                <tr>
                  <th style={{ width: "65px" }}>ID</th>
                  <th style={{ minWidth: "190px" }}>Người tố cáo</th>
                  <th style={{ minWidth: "190px" }}>Người bị tố cáo</th>
                  <th style={{ minWidth: "260px" }}>Nội dung bị tố cáo</th>
                  <th style={{ minWidth: "170px" }}>Lý do vi phạm</th>
                  <th style={{ minWidth: "140px" }}>Thời gian</th>
                  <th style={{ minWidth: "130px" }}>Trạng thái</th>
                  <th style={{ minWidth: "180px", textAlign: "right" }}>Thao tác kiểm duyệt</th>
                </tr>
              </thead>
              <tbody>
                {reportsList.map((r) => {
                  const isPending = r.status === "pending";
                  const reasonInfo = REASON_CONFIG[r.reason] || {
                    label: r.reason,
                    color: "slate",
                    icon: FaFlag,
                  };
                  const ReasonIcon = reasonInfo.icon;

                  return (
                    <tr key={r.id} className={isPending ? "row-pending" : ""}>
                      {/* ID */}
                      <td>
                        <span className="report-id-badge">#{r.id}</span>
                      </td>

                      {/* Người tố cáo */}
                      <td>
                        <div className="user-profile-cell">
                          <UserAvatar user={r.reporter} />
                          <div className="user-details">
                            <span className="user-display-name">
                              {r.reporter?.name || "Người dùng ẩn danh"}
                            </span>
                            <span className="user-subtext">
                              {r.reporter?.email || "ID: " + (r.reporter?.id || "N/A")}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Người bị tố cáo */}
                      <td>
                        <div className="user-profile-cell reported-target">
                          <UserAvatar user={r.reported_user} isReported={true} />
                          <div className="user-details">
                            <div className="name-with-tag">
                              <span className="user-display-name text-danger">
                                {r.reported_user?.name || "Người dùng"}
                              </span>
                              {r.reported_user?.status === "banned" && (
                                <span className="tag-banned">Khóa</span>
                              )}
                            </div>
                            <span className="user-subtext">
                              {r.reported_user?.email || "ID: " + (r.reported_user?.id || "N/A")}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Bình luận bị tố cáo */}
                      <td>
                        <div className="comment-preview-box">
                          <div className="comment-quote-wrapper">
                            <FaQuoteLeft className="quote-icon" />
                            <p className="comment-quote-text" title={r.comment_content_backup || r.comment?.content}>
                              {r.comment_content_backup || r.comment?.content || "Không có nội dung bình luận backup"}
                            </p>
                          </div>

                          <div className="source-context-tag">
                            {r.story ? (
                              <span className="context-chip story" title={r.story.title}>
                                <FaBookOpen className="chip-icon" />
                                <span className="chip-label">Truyện:</span>
                                <span className="chip-title">{r.story.title}</span>
                              </span>
                            ) : r.post ? (
                              <span className="context-chip post" title={r.post.title}>
                                <FaNewspaper className="chip-icon" />
                                <span className="chip-label">Bài viết:</span>
                                <span className="chip-title">{r.post.title}</span>
                              </span>
                            ) : (
                              <span className="context-chip generic">
                                <span className="chip-label">Thảo luận chung</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Lý do vi phạm */}
                      <td>
                        <div className="reason-container">
                          <span className={`reason-pill ${reasonInfo.color}`}>
                            <ReasonIcon className="reason-icon" />
                            <span>{reasonInfo.label}</span>
                          </span>
                          {r.details && (
                            <span className="reporter-notes" title={r.details}>
                              "{r.details}"
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Thời gian */}
                      <td>
                        <div className="time-display-cell">
                          <span className="date-text">{formatDateTime(r.created_at)}</span>
                          <span className="time-subtext">
                            {r.created_at ? new Date(r.created_at).toLocaleDateString("vi-VN") : ""}
                          </span>
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td>
                        <span className={`status-pill ${r.status}`}>
                          {r.status === "pending" && (
                            <>
                              <span className="status-dot-pulse"></span>
                              <span>Chờ xử lý</span>
                            </>
                          )}
                          {r.status === "resolved" && (
                            <>
                              <FaCheckCircle className="status-icon" />
                              <span>Đã duyệt vi phạm</span>
                            </>
                          )}
                          {r.status === "dismissed" && (
                            <>
                              <FaTimesCircle className="status-icon" />
                              <span>Đã bác bỏ</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td style={{ textAlign: "right" }}>
                        <div className="action-buttons-group">
                          <button
                            type="button"
                            className="btn-action-item view"
                            onClick={() => handleOpenModal(r)}
                            title="Xem chi tiết hồ sơ & Xử lý"
                          >
                            <FaEye />
                            <span>Xem</span>
                          </button>

                          {isPending && (
                            <>
                              <button
                                type="button"
                                className="btn-action-item delete-cmt"
                                onClick={() => handleResolve(r, true)}
                                title="Duyệt vi phạm & Xóa bình luận này"
                              >
                                <FaCommentSlash />
                                <span>Xóa cmt</span>
                              </button>

                              <button
                                type="button"
                                className="btn-action-item dismiss"
                                onClick={() => handleDismiss(r)}
                                title="Bác bỏ khiếu nại (Không vi phạm)"
                              >
                                <FaTimes />
                                <span>Bác bỏ</span>
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            className="btn-action-item remove"
                            onClick={() => handleDeleteRecord(r.id)}
                            title="Xóa vĩnh viễn bản ghi hồ sơ này"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Phân trang Hiện đại */}
        {pagination.total > 0 && (
          <div className="wp-pagination-bar">
            <span className="pagination-text">
              Trang <strong>{pagination.current_page}</strong> trên <strong>{pagination.last_page}</strong> ({pagination.total} hồ sơ)
            </span>
            <div className="pagination-actions">
              <button
                type="button"
                className="btn-page-nav"
                disabled={pagination.current_page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                &lsaquo; Trang trước
              </button>

              <div className="page-number-active">
                {pagination.current_page}
              </div>

              <button
                type="button"
                className="btn-page-nav"
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Trang sau &rsaquo;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Modal Chi tiết & Trung tâm Kỷ luật */}
      {isModalOpen && selectedReport && (
        <div className="wp-report-modal-backdrop" onClick={handleCloseModal}>
          <div
            className="wp-report-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-top-bar">
              <div className="modal-title-area">
                <div className="modal-shield-badge">
                  <FaShieldAlt />
                </div>
                <div>
                  <div className="modal-heading-row">
                    <h3 className="modal-title">Hồ sơ Kiểm duyệt #{selectedReport.id}</h3>
                    <span className={`status-pill ${selectedReport.status}`}>
                      {selectedReport.status === "pending" && "Chờ xử lý"}
                      {selectedReport.status === "resolved" && "Đã duyệt vi phạm"}
                      {selectedReport.status === "dismissed" && "Đã bác bỏ"}
                    </span>
                  </div>
                  <span className="modal-subtitle">
                    Ghi nhận lúc: {formatDateTime(selectedReport.created_at)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn-modal-close"
                onClick={handleCloseModal}
                title="Đóng cửa sổ"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-scroll-body">
              {/* Đối tượng tham gia (Reporter vs Reported) */}
              <div className="modal-section-card">
                <div className="section-header-title">
                  <FaUser className="header-icon" />
                  <span>Đối tượng liên quan</span>
                </div>
                <div className="users-compare-grid">
                  {/* Cột 1: Người tố cáo */}
                  <div className="user-profile-box reporter">
                    <div className="box-badge-label reporter">Người gửi tố cáo</div>
                    <div className="profile-content">
                      <UserAvatar user={selectedReport.reporter} />
                      <div className="profile-texts">
                        <span className="profile-name">
                          {selectedReport.reporter?.name || "Người dùng ẩn danh"}
                        </span>
                        <span className="profile-email">
                          {selectedReport.reporter?.email || "Không có email"}
                        </span>
                        <div className="profile-extra-tags">
                          <span className="role-chip">
                            Vai trò: {selectedReport.reporter?.role || "Thành viên"}
                          </span>
                          <span className="id-chip">ID: {selectedReport.reporter?.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cột 2: Người bị tố cáo */}
                  <div className="user-profile-box reported">
                    <div className="box-badge-label reported">Người bị tố cáo (Mục tiêu)</div>
                    <div className="profile-content">
                      <UserAvatar user={selectedReport.reported_user} isReported={true} />
                      <div className="profile-texts">
                        <span className="profile-name text-danger">
                          {selectedReport.reported_user?.name || "Người dùng"}
                        </span>
                        <span className="profile-email">
                          {selectedReport.reported_user?.email || "Không có email"}
                        </span>
                        <div className="profile-extra-tags">
                          <span className="role-chip danger">
                            {selectedReport.reported_user?.role || "Thành viên"}
                          </span>
                          <span className="id-chip">ID: {selectedReport.reported_user?.id}</span>
                          {selectedReport.reported_user?.status === "banned" && (
                            <span className="banned-chip">Tài khoản bị khóa</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bằng chứng vi phạm (Comment Snapshot & Source) */}
              <div className="modal-section-card">
                <div className="section-header-title">
                  <FaCommentSlash className="header-icon" />
                  <span>Bằng chứng bình luận (Snapshot)</span>
                </div>

                <div className="reported-comment-highlight">
                  <div className="comment-quote-box">
                    <FaQuoteLeft className="large-quote-icon" />
                    <p className="full-comment-text">
                      {selectedReport.comment_content_backup || selectedReport.comment?.content || "Không có nội dung bình luận backup"}
                    </p>
                  </div>

                  <div className="comment-meta-bar">
                    <div className="meta-left">
                      {selectedReport.story && (
                        <div className="meta-source-chip story">
                          <FaBookOpen />
                          <span>Thuộc truyện: <strong>{selectedReport.story.title}</strong></span>
                        </div>
                      )}
                      {selectedReport.post && (
                        <div className="meta-source-chip post">
                          <FaNewspaper />
                          <span>Thuộc bài viết: <strong>{selectedReport.post.title}</strong></span>
                        </div>
                      )}
                    </div>
                    {selectedReport.comment?.created_at && (
                      <div className="meta-right">
                        <span>Đăng lúc: {formatDateTime(selectedReport.comment.created_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lý do & Lời khai từ người tố cáo */}
              <div className="modal-section-card">
                <div className="section-header-title">
                  <FaFlag className="header-icon" />
                  <span>Lý do & Mô tả khiếu nại</span>
                </div>
                <div className="reason-report-details">
                  <div className="reason-row">
                    <span className="reason-label-text">Phân loại vi phạm:</span>
                    <span className={`reason-pill large ${REASON_CONFIG[selectedReport.reason]?.color || "slate"}`}>
                      {REASON_CONFIG[selectedReport.reason]?.label || selectedReport.reason}
                    </span>
                  </div>

                  <div className="details-row">
                    <span className="reason-label-text">Mô tả từ người tố cáo:</span>
                    <div className="details-content-box">
                      {selectedReport.details ? (
                        <p>{selectedReport.details}</p>
                      ) : (
                        <p className="text-muted-italic">Người tố cáo không cung cấp mô tả chi tiết.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chế tài Kỷ luật & Xử phạt (Chỉ hiển thị khi Chờ xử lý) */}
              {selectedReport.status === "pending" && (
                <div className="modal-section-card punish-section">
                  <div className="punish-box-header">
                    <div className="gavel-icon-bubble">
                      <FaGavel />
                    </div>
                    <div>
                      <h4 className="punish-title">Biện pháp chế tài & Xử phạt tài khoản</h4>
                      <p className="punish-subtitle">
                        Tạm đình chỉ quyền bình luận & đánh giá toàn hệ thống của người dùng vi phạm
                      </p>
                    </div>
                  </div>

                  <div className="punish-duration-picker">
                    <span className="picker-label">Thời hạn đình chỉ bình luận:</span>
                    <div className="duration-options-row">
                      {[3, 7, 14, 30].map((days) => (
                        <button
                          key={days}
                          type="button"
                          className={`duration-btn ${punishDays === days ? "selected" : ""}`}
                          onClick={() => setPunishDays(days)}
                        >
                          <span className="days-num">{days}</span>
                          <span className="days-text">ngày</span>
                          {days === 7 && <span className="recommended-badge">Khuyên dùng</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="moderation-controls">
                    <label className="checkbox-toggle-label">
                      <input
                        type="checkbox"
                        checked={deleteCommentChecked}
                        onChange={(e) => setDeleteCommentChecked(e.target.checked)}
                      />
                      <span className="toggle-switch-visual"></span>
                      <span className="toggle-text">
                        <strong>Tự động xóa bình luận này</strong> khỏi truyện/bài viết khi thực thi quyết định
                      </span>
                    </label>

                    <div className="admin-note-wrapper">
                      <label className="note-label">
                        Ghi chú nội bộ của Quản trị viên (lưu vào lịch sử hồ sơ):
                      </label>
                      <textarea
                        className="admin-note-textarea"
                        rows={2}
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Nhập lý do hoặc căn cứ xử lý kiểm duyệt..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Thông tin hồ sơ đã giải quyết trước đó */}
              {selectedReport.status !== "pending" && (
                <div className="modal-section-card resolved-history">
                  <div className="section-header-title">
                    <FaCheckCircle className="header-icon text-success" />
                    <span>Lịch sử xử lý kiểm duyệt</span>
                  </div>
                  <div className="history-details-list">
                    <div className="history-item">
                      <span className="hist-label">Trạng thái cuối:</span>
                      <span className="hist-val">
                        <strong>{selectedReport.status === "resolved" ? "Đã xác nhận vi phạm" : "Đã bác bỏ tố cáo"}</strong>
                      </span>
                    </div>
                    {selectedReport.action_taken && (
                      <div className="history-item">
                        <span className="hist-label">Hành động áp dụng:</span>
                        <span className="hist-val tag-action">{selectedReport.action_taken}</span>
                      </div>
                    )}
                    {selectedReport.admin_note && (
                      <div className="history-item">
                        <span className="hist-label">Ghi chú quản trị:</span>
                        <span className="hist-val">{selectedReport.admin_note}</span>
                      </div>
                    )}
                    {selectedReport.resolved_at && (
                      <div className="history-item">
                        <span className="hist-label">Thời gian xử lý:</span>
                        <span className="hist-val">{formatDateTime(selectedReport.resolved_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="modal-bottom-bar">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={handleCloseModal}
              >
                Đóng
              </button>

              {selectedReport.status === "pending" ? (
                <div className="modal-right-actions">
                  <button
                    type="button"
                    className="btn-modal-dismiss"
                    onClick={() => handleDismiss(selectedReport)}
                    disabled={dismissMutation.isPending}
                    title="Bác bỏ khiếu nại (Nội dung không vi phạm)"
                  >
                    <FaTimes />
                    <span>Bác bỏ tố cáo</span>
                  </button>

                  <button
                    type="button"
                    className="btn-modal-resolve"
                    onClick={() => handleResolve(selectedReport, deleteCommentChecked)}
                    disabled={resolveMutation.isPending}
                    title="Duyệt vi phạm và xóa bình luận"
                  >
                    <FaCheck />
                    <span>{deleteCommentChecked ? "Duyệt & Xóa cmt" : "Xác nhận duyệt"}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-modal-punish"
                    onClick={() => handlePunish(selectedReport)}
                    disabled={punishMutation.isPending}
                    title={`Phạt cấm bình luận & đánh giá trong ${punishDays} ngày`}
                  >
                    <FaGavel />
                    <span>Thi hành phạt ({punishDays} ngày)</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-modal-delete-record"
                  onClick={() => {
                    handleDeleteRecord(selectedReport.id);
                    handleCloseModal();
                  }}
                >
                  <FaTrash />
                  <span>Xóa hồ sơ lưu trữ này</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManager;
