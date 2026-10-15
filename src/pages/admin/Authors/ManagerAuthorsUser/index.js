import React, { useState, useMemo, memo, useEffect } from "react";
import {
  FaUserSlash,
  FaSearch,
  FaLock,
  FaUnlock,
  FaExclamationTriangle,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCalendarAlt,
  FaShieldAlt,
  FaPaperPlane,
  FaUsers,
  FaHistory,
  FaTimes
} from "react-icons/fa";
import {
  useGetModerationUsers,
  useBanUserPermanent,
  useBanUserTemporary,
  useUnlockUser,
  useSendWarningUser,
  useDeleteModerationUser
} from "api/homePage/queries";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { STORAGE_URL } from "config/config";
import { getAdminInfo } from "utils/adminAuth";
import "./style.scss";

const ManagerAuthorsUser = () => {
  useEffect(() => {
    document.title = "Kiểm duyệt & Trạng thái người dùng | WordPress Admin";
  }, []);

  const adminInfo = getAdminInfo();
  const isAdmin = adminInfo?.role === "admin";

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch dữ liệu người dùng kiểm duyệt
  const { data: rawData = {}, isLoading, refetch } = useGetModerationUsers({
    status: statusFilter,
    search: searchTerm
  });

  const users = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    return rawData?.data || [];
  }, [rawData]);

  const metrics = useMemo(() => {
    return (
      rawData?.metrics || {
        total: users.length,
        pending: 0,
        banned_temporary: 0,
        banned_permanent: 0,
        warned: 0
      }
    );
  }, [rawData, users]);

  // Mutations
  const banPermanentMutation = useBanUserPermanent();
  const banTemporaryMutation = useBanUserTemporary();
  const unlockMutation = useUnlockUser();
  const sendWarningMutation = useSendWarningUser();
  const deleteMutation = useDeleteModerationUser();

  // Modal States
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null); // 'ban_perm' | 'ban_temp' | 'warning'

  const [banReason, setBanReason] = useState("");
  const [banDays, setBanDays] = useState(7);
  const [warningMessage, setWarningMessage] = useState("");

  if (adminInfo?.role === "staff") {
    return (
      <div className="wp-moderation-wrap">
        <div className="wp-permission-denied">
          <h2>🚫 Truy cập bị từ chối</h2>
          <p>Chỉ Quản trị viên (Admin) mới có quyền kiểm duyệt và xử lý tài khoản người dùng.</p>
        </div>
      </div>
    );
  }

  const handleOpenModal = (user, type) => {
    setSelectedUser(user);
    setModalType(type);
    setBanReason("");
    setBanDays(7);
    setWarningMessage("");
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalType(null);
  };

  // 1. Khóa vĩnh viễn
  const handleConfirmBanPermanent = (e) => {
    e.preventDefault();
    if (!banReason.trim()) {
      toast.warn("Vui lòng nhập lý do khóa vĩnh viễn!");
      return;
    }

    banPermanentMutation.mutate(
      { id: selectedUser.id, reason: banReason.trim() },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Đã khóa vĩnh viễn tài khoản!");
          closeModal();
          refetch();
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Lỗi khi khóa tài khoản!");
        }
      }
    );
  };

  // 2. Khóa tạm thời có thời hạn
  const handleConfirmBanTemporary = (e) => {
    e.preventDefault();
    if (!banReason.trim()) {
      toast.warn("Vui lòng nhập lý do khóa tạm thời!");
      return;
    }

    banTemporaryMutation.mutate(
      { id: selectedUser.id, days: Number(banDays), reason: banReason.trim() },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Đã khóa tạm thời tài khoản!");
          closeModal();
          refetch();
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Lỗi khi khóa tạm thời!");
        }
      }
    );
  };

  // 3. Mở khóa / Kích hoạt
  const handleUnlock = (user) => {
    Swal.fire({
      title: "Mở khóa tài khoản?",
      html: `Bạn có muốn gỡ bỏ lệnh cấm và kích hoạt tài khoản <b>${user.name}</b> (${user.email})?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2271b1",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Mở khóa ngay",
      cancelButtonText: "Hủy bỏ"
    }).then((result) => {
      if (result.isConfirmed) {
        unlockMutation.mutate(user.id, {
          onSuccess: (res) => {
            toast.success(res?.message || "Đã mở khóa tài khoản thành công!");
            refetch();
          },
          onError: (err) => {
            toast.error(err.response?.data?.message || "Lỗi khi mở khóa!");
          }
        });
      }
    });
  };

  // 4. Gửi cảnh báo vi phạm
  const handleConfirmSendWarning = (e) => {
    e.preventDefault();
    if (!warningMessage.trim()) {
      toast.warn("Vui lòng nhập nội dung cảnh báo vi phạm!");
      return;
    }

    sendWarningMutation.mutate(
      { id: selectedUser.id, warning_message: warningMessage.trim() },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Đã gửi cảnh báo vi phạm thành công!");
          closeModal();
          refetch();
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Lỗi khi gửi cảnh báo!");
        }
      }
    );
  };

  // 5. Xóa tài khoản
  const handleDeleteUser = (user) => {
    Swal.fire({
      title: "Xóa vĩnh viễn tài khoản?",
      html: `Hành động này sẽ xóa hoàn toàn tài khoản <b>${user.name}</b> (${user.email}) khỏi cơ sở dữ liệu và không thể hoàn tác!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Xóa vĩnh viễn",
      cancelButtonText: "Hủy bỏ"
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(user.id, {
          onSuccess: (res) => {
            toast.success(res?.message || "Đã xóa tài khoản người dùng thành công!");
            refetch();
          },
          onError: (err) => {
            toast.error(err.response?.data?.message || "Không thể xóa tài khoản!");
          }
        });
      }
    });
  };

  return (
    <div className="wp-moderation-wrap">
      {/* WordPress Page Header */}
      <div className="wp-header-bar">
        <div className="header-left">
          <FaUserSlash className="header-icon" />
          <div>
            <h1>Kiểm Duyệt & Trạng Thái Người Dùng</h1>
            <p className="subtitle">
              Quản lý tài khoản chưa kích hoạt, khóa vĩnh viễn, khóa có thời hạn, mở khóa, cảnh báo vi phạm và xóa tài khoản vi phạm.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="wp-metric-cards">
        <div className={`metric-card ${statusFilter === "all" ? "active" : ""}`} onClick={() => setStatusFilter("all")}>
          <div className="card-icon total-icon">
            <FaUsers />
          </div>
          <div className="card-info">
            <span className="card-value">{metrics.total}</span>
            <span className="card-label">Tổng người dùng</span>
          </div>
        </div>

        <div className={`metric-card ${statusFilter === "pending" ? "active" : ""}`} onClick={() => setStatusFilter("pending")}>
          <div className="card-icon pending-icon">
            <FaClock />
          </div>
          <div className="card-info">
            <span className="card-value">{metrics.pending}</span>
            <span className="card-label">Chưa kích hoạt</span>
          </div>
        </div>

        <div className={`metric-card ${statusFilter === "banned_temporary" ? "active" : ""}`} onClick={() => setStatusFilter("banned_temporary")}>
          <div className="card-icon temp-icon">
            <FaLock />
          </div>
          <div className="card-info">
            <span className="card-value">{metrics.banned_temporary}</span>
            <span className="card-label">Khóa có thời hạn</span>
          </div>
        </div>

        <div className={`metric-card ${statusFilter === "banned_permanent" ? "active" : ""}`} onClick={() => setStatusFilter("banned_permanent")}>
          <div className="card-icon perm-icon">
            <FaTimesCircle />
          </div>
          <div className="card-info">
            <span className="card-value">{metrics.banned_permanent}</span>
            <span className="card-label">Khóa vĩnh viễn</span>
          </div>
        </div>

        <div className={`metric-card ${statusFilter === "warned" ? "active" : ""}`} onClick={() => setStatusFilter("warned")}>
          <div className="card-icon warn-icon">
            <FaExclamationTriangle />
          </div>
          <div className="card-info">
            <span className="card-value">{metrics.warned}</span>
            <span className="card-label">Đã bị cảnh báo</span>
          </div>
        </div>
      </div>

      {/* Subsubsub Navigation */}
      <div className="wp-views-nav">
        <button
          type="button"
          className={`view-link ${statusFilter === "all" ? "current" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          Tất cả <span className="count">({metrics.total})</span>
        </button>
        <span className="separator">|</span>
        <button
          type="button"
          className={`view-link ${statusFilter === "pending" ? "current" : ""}`}
          onClick={() => setStatusFilter("pending")}
        >
          Chưa kích hoạt <span className="count">({metrics.pending})</span>
        </button>
        <span className="separator">|</span>
        <button
          type="button"
          className={`view-link ${statusFilter === "banned_temporary" ? "current" : ""}`}
          onClick={() => setStatusFilter("banned_temporary")}
        >
          Khóa có thời hạn <span className="count">({metrics.banned_temporary})</span>
        </button>
        <span className="separator">|</span>
        <button
          type="button"
          className={`view-link ${statusFilter === "banned_permanent" ? "current" : ""}`}
          onClick={() => setStatusFilter("banned_permanent")}
        >
          Khóa vĩnh viễn <span className="count">({metrics.banned_permanent})</span>
        </button>
        <span className="separator">|</span>
        <button
          type="button"
          className={`view-link ${statusFilter === "warned" ? "current" : ""}`}
          onClick={() => setStatusFilter("warned")}
        >
          Có cảnh báo vi phạm <span className="count">({metrics.warned})</span>
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="wp-tablenav top">
        <div className="tablenav-left">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="wp-select-filter"
          >
            <option value="all">Lọc theo trạng thái tài khoản...</option>
            <option value="pending">Chưa kích hoạt / Chờ duyệt</option>
            <option value="banned_temporary">Đang bị khóa có thời hạn</option>
            <option value="banned_permanent">Bị khóa vĩnh viễn</option>
            <option value="active">Đang hoạt động bình thường</option>
            <option value="warned">Người dùng có cảnh báo</option>
          </select>
        </div>

        <div className="tablenav-right">
          <div className="wp-search-box">
            <FaSearch className="search-icon" />
            <input
              type="search"
              placeholder="Tìm theo tên hoặc email user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* WP-List-Table */}
      <div className="wp-table-container">
        <table className="wp-list-table widefat striped users">
          <thead>
            <tr>
              <th scope="col" className="col-avatar">Ảnh</th>
              <th scope="col" className="col-user">Người dùng & Email</th>
              <th scope="col" className="col-status">Trạng thái tài khoản</th>
              <th scope="col" className="col-warnings">Cảnh báo vi phạm</th>
              <th scope="col" className="col-date">Ngày tạo</th>
              <th scope="col" className="col-actions">Tuỳ chọn xử lý</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  <div className="wp-spinner"></div>
                  <span>Đang tải danh sách người dùng...</span>
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map((user) => {
                const avatarUrl = user.avatar
                  ? user.avatar.startsWith("http")
                    ? user.avatar
                    : `${STORAGE_URL}/${user.avatar}`
                  : null;

                const isTempBanned =
                  user.status === "banned_temporary" &&
                  user.banned_until &&
                  new Date(user.banned_until) > new Date();

                const isPermBanned = user.status === "banned_permanent";
                const isPending = user.status === "pending";
                const isRestricted = isTempBanned || isPermBanned;

                return (
                  <tr key={user.id} className={`user-row ${isRestricted ? "row-restricted" : ""}`}>
                    <td className="col-avatar">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={user.name} className="user-avatar-img" />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                      )}
                    </td>

                    <td className="col-user">
                      <div className="user-primary-info">
                        <strong>{user.name}</strong>
                        <span className="user-email">{user.email}</span>
                      </div>
                      {user.ban_reason && (
                        <div className="ban-reason-hint">
                          <strong>Lý do cấm:</strong> {user.ban_reason}
                        </div>
                      )}
                    </td>

                    <td className="col-status">
                      {isPermBanned ? (
                        <span className="status-badge badge-perm">
                          <FaTimesCircle /> Khóa vĩnh viễn
                        </span>
                      ) : isTempBanned ? (
                        <span className="status-badge badge-temp">
                          <FaClock /> Tạm khóa đến {new Date(user.banned_until).toLocaleString("vi-VN")}
                        </span>
                      ) : isPending ? (
                        <span className="status-badge badge-pending">
                          <FaClock /> Chưa kích hoạt
                        </span>
                      ) : (
                        <span className="status-badge badge-active">
                          <FaCheckCircle /> Hoạt động
                        </span>
                      )}
                    </td>

                    <td className="col-warnings">
                      {user.warning_count > 0 ? (
                        <div className="warning-info">
                          <span className="warning-pill">
                            <FaExclamationTriangle /> {user.warning_count} lần
                          </span>
                          {user.warning_notice && (
                            <span className="notice-preview" title={user.warning_notice}>
                              &ldquo;{user.warning_notice}&rdquo;
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">Không có</span>
                      )}
                    </td>

                    <td className="col-date">
                      <span className="date-text">
                        <FaCalendarAlt />{" "}
                        {user.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : "Hệ thống"}
                      </span>
                    </td>

                    <td className="col-actions">
                      <div className="action-buttons-wrap">
                        {/* Nếu đang bị cấm -> Nút Mở khóa */}
                        {isRestricted || isPending ? (
                          <button
                            type="button"
                            className="btn-op btn-unlock"
                            title="Mở khóa và kích hoạt tài khoản"
                            onClick={() => handleUnlock(user)}
                          >
                            <FaUnlock /> Mở khóa
                          </button>
                        ) : null}

                        {/* Nút Khóa có thời hạn */}
                        {!isPermBanned && (
                          <button
                            type="button"
                            className="btn-op btn-temp-ban"
                            title="Khóa tài khoản có thời hạn"
                            onClick={() => handleOpenModal(user, "ban_temp")}
                          >
                            <FaClock /> Khóa có hạn
                          </button>
                        )}

                        {/* Nút Khóa vĩnh viễn */}
                        {!isPermBanned && (
                          <button
                            type="button"
                            className="btn-op btn-perm-ban"
                            title="Khóa tài khoản vĩnh viễn"
                            onClick={() => handleOpenModal(user, "ban_perm")}
                          >
                            <FaLock /> Khóa vĩnh viễn
                          </button>
                        )}

                        {/* Nút Gửi cảnh báo vi phạm */}
                        <button
                          type="button"
                          className="btn-op btn-warn"
                          title="Gửi thông báo cảnh báo vi phạm tới user"
                          onClick={() => handleOpenModal(user, "warning")}
                        >
                          <FaPaperPlane /> Cảnh báo
                        </button>

                        {/* Nút Xóa tài khoản */}
                        <button
                          type="button"
                          className="btn-op btn-delete"
                          title="Xóa vĩnh viễn tài khoản"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  Không tìm thấy người dùng nào phù hợp với bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal 1: Khóa vĩnh viễn */}
      {modalType === "ban_perm" && selectedUser && (
        <div className="wp-modal-backdrop">
          <div className="wp-modal-card">
            <div className="wp-modal-header header-danger">
              <h3>
                <FaLock /> Khóa tài khoản vĩnh viễn
              </h3>
              <button type="button" className="close-btn" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleConfirmBanPermanent} className="wp-modal-body">
              <div className="user-target-summary">
                <strong>Người dùng:</strong> {selectedUser.name} ({selectedUser.email})
              </div>

              <div className="form-group">
                <label>
                  Lý do khóa vĩnh viễn <span className="required">*</span>
                </label>
                <textarea
                  rows="4"
                  placeholder="Nhập lý do cụ thể (Spam, vi phạm bản quyền truyện, ngôn từ tiêu cực...)"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  required
                />
                <p className="description">
                  Tài khoản sẽ bị đăng xuất ngay lập tức và bị chặn đăng nhập vĩnh viễn.
                </p>
              </div>

              <div className="wp-modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn-danger-primary"
                  disabled={banPermanentMutation.isPending}
                >
                  <FaLock /> {banPermanentMutation.isPending ? "Đang xử lý..." : "Xác nhận khóa vĩnh viễn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Khóa có thời hạn */}
      {modalType === "ban_temp" && selectedUser && (
        <div className="wp-modal-backdrop">
          <div className="wp-modal-card">
            <div className="wp-modal-header header-warning">
              <h3>
                <FaClock /> Khóa tài khoản có thời hạn
              </h3>
              <button type="button" className="close-btn" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleConfirmBanTemporary} className="wp-modal-body">
              <div className="user-target-summary">
                <strong>Người dùng:</strong> {selectedUser.name} ({selectedUser.email})
              </div>

              <div className="form-group">
                <label>Thời gian khóa tạm thời</label>
                <select value={banDays} onChange={(e) => setBanDays(e.target.value)}>
                  <option value={1}>1 ngày (24 giờ)</option>
                  <option value={3}>3 ngày</option>
                  <option value={7}>7 ngày (1 tuần)</option>
                  <option value={14}>14 ngày (2 tuần)</option>
                  <option value={30}>30 ngày (1 tháng)</option>
                  <option value={90}>90 ngày (3 tháng)</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Lý do tạm khóa <span className="required">*</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="Nhập lý do tạm khóa..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  required
                />
                <p className="description">
                  Sau khi hết thời hạn, hệ thống sẽ tự động gỡ bỏ lệnh khóa khi người dùng đăng nhập lại.
                </p>
              </div>

              <div className="wp-modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn-warning-primary"
                  disabled={banTemporaryMutation.isPending}
                >
                  <FaClock /> {banTemporaryMutation.isPending ? "Đang xử lý..." : "Khóa tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Gửi cảnh báo vi phạm */}
      {modalType === "warning" && selectedUser && (
        <div className="wp-modal-backdrop">
          <div className="wp-modal-card">
            <div className="wp-modal-header header-info">
              <h3>
                <FaPaperPlane /> Gửi cảnh báo vi phạm
              </h3>
              <button type="button" className="close-btn" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleConfirmSendWarning} className="wp-modal-body">
              <div className="user-target-summary">
                <strong>Gửi tới:</strong> {selectedUser.name} ({selectedUser.email})
                <br />
                <strong>Số lần đã bị cảnh báo trước đây:</strong> {selectedUser.warning_count || 0} lần
              </div>

              <div className="form-group">
                <label>
                  Nội dung cảnh báo vi phạm <span className="required">*</span>
                </label>
                <textarea
                  rows="4"
                  placeholder="Ví dụ: Bạn đã bình luận ngôn từ khiếm nhã trong truyện... Vui lòng tuân thủ nội quy cộng đồng, nếu tái phạm tài khoản sẽ bị tạm khóa."
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  required
                />
                <p className="description">
                  Thông điệp này sẽ được lưu và thông báo trực tiếp khi người dùng truy cập.
                </p>
              </div>

              <div className="wp-modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn-info-primary"
                  disabled={sendWarningMutation.isPending}
                >
                  <FaPaperPlane /> {sendWarningMutation.isPending ? "Đang gửi..." : "Gửi cảnh báo ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ManagerAuthorsUser);