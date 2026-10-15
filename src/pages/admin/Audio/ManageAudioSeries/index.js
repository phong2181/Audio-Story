import { memo, useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaBook,
  FaTimes,
  FaCheck,
  FaUser,
  FaImage,
  FaListAlt,
  FaEye,
  FaExternalLinkAlt,
  FaSyncAlt,
  FaHeadphones,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaTag,
} from "react-icons/fa";
import {
  useGetStoriesAD,
  useAddStoryAD,
  useUpdateStoryAD,
  useDeleteStoryAD,
  useGetCategoriesAudioAD,
} from "api/homePage";
import { getAdminInfo } from "utils/adminAuth";
import toast, { Toaster } from "react-hot-toast";
import { STORAGE_URL } from "config/config";
import { ROUTES } from "utils/route";
import "./style.scss";

const StoryManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Đọc query param ?category=... nếu được chuyển từ trang Thể loại
  const queryParams = new URLSearchParams(location.search);
  const initialCategoryFilter = queryParams.get("category") || "all";

  // State
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'updating' | 'completed'
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryFilter);
  const [selectedStoryIds, setSelectedStoryIds] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [storiesPerPage, setStoriesPerPage] = useState(15);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editStory, setEditStory] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category_id: "",
    status: "updating",
    summary: "",
    description: "",
    thumbnail: null,
  });
  const [previewImage, setPreviewImage] = useState(null);

  // Queries & Mutations
  const {
    data: rawStories = [],
    isLoading: loadingStories,
    isFetching,
    refetch,
  } = useGetStoriesAD();
  const { data: rawCategories = [] } = useGetCategoriesAudioAD();
  const addMutation = useAddStoryAD();
  const updateMutation = useUpdateStoryAD();
  const deleteMutation = useDeleteStoryAD();
  const adminInfo = getAdminInfo();

  useEffect(() => {
    document.title = "Quản lý bộ truyện Audio ‹ Quản trị";
  }, []);

  // Chuẩn hóa dữ liệu
  const stories = useMemo(() => {
    if (!rawStories) return [];
    if (Array.isArray(rawStories)) return rawStories;
    if (Array.isArray(rawStories.data)) return rawStories.data;
    return [];
  }, [rawStories]);

  const categories = useMemo(() => {
    if (!rawCategories) return [];
    if (Array.isArray(rawCategories)) return rawCategories;
    if (Array.isArray(rawCategories.data)) return rawCategories.data;
    return [];
  }, [rawCategories]);

  // Đếm theo trạng thái
  const counts = useMemo(() => {
    const total = stories.length;
    const updating = stories.filter((s) => s.status === "updating").length;
    const completed = stories.filter((s) => s.status === "completed").length;
    return { total, updating, completed };
  }, [stories]);

  // Lọc danh sách truyện
  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      // Lọc theo tab trạng thái
      if (activeTab === "updating" && story.status !== "updating") return false;
      if (activeTab === "completed" && story.status !== "completed") return false;

      // Lọc theo thể loại
      if (selectedCategory !== "all") {
        const catId = story.category_audio_id || story.category?.id;
        if (String(catId) !== String(selectedCategory)) return false;
      }

      // Lọc theo tìm kiếm
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const titleMatch = story.title?.toLowerCase().includes(query);
        const authorMatch = story.author?.toLowerCase().includes(query);
        const summaryMatch = story.summary?.toLowerCase().includes(query);
        if (!titleMatch && !authorMatch && !summaryMatch) return false;
      }

      return true;
    });
  }, [stories, activeTab, selectedCategory, searchTerm]);

  // Reset trang khi lọc
  useEffect(() => {
    setCurrentPage(1);
    setSelectedStoryIds([]);
  }, [activeTab, selectedCategory, searchTerm]);

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(filteredStories.length / storiesPerPage));
  const indexOfLastStory = currentPage * storiesPerPage;
  const indexOfFirstStory = indexOfLastStory - storiesPerPage;
  const currentStories = filteredStories.slice(indexOfFirstStory, indexOfLastStory);

  // Helper ảnh bìa
  const getThumbnailUrl = (thumbnail) => {
    if (!thumbnail) return "/placeholder.png";
    if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
      return thumbnail;
    }
    return `${STORAGE_URL}${thumbnail}`;
  };

  // Mở modal thêm / sửa
  const handleOpenModal = (story = null) => {
    if (story) {
      setEditStory(story);
      setFormData({
        title: story.title || "",
        author: story.author || "",
        category_id: story.category_audio_id || story.category?.id || "",
        status: story.status || "updating",
        summary: story.summary || "",
        description: story.description || "",
        thumbnail: null,
      });
      setPreviewImage(getThumbnailUrl(story.thumbnail));
    } else {
      setEditStory(null);
      setFormData({
        title: "",
        author: adminInfo?.name || adminInfo?.username || "",
        category_id: categories[0]?.id || "",
        status: "updating",
        summary: "",
        description: "",
        thumbnail: null,
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
      setFormData((prev) => ({ ...prev, thumbnail: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Submit Modal Form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tên bộ truyện!");
      return;
    }
    if (!formData.category_id) {
      toast.error("Vui lòng chọn thể loại cho bộ truyện!");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title.trim());
    data.append("author", formData.author.trim() || "Chưa rõ");
    data.append("category_audio_id", formData.category_id);
    data.append("status", formData.status);
    data.append("summary", formData.summary.trim() || "");
    data.append("description", formData.description.trim() || "");

    if (formData.thumbnail) {
      data.append("thumbnail", formData.thumbnail);
    }

    if (editStory) {
      data.append("_method", "PUT");
      toast.promise(
        updateMutation.mutateAsync({ id: editStory.id, data }),
        {
          loading: "Đang lưu thông tin bộ truyện...",
          success: "Đã cập nhật bộ truyện thành công!",
          error: (err) => err.response?.data?.message || "Lỗi khi cập nhật bộ truyện!",
        },
        { position: "top-right" }
      );
    } else {
      toast.promise(
        addMutation.mutateAsync(data),
        {
          loading: "Đang tạo bộ truyện mới...",
          success: "Đã tạo bộ truyện mới thành công!",
          error: (err) => err.response?.data?.message || "Lỗi khi tạo bộ truyện!",
        },
        { position: "top-right" }
      );
    }

    closeModal();
  };

  // Xóa bộ truyện đơn lẻ
  const handleDelete = (id, title) => {
    toast(
      (t) => (
        <div className="wp-confirm-dialog">
          <div className="confirm-icon">⚠️</div>
          <div className="confirm-body">
            <h4 className="confirm-title">Xóa bộ truyện?</h4>
            <p className="confirm-desc">
              Bạn có chắc chắn muốn xóa bộ truyện "<strong>{title}</strong>"? Tất cả các chương truyện liên quan cũng sẽ bị xóa vĩnh viễn.
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
                  deleteMutation.mutateAsync(id),
                  {
                    loading: "Đang xóa bộ truyện...",
                    success: "Đã xóa bộ truyện thành công!",
                    error: (err) => err.response?.data?.message || "Không thể xóa bộ truyện!",
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

  // Checkbox chọn tất cả
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStoryIds(currentStories.map((s) => s.id));
    } else {
      setSelectedStoryIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedStoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Hành động hàng loạt
  const handleApplyBulkAction = () => {
    if (selectedStoryIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một bộ truyện!");
      return;
    }

    if (bulkAction === "delete") {
      toast(
        (t) => (
          <div className="wp-confirm-dialog">
            <div className="confirm-icon">⚠️</div>
            <div className="confirm-body">
              <h4 className="confirm-title">
                Xóa {selectedStoryIds.length} bộ truyện đã chọn?
              </h4>
              <p className="confirm-desc">
                Hành động này sẽ xóa toàn bộ các bộ truyện đã chọn và các chương truyện tương ứng.
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
                onClick={async () => {
                  toast.dismiss(t.id);
                  const deletePromises = selectedStoryIds.map((id) =>
                    deleteMutation.mutateAsync(id)
                  );
                  toast.promise(
                    Promise.all(deletePromises),
                    {
                      loading: `Đang xóa ${selectedStoryIds.length} bộ truyện...`,
                      success: `Đã xóa ${selectedStoryIds.length} bộ truyện thành công!`,
                      error: "Lỗi khi xóa một số bộ truyện!",
                    },
                    { position: "top-right" }
                  );
                  setSelectedStoryIds([]);
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        ),
        { duration: 6000, position: "top-center" }
      );
    } else {
      toast.error("Vui lòng chọn hành động muốn thực hiện");
    }
  };

  // Chuyển sang trang Quản lý chương của bộ truyện đó
  const handleManageChapters = (storyId) => {
    navigate(`${ROUTES.ADMIN.AUDIO_ADD}?story_id=${storyId}`);
  };

  return (
    <div className="wp-stories-page">
      <Toaster position="top-right" reverseOrder={false} />

      {/* WordPress Admin Header */}
      <div className="wp-page-header">
        <div className="wp-header-title-row">
          <h1 className="wp-page-title">
            <FaBook className="title-icon" />
            Bộ truyện Audio
          </h1>
          <button
            className="wp-button-action"
            onClick={() => handleOpenModal()}
          >
            <FaPlus /> Thêm bộ truyện mới
          </button>
          {isFetching && !loadingStories && (
            <span className="wp-refreshing-badge">
              <FaSyncAlt className="spin" /> Đang đồng bộ...
            </span>
          )}
        </div>

        {/* Sub-navigation Status Tabs */}
        <div className="wp-subsubsub">
          <button
            className={`tab-link ${activeTab === "all" ? "current" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Tất cả <span className="count">({counts.total})</span>
          </button>
          <span className="separator">|</span>
          <button
            className={`tab-link ${activeTab === "updating" ? "current" : ""}`}
            onClick={() => setActiveTab("updating")}
          >
            Đang cập nhật <span className="count">({counts.updating})</span>
          </button>
          <span className="separator">|</span>
          <button
            className={`tab-link ${activeTab === "completed" ? "current" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            Đã hoàn thành <span className="count">({counts.completed})</span>
          </button>
        </div>
      </div>

      {/* WordPress Tablenav Top (Filters & Search) */}
      <div className="wp-tablenav top">
        <div className="alignleft actions bulkactions">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="wp-select"
          >
            <option value="">Hành động hàng loạt</option>
            <option value="delete">Xóa bộ truyện</option>
          </select>
          <button
            type="button"
            className="button action"
            onClick={handleApplyBulkAction}
          >
            Áp dụng
          </button>

          {/* Lọc thể loại */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="wp-select category-filter"
          >
            <option value="all">Tất cả thể loại truyện</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="alignright search-box-wrapper">
          <div className="wp-search-box">
            <FaSearch className="search-icon" />
            <input
              type="search"
              className="wp-search-input"
              placeholder="Tìm tên truyện, tác giả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => setSearchTerm("")}
                title="Xóa tìm kiếm"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(selectedCategory !== "all" || searchTerm) && (
        <div className="wp-filter-tags">
          <span className="tag-label">Đang lọc:</span>
          {selectedCategory !== "all" && (
            <span className="filter-pill">
              Thể loại:{" "}
              <strong>
                {categories.find((c) => String(c.id) === String(selectedCategory))?.name || selectedCategory}
              </strong>
              <button onClick={() => setSelectedCategory("all")}>×</button>
            </span>
          )}
          {searchTerm && (
            <span className="filter-pill">
              Từ khóa: "<strong>{searchTerm}</strong>"
              <button onClick={() => setSearchTerm("")}>×</button>
            </span>
          )}
          <button
            className="clear-all-link"
            onClick={() => {
              setSelectedCategory("all");
              setSearchTerm("");
            }}
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* WordPress Table */}
      <div className="wp-table-container">
        <table className="wp-list-table widefat fixed striped stories">
          <thead>
            <tr>
              <td className="manage-column column-cb check-column">
                <input
                  type="checkbox"
                  checked={
                    currentStories.length > 0 &&
                    currentStories.every((s) => selectedStoryIds.includes(s.id))
                  }
                  onChange={handleSelectAll}
                />
              </td>
              <th className="manage-column column-thumb">Bìa truyện</th>
              <th className="manage-column column-title column-primary">
                Tên bộ truyện
              </th>
              <th className="manage-column column-author">Tác giả</th>
              <th className="manage-column column-categories">Thể loại</th>
              <th className="manage-column column-chapters num">Số chương</th>
              <th className="manage-column column-status">Trạng thái</th>
              <th className="manage-column column-date">Cập nhật</th>
            </tr>
          </thead>

          <tbody>
            {loadingStories ? (
              <tr>
                <td colSpan="8" className="wp-loading-cell">
                  <div className="wp-spinner-wrap">
                    <div className="wp-spinner"></div>
                    <p>Đang tải danh sách bộ truyện...</p>
                  </div>
                </td>
              </tr>
            ) : currentStories.length > 0 ? (
              currentStories.map((story) => {
                const isSelected = selectedStoryIds.includes(story.id);
                const chapterCount = story.chapters_count ?? 0;
                const isUpdating = story.status === "updating";

                return (
                  <tr
                    key={story.id}
                    className={`story-row ${isSelected ? "selected-row" : ""}`}
                  >
                    {/* Checkbox */}
                    <th scope="row" className="check-column">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(story.id)}
                      />
                    </th>

                    {/* Thumbnail */}
                    <td className="column-thumb">
                      <div
                        className="wp-thumb-box"
                        onClick={() => handleOpenModal(story)}
                        title="Xem ảnh bìa"
                      >
                        <img
                          src={getThumbnailUrl(story.thumbnail)}
                          alt={story.title}
                          className="wp-story-thumb"
                          onError={(e) => {
                            e.target.src = "/placeholder.png";
                          }}
                        />
                      </div>
                    </td>

                    {/* Title & Row Actions */}
                    <td className="column-title column-primary">
                      <strong className="row-title">
                        <span
                          className="title-link"
                          onClick={() => handleOpenModal(story)}
                        >
                          {story.title}
                        </span>
                      </strong>

                      {story.summary && (
                        <p className="story-summary-snippet">
                          {story.summary.slice(0, 90)}
                          {story.summary.length > 90 ? "..." : ""}
                        </p>
                      )}

                      {/* Signature WordPress Row Actions */}
                      <div className="row-actions">
                        <span className="edit">
                          <button
                            type="button"
                            className="action-link edit-link"
                            onClick={() => handleOpenModal(story)}
                          >
                            Chỉnh sửa
                          </button>
                          <span className="pipe"> | </span>
                        </span>

                        <span className="chapters">
                          <button
                            type="button"
                            className="action-link chapter-link"
                            onClick={() => handleManageChapters(story.id)}
                          >
                            Quản lý chương ({chapterCount})
                          </button>
                          <span className="pipe"> | </span>
                        </span>

                        <span className="trash">
                          <button
                            type="button"
                            className="action-link delete-link"
                            onClick={() => handleDelete(story.id, story.title)}
                          >
                            Xóa
                          </button>
                          <span className="pipe"> | </span>
                        </span>

                        <span className="view">
                          <a
                            href={`/story/${story.slug || story.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-link view-link"
                          >
                            Xem truyện <FaExternalLinkAlt className="ext-icon" />
                          </a>
                        </span>
                      </div>
                    </td>

                    {/* Author */}
                    <td className="column-author">
                      <div className="author-cell">
                        <FaUser className="author-icon" />
                        <span>{story.author || "Chưa cập nhật"}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="column-categories">
                      <span className="category-badge">
                        <FaTag className="cat-icon" />
                        {story.category?.name || "Chưa phân loại"}
                      </span>
                    </td>

                    {/* Chapters Count */}
                    <td className="column-chapters num">
                      <button
                        className="chapters-count-pill"
                        onClick={() => handleManageChapters(story.id)}
                        title="Nhấp để xem và quản lý các chương"
                      >
                        <FaHeadphones className="pill-icon" /> {chapterCount} chương
                      </button>
                    </td>

                    {/* Status */}
                    <td className="column-status">
                      <span
                        className={`status-pill ${
                          isUpdating ? "pill-updating" : "pill-completed"
                        }`}
                      >
                        {isUpdating ? "Đang cập nhật" : "Hoàn thành"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="column-date">
                      <div className="date-cell">
                        <span className="date-time">
                          <FaCalendarAlt className="date-icon" />
                          {story.created_at
                            ? new Date(story.created_at).toLocaleDateString("vi-VN")
                            : "—"}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="wp-no-items">
                  <div className="empty-box">
                    <FaBook className="empty-icon" />
                    <p className="empty-text">Không tìm thấy bộ truyện nào phù hợp.</p>
                    <span className="empty-sub">
                      Thử thay đổi từ khóa tìm kiếm hoặc bấm "Thêm bộ truyện mới".
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>

          <tfoot>
            <tr>
              <td className="manage-column column-cb check-column">
                <input
                  type="checkbox"
                  checked={
                    currentStories.length > 0 &&
                    currentStories.every((s) => selectedStoryIds.includes(s.id))
                  }
                  onChange={handleSelectAll}
                />
              </td>
              <th className="manage-column column-thumb">Bìa truyện</th>
              <th className="manage-column column-title column-primary">
                Tên bộ truyện
              </th>
              <th className="manage-column column-author">Tác giả</th>
              <th className="manage-column column-categories">Thể loại</th>
              <th className="manage-column column-chapters num">Số chương</th>
              <th className="manage-column column-status">Trạng thái</th>
              <th className="manage-column column-date">Cập nhật</th>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* WordPress Tablenav Bottom with Pagination */}
      <div className="wp-tablenav bottom">
        <div className="alignleft actions bulkactions">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="wp-select"
          >
            <option value="">Hành động hàng loạt</option>
            <option value="delete">Xóa bộ truyện</option>
          </select>
          <button
            type="button"
            className="button action"
            onClick={handleApplyBulkAction}
          >
            Áp dụng
          </button>
        </div>

        <div className="tablenav-pages">
          <span className="displaying-num">{filteredStories.length} bộ truyện</span>
          {totalPages > 1 && (
            <span className="pagination-links">
              <button
                className="first-page button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                title="Trang đầu"
              >
                <FaAngleDoubleLeft />
              </button>
              <button
                className="prev-page button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                title="Trang trước"
              >
                <FaChevronLeft />
              </button>

              <span className="paging-input">
                <span className="current-page-text">{currentPage}</span> /{" "}
                <span className="total-pages">{totalPages}</span>
              </span>

              <button
                className="next-page button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                title="Trang tiếp"
              >
                <FaChevronRight />
              </button>
              <button
                className="last-page button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                title="Trang cuối"
              >
                <FaAngleDoubleRight />
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Modal Thêm / Sửa bộ truyện chuẩn WordPress */}
      {isModalOpen && (
        <div className="wp-modal-backdrop">
          <div className="wp-story-modal">
            <div className="story-modal-header">
              <h3>
                {editStory ? (
                  <>
                    <FaEdit /> Chỉnh sửa bộ truyện: {editStory.title}
                  </>
                ) : (
                  <>
                    <FaPlus /> Thêm bộ truyện mới
                  </>
                )}
              </h3>
              <button
                type="button"
                className="close-btn"
                onClick={closeModal}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="story-modal-body">
                <div className="form-grid">
                  {/* Cột trái form: Thông tin chữ */}
                  <div className="form-col-main">
                    <div className="form-field">
                      <label>
                        Tên bộ truyện <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        className="wp-input"
                        placeholder="Ví dụ: Phàm Nhân Tu Tiên"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-field col">
                        <label>Tác giả</label>
                        <input
                          type="text"
                          className="wp-input"
                          placeholder="Ví dụ: Vong Ngữ"
                          value={formData.author}
                          onChange={(e) =>
                            setFormData({ ...formData, author: e.target.value })
                          }
                        />
                      </div>

                      <div className="form-field col">
                        <label>
                          Thể loại <span className="req">*</span>
                        </label>
                        <select
                          className="wp-select"
                          value={formData.category_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category_id: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">-- Chọn thể loại --</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-field">
                      <label>Trạng thái phát hành</label>
                      <div className="radio-group">
                        <label className={`radio-pill ${formData.status === "updating" ? "active" : ""}`}>
                          <input
                            type="radio"
                            name="status"
                            value="updating"
                            checked={formData.status === "updating"}
                            onChange={() =>
                              setFormData({ ...formData, status: "updating" })
                            }
                          />
                          Đang cập nhật
                        </label>
                        <label className={`radio-pill ${formData.status === "completed" ? "active" : ""}`}>
                          <input
                            type="radio"
                            name="status"
                            value="completed"
                            checked={formData.status === "completed"}
                            onChange={() =>
                              setFormData({ ...formData, status: "completed" })
                            }
                          />
                          Đã hoàn thành
                        </label>
                      </div>
                    </div>

                    <div className="form-field">
                      <label>Tóm tắt ngắn (Summary)</label>
                      <textarea
                        rows={2}
                        className="wp-textarea"
                        placeholder="Tóm tắt ngắn gọn 1-2 câu về nội dung truyện..."
                        value={formData.summary}
                        onChange={(e) =>
                          setFormData({ ...formData, summary: e.target.value })
                        }
                      />
                    </div>

                    <div className="form-field">
                      <label>Giới thiệu chi tiết (Description)</label>
                      <textarea
                        rows={4}
                        className="wp-textarea"
                        placeholder="Nội dung giới thiệu chi tiết cốt truyện, nhân vật..."
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Cột phải form: Ảnh bìa truyện */}
                  <div className="form-col-side">
                    <div className="form-field">
                      <label>Ảnh bìa bộ truyện (Thumbnail)</label>
                      <div className="cover-upload-box">
                        {previewImage ? (
                          <div className="cover-preview-wrapper">
                            <img
                              src={previewImage}
                              alt="Cover preview"
                              className="cover-img-preview"
                            />
                            <button
                              type="button"
                              className="remove-img-btn"
                              onClick={() => {
                                setPreviewImage(null);
                                setFormData((prev) => ({ ...prev, thumbnail: null }));
                              }}
                              title="Gỡ ảnh này"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ) : (
                          <label className="upload-placeholder" htmlFor="story-cover-upload">
                            <FaImage className="upload-icon" />
                            <span className="upload-text">Chọn hoặc kéo ảnh vào đây</span>
                            <span className="upload-hint">PNG, JPG, JPEG (Tối đa 2MB)</span>
                          </label>
                        )}
                        <input
                          type="file"
                          id="story-cover-upload"
                          accept="image/*"
                          onChange={handleFileChange}
                          style={{ display: "none" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="story-modal-footer">
                <button
                  type="button"
                  className="button btn-cancel"
                  onClick={closeModal}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="button button-primary btn-save"
                  disabled={addMutation.isPending || updateMutation.isPending}
                >
                  <FaCheck />{" "}
                  {addMutation.isPending || updateMutation.isPending
                    ? "Đang lưu..."
                    : editStory
                    ? "Cập nhật bộ truyện"
                    : "Lưu bộ truyện"}
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