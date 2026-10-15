import React, { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    FaSearch,
    FaEye,
    FaHeadphones,
    FaChevronRight,
    FaBookOpen,
    FaStar,
    FaUndo,
    FaListOl,
    FaClock,
    FaFilter,
    FaCompass
} from "react-icons/fa";
import {
    useGetStoriesClient,
    useCategoriesClient
} from "api/homePage";
import moment from "moment/moment";
import { STORAGE_URL } from "config/config";
import BrandAdBanner from "components/BrandAdBanner";
import "./style.scss";

// Helper kiểm tra chương mới trong 7 ngày
const isRecentlyUpdated = (chaptersMaxCreatedAt, storyCreatedAt) => {
    const targetDate = chaptersMaxCreatedAt || storyCreatedAt;
    if (!targetDate) return false;
    const diff = Date.now() - new Date(targetDate).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
};

// Helper ảnh thumbnail
const getThumbnailUrl = (thumb) => {
    if (!thumb) {
        return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' fill='%23cbd5e1'%3E%3Crect width='300' height='400'/%3E%3C/svg%3E";
    }
    if (thumb.startsWith("http://") || thumb.startsWith("https://")) return thumb;
    return `${STORAGE_URL}${thumb}`;
};

const StoryList = () => {
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get("category");

    useEffect(() => {
        document.title = "Kho Truyện Audio Đặc Sắc - Audio Story";
    }, []);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [sortBy, setSortBy] = useState("updated");

    const { data: storiesData, isLoading: isStoriesLoading } = useGetStoriesClient();
    const { data: categoriesData } = useCategoriesClient();

    const stories = Array.isArray(storiesData) ? storiesData : (storiesData?.data || []);
    const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);

    // Đồng bộ param URL nếu có
    useEffect(() => {
        if (categoryParam && categories.length > 0) {
            const found = categories.find(c => (c.slug === categoryParam || c.id === Number(categoryParam)));
            if (found) setSelectedCategory(String(found.id));
        }
    }, [categoryParam, categories]);

    const filteredStories = useMemo(() => {
        return stories
            .filter((story) => {
                const matchesSearch =
                    (story.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (story.summary || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (story.author || "").toLowerCase().includes(searchTerm.toLowerCase());

                const matchesCategory =
                    selectedCategory === "all" ||
                    String(story.category_audio_id) === String(selectedCategory);

                const matchesStatus =
                    selectedStatus === "all" || story.status === selectedStatus;

                return matchesSearch && matchesCategory && matchesStatus;
            })
            .sort((a, b) => {
                if (sortBy === "newest") {
                    const dateA = new Date(a.created_at || 0).getTime();
                    const dateB = new Date(b.created_at || 0).getTime();
                    return dateB - dateA;
                }
                if (sortBy === "views") {
                    return (b.views || 0) - (a.views || 0);
                }
                if (sortBy === "rating") {
                    return (b.average_rating || 0) - (a.average_rating || 0);
                }
                // Mặc định: updated theo chương mới nhất
                const dateA = new Date(a.chapters_max_created_at || a.created_at || 0).getTime();
                const dateB = new Date(b.chapters_max_created_at || b.created_at || 0).getTime();
                return dateB - dateA;
            });
    }, [stories, searchTerm, selectedCategory, selectedStatus, sortBy]);

    const handleResetFilter = () => {
        setSelectedCategory("all");
        setSelectedStatus("all");
        setSortBy("updated");
        setSearchTerm("");
    };

    return (
        <div className="wp-archive-stories-page">
            {/* Header Archive */}
            <div className="archive-header-banner">
                <div className="container">
                    <div className="breadcrumbs">
                        <Link to="/">Trang chủ</Link>
                        <FaChevronRight className="sep" />
                        <span>Kho truyện Audio</span>
                    </div>

                    <div className="header-flex">
                        <div>
                            <h1 className="archive-title">Kho Truyện Audio Đặc Sắc</h1>
                            <p className="archive-desc">
                                Khám phá hàng ngàn bộ truyện audio tuyển chọn được thu âm và lồng tiếng tự động chất lượng cao
                            </p>
                        </div>
                        <div className="archive-count-pill">
                            <FaBookOpen />
                            <span>{filteredStories.length} bộ truyện</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container main-content-wrap">
                {/* Dải Thể Loại (Pill Ribbons) */}
                <div className="category-pills-bar">
                    <button
                        type="button"
                        className={`cat-pill ${selectedCategory === "all" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("all")}
                    >
                        <FaCompass /> Tất cả thể loại
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            className={`cat-pill ${String(selectedCategory) === String(cat.id) ? "active" : ""}`}
                            onClick={() => setSelectedCategory(String(cat.id))}
                        >
                            {cat.name || cat.title}
                        </button>
                    ))}
                </div>

                {/* Toolbar Tìm Kiếm & Sắp Xếp */}
                <div className="archive-toolbar">
                    <div className="search-wrap">
                        <FaSearch className="search-icon" />
                        <input
                            type="search"
                            placeholder="Tìm kiếm tên truyện, tác giả, nội dung..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filters-group">
                        <div className="select-wrap">
                            <span className="label-prefix">Trạng thái:</span>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="all">Tất cả</option>
                                <option value="updating">Đang cập nhật</option>
                                <option value="completed">Đã hoàn thành</option>
                            </select>
                        </div>

                        <div className="select-wrap">
                            <span className="label-prefix">Sắp xếp:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="updated">Chương mới nhất</option>
                                <option value="views">Lượt nghe nhiều nhất</option>
                                <option value="rating">Đánh giá cao nhất</option>
                                <option value="newest">Truyện mới đăng</option>
                            </select>
                        </div>

                        {(searchTerm || selectedCategory !== "all" || selectedStatus !== "all" || sortBy !== "updated") && (
                            <button
                                type="button"
                                className="btn-reset-filter"
                                onClick={handleResetFilter}
                                title="Đặt lại bộ lọc"
                            >
                                <FaUndo /> Đặt lại
                            </button>
                        )}
                    </div>
                </div>

                {/* Banner quảng cáo Brand (Nếu có thì hiện, không có thì ẩn) */}
                <BrandAdBanner position="story_list" />

                {/* Grid Truyện */}
                {isStoriesLoading ? (
                    <div className="stories-grid-skeleton">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div className="skeleton-card" key={index}>
                                <div className="sk-img"></div>
                                <div className="sk-body">
                                    <div className="sk-badge"></div>
                                    <div className="sk-title"></div>
                                    <div className="sk-meta"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredStories.length > 0 ? (
                    <div className="archive-stories-grid">
                        {filteredStories.map((story) => {
                            const categoryObj = categories.find((c) => c.id === story.category_audio_id);
                            const categoryName = categoryObj ? (categoryObj.name || categoryObj.title) : "Truyện";
                            const hasNewChapter = isRecentlyUpdated(story.chapters_max_created_at, story.created_at);

                            return (
                                <article className="story-card" key={story.id}>
                                    <Link to={`/story/${story.slug}`} className="card-thumb-wrap">
                                        <img
                                          src={getThumbnailUrl(story.thumbnail)}
                                          alt={story.title}
                                          loading="lazy"
                                          onError={(e) => {
                                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' fill='%23cbd5e1'%3E%3Crect width='300' height='400'/%3E%3C/svg%3E";
                                          }}
                                        />
                                        <div className="thumb-badges">
                                            <span className="cat-badge">{categoryName}</span>
                                            {hasNewChapter && (
                                                <span className="new-badge">Mới</span>
                                            )}
                                        </div>
                                        <span className={`status-pill ${story.status === "completed" ? "full" : "updating"}`}>
                                            {story.status === "completed" ? "Đã Full" : "Đang Ra"}
                                        </span>
                                    </Link>

                                    <div className="card-info">
                                        <div className="card-meta-top">
                                            <span className="author-name">
                                                {story.author || "Khuyết danh"}
                                            </span>
                                            <span className="rating-badge">
                                                <FaStar /> {story.average_rating ? Number(story.average_rating).toFixed(1) : "5.0"}
                                            </span>
                                        </div>

                                        <h3 className="card-title">
                                            <Link to={`/story/${story.slug}`}>{story.title}</Link>
                                        </h3>

                                        <div className="card-stats">
                                            <span className="stat-item">
                                                <FaListOl /> {story.chapters_count || 0} tập
                                            </span>
                                            <span className="stat-item">
                                                <FaClock /> {moment(story.chapters_max_created_at || story.created_at).fromNow()}
                                            </span>
                                        </div>

                                        <p className="card-summary">{story.summary || "Nội dung truyện audio đang được cập nhật..."}</p>

                                        <div className="card-footer">
                                            <span className="views-count">
                                                <FaEye /> {(story.views || 0).toLocaleString()} lượt nghe
                                            </span>
                                            <Link to={`/story/${story.slug}`} className="btn-listen-now">
                                                Nghe ngay <FaHeadphones />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="archive-empty-state">
                        <FaBookOpen className="empty-icon" />
                        <h3>Không tìm thấy bộ truyện phù hợp</h3>
                        <p>Thử tìm với từ khóa khác hoặc bỏ các bộ lọc để xem toàn bộ kho truyện.</p>
                        <button type="button" onClick={handleResetFilter} className="btn-view-all">
                            Xem tất cả truyện
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoryList;