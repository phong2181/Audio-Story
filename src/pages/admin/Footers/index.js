import React, { useState, useEffect } from "react";
import { 
    FaSlidersH, 
    FaInfoCircle, 
    FaLink, 
    FaImages, 
    FaSave, 
    FaFacebook, 
    FaYoutube, 
    FaTiktok,
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaTimes
} from "react-icons/fa";
import { 
    useGetFootersAD, 
    useAddFooterAD, 
    useUpdateFooterAD, 
    useDeleteFooterAD 
} from "api/homePage";
import "./style.scss";

// =========================================================================
// 1. COMPONENT CON: QUẢN LÝ CỘT 1 (THÔNG TIN THƯƠNG HIỆU & MXH)
// =========================================================================
const BrandColumnForm = ({ footers, updateMutation }) => {
    const [formData, setFormData] = useState({
        desc: "",
        facebook: "",
        youtube: "",
        tiktok: ""
    });

    useEffect(() => {
        if (footers?.data?.brand) {
            setFormData(footers.data.brand);
        }
    }, [footers]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateMutation.mutateAsync({ type: "brand", data: formData });
            alert("Cập nhật thông tin thương hiệu thành công!");
        } catch (error) {
            console.error("Lỗi cập nhật brand:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form-inner">
            <h3 className="form-inner-title">Thông Tin Thương Hiệu & Mạng Xã Hội</h3>
            
            <div className="form-group">
                <label className="form-label">Mô tả ngắn <span className="required">*</span></label>
                <textarea 
                    name="desc" 
                    className="form-textarea" 
                    rows="4" 
                    placeholder="Nền tảng chia sẻ và nghe truyện audio chất lượng cao..."
                    value={formData.desc} 
                    onChange={handleChange} 
                    required
                />
            </div>

            <div className="social-inputs-grid">
                <div className="form-group prefix-group">
                    <label className="form-label"><FaFacebook className="social-brand fb" /> Đường dẫn Facebook</label>
                    <input 
                        type="url" 
                        name="facebook" 
                        className="form-input" 
                        placeholder="https://facebook.com/yourpage" 
                        value={formData.facebook || ""} 
                        onChange={handleChange} 
                    />
                </div>

                <div className="form-group prefix-group">
                    <label className="form-label"><FaYoutube className="social-brand yt" /> Đường dẫn Youtube</label>
                    <input 
                        type="url" 
                        name="youtube" 
                        className="form-input" 
                        placeholder="https://youtube.com/c/yourchannel" 
                        value={formData.youtube || ""} 
                        onChange={handleChange} 
                    />
                </div>

                <div className="form-group prefix-group">
                    <label className="form-label"><FaTiktok className="social-brand tk" /> Đường dẫn TikTok</label>
                    <input 
                        type="url" 
                        name="tiktok" 
                        className="form-input" 
                        placeholder="https://tiktok.com/@yourprofile" 
                        value={formData.tiktok || ""} 
                        onChange={handleChange} 
                    />
                </div>
            </div>

            <button type="submit" className="btn-submit" disabled={updateMutation.isLoading}>
                <FaSave className="btn-icon" /> Lưu thay đổi
            </button>
        </form>
    );
};

// =========================================================================
// 2. COMPONENT CON: QUẢN LÝ CỘT 2 (DANH MỤC LIÊN KẾT)
// =========================================================================
const LinksColumnForm = ({ footers, addMutation, updateMutation, deleteMutation }) => {
    const [links, setLinks] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ label: "", url: "" });

    useEffect(() => {
        if (footers?.data?.links) {
            setLinks(footers.data.links);
        }
    }, [footers]);

    const handleEdit = (link) => {
        setEditingId(link.id);
        setFormData({ label: link.label, url: link.url });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ label: "", url: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateMutation.mutateAsync({ id: editingId, type: "link", data: formData });
                setEditingId(null);
            } else {
                await addMutation.mutateAsync({ type: "link", data: formData });
            }
            setFormData({ label: "", url: "" });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Xóa liên kết này khỏi danh mục footer?")) {
            await deleteMutation.mutateAsync({ id, type: "link" });
        }
    };

    return (
        <div className="links-manager">
            <form onSubmit={handleSubmit} className="admin-form-inner">
                <h3 className="form-inner-title">
                    {editingId ? "✏️ Chỉnh sửa Liên Kết" : "➕ Thêm Liên Kết Mới"}
                </h3>
                <div className="form-inline-grid">
                    <div className="form-group">
                        <label className="form-label">Tên hiển thị</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Ví dụ: Trang chủ" 
                            value={formData.label}
                            onChange={e => setFormData({ ...formData, label: e.target.value })}
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Đường dẫn (URL)</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Ví dụ: /truyen" 
                            value={formData.url}
                            onChange={e => setFormData({ ...formData, url: e.target.value })}
                            required 
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-submit" disabled={addMutation.isLoading || updateMutation.isLoading}>
                        <FaSave className="btn-icon" /> {editingId ? "Cập nhật" : "Thêm vào Menu"}
                    </button>
                    {editingId && (
                        <button type="button" className="btn-cancel" onClick={handleCancel}>
                            <FaTimes /> Hủy
                        </button>
                    )}
                </div>
            </form>

            <div className="links-list-table">
                <h4 className="list-title">Danh sách liên kết hiện tại</h4>
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Tên hiển thị</th>
                                <th>Đường dẫn URL</th>
                                <th style={{ width: "120px" }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {links.map(link => (
                                <tr key={link.id}>
                                    <td><strong>{link.label}</strong></td>
                                    <td><code>{link.url}</code></td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="btn-table btn-edit" onClick={() => handleEdit(link)}><FaEdit /></button>
                                            <button className="btn-table btn-delete" onClick={() => handleDelete(link.id)} disabled={deleteMutation.isLoading}><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// =========================================================================
// 3. COMPONENT CON: QUẢN LÝ CỘT 3 (SLIDER TRÌNH CHIẾU)
// =========================================================================
const SliderColumnForm = ({ footers, addMutation, updateMutation, deleteMutation }) => {
    const [slides, setSlides] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ title: "", imageUrl: "" });

    useEffect(() => {
        if (footers?.data?.slides) {
            setSlides(footers.data.slides);
        }
    }, [footers]);

    const handleEdit = (slide) => {
        setEditingId(slide.id);
        setFormData({ title: slide.title, imageUrl: slide.imageUrl });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ title: "", imageUrl: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateMutation.mutateAsync({ id: editingId, type: "slide", data: formData });
                setEditingId(null);
            } else {
                await addMutation.mutateAsync({ type: "slide", data: formData });
            }
            setFormData({ title: "", imageUrl: "" });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Xóa ảnh slide này khỏi footer?")) {
            await deleteMutation.mutateAsync({ id, type: "slide" });
        }
    };

    return (
        <div className="slider-manager">
            <form onSubmit={handleSubmit} className="admin-form-inner">
                <h3 className="form-inner-title">
                    {editingId ? "✏️ Chỉnh sửa Slide" : "➕ Thêm Ảnh Slide Mới"}
                </h3>
                <div className="form-grid-2col">
                    <div className="form-group">
                        <label className="form-label">Tiêu đề ảnh (Chú thích)</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Nhập chú thích ngắn..." 
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Đường dẫn ảnh (URL hoặc Base64)</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="https://example.com/image.jpg" 
                            value={formData.imageUrl}
                            onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                            required 
                        />
                    </div>
                </div>
                {formData.imageUrl && (
                    <div className="image-preview">
                        <p className="preview-label">Xem trước ảnh:</p>
                        <img src={formData.imageUrl} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                )}
                <div className="form-actions" style={{ marginTop: "15px" }}>
                    <button type="submit" className="btn-submit" disabled={addMutation.isLoading || updateMutation.isLoading}>
                        <FaSave className="btn-icon" /> {editingId ? "Cập nhật slide" : "Thêm vào Slider"}
                    </button>
                    {editingId && (
                        <button type="button" className="btn-cancel" onClick={handleCancel}>
                            <FaTimes /> Hủy
                        </button>
                    )}
                </div>
            </form>

            <div className="slides-grid-wrapper">
                <h4 className="list-title">Danh sách slide đang hiển thị</h4>
                <div className="admin-slides-grid">
                    {slides.map(slide => (
                        <div className="admin-slide-card" key={slide.id}>
                            <div className="slide-img-wrapper">
                                <img src={slide.imageUrl} alt={slide.title} />
                            </div>
                            <div className="slide-info">
                                <h5>{slide.title}</h5>
                            </div>
                            <div className="slide-card-actions">
                                <button className="btn-action btn-edit" onClick={() => handleEdit(slide)}><FaEdit /> Sửa</button>
                                <button className="btn-action btn-delete" onClick={() => handleDelete(slide.id)} disabled={deleteMutation.isLoading}><FaTrash /> Xóa</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// =========================================================================
// 4. COMPONENT CHA CHÍNH: FOOTERS (QUẢN LÝ TAB & PHÂN CHIA DỮ LIỆU)
// =========================================================================
const Footers = () => {
    const [activeTab, setActiveTab] = useState("brand");

    // Các React-Query Hooks kết nối API của bạn
    const { data: footers, isLoading, error } = useGetFootersAD();
    const addMutation = useAddFooterAD();
    const updateMutation = useUpdateFooterAD();
    const deleteMutation = useDeleteFooterAD();

    if (isLoading) return <div className="footers-loading">Đang tải cấu hình giao diện...</div>;
    if (error) return <div className="footers-error">Lỗi tải dữ liệu: {error.message}</div>;

    return (
        <div className="footers-page">
            {/* Page Header */}
            <div className="footers-header">
                <div className="header-content">
                    <h1 className="page-title">
                        <FaSlidersH className="title-icon" />
                        Quản Lý Giao Diện Footer
                    </h1>
                    <p className="page-subtitle">Thiết lập thông tin thương hiệu, liên kết điều hướng và các hình ảnh trình chiếu tự động ở chân trang</p>
                </div>
            </div>

            <div className="footers-container">
                {/* Tabs điều hướng */}
                <div className="tabs-navigation">
                    <button 
                        className={`tab-btn ${activeTab === "brand" ? "active" : ""}`}
                        onClick={() => setActiveTab("brand")}
                    >
                        <FaInfoCircle className="tab-icon" />
                        Cột 1: Thông tin thương hiệu
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === "links" ? "active" : ""}`}
                        onClick={() => setActiveTab("links")}
                    >
                        <FaLink className="tab-icon" />
                        Cột 2: Danh mục liên kết
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === "slider" ? "active" : ""}`}
                        onClick={() => setActiveTab("slider")}
                    >
                        <FaImages className="tab-icon" />
                        Cột 3: Slider trình chiếu
                    </button>
                </div>

                {/* Nội dung tương ứng với Tab được chọn */}
                <div className="tab-content-panel">
                    {activeTab === "brand" && (
                        <BrandColumnForm 
                            footers={footers} 
                            updateMutation={updateMutation} 
                        />
                    )}
                    {activeTab === "links" && (
                        <LinksColumnForm 
                            footers={footers} 
                            addMutation={addMutation}
                            updateMutation={updateMutation}
                            deleteMutation={deleteMutation}
                        />
                    )}
                    {activeTab === "slider" && (
                        <SliderColumnForm 
                            footers={footers} 
                            addMutation={addMutation}
                            updateMutation={updateMutation}
                            deleteMutation={deleteMutation}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Footers;