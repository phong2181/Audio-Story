import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
    FaSearch, FaFilter, FaEye, FaHeadphones, FaChevronRight,
    FaTags, FaBookOpen, FaStar, FaTimes, FaUndo, FaListOl,
    FaClock
} from "react-icons/fa";

import {
    useGetStoriesClient,
    useCategoriesClient
} from "api/homePage";
import "./style.scss";
import moment from "moment/moment";
import { STORAGE_URL } from "config/config";

// Thay đổi helper check 3 ngày dựa trên ngày đăng chương mới
const isRecentlyUpdated = (chaptersMaxCreatedAt, storyCreatedAt) => {
    const targetDate = chaptersMaxCreatedAt || storyCreatedAt;
    if (!targetDate) return false;
    const diff = Date.now() - new Date(targetDate).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000; // Trong vòng 7 ngày
};

const StoryList = () => {
    useEffect(() => {
        document.title = "Kho truyện Audio - Danh sách đầy đủ";
    }, []);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [sortBy, setSortBy] = useState("updated");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const { data: storiesData, isLoading: isStoriesLoading } = useGetStoriesClient();
    const { data: categoriesData } = useCategoriesClient();

    const stories = Array.isArray(storiesData) ? storiesData : (storiesData?.data || []);
    const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);

    const filteredStories = stories
        .filter(story => {
            const matchesSearch =
                story.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                story.summary?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory =
                selectedCategory === "all" ||
                String(story.category_audio_id) === String(selectedCategory);
            const matchesStatus =
                selectedStatus === "all" || story.status === selectedStatus;
            return matchesSearch && matchesCategory && matchesStatus;
        })
        .sort((a, b) => {
            // TRƯỜNG HỢP 1: Truyện mới đăng (Tính theo ngày tạo bộ truyện)
            if (sortBy === "newest") {
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return dateB - dateA;
            }

            // TRƯỜNG HỢP 2: Nghe nhiều nhất
            if (sortBy === "views") {
                return (b.views || 0) - (a.views || 0);
            }

            // TRƯỜNG HỢP 3: Đánh giá cao
            if (sortBy === "rating") {
                return (b.average_rating || 0) - (a.average_rating || 0);
            }
            
            // TRƯỜNG HỢP MẶC ĐỊNH / "updated": Có chương mới đăng lên đầu
            // Sử dụng chính xác trường 'chapters_max_created_at' do Laravel trả về
            const dateA = new Date(a.chapters_max_created_at || a.created_at || 0).getTime();
            const dateB = new Date(b.chapters_max_created_at || b.created_at || 0).getTime();
            
            return dateB - dateA; 
        });

    const handleResetFilter = () => {
        setSelectedCategory("all");
        setSelectedStatus("all");
        setSortBy("updated");
    };

    return (
        <div className="story-list-container">
            {/* Header */}
            <div className="page-header">
                <div className="breadcrumbs">
                    <Link to="/">Trang chủ</Link>
                    <FaChevronRight />
                    <span>Kho truyện</span>
                </div>
                <h1>Kho truyện Audio</h1>
                <p>Tổng hợp {filteredStories.length} bộ truyện audio đặc sắc nhất.</p>
            </div>

            {/* Thanh công cụ Tìm kiếm & Nút Lọc */}
            <div className="toolbar-wrapper">
                <div className="search-main">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm truyện, tác giả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <button 
                    className={`btn-filter-toggle ${isFilterOpen ? 'active' : ''}`}
                    onClick={() => setIsFilterOpen(true)}
                >
                    <FaFilter /> <span>Lọc nâng cao</span>
                </button>
            </div>

            {/* Sidebar Bộ lọc (Dùng cho Mobile & Tablet) */}
            <div className={`filter-sidebar-overlay ${isFilterOpen ? 'show' : ''}`} onClick={() => setIsFilterOpen(false)}>
                <div className="filter-sidebar" onClick={e => e.stopPropagation()}>
                    <div className="sidebar-header">
                        <h3>Bộ lọc truyện</h3>
                        <button className="close-btn" onClick={() => setIsFilterOpen(false)}><FaTimes /></button>
                    </div>

                    <div className="sidebar-body">
                        <div className="filter-section">
                            <label><FaTags /> Thể loại</label>
                            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                                <option value="all">Tất cả thể loại</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name || cat.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-section">
                            <label><FaBookOpen /> Trạng thái</label>
                            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                                <option value="all">Tất cả</option>
                                <option value="updating">Đang cập nhật</option>
                                <option value="completed">Hoàn thành</option>
                            </select>
                        </div>

                        <div className="filter-section">
                            <label><FaStar /> Sắp xếp</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="updated">Mới cập nhật</option>
                                <option value="newest">Truyện mới đăng</option>
                                <option value="views">Nghe nhiều nhất</option>
                                <option value="rating">Đánh giá cao</option>
                            </select>
                        </div>
                    </div>

                    <div className="sidebar-footer">
                        <button className="btn-reset" onClick={handleResetFilter}><FaUndo /> Đặt lại</button>
                        <button className="btn-apply" onClick={() => setIsFilterOpen(false)}>Áp dụng</button>
                    </div>
                </div>
            </div>

            {/* Danh sách truyện */}
            {isStoriesLoading ? (
                <div className="story-grid-skeleton">

                    {Array.from({ length: 8 }).map((_, index) => (
                        <div className="skeleton-card" key={index}>

                            {/* IMAGE */}
                            <div className="sk-img"></div>

                            {/* CATEGORY */}
                            <div className="sk-badge"></div>

                            {/* TITLE */}
                            <div className="sk-title"></div>
                            <div className="sk-title short"></div>

                            {/* AUTHOR + META */}
                            <div className="sk-meta"></div>

                            {/* SUMMARY */}
                            <div className="sk-line"></div>
                            <div className="sk-line"></div>
                            <div className="sk-line short"></div>

                            {/* FOOTER */}
                            <div className="sk-footer">
                                <div className="sk-view"></div>
                                <div className="sk-btn"></div>
                            </div>

                        </div>
                    ))}

                </div>

            ) : filteredStories.length > 0 ? (
                <div className="stories-grid">
                    {filteredStories.map(story => {
                        const categoryObj = categories.find(c => c.id === story.category_audio_id);
                        const categoryName = categoryObj ? (categoryObj.name || categoryObj.title) : "Truyện";

                        return (
                            <div className="story-card" key={story.id}>
                                <Link to={`/story/${story.slug}`} className="card-image-wrapper">
                                    <img
                                        src={story.thumbnail ? `${STORAGE_URL}${story.thumbnail}` : "https://via.placeholder.com/300x400"}
                                        alt={story.title}
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/300x400"; }}
                                    />
                                    <span className="category-badge">{categoryName}</span>
                                    {isRecentlyUpdated(story.chapters_max_created_at, story.created_at) && (
                                        <span className="new-badge">Mới cập nhật</span>
                                    )}
                                    <div className="status-overlay">
                                        {story.status === "completed" ? "Full" : "Đang ra"}
                                    </div>
                                </Link>

                                <div className="card-content">
                                    <div className="meta-top">
                                        <Link 
                                            to={`/authors/${encodeURIComponent(story.author_slug || story.author)}`} 
                                            className="author-link"
                                            style={{
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <span className="author" style={{ color: 'gray', fontWeight: 'bold'}}>{story.author || "Khuyết danh"}</span>
                                        </Link>
                                        <span className="rating"><FaStar /> {story.average_rating || "chưa có đánh giá nào"}</span>
                                    </div>
                                    
                                    <Link to={`/story/${story.slug}`} className="title-link">
                                        <h3 className="card-title">{story.title}</h3>
                                    </Link>

                                    {/* Hiển thị thời gian dựa trên chương mới nhất thay vì updated_at tổng */}
                                    <div className="chapter-count">
                                        <FaListOl /> <span>{story.chapters_count || 0} tập</span> 
                                        <FaClock /> {moment(story.chapters_max_created_at || story.created_at).fromNow()}
                                    </div>

                                    <p className="card-summary">{story.summary}</p>

                                    <div className="card-footer">
                                        <span className="views"><FaEye /> {(story.views || 0).toLocaleString()}</span>
                                        <Link to={`/story/${story.slug}`} className="btn-listen">
                                            Nghe ngay <FaHeadphones />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="no-results">
                    <img src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png" alt="empty" width="80" />
                    <p>Không tìm thấy truyện phù hợp.</p>
                    <button onClick={handleResetFilter}>Xem tất cả truyện</button>
                </div>
            )}
        </div>
    );
};

export default StoryList;