import React, { useState, useMemo, useEffect } from 'react';
import {
  FaSearch,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaHome,
  FaFolder,
  FaClock,
  FaUser,
  FaFire,
  FaHeadphones,
  FaArrowRight
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './style.scss';
import BrandAdBanner from 'components/BrandAdBanner';
// Import hooks công khai dành cho Client
import {
  useGetClientPosts,
  useGetClientPostCategories,
  useGetStoriesClient
} from 'api/homePage';
import { STORAGE_URL } from 'config/config';

// Helper định dạng lượt xem
const formatViews = (n) => {
  if (!n) return "0";
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
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

  // 1. Fetch dữ liệu bài viết, danh mục và truyện audio
  const { data: postsResponse, isLoading: isPostsLoading } = useGetClientPosts();
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useGetClientPostCategories();
  const { data: storiesResponse } = useGetStoriesClient();

  useEffect(() => {
    document.title = "Bài Viết & Cẩm Nang - Audio Story Magazine";
  }, []);

  // 2. Chuyển đổi danh sách bài viết
  const posts = useMemo(() => {
    return Array.isArray(postsResponse)
      ? postsResponse
      : (postsResponse?.data?.data || postsResponse?.data || []);
  }, [postsResponse]);

  // 3. Xử lý danh sách Danh mục
  const categories = useMemo(() => {
    const rawCategories = Array.isArray(categoriesResponse)
      ? categoriesResponse
      : (categoriesResponse?.data?.data || categoriesResponse?.data || []);

    return [
      { id: 'all', name: 'Tất cả chuyên mục' },
      ...rawCategories.map(cat => ({
        id: cat.id,
        name: cat.name || cat.title
      }))
    ];
  }, [categoriesResponse]);

  // 4. Kho truyện audio cho sidebar
  const featuredStories = useMemo(() => {
    const rawStories = Array.isArray(storiesResponse)
      ? storiesResponse
      : (storiesResponse?.data?.data || storiesResponse?.data || []);
    return rawStories.slice(0, 4);
  }, [storiesResponse]);

  // 5. Bài viết xem nhiều nhất cho sidebar (sắp xếp theo views)
  const popularPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    return [...posts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);
  }, [posts]);

  // 6. Bài viết nổi bật (Featured Post - Bài mới nhất)
  const featuredPost = useMemo(() => {
    return posts[0] || null;
  }, [posts]);

  // Kiểm tra điều kiện hiển thị bài viết nổi bật ở đầu trang
  const isShowingFeatured = useMemo(() => {
    return featuredPost && selectedCategoryId === 'all' && !searchQuery && currentPage === 1;
  }, [featuredPost, selectedCategoryId, searchQuery, currentPage]);

  // 7. Lọc bài viết theo danh mục và tìm kiếm
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesCategory = selectedCategoryId === 'all' || Number(post.category_id) === Number(selectedCategoryId);
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query ||
        (post.title || '').toLowerCase().includes(query) ||
        (post.description || '').toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategoryId, searchQuery]);

  // 8. Loại trừ bài viết nổi bật khỏi lưới bài viết nếu đang hiển thị ở banner trên cùng
  const gridPosts = useMemo(() => {
    if (isShowingFeatured && featuredPost) {
      return filteredPosts.filter(post => post.id !== featuredPost.id);
    }
    return filteredPosts;
  }, [filteredPosts, isShowingFeatured, featuredPost]);

  // 9. Phân trang
  const totalPages = Math.ceil(gridPosts.length / postsPerPage);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return gridPosts.slice(startIndex, startIndex + postsPerPage);
  }, [gridPosts, currentPage]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  // Skeleton Loading State
  if (isPostsLoading || isCategoriesLoading) {
    return (
      <div className="post-list-wp-container skeleton-loading-active">
        <div className="skeleton-breadcrumbs sk-item"></div>
        <div className="skeleton-hero sk-item"></div>
        <div className="skeleton-featured-card sk-item"></div>
        <div className="layout-wp-2col">
          <div className="skeleton-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-post-card sk-item"></div>
            ))}
          </div>
          <div className="skeleton-sidebar">
            <div className="skeleton-widget sk-item"></div>
            <div className="skeleton-widget sk-item"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="post-list-wp-container">
      {/* WordPress Breadcrumb Bar */}
      <nav className="post-list-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/" className="crumb-link"><FaHome /> Trang chủ</Link>
        <FaChevronRight className="crumb-sep" />
        <span className="crumb-current">Bài viết & Cẩm nang</span>
      </nav>

      {/* WordPress Magazine Hero Section */}
      <header className="magazine-hero-section">
        <div className="hero-text-wrap">
          <span className="hero-kicker">Tạp Chí & Blog Kiến Thức</span>
          <h1 className="hero-main-title">Góc Chia Sẻ & Cẩm Nang Hay</h1>
          <p className="hero-lead">
            Tổng hợp các bài viết review sách, phân tích cốt truyện, kinh nghiệm đọc audio và đời sống văn hóa mỗi ngày.
          </p>
        </div>

        {/* Thanh tìm kiếm phong cách WordPress */}
        <div className="wp-search-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết, chủ đề bạn quan tâm..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchQuery && (
            <button
              className="btn-clear-search"
              onClick={() => setSearchQuery('')}
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      {/* Featured Post Banner (Bài viết tiêu điểm kiểu WordPress Magazine) */}
      {isShowingFeatured && (
        <section className="wp-featured-magazine-card">
          <div className="featured-media-col">
            <Link to={`/post/${featuredPost.id}`} className="media-link">
              <img
                src={getThumbnailUrl(featuredPost.avatar_post || featuredPost.thumbnail)}
                alt={featuredPost.title}
                className="featured-cover"
              />
              <span className="featured-ribbon-tag">Tiêu điểm</span>
            </Link>
          </div>

          <div className="featured-body-col">
            <div className="post-cat-pill">
              {featuredPost.category?.name || 'Bài viết mới'}
            </div>
            <h2 className="featured-headline">
              <Link to={`/post/${featuredPost.id}`}>
                {featuredPost.title}
              </Link>
            </h2>
            <p className="featured-summary">
              {featuredPost.description || featuredPost.excerpt || 'Đọc bài viết chi tiết để khám phá các góc nhìn sâu sắc và thông tin hữu ích...'}
            </p>

            <div className="featured-meta-row">
              <div className="meta-author">
                <FaUser className="user-icon" />
                <span>{featuredPost.user?.name || featuredPost.author || 'Ban Biên Tập'}</span>
              </div>
              <span className="meta-divider">·</span>
              <div className="meta-date">
                <FaCalendarAlt /> {new Date(featuredPost.created_at).toLocaleDateString('vi-VN')}
              </div>
              {featuredPost.views !== undefined && (
                <>
                  <span className="meta-divider">·</span>
                  <div className="meta-views">
                    <FaEye /> {formatViews(featuredPost.views)} xem
                  </div>
                </>
              )}
            </div>

            <div className="featured-action">
              <Link to={`/post/${featuredPost.id}`} className="btn-read-featured">
                Đọc bài viết <FaArrowRight />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Dải phân loại chuyên mục (WordPress Category Ribbon) */}
      <nav className="wp-categories-ribbon" aria-label="Chuyên mục bài viết">
        <div className="ribbon-scroll">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`ribbon-chip ${selectedCategoryId === cat.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategoryId(cat.id);
                setCurrentPage(1);
              }}
            >
              {cat.id === 'all' && <FaFolder className="cat-icon" />}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Brand Advertisement Banner */}
      <BrandAdBanner position="blog_page" />

      {/* Bố cục 2 Cột WordPress: Lưới bài viết (70%) + Sidebar Widget (30%) */}
      <div className="post-list-wp-layout">

        {/* CỘT CHÍNH: LƯỚI BÀI VIẾT (70%) */}
        <main className="posts-list-main">

          {/* Tiêu đề phần danh sách */}
          <div className="section-heading-row">
            <h3 className="section-title">
              {searchQuery
                ? `Kết quả tìm kiếm cho "${searchQuery}"`
                : selectedCategoryId !== 'all'
                ? `Chuyên mục: ${categories.find(c => c.id === selectedCategoryId)?.name || ''}`
                : 'Tất cả bài viết'}
            </h3>
            <span className="total-badge">{gridPosts.length} bài viết</span>
          </div>

          {/* Lưới bài viết */}
          {paginatedPosts.length > 0 ? (
            <div className="posts-magazine-grid">
              {paginatedPosts.map((post) => (
                <article key={post.id} className="wp-post-card">
                  <div className="card-thumb-frame">
                    <Link to={`/post/${post.id}`} className="thumb-link">
                      <img
                        src={getThumbnailUrl(post.avatar_post || post.thumbnail)}
                        alt={post.title}
                        className="thumb-image"
                        loading="lazy"
                      />
                      <span className="card-category-badge">
                        {post.category?.name || 'Tin tức'}
                      </span>
                    </Link>
                  </div>

                  <div className="card-body-content">
                    <div className="card-meta-line">
                      <span className="meta-date">
                        <FaCalendarAlt /> {new Date(post.created_at).toLocaleDateString('vi-VN')}
                      </span>
                      {post.views !== undefined && (
                        <span className="meta-views">
                          <FaEye /> {formatViews(post.views)}
                        </span>
                      )}
                    </div>

                    <h4 className="card-post-title">
                      <Link to={`/post/${post.id}`}>
                        {post.title}
                      </Link>
                    </h4>

                    <p className="card-post-excerpt">
                      {post.description || post.excerpt || 'Khám phá bài viết để cập nhật những thông tin và kiến thức bổ ích...'}
                    </p>

                    <div className="card-footer-row">
                      <span className="author-byline">
                        <FaUser className="user-icon" /> {post.user?.name || post.author || 'Tác giả'}
                      </span>
                      <Link to={`/post/${post.id}`} className="link-read-more">
                        Đọc tiếp <FaArrowRight />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="no-posts-found">
              <FaFolder className="empty-icon" />
              <h4>Không tìm thấy bài viết phù hợp</h4>
              <p>Hãy thử tìm kiếm với từ khóa khác hoặc chuyển sang chuyên mục khác.</p>
              <button
                className="btn-reset-filter"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategoryId('all');
                }}
              >
                Xem tất cả bài viết
              </button>
            </div>
          )}

          {/* Phân trang WordPress Pagination */}
          {totalPages > 1 && (
            <nav className="wp-pagination-bar" aria-label="Phân trang bài viết">
              <button
                className={`page-arrow-btn ${currentPage === 1 ? 'disabled' : ''}`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Trang trước"
              >
                <FaChevronLeft />
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    className={`page-num-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                className={`page-arrow-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Trang sau"
              >
                <FaChevronRight />
              </button>
            </nav>
          )}

        </main>

        {/* CỘT PHẢI: SIDEBAR WIDGETS (30%) */}
        <aside className="posts-list-sidebar">

          {/* Widget 1: Giới thiệu blog */}
          <div className="sidebar-widget widget-intro">
            <div className="widget-header">
              <h4><FaFire /> Về Audio Story Blog</h4>
            </div>
            <p className="intro-text">
              Chuyên trang chia sẻ kiến thức, bài viết sâu sắc về văn hóa đọc, tác phẩm âm thanh và kinh nghiệm sáng tạo nội dung.
            </p>
          </div>

          {/* Widget 2: Bài viết đọc nhiều nhất */}
          {popularPosts.length > 0 && (
            <div className="sidebar-widget widget-popular">
              <div className="widget-header">
                <h4><FaEye /> Bài viết xem nhiều</h4>
              </div>
              <div className="popular-list">
                {popularPosts.map((post, idx) => (
                  <Link key={post.id} to={`/post/${post.id}`} className="popular-item">
                    <span className="rank-badge">0{idx + 1}</span>
                    <div className="popular-text">
                      <h5 className="popular-title">{post.title}</h5>
                      <span className="popular-meta">
                        <FaEye /> {formatViews(post.views)} lượt xem
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Widget 3: Chuyên mục bài viết */}
          <div className="sidebar-widget widget-categories-list">
            <div className="widget-header">
              <h4><FaFolder /> Chuyên mục nổi bật</h4>
            </div>
            <ul className="category-menu">
              {categories.filter(c => c.id !== 'all').map((cat) => (
                <li key={cat.id}>
                  <button
                    className={`category-item-btn ${selectedCategoryId === cat.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setCurrentPage(1);
                    }}
                  >
                    <span>{cat.name}</span>
                    <FaArrowRight className="arrow-icon" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Widget 4: Truyện audio hấp dẫn */}
          {featuredStories.length > 0 && (
            <div className="sidebar-widget widget-stories-promo">
              <div className="widget-header">
                <h4><FaHeadphones /> Kho Truyện Audio Hot</h4>
              </div>
              <div className="stories-mini-list">
                {featuredStories.map((story) => (
                  <Link key={story.id} to={`/story/${story.slug}`} className="story-mini-card">
                    <img
                      src={getThumbnailUrl(story.thumbnail)}
                      alt={story.title}
                      className="story-mini-thumb"
                    />
                    <div className="story-mini-meta">
                      <strong className="story-title">{story.title}</strong>
                      <span className="story-views">
                        <FaHeadphones /> {formatViews(story.views)} lượt nghe
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/truyen" className="btn-all-stories">
                Khám phá kho truyện <FaArrowRight />
              </Link>
            </div>
          )}

        </aside>

      </div>
    </div>
  );
};

export default PostListView;