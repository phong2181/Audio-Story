import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaHeart,
  FaListUl,
  FaEye,
  FaClock,
  FaUser,
  FaHome,
  FaChevronRight,
  FaShareAlt,
  FaChevronDown,
  FaChevronUp,
  FaHeadphones,
  FaFolder,
  FaFire,
  FaArrowRight
} from 'react-icons/fa';
import CommentBox from '../Comment/CommentBox';
import BrandAdBanner from 'components/BrandAdBanner';
import './style.scss';

// Import các API hooks công khai của Client
import { useGetClientPosts, useGetClientPostCategories, useGetStoriesClient } from 'api/homePage';
import { STORAGE_URL } from 'config/config';

// Helper lấy URL ảnh đại diện (Đồng bộ với Laravel storage)
const getThumbnailUrl = (url) => {
  if (!url) return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='540' fill='%23e2e8f0'%3E%3Crect width='900' height='540'/%3E%3C/svg%3E";
  if (url.startsWith("http")) return url;
  return `${STORAGE_URL}${url}`;
};

// Helper tạo slug từ text tiếng Việt không dấu để làm ID neo link
const createSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu tiếng Việt
    .replace(/[đĐ]/g, "d")
    .replace(/([^0-9a-z-\s])/g, "") // Loại bỏ ký tự đặc biệt
    .replace(/(\s+)/g, "-") // Thay khoảng trắng bằng dấu -
    .replace(/-+/g, "-") // Bỏ nhiều dấu - liên tiếp
    .replace(/^-+|-+$/g, ""); // Cắt bỏ dấu - ở đầu và cuối
};

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const postId = Number(id);

  // Lưu trữ danh sách mục lục (TOC)
  const [toc, setToc] = useState([]);
  const [isTocOpen, setIsTocOpen] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // 1. Lấy toàn bộ danh sách bài viết & danh mục từ Backend
  const { data: postsResponse, isLoading } = useGetClientPosts();
  const { data: categoriesResponse } = useGetClientPostCategories();
  const { data: storiesResponse } = useGetStoriesClient();

  // Chuyển đổi dữ liệu thô nhận về an toàn
  const posts = useMemo(() => {
    return Array.isArray(postsResponse)
      ? postsResponse
      : (postsResponse?.data?.data || postsResponse?.data || []);
  }, [postsResponse]);

  const categories = useMemo(() => {
    return Array.isArray(categoriesResponse)
      ? categoriesResponse
      : (categoriesResponse?.data?.data || categoriesResponse?.data || []);
  }, [categoriesResponse]);

  const stories = useMemo(() => {
    return Array.isArray(storiesResponse)
      ? storiesResponse
      : (storiesResponse?.data?.data || storiesResponse?.data || []);
  }, [storiesResponse]);

  // 2. Tìm bài viết hiện tại theo ID
  const post = useMemo(() => {
    return posts.find((item) => Number(item.id) === postId);
  }, [posts, postId]);

  // 3. Tìm các bài viết liên quan
  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return posts
      .filter((item) => Number(item.category_id) === Number(post.category_id) && Number(item.id) !== postId)
      .slice(0, 3);
  }, [posts, post, postId]);

  // 4. Các bài viết đọc nhiều / mới nhất cho Sidebar
  const recentPosts = useMemo(() => {
    if (!posts) return [];
    return posts
      .filter((item) => Number(item.id) !== postId)
      .slice(0, 5);
  }, [posts, postId]);

  // 5. Kho truyện audio gợi ý
  const featuredStories = useMemo(() => {
    if (!stories) return [];
    return stories.slice(0, 4);
  }, [stories]);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} - Bài Viết & Tin Tức`;
      // Khởi tạo lượt thích giả định ban đầu
      setLikeCount(post.likes_count || Math.floor((post.views || 20) / 4) || 8);
    } else {
      document.title = "Đang tải bài viết...";
    }
  }, [post]);

  // Lắng nghe tiến trình cuộn trang để hiển thị thanh đọc bài viết trên đỉnh
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Xử lý nội dung bài viết và dựng TOC
   */
  const parsedContent = useMemo(() => {
    if (!post?.content || !post.content.includes('<')) {
      return { html: post?.content || '', headings: [] };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(post.content, 'text/html');

    // Tìm các thẻ tiêu đề trong nội dung bài viết
    const headingElements = doc.querySelectorAll('h2, h3, h4');
    const headingsData = [];

    headingElements.forEach((el, index) => {
      const text = el.textContent.trim();
      if (!text) return;

      const headingId = `heading-${createSlug(text)}-${index}`;
      el.setAttribute('id', headingId);

      headingsData.push({
        id: headingId,
        text: text,
        level: parseInt(el.tagName.replace('H', ''), 10)
      });
    });

    return {
      html: doc.body.innerHTML,
      headings: headingsData
    };
  }, [post?.content]);

  // Cập nhật TOC state mỗi khi nội dung bài viết thay đổi
  useEffect(() => {
    if (parsedContent.headings) {
      setToc(parsedContent.headings);
    }
  }, [parsedContent]);

  // Hàm xử lý cuộn mượt mà khi click vào mục lục
  const handleTocClick = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Xử lý nút Thích bài viết
  const handleLikeToggle = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  // Hàm xử lý click nút Chia sẻ
  const handleSharePost = async () => {
    const shareData = {
      title: post?.title || document.title,
      text: `Mời bạn đọc bài viết: ${post?.title}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Lỗi khi chia sẻ:', error);
        }
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Đã sao chép liên kết bài viết vào bộ nhớ tạm!");
      } catch (err) {
        console.error('Không thể sao chép liên kết:', err);
      }
    }
  };

  // Loading State
  if (isLoading) return <PostDetailSkeleton />;

  // Empty State
  if (!post) {
    return (
      <div className="container post-wp-detail-page">
        <div className="empty-state-card">
          <h2>Xin lỗi, bài viết không tồn tại</h2>
          <p>Có thể bài viết đã được đổi đường dẫn hoặc tạm gỡ bỏ.</p>
          <button className="btn-back" onClick={() => navigate(-1)}>
            <FaChevronLeft /> Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // Tính toán thời gian đọc dựa trên nội dung thật
  const rawContent = post.content || '';
  const readTime = `${Math.max(1, Math.round(rawContent.replace(/<[^>]*>/g, '').length / 220))} phút đọc`;

  // Avatar tác giả
  const authorAvatar = post.user?.avatar
    ? getThumbnailUrl(post.user.avatar)
    : `https://i.pravatar.cc/120?img=${(post.author || 0) + 12}`;

  const authorName = post.user?.name || post.author || 'Ban Biên Tập';

  return (
    <div className="post-wp-detail-page">
      {/* Thanh đo tiến trình cuộn bài viết (Reading Progress Bar) */}
      <div
        className="reading-progress-bar"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      <div className="container-wp">
        {/* WordPress Breadcrumb Bar */}
        <nav className="post-wp-breadcrumbs" aria-label="Breadcrumbs">
          <Link to="/" className="crumb-link"><FaHome /> Trang chủ</Link>
          <FaChevronRight className="crumb-sep" />
          <Link to="/bai-viet" className="crumb-link">Bài viết & Cẩm nang</Link>
          <FaChevronRight className="crumb-sep" />
          {post.category && (
            <>
              <span className="crumb-cat">{post.category.name || 'Chuyên mục'}</span>
              <FaChevronRight className="crumb-sep" />
            </>
          )}
          <span className="crumb-current">{post.title}</span>
        </nav>

        {/* Layout 2 Cột WordPress Editorial: Main Content (70%) + Sidebar (30%) */}
        <div className="post-wp-layout">

          {/* CỘT NỘI DUNG CHÍNH (70%) */}
          <main className="post-wp-main">
            <article className="wp-article-card">

              {/* Post Header */}
              <header className="article-header">
                <div className="header-top-row">
                  <span className="wp-badge-cat">{post.category?.name || 'Tin tức'}</span>
                  <button className="btn-back-inline" onClick={() => navigate(-1)} title="Quay lại">
                    <FaChevronLeft /> Quay lại
                  </button>
                </div>

                <h1 className="wp-entry-title">{post.title}</h1>

                {/* Byline Metadata kiểu WordPress Tạp chí */}
                <div className="wp-byline">
                  <div className="byline-author">
                    <img src={authorAvatar} alt={authorName} className="author-thumb" />
                    <div className="author-info">
                      <strong className="author-name">{authorName}</strong>
                      <span className="author-role">Biên tập viên</span>
                    </div>
                  </div>

                  <div className="byline-meta-group">
                    <span className="meta-item">
                      <FaCalendarAlt /> {new Date(post.created_at).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="meta-item">
                      <FaClock /> {readTime}
                    </span>
                    {post.views !== undefined && (
                      <span className="meta-item">
                        <FaEye /> {post.views.toLocaleString()} lượt xem
                      </span>
                    )}
                  </div>
                </div>
              </header>

              {/* Featured Media (Ảnh bìa bài viết) */}
              <div className="article-featured-media">
                <img
                  src={getThumbnailUrl(post.avatar_post || post.thumbnail)}
                  alt={post.title}
                  className="featured-image"
                />
              </div>

              {/* Khung Table of Contents (Chỉ hiện khi có tiêu đề H2, H3, H4) */}
              {toc.length > 0 && (
                <div className="wp-toc-card">
                  <div className="toc-header" onClick={() => setIsTocOpen(!isTocOpen)}>
                    <div className="toc-title-wrap">
                      <FaListUl className="toc-icon" />
                      <span>Mục lục bài viết ({toc.length} phần)</span>
                    </div>
                    <button className="btn-toc-toggle" type="button">
                      {isTocOpen ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>

                  {isTocOpen && (
                    <ul className="toc-tree">
                      {toc.map((heading) => (
                        <li
                          key={heading.id}
                          className={`toc-node toc-level-${heading.level}`}
                        >
                          <a
                            href={`#${heading.id}`}
                            onClick={(e) => handleTocClick(e, heading.id)}
                          >
                            {heading.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Nội dung bài viết (Article Body) */}
              <div className="article-content-body">
                {post.content && post.content.includes('<') ? (
                  <div dangerouslySetInnerHTML={{ __html: parsedContent.html }} />
                ) : (
                  <p>{post.content}</p>
                )}
              </div>

              {/* Action Toolbar & Tags (Cuối bài viết) */}
              <footer className="article-footer-toolbar">
                <div className="footer-tags">
                  <span className="tag-label"><FaFolder /> Chuyên mục:</span>
                  <span className="tag-pill">{post.category?.name || 'Tổng hợp'}</span>
                </div>

                <div className="footer-actions">
                  <button
                    type="button"
                    className={`btn-like-article ${isLiked ? 'active' : ''}`}
                    onClick={handleLikeToggle}
                  >
                    <FaHeart className="heart-icon" />
                    <span>{isLiked ? 'Đã thích' : 'Yêu thích'}</span>
                    <span className="like-badge">{likeCount}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-share-article"
                    onClick={handleSharePost}
                  >
                    <FaShareAlt />
                    <span>Chia sẻ</span>
                  </button>
                </div>
              </footer>

              {/* Author Bio Box (Hộp thông tin tác giả kiểu WordPress) */}
              <div className="wp-author-box">
                <img src={authorAvatar} alt={authorName} className="box-avatar" />
                <div className="box-info">
                  <h4 className="box-name">Về tác giả: {authorName}</h4>
                  <p className="box-bio">
                    Tác giả & biên tập viên tại Audio Story. Chuyên chia sẻ các cẩm nang, kiến thức phân tích, review sách và cốt truyện hấp dẫn.
                  </p>
                </div>
              </div>

            </article>

            {/* Brand Advertisement Banner */}
            <BrandAdBanner position="blog_page" />

            {/* Bài viết liên quan (Related Posts Grid) */}
            {relatedPosts.length > 0 && (
              <section className="wp-related-posts-card">
                <div className="related-header">
                  <h3><FaFire /> Bài viết cùng chủ đề</h3>
                </div>
                <div className="related-grid">
                  {relatedPosts.map((item) => (
                    <Link
                      key={item.id}
                      to={`/post/${item.id}`}
                      className="related-post-card"
                    >
                      <div className="thumb-frame">
                        <img
                          src={getThumbnailUrl(item.avatar_post || item.thumbnail)}
                          alt={item.title}
                          className="thumb-img"
                        />
                      </div>
                      <div className="card-meta-text">
                        <span className="post-date">
                          <FaCalendarAlt /> {new Date(item.created_at).toLocaleDateString('vi-VN')}
                        </span>
                        <h4 className="post-title">{item.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Khu vực bình luận cộng đồng */}
            <section className="wp-comments-section">
              <div className="comments-card-header">
                <h3>💬 Bình luận & Thảo luận</h3>
                <p>Hãy để lại góc nhìn của bạn để cùng trao đổi với bạn đọc.</p>
              </div>
              <div className="comments-box-container">
                <CommentBox postId={postId} />
              </div>
            </section>

          </main>

          {/* CỘT SIDEBAR WIDGETS (30%) */}
          <aside className="post-wp-sidebar">

            {/* Widget 1: Giới thiệu blog */}
            <div className="sidebar-widget widget-about">
              <div className="widget-header">
                <h4><FaUser /> Biên tập viên</h4>
              </div>
              <div className="about-content">
                <img src={authorAvatar} alt={authorName} className="about-avatar" />
                <strong className="about-title">{authorName}</strong>
                <p className="about-desc">
                  Chia sẻ câu chuyện, bài viết công nghệ và các tác phẩm audio độc quyền mỗi ngày.
                </p>
              </div>
            </div>

            {/* Widget 2: Bài viết mới / Đọc nhiều */}
            {recentPosts.length > 0 && (
              <div className="sidebar-widget widget-recent-posts">
                <div className="widget-header">
                  <h4><FaFire /> Bài viết xem nhiều</h4>
                </div>
                <div className="recent-list">
                  {recentPosts.map((item, index) => (
                    <Link
                      key={item.id}
                      to={`/post/${item.id}`}
                      className="recent-item"
                    >
                      <span className="rank-num">#{index + 1}</span>
                      <div className="recent-meta">
                        <h5 className="recent-title">{item.title}</h5>
                        <span className="recent-date">
                          <FaCalendarAlt /> {new Date(item.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Widget 3: Chuyên mục phổ biến */}
            {categories.length > 0 && (
              <div className="sidebar-widget widget-categories">
                <div className="widget-header">
                  <h4><FaFolder /> Chuyên mục bài viết</h4>
                </div>
                <ul className="category-list">
                  {categories.map((cat) => (
                    <li key={cat.id} className="category-item">
                      <Link to={`/bai-viet?category=${cat.id}`} className="category-link">
                        <span>{cat.name || cat.title}</span>
                        <FaArrowRight className="arrow-icon" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Widget 4: Kho truyện Audio nổi bật */}
            {featuredStories.length > 0 && (
              <div className="sidebar-widget widget-audio-promo">
                <div className="widget-header">
                  <h4><FaHeadphones /> Nghe Audio Truyện Hay</h4>
                </div>
                <p className="widget-sub">Khám phá các bộ truyện audio hấp dẫn, giọng đọc truyền cảm.</p>
                <div className="audio-stories-mini">
                  {featuredStories.map((story) => (
                    <Link key={story.id} to={`/story/${story.slug}`} className="audio-mini-item">
                      <img
                        src={getThumbnailUrl(story.thumbnail)}
                        alt={story.title}
                        className="audio-thumb"
                      />
                      <div className="audio-meta">
                        <strong className="story-title">{story.title}</strong>
                        <span className="story-views">
                          <FaHeadphones /> {(story.views || 0).toLocaleString()} lượt nghe
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link to="/truyen" className="btn-explore-audio">
                  Vào kho truyện <FaArrowRight />
                </Link>
              </div>
            )}

          </aside>

        </div>
      </div>
    </div>
  );
};

const PostDetailSkeleton = () => {
  return (
    <div className="post-wp-detail-page skeleton-mode">
      <div className="container-wp">
        <div className="sk-bar w-30"></div>
        <div className="post-wp-layout">
          <div className="post-wp-main">
            <div className="sk-box header-sk">
              <div className="sk-line w-20"></div>
              <div className="sk-line w-80 title-sk"></div>
              <div className="sk-line w-40"></div>
            </div>
            <div className="sk-box media-sk"></div>
            <div className="sk-box content-sk">
              <div className="sk-line w-100"></div>
              <div className="sk-line w-90"></div>
              <div className="sk-line w-95"></div>
              <div className="sk-line w-60"></div>
            </div>
          </div>
          <div className="post-wp-sidebar">
            <div className="sk-box sidebar-sk"></div>
            <div className="sk-box sidebar-sk"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;