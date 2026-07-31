import { useState, useEffect, useCallback } from "react";
import { FaSearch, FaEdit, FaTrash, FaFilter, FaBook, FaEye, FaHeart, FaShare } from "react-icons/fa";
import "./style.scss";
import axios from "axios";
import { useDeletePost } from "api/homePage";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast"; // Import toast và Toaster
import { STORAGE_URL } from "config/config";

const AllPost = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const deletePost = useDeletePost();
  const navigate = useNavigate();

  // sửa bài viết
  const handleEdit = (id) => {
    navigate(`/admin/edit/posts/${id}`);
  };

  const postsPerPage = 15;

  const url = `${process.env.REACT_APP_API_URI}`;

  // ✅ Nhận search vào thẳng tham số để tránh stale closure
  const fetchPosts = useCallback(async (search = "") => {
    try {
      const token = localStorage.getItem("adminToken");
      setLoading(true);

      const response = await axios.get(`${url}admin/all-posts`, {
        params: { search },
        headers: { Authorization: `Bearer ${token}` }
      });

      // Xử lý cả 2 dạng response: mảng thẳng hoặc { data: [...] }
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setPosts(data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      toast.error("Không thể tải danh sách bài viết!");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = () => fetchPosts(searchTerm);
  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };

  // Thay thế alert bằng toast khi xóa bài viết
 const handleDelete = (id) => {
    // Hiển thị toast custom để xác nhận xóa
    toast((t) => (
      <div className="confirm-toast-wrapper">
        <p style={{ margin: "0 0 10px 0", fontWeight: "500", color: "#1e293b" }}>
          Bạn có chắc chắn muốn xóa bài viết này?
        </p>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              padding: "5px 12px",
              background: "#e2e8f0",
              color: "#475569",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500"
            }}
          >
            Hủy
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id); // Đóng nhanh toast xác nhận
              executeDelete(id);   // Gọi hàm xử lý xóa thực tế
            }}
            style={{
              padding: "5px 12px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500"
            }}
          >
            Xác nhận
          </button>
        </div>
      </div>
    ), {
      duration: 6000, // Đợi 6 giây nếu user không tương tác sẽ tự đóng
      position: "top-center",
    });
  };

  // Hàm phụ trách gọi API xóa thực tế sau khi đã xác nhận
  const executeDelete = (id) => {
    // Tạo một promise toast để hiển thị trạng thái Loading -> Success/Error mượt mà
    toast.promise(
      new Promise((resolve, reject) => {
        deletePost.mutate(id, {
          onSuccess: () => {
            setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
            resolve();
          },
          onError: (err) => {
            reject(err);
          }
        });
      }),
      {
        loading: "Đang xóa bài viết...",
        success: "Đã xóa bài viết thành công! 🎉",
        error: (err) => err.response?.data?.message || "Lỗi khi xóa bài viết!",
      },
      {
        style: { minWidth: "250px", fontSize: "14px" },
        success: { duration: 3000 },
        error: { duration: 4000 }
      }
    );
  };

  // ✅ Xử lý tên tác giả mọi trường hợp
  const getAuthorName = (post) => {
    if (!post.author) return "Admin";
    if (typeof post.author === "object" && post.author?.name) return post.author.name;
    if (typeof post.author === "string" && isNaN(post.author)) return post.author;
    if (post.user?.name) return post.user.name;
    return `User #${post.author}`;
  };

  // Phân trang
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
          document.title = "Tất cả bài viết";
      }, []);

  return (
    <div className="allpost-page">
      {/* Container hiển thị Toast thông báo */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="allpost-header">
        <div className="header-content">
          <h1 className="page-title">
            <FaBook className="title-icon" />
            Quản Lý Bài Viết
          </h1>
          <p className="page-subtitle">Xem và quản lý tất cả bài viết trên website</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <FaBook className="stat-icon" />
            <div className="stat-info">
              <div className="stat-label">Tổng bài viết</div>
              <div className="stat-value">{posts.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="allpost-container">
        <div className="filter-card">
          <div className="filter-header">
            <FaFilter className="filter-icon" />
            <span>Tìm kiếm bài viết</span>
          </div>
          <div className="filter-grid">
            <div className="filter-group">
              <label className="filter-label">Từ khóa</label>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Nhập tên bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="search-btn" onClick={handleSearch}>
                  <FaSearch />
                </button>
              </div>
            </div>
          </div>
          <div className="filter-actions">
            <button className="btn-apply" onClick={handleSearch}>
              🔍 Tìm kiếm
            </button>
            {searchTerm && (
              <button
                className="btn-apply"
                style={{ background: "#94a3b8", marginLeft: 8 }}
                onClick={() => { setSearchTerm(""); fetchPosts(""); }}
              >
                ✕ Xóa lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="allpost-container">
        <div className="table-card">
          <div className="card-header">
            <h3 className="card-title">📋 Danh Sách Bài Viết ({posts.length})</h3>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
              Đang tải dữ liệu...
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bài viết</th>
                  <th>Lượt xem</th>
                  <th>Trạng thái</th>
                  <th>Chia sẻ</th>
                  <th>Tác giả</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentPosts.length > 0 ? (
                  currentPosts.map((post) => (
                    <tr key={post.id}>
                      <td>
                        <div className="post-info">
                          <div className="post-main">
                            <img
                              src={post.avatar_post
                                ? `${STORAGE_URL}/${post.avatar_post}`
                                : "/placeholder.png"}
                              className="post-thumbnail"
                              alt="post"
                              onError={(e) => { e.target.src = "/placeholder.png"; }}
                            />
                            <div className="post-details">
                              <div className="post-title">{post.title}</div>
                              <div className="post-date">
                                📅 {new Date(post.created_at).toLocaleDateString("vi-VN")}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="stat-badge">
                          <FaEye className="badge-icon" />
                          <span>{post.views || 0}</span>
                        </div>
                      </td>
                      <td>
                        <div className="stat-badge status" style={{ backgroundColor: post.status === "published" ? "#22c55e" : "#facc15" }}>
                          <span>{post.status || 0}</span>
                        </div>
                      </td>
                      <td>
                        <div className="stat-badge share">
                          <FaShare className="badge-icon" />
                          <span>{post.shares || 0}</span>
                        </div>
                      </td>
                      <td>
                        <span className="author-badge">{getAuthorName(post)}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                          className="btn-action btn-edit" title="Sửa" onClick={() => handleEdit(post.id)}>
                            <FaEdit />
                          </button>
                          <button 
                          className="btn-action btn-delete" title="Xóa" onClick={() => handleDelete(post.id)} disabled={deletePost.isPending} >
                            {deletePost.isPending ? "..." :<FaTrash />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-message">
                      <div className="empty-state">
                        <FaBook className="empty-icon" />
                        <p>Không tìm thấy bài viết nào</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="allpost-container">
          <div className="pagination-wrapper">
            <button className="page-btn prev-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
              ← Trước
            </button>
            <div className="pagination-numbers">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} className={`page-btn ${currentPage === i + 1 ? "active" : ""}`} onClick={() => handlePageChange(i + 1)}>
                  {i + 1}
                </button>
              ))}
            </div>
            <button className="page-btn next-btn" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
              Sau →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPost;