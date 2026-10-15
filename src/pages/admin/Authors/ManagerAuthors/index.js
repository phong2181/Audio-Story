import React, { memo, useEffect, useState, useMemo } from "react";
import {
  FaUserPlus,
  FaTrash,
  FaSearch,
  FaUserShield,
  FaUserEdit,
  FaTimes,
  FaCheck,
  FaUsers,
  FaKey,
  FaEnvelope,
  FaShieldAlt,
  FaCalendarAlt
} from "react-icons/fa";
import {
  useGetUsersAD,
  useAddUserAD,
  useUpdateUserAD,
  useDeleteUserAD
} from "api/homePage/queries";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { STORAGE_URL } from "config/config";
import { getAdminInfo } from "utils/adminAuth";
import "./style.scss";

const UserManagement = () => {
  useEffect(() => {
    document.title = "Thành viên quản trị | WordPress Admin";
  }, []);

  const { data: users = [], isLoading } = useGetUsersAD();
  const addUserMutation = useAddUserAD();
  const updateUserMutation = useUpdateUserAD();
  const deleteUserMutation = useDeleteUserAD();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // 'all', 'admin', 'staff'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const adminInfo = getAdminInfo();

  // State form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff"
  });

  const userList = useMemo(() => {
    return Array.isArray(users) ? users : users?.data || [];
  }, [users]);

  // Lọc thành viên nội bộ (Admin & Staff)
  const internalUsers = useMemo(() => {
    return userList.filter((u) => u.role === "admin" || u.role === "staff");
  }, [userList]);

  const counts = useMemo(() => {
    return {
      all: internalUsers.length,
      admin: internalUsers.filter((u) => u.role === "admin").length,
      staff: internalUsers.filter((u) => u.role === "staff").length
    };
  }, [internalUsers]);

  const filteredUsers = useMemo(() => {
    return internalUsers.filter((u) => {
      const matchesSearch =
        (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [internalUsers, searchTerm, roleFilter]);

  if (adminInfo?.role === "staff") {
    return (
      <div className="wp-users-wrap">
        <div className="wp-permission-denied">
          <h2>🚫 Truy cập bị từ chối</h2>
          <p>Bạn không có quyền quản lý tài khoản quản trị hệ thống.</p>
        </div>
      </div>
    );
  }

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role
      });
    } else {
      setEditUser(null);
      setFormData({ name: "", email: "", password: "", role: "staff" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", email: "", password: "", role: "staff" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warn("Vui lòng nhập họ và tên!");
      return;
    }
    if (!formData.email.trim()) {
      toast.warn("Vui lòng nhập địa chỉ email!");
      return;
    }
    if (!editUser && (!formData.password || formData.password.length < 6)) {
      toast.warn("Mật khẩu tài khoản mới phải có ít nhất 6 ký tự!");
      return;
    }

    if (editUser) {
      updateUserMutation.mutate(
        { id: editUser.id, data: formData },
        {
          onSuccess: () => {
            toast.success("Cập nhật thông tin thành viên thành công!");
            closeModal();
          },
          onError: (err) => {
            toast.error(err.response?.data?.message || "Có lỗi xảy ra khi cập nhật thành viên");
          }
        }
      );
    } else {
      addUserMutation.mutate(formData, {
        onSuccess: () => {
          toast.success("Thêm thành viên mới thành công!");
          closeModal();
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Có lỗi xảy ra khi thêm thành viên");
        }
      });
    }
  };

  const handleDelete = (user) => {
    if (user.id === adminInfo?.id) {
      toast.error("Bạn không thể tự xóa tài khoản của chính mình!");
      return;
    }
    if (user.role === "admin" && counts.admin <= 1) {
      toast.error("Không thể xóa tài khoản Quản trị viên duy nhất của hệ thống!");
      return;
    }

    Swal.fire({
      title: `Xác nhận xóa tài khoản?`,
      html: `Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản quản trị <b>${user.name}</b> (${user.email})?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xác nhận xóa",
      cancelButtonText: "Hủy bỏ"
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUserMutation.mutate(user.id, {
          onSuccess: (res) => {
            toast.success(res?.message || "Đã xóa thành viên thành công!");
          },
          onError: (err) => {
            toast.error(err.response?.data?.message || "Không thể xóa thành viên!");
          }
        });
      }
    });
  };

  return (
    <div className="wp-users-wrap">
      {/* WordPress Page Header */}
      <div className="wp-header-bar">
        <div className="header-left">
          <FaUsers className="header-icon" />
          <div>
            <div className="title-row">
              <h1>Thành Viên Quản Trị</h1>
              <button
                type="button"
                className="page-title-action"
                onClick={() => handleOpenModal()}
              >
                <FaUserPlus /> Thêm thành viên mới
              </button>
            </div>
            <p className="subtitle">
              Phân quyền và quản lý tài khoản Quản trị viên (Admin), Biên tập viên & Nhân viên (Staff).
            </p>
          </div>
        </div>
      </div>

      {/* WordPress Subsubsub Navigation */}
      <div className="wp-views-nav">
        <button
          type="button"
          className={`view-link ${roleFilter === "all" ? "current" : ""}`}
          onClick={() => setRoleFilter("all")}
        >
          Tất cả <span className="count">({counts.all})</span>
        </button>
        <span className="separator">|</span>
        <button
          type="button"
          className={`view-link ${roleFilter === "admin" ? "current" : ""}`}
          onClick={() => setRoleFilter("admin")}
        >
          Quản trị viên <span className="count">({counts.admin})</span>
        </button>
        <span className="separator">|</span>
        <button
          type="button"
          className={`view-link ${roleFilter === "staff" ? "current" : ""}`}
          onClick={() => setRoleFilter("staff")}
        >
          Biên tập viên / Nhân viên <span className="count">({counts.staff})</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="wp-tablenav top">
        <div className="tablenav-left">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="wp-select-filter"
          >
            <option value="all">Thay đổi vai trò thành...</option>
            <option value="admin">Quản trị viên (Admin)</option>
            <option value="staff">Biên tập viên (Staff)</option>
          </select>
        </div>

        <div className="tablenav-right">
          <div className="wp-search-box">
            <FaSearch className="search-icon" />
            <input
              type="search"
              placeholder="Tìm theo tên hoặc email..."
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
              <th scope="col" className="col-username">Tên hiển thị & Email</th>
              <th scope="col" className="col-role">Vai trò</th>
              <th scope="col" className="col-created">Ngày tạo</th>
              <th scope="col" className="col-actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  <div className="wp-spinner"></div>
                  <span>Đang tải danh sách thành viên...</span>
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const avatarUrl = user.avatar
                  ? user.avatar.startsWith("http")
                    ? user.avatar
                    : `${STORAGE_URL}/${user.avatar}`
                  : null;

                const isCurrentAdmin = user.id === adminInfo?.id;

                return (
                  <tr key={user.id} className="user-row">
                    <td className="col-avatar">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={user.name} className="user-avatar-img" />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                      )}
                    </td>

                    <td className="col-username">
                      <div className="user-primary-info">
                        <strong>
                          {user.name}
                          {isCurrentAdmin && <span className="you-badge">(Bạn)</span>}
                        </strong>
                        <span className="user-email">{user.email}</span>
                      </div>
                      <div className="row-actions">
                        <span className="edit">
                          <button type="button" onClick={() => handleOpenModal(user)}>
                            Chỉnh sửa
                          </button>
                        </span>
                        {!isCurrentAdmin && (
                          <>
                            <span className="sep">|</span>
                            <span className="delete">
                              <button type="button" onClick={() => handleDelete(user)}>
                                Xóa
                              </button>
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="col-role">
                      <span className={`wp-role-badge ${user.role === "admin" ? "badge-admin" : "badge-staff"}`}>
                        <FaShieldAlt /> {user.role === "admin" ? "Quản trị viên" : "Biên tập viên"}
                      </span>
                    </td>

                    <td className="col-created">
                      <span className="date-text">
                        <FaCalendarAlt />{" "}
                        {user.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : "Hệ thống"}
                      </span>
                    </td>

                    <td className="col-actions">
                      <div className="action-buttons-cell">
                        <button
                          type="button"
                          className="btn-action edit-btn"
                          title="Chỉnh sửa thông tin"
                          onClick={() => handleOpenModal(user)}
                        >
                          <FaUserEdit /> Sửa
                        </button>
                        {!isCurrentAdmin && (
                          <button
                            type="button"
                            className="btn-action delete-btn"
                            title="Xóa thành viên"
                            onClick={() => handleDelete(user)}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted">
                  Không tìm thấy thành viên quản trị nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm / Chỉnh sửa thành viên */}
      {isModalOpen && (
        <div className="wp-modal-backdrop">
          <div className="wp-modal-card">
            <div className="wp-modal-header">
              <h3>
                <FaUserShield /> {editUser ? "Chỉnh sửa thành viên" : "Thêm thành viên quản trị mới"}
              </h3>
              <button type="button" className="close-btn" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="wp-modal-body">
              <div className="form-group">
                <label>
                  Họ và tên hiển thị <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Email đăng nhập <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@audiostory.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  {editUser ? "Mật khẩu mới (Bỏ trống nếu không đổi)" : "Mật khẩu đăng nhập"} {!editUser && <span className="required">*</span>}
                </label>
                <div className="input-group">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={editUser ? "Nhập nếu muốn đổi mật khẩu mới" : "Tối thiểu 6 ký tự"}
                    required={!editUser}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Vai trò phân quyền</label>
                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="staff">Biên tập viên / Nhân viên (Staff)</option>
                  <option value="admin">Quản trị viên toàn quyền (Administrator)</option>
                </select>
                <p className="description">
                  Quản trị viên có toàn quyền truy cập cấu hình hệ thống, doanh thu và quảng cáo.
                </p>
              </div>

              <div className="wp-modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn-submit-primary"
                  disabled={addUserMutation.isPending || updateUserMutation.isPending}
                >
                  <FaCheck /> {editUser ? "Lưu thay đổi" : "Tạo thành viên"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(UserManagement);