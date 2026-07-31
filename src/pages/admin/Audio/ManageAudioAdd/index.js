import React, { useCallback, useEffect, useState } from "react";
import { FaPlus, FaMusic, FaCloudUploadAlt, FaTrashAlt, FaCrown, FaUnlock } from "react-icons/fa";
import { useGetStoriesAD, useGetChaptersByStoryAD, useAddChapterAD, useDeleteChapterAD } from "api/homePage"; // Điều chỉnh path cho đúng
import "./style.scss";
import { debounce } from "lodash";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { NavLink } from "react-router-dom";
import { ROUTES } from "utils/route";

const ChapterManagement = () => {

    const [selectedStoryId, setSelectedStoryId] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // 🎯 THÊM TRƯỜNG is_vip VÀO FORM DATA (Mặc định bằng 0 - Miễn phí)
    const [formData, setFormData] = useState({ 
        chapter_name: "", 
        audio_file: null,
        is_vip: 0 
    });

    // 🚀 GỌI MUTATION XÓA CHƯƠNG TỪ HOOK
    const deleteMutation = useDeleteChapterAD();

    // 1. Lấy tất cả truyện - Sau đó mình sẽ lọc chỉ lấy 'updating' ở phần hiển thị
    const { data: allStories } = useGetStoriesAD();
    

    // 2. Lấy danh sách chương theo bộ truyện đã chọn
    const { data: chapters, isLoading: loadingChapters } = useGetChaptersByStoryAD(selectedStoryId);

    // 3. Mutation thêm chương
    const addMutation = useAddChapterAD();

    // Lọc danh sách truyện: Chỉ lấy những bộ truyện có status là "updating"
    const updatingStories = allStories?.filter(story => story.status === "updating") || [];

    // Giảm truy vấn khi search
    const debouncedSearch = useCallback(
        debounce((nextValue) => {
            console.log("Tìm kiếm chương:", nextValue);
        }, 500),
        [] 
    );

    useEffect(() => {
        document.title = "Quản lý chương Audio";
    }, []);

    // Xử lý search
    const handleSearchChange = (e) => {
        const { value } = e.target;
        debouncedSearch(value);
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, audio_file: e.target.files[0] });
    };

    // 🚀 HÀM THỰC THI XÓA SAU KHI ĐÃ XÁC NHẬN TRÊN TOAST
    const confirmDelete = (chapterId, toastId) => {
        toast.dismiss(toastId); // Đóng nhanh thông báo xác nhận đi

        deleteMutation.mutate(chapterId, {
            onSuccess: () => {
                toast.success("Xóa chương audio thành công!");
            },
            onError: (err) => {
                const errorMsg = err.response?.data?.message || "Không thể xóa chương này";
                toast.error(`Lỗi: ${errorMsg}`);
            }
        });
    };

    // 🚀 HÀM HIỂN THỊ THÔNG BÁO XÁC NHẬN XOÁ (Custom Toast)
    const handleDeleteClick = (chapterId, chapterName) => {
        const toastId = toast.info(
            <div className="custom-toast-confirm">
                <p style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>
                    Xóa vĩnh viễn <strong>{chapterName}</strong>?
                </p>
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <button 
                        onClick={() => toast.dismiss(toastId)}
                        style={{ background: "#cbd5e1", color: "#334155", border: "none", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={() => confirmDelete(chapterId, toastId)}
                        style={{ background: "#ef4444", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                    >
                        Xóa liền
                    </button>
                </div>
            </div>,
            {
                position: "top-center", // Hiện ở giữa phía trên cho admin dễ thấy
                autoClose: false,      // Không tự động đóng, phải bấm mới tắt
                closeOnClick: false,   // Bấm ra ngoài không tắt nhầm
                draggable: false,
                icon: false            // Tắt icon mặc định để giao diện custom đẹp hơn
            }
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedStoryId) {
            toast.warn("Vui lòng chọn một bộ truyện trước!");
            return;
        }
        if (!formData.audio_file) {
            toast.warn("Vui lòng chọn tệp âm thanh (Audio)!");
            return;
        }

        const data = new FormData();
        data.append("story_id", selectedStoryId);
        data.append("chapter_name", formData.chapter_name);
        data.append("audio_file", formData.audio_file);
        
        // 🎯 GỬI THÊM TRẠNG THÁI VIP LÊN BACKEND
        data.append("is_vip", formData.is_vip);
        
        const adminInfo = JSON.parse(localStorage.getItem("adminInfo")); 
        data.append("admin_name", adminInfo?.name || "Admin");

        addMutation.mutate(data, {
            onSuccess: () => {
                toast.success("Đăng chương audio thành công!");
                setIsModalOpen(false);
                // Reset form về mặc định
                setFormData({ chapter_name: "", audio_file: null, is_vip: 0 });
            },
            onError: (err) => {
                const errorMsg = err.response?.data?.message || "Không thể tải lên tệp âm thanh";
                toast.error(`Lỗi: ${errorMsg}`);
            }
        });
    };

    return (
        <div className="chapter-management-container">
            <ToastContainer position="top-right" autoClose={3000} closeOnClick pauseOnHover />

            <div className="page-header">
                <div className="header-title">
                    <div className="icon-circle"><FaMusic /></div>
                    <div>
                        <h2>Quản lý chương Audio</h2>
                        <p>Đăng tải nội dung cho các bộ truyện đang cập nhật</p>
                    </div>
                </div>
                <NavLink className="btn-add-chapter" style={{textDecoration: "none"}} to={ROUTES.ADMIN.ADDFILEREAD}>
                    <FaPlus /> Thêm chương mới
                </NavLink>
                <button className="btn-add-chapter" onClick={() => setIsModalOpen(true)}>
                    <FaPlus /> Tệp audio mp3
                </button>
            </div>

            <div className="control-bar">
                <div className="select-story-group">
                    <label>Bộ truyện đang cập nhật:</label>
                    <select 
                        className="story-select"
                        value={selectedStoryId}
                        onChange={(e) => setSelectedStoryId(e.target.value)}
                    >
                        <option value="">-- Chọn bộ truyện để xem chương --</option>
                        {updatingStories.map(story => (
                            <option key={story.id} value={story.id}>{story.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="table-card">
                <table className="chapter-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên chương</th>
                            <th>Quyền truy cập</th>
                            <th>Người đăng</th>
                            <th>Trình phát</th>
                            <th className="text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!selectedStoryId ? (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    <div className="empty-state" style={{ padding: '20px', color: '#64748b' }}>
                                        <p>Vui lòng chọn một bộ truyện để hiển thị danh sách chương</p>
                                    </div>
                                </td>
                            </tr>
                        ) : loadingChapters ? (
                            <tr>
                                <td colSpan="6" className="text-center" style={{ padding: '20px' }}>
                                    Đang tải danh sách chương...
                                </td>
                            </tr>
                        ) : chapters && chapters.length > 0 ? (
                            chapters.map((ch) => (
                                <tr key={ch.id}>
                                    <td><span className="chapter-badge">Chương {ch.chapter_number}</span></td>
                                    <td className="chapter-name">{ch.chapter_name}</td>
                                    
                                    {/* 🎯 HIỂN THỊ BADGE PHÂN BIỆT CHƯƠNG VIP / MIỄN PHÍ TRÊN TABLE */}
                                    <td>
                                        {parseInt(ch.is_vip) === 1 ? (
                                            <span className="badge-vip-status vip"><FaCrown /> Gói VIP</span>
                                        ) : (
                                            <span className="badge-vip-status free"><FaUnlock /> Miễn phí</span>
                                        )}
                                    </td>

                                    <td><span className="author-tag">{ch.author_post}</span></td>
                                    <td>
                                        <div className="audio-player-mini">
                                            <audio 
                                                controls 
                                                src={`${ch.audio_url}`}
                                                preload="metadata"
                                            >
                                                Trình duyệt không hỗ trợ nghe trực tuyến.
                                            </audio>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        {/* 🎯 KHI CLICK SẼ GỌI TOAST XÁC NHẬN CUSTOM */}
                                        <button 
                                            className="btn-delete" 
                                            disabled={deleteMutation.isPending}
                                            onClick={() => handleDeleteClick(ch.id, ch.chapter_name)}
                                            title="Xóa chương truyện"
                                        >
                                            <FaTrashAlt />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    <div className="empty-state" style={{ padding: '20px', color: '#64748b' }}>
                                        <p>Bộ truyện này hiện chưa có chương nào. Hãy bấm "Thêm chương mới"!</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3><FaCloudUploadAlt /> Đăng chương truyện mới</h3>
                            <button className="close-xs" onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>
                        <form className="modal-form" onSubmit={handleSubmit}>
                            <div className="form-group" style={{margin: '0px 5px'}}>
                                <label>Tên chương</label>
                                <input 
                                    type="text" 
                                    placeholder="Ví dụ: Tiết tử / Chương 1" 
                                    required 
                                    value={formData.chapter_name}
                                    onChange={(e) => setFormData({...formData, chapter_name: e.target.value})}
                                />
                            </div>

                            {/* 🎯 KHU VỰC CẤU HÌNH QUYỀN TRUY CẬP (VIP / MIỄN PHÍ) */}
                            <div className="form-group" style={{margin: '15px 5px'}}>
                                <label>Quyền xem chương này</label>
                                <div className="vip-toggle-group">
                                    <label className={`radio-label ${formData.is_vip === 0 ? 'active' : ''}`}>
                                        <input 
                                            type="radio" 
                                            name="is_vip" 
                                            value="0" 
                                            checked={formData.is_vip === 0}
                                            onChange={() => setFormData({...formData, is_vip: 0})}
                                        />
                                        <FaUnlock /> Độc giả miễn phí
                                    </label>
                                    <label className={`radio-label ${formData.is_vip === 1 ? 'active-vip' : ''}`}>
                                        <input 
                                            type="radio" 
                                            name="is_vip" 
                                            value="1" 
                                            checked={formData.is_vip === 1}
                                            onChange={() => setFormData({...formData, is_vip: 1})}
                                        />
                                        <FaCrown /> Chỉ dành cho Hội viên VIP
                                    </label>
                                </div>
                            </div>

                            <div className="form-group" style={{margin: '0px 5px'}}>
                                <label>Tệp âm thanh (Audio)</label>
                                <div className="file-upload-wrapper">
                                    <input 
                                        type="file" 
                                        accept="audio/*" 
                                        id="audio-upload" 
                                        hidden 
                                        onChange={handleFileChange}
                                    />
                                    <label htmlFor="audio-upload" className="file-label">
                                        <FaCloudUploadAlt />
                                        <span>{formData.audio_file ? formData.audio_file.name : "Chọn tệp .mp3, .m4a hoặc kéo thả vào đây"}</span>
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" style={{background: '#f53b3b', color: '#fff'}} onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                                <button type="button" className="btn-warning" style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' , color: '#fff' }} onClick={() => toast.info("Đã lưu tạm vào bản nháp!")}>Lưu Nháp</button>
                                <button type="submit" className="btn-submit" disabled={addMutation.isPending}>
                                    {addMutation.isPending ? "Đang tải lên..." : "Bắt đầu tải lên"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChapterManagement;