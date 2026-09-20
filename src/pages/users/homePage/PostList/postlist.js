import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import "./style.scss";
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
    FaUnlock
} from "react-icons/fa";
import {
    useGetStoriesClient,
    useGetAllChaptersClient,
    useGetClientPosts
} from "api/homePage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { STORAGE_URL } from "config/config";

const formatViews = (n) => {
    if (!n) return 0;
    return n >= 1000 ? (n / 1000).toFixed(1) + "k" : n;
};

const timeAgo = (dateStr) => {
    if (!dateStr) return "Vừa xong";
    const diff = (Date.now() - new Date(dateStr)) / 1000 / 60;
    if (diff < 60) return Math.floor(diff) + " phút trước";
    if (diff < 1440) return Math.floor(diff / 60) + " giờ trước";
    return Math.floor(diff / 1440) + " ngày trước";
};

const getThumbnailUrl = (url) => {
    if (!url) return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' fill='%23e2e8f0'%3E%3Crect width='300' height='400'/%3E%3C/svg%3E";
    if (url.startsWith("http")) return url;
    return `${STORAGE_URL}${url}`;
};

// ==================== SECTIONS ====================
const TrendingSection = ({ stories }) => {
    if (!stories || stories.length === 0) return null;

    return (
        <section className="hp-section">
            <div className="hp-section-header">
                <div className="hp-section-title-wrap">
                    <FaFire style={{ color: "#f97316" }} />
                    <h2 className="hp-section-title">Xu Hướng</h2>
                </div>
                <Link to="/truyen" className="hp-view-all">Xem tất cả <FaChevronRight size={11} /></Link>
            </div>

            <div className="hp-trending-grid">
                {stories[0] && (
                    <Link to={`/story/${stories[0].slug}`} className="hp-trending-big">
                        <img src={getThumbnailUrl(stories[0].thumbnail)} alt={stories[0].title} className="hp-trending-big-img" style={{ height: 410, borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }} />
                        <div className="hp-trending-overlay" style={{ height: 410, borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                            <span className="hp-rank-badge">#1 Hot</span>
                            <div>
                                <p className="hp-trending-category">{stories[0].category?.name || "Audio"}</p>
                                <h3 className="hp-trending-title-big">{stories[0].title}</h3>
                                <div className="hp-trending-meta">
                                    <FaEye size={12} /> {formatViews(stories[0].views)} lượt nghe
                                    &nbsp;·&nbsp;
                                    <FaHeadphones size={12} /> {stories[0].total_chapters || stories[0].chapters_count || 0} tập
                                    &nbsp;·&nbsp;
                                    <FaUser /> {stories[0].author || "Tác giả ẩn danh"}
                                </div>
                            </div>
                        </div>
                    </Link>
                )}

                <div className="hp-trending-small-grid">
                    {stories.slice(1, 6).map((s, i) => (
                        <Link key={s.id} to={`/story/${s.slug}`} className="hp-trending-small">
                            <img src={getThumbnailUrl(s.thumbnail)} alt={s.title} className="hp-trending-small-img" />
                            <div className="hp-trending-small-info">
                                <span className="hp-rank-badge-small">#{i + 2}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p className="hp-trending-title-small">{s.title}</p>
                                    <p className="hp-trending-description-small">{s.summary || s.description || "Không có mô tả"}</p>
                                    <p className="hp-trending-meta-small">
                                        <FaEye size={10} /> {formatViews(s.views)}
                                        {s.rating && ` · ⭐ ${s.rating}`}
                                        &nbsp;·&nbsp;
                                        <FaHeadphones size={12} /> {s.total_chapters || s.chapters_count || 0} tập
                                        &nbsp;·&nbsp;
                                        <FaUser /> {s.author || "Tác giả ẩn danh"}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Hiển thị danh sách chương mới đăng từ Backend kèm check VIP/Free
const NewChaptersSection = ({ chapters, handleChapterAccess }) => {
    if (!chapters || chapters.length === 0) {
        return (
            <section className="hp-section">
                <div className="hp-section-header">
                    <div className="hp-section-title-wrap">
                        <FaClock style={{ color: "#3b82f6" }} />
                        <h2 className="hp-section-title">Tập Mới Cập Nhật</h2>
                    </div>
                </div>
                <p style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>Chưa có chương truyện nào được đăng tải.</p>
            </section>
        );
    }

    return (
        <div className="hp-chapter-list" >
            {chapters.slice(0, 5).map((ch, i) => {
                const isVip = parseInt(ch.is_vip) === 1;
                return (
                    <Link
                        key={ch.id}
                        to={`/story/${ch.story?.slug}`}
                        className={`hp-chapter-item ${isVip ? "hp-chapter-vip" : ""}`}
                        onClick={(e) => handleChapterAccess(e, ch)}
                    >
                        {/* 1. Số thứ tự chương */}
                        <span className="hp-chapter-index">{String(i + 1).padStart(2, "0")}</span>

                        {/* 2. 🔥 KHỐI CHÍNH (Gom nhóm thông tin chữ) - Giúp xử lý chống tràn che chữ */}
                        <div className="hp-chapter-info-main">
                            <p className="hp-chapter-story">
                                {ch.story?.title || "Truyện không tồn tại"}
                            </p>
                            <p className="hp-chapter-name">
                                {ch.chapter_name || `Chương ${ch.chapter_number}`}
                            </p>
                        </div>

                        {/* 3. 🔥 KHỐI PHỤ (Gom nhóm các tag và thông số về bên phải) */}
                        <div className="hp-chapter-meta-right">
                            <div className="hp-chapter-badge-wrap">
                                {isVip ? (
                                    <span className="badge-vip-client home-badge"><FaLock size={10} /> VIP</span>
                                ) : (
                                    <span className="badge-free-client home-badge"><FaUnlock size={10} /> Free</span>
                                )
                                }
                            </div>

                            <div className="hp-chapter-time">
                                <FaEye size={10} style={{ marginRight: 4 }} />
                                {formatViews(ch.views)}
                                {/* Trên mobile sẽ ẩn bớt thời gian cho đỡ chật */}
                                <span className="hp-time-text">
                                    <FaClock size={10} style={{ marginRight: 4, marginLeft: 8 }} />
                                    {timeAgo(ch.created_at)}
                                </span>
                            </div>
                        </div>

                        <FaHeadphones className="hp-chapter-icon" />
                    </Link>
                );
            })}
        </div>
    );
};

const PostsSection = ({ posts }) => {
    if (!posts || posts.length === 0) return null;

    return (
        <section className="hp-section">
            <div className="hp-section-header">
                <div className="hp-section-title-wrap">
                    <FaNewspaper style={{ color: "#8b5cf6" }} />
                    <h2 className="hp-section-title">Bài Viết Nổi Bật</h2>
                </div>
                <Link to="/posts" className="hp-view-all">Xem tất cả <FaChevronRight size={11} /></Link>
            </div>

            <div className="hp-posts-grid">
                {posts[0] && (
                    <Link to={`/post/${posts[0].id}`} className="hp-post-featured">
                        <div className="hp-post-img-wrap">
                            <img src={getThumbnailUrl(posts[0].avatar_post || posts[0].thumbnail)} alt={posts[0].title} className="hp-post-img" />
                            <span className="hp-post-cat-badge">{posts[0].category?.name || "Tin tức"}</span>
                        </div>
                        <div className="hp-post-content">
                            <h3 className="hp-post-title-featured">{posts[0].title}</h3>
                            <p className="hp-post-excerpt">
                                {posts[0].description || (posts[0].content ? posts[0].content.replace(/<[^>]*>/g, '').slice(0, 120) + "..." : "")}
                            </p>
                            <div className="hp-post-meta">
                                <FaEye size={12} /> {formatViews(posts[0].views)} lượt xem &nbsp;·&nbsp; {new Date(posts[0].created_at).toLocaleDateString('vi-VN')}
                            </div>
                        </div>
                    </Link>
                )}

                <div className="hp-post-small-list">
                    {posts.slice(1, 4).map((p) => (
                        <Link key={p.id} to={`/post/${p.id}`} className="hp-post-small">
                            <img src={getThumbnailUrl(p.avatar_post || p.thumbnail)} alt={p.title} className="hp-post-small-img" />
                            <div className="hp-post-small-content">
                                <span className="hp-post-cat-tag">{p.category?.name || "Tin tức"}</span>
                                <h4 className="hp-post-title-small">{p.title}</h4>
                                <div className="hp-post-meta">
                                    <FaEye size={11} /> {formatViews(p.views)} &nbsp;·&nbsp; {new Date(p.created_at).toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ==================== MAIN ====================
const HomePage = () => {

    useEffect(() => {
        document.title = "Trang chủ - BookAudio";
    }, []);

    // Lấy thông tin User và phân quyền VIP từ localStorage
    const userInfo = JSON.parse(localStorage.getItem("USER") || "null");
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

    // Hàm kiểm tra và chặn điều hướng nếu click vào chương VIP
    const handleChapterAccess = (e, chapter) => {
        // 2. Nếu chưa đăng nhập thì chặn
        if (!isAuthenticated) {
            e.preventDefault();
            toast.warn("Vui lòng đăng nhập để có trải nghiệm tốt hơn");
            return false;
        }
        if (parseInt(chapter.is_vip) === 1) {
            // 3. Cho phép truy cập nếu là:
            // - Người dùng có role là 'admin' hoặc 'staff' (Admin/Staff)
            // - Hoặc người dùng là 'vip' (Khách hàng trả phí)
            const isAdminOrStaff = userInfo?.role === 'admin' || userInfo?.role === 'staff';

            if (!isUserVip && !isAdminOrStaff) {
                e.preventDefault();
                toast.error("Đây là nội dung VIP. Vui lòng nâng cấp gói thành viên để nghe!");
                return false;
            }
        }
        return true;
    };

    const heroImage = "https://picsum.photos/1600/900?random=hero";
    const [isImageError, setIsImageError] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = heroImage;
        img.onload = () => setIsImageError(false);
        img.onerror = () => setIsImageError(true);
    }, [heroImage]);

    if (isStoriesLoading || isChaptersLoading || isPostsLoading) {
        return (
            <div className="hp-skeleton-page">
                {/* HERO SKELETON */}
                <div className="hp-skeleton-hero">
                    <div className="shimmer hero-line-1"></div>
                    <div className="shimmer hero-line-2"></div>
                    <div className="shimmer hero-buttons"></div>
                </div>

                <div className="hp-container">
                    {/* SECTION TITLE */}
                    {[1, 2, 3].map((i) => (
                        <div className="hp-skeleton-section" key={i}>
                            <div className="shimmer section-title"></div>

                            {/* GRID CARDS */}
                            <div className="hp-skeleton-grid">
                                {[1, 2, 3, 4].map((j) => (
                                    <div className="hp-skeleton-card" key={j}>
                                        <div className="shimmer card-img"></div>
                                        <div className="card-body">
                                            <div className="shimmer line w80"></div>
                                            <div className="shimmer line w60"></div>
                                            <div className="shimmer line w90"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* STYLE */}
                <style jsx="true">{`
                    .hp-skeleton-page {
                        padding: 20px;
                        max-width: 1200px;
                        margin: auto;
                    }

                    .hp-skeleton-hero {
                        height: 260px;
                        border-radius: 16px;
                        background: #0f172a;
                        margin-bottom: 30px;
                        padding: 40px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        gap: 14px;
                    }

                    .hp-skeleton-section {
                        margin-bottom: 40px;
                    }

                    .hp-skeleton-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                        gap: 16px;
                        margin-top: 16px;
                    }

                    .hp-skeleton-card {
                        background: #fff;
                        border-radius: 14px;
                        overflow: hidden;
                        box-shadow: 0 6px 20px rgba(0,0,0,0.05);
                    }

                    .card-body {
                        padding: 12px;
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }

                    .shimmer {
                        position: relative;
                        overflow: hidden;
                        background: #e5e7eb;
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
                            rgba(255,255,255,0.6),
                            transparent
                        );
                        animation: shimmer 1.2s infinite;
                    }

                    @keyframes shimmer {
                        0% { left: -150px; }
                        100% { left: 100%; }
                    }

                    .hero-line-1 { height: 24px; width: 60%; border-radius: 8px; }
                    .hero-line-2 { height: 16px; width: 40%; border-radius: 8px; }
                    .hero-buttons { height: 42px; width: 180px; border-radius: 10px; }

                    .section-title { height: 22px; width: 200px; border-radius: 8px; }

                    .card-img { height: 180px; width: 100%; }

                    .line { height: 12px; border-radius: 6px; }
                    .w80 { width: 80%; }
                    .w60 { width: 60%; }
                    .w90 { width: 90%; }
                `}</style>
            </div>
        );
    }

    return (
        <>
            <div className="hp-page">
                {/* Khởi tạo ToastContainer nhận thông báo hiển thị */}
                <ToastContainer position="top-right" autoClose={3000} closeOnClick />

                <div
                    className="hp-hero"
                    style={isImageError ? { backgroundColor: "#1f2937" } : {}}
                >
                    {!isImageError && (
                        <>
                            <div
                                className="hp-hero-bg-blurred"
                                style={{ backgroundImage: `url(${heroImage})` }}
                            ></div>
                            <div
                                className="hp-hero-bg-clear"
                                style={{ backgroundImage: `url(${heroImage})` }}
                            ></div>
                        </>
                    )}

                    <div className="hp-hero-content">
                        <p className="hp-hero-sub">🎧 Kho truyện audio ngôn tình, giang hồ, học đường</p>
                        <h1 className="hp-hero-title">Nghe Truyện <span className="hp-hero-accent">Mọi Lúc</span>, Mọi Nơi</h1>
                        <div className="hp-hero-btns">
                            <Link to="/truyen" className="hp-btn-primary"><FaHeadphones /> Nghe ngay</Link>
                            {!isUserVip ? (
                                <Link to="/membership" className="hp-btn-outline"><FaCrown /> Đăng ký miễn phí</Link>
                            ) : (
                                <label className="hp-btn-outline"><FaCrown /> Bạn đã là thành viên </label>
                            )}
                        </div>
                    </div>
                </div>

                <div className="hp-container">
                    <TrendingSection stories={trendingStories} />
                    <div className="hp-divider" />

                    {/* Truyền thêm hàm handleChapterAccess vào Section danh sách chương mới */}
                    <NewChaptersSection chapters={chapters} handleChapterAccess={handleChapterAccess} />

                    <div className="hp-divider" />
                    <PostsSection posts={recentPosts} />
                </div>
            </div>

            <style jsx="true">{`
                .hp-hero {
                    position: relative;
                    padding: 80px 20px;
                    text-align: center;
                    color: #fff;
                    overflow: hidden;
                    min-height: 350px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 0.3s ease;
                }

                .hp-hero-bg-blurred {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                    filter: blur(15px) brightness(0.35);
                    z-index: 1;
                }

                .hp-hero-bg-clear {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                    z-index: 2;
                    filter: brightness(0.65);
                    -webkit-mask-image: linear-gradient(to right, transparent 2%, #000 35%, #000 65%, transparent 98%);
                    mask-image: linear-gradient(to right, transparent 2%, #000 35%, #000 65%, transparent 98%);
                }

                .hp-hero-content {
                    position: relative;
                    z-index: 3;
                }
            `}</style>
        </>
    );
};

export default HomePage;