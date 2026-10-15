import { memo, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaCheck,
  FaExternalLinkAlt,
  FaSyncAlt,
  FaListUl,
  FaBook,
} from "react-icons/fa";
import {
  useGetCategoriesAudioAD,
  useAddCategoryAudioAD,
  useUpdateCategoryAudioAD,
  useDeleteCategoryAudioAD,
} from "api/homePage/queries";
import toast, { Toaster } from "react-hot-toast";
import { ROUTES } from "utils/route";
import "./style.scss";

// Utility tạo slug chuẩn tiếng Việt
const generateSlug = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const CategoryManagement = () => {
  const navigate = useNavigate();

  // State
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState("");

  // Queries & Mutations
  const {
    data: rawCategories = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetCategoriesAudioAD();
  const addMutation = useAddCategoryAudioAD();
  const updateMutation = useUpdateCategoryAudioAD();
  const deleteMutation = useDeleteCategoryAudioAD();

  useEffect(() => {
    document.title = "Thể loại truyện Audio ‹ Quản trị";
  }, []);

  // Chuẩn hóa danh sách
  const categories = useMemo(() => {
    if (!rawCategories) return [];
    if (Array.isArray(rawCategories)) return rawCategories;
    if (Array.isArray(rawCategories.data)) return rawCategories.data;
    return [];
  }, [rawCategories]);

  // Lọc theo tìm kiếm
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const query = searchTerm.toLowerCase().trim();
    return categories.filter(
      (cat) =>
        cat.name?.toLowerCase().includes(query) ||
        cat.description?.toLowerCase().includes(query) ||
        generateSlug(cat.name).includes(query)
    );
  }, [categories, searchTerm]);

  // Xử lý thay đổi tên: tự sinh slug nếu người dùng chưa sửa slug thủ công
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: newName,
      slug: isSlugManual ? prev.slug : generateSlug(newName),
    }));
  };

  const handleSlugChange = (e) => {
    setIsSlugManual(true);
    setFormData((prev) => ({
      ...prev,
      slug: e.target.value,
    }));
  };

  // Chọn sửa thể loại -> nạp vào form bên trái (kiểu WordPress)
  const handleStartEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || "",
      slug: cat.slug || generateSlug(cat.name),
      description: cat.description || "",
    });
    setIsSlugManual(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Hủy sửa -> quay về form thêm mới
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", description: "" });
    setIsSlugManual(false);
  };

  // Submit Form (Thêm mới hoặc Cập nhật)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên thể loại!");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || "",
    };

    if (editingCategory) {
      toast.promise(
        updateMutation.mutateAsync({
          id: editingCategory.id,
          data: payload,
        }),
        {
          loading: "Đang cập nhật thể loại...",
          success: "Đã cập nhật thể loại thành công!",
          error: (err) => err.response?.data?.message || "Lỗi khi cập nhật thể loại!",
        },
        { position: "top-right" }
      );
      handleCancelEdit();
    } else {
      toast.promise(
        addMutation.mutateAsync(payload),
        {
          loading: "Đang thêm thể loại...",
          success: "Đã tạo thể loại mới thành công!",
          error: (err) => err.response?.data?.message || "Lỗi khi tạo thể loại!",
        },
        { position: "top-right" }
      );
      setFormData({ name: "", slug: "", description: "" });
      setIsSlugManual(false);
    }
  };

  // Xóa thể loại đơn lẻ
  const handleDelete = (id, name) => {
    toast(
      (t) => (
        <div className="wp-confirm-dialog">
          <div className="confirm-icon">⚠️</div>
          <div className="confirm-body">
            <h4 className="confirm-title">Xóa thể loại truyện?</h4>
            <p className="confirm-desc">
              Bạn có chắc chắn muốn xóa thể loại "<strong>{name}</strong>"? Các bộ truyện thuộc thể loại này sẽ cần được cập nhật thể loại mới.
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
                    loading: "Đang xóa thể loại...",
                    success: "Đã xóa thể loại thành công!",
                    error: (err) =>
                      err.response?.data?.message ||
                      err.response?.data?.error ||
                      "Lỗi khi xóa thể loại!",
                  },
                  { position: "top-right" }
                );
                if (editingCategory?.id === id) {
                  handleCancelEdit();
                }
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

  // Chọn checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredCategories.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Hành động hàng loạt
  const handleApplyBulkAction = () => {
    if (selectedIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một thể loại!");
      return;
    }

    if (bulkAction === "delete") {
      toast(
        (t) => (
          <div className="wp-confirm-dialog">
            <div className="confirm-icon">⚠️</div>
            <div className="confirm-body">
              <h4 className="confirm-title">
                Xóa {selectedIds.length} thể loại đã chọn?
              </h4>
              <p className="confirm-desc">
                Hành động này sẽ xóa các thể loại đã được chọn khỏi hệ thống.
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
                  const deletePromises = selectedIds.map((id) =>
                    deleteMutation.mutateAsync(id)
                  );
                  toast.promise(
                    Promise.all(deletePromises),
                    {
                      loading: `Đang xóa ${selectedIds.length} thể loại...`,
                      success: `Đã xóa ${selectedIds.length} thể loại thành công!`,
                      error: "Lỗi khi xóa thể loại!",
                    },
                    { position: "top-right" }
                  );
                  setSelectedIds([]);
                  handleCancelEdit();
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

  return (
    <div className="wp-categories-audio-page">
      <Toaster position="top-right" reverseOrder={false} />

      {/* WordPress Header */}
      <div className="wp-page-header">
        <h1 className="wp-page-title">
          <FaListUl className="title-icon" />
          Thể loại truyện Audio
        </h1>
        {isFetching && !isLoading && (
          <span className="wp-refreshing-badge">
            <FaSyncAlt className="spin" /> Đang đồng bộ...
          </span>
        )}
      </div>

      {/* WordPress 2-Column Layout */}
      <div className="wp-col-container">
        {/* CỘT TRÁI: Form Thêm / Sửa thể loại */}
        <div className="wp-col-left">
          <div className={`wp-form-card ${editingCategory ? "is-editing" : ""}`}>
            <div className="card-header">
              <h3>
                {editingCategory ? (
                  <>
                    <FaEdit /> Chỉnh sửa thể loại
                  </>
                ) : (
                  <>
                    <FaPlus /> Thêm thể loại mới
                  </>
                )}
              </h3>
              {editingCategory && (
                <button
                  type="button"
                  className="cancel-badge"
                  onClick={handleCancelEdit}
                  title="Hủy bỏ chỉnh sửa"
                >
                  <FaTimes /> Hủy
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="category-form">
              {/* Tên */}
              <div className="form-group">
                <label className="form-label">
                  Tên thể loại <span className="req">*</span>
                </label>
                <input
                  type="text"
                  className="wp-input"
                  placeholder="Ví dụ: Tiên Hiệp, Trinh Thám"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                />
                <p className="description">
                  Tên thể loại hiển thị với thính giả khi tìm kiếm truyện Audio.
                </p>
              </div>

              {/* Slug / Đường dẫn tĩnh */}
              <div className="form-group">
                <label className="form-label">Chuỗi cho đường dẫn (Slug)</label>
                <input
                  type="text"
                  className="wp-input"
                  placeholder="tien-hiep"
                  value={formData.slug}
                  onChange={handleSlugChange}
                />
                <p className="description">
                  Chuỗi là phiên bản thân thiện với URL của tên (tự động tạo từ tên).
                </p>
              </div>

              {/* Mô tả */}
              <div className="form-group">
                <label className="form-label">Mô tả thể loại</label>
                <textarea
                  className="wp-textarea"
                  rows={4}
                  placeholder="Mô tả tóm tắt về đặc trưng thể loại này..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                <p className="description">
                  Mô tả chi tiết giúp người nghe hiểu rõ đặc trưng của thể loại.
                </p>
              </div>

              {/* Nút hành động */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={addMutation.isPending || updateMutation.isPending}
                >
                  {editingCategory ? (
                    <>
                      <FaCheck />{" "}
                      {updateMutation.isPending
                        ? "Đang lưu..."
                        : "Cập nhật thể loại"}
                    </>
                  ) : (
                    <>
                      <FaPlus />{" "}
                      {addMutation.isPending
                        ? "Đang tạo..."
                        : "Thêm thể loại mới"}
                    </>
                  )}
                </button>

                {editingCategory && (
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={handleCancelEdit}
                  >
                    <FaTimes /> Hủy bỏ
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* CỘT PHẢI: Bảng Danh sách thể loại */}
        <div className="wp-col-right">
          {/* Top Filter & Search */}
          <div className="wp-tablenav top">
            <div className="alignleft actions bulkactions">
              <select
                className="wp-select"
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
              >
                <option value="">Hành động hàng loạt</option>
                <option value="delete">Xóa thể loại</option>
              </select>
              <button
                type="button"
                className="button action"
                onClick={handleApplyBulkAction}
              >
                Áp dụng
              </button>
            </div>

            <div className="alignright search-box-wrapper">
              <div className="wp-search-box">
                <FaSearch className="search-icon" />
                <input
                  type="search"
                  className="wp-search-input"
                  placeholder="Tìm thể loại..."
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

          {/* Table */}
          <div className="wp-table-container">
            <table className="wp-list-table widefat fixed striped tags">
              <thead>
                <tr>
                  <td className="manage-column column-cb check-column">
                    <input
                      type="checkbox"
                      checked={
                        filteredCategories.length > 0 &&
                        filteredCategories.every((c) =>
                          selectedIds.includes(c.id)
                        )
                      }
                      onChange={handleSelectAll}
                    />
                  </td>
                  <th className="manage-column column-name column-primary">
                    Tên thể loại
                  </th>
                  <th className="manage-column column-description">Mô tả</th>
                  <th className="manage-column column-slug">Chuỗi (Slug)</th>
                  <th className="manage-column column-posts num">Số bộ truyện</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="wp-loading-cell">
                      <div className="wp-spinner-wrap">
                        <div className="wp-spinner"></div>
                        <p>Đang tải danh sách thể loại...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => {
                    const isSelected = selectedIds.includes(cat.id);
                    const isCurrentEditing = editingCategory?.id === cat.id;
                    const slug = cat.slug || generateSlug(cat.name);
                    const storyCount = cat.stories_count ?? 0;

                    return (
                      <tr
                        key={cat.id}
                        className={`category-row ${
                          isSelected ? "selected-row" : ""
                        } ${isCurrentEditing ? "editing-row" : ""}`}
                      >
                        {/* Checkbox */}
                        <th scope="row" className="check-column">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(cat.id)}
                          />
                        </th>

                        {/* Name & Row Actions */}
                        <td className="column-name column-primary">
                          <strong className="row-title">
                            <span
                              className="title-link"
                              onClick={() => handleStartEdit(cat)}
                            >
                              {cat.name}
                            </span>
                            {isCurrentEditing && (
                              <span className="editing-tag"> — Đang sửa</span>
                            )}
                          </strong>

                          {/* Signature WordPress Row Actions */}
                          <div className="row-actions">
                            <span className="edit">
                              <button
                                type="button"
                                className="action-link edit-link"
                                onClick={() => handleStartEdit(cat)}
                              >
                                Chỉnh sửa
                              </button>
                              <span className="pipe"> | </span>
                            </span>

                            <span className="delete">
                              <button
                                type="button"
                                className="action-link delete-link"
                                onClick={() => handleDelete(cat.id, cat.name)}
                              >
                                Xóa
                              </button>
                              <span className="pipe"> | </span>
                            </span>

                            <span className="view">
                              <button
                                type="button"
                                className="action-link view-link"
                                onClick={() =>
                                  navigate(
                                    `${ROUTES.ADMIN.MANAGE_COMMENTS_AUDIO}?category=${cat.id}`
                                  )
                                }
                              >
                                Xem các truyện{" "}
                                <FaExternalLinkAlt className="ext-icon" />
                              </button>
                            </span>
                          </div>
                        </td>

                        {/* Description */}
                        <td className="column-description">
                          {cat.description ? (
                            <span className="desc-text">{cat.description}</span>
                          ) : (
                            <span className="empty-dash">—</span>
                          )}
                        </td>

                        {/* Slug */}
                        <td className="column-slug">
                          <code className="slug-code">{slug}</code>
                        </td>

                        {/* Story Count */}
                        <td className="column-posts num">
                          <span
                            className="posts-count-badge"
                            onClick={() =>
                              navigate(
                                `${ROUTES.ADMIN.MANAGE_COMMENTS_AUDIO}?category=${cat.id}`
                              )
                            }
                            title="Xem danh sách bộ truyện thuộc thể loại này"
                          >
                            <FaBook className="count-icon" /> {storyCount}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="wp-no-items">
                      <div className="empty-box">
                        <FaListUl className="empty-icon" />
                        <p className="empty-text">
                          Không tìm thấy thể loại nào phù hợp.
                        </p>
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
                        filteredCategories.length > 0 &&
                        filteredCategories.every((c) =>
                          selectedIds.includes(c.id)
                        )
                      }
                      onChange={handleSelectAll}
                    />
                  </td>
                  <th className="manage-column column-name column-primary">
                    Tên thể loại
                  </th>
                  <th className="manage-column column-description">Mô tả</th>
                  <th className="manage-column column-slug">Chuỗi (Slug)</th>
                  <th className="manage-column column-posts num">Số bộ truyện</th>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Bottom Table Nav */}
          <div className="wp-tablenav bottom">
            <div className="alignleft actions bulkactions">
              <select
                className="wp-select"
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
              >
                <option value="">Hành động hàng loạt</option>
                <option value="delete">Xóa thể loại</option>
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
              <span className="displaying-num">
                {filteredCategories.length} thể loại
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(CategoryManagement);