import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaTags, FaTimes, FaSave } from "react-icons/fa";
import { useAddCategoryAD, useDeleteCategoryAD, useGetCategoriesAD, useUpdateCategoryAD } from "api/homePage/queries";
import "./style.scss";

const CategoryPosts = () => {
  useEffect(() => {
          document.title = "Danh mục bài viết";
      }, []);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });
  
  const { data: categories = [], isLoading } = useGetCategoriesAD();
  const addCategoryMutation = useAddCategoryAD();
  const updateCategoryMutation = useUpdateCategoryAD();
  const deleteCategoryMutation = useDeleteCategoryAD();

  const handleAddCategory = (e) => {
    e.preventDefault();
    setError("");
    
    // Validate form data
    if (!newCategory.name.trim()) {
      setError("Vui lòng nhập tên danh mục");
      return;
    }

    if (editId) {
      // Update category
      updateCategoryMutation.mutate(
        { id: editId, data: newCategory },
        {
          onSuccess: () => {
            setShowModal(false);
            setEditId(null);
            setNewCategory({ name: "", description: "" });
            setError("");
          },
          onError: (err) => {
            const errorMsg = err.response?.data?.message || "Lỗi khi cập nhật danh mục";
            setError(errorMsg);
          },
        }
      );
    } else {
      // Add new category
      addCategoryMutation.mutate(newCategory, {
        onSuccess: () => {
          setShowModal(false);
          setNewCategory({ name: "", description: "" });
          setError("");
        },
        onError: (err) => {
          const errorMsg = err.response?.data?.message || "Lỗi khi thêm danh mục";
          setError(errorMsg);
        },
      });
    }
  };

  // Hàm mở Modal để Sửa
  const handleEditClick = (cat) => {
    setEditId(cat.id);
    setNewCategory({ name: cat.name, description: cat.description });
    setError("");
    setShowModal(true);
  };

  // Hàm Xóa
  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) {
      deleteCategoryMutation.mutate(id, {
        onSuccess: () => {
          alert("Xóa danh mục thành công!");
        },
        onError: (err) => {
          const errorMsg = err.response?.data?.message || "Lỗi khi xóa danh mục";
          alert(errorMsg);
        },
      });
    }
  };

  return (
    <div className="category-page">
      {/* Page Header */}
      <div className="category-header">
        <div className="header-content">
          <h1 className="page-title">
            <FaTags className="title-icon" />
            Quản Lý Danh Mục
          </h1>
          <p className="page-subtitle">Tạo và quản lý danh mục bài viết trên website</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <FaTags className="stat-icon" />
            <div className="stat-info">
              <div className="stat-label">Tổng danh mục</div>
              <div className="stat-value">{categories.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Category Section */}
      <div className="category-container">
        <div className="form-section">
          <button 
            className="btn-add-category"
            onClick={() => {
              setEditId(null);
              setNewCategory({ name: "", description: "" });
              setShowModal(true);
            }}
          >
            <FaPlus /> Thêm Danh Mục Mới
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="category-container">
        <div className="table-card">
          <div className="card-header">
            <h3 className="card-title">📋 Danh Sách Danh Mục ({categories.length})</h3>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="spinner">⏳</div>
              <p>Đang tải danh mục...</p>
            </div>
          ) : categories.length > 0 ? (
            <div className="categories-grid">
              {categories.map((cat, index) => (
                <div key={cat.id || index} className="category-card">
                  <div className="card-number">#{index + 1}</div>
                  <div className="card-body">
                    <h4 className="category-name">{cat.name}</h4>
                    <p className="category-description">{cat.description || "Không có mô tả"}</p>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn-action btn-edit"
                      onClick={() => handleEditClick(cat)}
                      title="Sửa"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(cat.id)}
                      disabled={deleteCategoryMutation.isPending}
                      title="Xóa"
                    >
                      {deleteCategoryMutation.isPending ? "..." : <FaTrash />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FaTags className="empty-icon" />
              <p>Chưa có danh mục nào</p>
              <span className="empty-hint">Hãy thêm danh mục mới để bắt đầu</span>
            </div>
          )}
        </div>
      </div>

      {/* Professional Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">
                  {editId ? "✏️ Sửa Danh Mục" : "➕ Thêm Danh Mục Mới"}
                </h3>
                <button 
                  className="modal-close"
                  onClick={() => {
                    setShowModal(false);
                    setError("");
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleAddCategory}>
                <div className="modal-body">
                  {error && (
                    <div className="error-alert">
                      <span className="error-icon">⚠️</span>
                      <span className="error-text">{error}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">
                      Tên danh mục <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nhập tên danh mục..."
                      value={newCategory.name}
                      onChange={(e) => {
                        setNewCategory({ ...newCategory, name: e.target.value });
                        setError("");
                      }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      className="form-textarea"
                      rows="4"
                      placeholder="Mô tả chi tiết về danh mục này..."
                      value={newCategory.description}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          description: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setShowModal(false);
                      setError("");
                    }}
                  >
                    <FaTimes /> Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={addCategoryMutation.isPending || updateCategoryMutation.isPending}
                  >
                    <FaSave /> {addCategoryMutation.isPending || updateCategoryMutation.isPending ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPosts;
