import React, { useState, useEffect, useMemo, memo } from "react";
import { Link } from "react-router-dom";
import {
    FaFire,
    FaClock,
    FaNewspaper,
    FaEye,
    FaHeadphones,
    FaChevronRight,
    FaUser,
    FaCrown,
    FaLock,
    FaUnlock,
    FaBookOpen,
    FaStar,
    FaPlay,
    FaCompass,
} from "react-icons/fa";
import {
    useGetStoriesClient,
    useGetAllChaptersClient,
    useGetClientPosts
} from "api/homePage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { STORAGE_URL } from "config/config";
import BrandAdBanner from "components/BrandAdBanner";
import "./style.scss";

// Utility định dạng lượt xem
const formatViews = (n) => {
    if (!n) return "0";
    return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
};

// Utility thời gian trước
const timeAgo = (dateStr) => {
    if (!dateStr) return "Vừa xong";
    const diff = (Date.now() - new Date(dateStr)) / 1000 / 60;
    if (diff < 1) return "Vừa xong";
    if (diff < 60) return `${Math.floor(diff)} phút trước`;
    if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
    return `${Math.floor(diff / 1440)} ngày trước`;
};

// Utility lấy đường dẫn thumbnail
const getThumbnailUrl = (url) => {
    if (!url) {
        return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' fill='%23cbd5e1'%3E%3Crect width='300' height='400'/%3E%3C/svg%3E";
    }
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${STORAGE_URL}${url}`;
};

// Dải thể loại nổi bật (WordPress Category Ribbon)
const GENRES_RIBBON = [
    { label: "Tất cả thể loại", slug: "", icon: <FaCompass /> },
    { label: "Ngôn Tình", slug: "ngon-tinh" },
    { label: "Tiên Hiệp", slug: "tien-hiep" },
    { label: "Đô Thị", slug: "do-thi" },
    { label: "Trinh Thám", slug: "trinh-tham" },
    { label: "Kinh Dị", slug: "kinh-di" },
    { label: "Học Đường", slug: "hoc-duong" },
    { label: "Huyền Huyễn", slug: "huyen-huyen" },
];

const GenreRibbon = () => (
    <div className="hp-genre-ribbon">
        <div className="hp-genre-scroll">
            {GENRES_RIBBON.map((g, idx) => (
                <Link
                    key={idx}
                    to={g.slug ? `/truyen?category=${g.slug}` : "/truyen"}
                    className={`hp-genre-pill ${idx === 0 ? "active" : ""}`}
                >
                    {g.icon && <span className="pill-icon">{g.icon}</span>}
                    {g.label}
                </Link>
            ))}
        </div>
    </div>
);

// Bảng Xếp Hạng Thịnh Hành (Trending Section)
const TrendingSection = ({ stories }) => {
    if (!stories || stories.length === 0) return null;

    const topOne = stories[0];
    const topOthers = stories.slice(1, 6);

    return (
        <section className="hp-section hp-trending-section">
            <div className="hp-section-header">
                <div className="hp-section-title-wrap">
                    <span className="section-icon-badge fire">
                        <FaFire />
                    </span>
                    <div>
                        <h2 className="hp-section-title">Bảng Xếp Hạng Thịnh Hành</h2>
                        <p className="hp-section-subtitle">Những bộ truyện Audio thu hút lượt nghe đông đảo nhất</p>
                    </div>
                </div>
                <Link to="/truyen" className="hp-view-all">
                    Xem tất cả <FaChevronRight className="arrow-icon" />
                </Link>
            </div>

            <div className="hp-trending-grid">
                {/* #1 Top Trending Big Card */}
                {topOne && (
                    <Link to={`/story/${topOne.slug}`} className="hp-trending-big-card">
                        <div className="big-card-cover-wrap">
                            <img
                                src={getThumbnailUrl(topOne.thumbnail)}
                                alt={topOne.title}
                                className="big-card-img"
                                onError={(e) => { e.target.src = "/placeholder.png"; }}
                            />
                            <div className="big-card-overlay">
                                <div className="overlay-top">
                                    <span className="rank-badge rank-1">#1 HOT NHẤT</span>
                                    {topOne.category?.name && (
                                        <span className="category-tag">{topOne.category.name}</span>
                                    )}
                                </div>
                                <div className="overlay-bottom">
                                    <h3 className="big-card-title">{topOne.title}</h3>
                                    {topOne.summary && (
                                        <p className="big-card-summary">
                                            {topOne.summary.slice(0, 110)}{topOne.summary.length > 110 ? "..." : ""}
                                        </p>
                                    )}
                                    <div className="big-card-meta">
                                        <span className="meta-item">
                                            <FaEye /> {formatViews(topOne.views)} lượt nghe
                                        </span>
                                        <span className="meta-item">
                                            <FaHeadphones /> {topOne.total_chapters || topOne.chapters_count || 0} tập
                                        </span>
                                        <span className="meta-item">
                                            <FaUser /> {topOne.author || "Tác giả"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                )}

                {/* #2 - #6 Ranked Items */}
                <div className="hp-trending-list">
                    {topOthers.map((s, idx) => {
                        const rank = idx + 2;
                        return (
                            <Link key={s.id} to={`/story/${s.slug}`} className="hp-trending-item">
                                <span className={`rank-number rank-${rank}`}>
                                    {String(rank).padStart(2, "0")}
                                </span>
                                <div className="item-thumb-box">
                                    <img
                                        src={getThumbnailUrl(s.thumbnail)}
                                        alt={s.title}
                                        className="item-thumb"
                                        onError={(e) => { e.target.src = "/placeholder.png"; }}
                                    />
                                </div>
                                <div className="item-info">
                                    <h4 className="item-title">{s.title}</h4>
                                    <p className="item-summary">
                                        {s.summary || s.description || "Không có tóm tắt nội dung"}
                                    </p>
                                    <div className="item-meta">
                                        <span className="meta-sub">
                                            <FaEye /> {formatViews(s.views)}
                                        </span>
                                        {s.rating && (
                                            <span className="meta-sub rating">
                                                <FaStar /> {s.rating}
                                            </span>
                                        )}
                                        <span className="meta-sub">
                                            <FaHeadphones /> {s.total_chapters || s.chapters_count || 0} tập
                                        </span>
                                        <span className="meta-sub author">
                                            {s.author || "Chưa rõ"}
                                        </span>
                                    </div>
                                </div>
                                <div className="item-arrow">
                                    <FaChevronRight />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

// Tập Mới Cập Nhật (New Chapters Section)
const NewChaptersSection = ({ chapters, handleChapterAccess }) => {
    if (!chapters || chapters.length === 0) {
        return (
            <section className="hp-section hp-chapters-section">
                <div className="hp-section-header">
                    <div className="hp-section-title-wrap">
                        <span className="section-icon-badge clock">
                            <FaClock />
                        </span>
                        <div>
                            <h2 className="hp-section-title">Tập Mới Cập Nhật</h2>
                            <p className="hp-section-subtitle">Các chương audio vừa được xuất bản gần đây</p>
                        </div>
                    </div>
                </div>
                <div className="hp-empty-box">
                    <p>Hiện chưa có chương truyện nào được phát hành.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="hp-section hp-chapters-section">
            <div className="hp-section-header">
                <div className="hp-section-title-wrap">
                    <span className="section-icon-badge clock">
                        <FaClock />
                    </span>
                    <div>
                        <h2 className="hp-section-title">Tập Mới Cập Nhật</h2>
                        <p className="hp-section-subtitle">Nghe ngay các chương audio mới phát hành trên hệ thống</p>
                    </div>
                </div>
                <Link to="/truyen" className="hp-view-all">
                    Xem kho truyện <FaChevronRight className="arrow-icon" />
                </Link>
            </div>

            <div className="hp-chapters-grid">
                {chapters.slice(0, 8).map((ch, idx) => {
                    const isVip = parseInt(ch.is_vip) === 1;

                    return (
                        <Link
                            key={ch.id}
                            to={`/story/${ch.story?.slug}`}
                            className={`hp-chapter-card ${isVip ? "is-vip-card" : ""}`}
                            onClick={(e) => handleChapterAccess(e, ch)}
                        >
                            <div className="card-index-col">
                                <span className="chapter-index-num">
                                    {String(idx + 1).padStart(2, "0")}
                                </span>
                            </div>

                            <div className="card-main-col">
                                <div className="card-story-row">
                                    <FaBookOpen className="story-icon" />
                                    <span className="story-title-name">
                                        {ch.story?.title || "Truyện audio"}
                                    </span>
                                </div>
                                <h4 className="card-chapter-title">
                                    {ch.chapter_name || `Chương ${ch.chapter_number}`}
                                </h4>
                                <div className="card-footer-meta">
                                    <span className="meta-time">
                                        <FaClock /> {timeAgo(ch.created_at)}
                                    </span>
                                    <span className="meta-views">
                                        <FaEye /> {formatViews(ch.views)}
                                    </span>
                                </div>
                            </div>

                            <div className="card-action-col">
                                {isVip ? (
                                    <span className="badge-vip-pill">
                                        <FaCrown /> VIP
                                    </span>
                                ) : (
                                    <span className="badge-free-pill">
                                        <FaUnlock /> Miễn phí
                                    </span>
                                )}
                                <div className="card-play-btn" title="Nghe ngay">
                                    <FaPlay className="play-ico" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

// Bài Viết Nổi Bật (Editorial & Posts Section)
const PostsSection = ({ posts }) => {
    if (!posts || posts.length === 0) return null;

    const featuredPost = posts[0];
    const otherPosts = posts.slice(1, 4);

    return (
        <section className="hp-section hp-posts-section">
            <div className="hp-section-header">
                <div className="hp-section-title-wrap">
                    <span className="section-icon-badge news">
                        <FaNewspaper />
                    </span>
                    <div>
                        <h2 className="hp-section-title">Bài Viết & Tin Tức Mới</h2>
                        <p className="hp-section-subtitle">Góc chia sẻ, cảm nhận văn học và tin tức nổi bật từ ban biên tập</p>
                    </div>
                </div>
                <Link to="/posts" className="hp-view-all">
                    Xem tất cả bài viết <FaChevronRight className="arrow-icon" />
                </Link>
            </div>

            <div className="hp-posts-grid">
                {/* Large Featured Article */}
                {featuredPost && (
                    <Link to={`/post/${featuredPost.id}`} className="hp-post-featured-card">
                        <div className="featured-img-wrap">
                            <img
                                src={getThumbnailUrl(featuredPost.avatar_post || featuredPost.thumbnail)}
                                alt={featuredPost.title}
                                className="featured-img"
                                onError={(e) => { e.target.src = "/placeholder.png"; }}
                            />
                            <span className="post-category-tag">
                                {featuredPost.category?.name || "Tin tức"}
                            </span>
                        </div>
                        <div className="featured-body">
                            <h3 className="featured-title">{featuredPost.title}</h3>
                            <p className="featured-excerpt">
                                {featuredPost.description ||
                                    (featuredPost.content
                                        ? featuredPost.content.replace(/<[^>]*>/g, "").slice(0, 130) + "..."
                                        : "")}
                            </p>
                            <div className="featured-meta">
                                <span className="meta-item">
                                    <FaEye /> {formatViews(featuredPost.views)} lượt đọc
                                </span>
                                <span className="meta-divider">·</span>
                                <span className="meta-item">
                                    {new Date(featuredPost.created_at).toLocaleDateString("vi-VN")}
                                </span>
                            </div>
                        </div>
                    </Link>
                )}

                {/* 3 Compact Post Cards */}
                <div className="hp-posts-compact-list">
                    {otherPosts.map((p) => (
                        <Link key={p.id} to={`/post/${p.id}`} className="hp-post-compact-item">
                            <div className="compact-img-wrap">
                                <img
                                    src={getThumbnailUrl(p.avatar_post || p.thumbnail)}
                                    alt={p.title}
                                    className="compact-img"
                                    onError={(e) => { e.target.src = "/placeholder.png"; }}
                                />
                            </div>
                            <div className="compact-body">
                                <span className="compact-category">
                                    {p.category?.name || "Bài viết"}
                                </span>
                                <h4 className="compact-title">{p.title}</h4>
                                <div className="compact-meta">
                                    <span className="meta-item">
                                        <FaEye /> {formatViews(p.views)}
                                    </span>
                                    <span className="meta-divider">·</span>
                                    <span className="meta-item">
                                        {new Date(p.created_at).toLocaleDateString("vi-VN")}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ==================== MAIN HOMEPAGE ====================
const HomePage = () => {
    useEffect(() => {
        document.title = "Trang chủ ‹ BookAudio - Nền Tảng Truyện Audio & Tin Tức";
    }, []);

    // Lấy thông tin User và phân quyền VIP từ localStorage
    const userInfo = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("USER") || "null");
        } catch {
            return null;
        }
    }, []);

    const isAuthenticated = !!userInfo;
    const isUserVip = userInfo?.membership_plan_id === 1 || userInfo?.membership_plan_id === "";

    // Gọi dữ liệu từ API Backend
    const { data: storiesData, isLoading: isStoriesLoading } = useGetStoriesClient();
    const { data: chaptersResponse, isLoading: isChaptersLoading } = useGetAllChaptersClient();
    const { data: postsResponse, isLoading: isPostsLoading } = useGetClientPosts();

    const chapters = useMemo(() => {
        return Array.isArray(chaptersResponse) ? chaptersResponse : (chaptersResponse?.data || []);
    }, [chaptersResponse]);

    const recentPosts = useMemo(() => {
        const rawPosts = Array.isArray(postsResponse)
            ? postsResponse
            : (postsResponse?.data?.data || postsResponse?.data || []);

        if (rawPosts.length === 0) return [];

        return [...rawPosts]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 4);
    }, [postsResponse]);

    const trendingStories = useMemo(() => {
        const rawStories = Array.isArray(storiesData) ? storiesData : (storiesData?.data || []);

        if (rawStories.length === 0) return [];

        return [...rawStories]
            .sort((a, b) => {
                const viewsA = Number(a.views) || 0;
                const viewsB = Number(b.views) || 0;
                if (viewsB !== viewsA) return viewsB - viewsA;
                const ratingA = Number(a.rating) || 0;
                const ratingB = Number(b.rating) || 0;
                return ratingB - ratingA;
            })
            .slice(0, 6);
    }, [storiesData]);

    // Xử lý kiểm tra và chặn điều hướng nếu click vào chương VIP
    const handleChapterAccess = (e, chapter) => {
        if (!isAuthenticated) {
            e.preventDefault();
            toast.warn("Vui lòng đăng nhập để nghe trọn vẹn chương truyện!");
            return false;
        }

        if (parseInt(chapter.is_vip) === 1) {
            const isAdminOrStaff = userInfo?.role === "admin" || userInfo?.role === "staff";
            if (!isUserVip && !isAdminOrStaff) {
                e.preventDefault();
                toast.error("Đây là nội dung VIP. Vui lòng đăng ký gói thành viên để tiếp tục nghe!");
                return false;
            }
        }
        return true;
    };

    // Skeleton loader
    if (isStoriesLoading || isChaptersLoading || isPostsLoading) {
        return (
            <div className="hp-page-wrapper">
                <div className="hp-skeleton-container">
                    <div className="shimmer skeleton-hero" />
                    <div className="shimmer skeleton-ribbon" />
                    <div className="skeleton-grid-row">
                        <div className="shimmer skeleton-card-big" />
                        <div className="skeleton-cards-stack">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="shimmer skeleton-card-item" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="hp-page-wrapper">
            <ToastContainer position="top-right" autoClose={3000} closeOnClick />

            {/* Hero Magazine Banner */}
            <header className="hp-hero-banner">
                <div className="hp-hero-backdrop-glow" />
                <div className="hp-hero-content-inner">
                    <div className="hero-pill-tag">
                        <span className="dot-pulse" />
                        Kho Truyện Audio & Tin Tức Chọn Lọc
                    </div>

                    <h1 className="hero-main-title">
                        Lắng Nghe Thế Giới Truyện <br className="hero-br" />
                        <span className="accent-gradient">Đậm Chất Cảm Xúc</span>
                    </h1>

                    <p className="hero-main-desc">
                        Hàng ngàn câu chuyện ngôn tình, tiên hiệp, trinh thám được truyền tải qua giọng đọc AI sống động cùng các bài viết văn học sâu sắc mỗi ngày.
                    </p>

                    <div className="hero-action-buttons">
                        <Link to="/truyen" className="btn-hero primary">
                            <FaHeadphones /> Khám phá kho truyện
                        </Link>
                        {!isUserVip ? (
                            <Link to="/membership" className="btn-hero vip">
                                <FaCrown /> Nâng cấp VIP Hội viên
                            </Link>
                        ) : (
                            <span className="btn-hero vip-active">
                                <FaCrown /> Bạn đã là Hội viên VIP
                            </span>
                        )}
                    </div>

                    {/* Feature badges bar */}
                    <div className="hero-features-strip">
                        <span className="feature-item">🎙 Giọng đọc Piper AI chất lượng cao</span>
                        <span className="feature-item">⚡ Cập nhật chương mới mỗi ngày</span>
                        <span className="feature-item">🎧 Hỗ trợ nghe trực tuyến tiện lợi</span>
                    </div>
                </div>
            </header>

            {/* Main Content Container */}
            <main className="hp-main-container">
                {/* Dải thể loại truyện */}
                <GenreRibbon />

                {/* Bảng xếp hạng thịnh hành */}
                <TrendingSection stories={trendingStories} />

                {/* Banner quảng cáo từ Brand (Nếu có thì hiện, không có thì ẩn) */}
                <BrandAdBanner position="home_banner" />

                {/* Tập mới cập nhật */}
                <NewChaptersSection
                    chapters={chapters}
                    handleChapterAccess={handleChapterAccess}
                />

                {/* Bài viết & Tin tức mới */}
                <PostsSection posts={recentPosts} />
            </main>
        </div>
    );
};

export default memo(HomePage);