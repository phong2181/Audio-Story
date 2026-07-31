import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    FaPlay, 
    FaStar, 
    FaEye, 
    FaListUl, 
    FaUser, 
    FaCalendarAlt, 
    FaChevronRight,
    FaHeadphones,
    FaHeart,
    FaCrown,
    FaUnlock,
    FaArrowRight,
    FaShareAlt
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
    useGetChapterDetailClient
} from "api/homePage";
import { useQueryClient } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CommentSection from "../Comment/CommentBox";
import AudioPlayer from "../AudioPlayer";

const StoryDetail = () => {
    const { slug, id } = useParams(); 
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("chapters");
    const vipBannerRef = useRef(null); // Ref để cuộn xuống banner VIP khi cần

    const [playingChapterId, setPlayingChapterId] = useState(null);
    // Khi playingChapterId thay đổi, nó sẽ tự động gọi API lấy chi tiết chương
    const { data: chapterDetail, isLoading } = useGetChapterDetailClient(playingChapterId, {
        enabled: !!playingChapterId, // Chỉ gọi API khi có ID đang phát
    });
    // State cho tính năng đánh giá sao
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewContent, setReviewContent] = useState("");
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewMessage, setReviewMessage] = useState({ type: '', text: '' });
    
    // Auth State giả định theo code cũ
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(true);
    
    // State cho nút yêu thích
    const [isToggling, setIsToggling] = useState(false);

    // Lấy thông tin user 
    const userInfo = JSON.parse(localStorage.getItem("USER") || "null");
    const isAuthenticated = !!userInfo;
    
    //  KIỂM TRA USER CÓ PHẢI LÀ VIP HAY KHÔNG
    //  KIỂM TRA QUYỀN ĐẶC BIỆT (Admin, Staff) HOẶC CÓ GÓI VIP
    const isAdminOrStaff = userInfo?.role === "admin" || userInfo?.role === "staff" || userInfo?.user_type === "admin"; // Tùy thuộc vào key 'role' hay 'user_type' trong DB của bạn
    const isUserVip = useMemo(() => {
        if (!isAuthenticated) return false;

        if (isAdminOrStaff) return true;

        const vipExpire = userInfo?.vip_expires_at;
        if (!vipExpire) return false;

        return new Date(vipExpire) > new Date();
    }, [userInfo, isAuthenticated, isAdminOrStaff]);
    

    const queryClient = useQueryClient();

    const openLoginDialog = () => {
        setIsLoginMode(true);
        setIsAuthOpen(true);
        // Nếu dự án điều hướng sang trang login riêng:
        // navigate("/login");
    };
        
    // Lấy dữ liệu từ API
    const { data: storyData, isLoading: isStoriesLoading } = useGetStoryDetailClient(slug);
    const { data: categoriesData } = useCategoriesClient();

    // Chuyển đổi dữ liệu categories an toàn
    const categories = useMemo(() => {
        if (Array.isArray(categoriesData)) return categoriesData;
        if (categoriesData && typeof categoriesData === 'object') {
            const arrayKey = Object.keys(categoriesData).find(key => Array.isArray(categoriesData[key]));
            return arrayKey ? categoriesData[arrayKey] : (categoriesData.data || []);
        }
        return [];
    }, [categoriesData]);

    // Chuyển đổi dữ liệu truyện an toàn
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

    // 🎯 HÀM KIỂM TRA QUYỀN TRUY CẬP CHƯƠNG KHI CLICK NGHE
    const handleChapterAccess = (e, chapter) => {
        if (!chapter?.id) {
            e.preventDefault();
            toast.error("Không tìm thấy chương!");
            return false;
        }

        if (!isAuthenticated) {
            e.preventDefault();
            toast.warn("Vui lòng đăng nhập để nghe truyện!");
            openLoginDialog();
            return false;
        }

        if (parseInt(chapter.is_vip) === 1 && !isUserVip) {
            e.preventDefault();
            toast.error("Đây là nội dung VIP. Vui lòng nâng cấp!");

            setActiveTab("chapters");

            setTimeout(() => {
                vipBannerRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }, 100);

            return false;
        }

        e.preventDefault();
        setPlayingChapterId(chapter.id);
    };

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
            if (!responseData) {
                return error?.message || 'Có lỗi xảy ra khi gửi đánh giá.';
            }

            if (typeof responseData.message === 'string' && responseData.message.trim()) {
                return responseData.message;
            }

            if (responseData.error) {
                return responseData.error;
            }

            if (responseData.errors && typeof responseData.errors === 'object') {
                const errors = Object.values(responseData.errors)
                    .reduce((acc, value) => acc.concat(Array.isArray(value) ? value : [value]), []);
                return errors.join(' ');
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

    const handleFavoriteToggle = async () => {
        if (!isAuthenticated) {
            openLoginDialog();
            return;
        }
        if (!storyId) return;
        if (isToggling) return;

        setIsToggling(true);
        try {
            const delayPromise = new Promise((resolve) => setTimeout(resolve, 3000));
            if (isFavorited) {
                await Promise.all([removeFavoriteMutation.mutateAsync(storyId), delayPromise]);
            } else {
                await Promise.all([addFavoriteMutation.mutateAsync({ story_id: storyId }), delayPromise]);
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

    const handleShare = async () => {
        const shareUrl = window.location.href;
        const shareData = {
            title: story?.title || 'Truyện audio hay',
            text: `Nghe ngay ${story?.title || 'truyện audio'} trên Audio Story!`,
            url: shareUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                toast.success('Đã mở chia sẻ.');
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Đã sao chép liên kết truyện vào clipboard.');
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
            console.error('Lỗi chia sẻ:', error);
            toast.error('Không thể chia sẻ. Vui lòng thử lại.');
        }
    };

    // Xử lý và ánh xạ dữ liệu
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
            slug: rawStory.slug,
            title: rawStory.title,
            author: rawStory.author || "Chưa cập nhật",
            category: categoryName,
            description: rawStory.summary || "Chưa có tóm tắt cho truyện này.",
            viewCount: rawStory.views || 0,
            status: rawStory.status === 'completed' ? 'Hoàn thành' : 'Đang ra',
            rating: averageRating,
            image: rawStory.thumbnail ? `http://bloger.test/storage/${rawStory.thumbnail}` : "https://picsum.photos/400/550",
            createdAt: rawStory.created_at ? new Date(rawStory.created_at).toLocaleDateString('vi-VN') : "Chưa cập nhật",
            chapters: chaptersArray.map((ch, index) => ({
                id: ch.id,
                chapter_name: ch.chapter_name || ch.title,
                duration: ch.duration || "N/A",
                views: ch.views || 0,
                is_vip: ch.is_vip || 0, 
                date: ch.created_at ? new Date(ch.created_at).toLocaleDateString('vi-VN') : "N/A"
            }))
        };
    }, [rawStory, categories, chaptersData, reviewsData]);

    useEffect(() => {
        if (story) {
            document.title = story.title || "Đang tải...";
        }
    }, [story]);

    // 🎯 HIỆU ỨNG SKELETON LOADING KHI ĐANG TẢI THÔNG TIN BỘ TRUYỆN TỪ API
    if (isStoriesLoading || !story) {
        return (
            <div className="story-detail-container skeleton-detail-loading">
                {/* Breadcrumb Skeleton */}
                <div className="breadcrumbs-skeleton">
                    <div className="skeleton-item line-short"></div>
                </div>

                {/* Hero Section Skeleton */}
                <div className="story-hero-section">
                    <div className="story-cover-image skeleton-cover"></div>

                    <div className="story-main-info">
                        <div className="skeleton-item tag"></div>
                        <div className="skeleton-item title"></div>
                        
                        <div className="story-meta-grid">
                            <div className="skeleton-item meta-line"></div>
                            <div className="skeleton-item meta-line"></div>
                            <div className="skeleton-item meta-line"></div>
                            <div className="skeleton-item meta-line"></div>
                        </div>

                        <div className="skeleton-item summary-p"></div>
                        <div className="skeleton-item summary-p"></div>
                        <div className="skeleton-item summary-p short"></div>

                        <div className="story-actions">
                            <div className="skeleton-item btn-action-left"></div>
                            <div className="skeleton-item btn-action-right"></div>
                        </div>
                    </div>
                </div>

                {/* Tabs Header Skeleton */}
                <div className="story-content-tabs">
                    <div className="tabs-header">
                        <div className="skeleton-item tab-btn-loader"></div>
                        <div className="skeleton-item tab-btn-loader"></div>
                        <div className="skeleton-item tab-btn-loader"></div>
                    </div>

                    {/* Giả lập danh sách chương dạng Skeleton lúc load trang */}
                    <div className="tab-content" style={{ marginTop: '20px' }}>
                        {[1, 2, 3, 4, 5].map((index) => (
                            <div className="chapter-item-skeleton" key={index}>
                                <div className="left-part">
                                    <div className="skeleton-item circle-num"></div>
                                    <div className="skeleton-item chapter-title-line"></div>
                                </div>
                                <div className="right-part">
                                    <div className="skeleton-item view-line"></div>
                                    <div className="skeleton-item btn-listen-loader"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    

    // GIAO DIỆN CHÍNH THỨC SAU KHI SỬ DỤNG DỮ LIỆU THÀNH CÔNG
    return (
        <div className="story-detail-container">
            <ToastContainer position="top-right" autoClose={3000} closeOnClick />

            {/* Breadcrumb */}
            <div className="breadcrumbs">
                <Link to="/" style={{color: '#475569'}}>Trang chủ</Link>
                <FaChevronRight />
                <Link to="/truyen" style={{ color: '#475569'}}>Kho truyện</Link>
                <FaChevronRight />
                <span>{story.title}</span>
            </div>

            {/* Phần thông tin tổng quan bộ truyện */}
            <div className="story-hero-section">
                <div className="story-cover-image">
                    <img src={story.image} alt={story.title} onError={(e) => { e.target.src = "https://picsum.photos/400/550" }} />
                    <span className={`status-tag ${story.status === 'Hoàn thành' ? 'completed' : 'ongoing'}`}>
                        {story.status}
                    </span>
                </div>

                <div className="story-main-info">
                    <span className="category-tag">{story.category}</span>
                    <h1 className="story-title">{story.title}</h1>
                    
                    <div className="story-meta-grid">
                        <div className="meta-item">
                            <FaUser /> 
                            <span>
                                Tác giả: 
                                
                                <Link 
                                    to={`/authors/${encodeURIComponent(story?.author_slug || story?.author || '')}`}
                                    className="author-link"
                                    style={{ textDecoration: 'none', marginLeft: '5px' }}
                                >
                                    <strong style={{ color: 'black'}}>
                                        {story?.author || 'Không rõ'}
                                    </strong>
                                </Link>
                            </span>
                        </div>
                        <div className="meta-item"><FaEye /> <span>{story.viewCount.toLocaleString()} lượt nghe</span></div>
                        <div className="meta-item">
                            <div className="rating-summary">
                                <div className="rating-main">
                                    <FaStar className="star main" />
                                    <div>
                                        <div className="rating-value">{story.rating}/5</div>
                                        <div className="rating-label">{reviewsData ? reviewsData.length : 0} đánh giá</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="meta-item"><FaCalendarAlt /> <span>Cập nhật: {story.createdAt}</span></div>
                    </div>

                    <p className="story-summary">{story.description}</p>

                    <div className="story-actions">
                        {story.chapters.length > 0 ? (
                            <button
                                className="btn-play-now"
                                onClick={(e) => handleChapterAccess(e, story.chapters[0])}
                            >
                                <FaPlay />
                                <span className="btn-text">
                                    Nghe ngay chương 1
                                </span>
                                {parseInt(story.chapters[0].is_vip) === 1 && (
                                    <FaCrown className="vip-icon" />
                                )}
                            </button>
                        ) : (
                            <button className="btn-play-now" disabled><FaPlay /> Chưa có chương</button>
                        )}

                            <button
                                type="button"
                                className="btn-share"
                                onClick={handleShare}
                            >
                                <FaShareAlt />
                                <span className="btn-text">Chia sẻ</span>
                            </button>

                        <div className="actions-right">
                            <button
                                className={`favorite-btn large ${isFavorited ? 'favorited' : ''}`}
                                onClick={handleFavoriteToggle}
                                disabled={isToggling}
                            >
                                <FaHeart />
                                <span className="btn-text">
                                    {isToggling
                                        ? 'Đang xử lý...'
                                        : isFavorited
                                        ? 'Đã yêu thích'
                                        : 'Yêu thích'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hệ thống Tabs */}
            <div className="story-content-tabs">
                <div className="tabs-header">
                    <button className={`tab-btn ${activeTab === 'chapters' ? 'active' : ''}`} onClick={() => setActiveTab('chapters')}>
                        <FaListUl /> Danh sách chương ({story.chapters.length})
                    </button>
                    <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
                        <FaHeadphones /> Thông tin chi tiết
                    </button>
                    <button className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>
                        <FaStar /> Đánh giá
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'chapters' && (
                        <div className="chapters-list">
                            
                            {/* 🎯 BOX THÔNG BÁO MỞ GÓI VIP THÀNH VIÊN (Hiện khi user không phải VIP) */}
                            {isAuthenticated && !isUserVip && (
                                <div className="vip-unlock-banner" ref={vipBannerRef}>
                                    <div className="vip-banner-icon">
                                        <FaCrown />
                                    </div>
                                    <div className="vip-banner-body">
                                        <h4>Trải Nghiệm Không Giới Hạn Với Gói Thành Viên VIP!</h4>
                                        <p>Mở khóa toàn bộ các chương VIP đặc sắc, độc quyền, tốc độ tải audio cao cấp và không dính quảng cáo.</p>
                                    </div>
                                    <div className="vip-banner-action">
                                        <button className="btn-upgrade-vip" onClick={() => navigate("/membership")}>
                                            Nâng cấp ngay <FaArrowRight />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isChaptersLoading ? (
                                <div className="loading-state"><div className="spinner-small"></div><span>Đang tải danh sách chương...</span></div>
                            ) : story.chapters.length > 0 ? (
                                story.chapters.map((chapter, index) => {
                                    const chapterKey = chapter.chapter_id || chapter.id;
                                    const isActiveChapter = playingChapterId === chapterKey;
                                    return (
                                        <div className="chapter-item" key={chapterKey}>
                                            
                                            <div className="chapter-left">
                                                <span className="chapter-index">{index + 1}</span>
                                                <Link 
                                                    to={`/story/${story.slug}/chapter/${chapterKey}`} 
                                                    className="chapter-title"
                                                    onClick={(e) => handleChapterAccess(e, chapter)}
                                                >
                                                    {chapter.chapter_name}
                                                </Link>
                                            </div>

                                            <div className="chapter-right">
                                                <span><FaHeadphones /> {chapter.views.toLocaleString()}</span>
                                                
                                                {parseInt(chapter.is_vip) === 1 ? (
                                                    <span className="badge-vip-client"><FaCrown /> VIP</span>
                                                ) : (
                                                    <span className="badge-free-client"><FaUnlock /> Free</span>
                                                )}

                                                {isActiveChapter ? (
                                                    <div className="now-playing-wrapper">
                                                        <div className="waveform">
                                                            <span className="wave-bar"></span>
                                                            <span className="wave-bar"></span>
                                                            <span className="wave-bar"></span>
                                                            <span className="wave-bar"></span>
                                                        </div>
                                                        <span className="now-playing-text">Đang nghe</span>
                                                    </div>
                                                ) : parseInt(chapter.is_vip) === 1 ? (
                                                    <Link 
                                                        to={`/story/${story.slug}/chapter/${chapterKey}`} 
                                                        className="btn-listen btn-vip"
                                                        onClick={(e) => handleChapterAccess(e, chapter)}
                                                    >
                                                        Nghe <FaPlay />
                                                    </Link>
                                                ) : (
                                                    <Link 
                                                        to={`/story/${story.slug}/chapter/${chapterKey}`} 
                                                        className="btn-listen"
                                                        onClick={(e) => handleChapterAccess(e, chapter)}
                                                    >
                                                        Nghe <FaPlay />
                                                    </Link>
                                                )}
                                            </div>

                                        </div>
                                    );
                                })
                            ) : (
                                <div className="no-results imgstyle" style={{ textAlign: 'center', padding: '20px' }}>
                                    <img src={process.env.PUBLIC_URL + "/chua-co-truyen.png"} alt="BookAudio Logo" className="footer-brand-img" style={{ width: '225px' }} />
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'info' && (
                        <div className="more-info-tab">
                            <h3>Về bộ truyện "{story.title}"</h3>
                            <p>{story.description}</p>
                            <p><strong>Bản quyền Audio thuộc về:</strong> Audio Story</p>
                            <p><strong>Lưu ý:</strong> Vui lòng không re-up nội dung audio lên các nền tảng khác khi chưa có sự đồng ý của tác giả.</p>
                        </div>
                    )}

                    {activeTab === 'comments' && (
                        <div className="comments-tab">
                            <div className="review-actions">
                                <button className="btn-write-review" onClick={() => {
                                    if (!isAuthenticated) { openLoginDialog(); return; }
                                    if (userReviewed) {
                                        setReviewMessage({ type: 'error', text: 'Bạn chỉ được đánh giá một lần cho bộ truyện này.' });
                                        return;
                                    }
                                    setShowReviewForm(!showReviewForm);
                                }}>
                                    {showReviewForm ? 'Hủy' : userReviewed ? 'Bạn đã đánh giá' : 'Viết đánh giá'}
                                </button>
                            </div>

                            {reviewMessage.text && <div className={`review-message ${reviewMessage.type}`}>{reviewMessage.text}</div>}

                            {showReviewForm && !userReviewed && (
                                <form className="review-form" onSubmit={handleReviewSubmit}>
                                    <div className="rating-input">
                                        <label>Chọn số sao:</label>
                                        <div className="stars">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <FaStar 
                                                    key={star} 
                                                    className={`star ${star <= (hoverRating || userRating) ? 'active' : ''}`}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setUserRating(star)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="content-input">
                                        <label>Nội dung đánh giá:</label>
                                        <textarea
                                            value={reviewContent}
                                            onChange={(e) => setReviewContent(e.target.value)}
                                            placeholder="Chia sẻ cảm nhận..."
                                            rows={4}
                                            required
                                            minLength={10}
                                        />
                                    </div>
                                    <button type="submit" className="btn-submit-review" disabled={addReviewMutation.isLoading}>Gửi đánh giá</button>
                                </form>
                            )}

                            <div className="reviews-list">
                                <h4>Các đánh giá ({reviewsData?.length || 0})</h4>
                                {isReviewsLoading ? (
                                    <div className="loading-state"><div className="spinner-small"></div><span>Đang tải...</span></div>
                                ) : reviewsData && reviewsData.length > 0 ? (
                                    reviewsData.map((review) => (
                                        <div key={review.id} className="review-item">
                                            <div className="review-header">
                                                <div className="review-user">
                                                    {review.avatar ? <img src={review.avatar} alt={review.user} className="review-avatar" /> : <div className="review-avatar review-avatar-fallback">{review.user?.[0]?.toUpperCase() || 'U'}</div>}
                                                    <strong>{review.user}</strong>
                                                </div>
                                                <div className="review-rating">
                                                    {[1, 2, 3, 4, 5].map((star) => (<FaStar key={star} className={`star ${star <= review.rating ? 'active' : ''}`} />))}
                                                </div>
                                                <div className="review-date">{new Date(review.date).toLocaleDateString('vi-VN')}</div>
                                            </div>
                                            <div className="review-content">{review.content}</div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-reviews">Chưa có đánh giá nào.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <CommentSection 
                story_id={story.id} 
                storyAuthorId={story.author_id}
            />  
            {/* Thay vì playingChapter, dùng playingChapterId */}
            {playingChapterId && (
                <div className="audio-player-shell">
                    <div className="audio-player-shell-inner">
                        {isLoading ? (
                            <p>Đang tải...</p>
                        ) : chapterDetail ? (
                            // Truyền vào data hoặc chính object đó tùy vào cấu trúc API của bạn
                            // Thường là chapterDetail.data hoặc chapterDetail
                            <AudioPlayer chapter={chapterDetail?.data || chapterDetail} onClose={() => setPlayingChapterId(null)} cover={story.image} />
                        ) : (
                            <p>Không tìm thấy dữ liệu.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryDetail;