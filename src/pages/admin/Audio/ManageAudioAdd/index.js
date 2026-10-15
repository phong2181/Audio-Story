import { memo, useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import {
  FaPlus,
  FaMusic,
  FaCloudUploadAlt,
  FaTrashAlt,
  FaCrown,
  FaUnlock,
  FaSearch,
  FaMicrophone,
  FaBook,
  FaArrowLeft,
  FaTimes,
  FaCheck,
  FaHeadphones,
  FaCalendarAlt,
  FaSyncAlt,
  FaUser,
} from "react-icons/fa";
import {
  useGetStoriesAD,
  useGetChaptersByStoryAD,
  useAddChapterAD,
  useDeleteChapterAD,
} from "api/homePage";
import { getAdminInfo } from "utils/adminAuth";
import toast, { Toaster } from "react-hot-toast";
import { STORAGE_URL } from "config/config";
import { ROUTES } from "utils/route";
import "./style.scss";

const ChapterManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Đọc story_id từ query param nếu được chuyển từ trang Quản lý bộ truyện
  const queryParams = new URLSearchParams(location.search);
  const initialStoryId = queryParams.get("story_id") || "";

  // State
  const [selectedStoryId, setSelectedStoryId] = useState(initialStoryId);
  const [filterVip, setFilterVip] = useState("all"); // 'all' | '0' | '1'
  const [searchChapter, setSearchChapter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    chapter_name: "",
    audio_file: null,
    is_vip: 0,
  });

  // Queries & Mutations
  const { data: allStories = [], isLoading: loadingStories } = useGetStoriesAD();
  const {
    data: rawChapters = [],
    isLoading: loadingChapters,
    isFetching: isFetchingChapters,
  } = useGetChaptersByStoryAD(selectedStoryId);
  const addMutation = useAddChapterAD();
  const deleteMutation = useDeleteChapterAD();
  const adminInfo = getAdminInfo();

  useEffect(() => {
    document.title = "Quản lý chương Audio ‹ Quản trị";
  }, []);

  // Chuẩn hóa danh sách truyện
  const storiesList = useMemo(() => {
    if (!allStories) return [];
    if (Array.isArray(allStories)) return allStories;
    if (Array.isArray(allStories.data)) return allStories.data;
    return [];
  }, [allStories]);

  // Tự động chọn truyện đầu tiên nếu chưa chọn và danh sách có dữ liệu
  useEffect(() => {
    if (!selectedStoryId && storiesList.length > 0) {
      setSelectedStoryId(String(storiesList[0].id));
    }
  }, [storiesList, selectedStoryId]);

  // Bộ truyện hiện tại đang được chọn
  const currentStory = useMemo(() => {
    return storiesList.find((s) => String(s.id) === String(selectedStoryId));
  }, [storiesList, selectedStoryId]);

  // Chuẩn hóa danh sách chương
  const chaptersList = useMemo(() => {
    if (!rawChapters) return [];
    if (Array.isArray(rawChapters)) return rawChapters;
    if (Array.isArray(rawChapters.data)) return rawChapters.data;
    return [];
  }, [rawChapters]);

  // Lọc chương theo VIP và tìm kiếm
  const filteredChapters = useMemo(() => {
    return chaptersList.filter((ch) => {
      if (filterVip === "0" && parseInt(ch.is_vip) !== 0) return false;
      if (filterVip === "1" && parseInt(ch.is_vip) !== 1) return false;

      if (searchChapter.trim()) {
        const query = searchChapter.toLowerCase().trim();
        const nameMatch = ch.chapter_name?.toLowerCase().includes(query);
        const numMatch = String(ch.chapter_number).includes(query);
        if (!nameMatch && !numMatch) return false;
      }

      return true;
    });
  }, [chaptersList, filterVip, searchChapter]);

  // Helper ảnh bìa
  const getThumbnailUrl = (thumbnail) => {
    if (!thumbnail) return "/placeholder.png";
    if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
      return thumbnail;
    }
    return `${STORAGE_URL}${thumbnail}`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, audio_file: file }));
    }
  };

  // Submit Upload Chapter
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedStoryId) {
      toast.error("Vui lòng chọn một bộ truyện trước!");
      return;
    }
    if (!formData.chapter_name.trim()) {
      toast.error("Vui lòng nhập tên chương!");
      return;
    }
    if (!formData.audio_file) {
      toast.error("Vui lòng chọn tệp âm thanh (MP3, M4A, WAV)!");
      return;
    }

    const data = new FormData();
    data.append("story_id", selectedStoryId);
    data.append("chapter_name", formData.chapter_name.trim());
    data.append("audio_file", formData.audio_file);
    data.append("is_vip", formData.is_vip);
    data.append("admin_name", adminInfo?.name || adminInfo?.username || "Admin");

    toast.promise(
      addMutation.mutateAsync(data),
      {
        loading: "Đang tải lên và xử lý tệp âm thanh...",
        success: "Đã tải lên chương audio thành công!",
        error: (err) => err.response?.data?.message || "Lỗi khi tải lên tệp âm thanh!",
      },
      { position: "top-right" }
    );

    setIsModalOpen(false);
    setFormData({ chapter_name: "", audio_file: null, is_vip: 0 });
  };

  // Xóa chương truyện
  const handleDeleteChapter = (chapterId, chapterName) => {
    toast(
      (t) => (
        <div className="wp-confirm-dialog">
          <div className="confirm-icon">⚠️</div>
          <div className="confirm-body">
            <h4 className="confirm-title">Xóa vĩnh viễn chương này?</h4>
            <p className="confirm-desc">
              Bạn có chắc chắn muốn xóa "<strong>{chapterName}</strong>"? Tệp âm thanh trên máy chủ cũng sẽ bị xóa vĩnh viễn.
            </p>
          </div>
          <div className="confirm-actions">
            <button
              className="btn-cancel"
              onClick={() => toast.dismiss(t.id)}
            >
              Hủy
            </button>
            <button
              className="btn-confirm-delete"
              onClick={() => {
                toast.dismiss(t.id);
                toast.promise(
                  deleteMutation.mutateAsync(chapterId),
                  {
                    loading: "Đang xóa chương audio...",
                    success: "Đã xóa chương audio thành công!",
                    error: (err) => err.response?.data?.message || "Không thể xóa chương này!",
                  },
                  { position: "top-right" }
                );
              }}
            >
              Xác nhận xóa
            </button>
          </div>
        </div>
      ),
      { duration: 6000, position: "top-center" }
    );
  };

  return (
    <div className="wp-chapters-page">
      <Toaster position="top-right" reverseOrder={false} />

      {/* WordPress Admin Header */}
      <div className="wp-page-header">
        <div className="wp-header-title-row">
          <h1 className="wp-page-title">
            <FaMusic className="title-icon" />
            Chương truyện Audio
          </h1>

          <div className="header-action-buttons">
            <button
              className="wp-button-action primary"
              onClick={() => setIsModalOpen(true)}
              disabled={!selectedStoryId}
            >
              <FaCloudUploadAlt /> Tải lên audio (MP3)
            </button>

            <NavLink
              to={ROUTES.ADMIN.ADDFILEREAD}
              className="wp-button-action studio"
              title="Mở Studio chuyển đổi văn bản thành giọng đọc AI"
            >
              <FaMicrophone /> Studio Giọng đọc AI (TTS)
            </NavLink>

            <NavLink
              to={ROUTES.ADMIN.MANAGE_COMMENTS_AUDIO}
              className="wp-button-action secondary"
            >
              <FaArrowLeft /> Danh sách bộ truyện
            </NavLink>
          </div>

          {isFetchingChapters && !loadingChapters && (
            <span className="wp-refreshing-badge">
              <FaSyncAlt className="spin" /> Đang cập nhật...
            </span>
          )}
        </div>
      </div>

      {/* Story Selector & Information Box (WordPress Style Card) */}
      <div className="wp-story-selector-card">
        <div className="selector-row">
          <div className="story-dropdown-group">
            <label className="group-label">
              <FaBook className="label-icon" /> Chọn bộ truyện cần quản lý:
            </label>
            <select
              className="wp-story-select"
              value={selectedStoryId}
              onChange={(e) => setSelectedStoryId(e.target.value)}
            >
              <option value="">-- Chọn bộ truyện --</option>
              {storiesList.map((story) => (
                <option key={story.id} value={story.id}>
                  {story.title} {story.chapters_count ? `(${story.chapters_count} chương)` : ""}
                </option>
              ))}
            </select>
          </div>

          {currentStory && (
            <div className="current-story-badge-info">
              <img
                src={getThumbnailUrl(currentStory.thumbnail)}
                alt={currentStory.title}
                className="story-mini-cover"
                onError={(e) => {
                  e.target.src = "/placeholder.png";
                }}
              />
              <div className="story-mini-meta">
                <h3 className="story-meta-title">{currentStory.title}</h3>
                <div className="story-meta-tags">
                  <span className="meta-tag author">
                    <FaUser /> {currentStory.author || "Chưa rõ"}
                  </span>
                  <span className="meta-tag category">
                    {currentStory.category?.name || "Chưa phân loại"}
                  </span>
                  <span className="meta-tag count">
                    <FaHeadphones /> {chaptersList.length} chương đã đăng
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* WordPress Tablenav Filter Bar */}
      <div className="wp-tablenav top">
        <div className="alignleft actions">
          {/* Lọc theo VIP */}
          <div className="vip-filter-tabs">
            <button
              className={`filter-tab ${filterVip === "all" ? "active" : ""}`}
              onClick={() => setFilterVip("all")}
            >
              Tất cả ({chaptersList.length})
            </button>
            <button
              className={`filter-tab ${filterVip === "0" ? "active" : ""}`}
              onClick={() => setFilterVip("0")}
            >
              <FaUnlock /> Miễn phí ({chaptersList.filter((c) => parseInt(c.is_vip) === 0).length})
            </button>
            <button
              className={`filter-tab ${filterVip === "1" ? "active" : ""}`}
              onClick={() => setFilterVip("1")}
            >
              <FaCrown /> Gói VIP ({chaptersList.filter((c) => parseInt(c.is_vip) === 1).length})
            </button>
          </div>
        </div>

        {/* Search Chương */}
        <div className="alignright search-box-wrapper">
          <div className="wp-search-box">
            <FaSearch className="search-icon" />
            <input
              type="search"
              className="wp-search-input"
              placeholder="Tìm tên hoặc số chương..."
              value={searchChapter}
              onChange={(e) => setSearchChapter(e.target.value)}
            />
            {searchChapter && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => setSearchChapter("")}
                title="Xóa tìm kiếm"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* WordPress Chapters Table */}
      <div className="wp-table-container">
        <table className="wp-list-table widefat fixed striped chapters">
          <thead>
            <tr>
              <th className="manage-column column-number">STT</th>
              <th className="manage-column column-title column-primary">Tên chương truyện</th>
              <th className="manage-column column-vip">Quyền truy cập</th>
              <th className="manage-column column-audio">Trình phát Audio</th>
              <th className="manage-column column-author">Người đăng</th>
              <th className="manage-column column-date">Ngày đăng</th>
              <th className="manage-column column-actions text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {!selectedStoryId ? (
              <tr>
                <td colSpan="7" className="wp-no-items">
                  <div className="empty-box">
                    <FaBook className="empty-icon" />
                    <p className="empty-text">Vui lòng chọn một bộ truyện ở trên để xem danh sách chương.</p>
                  </div>
                </td>
              </tr>
            ) : loadingChapters ? (
              <tr>
                <td colSpan="7" className="wp-loading-cell">
                  <div className="wp-spinner-wrap">
                    <div className="wp-spinner"></div>
                    <p>Đang tải danh sách chương...</p>
                  </div>
                </td>
              </tr>
            ) : filteredChapters.length > 0 ? (
              filteredChapters.map((ch) => {
                const isVip = parseInt(ch.is_vip) === 1;

                return (
                  <tr key={ch.id} className="chapter-row">
                    {/* STT / Chapter Number */}
                    <td className="column-number">
                      <span className="chapter-num-badge">
                        Chương {ch.chapter_number}
                      </span>
                    </td>

                    {/* Chapter Name */}
                    <td className="column-title column-primary">
                      <strong className="row-title">
                        {ch.chapter_name}
                      </strong>
                    </td>

                    {/* Access Level (Free / VIP) */}
                    <td className="column-vip">
                      {isVip ? (
                        <span className="badge-vip-status vip">
                          <FaCrown /> Gói VIP
                        </span>
                      ) : (
                        <span className="badge-vip-status free">
                          <FaUnlock /> Miễn phí
                        </span>
                      )}
                    </td>

                    {/* HTML5 Audio Player Mini */}
                    <td className="column-audio">
                      <div className="wp-audio-player-wrapper">
                        <audio
                          controls
                          src={ch.audio_url}
                          preload="metadata"
                          className="wp-audio-element"
                        >
                          Trình duyệt không hỗ trợ nghe trực tuyến.
                        </audio>
                      </div>
                    </td>

                    {/* Author Post */}
                    <td className="column-author">
                      <span className="author-tag">
                        {ch.author_post || "Admin"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="column-date">
                      <span className="date-text">
                        <FaCalendarAlt className="date-icon" />
                        {ch.created_at
                          ? new Date(ch.created_at).toLocaleDateString("vi-VN")
                          : "—"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="column-actions text-right">
                      <button
                        type="button"
                        className="button-delete-chapter"
                        onClick={() => handleDeleteChapter(ch.id, ch.chapter_name)}
                        disabled={deleteMutation.isPending}
                        title="Xóa chương này"
                      >
                        <FaTrashAlt /> Xóa
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="wp-no-items">
                  <div className="empty-box">
                    <FaMusic className="empty-icon" />
                    <p className="empty-text">
                      {searchChapter || filterVip !== "all"
                        ? "Không tìm thấy chương nào phù hợp với bộ lọc."
                        : "Bộ truyện này hiện chưa có chương nào."}
                    </p>
                    <span className="empty-sub">
                      Bấm nút "Tải lên audio (MP3)" hoặc "Studio Giọng đọc AI" để thêm chương đầu tiên!
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>

          <tfoot>
            <tr>
              <th className="manage-column column-number">STT</th>
              <th className="manage-column column-title column-primary">Tên chương truyện</th>
              <th className="manage-column column-vip">Quyền truy cập</th>
              <th className="manage-column column-audio">Trình phát Audio</th>
              <th className="manage-column column-author">Người đăng</th>
              <th className="manage-column column-date">Ngày đăng</th>
              <th className="manage-column column-actions text-right">Thao tác</th>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* WordPress Tablenav Bottom */}
      <div className="wp-tablenav bottom">
        <div className="tablenav-pages">
          <span className="displaying-num">
            {filteredChapters.length} chương truyện
          </span>
        </div>
      </div>

      {/* Modal Tải lên chương audio kiểu WordPress */}
      {isModalOpen && (
        <div className="wp-modal-backdrop">
          <div className="wp-upload-chapter-modal">
            <div className="modal-header">
              <h3>
                <FaCloudUploadAlt /> Tải lên chương audio mới
              </h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Bộ truyện đã chọn */}
                <div className="form-field">
                  <label>Bộ truyện</label>
                  <div className="selected-story-display">
                    <strong>{currentStory?.title || "Chưa chọn bộ truyện"}</strong>
                  </div>
                </div>

                {/* Tên chương */}
                <div className="form-field">
                  <label>
                    Tên chương truyện <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="wp-input"
                    placeholder="Ví dụ: Chương 1: Tiết tử / Chương 1: Khởi đầu"
                    value={formData.chapter_name}
                    onChange={(e) =>
                      setFormData({ ...formData, chapter_name: e.target.value })
                    }
                    required
                  />
                  <p className="description">
                    Số thứ tự chương sẽ được hệ thống tự động cộng dồn theo bộ truyện.
                  </p>
                </div>

                {/* Quyền xem VIP / Free */}
                <div className="form-field">
                  <label>Quyền truy cập của thính giả</label>
                  <div className="vip-toggle-options">
                    <label className={`radio-card ${formData.is_vip === 0 ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="is_vip"
                        value="0"
                        checked={formData.is_vip === 0}
                        onChange={() => setFormData({ ...formData, is_vip: 0 })}
                      />
                      <div className="radio-content">
                        <span className="radio-title">
                          <FaUnlock /> Độc giả miễn phí
                        </span>
                        <span className="radio-desc">Tất cả người nghe đều có thể nghe</span>
                      </div>
                    </label>

                    <label className={`radio-card ${formData.is_vip === 1 ? "selected vip" : ""}`}>
                      <input
                        type="radio"
                        name="is_vip"
                        value="1"
                        checked={formData.is_vip === 1}
                        onChange={() => setFormData({ ...formData, is_vip: 1 })}
                      />
                      <div className="radio-content">
                        <span className="radio-title">
                          <FaCrown /> Chỉ dành cho Hội viên VIP
                        </span>
                        <span className="radio-desc">Yêu cầu người nghe có gói hội viên còn hạn</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Tệp âm thanh upload */}
                <div className="form-field">
                  <label>
                    Tệp âm thanh (Audio file) <span className="req">*</span>
                  </label>
                  <div className="audio-upload-dropzone">
                    <input
                      type="file"
                      id="chapter-audio-input"
                      accept="audio/*,.mp3,.wav,.m4a,.aac"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    <label htmlFor="chapter-audio-input" className="dropzone-label">
                      <FaCloudUploadAlt className="dropzone-icon" />
                      <span className="dropzone-title">
                        {formData.audio_file
                          ? formData.audio_file.name
                          : "Nhấp để chọn tệp âm thanh hoặc kéo thả vào đây"}
                      </span>
                      <span className="dropzone-hint">
                        Hỗ trợ MP3, WAV, M4A, AAC (Dung lượng tối đa 50MB)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="button btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="button button-primary btn-upload"
                  disabled={addMutation.isPending}
                >
                  <FaCheck /> {addMutation.isPending ? "Đang tải lên..." : "Bắt đầu tải lên"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ChapterManagement);