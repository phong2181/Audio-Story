import React, { memo, useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaListUl, FaTimes, FaSave } from "react-icons/fa";
import "./style.scss";
import { 
    useGetCategoriesAudioAD, 
    useAddCategoryAudioAD, 
    useUpdateCategoryAudioAD, 
    useDeleteCategoryAudioAD,
} from "api/homePage/queries";
import { getAdminInfo } from "utils/adminAuth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CategoryManagement = () => {

    useEffect(() => {
        document.title = "Quản lý thể loại ";
    }, []);

    const { data: categories, isLoading } = useGetCategoriesAudioAD();
    const addMutation = useAddCategoryAudioAD();
    const updateMutation = useUpdateCategoryAudioAD();
    const deleteMutation = useDeleteCategoryAudioAD();
    const adminInfo = getAdminInfo();

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editCategory, setEditCategory] = useState(null);
    
    const [formData, setFormData] = useState({ 
        name: "", 
        category_audio_id: "", 
        author: "" 
    });

    const filteredCategories = categories?.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditCategory(category);
            setFormData({ 
                name: category.name || "", 
                category_audio_id: category.category_audio_id || "", 
                author: category.author || "" 
            });
        } else {
            setEditCategory(null);
            setFormData({ 
                name: "", 
                category_audio_id: "", 
                author: adminInfo?.username || adminInfo?.name || "" 
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditCategory(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const mutation = editCategory ? updateMutation : addMutation;
        
        const data = new FormData();
        data.append("name", formData.name); 
        data.append("author", formData.author);
        data.append("category_audio_id", formData.category_audio_id); 

        if (editCategory) {
            data.append("_method", "PUT"); 
            mutation.mutate({ id: editCategory.id, data: data }, {
                onSuccess: () => {
                    toast.success("Cập nhật thể loại thành công!");
                    closeModal();
                },
                onError: (err) => {
                    toast.error(`Lỗi cập nhật: ${err.response?.data?.message || "Không thể thực hiện"}`);
                }
            });
        } else {
            mutation.mutate(data, {
                onSuccess: () => {
                    toast.success("Thêm mới thể loại thành công!");
                    closeModal();
                },
                onError: (err) => {
                    toast.error(`Lỗi thêm mới: ${err.response?.data?.message || "Không thể thực hiện"}`);
                }
            });
        }
    };

    // Hàm xử lý xóa tùy biến giao diện xác nhận bằng Toast (Không dùng confirm mặc định của trình duyệt)
    const handleDelete = (id) => {
        toast(
            ({ closeToast }) => (
                <div className="custom-confirm-toast">
                    <p style={{ margin: "0 0 10px 0", fontWeight: "500", color: "#1e293b" }}>
                        Bạn có chắc chắn muốn xóa thể loại này không?
                    </p>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button 
                            style={{
                                background: "#64748b", color: "#fff", border: "none", 
                                padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px"
                            }}
                            onClick={closeToast}
                        >
                            Hủy
                        </button>
                        <button 
                            style={{
                                background: "#ef4444", color: "#fff", border: "none", 
                                padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px"
                            }}
                            onClick={() => {
                                closeToast();
                                executeDelete(id);
                            }}
                        >
                            Xác nhận xóa
                        </button>
                    </div>
                </div>
            ),
            {
                position: "top-center",
                autoClose: false, // Giữ lại cho tới khi bấm nút hành động
                closeOnClick: false,
                draggable: false,
            }
        );
    };

    // Hàm chạy lệnh xóa thực tế sau khi nhấn xác nhận
    const executeDelete = (id) => {
        deleteMutation.mutate(id, {
            onSuccess: () => {
                toast.success("Xóa thể loại thành công!");
            },
            onError: (err) => {
                toast.error(`Lỗi xóa: ${err.response?.data?.message || "Không thể xóa nội dung này"}`);
            }
        });
    };

    return (
        <div className="category-management-container">
            {/* Thêm container nhận hiển thị thông báo bong bóng */}
            <ToastContainer position="top-right" autoClose={3000} closeOnClick pauseOnHover />

            <div className="page-header">
                <div className="header-title">
                    <FaListUl className="main-icon" />
                    <div>
                        <h2>Quản lý thể loại</h2>
                        <p>Danh mục phân loại truyện audio hệ thống</p>
                    </div>
                </div>
                <button className="btn-add" onClick={() => handleOpenModal()}>
                    <FaPlus /> Thêm thể loại mới
                </button>
            </div>

            <div className="table-controls">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Tìm tên thể loại..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-wrapper">
                <table className="category-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên thể loại</th>
                            <th>Tác giả</th>
                            <th>Mô tả (Key ngoại)</th>
                            <th>Ngày tạo</th>
                            <th className="text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="6" className="text-center">Đang tải...</td></tr>
                        ) : filteredCategories?.map((cat) => (
                            <tr key={cat.id}>
                                <td>#{cat.id}</td>
                                <td className="font-bold">{cat.name}</td>
                                <td>{cat.author || "Chưa cập nhật"}</td>
                                <td className="text-muted">{cat.category_audio_id || "N/A"}</td>
                                <td>{new Date(cat.created_at).toLocaleDateString('vi-VN')}</td>
                                <td className="text-center">
                                    <div className="action-buttons">
                                        <button className="btn-icon edit" onClick={() => handleOpenModal(cat)}><FaEdit /></button>
                                        <button className="btn-icon delete" onClick={() => handleDelete(cat.id)}><FaTrash /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editCategory ? "Sửa thể loại" : "Thêm thể loại mới"}</h3>
                            <button className="btn-close" onClick={closeModal}><FaTimes /></button>
                        </div>
                        <form className="modal-body" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tên thể loại</label>
                                <input name="name" type="text" required value={formData.name} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Tác giả</label>
                                <input name="author" type="text" value={formData.author} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Mô tả (category_audio_id)</label>
                                <textarea 
                                    name="category_audio_id" 
                                    rows="3" 
                                    value={formData.category_audio_id} 
                                    onChange={handleChange} 
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeModal}>Hủy</button>
                                <button type="submit" className="btn-save" disabled={addMutation.isPending || updateMutation.isPending}>
                                    <FaSave /> {editCategory ? "Cập nhật" : "Lưu lại"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(CategoryManagement);