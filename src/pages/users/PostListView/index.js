import React, { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './style.scss';
// Import 2 hooks công khai mới dành cho Client
import { useGetClientPosts, useGetClientPostCategories } from 'api/homePage'; 
import { STORAGE_URL } from 'config/config';

// Helper định dạng lượt xem
const formatViews = (n) => {
  if (!n) return 0;
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : n;
};

// Helper lấy URL ảnh đại diện (Đồng bộ với Laravel storage)
const getThumbnailUrl = (url) => {
  if (!url) return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' fill='%23e2e8f0'%3E%3Crect width='600' height='400'/%3E%3C/svg%3E";
  if (url.startsWith("http")) return url;
  return `${STORAGE_URL}${url}`;
};

const PostListView = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6; 


  // 1. Fetch dữ liệu thật thông qua Route công khai
  const { data: postsResponse, isLoading: isPostsLoading } = useGetClientPosts();
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useGetClientPostCategories();

  useEffect(() => {
        document.title = "Bài viết";
    }, []); 

  // 2. Chuyển đổi danh sách bài viết nhận về an toàn
  const posts = useMemo(() => {
    return Array.isArray(postsResponse) 
      ? postsResponse 
      : (postsResponse?.data?.data || postsResponse?.data || []);
  }, [postsResponse]);

  // 3. Xử lý danh sách Danh mục từ Backend
  const categories = useMemo(() => {
    const rawCategories = Array.isArray(categoriesResponse) 
      ? categoriesResponse 
      : (categoriesResponse?.data?.data || categoriesResponse?.data || []);
    
    return [
      { id: 'all', name: 'Tất cả' }, 
      ...rawCategories.map(cat => ({
        id: cat.id,
        name: cat.name || cat.title
      }))
    ];
  }, [categoriesResponse]);

  // 4. Chọn bài viết đầu tiên làm bài viết nổi bật (Featured Post - Bài mới nhất)
  const featuredPost = useMemo(() => {
    return posts[0] || null;
  }, [posts]);

  // Kiểm tra xem hiện tại có đang hiển thị bài viết nổi bật ở trên đầu hay không
  const isShowingFeatured = useMemo(() => {
    return featuredPost && selectedCategoryId === 'all' && !searchQuery && currentPage === 1;
  }, [featuredPost, selectedCategoryId, searchQuery, currentPage]);

  // 5. LOGIC LỌC BÀI VIẾT: Đồng bộ theo category_id nhận từ Laravel
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // So sánh category_id của bài viết với ID danh mục đang được click chọn
      const matchesCategory = selectedCategoryId === 'all' || Number(post.category_id) === Number(selectedCategoryId);
      
      const matchesSearch = (post.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (post.description || '').toLowerCase().includes(searchQuery.toLowerCase());
                            
      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategoryId, searchQuery]);

  // 6. LOẠI TRỪ BÀI VIẾT NỔI BẬT: Nếu đang hiển thị ở trên đầu thì loại ra khỏi danh sách lưới ở dưới
  const gridPosts = useMemo(() => {
    if (isShowingFeatured && featuredPost) {
      return filteredPosts.filter(post => post.id !== featuredPost.id);
    }
    return filteredPosts;
  }, [filteredPosts, isShowingFeatured, featuredPost]);

  // 7. Tính toán phân trang dựa trên danh sách lưới đã loại trừ
  const totalPages = Math.ceil(gridPosts.length / postsPerPage);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return gridPosts.slice(startIndex, startIndex + postsPerPage);
  }, [gridPosts, currentPage]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  if (isPostsLoading || isCategoriesLoading) {
  return (
    <div className="post-skeleton-page">

      {/* HERO SKELETON */}
      <div className="skeleton-hero">
        <div className="shimmer line w60"></div>
        <div className="shimmer line w80"></div>
        <div className="shimmer search"></div>
      </div>

      {/* FEATURED */}
      <div className="skeleton-featured">
        <div className="shimmer featured-img"></div>
        <div className="featured-content">
          <div className="shimmer line w40"></div>
          <div className="shimmer line w90"></div>
          <div className="shimmer line w70"></div>
          <div className="shimmer line w50"></div>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="skeleton-tabs">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="shimmer tab"></div>
        ))}
      </div>

      {/* GRID */}
      <div className="skeleton-grid">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="skeleton-card">
            <div className="shimmer card-img"></div>
            <div className="card-body">
              <div className="shimmer line w80"></div>
              <div className="shimmer line w60"></div>
              <div className="shimmer line w90"></div>
            </div>
          </div>
        ))}
      </div>

      {/* STYLE */}
      <style jsx="true">{`
        .post-skeleton-page {
          max-width: 1200px;
          margin: 40px auto;
          padding: 20px;
        }

        /* SHIMMER EFFECT */
        .shimmer {
          position: relative;
          overflow: hidden;
          background: #e5e7eb;
          border-radius: 10px;
        }

        .shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: -150px;
          width: 150px;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.7),
            transparent
          );
          animation: shimmer 1.2s infinite;
        }

        @keyframes shimmer {
          0% { left: -150px; }
          100% { left: 100%; }
        }

        /* HERO */
        .skeleton-hero {
          margin-bottom: 30px;
        }

        .line {
          height: 14px;
          margin: 10px 0;
        }

        .w40 { width: 40%; }
        .w50 { width: 50%; }
        .w60 { width: 60%; }
        .w70 { width: 70%; }
        .w80 { width: 80%; }
        .w90 { width: 90%; }

        .search {
          height: 42px;
          width: 100%;
          margin-top: 15px;
        }

        /* FEATURED */
        .skeleton-featured {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        .featured-img {
          height: 180px;
          border-radius: 12px;
        }

        .featured-content {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* TABS */
        .skeleton-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .tab {
          width: 90px;
          height: 32px;
          border-radius: 20px;
        }

        /* GRID */
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }

        .skeleton-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0,0,0,0.05);
        }

        .card-img {
          height: 160px;
          width: 100%;
        }

        .card-body {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
      `}</style>
    </div>
  );
}

  return (
    <div className="post-list-container">
      {/* Banner & Search Section */}
      <section className="list-hero">
        <h1 className="hero-title">Góc Chia Sẻ Kiến Thức</h1>
        <p className="hero-subtitle">Nơi tổng hợp các bài viết về lập trình web, mẹo tối ưu và đời sống developer.</p>
        
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm bài viết..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); 
            }}
          />
        </div>
      </section>

      {/* Featured Post (Chỉ hiển thị khi thỏa mãn điều kiện hiển thị ở trang đầu) */}
      {isShowingFeatured && (
        <section className="featured-section">
          <div className="featured-card">
            <div className="featured-image">
              <img src={getThumbnailUrl(featuredPost.avatar_post || featuredPost.thumbnail)} alt={featuredPost.title} />
            </div>
            <div className="featured-info">
              <span className="post-tag">{featuredPost.category?.name || 'Bài viết'}</span>
              <h2 className="featured-title">{featuredPost.title}</h2>
              <p className="featured-excerpt">{featuredPost.description || featuredPost.excerpt}</p>
              <div className="featured-meta">
                <span className="post-date">
                  <FaCalendarAlt /> {new Date(featuredPost.created_at).toLocaleDateString('vi-VN')}
                </span>
                {featuredPost.views !== undefined && (
                  <span className="post-views" style={{ marginLeft: '15px' }}>
                    <FaEye /> {formatViews(featuredPost.views)} lượt xem
                  </span>
                )}
                <Link to={`/post/${featuredPost.id}`} className="btn-read-more">
                  Đọc bài viết
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Tabs */}
      <nav className="category-tabs">
        {categories.map((cat) => (
          <button 
            key={cat.id} 
            className={`tab-item ${selectedCategoryId === cat.id ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategoryId(cat.id);
              setCurrentPage(1); 
            }}
          >
            {cat.name}
          </button>
        ))}
      </nav>

      {/* Main Grid List */}
      <main className="posts-grid-wrapper">
        {paginatedPosts.length > 0 ? (
          <div className="posts-grid">
            {paginatedPosts.map((post) => (
              <article key={post.id} className="post-card">
                <div className="card-image">
                  <img src={getThumbnailUrl(post.avatar_post || post.thumbnail)} alt={post.title} />
                  <span className="card-tag">{post.category?.name || 'Tin tức'}</span>
                </div>
                <div className="card-body">
                  <div className="card-meta">
                    <span className="card-date">
                      <FaCalendarAlt /> {new Date(post.created_at).toLocaleDateString('vi-VN')}
                    </span>
                    {post.views !== undefined && (
                      <span className="card-views" style={{ float: 'right' }}>
                        <FaEye /> {formatViews(post.views)}
                      </span>
                    )}
                  </div>
                  <h3 className="card-title">{post.title}</h3>
                  <p className="card-excerpt">{post.description || post.excerpt}</p>
                </div>
                <div className="card-footer">
                  <Link to={`/post/${post.id}`} className="btn-link">
                    Đọc tiếp
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>Không tìm thấy bài viết nào phù hợp với yêu cầu của bạn.</p>
          </div>
        )}
      </main>

      {/* Pagination (Tính toán dựa trên số lượng bài viết gridPosts đã loại trừ) */}
      {gridPosts.length > postsPerPage && (
        <div className="pagination">
          <button 
            className={`page-btn ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaChevronLeft />
          </button>
          
          {Array.from({ length: totalPages }, (_, index) => (
            <button 
              key={index + 1} 
              className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          
          <button 
            className={`page-btn ${currentPage === totalPages ? 'disabled' : ''}`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default PostListView;