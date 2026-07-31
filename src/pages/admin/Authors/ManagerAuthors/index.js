import React, { memo, useEffect, useState } from "react";
import { FaUserPlus, FaTrash, FaSearch, FaUserShield, FaUserEdit, FaTimes, FaSave } from "react-icons/fa";
import { useGetUsersAD, useAddUserAD, useUpdateUserAD } from "api/homePage/queries"; 
// 🔥 TÍCH HỢP: Thông báo Toast hiện đại
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.scss";
import { STORAGE_URL } from "config/config";
import { getAdminInfo } from "utils/adminAuth";

const UserManagement = () => {
    useEffect(() => {
        document.title = "Quản lý tài khoản";
    }, []);

    const { data: users, isLoading } = useGetUsersAD();
    const addUserMutation = useAddUserAD(); 
    const updateUserMutation = useUpdateUserAD(); 

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null); 
    const adminInfo = getAdminInfo();

    

    // State quản lý dữ liệu form
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "staff"
    });

    if (adminInfo?.role === "staff") {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "60vh",
                    textAlign: "center"
                }}
            >
                <h2>🚫 Truy cập bị từ chối</h2>
                <p>Bạn không có quyền quản lý thành viên.</p>
            </div>
        );
    }

    // Hàm mở modal dùng chung
    const handleOpenModal = (user = null) => {
        if (user) {
            setEditUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: "", // Sửa thì không bắt buộc nhập password mới
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
        if (editUser) {
            // Cập nhật nhân viên
            updateUserMutation.mutate({ id: editUser.id, data: formData }, {
                onSuccess: () => {
                    toast.success("Cập nhật thành viên thành công!");
                    closeModal();
                },
                onError: (err) => {
                    toast.error(err.response?.data?.message || "Có lỗi xảy ra khi cập nhật thành viên");
                }
            });
        } else {
            // Thêm mới nhân viên
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

    const handleDelete = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này không?")) {
            console.log("Xóa nhân viên ID:", id);
            // Có thể tích hợp mutation delete tại đây khi bạn viết API xóa
        }
    };

    // 🔥 ĐÃ SỬA: Lọc chỉ lấy thành viên nội bộ (admin và staff), loại bỏ hoàn toàn 'client' trước khi filter theo ô tìm kiếm
    const filteredUsers = users?.filter(u => {
        const isInternalRole = u.role === 'admin' || u.role === 'staff';
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        return isInternalRole && matchesSearch;
    });

    return (
        <div className="user-management-container">
            {/* Khung chứa hiệu ứng thông báo */}
            <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} />

            <div className="page-header">
                <div className="header-title">
                    <FaUserShield className="main-icon" />
                    <div>
                        <h2>Quản lý thành viên</h2>
                        <p>Hiển thị và quản lý danh sách tài khoản quản trị & nhân viên hệ thống</p>
                    </div>
                </div>
                <button className="btn-add" onClick={() => handleOpenModal()}>
                    <FaUserPlus /> Thêm thành viên mới
                </button>
            </div>

            <div className="table-controls">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm quản trị viên, nhân viên..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-wrapper">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ảnh</th>
                            <th>Họ và tên</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Ngày tạo</th>
                            <th className="text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="7" className="text-center">Đang tải dữ liệu...</td></tr>
                        ) : filteredUsers?.length === 0 ? (
                            <tr><td colSpan="7" className="text-center" style={{ color: '#94a3b8', padding: '30px' }}>Không tìm thấy thành viên nào phù hợp.</td></tr>
                        ) : (
                            filteredUsers?.map((user) => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>
                                    <td>
                                        {user.avatar ? (
                                            <img 
                                                src={`${STORAGE_URL}${user.avatar}`} 
                                                alt={user.name} 
                                                className="user-avatar-sm"
                                            />
                                        ) : (
                                            <div className="user-avatar-sm avatar-fallback">
                                                {user.name?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                        )}
                                    </td>
                                    <td className="font-bold">{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-staff'}`}>
                                            {user.role === 'admin' ? 'Quản trị viên' : 'Thành viên Quảng Trị'}
                                        </span>
                                    </td>
                                    <td>{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                                    <td className="text-center">
                                        <div className="action-buttons">
                                            <button className="btn-icon edit" title="Sửa" onClick={() => handleOpenModal(user)}><FaUserEdit /></button>
                                            <button className="btn-icon delete" title="Xóa" onClick={() => handleDelete(user.id)}><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            {/* 🔥 ĐÃ SỬA: Tiêu đề động phù hợp với thao tác */}
                            <h3>{editUser ? "Cập nhật thông tin thành viên" : "Thêm thành viên mới"}</h3>
                            <button className="btn-close" onClick={closeModal}><FaTimes /></button>
                        </div>
                        
                        <form className="modal-body" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Họ và tên</label>
                                <input name="name" type="text" placeholder="Nhập tên" required value={formData.name} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input name="email" type="email" placeholder="Nhập email" required value={formData.email} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                {/* 🔥 ĐÃ SỬA: Nếu đang sửa (editUser != null) thì không yêu cầu nhập (bỏ thuộc tính required) */}
                                <label>Mật khẩu {editUser && <span style={{fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'normal'}}>(Bỏ trống nếu giữ nguyên)</span>}</label>
                                <input name="password" type="password" placeholder={editUser ? "********" : "Nhập mật khẩu"} required={!editUser} value={formData.password} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Vai trò</label>
                                <select name="role" value={formData.role} onChange={handleChange}>
                                    <option value="staff"> Thành viên quảng trị (Member)</option>
                                    <option value="admin">Quản trị viên (Admin)</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeModal}>Hủy</button>
                                <button type="submit" className="btn-save" disabled={addUserMutation.isPending || updateUserMutation.isPending}>
                                    <FaSave /> {addUserMutation.isPending || updateUserMutation.isPending ? "Đang lưu..." : "Lưu lại"}
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