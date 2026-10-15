import React, { useState, useEffect } from "react";
import {
  FaBullhorn,
  FaCheckCircle,
  FaTimesCircle,
  FaSave,
  FaEye,
  FaCode,
  FaBell,
  FaTimes,
  FaInfoCircle,
  FaHistory,
  FaMagic,
  FaExternalLinkAlt,
  FaBold,
  FaItalic,
  FaLink
} from "react-icons/fa";
import {
  useGetAdminNotificationDetail,
  useUpdateAdminNotification
} from "api/homePage/queries";
import { toast } from "react-toastify";
import { getAdminInfo } from "utils/adminAuth";
import "./style.scss";

const TEMPLATES = [
  {
    name: "🎉 Chào mừng hội viên mới",
    title: "Chào Mừng Bạn Đến Với Audio Story",
    content:
      "<p>Cảm ơn bạn đã đồng hành cùng <b>Audio Story</b>! Hãy khám phá hàng ngàn bộ truyện audio hấp dẫn, tính năng đọc truyện thông minh cùng chất lượng âm thanh sống động.</p><p>Chúc bạn có những giây phút thư giãn tuyệt vời!</p>"
  },
  {
    name: "💎 Giới thiệu gói Hội Viên VIP",
    title: "Nâng Cấp Gói VIP - Trải Nghiệm Không Giới Hạn",
    content:
      "<p>Trở thành <b>Thành viên VIP</b> ngay hôm nay để mở khóa toàn bộ các chương truyện độc quyền, nghe âm thanh chất lượng cao và hoàn toàn không bị quảng cáo làm phiền!</p><p><a href=\"/membership\" style=\"color:#60a5fa;text-decoration:underline;font-weight:600;\">👉 Tìm hiểu các gói hội viên ngay</a></p>"
  },
  {
    name: "🛠️ Thông báo bảo trì & Nâng cấp",
    title: "Thông Báo Nâng Cấp Hệ Thống Audio Story",
    content:
      "<p>Hệ thống sẽ tiến hành bảo trì định kỳ từ <b>02:00 đến 04:00 sáng</b> nhằm tối ưu hóa tốc độ tải truyện và âm thanh. Các dịch vụ nghe truyện có thể bị gián đoạn ngắn trong khoảng thời gian này.</p><p>Rất mong quý thính giả thông cảm vì sự bất tiện này!</p>"
  }
];

