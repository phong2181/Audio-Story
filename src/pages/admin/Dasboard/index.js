import React, { memo, useCallback, useEffect, useRef, useState, useMemo } from "react";
import "./style.scss";
import {
  FaBook,
  FaTasks,
  FaUsers,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaRedoAlt,
  FaHeadphones,
  FaFileAlt,
  FaLayerGroup,
  FaSpinner,
  FaStar,
  FaRegStar,
  FaCrown,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaUserPlus,
  FaUserCheck,
  FaTrophy,
  FaExternalLinkAlt,
  FaFilter,
} from "react-icons/fa";
import {
  getAdminDashboardStatsAPI,
  getDashboardRecentContentsAPI,
  getDashboardActivityLogAPI,
  getDashboardAnalyticsAPI,
} from "api/homePage/request";
import { STORAGE_URL } from "config/config";
import { Link } from "react-router-dom";
import { ROUTES } from "utils/route";

const SCROLL_THRESHOLD = 100;

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState(null);

  // Analytics filter state
  const [viewsPeriod, setViewsPeriod] = useState("weekly"); // weekly, monthly, quarterly
  const [revenuePeriod, setRevenuePeriod] = useState("monthly"); // monthly, quarterly, yearly
  const [topPeriod, setTopPeriod] = useState("month"); // week, month, year
  const [topContentType, setTopContentType] = useState("stories"); // stories, categories, chapters

  // Analytics API data state
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  // Hover state for interactive SVG charts
  const [hoveredViewIndex, setHoveredViewIndex] = useState(null);
  const [hoveredRevenueIndex, setHoveredRevenueIndex] = useState(null);

  // Recent contents pagination state
  const [recentContents, setRecentContents] = useState([]);
  const [recentContentsCursor, setRecentContentsCursor] = useState(null);
  const [hasMoreRecentContents, setHasMoreRecentContents] = useState(true);
  const [isLoadingRecentContents, setIsLoadingRecentContents] = useState(true);
  const [isLoadingMoreRecentContents, setIsLoadingMoreRecentContents] = useState(false);

  // Activity log pagination state
  const [activityLog, setActivityLog] = useState([]);
  const [activityLogCursor, setActivityLogCursor] = useState(null);
  const [hasMoreActivityLog, setHasMoreActivityLog] = useState(true);
  const [isLoadingActivityLog, setIsLoadingActivityLog] = useState(true);
  const [isLoadingMoreActivityLog, setIsLoadingMoreActivityLog] = useState(false);

  const recentContentsRef = useRef(null);
  const activityLogRef = useRef(null);

  // Fetch basic overview stats
  const fetchDashboardStats = async () => {
    try {
      setIsLoadingStats(true);
      setError(null);
      const response = await getAdminDashboardStatsAPI();
      setDashboardData(response);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu dashboard:", err);
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch deep analytics data
  const fetchAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true);
      const res = await getDashboardAnalyticsAPI({
        views_period: viewsPeriod,
        revenue_period: revenuePeriod,
        top_period: topPeriod,
      });
      setAnalyticsData(res?.data || res);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu analytics:", err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const fetchRecentContents = async (cursor = null) => {
    const isLoadMore = cursor !== null;
    try {
      if (isLoadMore) setIsLoadingMoreRecentContents(true);
      else setIsLoadingRecentContents(true);

      const response = await getDashboardRecentContentsAPI(cursor);
      const newData = response?.data ?? [];
      const nextCursor = response?.next_cursor ?? null;
      const hasMore = response?.has_more ?? false;

      if (isLoadMore) {
        setRecentContents((prev) => [...prev, ...newData]);
      } else {
        setRecentContents(newData);
      }
      setRecentContentsCursor(nextCursor);
      setHasMoreRecentContents(hasMore);
    } catch (err) {
      console.error("Lỗi lấy nội dung gần đây:", err);
    } finally {
      if (isLoadMore) setIsLoadingMoreRecentContents(false);
      else setIsLoadingRecentContents(false);
    }
  };

  const fetchActivityLog = async (cursor = null) => {
    const isLoadMore = cursor !== null;
    try {
      if (isLoadMore) setIsLoadingMoreActivityLog(true);
      else setIsLoadingActivityLog(true);

      const response = await getDashboardActivityLogAPI(cursor);
      const newData = response?.data ?? [];
      const nextCursor = response?.next_cursor ?? null;
      const hasMore = response?.has_more ?? false;

      if (isLoadMore) {
        setActivityLog((prev) => [...prev, ...newData]);
      } else {
        setActivityLog(newData);
      }
      setActivityLogCursor(nextCursor);
      setHasMoreActivityLog(hasMore);
    } catch (err) {
      console.error("Lỗi lấy nhật ký hoạt động:", err);
    } finally {
      if (isLoadMore) setIsLoadingMoreActivityLog(false);
      else setIsLoadingActivityLog(false);
    }
  };

  useEffect(() => {
    document.title = "Bảng tin ‹ Book Audio Admin";
    fetchDashboardStats();
    fetchRecentContents();
    fetchActivityLog();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [viewsPeriod, revenuePeriod, topPeriod]);

  const handleRecentContentsScroll = useCallback(
    (e) => {
      if (isLoadingMoreRecentContents || !hasMoreRecentContents) return;
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD) {
        fetchRecentContents(recentContentsCursor);
      }
    },
    [isLoadingMoreRecentContents, hasMoreRecentContents, recentContentsCursor]
  );

  const handleActivityLogScroll = useCallback(
    (e) => {
      if (isLoadingMoreActivityLog || !hasMoreActivityLog) return;
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD) {
        fetchActivityLog(activityLogCursor);
      }
    },
    [isLoadingMoreActivityLog, hasMoreActivityLog, activityLogCursor]
  );

  // Formatter helpers
  const formatCurrency = (val) => {
    if (!val && val !== 0) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const formatNumber = (val) => {
    if (!val && val !== 0) return "0";
    return new Intl.NumberFormat("vi-VN").format(val);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) =>
      i < Math.floor(rating) ? (
        <FaStar key={i} className="star-filled" />
      ) : (
        <FaRegStar key={i} className="star-empty" />
      )
    );
  };

  const activeMembers = dashboardData?.active_members ?? [];
  const recentReviews = dashboardData?.recent_reviews ?? [];

  // ==========================================
  // CHART CALCULATIONS (PURE SVG)
  // ==========================================
  const viewsChartData = analyticsData?.views_data?.chart || [];
  const viewsMax = useMemo(() => {
    if (!viewsChartData.length) return 100;
    const max = Math.max(...viewsChartData.map((d) => d.views || 0));
    return Math.ceil(max * 1.15) || 100;
  }, [viewsChartData]);

  const revenueChartData = analyticsData?.revenue_data?.chart || [];
  const revenueMax = useMemo(() => {
    if (!revenueChartData.length) return 1000000;
    const max = Math.max(...revenueChartData.map((d) => d.revenue || 0));
    return Math.ceil(max * 1.15) || 1000000;
  }, [revenueChartData]);

  const trafficData = analyticsData?.traffic_data || {
    new_users: 18,
    returning_users: 42,
    new_user_pct: 30,
    returning_user_pct: 70,
    retention_rate: 68.5,
    hourly_chart: [],
  };

  const rankings = analyticsData?.rankings || {
    top_stories: [],
    top_categories: [],
    top_chapters: [],
  };

  // Helper compute SVG smooth curve for views chart
  const svgViewPoints = useMemo(() => {
    if (!viewsChartData.length) return "";
    const width = 600;
    const height = 200;
    const padding = 25;
    const step = (width - padding * 2) / Math.max(1, viewsChartData.length - 1);

    return viewsChartData.map((pt, idx) => {
      const x = padding + idx * step;
      const y = height - padding - ((pt.views || 0) / viewsMax) * (height - padding * 2);
      return { x, y, ...pt };
    });
  }, [viewsChartData, viewsMax]);

  const svgViewPath = useMemo(() => {
    if (!svgViewPoints.length) return "";
    return svgViewPoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, "");
  }, [svgViewPoints]);

  const svgViewArea = useMemo(() => {
    if (!svgViewPoints.length) return "";
    const first = svgViewPoints[0];
    const last = svgViewPoints[svgViewPoints.length - 1];
    const height = 200;
    const padding = 25;
    return `${svgViewPath} L ${last.x} ${height - padding} L ${first.x} ${height - padding} Z`;
  }, [svgViewPoints, svgViewPath]);

  if (error) {
    return (
      <div className="wp-dashboard-wrap">
        <div className="wp-header-title">
          <h1>Bảng tin</h1>
        </div>
        <div className="wp-notice wp-notice-error">
          <FaExclamationCircle className="notice-icon" />
          <div className="notice-msg">
            <p>{error}</p>
            <button className="button button-secondary" onClick={fetchDashboardStats}>
              <FaRedoAlt /> Tải lại dữ liệu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wp-dashboard-wrap">
      {/* WordPress Page Header */}
      <div className="wp-dashboard-header">
        <div className="header-left">
          <h1 className="wp-heading-inline">Bảng tin</h1>
          <span className="wp-version-badge">Book Audio CMS v3.2</span>
        </div>
        <div className="header-actions">
          <button
            className="button button-secondary"
            onClick={() => {
              fetchDashboardStats();
              fetchAnalytics();
            }}
            title="Làm mới toàn bộ số liệu"
          >
            <FaRedoAlt className={isLoadingAnalytics ? "spin" : ""} /> Làm mới số liệu
          </button>
          <Link to={ROUTES.ADMIN.HEADER_CUSTOMIZER} className="button button-primary">
            Tùy biến Header & Mùa
          </Link>
        </div>
      </div>

      {/* WordPress Welcome Banner */}
      <div className="wp-welcome-panel">
        <div className="welcome-panel-content">
          <div className="welcome-panel-header">
            <h2>Chào mừng bạn đến với Bảng Quản trị Book Audio!</h2>
            <p className="about-description">
              Hệ thống theo dõi thống kê người xem, phân tích doanh thu và hiệu ứng giao diện động theo phong cách WordPress.
            </p>
          </div>
          <div className="welcome-panel-column-container">
            <div className="welcome-panel-column">
              <h3>Bắt đầu nhanh</h3>
              <Link to={ROUTES.ADMIN.AUDIO_ADD} className="button button-primary button-hero">
                + Thêm chương audio mới
              </Link>
              <p className="description">Hoặc tùy biến bố cục giao diện trực quan</p>
            </div>
            <div className="welcome-panel-column">
              <h3>Các bước tiếp theo</h3>
              <ul>
                <li>
                  <Link to={ROUTES.ADMIN.POSTS_ADD} className="welcome-icon">
                    <FaFileAlt /> Viết bài viết blog mới
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.ADMIN.MANAGE_COMMENTS_AUDIO} className="welcome-icon">
                    <FaBook /> Quản lý danh mục truyện audio
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.ADMIN.HEADER_CUSTOMIZER} className="welcome-icon">
                    <FaCrown /> Đổi hiệu ứng mùa & lễ tết
                  </Link>
                </li>
              </ul>
            </div>
            <div className="welcome-panel-column">
              <h3>Thao tác quản trị</h3>
              <ul>
                <li>
                  <Link to={ROUTES.ADMIN.MANAGE_VIP_APPROVAL} className="welcome-icon">
                    <FaUsers /> Kiểm duyệt & Khóa tài khoản
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.ADMIN.REVENUE_STATISTICS} className="welcome-icon">
                    <FaMoneyBillWave /> Thống kê giao dịch membership
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.ADMIN.INFOMATION_AUTHORS} className="welcome-icon">
                    <FaUserCheck /> Hồ sơ cá nhân tác giả
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* WordPress "At a Glance" KPI Summary Cards */}
      <div className="wp-stats-overview-grid">
        <div className="wp-stat-box card-blue">
          <div className="stat-icon-wrapper">
            <FaBook />
          </div>
          <div className="stat-info">
            <span className="stat-count">
              {isLoadingStats ? "..." : formatNumber(dashboardData?.total_stories || 0)}
            </span>
            <span className="stat-label">Bộ truyện audio</span>
          </div>
          <Link to={ROUTES.ADMIN.MANAGE_COMMENTS_AUDIO} className="stat-link">
            Xem tất cả →
          </Link>
        </div>

        <div className="wp-stat-box card-green">
          <div className="stat-icon-wrapper">
            <FaTasks />
          </div>
          <div className="stat-info">
            <span className="stat-count">
              {isLoadingStats ? "..." : formatNumber(dashboardData?.total_posts || 0)}
            </span>
            <span className="stat-label">Bài viết tin tức</span>
          </div>
          <Link to={ROUTES.ADMIN.All_POSTS} className="stat-link">
            Xem bài viết →
          </Link>
        </div>

        <div className="wp-stat-box card-purple">
          <div className="stat-icon-wrapper">
            <FaUsers />
          </div>
          <div className="stat-info">
            <span className="stat-count">
              {isLoadingStats ? "..." : formatNumber(dashboardData?.total_users || 0)}
            </span>
            <span className="stat-label">Tổng người dùng</span>
          </div>
          <Link to={ROUTES.ADMIN.MANAGE_USERS_AUTHORS} className="stat-link">
            Xem thành viên →
          </Link>
        </div>

        <div className="wp-stat-box card-gold">
          <div className="stat-icon-wrapper">
            <FaMoneyBillWave />
          </div>
          <div className="stat-info">
            <span className="stat-count">
              {isLoadingAnalytics
                ? "..."
                : formatCurrency(analyticsData?.revenue_data?.total_revenue || 0)}
            </span>
            <span className="stat-label">Doanh thu kỳ chọn</span>
          </div>
          <Link to={ROUTES.ADMIN.REVENUE_STATISTICS} className="stat-link">
            Chi tiết doanh thu →
          </Link>
        </div>
      </div>

      {/* ========================================================
          ANALYTICS CHARTS SECTION (4 BIỂU ĐỒ CHUYÊN SÂU CHUẨN WP)
         ======================================================== */}
      <div className="wp-charts-grid">
        {/* CHART 1: LƯỢNG NGƯỜI XEM (VIEWS ANALYTICS) */}
        <div className="wp-metabox chart-card">
          <div className="postbox-header">
            <div className="header-title-group">
              <FaChartLine className="box-icon color-blue" />
              <h2>Lượng người xem ({viewsPeriod === "weekly" ? "Hàng tuần" : viewsPeriod === "monthly" ? "Hàng tháng" : "Quý trong năm"})</h2>
            </div>
            <div className="filter-pill-group">
              <button
                type="button"
                className={`filter-pill ${viewsPeriod === "weekly" ? "active" : ""}`}
                onClick={() => setViewsPeriod("weekly")}
              >
                Hàng tuần
              </button>
              <button
                type="button"
                className={`filter-pill ${viewsPeriod === "monthly" ? "active" : ""}`}
                onClick={() => setViewsPeriod("monthly")}
              >
                Hàng tháng
              </button>
              <button
                type="button"
                className={`filter-pill ${viewsPeriod === "quarterly" ? "active" : ""}`}
                onClick={() => setViewsPeriod("quarterly")}
              >
                Theo quý
              </button>
            </div>
          </div>

          <div className="inside">
            <div className="chart-meta-summary">
              <div className="meta-item">
                <span className="meta-sub">Tổng lượt xem trong kỳ</span>
                <span className="meta-main-val">
                  {formatNumber(analyticsData?.views_data?.total_views || 0)} lượt
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-sub">Tăng trưởng</span>
                <span className="meta-growth positive">
                  <FaArrowUp /> +{analyticsData?.views_data?.growth || 12.5}%
                </span>
              </div>
            </div>

            {/* SVG Interactive Line / Area Chart */}
            <div className="svg-chart-container">
              {isLoadingAnalytics ? (
                <div className="chart-loading-skeleton">
                  <FaSpinner className="spin" />
                  <span>Đang dựng biểu đồ lượt xem...</span>
                </div>
              ) : (
                <div className="svg-wrapper">
                  <svg viewBox="0 0 600 200" className="interactive-svg-chart">
                    <defs>
                      <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2271b1" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#2271b1" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>

                    {/* Gridlines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => (
                      <line
                        key={idx}
                        x1="25"
                        y1={25 + pct * 150}
                        x2="575"
                        y2={25 + pct * 150}
                        className="chart-gridline"
                      />
                    ))}

                    {/* Area under curve */}
                    {svgViewArea && <path d={svgViewArea} fill="url(#viewsGradient)" />}

                    {/* Main Line curve */}
                    {svgViewPath && (
                      <path
                        d={svgViewPath}
                        fill="none"
                        stroke="#2271b1"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Interactive dots */}
                    {svgViewPoints.map((pt, idx) => (
                      <g key={idx} className="chart-data-point">
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={hoveredViewIndex === idx ? 6 : 4}
                          className={`point-circle ${hoveredViewIndex === idx ? "active" : ""}`}
                          onMouseEnter={() => setHoveredViewIndex(idx)}
                          onMouseLeave={() => setHoveredViewIndex(null)}
                        />
                        {/* Dot hover tooltip */}
                        {hoveredViewIndex === idx && (
                          <g>
                            <rect
                              x={pt.x - 45}
                              y={pt.y - 42}
                              width="90"
                              height="30"
                              rx="4"
                              className="tooltip-box"
                            />
                            <text x={pt.x} y={pt.y - 23} textAnchor="middle" className="tooltip-text">
                              {formatNumber(pt.views)} views
                            </text>
                          </g>
                        )}
                        {/* X-axis label */}
                        <text x={pt.x} y="195" textAnchor="middle" className="axis-label">
                          {pt.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CHART 2: DOANH THU (REVENUE ANALYTICS) */}
        <div className="wp-metabox chart-card">
          <div className="postbox-header">
            <div className="header-title-group">
              <FaMoneyBillWave className="box-icon color-green" />
              <h2>Thống kê doanh thu ({revenuePeriod === "monthly" ? "Theo tháng" : revenuePeriod === "quarterly" ? "Theo quý" : "Theo năm"})</h2>
            </div>
            <div className="filter-pill-group">
              <button
                type="button"
                className={`filter-pill ${revenuePeriod === "monthly" ? "active" : ""}`}
                onClick={() => setRevenuePeriod("monthly")}
              >
                Theo tháng
              </button>
              <button
                type="button"
                className={`filter-pill ${revenuePeriod === "quarterly" ? "active" : ""}`}
                onClick={() => setRevenuePeriod("quarterly")}
              >
                Theo quý
              </button>
              <button
                type="button"
                className={`filter-pill ${revenuePeriod === "yearly" ? "active" : ""}`}
                onClick={() => setRevenuePeriod("yearly")}
              >
                Theo năm
              </button>
            </div>
          </div>

          <div className="inside">
            <div className="chart-meta-summary">
              <div className="meta-item">
                <span className="meta-sub">Tổng doanh thu gói VIP</span>
                <span className="meta-main-val green-text">
                  {formatCurrency(analyticsData?.revenue_data?.total_revenue || 0)}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-sub">Tăng trưởng so với cùng kỳ</span>
                <span className="meta-growth positive">
                  <FaArrowUp /> +{analyticsData?.revenue_data?.growth || 18.2}%
                </span>
              </div>
            </div>

            {/* SVG Interactive Bar Chart */}
            <div className="svg-chart-container">
              {isLoadingAnalytics ? (
                <div className="chart-loading-skeleton">
                  <FaSpinner className="spin" />
                  <span>Đang dựng biểu đồ doanh thu...</span>
                </div>
              ) : (
                <div className="svg-wrapper">
                  <svg viewBox="0 0 600 200" className="interactive-svg-chart">
                    {/* Gridlines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => (
                      <line
                        key={idx}
                        x1="25"
                        y1={25 + pct * 150}
                        x2="575"
                        y2={25 + pct * 150}
                        className="chart-gridline"
                      />
                    ))}

                    {/* Bars */}
                    {revenueChartData.map((bar, idx) => {
                      const totalBars = revenueChartData.length;
                      const slotWidth = (550 - 50) / totalBars;
                      const barWidth = Math.min(28, slotWidth * 0.65);
                      const x = 50 + idx * slotWidth + (slotWidth - barWidth) / 2;
                      const barHeight = Math.max(
                        4,
                        ((bar.revenue || 0) / revenueMax) * (200 - 55)
                      );
                      const y = 200 - 30 - barHeight;
                      const isHovered = hoveredRevenueIndex === idx;

                      return (
                        <g key={idx} className="chart-bar-group">
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            rx="4"
                            className={`revenue-bar ${isHovered ? "active" : ""}`}
                            onMouseEnter={() => setHoveredRevenueIndex(idx)}
                            onMouseLeave={() => setHoveredRevenueIndex(null)}
                          />
                          {/* Bar Tooltip */}
                          {isHovered && (
                            <g>
                              <rect
                                x={Math.max(10, Math.min(490, x - 50))}
                                y={Math.max(10, y - 42)}
                                width="120"
                                height="32"
                                rx="4"
                                className="tooltip-box"
                              />
                              <text
                                x={Math.max(70, Math.min(550, x + barWidth / 2))}
                                y={Math.max(30, y - 22)}
                                textAnchor="middle"
                                className="tooltip-text"
                              >
                                {formatCurrency(bar.revenue)}
                              </text>
                            </g>
                          )}
                          {/* X-axis label */}
                          <text
                            x={x + barWidth / 2}
                            y="192"
                            textAnchor="middle"
                            className="axis-label"
                          >
                            {bar.short || bar.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CHART 3: TẦN SUẤT TRUY CẬP (NGƯỜI DÙNG MỚI VS NGƯỜI DÙNG CŨ) */}
        <div className="wp-metabox chart-card">
          <div className="postbox-header">
            <div className="header-title-group">
              <FaUsers className="box-icon color-purple" />
              <h2>Tần suất truy cập (Người dùng mới & Người dùng cũ)</h2>
            </div>
            <span className="header-badge">Tỷ lệ duy trì {trafficData.retention_rate}%</span>
          </div>

          <div className="inside">
            <div className="traffic-analytics-container">
              {/* Donut Chart Presentation */}
              <div className="traffic-donut-box">
                <div className="donut-svg-wrapper">
                  <svg viewBox="0 0 160 160" className="donut-chart">
                    {/* Background circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="20"
                    />
                    {/* Returning users stroke (tím) */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="20"
                      strokeDasharray={`${(trafficData.returning_user_pct * 377) / 100} 377`}
                      strokeDashoffset="0"
                      transform="rotate(-90 80 80)"
                    />
                    {/* New users stroke (xanh dương) */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="20"
                      strokeDasharray={`${(trafficData.new_user_pct * 377) / 100} 377`}
                      strokeDashoffset={`-${(trafficData.returning_user_pct * 377) / 100}`}
                      transform="rotate(-90 80 80)"
                    />
                  </svg>
                  <div className="donut-center-info">
                    <span className="donut-big-pct">{trafficData.returning_user_pct}%</span>
                    <span className="donut-sub-label">Quay lại</span>
                  </div>
                </div>

                <div className="donut-legend">
                  <div className="legend-row">
                    <span className="legend-indicator color-new"></span>
                    <span className="legend-label">Người dùng mới:</span>
                    <strong className="legend-value">
                      {formatNumber(trafficData.new_users)} ({trafficData.new_user_pct}%)
                    </strong>
                  </div>
                  <div className="legend-row">
                    <span className="legend-indicator color-returning"></span>
                    <span className="legend-label">Người dùng cũ:</span>
                    <strong className="legend-value">
                      {formatNumber(trafficData.returning_users)} ({trafficData.returning_user_pct}%)
                    </strong>
                  </div>
                </div>
              </div>

              {/* Tần suất truy cập theo khung giờ trong ngày */}
              <div className="traffic-hourly-box">
                <h4 className="hourly-title">Tần suất theo khung giờ trong ngày</h4>
                <div className="hourly-bars-list">
                  {(trafficData.hourly_chart || []).map((slot, sIdx) => {
                    const maxHourly = 350;
                    const newW = ((slot.new || 0) / maxHourly) * 100;
                    const retW = ((slot.returning || 0) / maxHourly) * 100;

                    return (
                      <div key={sIdx} className="hourly-bar-row">
                        <div className="bar-label-line">
                          <span>{slot.label}</span>
                          <strong>{slot.total} lượt</strong>
                        </div>
                        <div className="stacked-progress-bar">
                          <div
                            className="segment-returning"
                            style={{ width: `${retW}%` }}
                            title={`Cũ: ${slot.returning}`}
                          ></div>
                          <div
                            className="segment-new"
                            style={{ width: `${newW}%` }}
                            title={`Mới: ${slot.new}`}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CHART 4: TẦN SUẤT BỘ TRUYỆN, THỂ LOẠI, TẬP TRUYỆN HOT NHẤT */}
        <div className="wp-metabox chart-card">
          <div className="postbox-header">
            <div className="header-title-group">
              <FaTrophy className="box-icon color-gold" />
              <h2>Nội dung được xem & đánh giá cao nhất</h2>
            </div>
            <div className="filter-pill-group">
              <button
                type="button"
                className={`filter-pill ${topPeriod === "week" ? "active" : ""}`}
                onClick={() => setTopPeriod("week")}
              >
                Tuần
              </button>
              <button
                type="button"
                className={`filter-pill ${topPeriod === "month" ? "active" : ""}`}
                onClick={() => setTopPeriod("month")}
              >
                Tháng
              </button>
              <button
                type="button"
                className={`filter-pill ${topPeriod === "year" ? "active" : ""}`}
                onClick={() => setTopPeriod("year")}
              >
                Năm
              </button>
            </div>
          </div>

          <div className="inside">
            {/* Sub-tabs: Stories / Categories / Chapters */}
            <div className="content-sub-tabs">
              <button
                type="button"
                className={`sub-tab-btn ${topContentType === "stories" ? "active" : ""}`}
                onClick={() => setTopContentType("stories")}
              >
                <FaBook /> Top Bộ Truyện ({rankings.top_stories?.length || 0})
              </button>
              <button
                type="button"
                className={`sub-tab-btn ${topContentType === "categories" ? "active" : ""}`}
                onClick={() => setTopContentType("categories")}
              >
                <FaLayerGroup /> Top Thể Loại ({rankings.top_categories?.length || 0})
              </button>
              <button
                type="button"
                className={`sub-tab-btn ${topContentType === "chapters" ? "active" : ""}`}
                onClick={() => setTopContentType("chapters")}
              >
                <FaHeadphones /> Top Tập Truyện ({rankings.top_chapters?.length || 0})
              </button>
            </div>

            {/* List / Table of Ranked Items */}
            <div className="rankings-table-container">
              {topContentType === "stories" && (
                <table className="wp-ranking-table">
                  <thead>
                    <tr>
                      <th style={{ width: "45px" }}>Hạng</th>
                      <th>Tên bộ truyện</th>
                      <th>Thể loại</th>
                      <th>Lượt xem</th>
                      <th>Đánh giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(rankings.top_stories || []).map((story, idx) => (
                      <tr key={story.id || idx}>
                        <td>
                          <span className={`rank-badge rank-${idx + 1}`}>#{idx + 1}</span>
                        </td>
                        <td>
                          <div className="table-story-item">
                            <span className="story-title-text">{story.title}</span>
                            <span className="story-sub-text">{story.chapters_count} chương</span>
                          </div>
                        </td>
                        <td>
                          <span className="category-pill">{story.category}</span>
                        </td>
                        <td>
                          <strong className="views-count-text">
                            {formatNumber(story.views)}
                          </strong>
                        </td>
                        <td>
                          <div className="table-rating-stars">
                            <span className="rating-num">⭐ {story.rating}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {topContentType === "categories" && (
                <table className="wp-ranking-table">
                  <thead>
                    <tr>
                      <th style={{ width: "45px" }}>Hạng</th>
                      <th>Thể loại truyện</th>
                      <th>Số bộ truyện</th>
                      <th>Tổng lượt nghe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(rankings.top_categories || []).map((cat, idx) => (
                      <tr key={cat.id || idx}>
                        <td>
                          <span className={`rank-badge rank-${idx + 1}`}>#{idx + 1}</span>
                        </td>
                        <td>
                          <strong>{cat.name}</strong>
                        </td>
                        <td>{cat.stories_count} bộ truyện</td>
                        <td>
                          <strong className="views-count-text">
                            {formatNumber(cat.total_views)} lượt
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {topContentType === "chapters" && (
                <table className="wp-ranking-table">
                  <thead>
                    <tr>
                      <th style={{ width: "45px" }}>Hạng</th>
                      <th>Tập truyện</th>
                      <th>Bộ truyện</th>
                      <th>Lượt nghe</th>
                      <th>Loại</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(rankings.top_chapters || []).map((ch, idx) => (
                      <tr key={ch.id || idx}>
                        <td>
                          <span className={`rank-badge rank-${idx + 1}`}>#{idx + 1}</span>
                        </td>
                        <td>
                          <strong>{ch.chapter_name}</strong>
                        </td>
                        <td className="muted-text">{ch.story_title}</td>
                        <td>
                          <strong className="views-count-text">
                            {formatNumber(ch.views)} lượt
                          </strong>
                        </td>
                        <td>
                          {ch.is_vip ? (
                            <span className="badge-vip">👑 VIP</span>
                          ) : (
                            <span className="badge-free">Miễn phí</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          WP 2-COLUMN LOWER SECTION (HOẠT ĐỘNG, NỘI DUNG & THÀNH VIÊN)
         ======================================================== */}
      <div className="wp-dashboard-columns">
        {/* CỘT CHÍNH (BÊN TRÁI) */}
        <div className="wp-col-primary">
          {/* NỘI DUNG ĐĂNG TẢI GẦN ĐÂY */}
          <div className="wp-metabox">
            <div className="postbox-header">
              <h2>📝 Nội dung đăng tải gần đây</h2>
            </div>
            <div className="inside">
              {isLoadingRecentContents ? (
                <div className="chart-loading-skeleton">
                  <FaSpinner className="spin" />
                  <span>Đang tải nội dung...</span>
                </div>
              ) : recentContents.length === 0 ? (
                <p className="no-items-text">Chưa có nội dung nào được đăng tải.</p>
              ) : (
                <div
                  className="wp-table-scroll"
                  ref={recentContentsRef}
                  onScroll={handleRecentContentsScroll}
                >
                  <table className="wp-list-table widefat striped">
                    <thead>
                      <tr>
                        <th>Tiêu đề</th>
                        <th>Loại</th>
                        <th>Thời gian</th>
                        <th>Tác giả</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentContents.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.title}</strong>
                            <div className="row-subtitle">{item.subtitle}</div>
                          </td>
                          <td>
                            <span className={`content-badge badge-${item.type}`}>
                              {item.type === "story"
                                ? "Bộ truyện"
                                : item.type === "chapter"
                                ? "Tập truyện"
                                : "Bài viết"}
                            </span>
                          </td>
                          <td>
                            <span className="time-text">
                              {formatTime(item.created_at)} - {formatDate(item.created_at)}
                            </span>
                          </td>
                          <td>
                            <span>{item.author || "Admin"}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {isLoadingMoreRecentContents && (
                    <div className="load-more-indicator">
                      <FaSpinner className="spin" /> Đang tải thêm...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* NHẬT KÝ HOẠT ĐỘNG */}
          <div className="wp-metabox">
            <div className="postbox-header">
              <h2>📋 Hoạt động gần đây</h2>
            </div>
            <div className="inside">
              <div
                className="activity-scroll-list"
                ref={activityLogRef}
                onScroll={handleActivityLogScroll}
              >
                {isLoadingActivityLog ? (
                  <div className="chart-loading-skeleton">
                    <FaSpinner className="spin" />
                    <span>Đang tải nhật ký...</span>
                  </div>
                ) : activityLog.length === 0 ? (
                  <p className="no-items-text">Chưa có hoạt động nào được ghi nhận.</p>
                ) : (
                  activityLog.map((act) => (
                    <div key={act.id} className="wp-activity-row">
                      <div className="activity-icon-bullet">
                        {act.type === "story" ? (
                          <FaBook />
                        ) : act.type === "chapter" ? (
                          <FaHeadphones />
                        ) : (
                          <FaFileAlt />
                        )}
                      </div>
                      <div className="activity-details">
                        <span className="activity-msg">{act.message}</span>
                        <span className="activity-timestamp">
                          {formatDate(act.created_at)} {formatTime(act.created_at)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                {isLoadingMoreActivityLog && (
                  <div className="load-more-indicator">
                    <FaSpinner className="spin" /> Đang tải thêm hoạt động...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHỤ (BÊN PHẢI) */}
        <div className="wp-col-secondary">
          {/* THÀNH VIÊN QUẢN TRỊ ĐANG HOẠT ĐỘNG */}
          <div className="wp-metabox">
            <div className="postbox-header">
              <h2>👥 Ban quản trị & Tác giả</h2>
            </div>
            <div className="inside">
              <div className="staff-members-list">
                {activeMembers.map((member) => {
                  const avatarSrc = member.avatar
                    ? member.avatar.startsWith("http")
                      ? member.avatar
                      : `${STORAGE_URL}${member.avatar}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        member.name
                      )}&background=2271b1&color=fff`;

                  return (
                    <div key={member.id} className="staff-row">
                      <img
                        src={avatarSrc}
                        alt={member.name}
                        className="staff-avatar"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            member.name
                          )}&background=2271b1&color=fff`;
                        }}
                      />
                      <div className="staff-info">
                        <strong className="staff-name">{member.name}</strong>
                        <span className={`staff-role-badge role-${member.role}`}>
                          {member.role === "admin" ? "Quản trị viên" : "Biên tập viên"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ĐÁNH GIÁ MỚI NHẤT TỪ NGƯỜI DÙNG */}
          <div className="wp-metabox">
            <div className="postbox-header">
              <h2>⭐ Đánh giá mới nhất</h2>
            </div>
            <div className="inside">
              <div className="recent-reviews-list">
                {recentReviews.length === 0 ? (
                  <p className="no-items-text">Chưa có đánh giá nào.</p>
                ) : (
                  recentReviews.map((rev) => (
                    <div key={rev.id} className="review-wp-box">
                      <div className="rev-head">
                        <strong>{rev.user_name}</strong>
                        <div className="rev-stars">{renderStars(rev.rating)}</div>
                      </div>
                      <div className="rev-story-link">Truyện: {rev.story_title}</div>
                      <p className="rev-quote">"{rev.content}"</p>
                      <span className="rev-date">{formatDate(rev.created_at)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(AdminDashboard);
