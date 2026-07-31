import React, { memo, useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBook, FaTimes, FaSave, FaUser, FaImage, FaListAlt, FaEye } from "react-icons/fa";
import "./style.scss";
import { 
    useGetStoriesAD, 
    useAddStoryAD, 
    useUpdateStoryAD, 
    useDeleteStoryAD,
    useGetCategoriesAudioAD
} from "api/homePage";
import { getAdminInfo } from "utils/adminAuth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { STORAGE_URL } from "config/config";

const StoryManagement = () => {

    useEffect(() => {
        document.title = "Quản lý bộ truyện ";
    }, []);

    // 1. Lấy dữ liệu từ API
    const { data: stories, isLoading: loadingStories } = useGetStoriesAD();
    const { data: categories } = useGetCategoriesAudioAD();
    const addMutation = useAddStoryAD();
    const updateMutation = useUpdateStoryAD();
    const deleteMutation = useDeleteStoryAD();
    const adminInfo = getAdminInfo();

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editStory, setEditStory] = useState(null);
    
    const [formData, setFormData] = useState({
        title: "",
        author: "",
        category_id: "",
        status: "updating",
        description: "", 
        summary: "",
        thumbnail: null
    });

    const [previewImage, setPreviewImage] = useState(null);

    // Lọc tìm kiếm
    const filteredStories = stories?.filter(s => 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.author?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (story = null) => {
        if (story) {
            setEditStory(story);
            setFormData({
                title: story.title,
                author: story.author || "",
                category_id: story.category_audio_id,
                status: story.status,
                description: story.description || "", 
                summary: story.summary || "",
                thumbnail: null
            });
            setPreviewImage(story.thumbnail ? `http://localhost:8000/storage/${story.thumbnail}` : null);
        } else {
            setEditStory(null);
            setFormData({ 
                title: "", 
                author: adminInfo?.name || "", 
                category_id: "", 
                status: "updating", 
                description: "", 
                summary: "", 
                thumbnail: null 
            });
            setPreviewImage(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditStory(null);
        setPreviewImage(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, thumbnail: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("title", formData.title);
        data.append("author", formData.author);
        data.append("category_audio_id", formData.category_id);
        data.append("status", formData.status);
        data.append("summary", formData.summary);
        data.append("description", formData.description); 
        
        if (formData.thumbnail) {
            data.append("thumbnail", formData.thumbnail);
        }

        if (editStory) {
            data.append("_method", "PUT");
        }

        const mutation = editStory ? updateMutation : addMutation;
        const payload = editStory ? { id: editStory.id, data: data } : data;

        mutation.mutate(payload, {
            onSuccess: () => {
                toast.success("Lưu thông tin bộ truyện thành công!");
                closeModal();
            },
            onError: (err) => {
                toast.error(err.response?.data?.message || "Lỗi hệ thống, không thể lưu bộ truyện!");
            }
        });
    };

    // Hàm gọi Confirm Toast tùy biến giao diện để thay thế window.confirm()
    const handleDelete = (id) => {
        toast(
            ({ closeToast }) => (
                <div className="custom-confirm-toast">
                    <p style={{ margin: "0 0 10px 0", fontWeight: "500", color: "#1e293b" }}>
                        Bạn có chắc chắn muốn xóa bộ truyện này không?
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
                autoClose: false, // Đợi người dùng nhấn nút hành động
                closeOnClick: false,
                draggable: false,
            }
        );
    };

    // Hàm thực tế bắn API để xóa bộ truyện
    const executeDelete = (id) => {
        deleteMutation.mutate(id, {
            onSuccess: () => {
                toast.success("Đã xóa bộ truyện thành công!");
            },
            onError: (err) => {
                toast.error(err.response?.data?.message || "Lỗi hệ thống, không thể xóa!");
            }
        });
    };

    return (
        <div className="story-management-container">
            {/* Vùng chứa hiển thị bong bóng thông báo của react-toastify */}
            <ToastContainer position="top-right" autoClose={3000} closeOnClick pauseOnHover />

            <div className="page-header">
                <div className="header-title">
                    <FaBook className="main-icon" />
                    <div>
                        <h2>Quản lý bộ truyện Audio</h2>
                        <p>Thêm, sửa và quản lý trạng thái các bộ truyện</p>
                    </div>
                </div>
                <button className="btn-add" onClick={() => handleOpenModal()}>
                    <FaPlus /> Thêm bộ truyện mới
                </button>
            </div>

            <div className="table-controls">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Tìm tên truyện hoặc tác giả..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-wrapper">
                <table className="story-table">
                    <thead>
                        <tr>
                            <th>Ảnh</th>
                            <th>Thông tin truyện</th>
                            <th>Thể loại</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th className="text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loadingStories ? (
                            <tr><td colSpan="6" className="text-center">Đang tải dữ liệu...</td></tr>
                        ) : filteredStories?.map((story) => (
                            <tr key={story.id}>
                                <td>
                                    <div className="thumb-preview-table">
                                        <img 
                                            src={story.thumbnail ? `${STORAGE_URL}${story.thumbnail}` : "https://via.placeholder.com/60x80"} 
                                            alt="thumb" 
                                        />
                                    </div>
                                </td>
                                <td>
                                    <div className="story-info-cell">
                                        <span className="story-name">{story.title}</span>
                                        <span className="story-author"><FaUser /> Tác giả: {story.author || 'Chưa cập nhật'}</span>
                                    </div>
                                </td>
                                <td><span className="badge-category">{story.category?.name || 'N/A'}</span></td>
                                <td>
                                    <span className={`status-badge ${story.status}`}>
                                        {story.status === 'updating' ? 'Đang cập nhật' : 'Hoàn thành'}
                                    </span>
                                </td>
                                <td>{new Date(story.created_at).toLocaleDateString('vi-VN')}</td>
                                <td className="text-center">
                                    <div className="action-buttons">
                                        <button className="btn-icon view" title="Xem chương"><FaEye /></button>
                                        <button className="btn-icon edit" onClick={() => handleOpenModal(story)}><FaEdit /></button>
                                        <button className="btn-icon delete" onClick={() => handleDelete(story.id)}><FaTrash /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content large">
                        <div className="modal-header">
                            <h3>{editStory ? "Chỉnh sửa bộ truyện" : "Thêm bộ truyện mới"}</h3>
                            <button className="btn-close" onClick={closeModal}><FaTimes /></button>
                        </div>
                        <form className="modal-body" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group thumb-upload">
                                    <label><FaImage /> Ảnh bìa</label>
                                    <div className="upload-zone" onClick={() => document.getElementById('fileInput').click()}>
                                        {previewImage ? <img src={previewImage} alt="preview" /> : <span>Chọn ảnh</span>}
                                        <input type="file" id="fileInput" hidden onChange={handleFileChange} accept="image/*" />
                                    </div>
                                </div>
                                <div className="form-main-info">
                                    <div className="form-group">
                                        <label>Tên bộ truyện</label>
                                        <input name="title" type="text" required value={formData.title} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Tác giả</label>
                                        <input name="author" type="text" value={formData.author} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Mô tả</label>
                                        <textarea name="description" rows="3" value={formData.description} onChange={handleChange}></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label><FaListAlt /> Thể loại</label>
                                    <select name="category_id" value={formData.category_id} onChange={handleChange} required>
                                        <option value="">-- Chọn thể loại --</option>
                                        {categories?.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Trạng thái</label>
                                    <select name="status" value={formData.status} onChange={handleChange}>
                                        <option value="updating">Đang cập nhật</option>
                                        <option value="completed">Đã hoàn thành</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Tóm tắt nội dung</label>
                                <textarea name="summary" rows="3" value={formData.summary} onChange={handleChange}></textarea>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeModal}>Hủy</button>
                                <button type="submit" className="btn-save" disabled={addMutation.isPending || updateMutation.isPending}>
                                    <FaSave /> {editStory ? "Cập nhật" : "Lưu lại"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(StoryManagement);