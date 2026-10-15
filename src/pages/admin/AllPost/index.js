import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaShare,
  FaPlus,
  FaFilter,
  FaTimes,
  FaExternalLinkAlt,
  FaCheck,
  FaLayerGroup,
  FaBookOpen,
  FaCalendarAlt,
  FaTag,
  FaUserAlt,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";
import {
  useGetAddNewPostListAD,
  useDeletePost,
  useGetCategoriesAD,
  useUptatePost,
} from "api/homePage/queries";
import toast, { Toaster } from "react-hot-toast";
import { STORAGE_URL } from "config/config";
import { ROUTES } from "utils/route";
import "./style.scss";

const AllPost = () => {
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'published' | 'draft'
  const [searchInput, setSearchInput] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(15);
  const [quickEditPost, setQuickEditPost] = useState(null);

  // Queries & Mutations
  const {
    data: rawPostsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAddNewPostListAD();
  const { data: categories = [] } = useGetCategoriesAD();
  const deletePostMutation = useDeletePost();
  const updatePostMutation = useUptatePost();

  useEffect(() => {
    document.title = "Tất cả bài viết ‹ Quản trị";
  }, []);

  // Chuẩn hóa danh sách bài viết từ server
  const allPosts = useMemo(() => {
    if (!rawPostsData) return [];
    if (Array.isArray(rawPostsData)) return rawPostsData;
    if (Array.isArray(rawPostsData.data)) return rawPostsData.data;
    return [];
  }, [rawPostsData]);

  // Đếm số lượng theo trạng thái
  const counts = useMemo(() => {
    const total = allPosts.length;
    const published = allPosts.filter((p) => p.status === "published").length;
    const draft = allPosts.filter((p) => p.status === "draft").length;
    return { total, published, draft };
  }, [allPosts]);

  // Lọc bài viết
  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      // Lọc theo tab trạng thái
      if (activeTab === "published" && post.status !== "published") return false;
      if (activeTab === "draft" && post.status !== "draft") return false;

      // Lọc theo chuyên mục
      if (selectedCategory !== "all") {
        const catId = post.category_id || post.category?.id;
        if (String(catId) !== String(selectedCategory)) return false;
      }

      // Lọc theo từ khóa tìm kiếm
      if (submittedSearch.trim()) {
        const query = submittedSearch.toLowerCase().trim();
        const titleMatch = post.title?.toLowerCase().includes(query);
        const descMatch = post.description?.toLowerCase().includes(query);
        const authorMatch = (post.author || post.user?.name || "")
          .toLowerCase()
          .includes(query);
        if (!titleMatch && !descMatch && !authorMatch) return false;
      }

      return true;
    });
  }, [allPosts, activeTab, selectedCategory, submittedSearch]);

  // Reset về trang 1 khi lọc
  useEffect(() => {
    setCurrentPage(1);
    setSelectedPosts([]);
  }, [activeTab, selectedCategory, submittedSearch]);

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / postsPerPage));
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  // Helper hiển thị tên tác giả
  const getAuthorName = (post) => {
    if (post.user?.name) return post.user.name;
    if (!post.author) return "Admin";
    if (typeof post.author === "object" && post.author?.name) return post.author.name;
    if (typeof post.author === "string" && isNaN(post.author)) return post.author;
    return `User #${post.author}`;
  };

  // Helper ảnh đại diện
  const getThumbnailUrl = (avatarPost) => {
    if (!avatarPost) return "/placeholder.png";
    if (avatarPost.startsWith("http://") || avatarPost.startsWith("https://")) {
      return avatarPost;
    }
    return `${STORAGE_URL}/${avatarPost}`;
  };

  // Helper tên chuyên mục
  const getCategoryName = (post) => {
    if (post.category?.name) return post.category.name;
    const found = categories.find(
      (c) => String(c.id) === String(post.category_id)
    );
    return found?.name || "Chưa phân loại";
  };

  // Xử lý chuyển hướng sửa bài
  const handleEdit = (post) => {
    navigate(`/admin/edit-posts/${post.id}`, { state: { post } });
  };

  // Xử lý tìm kiếm
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setSubmittedSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSubmittedSearch("");
  };

  // Checkbox chọn tất cả
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPosts(currentPosts.map((p) => p.id));
    } else {
      setSelectedPosts([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedPosts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Xóa bài viết đơn lẻ
  const handleDelete = (id, title) => {
    toast(
      (t) => (
        <div className="wp-confirm-dialog">
          <div className="confirm-icon">⚠️</div>
          <div className="confirm-body">
            <h4 className="confirm-title">Bỏ bài viết vào thùng rác?</h4>
            <p className="confirm-desc">
              Bạn có chắc chắn muốn xóa bài viết "
              <strong>{title?.slice(0, 45)}{title?.length > 45 ? "..." : ""}</strong>"?
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
                executeDelete(id);
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

  const executeDelete = (id) => {
    toast.promise(
      deletePostMutation.mutateAsync(id),
      {
        loading: "Đang xóa bài viết...",
        success: "Đã xóa bài viết thành công!",
        error: (err) => err.response?.data?.message || "Không thể xóa bài viết!",
      },
      { position: "top-right" }
    );
  };

  // Xử lý hành động hàng loạt (Bulk actions)
  const handleApplyBulkAction = () => {
    if (selectedPosts.length === 0) {
      toast.error("Vui lòng chọn ít nhất một bài viết!");
      return;
    }

    if (bulkAction === "delete") {
      toast(
        (t) => (
          <div className="wp-confirm-dialog">
            <div className="confirm-icon">⚠️</div>
            <div className="confirm-body">
              <h4 className="confirm-title">
                Xóa {selectedPosts.length} bài viết đã chọn?
              </h4>
              <p className="confirm-desc">
                Hành động này sẽ xóa toàn bộ các bài viết đã được tích chọn.
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
                  const deletePromises = selectedPosts.map((id) =>
                    deletePostMutation.mutateAsync(id)
                  );
                  toast.promise(
                    Promise.all(deletePromises),
                    {
                      loading: `Đang xóa ${selectedPosts.length} bài viết...`,
                      success: `Đã xóa ${selectedPosts.length} bài viết thành công!`,
                      error: "Lỗi khi xóa bài viết!",
                    },
                    { position: "top-right" }
                  );
                  setSelectedPosts([]);
                }}
              >
                Xác nhận xóa
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

  // Sửa nhanh (Quick Edit)
  const handleOpenQuickEdit = (post) => {
    setQuickEditPost({
      id: post.id,
      title: post.title,
      category_id: post.category_id || post.category?.id || "",
      status: post.status || "draft",
      description: post.description || "",
      author: post.author || "Admin",
      authorType: post.authorType || "real",
      content: post.content || "",
    });
  };

  const handleSaveQuickEdit = async (e) => {
    e.preventDefault();
    if (!quickEditPost.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài viết!");
      return;
    }

    const formData = new FormData();
    formData.append("title", quickEditPost.title);
    if (quickEditPost.category_id) {
      formData.append("category_id", quickEditPost.category_id);
    }
    formData.append("status", quickEditPost.status);
    formData.append("description", quickEditPost.description || "Nội dung bài viết");
    formData.append("author", quickEditPost.author || "Admin");
    formData.append("authorType", quickEditPost.authorType || "real");
    if (quickEditPost.content) {
      formData.append("content", quickEditPost.content);
    }
    formData.append("_method", "PUT");

    toast.promise(
      updatePostMutation.mutateAsync({
        id: quickEditPost.id,
        data: formData,
      }),
      {
        loading: "Đang lưu thay đổi...",
        success: "Đã cập nhật bài viết thành công!",
        error: (err) => err.response?.data?.message || "Lỗi khi cập nhật!",
      },
      { position: "top-right" }
    );
    setQuickEditPost(null);
  };

  return (
    <div className="wp-allpost-page">
      <Toaster position="top-right" reverseOrder={false} />

      {/* WordPress Admin Header */}
      <div className="wp-page-header">
        <div className="wp-header-title-row">
          <h1 className="wp-page-title">
            <FaBookOpen className="title-icon" />
            Bài viết
          </h1>
          <button
            className="wp-button-action"
            onClick={() => navigate(ROUTES.ADMIN.POSTS_ADD)}
          >
            <FaPlus /> Viết bài mới
          </button>
          {isFetching && !isLoading && (
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
            className={`tab-link ${activeTab === "published" ? "current" : ""}`}
            onClick={() => setActiveTab("published")}
          >
            Đã xuất bản <span className="count">({counts.published})</span>
          </button>
          <span className="separator">|</span>
          <button
            className={`tab-link ${activeTab === "draft" ? "current" : ""}`}
            onClick={() => setActiveTab("draft")}
          >
            Bản nháp <span className="count">({counts.draft})</span>
          </button>
        </div>
      </div>

      {/* WordPress Action & Filter Bar */}
      <div className="wp-tablenav top">
        {/* Bulk Actions & Category Filter */}
        <div className="alignleft actions bulkactions">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="wp-select"
          >
            <option value="">Hành động hàng loạt</option>
            <option value="delete">Bỏ vào thùng rác</option>
          </select>
          <button
            type="button"
            className="button action"
            onClick={handleApplyBulkAction}
          >
            Áp dụng
          </button>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="wp-select category-filter"
          >
            <option value="all">Tất cả chuyên mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search Box on Right */}
        <div className="alignright search-box-wrapper">
          <form onSubmit={handleSearchSubmit} className="wp-search-form">
            <div className="search-input-group">
              <FaSearch className="search-icon" />
              <input
                type="search"
                className="wp-search-input"
                placeholder="Tìm bài viết..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={handleClearSearch}
                  title="Xóa tìm kiếm"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            <button type="submit" className="button search-submit">
              Tìm bài viết
            </button>
          </form>
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(selectedCategory !== "all" || submittedSearch) && (
        <div className="wp-filter-tags">
          <span className="tag-label">Đang lọc:</span>
          {selectedCategory !== "all" && (
            <span className="filter-pill">
              Chuyên mục:{" "}
              <strong>
                {categories.find((c) => String(c.id) === String(selectedCategory))?.name || selectedCategory}
              </strong>
              <button onClick={() => setSelectedCategory("all")}>×</button>
            </span>
          )}
          {submittedSearch && (
            <span className="filter-pill">
              Từ khóa: "<strong>{submittedSearch}</strong>"
              <button onClick={handleClearSearch}>×</button>
            </span>
          )}
          <button
            className="clear-all-link"
            onClick={() => {
              setSelectedCategory("all");
              handleClearSearch();
            }}
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}

      {/* WordPress List Table */}
      <div className="wp-table-container">
        <table className="wp-list-table widefat fixed striped posts">
          <thead>
            <tr>
              <td className="manage-column column-cb check-column">
                <input
                  type="checkbox"
                  checked={
                    currentPosts.length > 0 &&
                    currentPosts.every((p) => selectedPosts.includes(p.id))
                  }
                  onChange={handleSelectAll}
                />
              </td>
              <th className="manage-column column-thumb">Hình ảnh</th>
              <th className="manage-column column-title column-primary">
                Tiêu đề
              </th>
              <th className="manage-column column-author">Tác giả</th>
              <th className="manage-column column-categories">Chuyên mục</th>
              <th className="manage-column column-stats">Lượt xem & Chia sẻ</th>
              <th className="manage-column column-date">Ngày đăng</th>
            </tr>
          </thead>

          <tbody id="the-list">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="wp-loading-cell">
                  <div className="wp-spinner-wrap">
                    <div className="wp-spinner"></div>
                    <p>Đang tải danh sách bài viết...</p>
                  </div>
                </td>
              </tr>
            ) : currentPosts.length > 0 ? (
              currentPosts.map((post) => {
                const isSelected = selectedPosts.includes(post.id);
                const isDraft = post.status === "draft";

                return (
                  <tr
                    key={post.id}
                    className={`post-row ${isSelected ? "selected-row" : ""} ${
                      isDraft ? "status-draft" : "status-publish"
                    }`}
                  >
                    {/* Checkbox */}
                    <th scope="row" className="check-column">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(post.id)}
                      />
                    </th>

                    {/* Thumbnail */}
                    <td className="column-thumb">
                      <div
                        className="wp-thumb-box"
                        onClick={() => handleEdit(post)}
                      >
                        <img
                          src={getThumbnailUrl(post.avatar_post)}
                          alt={post.title}
                          className="wp-post-thumb"
                          onError={(e) => {
                            e.target.src = "/placeholder.png";
                          }}
                        />
                      </div>
                    </td>

                    {/* Title & Quick Actions */}
                    <td className="column-title column-primary">
                      <strong className="row-title">
                        <span
                          className="title-link"
                          onClick={() => handleEdit(post)}
                        >
                          {post.title}
                        </span>
                        {isDraft && (
                          <span className="post-state"> — Bản nháp</span>
                        )}
                      </strong>

                      {/* Signature WordPress Row Actions */}
                      <div className="row-actions">
                        <span className="edit">
                          <button
                            type="button"
                            className="action-link edit-link"
                            onClick={() => handleEdit(post)}
                          >
                            Chỉnh sửa
                          </button>
                          <span className="pipe"> | </span>
                        </span>

                        <span className="inline hide-if-no-js">
                          <button
                            type="button"
                            className="action-link quick-edit-link"
                            onClick={() => handleOpenQuickEdit(post)}
                          >
                            Sửa nhanh
                          </button>
                          <span className="pipe"> | </span>
                        </span>

                        <span className="trash">
                          <button
                            type="button"
                            className="action-link delete-link"
                            onClick={() => handleDelete(post.id, post.title)}
                          >
                            Xóa vĩnh viễn
                          </button>
                          <span className="pipe"> | </span>
                        </span>

                        <span className="view">
                          <a
                            href={`/post/${post.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-link view-link"
                          >
                            Xem <FaExternalLinkAlt className="ext-icon" />
                          </a>
                        </span>
                      </div>
                    </td>

                    {/* Author */}
                    <td className="column-author">
                      <div className="author-cell">
                        <FaUserAlt className="author-icon" />
                        <span>{getAuthorName(post)}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="column-categories">
                      <span className="category-badge">
                        <FaTag className="cat-icon" />
                        {getCategoryName(post)}
                      </span>
                    </td>

                    {/* Stats */}
                    <td className="column-stats">
                      <div className="stats-badges">
                        <span className="stat-pill views" title="Lượt xem">
                          <FaEye /> {post.views || 0}
                        </span>
                        <span className="stat-pill shares" title="Lượt chia sẻ">
                          <FaShare /> {post.shares || 0}
                        </span>
                      </div>
                    </td>

                    {/* Date & Status */}
                    <td className="column-date">
                      <div className="date-cell">
                        <span
                          className={`status-pill ${
                            isDraft ? "pill-draft" : "pill-published"
                          }`}
                        >
                          {isDraft ? "Bản nháp" : "Đã xuất bản"}
                        </span>
                        <span className="date-time">
                          <FaCalendarAlt className="date-icon" />
                          {post.created_at
                            ? new Date(post.created_at).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              })
                            : "—"}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="wp-no-items">
                  <div className="empty-box">
                    <FaBookOpen className="empty-icon" />
                    <p className="empty-text">Không tìm thấy bài viết nào phù hợp.</p>
                    <span className="empty-sub">
                      Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc.
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
                    currentPosts.length > 0 &&
                    currentPosts.every((p) => selectedPosts.includes(p.id))
                  }
                  onChange={handleSelectAll}
                />
              </td>
              <th className="manage-column column-thumb">Hình ảnh</th>
              <th className="manage-column column-title column-primary">
                Tiêu đề
              </th>
              <th className="manage-column column-author">Tác giả</th>
              <th className="manage-column column-categories">Chuyên mục</th>
              <th className="manage-column column-stats">Lượt xem & Chia sẻ</th>
              <th className="manage-column column-date">Ngày đăng</th>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* WordPress Bottom Tablenav with Pagination */}
      <div className="wp-tablenav bottom">
        <div className="alignleft actions bulkactions">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="wp-select"
          >
            <option value="">Hành động hàng loạt</option>
            <option value="delete">Bỏ vào thùng rác</option>
          </select>
          <button
            type="button"
            className="button action"
            onClick={handleApplyBulkAction}
          >
            Áp dụng
          </button>
        </div>

        {/* WordPress Style Pagination */}
        <div className="tablenav-pages">
          <span className="displaying-num">
            {filteredPosts.length} mục
          </span>
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

      {/* Quick Edit (Sửa nhanh) Modal */}
      {quickEditPost && (
        <div className="wp-modal-backdrop">
          <div className="wp-quick-edit-modal">
            <div className="quick-edit-header">
              <h3>
                <FaEdit /> Sửa nhanh bài viết
              </h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setQuickEditPost(null)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveQuickEdit}>
              <div className="quick-edit-body">
                <div className="form-field">
                  <label>Tiêu đề bài viết <span className="req">*</span></label>
                  <input
                    type="text"
                    className="wp-input"
                    value={quickEditPost.title}
                    onChange={(e) =>
                      setQuickEditPost({ ...quickEditPost, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-field col">
                    <label>Chuyên mục</label>
                    <select
                      className="wp-select"
                      value={quickEditPost.category_id}
                      onChange={(e) =>
                        setQuickEditPost({
                          ...quickEditPost,
                          category_id: e.target.value,
                        })
                      }
                    >
                      <option value="">-- Chưa phân loại --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field col">
                    <label>Trạng thái</label>
                    <select
                      className="wp-select"
                      value={quickEditPost.status}
                      onChange={(e) =>
                        setQuickEditPost({
                          ...quickEditPost,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="published">Đã xuất bản (Published)</option>
                      <option value="draft">Bản nháp (Draft)</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label>Tóm tắt / Mô tả ngắn</label>
                  <textarea
                    rows={3}
                    className="wp-textarea"
                    value={quickEditPost.description}
                    onChange={(e) =>
                      setQuickEditPost({
                        ...quickEditPost,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="quick-edit-footer">
                <button
                  type="button"
                  className="button btn-cancel"
                  onClick={() => setQuickEditPost(null)}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="button button-primary btn-save"
                  disabled={updatePostMutation.isPending}
                >
                  <FaCheck /> {updatePostMutation.isPending ? "Đang lưu..." : "Cập nhật bài viết"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPost;