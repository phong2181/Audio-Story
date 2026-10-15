import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    FaPlay,
    FaStar,
    FaListUl,
    FaUser,
    FaCalendarAlt,
    FaChevronRight,
    FaChevronDown,
    FaChevronUp,
    FaHeadphones,
    FaHeart,
    FaCrown,
    FaUnlock,
    FaArrowRight,
    FaShareAlt,
    FaSearch,
    FaSortAmountDown,
    FaSortAmountUp,
    FaBookOpen,
    FaInfoCircle,
    FaCheckCircle,
    FaHome,
    FaBookmark,
    FaFire,
    FaClock,
    FaVolumeUp,
    FaComments
} from "react-icons/fa";
import "./style.scss";
import {
    useGetStoryDetailClient,
    useCategoriesClient,
    useGetChaptersByStoryClient,
    useGetReviews,
    useAddReview,
    useAddFavorite,
    useRemoveFavorite,
    useGetFavorites,
    useGetChapterDetailClient,
    useGetStoriesClient
} from "api/homePage";
import { useQueryClient } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CommentSection from "../Comment/CommentBox";
import AudioPlayer from "../AudioPlayer";
import { getStorageUrl } from "config/config";
import BrandAdBanner from "components/BrandAdBanner";

const StoryDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("chapters");
    const vipBannerRef = useRef(null);

    // Trình phát Audio Player
    const [playingChapterId, setPlayingChapterId] = useState(null);
    const { data: chapterDetail, isLoading: isAudioLoading } = useGetChapterDetailClient(playingChapterId, {
        enabled: !!playingChapterId,
    });

    // Trạng thái tìm kiếm & sắp xếp chương
    const [chapterSearchQuery, setChapterSearchQuery] = useState("");
    const [chapterSortOrder, setChapterSortOrder] = useState("asc"); // 'asc' = cũ nhất trước, 'desc' = mới nhất trước

    // Trạng thái mở rộng phần mô tả giới thiệu
    const [isDescExpanded, setIsDescExpanded] = useState(false);

    // State cho đánh giá sao
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewContent, setReviewContent] = useState("");
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewMessage, setReviewMessage] = useState({ type: '', text: '' });

    // Trạng thái yêu thích
    const [isToggling, setIsToggling] = useState(false);

    // Lấy thông tin user hiện tại
    const userInfo = JSON.parse(localStorage.getItem("USER") || "null");
    const isAuthenticated = !!userInfo;

    // Kiểm tra quyền VIP / Admin / Staff
    const isAdminOrStaff = userInfo?.role === "admin" || userInfo?.role === "staff" || userInfo?.user_type === "admin";
    const isUserVip = useMemo(() => {
        if (!isAuthenticated) return false;
        if (isAdminOrStaff) return true;
        const vipExpire = userInfo?.vip_expires_at;
        if (!vipExpire) return false;
        return new Date(vipExpire) > new Date();
    }, [userInfo, isAuthenticated, isAdminOrStaff]);

    const queryClient = useQueryClient();

    const openLoginDialog = () => {
        navigate("/login");
    };

    // Lấy dữ liệu truyện, danh mục, chương, đánh giá và toàn bộ truyện (dành cho widget liên quan)
    const { data: storyData, isLoading: isStoriesLoading } = useGetStoryDetailClient(slug);
    const { data: categoriesData } = useCategoriesClient();
    const { data: allStoriesData } = useGetStoriesClient();

    // Chuyển đổi dữ liệu categories an toàn
    const categories = useMemo(() => {
        if (Array.isArray(categoriesData)) return categoriesData;
        if (categoriesData && typeof categoriesData === 'object') {
            const arrayKey = Object.keys(categoriesData).find(key => Array.isArray(categoriesData[key]));
            return arrayKey ? categoriesData[arrayKey] : (categoriesData.data || []);
        }
        return [];
    }, [categoriesData]);

    // Dữ liệu truyện gốc
    const rawStory = storyData?.data || storyData || null;
    const storyId = rawStory ? rawStory.id : null;

    const { data: chaptersData, isLoading: isChaptersLoading } = useGetChaptersByStoryClient(storyId);
    const { data: reviewsData, isLoading: isReviewsLoading } = useGetReviews(storyId);

    const addReviewMutation = useAddReview();
    const addFavoriteMutation = useAddFavorite();
    const removeFavoriteMutation = useRemoveFavorite();
    const { data: favoritesData } = useGetFavorites();

    const isFavorited = favoritesData ? favoritesData.some(fav => fav.id === storyId) : false;
    const userReviewed = reviewsData?.some((review) => review.user_id && review.user_id === userInfo?.id);

    // Danh sách truyện liên quan cho widget WordPress sidebar
    const allStories = useMemo(() => {
        return Array.isArray(allStoriesData) ? allStoriesData : (allStoriesData?.data || []);
    }, [allStoriesData]);

    const relatedStories = useMemo(() => {
        if (!allStories || allStories.length === 0 || !rawStory) return [];
        const sameCategory = allStories.filter(
            (s) => s.id !== rawStory.id && Number(s.category_audio_id) === Number(rawStory.category_audio_id)
        );
        if (sameCategory.length > 0) return sameCategory.slice(0, 5);
        return allStories.filter((s) => s.id !== rawStory.id).slice(0, 5);
    }, [allStories, rawStory]);

    // Kiểm tra quyền khi bấm nghe chương
    const handleChapterAccess = (e, chapter) => {
        if (!chapter?.id) {
            if (e) e.preventDefault();
            toast.error("Không tìm thấy chương!");
            return false;
        }

        if (!isAuthenticated) {
            if (e) e.preventDefault();
            toast.warn("Vui lòng đăng nhập để nghe truyện!");
            openLoginDialog();
            return false;
        }

        if (parseInt(chapter.is_vip) === 1 && !isUserVip) {
            if (e) e.preventDefault();
            toast.error("Đây là nội dung VIP. Vui lòng nâng cấp gói thành viên!");
            setActiveTab("chapters");

            setTimeout(() => {
                vipBannerRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }, 100);

            return false;
        }

        if (e) e.preventDefault();
        setPlayingChapterId(chapter.id);
        return true;
    };

    // Gửi đánh giá
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setReviewMessage({ type: 'error', text: 'Vui lòng đăng nhập để gửi đánh giá.' });
            openLoginDialog();
            return;
        }
        if (userRating === 0) {
            setReviewMessage({ type: 'error', text: 'Vui lòng chọn số sao đánh giá.' });
            return;
        }
        if (!reviewContent.trim()) {
            setReviewMessage({ type: 'error', text: 'Vui lòng viết nội dung đánh giá.' });
            return;
        }
        if (reviewContent.trim().length < 10) {
            setReviewMessage({ type: 'error', text: 'Nội dung đánh giá phải có ít nhất 10 ký tự.' });
            return;
        }
        if (!storyId) {
            setReviewMessage({ type: 'error', text: 'Không tìm thấy truyện để gửi đánh giá.' });
            return;
        }

        const payload = {
            story_id: storyId,
            rating: Number(userRating),
            content: reviewContent.trim(),
        };

        const getReviewErrorMessage = (error) => {
            const responseData = error?.response?.data;
            if (!responseData) return error?.message || 'Có lỗi xảy ra khi gửi đánh giá.';
            if (typeof responseData.message === 'string' && responseData.message.trim()) {
                return responseData.message;
            }
            if (responseData.error) return responseData.error;
            if (responseData.errors && typeof responseData.errors === 'object') {
                return Object.values(responseData.errors).flat().join(' ');
            }
            return responseData.message || JSON.stringify(responseData);
        };

        try {
            await addReviewMutation.mutateAsync(payload);
            setReviewContent("");
            setUserRating(0);
            setShowReviewForm(false);
            setReviewMessage({ type: 'success', text: 'Đánh giá đã được gửi thành công!' });
            setTimeout(() => setReviewMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error("Lỗi khi gửi đánh giá:", error?.response?.data || error);
            const errorMessage = getReviewErrorMessage(error);
            setReviewMessage({ type: 'error', text: errorMessage });
            setTimeout(() => setReviewMessage({ type: '', text: '' }), 5000);
        }
    };

    // Chuyển đổi trạng thái Yêu thích
    const handleFavoriteToggle = async () => {
        if (!isAuthenticated) {
            openLoginDialog();
            return;
        }
        if (!storyId || isToggling) return;

        setIsToggling(true);
        try {
            if (isFavorited) {
                await removeFavoriteMutation.mutateAsync(storyId);
                toast.info("Đã xóa khỏi danh sách yêu thích");
            } else {
                await addFavoriteMutation.mutateAsync({ story_id: storyId });
                toast.success("Đã thêm vào danh sách yêu thích!");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật yêu thích:", error);
            if (error.response?.status === 422) {
                queryClient.invalidateQueries(["favorites"]);
            }
        } finally {
            setIsToggling(false);
        }
    };

    // Chia sẻ trang truyện
    const handleShare = async () => {
        const shareUrl = window.location.href;
        const shareData = {
            title: story?.title || 'Truyện audio đặc sắc',
            text: `Nghe ngay "${story?.title || 'bộ truyện'}" trên Audio Story!`,
            url: shareUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                toast.success('Đã mở chia sẻ.');
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Đã sao chép liên kết truyện vào clipboard!');
            } else {
                const input = document.createElement('input');
                document.body.appendChild(input);
                input.value = shareUrl;
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
                toast.success('Đã sao chép liên kết truyện.');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Lỗi chia sẻ:', error);
                toast.error('Không thể chia sẻ. Vui lòng thử lại.');
            }
        }
    };

    // Chuẩn hóa dữ liệu bộ truyện
    const story = useMemo(() => {
        if (!rawStory) return null;

        const categoryObj = categories.find(c => c.id === rawStory.category_audio_id);
        const categoryName = categoryObj ? (categoryObj.name || categoryObj.title) : "Thể loại";

        let averageRating = rawStory.average_rating || 0;
        if (reviewsData && Array.isArray(reviewsData) && reviewsData.length > 0) {
            const totalRating = reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0);
            averageRating = (totalRating / reviewsData.length).toFixed(1);
        }

        let chaptersArray = [];
        if (chaptersData) {
            if (Array.isArray(chaptersData)) {
                chaptersArray = chaptersData;
            } else if (typeof chaptersData === 'object') {
                chaptersArray = chaptersData.data || chaptersData.chapters || chaptersData.items || [];
                if (chaptersArray.length === 0) {
                    const foundArray = Object.values(chaptersData).find(val => Array.isArray(val));
                    if (foundArray) chaptersArray = foundArray;
                }
            }
        }

        return {
            id: rawStory.id,
            author_id: rawStory.author_id || rawStory.user_id,
            author_slug: rawStory.author_slug,
            slug: rawStory.slug,
            title: rawStory.title,
            author: rawStory.author || "Chưa cập nhật",
            category: categoryName,
            category_id: rawStory.category_audio_id,
            description: rawStory.summary || rawStory.description || "Chưa có tóm tắt chi tiết cho bộ truyện này.",
            viewCount: rawStory.views || 0,
            status: rawStory.status === 'completed' ? 'Hoàn thành' : 'Đang ra',
            rating: averageRating,
            image: rawStory.thumbnail ? getStorageUrl(rawStory.thumbnail) : "https://picsum.photos/400/550",
            createdAt: rawStory.created_at ? new Date(rawStory.created_at).toLocaleDateString('vi-VN') : "Chưa cập nhật",
            chapters: chaptersArray.map((ch, index) => ({
                id: ch.id,
                chapter_id: ch.id,
                chapter_name: ch.chapter_name || ch.title,
                duration: ch.duration || "N/A",
                views: ch.views || 0,
                is_vip: ch.is_vip || 0,
                date: ch.created_at ? new Date(ch.created_at).toLocaleDateString('vi-VN') : "N/A",
                originalIndex: index + 1
            }))
        };
    }, [rawStory, categories, chaptersData, reviewsData]);

    // Lọc & sắp xếp chương
    const filteredChapters = useMemo(() => {
        if (!story?.chapters) return [];
        let list = [...story.chapters];
        if (chapterSearchQuery.trim()) {
            const query = chapterSearchQuery.trim().toLowerCase();
            list = list.filter(ch => (ch.chapter_name || '').toLowerCase().includes(query));
        }
        if (chapterSortOrder === 'desc') {
            list.reverse();
        }
        return list;
    }, [story?.chapters, chapterSearchQuery, chapterSortOrder]);

    useEffect(() => {
        if (story) {
            document.title = `${story.title} - Nghe Audio Hay | Audio Story`;
        }
    }, [story]);

    // Giao diện Skeleton Loading phong cách WordPress
    if (isStoriesLoading || !story) {
        return (
            <div className="story-wp-container skeleton-loading-active">
                {/* Skeleton Breadcrumb */}
                <div className="story-wp-breadcrumbs skeleton-crumb">
                    <div className="sk-item sk-crumb-line"></div>
                </div>

                {/* Skeleton Hero Showcase */}
                <div className="story-wp-hero skeleton-hero">
                    <div className="hero-content-wrap">
                        <div className="hero-cover-card">
                            <div className="sk-item sk-cover-box"></div>
                        </div>
                        <div className="hero-details">
                            <div className="sk-item sk-tag"></div>
                            <div className="sk-item sk-title"></div>
                            <div className="sk-item sk-byline"></div>
                            <div className="hero-specs-grid">
                                <div className="sk-item sk-spec-box"></div>
                                <div className="sk-item sk-spec-box"></div>
                                <div className="sk-item sk-spec-box"></div>
                                <div className="sk-item sk-spec-box"></div>
                            </div>
                            <div className="hero-actions-bar">
                                <div className="sk-item sk-btn-action"></div>
                                <div className="sk-item sk-btn-action-small"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skeleton 2-column layout */}
                <div className="story-wp-layout">
                    <div className="story-wp-main">
                        <div className="sk-item sk-card-large"></div>
                        <div className="sk-item sk-card-chapters"></div>
                    </div>
                    <div className="story-wp-sidebar">
                        <div className="sk-item sk-sidebar-widget"></div>
                        <div className="sk-item sk-sidebar-widget"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="story-wp-container">
            <ToastContainer position="top-right" autoClose={3000} closeOnClick />

            {/* Breadcrumb Bar kiểu WordPress Clean & Elegant */}
            <nav className="story-wp-breadcrumbs" aria-label="Breadcrumb">
                <div className="crumb-wrap">
                    <Link to="/" className="crumb-link"><FaHome /> Trang chủ</Link>
                    <FaChevronRight className="crumb-sep" />
                    <Link to="/truyen" className="crumb-link">Kho truyện audio</Link>
                    <FaChevronRight className="crumb-sep" />
                    <Link to={`/truyen?category=${story.category_id || ''}`} className="crumb-link crumb-category">
                        {story.category}
                    </Link>
                    <FaChevronRight className="crumb-sep" />
                    <span className="crumb-current">{story.title}</span>
                </div>
            </nav>

            {/* WordPress Story Hero Showcase với Ambient Cover Backdrop */}
            <header className="story-wp-hero">
                <div
                    className="hero-ambient-backdrop"
                    style={{ backgroundImage: `url(${story.image})` }}
                    aria-hidden="true"
                />
                <div className="hero-backdrop-gradient" aria-hidden="true" />

                <div className="hero-content-wrap">
                    {/* Bìa truyện 3D Book Cover Card */}
                    <div className="hero-cover-card">
                        <div className="cover-frame">
                            <img
                                src={story.image}
                                alt={story.title}
                                className="cover-img"
                                onError={(e) => { e.target.src = "https://picsum.photos/400/550"; }}
                            />
                            <span className={`status-badge ${story.status === 'Hoàn thành' ? 'completed' : 'ongoing'}`}>
                                {story.status === 'Hoàn thành' ? <FaCheckCircle /> : <FaFire />}
                                {story.status}
                            </span>
                            <div className="cover-footer-pill">
                                <FaHeadphones /> {story.chapters.length} chương audio
                            </div>
                        </div>
                    </div>

                    {/* Chi tiết tiêu đề & Metadata & Actions */}
                    <div className="hero-details">
                        <div className="hero-badge-row">
                            <Link to={`/truyen?category=${story.category_id || ''}`} className="cat-pill">
                                {story.category}
                            </Link>
                            {story.chapters.some(c => parseInt(c.is_vip) === 1) && (
                                <span className="vip-available-pill">
                                    <FaCrown /> Có chương VIP
                                </span>
                            )}
                        </div>

                        <h1 className="hero-title">{story.title}</h1>

                        <div className="hero-byline">
                            <div className="author-pill">
                                <div className="author-avatar-icon"><FaUser /></div>
                                <span>Tác giả:</span>
                                <Link
                                    to={`/authors/${encodeURIComponent(story?.author_slug || story?.author || '')}`}
                                    className="author-name-link"
                                >
                                    <strong>{story?.author || 'Chưa cập nhật'}</strong>
                                </Link>
                            </div>
                            <div className="byline-item">
                                <FaCalendarAlt /> Cập nhật: <span>{story.createdAt}</span>
                            </div>
                        </div>

                        {/* WordPress Quick Specs Grid */}
                        <div className="hero-specs-grid">
                            <div className="spec-card">
                                <span className="spec-label"><FaHeadphones /> Lượt nghe</span>
                                <span className="spec-value">{story.viewCount.toLocaleString()}</span>
                            </div>
                            <div className="spec-card">
                                <span className="spec-label"><FaStar className="star-icon" /> Đánh giá</span>
                                <span className="spec-value">
                                    {story.rating} / 5 <small>({reviewsData ? reviewsData.length : 0} lượt)</small>
                                </span>
                            </div>
                            <div className="spec-card">
                                <span className="spec-label"><FaListUl /> Số tập phát</span>
                                <span className="spec-value">{story.chapters.length} tập</span>
                            </div>
                            <div className="spec-card">
                                <span className="spec-label"><FaBookmark /> Trạng thái</span>
                                <span className="spec-value">{story.status}</span>
                            </div>
                        </div>

                        {/* Actions Toolbar */}
                        <div className="hero-actions-bar">
                            {story.chapters.length > 0 ? (
                                <button
                                    className="btn-wp-primary"
                                    onClick={(e) => handleChapterAccess(e, story.chapters[0])}
                                >
                                    <FaPlay className="play-icon" />
                                    <span>Nghe ngay chương 1</span>
                                    {parseInt(story.chapters[0].is_vip) === 1 && (
                                        <FaCrown className="vip-icon" />
                                    )}
                                </button>
                            ) : (
                                <button className="btn-wp-primary disabled" disabled>
                                    <FaPlay /> Chưa có tập phát
                                </button>
                            )}

                            <button
                                type="button"
                                className={`btn-wp-favorite ${isFavorited ? 'active' : ''}`}
                                onClick={handleFavoriteToggle}
                                disabled={isToggling}
                                title={isFavorited ? "Bỏ yêu thích" : "Lưu vào yêu thích"}
                            >
                                <FaHeart className="heart-icon" />
                                <span>{isToggling ? 'Đang lưu...' : isFavorited ? 'Đã yêu thích' : 'Yêu thích'}</span>
                            </button>

                            <button
                                type="button"
                                className="btn-wp-share"
                                onClick={handleShare}
                                title="Chia sẻ truyện"
                            >
                                <FaShareAlt />
                                <span>Chia sẻ</span>
                            </button>

                            <button
                                type="button"
                                className="btn-wp-rate"
                                onClick={() => {
                                    setActiveTab('comments');
                                    const tabsElem = document.getElementById('story-tabs-section');
                                    if (tabsElem) {
                                        tabsElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }
                                }}
                            >
                                <FaStar />
                                <span>Đánh giá</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Layout 2 cột kiểu WordPress Blog/Magazine (70% - 30%) */}
            <div className="story-wp-layout">

                {/* CỘT CHÍNH (70%) */}
                <main className="story-wp-main">

                    {/* Khung Tóm tắt / Giới thiệu tác phẩm */}
                    <section className="wp-card synopsis-card">
                        <div className="wp-card-header">
                            <h2 className="wp-card-title"><FaBookOpen /> Giới thiệu tác phẩm</h2>
                        </div>
                        <div className={`synopsis-body ${isDescExpanded ? 'expanded' : 'collapsed'}`}>
                            <p>{story.description}</p>
                        </div>
                        {story.description && story.description.length > 220 && (
                            <button
                                className="btn-expand-synopsis"
                                onClick={() => setIsDescExpanded(!isDescExpanded)}
                            >
                                {isDescExpanded ? (
                                    <>Thu gọn giới thiệu <FaChevronUp /></>
                                ) : (
                                    <>Đọc toàn bộ giới thiệu <FaChevronDown /></>
                                )}
                            </button>
                        )}
                    </section>

                    {/* Quảng cáo tự nhiên trong bài */}
                    <BrandAdBanner position="blog_page" />

                    {/* Khung Tabs (Danh sách chương, Xuất bản, Đánh giá) */}
                    <section className="wp-card tabs-card" id="story-tabs-section">
                        <div className="tabs-nav-bar">
                            <button
                                className={`tab-item-btn ${activeTab === 'chapters' ? 'active' : ''}`}
                                onClick={() => setActiveTab('chapters')}
                            >
                                <FaListUl /> Danh sách chương ({story.chapters.length})
                            </button>
                            <button
                                className={`tab-item-btn ${activeTab === 'info' ? 'active' : ''}`}
                                onClick={() => setActiveTab('info')}
                            >
                                <FaInfoCircle /> Thông tin xuất bản
                            </button>
                            <button
                                className={`tab-item-btn ${activeTab === 'comments' ? 'active' : ''}`}
                                onClick={() => setActiveTab('comments')}
                            >
                                <FaStar /> Đánh giá & Phản hồi ({reviewsData?.length || 0})
                            </button>
                        </div>

                        <div className="tab-pane-content">

                            {/* TAB 1: DANH SÁCH CHƯƠNG */}
                            {activeTab === 'chapters' && (
                                <div className="chapters-pane">

                                    {/* Banner Mời nâng cấp VIP nếu tài khoản chưa VIP */}
                                    {isAuthenticated && !isUserVip && (
                                        <div className="vip-upgrade-card" ref={vipBannerRef}>
                                            <div className="vip-card-icon"><FaCrown /></div>
                                            <div className="vip-card-info">
                                                <h4>Trải nghiệm không giới hạn với Gói VIP!</h4>
                                                <p>Mở khóa toàn bộ các chương VIP đặc sắc, tốc độ tải audio cao cấp không gián đoạn bởi quảng cáo.</p>
                                            </div>
                                            <button className="btn-vip-action" onClick={() => navigate("/membership")}>
                                                Nâng cấp ngay <FaArrowRight />
                                            </button>
                                        </div>
                                    )}

                                    {/* Thanh công cụ tìm kiếm và lọc thứ tự chương */}
                                    <div className="chapters-toolbar">
                                        <div className="search-box">
                                            <FaSearch className="search-icon" />
                                            <input
                                                type="text"
                                                placeholder="Tìm tập/chương nhanh..."
                                                value={chapterSearchQuery}
                                                onChange={(e) => setChapterSearchQuery(e.target.value)}
                                            />
                                            {chapterSearchQuery && (
                                                <button
                                                    className="clear-search"
                                                    onClick={() => setChapterSearchQuery("")}
                                                    title="Xóa tìm kiếm"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>

                                        <div className="sort-actions">
                                            <button
                                                className="btn-sort"
                                                onClick={() => setChapterSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                                title="Đổi thứ tự hiển thị"
                                            >
                                                {chapterSortOrder === 'asc' ? (
                                                    <><FaSortAmountDown /> Cũ nhất trước</>
                                                ) : (
                                                    <><FaSortAmountUp /> Mới nhất trước</>
                                                )}
                                            </button>
                                            <span className="chapter-count-badge">
                                                {filteredChapters.length} / {story.chapters.length} chương
                                            </span>
                                        </div>
                                    </div>

                                    {/* Danh sách các chương */}
                                    {isChaptersLoading ? (
                                        <div className="loading-state">
                                            <div className="spinner-small"></div>
                                            <span>Đang tải danh sách chương audio...</span>
                                        </div>
                                    ) : filteredChapters.length > 0 ? (
                                        <div className="chapters-grid">
                                            {filteredChapters.map((chapter) => {
                                                const chapterKey = chapter.chapter_id || chapter.id;
                                                const isActiveChapter = playingChapterId === chapterKey;
                                                const isVip = parseInt(chapter.is_vip) === 1;

                                                return (
                                                    <div
                                                        key={chapterKey}
                                                        className={`chapter-card ${isActiveChapter ? 'is-playing' : ''} ${isVip ? 'is-vip' : ''}`}
                                                    >
                                                        <div className="ch-col-left">
                                                            <span className="ch-num">#{chapter.originalIndex}</span>
                                                            <div className="ch-text-info">
                                                                <Link
                                                                    to={`/story/${story.slug}/chapter/${chapterKey}`}
                                                                    className="ch-title"
                                                                    onClick={(e) => handleChapterAccess(e, chapter)}
                                                                >
                                                                    {chapter.chapter_name}
                                                                </Link>
                                                                <div className="ch-meta-sub">
                                                                    <span className="ch-meta-item"><FaCalendarAlt /> {chapter.date}</span>
                                                                    <span className="ch-meta-item"><FaHeadphones /> {chapter.views.toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="ch-col-right">
                                                            {isVip ? (
                                                                <span className="ch-badge vip"><FaCrown /> VIP</span>
                                                            ) : (
                                                                <span className="ch-badge free"><FaUnlock /> Free</span>
                                                            )}

                                                            {isActiveChapter ? (
                                                                <div className="playing-indicator">
                                                                    <div className="eq-bars">
                                                                        <span></span>
                                                                        <span></span>
                                                                        <span></span>
                                                                        <span></span>
                                                                    </div>
                                                                    <span>Đang phát</span>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    className={`btn-ch-play ${isVip ? 'vip-play' : ''}`}
                                                                    onClick={(e) => handleChapterAccess(e, chapter)}
                                                                >
                                                                    <FaPlay /> Nghe
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="empty-chapters">
                                            <p>Không tìm thấy tập nào phù hợp với từ khóa "{chapterSearchQuery}".</p>
                                        </div>
                                    )}

                                </div>
                            )}

                            {/* TAB 2: THÔNG TIN XUẤT BẢN & BẢN QUYỀN */}
                            {activeTab === 'info' && (
                                <div className="info-pane">
                                    <div className="info-blockquote">
                                        <h3>Về bộ truyện audio "{story.title}"</h3>
                                        <p>{story.description}</p>
                                    </div>

                                    <div className="copyright-box">
                                        <h4>Bản quyền và Phát hành</h4>
                                        <ul>
                                            <li><strong>Đơn vị sở hữu âm thanh:</strong> Audio Story Production</li>
                                            <li><strong>Tác giả kịch bản:</strong> {story.author}</li>
                                            <li><strong>Chất lượng phát thanh:</strong> 128kbps - 320kbps Stereo</li>
                                            <li><strong>Chính sách bản quyền:</strong> Nghiêm cấm sao chép, tải về và re-up lên các nền tảng khác dưới mọi hình thức khi chưa có thỏa thuận văn bản.</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: ĐÁNH GIÁ & REVIEW */}
                            {activeTab === 'comments' && (
                                <div className="reviews-pane">
                                    {/* Tổng quan xếp hạng */}
                                    <div className="review-hero-box">
                                        <div className="review-score-big">
                                            <span className="big-number">{story.rating}</span>
                                            <div className="stars-row">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <FaStar
                                                        key={star}
                                                        className={`star ${star <= Math.round(Number(story.rating)) ? 'filled' : ''}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="score-desc">Dựa trên {reviewsData?.length || 0} đánh giá</span>
                                        </div>

                                        <div className="review-action-cta">
                                            <h4>Bạn đã nghe bộ truyện này?</h4>
                                            <p>Hãy để lại cảm nhận và số sao để cộng đồng cùng biết nhé!</p>
                                            <button
                                                className="btn-toggle-review-form"
                                                onClick={() => {
                                                    if (!isAuthenticated) {
                                                        openLoginDialog();
                                                        return;
                                                    }
                                                    if (userReviewed) {
                                                        setReviewMessage({ type: 'error', text: 'Bạn đã đánh giá bộ truyện này rồi.' });
                                                        return;
                                                    }
                                                    setShowReviewForm(!showReviewForm);
                                                }}
                                            >
                                                {showReviewForm ? 'Đóng biểu mẫu' : userReviewed ? 'Đã gửi đánh giá' : 'Viết đánh giá của bạn'}
                                            </button>
                                        </div>
                                    </div>

                                    {reviewMessage.text && (
                                        <div className={`review-status-alert ${reviewMessage.type}`}>
                                            {reviewMessage.text}
                                        </div>
                                    )}

                                    {/* Form đánh giá */}
                                    {showReviewForm && !userReviewed && (
                                        <form className="wp-review-form" onSubmit={handleReviewSubmit}>
                                            <div className="form-group">
                                                <label>Chọn mức độ hài lòng:</label>
                                                <div className="interactive-stars">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <FaStar
                                                            key={star}
                                                            className={`interactive-star ${star <= (hoverRating || userRating) ? 'active' : ''}`}
                                                            onMouseEnter={() => setHoverRating(star)}
                                                            onMouseLeave={() => setHoverRating(0)}
                                                            onClick={() => setUserRating(star)}
                                                        />
                                                    ))}
                                                    <span className="rating-hint">
                                                        {(hoverRating || userRating) > 0 ? `${hoverRating || userRating} / 5 sao` : 'Nhấp để chọn sao'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label>Cảm nghĩ của bạn về truyện:</label>
                                                <textarea
                                                    value={reviewContent}
                                                    onChange={(e) => setReviewContent(e.target.value)}
                                                    placeholder="Chia sẻ giọng đọc, cốt truyện, diễn biến tâm đắc nhất của bạn..."
                                                    rows={4}
                                                    required
                                                    minLength={10}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn-submit-review"
                                                disabled={addReviewMutation.isLoading}
                                            >
                                                {addReviewMutation.isLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
                                            </button>
                                        </form>
                                    )}

                                    {/* Danh sách review của độc giả */}
                                    <div className="readers-reviews-list">
                                        <h3>Đánh giá từ thính giả ({reviewsData?.length || 0})</h3>
                                        {isReviewsLoading ? (
                                            <div className="loading-state">
                                                <div className="spinner-small"></div>
                                                <span>Đang tải đánh giá...</span>
                                            </div>
                                        ) : reviewsData && reviewsData.length > 0 ? (
                                            reviewsData.map((review) => (
                                                <div key={review.id} className="reader-review-item">
                                                    <div className="review-user-header">
                                                        <div className="user-profile-badge">
                                                            {review.avatar ? (
                                                                <img src={review.avatar} alt={review.user} className="user-avatar" />
                                                            ) : (
                                                                <div className="user-avatar-fallback">
                                                                    {review.user?.[0]?.toUpperCase() || 'U'}
                                                                </div>
                                                            )}
                                                            <div className="user-meta">
                                                                <strong className="username">{review.user}</strong>
                                                                <span className="review-date">
                                                                    {new Date(review.date).toLocaleDateString('vi-VN')}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="review-stars-given">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <FaStar
                                                                    key={star}
                                                                    className={`star ${star <= review.rating ? 'active' : ''}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="review-body-text">{review.content}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-reviews-box">
                                                <p>Chưa có đánh giá nào cho bộ truyện này. Hãy là người đầu tiên để lại cảm nhận!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </section>

                    {/* Khung bình luận cộng đồng kiểu WordPress */}
                    <section className="wp-card comments-card">
                        <div className="wp-card-header">
                            <h2 className="wp-card-title"><FaComments /> Thảo luận & Bình luận</h2>
                        </div>
                        <div className="comments-wrap">
                            <CommentSection
                                story_id={story.id}
                                storyAuthorId={story.author_id}
                            />
                        </div>
                    </section>

                </main>

                {/* CỘT SIDEBAR KIỂU WIDGETS WORDPRESS (30%) */}
                <aside className="story-wp-sidebar">

                    {/* Widget 1: Gói Hội Viên VIP */}
                    <div className="sidebar-widget widget-vip-promo">
                        <div className="widget-header">
                            <span className="vip-crown-icon"><FaCrown /></span>
                            <h3>Gói Hội Viên VIP</h3>
                        </div>
                        <p className="widget-desc">
                            Nghe trọn vẹn toàn bộ các tập truyện audio đặc sắc, mở khóa độc quyền và hoàn toàn không dính quảng cáo.
                        </p>
                        <ul className="vip-feature-list">
                            <li><FaCheckCircle className="check-icon" /> Mở khóa toàn bộ chương VIP</li>
                            <li><FaCheckCircle className="check-icon" /> Âm thanh chất lượng cao 320kbps</li>
                            <li><FaCheckCircle className="check-icon" /> Ưu tiên cập nhật tập mới nhanh nhất</li>
                        </ul>
                        <button className="btn-widget-vip" onClick={() => navigate("/membership")}>
                            Khám phá gói VIP <FaArrowRight />
                        </button>
                    </div>

                    {/* Widget 2: Đang phát (Khi có chapter đang nghe) */}
                    {playingChapterId && chapterDetail && (
                        <div className="sidebar-widget widget-now-playing">
                            <div className="widget-header">
                                <span className="now-playing-icon"><FaVolumeUp /></span>
                                <h3>Đang phát audio</h3>
                            </div>
                            <div className="now-playing-card">
                                <div className="now-playing-title">
                                    {chapterDetail?.data?.chapter_name || chapterDetail?.chapter_name || 'Tập đang nghe'}
                                </div>
                                <div className="now-playing-badge">
                                    <span className="pulse-dot"></span> Đang trực tiếp trên Audio Story
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Widget 3: Truyện cùng thể loại (Related Audio Stories) */}
                    {relatedStories.length > 0 && (
                        <div className="sidebar-widget widget-related-stories">
                            <div className="widget-header">
                                <h3><FaHeadphones /> Truyện cùng thể loại</h3>
                            </div>
                            <div className="related-stories-list">
                                {relatedStories.map((item) => (
                                    <Link
                                        key={item.id}
                                        to={`/story/${item.slug}`}
                                        className="related-story-item"
                                    >
                                        <img
                                            src={item.thumbnail ? getStorageUrl(item.thumbnail) : "https://picsum.photos/100/140"}
                                            alt={item.title}
                                            className="related-thumb"
                                            onError={(e) => { e.target.src = "https://picsum.photos/100/140"; }}
                                        />
                                        <div className="related-meta">
                                            <h4 className="related-title">{item.title}</h4>
                                            <span className="related-author">
                                                <FaUser /> {item.author || 'Tác giả'}
                                            </span>
                                            <span className="related-views">
                                                <FaHeadphones /> {(item.views || 0).toLocaleString()} lượt nghe
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Widget 4: Tiện ích & Hướng dẫn nghe truyện */}
                    <div className="sidebar-widget widget-tips">
                        <div className="widget-header">
                            <h3><FaClock /> Tiện ích nghe audio</h3>
                        </div>
                        <div className="tips-content">
                            <div className="tip-item">
                                <strong>🎧 Hẹn giờ tắt:</strong>
                                <span>Đặt giờ tắt tự động ở thanh phát nhạc để an tâm chìm vào giấc ngủ.</span>
                            </div>
                            <div className="tip-item">
                                <strong>⭐ Yêu thích:</strong>
                                <span>Lưu truyện vào hồ sơ cá nhân để nhận thông báo khi có tập mới ra mắt.</span>
                            </div>
                            <div className="tip-item">
                                <strong>⚡ Tiến trình thông minh:</strong>
                                <span>Hệ thống tự động ghi nhớ vị trí tập đang nghe để bạn tiếp tục bất kỳ lúc nào.</span>
                            </div>
                        </div>
                    </div>

                </aside>

            </div>

            {/* Trình phát Audio Player cố định dưới đáy màn hình */}
            {playingChapterId && (
                chapterDetail ? (
                    <AudioPlayer
                        chapter={chapterDetail?.data || chapterDetail}
                        onClose={() => setPlayingChapterId(null)}
                        cover={story.image}
                    />
                ) : (
                    <div className="audio-player-loading-pill">
                        <div className="spinner-small" />
                        <span>Đang nạp tập âm thanh...</span>
                        <button className="btn-cancel-load" onClick={() => setPlayingChapterId(null)} title="Hủy">✕</button>
                    </div>
                )
            )}
        </div>
    );
};

export default StoryDetail;