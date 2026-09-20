import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaCalendarAlt, FaChevronLeft, FaHeart, FaListUl } from 'react-icons/fa'; 
import CommentBox from '../Comment/CommentBox';
import './style.scss';

// Import các API hooks công khai của Client
import { useGetClientPosts } from 'api/homePage'; 
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

  // 1. Lấy toàn bộ danh sách bài viết từ Backend
  const { data: postsResponse, isLoading } = useGetClientPosts();
  

  // Chuyển đổi dữ liệu thô nhận về an toàn
  const posts = useMemo(() => {
    return Array.isArray(postsResponse) 
      ? postsResponse 
      : (postsResponse?.data?.data || postsResponse?.data || []);
  }, [postsResponse]);

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

  useEffect(() => {
          if (post) {
          document.title = post.title || "Đang tải...";
          } else {
          document.title = "Đang tải...";
          }
      }, [post]);

  /**
   * 4. Xử lý nội dung bài viết:
   * - CHỈ lấy post.content để dựng TOC và render.
   * - Tuyệt đối không đụng tới post.description.
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

      const id = `heading-${createSlug(text)}-${index}`;
      el.setAttribute('id', id);

      headingsData.push({
        id: id,
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

  // Hàm xử lý cuộn mượt mà (smooth scroll) khi click vào mục lục
  const handleTocClick = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Loading State
  if (isLoading) return <PostDetailSkeleton />;

  // Empty State
  if (!post) {
    return (
      <div className="container post-detail-page">
        <div className="empty-state">
          <h2>Xin lỗi, bài viết không tồn tại</h2>
          <p>Hãy thử quay lại trang trước hoặc chọn một bài viết khác.</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            <FaChevronLeft style={{ marginRight: '5px' }} /> Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Hàm xử lý khi click nút Chia sẻ
  const handleSharePost = async () => {
    const shareData = {
      title: post?.title || document.title,
      text: `Mời bạn đọc bài viết: ${post?.title}`,
      url: window.location.href, // Lấy link hiện tại của bài viết trên thanh địa chỉ
    };

    // Trường hợp 1: Trình duyệt hỗ trợ Web Share API (Mobile Chrome, Safari,...)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Bỏ qua lỗi nếu người dùng bấm "Hủy" (AbortError)
        if (error.name !== 'AbortError') {
          console.error('Lỗi khi chia sẻ:', error);
        }
      }
    } 
    // Trường hợp 2: Phương án dự phòng (Copy link vào Clipboard)
    else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        
        // Sử dụng alert tạm thời (hoặc toast nếu dự án của bạn đã cài react-hot-toast ở Client)
        alert("Đã sao chép liên kết bài viết vào bộ nhớ tạm! Bạn có thể gửi cho bạn bè.");
      } catch (err) {
        console.error('Không thể sao chép liên kết:', err);
        alert("Trình duyệt không hỗ trợ chia sẻ tự động. Hãy sao chép URL trên thanh địa chỉ nhé!");
      }
    }
  };

  // Tính toán thời gian đọc dựa trên nội dung thật
  const rawContent = post.content || '';
  const readTime = `${Math.max(1, Math.round(rawContent.replace(/<[^>]*>/g, '').length / 160))} phút đọc`;
  
  // Avatar tác giả
  const authorAvatar = post.user?.avatar 
    ? getThumbnailUrl(post.user.avatar)
    : `https://i.pravatar.cc/100?img=${(post.author || 0) + 10}`;

  const authorName = post.user?.name || post.author || 'Tác giả';

  return (
    <div className="container post-detail-page">
      <div className="post-detail-layout-vertical">
        <section className="post-panel">
          
          {/* Header Actions */}
          <div className="post-header">
            <button className="btn btn-light" onClick={() => navigate(-1)}>
              <FaChevronLeft style={{ marginRight: '5px' }} /> Quay lại
            </button>
            <span className="post-badge">{post.category?.name || 'Chưa phân loại'}</span>
          </div>

{/* Intro Section - ĐÃ LOẠI BỎ TOÀN BỘ PHẦN HIỂN THỊ DESCRIPTION */}
          <div className="post-intro">
            <h1 className="post-title">{post.title}</h1>
            <div className="post-info">
              <div className="author-box">
                <img src={authorAvatar} alt={authorName} className="author-avatar" />
                <div className="author-meta">
                  <strong>{authorName}</strong>
                  <span>{readTime} · {new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
              <div className="share-meta">{relatedPosts.length} bài viết cùng chủ đề</div>
            </div>
          </div>

{/* Featured Image */}
          <div className="post-media">
            <img src={getThumbnailUrl(post.avatar_post || post.thumbnail)} alt={post.title} className="post-image" />
          </div>

          {/* Khung hiển thị Table of Contents (Chỉ hiện khi có tiêu đề H2, H3, H4) */}
          {toc.length > 0 && (
            <div className="post-toc">
              <div className="toc-title">
                <FaListUl className="toc-icon" />
                <span>Mục lục bài viết</span>
              </div>
              <ul className="toc-list">
                {toc.map((heading) => (
                  <li 
                    key={heading.id} 
                    className={`toc-item toc-level-${heading.level}`}
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
            </div>
          )}

          {/* Content Body - Chỉ render nội dung content thực tế */}
          <article className="post-body">
            {post.content && post.content.includes('<') ? (
              <div dangerouslySetInnerHTML={{ __html: parsedContent.html }} />
            ) : (
              <p>{post.content}</p>
            )}
          </article>

          {/* Footer Metadata */}
          <div className="post-footer">
            <div className="post-tags">
              <span>{post.category?.name || 'Chi tiết'}</span>
            </div>
            <div className="footer-actions">
              <button className="btn btn-like-post">
                <FaHeart style={{ marginRight: '6px' }} /> Thích
              </button>
              <button type="button" className="btn btn-outline" onClick={handleSharePost}>
                Chia sẻ
              </button>
            </div>
          </div>

          {/* Related Posts Section */}
          {relatedPosts.length > 0 && (
            <div className="related-posts">
              <h3>Bài viết liên quan</h3>
              <div className="related-list">
                {relatedPosts.map((item) => (
                  <Link
                    key={item.id}
                    to={`/post/${item.id}`}
                    className="related-item"
                    style={{ textDecoration: 'none', display: 'block', textAlign: 'left' }}
                  >
                    <strong>{item.title}</strong>
                    <span>
                      <FaCalendarAlt style={{ marginRight: '5px', fontSize: '12px' }} />
                      {new Date(item.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Khu vực bình luận ở dưới cùng */}
        <footer className="comments-footer-section">
          <hr className="footer-divider" />
          
          <div className="comments-layout-wrapper">
            <div className="comments-info-card">
              <h4>Góc bình luận</h4>
              <p>Chia sẻ cảm nghĩ của bạn về nội dung này và trao đổi với cộng đồng.</p>
            </div>
            
            <div className="comments-box-wrapper">
              <CommentBox postId={postId} />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

const PostDetailSkeleton = () => {
  return (
    <div className="container post-detail-page">
      <div className="post-detail-layout-vertical skeleton-layout">

        {/* Header */}
        <div className="skeleton-header">
          <div className="shimmer back-btn"></div>
          <div className="shimmer badge"></div>
        </div>

        {/* Title */}
        <div className="skeleton-title shimmer"></div>

        {/* Author */}
        <div className="skeleton-author">
          <div className="shimmer avatar"></div>
          <div className="author-lines">
            <div className="shimmer line w-40"></div>
            <div className="shimmer line w-60"></div>
          </div>
        </div>

        {/* Image */}
        <div className="shimmer hero-image"></div>

        {/* TOC */}
        <div className="toc-skeleton">
          <div className="shimmer toc-title"></div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shimmer toc-item"></div>
          ))}
        </div>

        {/* Content */}
        <div className="article-skeleton">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`shimmer line ${i % 3 === 0 ? "w-90" : i % 2 === 0 ? "w-80" : "w-60"}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;