const NotificationManager = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [notifId, setNotifId] = useState(1);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [activeTab, setActiveTab] = useState("editor"); // 'editor' | 'preview'
  const adminInfo = getAdminInfo();

  // Fetch dữ liệu thông báo cho admin (kể cả khi is_active = false)
  const {
    data: resDetail,
    isLoading,
    isError,
    refetch
  } = useGetAdminNotificationDetail();

  const updateMutation = useUpdateAdminNotification();

  // Populate data
  useEffect(() => {
    let noti = null;
    if (resDetail?.success && resDetail?.data) {
      noti = resDetail.data;
    } else if (resDetail?.data?.success && resDetail?.data?.data) {
      noti = resDetail.data.data;
    } else if (resDetail?.data) {
      noti = resDetail.data;
    }

    if (noti) {
      setNotifId(noti.id || 1);
      setTitle(noti.title || "");
      setContent(noti.content || "");
      setIsActive(Boolean(noti.is_active));
      setUpdatedAt(noti.updated_at || null);
    }
  }, [resDetail]);

  if (adminInfo?.role === "staff") {
    return (
      <div className="admin-access-denied">
        <div className="denied-box">
          <FaTimesCircle className="denied-icon" />
          <h2>🚫 Truy cập bị từ chối</h2>
          <p>Chỉ Quản trị viên (Admin) mới có quyền quản lý thông báo hệ thống.</p>
        </div>
      </div>
    );
  }

  // Quick HTML tag insertion into textarea
  const insertTag = (openTag, closeTag = "") => {
    const textarea = document.getElementById("broadcast-content-area");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = `${openTag}${selected}${closeTag}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + openTag.length,
        start + openTag.length + selected.length
      );
    }, 50);
  };

  const handleApplyTemplate = (tpl) => {
    setTitle(tpl.title);
    setContent(tpl.content);
    toast.info(`Đã áp dụng mẫu "${tpl.name}"!`);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();

    if (!title.trim()) {
      toast.warn("Vui lòng nhập tiêu đề thông báo!");
      return;
    }
    if (!content.trim()) {
      toast.warn("Vui lòng nhập nội dung thông báo!");
      return;
    }

    updateMutation.mutate(
      {
        id: notifId,
        data: {
          title: title.trim(),
          content: content.trim(),
          is_active: isActive ? 1 : 0
        }
      },
      {
        onSuccess: (res) => {
          if (res?.success) {
            toast.success("Đã cập nhật thông báo hệ thống thành công!");
            refetch();
          } else {
            toast.error(res?.message || "Cập nhật không thành công!");
          }
        },
        onError: (err) => {
          console.error("Lỗi cập nhật thông báo:", err);
          toast.error("Lỗi máy chủ khi cập nhật thông báo!");
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="wp-noti-wrapper">
        <div className="wp-noti-loading">
          <div className="wp-spinner"></div>
          <span>Đang tải dữ liệu thông báo hệ thống...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="wp-noti-wrapper">
        <div className="wp-noti-error">
          <FaTimesCircle className="error-icon" />
          <div>
            <strong>Lỗi kết nối máy chủ!</strong> Không thể tải thông báo hệ thống.
            <button className="btn-retry" onClick={() => refetch()}>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wp-noti-wrapper">
      {/* WordPress Page Header */}
      <div className="wp-header-bar">
        <div className="wp-header-title">
          <div className="title-row">
            <FaBullhorn className="header-icon" />
            <h1>Thông Báo Hệ Thống</h1>
            <span
              className={`status-pill ${
                isActive ? "status-active" : "status-inactive"
              }`}
            >
              <span className="dot"></span>
              {isActive ? "Đang phát sóng" : "Đang tắt"}
            </span>
          </div>
          <p className="wp-subtitle">
            Cấu hình hộp thoại thông báo toàn cục xuất hiện cho người dùng khi truy cập website Audio Story.
          </p>
        </div>

        <div className="wp-header-actions">
          <button
            type="button"
            className="btn-wp-preview"
            onClick={() => setActiveTab(activeTab === "preview" ? "editor" : "preview")}
          >
            <FaEye /> {activeTab === "preview" ? "Quay lại Soạn thảo" : "Xem trước Popup"}
          </button>
          <button
            type="button"
            className="btn-wp-primary"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            <FaSave />{" "}
            {updateMutation.isPending ? "Đang lưu..." : "Lưu & Cập nhật"}
          </button>
        </div>
      </div>

      {/* Main 2-Column WordPress Post Layout */}
      <div className="wp-post-body">
        {/* Left / Main Column */}
        <div className="wp-main-column">
          {/* Post Title Block */}
          <div className="wp-metabox title-metabox">
            <label className="metabox-label">
              Tiêu đề thông báo <span className="required">*</span>
            </label>
            <input
              type="text"
              className="wp-title-input"
              placeholder="Nhập tiêu đề thông báo hiển thị cho người dùng..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Editor & Preview Box */}
          <div className="wp-metabox editor-metabox">
            <div className="editor-tab-header">
              <div className="tabs-left">
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "editor" ? "active" : ""}`}
                  onClick={() => setActiveTab("editor")}
                >
                  <FaCode /> Soạn thảo (HTML / Văn bản)
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "preview" ? "active" : ""}`}
                  onClick={() => setActiveTab("preview")}
                >
                  <FaEye /> Xem trước trực quan
                </button>
              </div>

              {activeTab === "editor" && (
                <div className="editor-quick-toolbar">
                  <button
                    type="button"
                    title="In đậm (Bold)"
                    onClick={() => insertTag("<b>", "</b>")}
                  >
                    <FaBold />
                  </button>
                  <button
                    type="button"
                    title="In nghiêng (Italic)"
                    onClick={() => insertTag("<i>", "</i>")}
                  >
                    <FaItalic />
                  </button>
                  <button
                    type="button"
                    title="Chèn liên kết (Link)"
                    onClick={() =>
                      insertTag('<a href="#" target="_blank">', "</a>")
                    }
                  >
                    <FaLink />
                  </button>
                  <button
                    type="button"
                    title="Đoạn văn (Paragraph)"
                    onClick={() => insertTag("<p>", "</p>")}
                  >
                    &lt;p&gt;
                  </button>
                  <button
                    type="button"
                    title="Xuống dòng (Break line)"
                    onClick={() => insertTag("<br/>")}
                  >
                    &lt;br&gt;
                  </button>
                </div>
              )}
            </div>

            <div className="editor-content-area">
              {activeTab === "editor" ? (
                <div className="textarea-container">
                  <textarea
                    id="broadcast-content-area"
                    className="wp-textarea"
                    rows="10"
                    placeholder="Nhập nội dung thông báo. Bạn có thể sử dụng các thẻ HTML như <b>, <i>, <p>, <a>..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                  <div className="textarea-footer">
                    <span>Độ dài: {content.length} ký tự</span>
                    <span>Hỗ trợ HTML tags</span>
                  </div>
                </div>
              ) : (
                /* Live Client Preview Simulation */
                <div className="live-preview-viewport">
                  <div className="preview-label">
                    <span>Mô phỏng popup phía người dùng:</span>
                  </div>

                  <div className="preview-overlay-mock">
                    <div className="preview-modal-card">
                      <div className="modal-header">
                        <div className="title-group">
                          <div className="icon-circle">
                            <FaBell className="bell-icon" />
                          </div>
                          <h3>{title || "Tiêu đề thông báo hệ thống"}</h3>
                        </div>
                        <button type="button" className="close-x" disabled>
                          <FaTimes />
                        </button>
                      </div>

                      <div className="modal-body">
                        <div
                          className="html-content"
                          dangerouslySetInnerHTML={{
                            __html:
                              content ||
                              "<p style='color:#94a3b8;font-style:italic;'>Chưa có nội dung thông báo...</p>"
                          }}
                        />
                      </div>

                      <div className="modal-footer">
                        <button type="button" className="btn-confirm" disabled>
                          Đã hiểu
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Guidelines Box */}
          <div className="wp-metabox guidelines-metabox">
            <div className="metabox-title">
              <FaInfoCircle className="info-icon" />
              <span>Quy tắc hiển thị thông báo hệ thống</span>
            </div>
            <ul className="guidelines-list">
              <li>
                <strong>Hiển thị toàn cầu:</strong> Khi bật trạng thái phát sóng, thông báo sẽ tự động xuất hiện dưới dạng hộp thoại trung tâm (popup) khi người dùng truy cập trang chủ hoặc bất kỳ trang truyện nào.
              </li>
              <li>
                <strong>Tránh làm phiền người dùng:</strong> Khi người dùng nhấn nút <em>&quot;Đã hiểu&quot;</em> hoặc dấu đóng, hệ thống sẽ ghi nhớ trong trình duyệt và <strong>không hiện lại trong vòng 6 giờ</strong>.
              </li>
              <li>
                <strong>Chèn liên kết điều hướng:</strong> Bạn có thể chèn liên kết điều hướng người đọc đến sự kiện hoặc gói thành viên bằng cú pháp HTML: <code>&lt;a href=&quot;/membership&quot;&gt;Xem chi tiết&lt;/a&gt;</code>.
              </li>
            </ul>
          </div>
        </div>

        {/* Right / Sidebar Column */}
        <div className="wp-sidebar-column">
          {/* Publish & Status Metabox */}
          <div className="wp-metabox publish-metabox">
            <div className="metabox-header">
              <h3>Trạng thái phát sóng</h3>
            </div>
            <div className="metabox-body">
              {/* Toggle Switch */}
              <div className="toggle-row">
                <div className="toggle-info">
                  <strong>Phát sóng trực tiếp</strong>
                  <p>Bật hoặc tắt hiển thị thông báo trên giao diện người dùng</p>
                </div>
                <label className="wp-toggle-switch">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="status-detail-list">
                <div className="status-item">
                  <span className="item-label">Tình trạng:</span>
                  <span
                    className={`item-value ${
                      isActive ? "text-green" : "text-gray"
                    }`}
                  >
                    {isActive ? (
                      <>
                        <FaCheckCircle /> Đang bật (Công khai)
                      </>
                    ) : (
                      <>
                        <FaTimesCircle /> Đang tắt (Tạm ngưng)
                      </>
                    )}
                  </span>
                </div>
                <div className="status-item">
                  <span className="item-label">Phạm vi:</span>
                  <span className="item-value">Toàn bộ website</span>
                </div>
                <div className="status-item">
                  <span className="item-label">Tần suất popup:</span>
                  <span className="item-value">6 giờ / lần hiển thị</span>
                </div>
                {updatedAt && (
                  <div className="status-item">
                    <span className="item-label">Lần sửa cuối:</span>
                    <span className="item-value text-muted">
                      <FaHistory /> {new Date(updatedAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="metabox-footer">
              <button
                type="button"
                className="btn-wp-save-primary"
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                <FaSave />{" "}
                {updateMutation.isPending ? "Đang lưu..." : "Cập nhật phát sóng"}
              </button>
            </div>
          </div>

          {/* Quick Templates Metabox */}
          <div className="wp-metabox templates-metabox">
            <div className="metabox-header">
              <h3>
                <FaMagic className="magic-icon" /> Mẫu thông báo mẫu
              </h3>
            </div>
            <div className="metabox-body">
              <p className="templates-intro">
                Chọn mẫu nội dung nhanh để áp dụng vào form:
              </p>
              <div className="templates-list">
                {TEMPLATES.map((tpl, idx) => (
                  <div
                    key={idx}
                    className="template-card"
                    onClick={() => handleApplyTemplate(tpl)}
                  >
                    <div className="template-title">{tpl.name}</div>
                    <div className="template-desc">{tpl.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationManager;