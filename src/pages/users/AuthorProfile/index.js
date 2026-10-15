import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaFacebook,
  FaQrcode,
  FaBookOpen,
  FaFileAlt,
  FaTiktok,
  FaUserCheck,
  FaEnvelope,
  FaHeart,
  FaShareAlt,
  FaGlobeAsia,
  FaHeadphones,
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaSearch,
  FaExternalLinkAlt,
  FaLayerGroup
} from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import { useGetPublicAuthorProfile } from "api/homePage";
import { STORAGE_URL } from "config/config";
import Swal from "sweetalert2";
import "./style.scss";

// Helper giải quyết đường dẫn ảnh chuẩn xác
const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${STORAGE_URL}${path}`;
  return `${STORAGE_URL}/${path}`;
};

const AuthorProfile = () => {
  const { authorName } = useParams();
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'stories' | 'posts' | 'about' | 'donate'
  const [searchTerm, setSearchTerm] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const { data, isLoading, isError, error } = useGetPublicAuthorProfile(authorName);

  const authorData = data?.data || {};
  const profile = authorData?.profile || {};
  const posts = useMemo(
    () => (Array.isArray(authorData?.posts) ? authorData.posts : []),
    [authorData?.posts]
  );
  const stories = useMemo(
    () => (Array.isArray(authorData?.stories) ? authorData.stories : []),
    [authorData?.stories]
  );
  const totalPosts = authorData?.total_posts || posts.length;
  const totalStories = authorData?.total_stories || stories.length;

  // Lọc nội dung theo từ khóa tìm kiếm
  const filteredStories = useMemo(() => {
    if (!searchTerm.trim()) return stories;
    const term = searchTerm.toLowerCase();
    return stories.filter(
      (s) =>
        s.title?.toLowerCase().includes(term) ||
        s.summary?.toLowerCase().includes(term)
    );
  }, [stories, searchTerm]);

  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) return posts;
    const term = searchTerm.toLowerCase();
    return posts.filter(
      (p) =>
        p.title?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
    );
  }, [posts, searchTerm]);

  // Chia sẻ hoặc sao chép liên kết trang tác giả
  const handleShareProfile = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Đã sao chép liên kết trang tác giả!",
          showConfirmButton: false,
          timer: 2000,
        });
      });
    } else {
      Swal.fire({
        title: "Liên kết trang tác giả",
        text: url,
        icon: "info",
        confirmButtonColor: "#1877f2",
      });
    }
  };

  if (isLoading) return <FacebookProfileSkeleton />;

  if (isError) {
    return (
      <div className="fb-profile-page">
        <div className="fb-error-container">
          <div className="error-icon-box">
            <FaUserCheck />
          </div>
          <h3>Không tìm thấy thông tin tác giả</h3>
          <p className="text-muted">
            Tác giả "<strong>{authorName}</strong>" không tồn tại hoặc hệ thống đang bảo trì dữ liệu.
          </p>
          <pre className="error-log">{error?.message || "Lỗi tải dữ liệu"}</pre>
          <Link to="/" className="btn-back-home">
            &larr; Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const avatarUrl = resolveImageUrl(profile.avatar);
  const coverUrl = resolveImageUrl(profile.cover_url);
  const qrUrl = resolveImageUrl(profile.qr_url);

  return (
    <div className="fb-profile-page">
      <div className="fb-profile-sheet">
        {/* 1. COVER PHOTO SECTION (Ảnh bìa phong cách Facebook) */}
        <div className="fb-cover-container">
          {coverUrl ? (
            <img src={coverUrl} alt="Cover" className="fb-cover-image" />
          ) : (
            <div className="fb-cover-placeholder">
              <div className="cover-art-overlay">
                <span className="cover-art-brand">AUDIO STORY CREATOR</span>
              </div>
            </div>
          )}
          <div className="fb-cover-gradient-shade"></div>
        </div>

        {/* 2. PROFILE HEADER BAR (Avatar, Tên & Hàng nút hành động) */}
        <div className="fb-header-bar">
          <div className="fb-header-main">
            {/* Avatar lớn đè mép ảnh bìa */}
            <div className="fb-avatar-container">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={authorName}
                  className="fb-avatar-img"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="fb-avatar-fallback"
                style={{ display: avatarUrl ? "none" : "flex" }}
              >
                {authorName?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <span className="fb-online-badge" title="Tác giả chính thức">
                <FaCheck />
              </span>
            </div>

            {/* Tên tác giả & Thống kê ngắn */}
            <div className="fb-author-info">
              <div className="author-name-row">
                <h1 className="fb-author-name">{authorName}</h1>
                <span className="fb-verified-badge" title="Tác giả đã xác minh">
                  <FaUserCheck />
                  <span>Chính thức</span>
                </span>
              </div>
              <p className="fb-author-subtitle">
                <span>{totalStories} bộ truyện</span>
                <span className="dot-sep">•</span>
                <span>{totalPosts} bài viết</span>
                <span className="dot-sep">•</span>
                <span className="creator-role">Người sáng tạo Audio Story</span>
              </p>
            </div>
          </div>

          {/* Hàng nút hành động chuẩn Facebook */}
          <div className="fb-action-buttons">
            {qrUrl && (
              <button
                type="button"
                className="fb-btn fb-btn-primary"
                onClick={() => setShowQrModal(true)}
              >
                <FaHeart className="icon-pulse" />
                <span>Ủng hộ tác giả</span>
              </button>
            )}

            <button
              type="button"
              className="fb-btn fb-btn-secondary"
              onClick={handleShareProfile}
            >
              {isCopied ? <FaCheck style={{ color: "#16a34a" }} /> : <FaShareAlt />}
              <span>{isCopied ? "Đã copy link" : "Chia sẻ"}</span>
            </button>

            {profile.facebook && (
              <a
                href={profile.facebook}
                target="_blank"
                rel="noreferrer"
                className="fb-btn fb-btn-icon"
                title="Facebook tác giả"
              >
                <FaFacebook />
              </a>
            )}

            {profile.tiktok && (
              <a
                href={profile.tiktok}
                target="_blank"
                rel="noreferrer"
                className="fb-btn fb-btn-icon"
                title="TikTok tác giả"
              >
                <FaTiktok />
              </a>
            )}
          </div>
        </div>

        {/* 3. HORIZONTAL NAV TABS (Menu điều hướng ngang Facebook) */}
        <div className="fb-nav-tabs-wrapper">
          <div className="fb-nav-tabs">
            <button
              type="button"
              className={`fb-tab-item ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              <FaLayerGroup />
              <span>Tất cả</span>
            </button>

            <button
              type="button"
              className={`fb-tab-item ${activeTab === "stories" ? "active" : ""}`}
              onClick={() => setActiveTab("stories")}
            >
              <FaBookOpen />
              <span>Bộ truyện</span>
              <span className="fb-tab-count">{totalStories}</span>
            </button>

            <button
              type="button"
              className={`fb-tab-item ${activeTab === "posts" ? "active" : ""}`}
              onClick={() => setActiveTab("posts")}
            >
              <FaFileAlt />
              <span>Bài viết</span>
              <span className="fb-tab-count">{totalPosts}</span>
            </button>

            <button
              type="button"
              className={`fb-tab-item ${activeTab === "about" ? "active" : ""}`}
              onClick={() => setActiveTab("about")}
            >
              <FaUserCheck />
              <span>Giới thiệu</span>
            </button>

            {qrUrl && (
              <button
                type="button"
                className={`fb-tab-item ${activeTab === "donate" ? "active" : ""}`}
                onClick={() => setActiveTab("donate")}
              >
                <FaQrcode />
                <span>Ủng hộ (QR)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. MAIN BODY: BỐ CỤC 2 CỘT KINH ĐIỂN CỦA FACEBOOK */}
      <div className="fb-body-container">
        {/* CỘT TRÁI (LEFT SIDEBAR: INTRO & TIỆN ÍCH) */}
        <div className="fb-left-column">
          {/* Card: Giới thiệu (Intro) */}
          <div className="fb-card fb-intro-card">
            <h3 className="fb-card-title">Giới thiệu</h3>
            <p className="fb-bio-text">
              Chào mừng bạn đến với góc sáng tạo của <strong>{authorName}</strong> trên Audio Story. Cùng lắng nghe và khám phá các câu chuyện audio hấp dẫn!
            </p>

            <div className="fb-intro-list">
              <div className="fb-intro-item">
                <FaBookOpen className="intro-icon" />
                <span>
                  Đã phát hành <strong>{totalStories}</strong> bộ truyện audio
                </span>
              </div>

              <div className="fb-intro-item">
                <FaFileAlt className="intro-icon" />
                <span>
                  Đã chia sẻ <strong>{totalPosts}</strong> bài viết tâm đắc
                </span>
              </div>

              {profile.email && (
                <div className="fb-intro-item">
                  <FaEnvelope className="intro-icon" />
                  <span>
                    Email: <strong>{profile.email}</strong>
                  </span>
                </div>
              )}

              {profile.zalo && (
                <div className="fb-intro-item">
                  <SiZalo className="intro-icon zalo-icon" />
                  <span>
                    Zalo: <strong>{profile.zalo}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Mạng xã hội */}
            {(profile.facebook || profile.tiktok) && (
              <div className="fb-social-pills">
                {profile.facebook && (
                  <a
                    href={profile.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="fb-social-pill facebook"
                  >
                    <FaFacebook />
                    <span>Facebook</span>
                    <FaExternalLinkAlt className="ext-icon" />
                  </a>
                )}
                {profile.tiktok && (
                  <a
                    href={profile.tiktok}
                    target="_blank"
                    rel="noreferrer"
                    className="fb-social-pill tiktok"
                  >
                    <FaTiktok />
                    <span>TikTok</span>
                    <FaExternalLinkAlt className="ext-icon" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Card: QR Ủng hộ tác giả */}
          {qrUrl && (
            <div className="fb-card fb-donate-widget">
              <div className="donate-widget-header">
                <FaQrcode className="donate-icon" />
                <div>
                  <h4 className="donate-title">Ủng hộ tác giả</h4>
                  <span className="donate-desc">Cảm ơn những đóng góp yêu mến</span>
                </div>
              </div>
              <div
                className="donate-qr-wrapper"
                onClick={() => setShowQrModal(true)}
                title="Nhấn để phóng to mã QR"
              >
                <img src={qrUrl} alt="Mã QR ủng hộ tác giả" className="donate-qr-img" />
                <span className="zoom-hint">Nhấn xem lớn &raquo;</span>
              </div>
              <p className="donate-note">
                Quét mã QR qua ứng dụng Ngân hàng hoặc Ví điện tử để ủng hộ tác giả tiếp tục sáng tạo các câu chuyện mới!
              </p>
            </div>
          )}

          {/* Card: Tác phẩm nổi bật mini */}
          {stories.length > 0 && (
            <div className="fb-card fb-highlights-card">
              <div className="card-header-flex">
                <h3 className="fb-card-title">Truyện nổi bật</h3>
                <button
                  type="button"
                  className="link-all"
                  onClick={() => setActiveTab("stories")}
                >
                  Xem tất cả
                </button>
              </div>
              <div className="highlights-grid">
                {stories.slice(0, 6).map((story) => {
                  const thumb = resolveImageUrl(story.thumbnail);
                  return (
                    <Link
                      to={`/story/${story.slug}`}
                      key={story.id}
                      className="highlight-item"
                      title={story.title}
                    >
                      {thumb ? (
                        <img src={thumb} alt={story.title} className="highlight-img" />
                      ) : (
                        <div className="highlight-placeholder">
                          <FaBookOpen />
                        </div>
                      )}
                      <span className="highlight-title">{story.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* CỘT PHẢI (RIGHT FEED: NỘI DUNG TÁC PHẨM & BÀI VIẾT) */}
        <div className="fb-right-column">
          {/* Thanh tìm kiếm & lọc nhanh */}
          <div className="fb-card fb-feed-filter-bar">
            <div className="feed-search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder={`Tìm kiếm tác phẩm của ${authorName}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchTerm("")}
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <div className="feed-count-summary">
              {activeTab === "all" && (
                <span>
                  Hiển thị <strong>{filteredStories.length + filteredPosts.length}</strong> nội dung
                </span>
              )}
              {activeTab === "stories" && (
                <span>
                  Hiển thị <strong>{filteredStories.length}</strong> bộ truyện
                </span>
              )}
              {activeTab === "posts" && (
                <span>
                  Hiển thị <strong>{filteredPosts.length}</strong> bài viết
                </span>
              )}
            </div>
          </div>

          {/* TAB: GIỚI THIỆU CHI TIẾT */}
          {activeTab === "about" && (
            <div className="fb-card fb-about-detail-card">
              <h3 className="section-heading">Thông tin chi tiết về tác giả</h3>
              <div className="about-grid">
                <div className="about-field">
                  <span className="field-label">Tên tác giả:</span>
                  <span className="field-val highlight">{authorName}</span>
                </div>
                <div className="about-field">
                  <span className="field-label">Vai trò:</span>
                  <span className="field-val">Người sáng tạo Audio Story & Bài viết</span>
                </div>
                {profile.email && (
                  <div className="about-field">
                    <span className="field-label">Địa chỉ email:</span>
                    <span className="field-val">{profile.email}</span>
                  </div>
                )}
                {profile.zalo && (
                  <div className="about-field">
                    <span className="field-label">Liên hệ Zalo:</span>
                    <span className="field-val">{profile.zalo}</span>
                  </div>
                )}
                <div className="about-field">
                  <span className="field-label">Tổng số bộ truyện:</span>
                  <span className="field-val">{totalStories} bộ truyện</span>
                </div>
                <div className="about-field">
                  <span className="field-label">Tổng số bài viết:</span>
                  <span className="field-val">{totalPosts} bài viết</span>
                </div>
              </div>

              {(profile.facebook || profile.tiktok) && (
                <div className="about-social-section">
                  <span className="field-label">Liên kết mạng xã hội:</span>
                  <div className="social-links-list">
                    {profile.facebook && (
                      <a
                        href={profile.facebook}
                        target="_blank"
                        rel="noreferrer"
                        className="social-link fb"
                      >
                        <FaFacebook /> Facebook: {profile.facebook}
                      </a>
                    )}
                    {profile.tiktok && (
                      <a
                        href={profile.tiktok}
                        target="_blank"
                        rel="noreferrer"
                        className="social-link tt"
                      >
                        <FaTiktok /> TikTok: {profile.tiktok}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ỦNG HỘ TÁC GIẢ (QR CODE TOÀN DIỆN) */}
          {activeTab === "donate" && (
            <div className="fb-card fb-donate-detail-card">
              <div className="donate-detail-header">
                <FaHeart className="big-heart-icon" />
                <h3>Ủng hộ tác giả {authorName}</h3>
                <p>
                  Sự ủng hộ và đồng hành của quý độc giả là nguồn động lực to lớn giúp tác giả duy trì đam mê và ra mắt các chương truyện chất lượng.
                </p>
              </div>

              {qrUrl ? (
                <div className="qr-big-box">
                  <img src={qrUrl} alt="QR Code" className="qr-big-image" />
                  <span className="qr-scan-guide">
                    Quét mã qua app Ngân hàng hoặc ví MoMo / ZaloPay
                  </span>
                </div>
              ) : (
                <div className="no-qr-box">
                  <FaQrcode style={{ fontSize: "36px", color: "#94a3b8" }} />
                  <p>Tác giả chưa cập nhật mã QR ủng hộ.</p>
                </div>
              )}
            </div>
          )}

          {/* FEED LIST (FACEBOOK POST CARDS) */}
          {(activeTab === "all" || activeTab === "stories" || activeTab === "posts") && (
            <div className="fb-feed-stream">
              {/* 1. Phần hiển thị truyện audio */}
              {(activeTab === "all" || activeTab === "stories") && (
                <>
                  {activeTab === "all" && filteredStories.length > 0 && (
                    <div className="stream-section-title">
                      <FaBookOpen className="title-icon" />
                      <span>Bộ truyện audio của tác giả</span>
                    </div>
                  )}

                  {filteredStories.map((story) => {
                    const thumb = resolveImageUrl(story.thumbnail);
                    return (
                      <article key={`story-${story.id}`} className="fb-card fb-post-card story-type">
                        {/* Header của bài viết Facebook */}
                        <div className="post-card-header">
                          <div className="post-author-avatar-wrap">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt={authorName} className="post-author-avatar" />
                            ) : (
                              <div className="post-author-fallback">
                                {authorName?.charAt(0)?.toUpperCase() || "A"}
                              </div>
                            )}
                          </div>
                          <div className="post-meta-wrap">
                            <div className="author-row">
                              <span className="post-author-name">{authorName}</span>
                              <span className="post-badge-tag story">Truyện Audio</span>
                            </div>
                            <div className="post-time-row">
                              <span>
                                {story.created_at
                                  ? new Date(story.created_at).toLocaleDateString("vi-VN")
                                  : "Gần đây"}
                              </span>
                              <span className="dot">•</span>
                              <FaGlobeAsia title="Công khai" className="globe-icon" />
                            </div>
                          </div>
                        </div>

                        {/* Thân bài viết */}
                        <div className="post-card-body">
                          <Link to={`/story/${story.slug}`} className="post-title-link">
                            <h4 className="post-title">{story.title}</h4>
                          </Link>
                          {story.summary && (
                            <p className="post-summary-text">{story.summary}</p>
                          )}

                          {/* Thumbnail truyện */}
                          {thumb && (
                            <Link to={`/story/${story.slug}`} className="post-media-frame">
                              <img src={thumb} alt={story.title} className="post-media-image" />
                              <div className="media-play-overlay">
                                <FaHeadphones className="play-icon" />
                                <span>Nghe ngay</span>
                              </div>
                            </Link>
                          )}
                        </div>

                        {/* Chân bài viết (Tương tác / Thống kê) */}
                        <div className="post-card-footer">
                          <div className="post-stats-row">
                            <span className="stat-item">
                              <FaHeadphones className="stat-icon" />
                              <strong>{story.views || 0}</strong> lượt nghe
                            </span>
                            {story.category?.name && (
                              <span className="category-pill">{story.category.name}</span>
                            )}
                          </div>
                          <div className="post-actions-row">
                            <Link to={`/story/${story.slug}`} className="btn-action-listen">
                              <FaHeadphones /> Nghe audio
                            </Link>
                            <button
                              type="button"
                              className="btn-action-share"
                              onClick={() => {
                                const url = `${window.location.origin}/story/${story.slug}`;
                                navigator.clipboard?.writeText(url);
                                Swal.fire({
                                  toast: true,
                                  position: "top-end",
                                  icon: "success",
                                  title: "Đã sao chép liên kết truyện!",
                                  timer: 1800,
                                  showConfirmButton: false,
                                });
                              }}
                            >
                              <FaShareAlt /> Chia sẻ
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </>
              )}

              {/* 2. Phần hiển thị bài viết */}
              {(activeTab === "all" || activeTab === "posts") && (
                <>
                  {activeTab === "all" && filteredPosts.length > 0 && (
                    <div className="stream-section-title">
                      <FaFileAlt className="title-icon" />
                      <span>Bài viết chia sẻ</span>
                    </div>
                  )}

                  {filteredPosts.map((post) => {
                    const postImg = resolveImageUrl(post.avatar_post);
                    return (
                      <article key={`post-${post.id}`} className="fb-card fb-post-card post-type">
                        {/* Header Facebook Post */}
                        <div className="post-card-header">
                          <div className="post-author-avatar-wrap">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt={authorName} className="post-author-avatar" />
                            ) : (
                              <div className="post-author-fallback">
                                {authorName?.charAt(0)?.toUpperCase() || "A"}
                              </div>
                            )}
                          </div>
                          <div className="post-meta-wrap">
                            <div className="author-row">
                              <span className="post-author-name">{authorName}</span>
                              <span className="post-badge-tag article">Bài Viết</span>
                            </div>
                            <div className="post-time-row">
                              <span>
                                {post.created_at
                                  ? new Date(post.created_at).toLocaleDateString("vi-VN")
                                  : "Gần đây"}
                              </span>
                              <span className="dot">•</span>
                              <FaGlobeAsia title="Công khai" className="globe-icon" />
                            </div>
                          </div>
                        </div>

                        {/* Thân bài viết */}
                        <div className="post-card-body">
                          <Link to={`/post/${post.id}`} className="post-title-link">
                            <h4 className="post-title">{post.title}</h4>
                          </Link>
                          {post.description && (
                            <p className="post-summary-text">{post.description}</p>
                          )}

                          {postImg && (
                            <Link to={`/post/${post.id}`} className="post-media-frame">
                              <img src={postImg} alt={post.title} className="post-media-image" />
                            </Link>
                          )}
                        </div>

                        {/* Chân bài viết */}
                        <div className="post-card-footer">
                          <div className="post-stats-row">
                            <span className="stat-item">
                              <FaCalendarAlt className="stat-icon" />
                              Đăng ngày{" "}
                              {post.created_at
                                ? new Date(post.created_at).toLocaleDateString("vi-VN")
                                : "---"}
                            </span>
                          </div>
                          <div className="post-actions-row">
                            <Link to={`/post/${post.id}`} className="btn-action-listen read">
                              <FaFileAlt /> Đọc bài viết
                            </Link>
                            <button
                              type="button"
                              className="btn-action-share"
                              onClick={() => {
                                const url = `${window.location.origin}/post/${post.id}`;
                                navigator.clipboard?.writeText(url);
                                Swal.fire({
                                  toast: true,
                                  position: "top-end",
                                  icon: "success",
                                  title: "Đã sao chép liên kết bài viết!",
                                  timer: 1800,
                                  showConfirmButton: false,
                                });
                              }}
                            >
                              <FaShareAlt /> Chia sẻ
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </>
              )}

              {/* Empty state khi không có nội dung nào */}
              {((activeTab === "all" && filteredStories.length === 0 && filteredPosts.length === 0) ||
                (activeTab === "stories" && filteredStories.length === 0) ||
                (activeTab === "posts" && filteredPosts.length === 0)) && (
                <div className="fb-card fb-empty-state">
                  <div className="empty-icon-circle">
                    <FaBookOpen />
                  </div>
                  <h4>Chưa có nội dung phù hợp</h4>
                  <p>
                    {searchTerm
                      ? `Không tìm thấy tác phẩm nào khớp với từ khóa "${searchTerm}".`
                      : `Tác giả ${authorName} chưa đăng tải tác phẩm nào trong mục này.`}
                  </p>
                  {searchTerm && (
                    <button
                      type="button"
                      className="btn-reset-filter"
                      onClick={() => setSearchTerm("")}
                    >
                      Xóa bộ lọc tìm kiếm
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. MODAL XEM LỚN MÃ QR ỦNG HỘ (DONATE MODAL) */}
      {showQrModal && qrUrl && (
        <div className="fb-qr-modal-overlay" onClick={() => setShowQrModal(false)}>
          <div className="fb-qr-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-box">
                <FaHeart className="heart-icon" />
                <h4>Ủng hộ tác giả {authorName}</h4>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowQrModal(false)}
                aria-label="Đóng"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="qr-modal-frame">
                <img src={qrUrl} alt="Mã QR ủng hộ" className="qr-modal-img" />
              </div>
              <p className="qr-modal-instruction">
                Mở ứng dụng Ngân hàng (Vietcombank, MB, Techcombank...) hoặc ví MoMo, ZaloPay và quét mã để ủng hộ tác giả!
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setShowQrModal(false)}
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* SKELETON LOADING PHONG CÁCH FACEBOOK */
const FacebookProfileSkeleton = () => {
  return (
    <div className="fb-profile-page">
      <div className="fb-profile-sheet">
        <div className="fb-cover-skeleton shimmer"></div>
        <div className="fb-header-bar skeleton-mode">
          <div className="fb-header-main">
            <div className="fb-avatar-skeleton shimmer"></div>
            <div className="fb-info-skeleton">
              <div className="shimmer line-name"></div>
              <div className="shimmer line-sub"></div>
            </div>
          </div>
          <div className="fb-btns-skeleton">
            <div className="shimmer btn-skel"></div>
            <div className="shimmer btn-skel"></div>
          </div>
        </div>
        <div className="fb-nav-tabs skeleton-mode">
          <div className="shimmer tab-skel"></div>
          <div className="shimmer tab-skel"></div>
          <div className="shimmer tab-skel"></div>
        </div>
      </div>

      <div className="fb-body-container">
        <div className="fb-left-column">
          <div className="fb-card p-3">
            <div className="shimmer w-40 h-20 mb-3"></div>
            <div className="shimmer w-90 h-14 mb-2"></div>
            <div className="shimmer w-80 h-14 mb-2"></div>
            <div className="shimmer w-85 h-14 mb-2"></div>
          </div>
        </div>
        <div className="fb-right-column">
          <div className="fb-card p-3 mb-3">
            <div className="shimmer w-100 h-40"></div>
          </div>
          <div className="fb-card p-4 mb-3">
            <div className="d-flex gap-2 mb-3">
              <div className="shimmer avatar-mini"></div>
              <div className="flex-1">
                <div className="shimmer w-30 h-14 mb-1"></div>
                <div className="shimmer w-20 h-10"></div>
              </div>
            </div>
            <div className="shimmer w-80 h-20 mb-2"></div>
            <div className="shimmer w-100 h-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorProfile;