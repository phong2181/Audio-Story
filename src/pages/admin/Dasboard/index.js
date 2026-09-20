
import { memo, useCallback, useEffect, useRef, useState } from "react";
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
} from "react-icons/fa";
import {
  getAdminDashboardStatsAPI,
  getDashboardRecentContentsAPI,
  getDashboardActivityLogAPI,
} from "api/homePage/request";
import { STORAGE_URL } from "config/config";

const SCROLL_THRESHOLD = 100;

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAdminDashboardStatsAPI();
      setDashboardData(response);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu dashboard:", err);
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentContents = async (cursor = null) => {
    const isLoadMore = cursor !== null;
    try {
      if (isLoadMore) {
        setIsLoadingMoreRecentContents(true);
      } else {
        setIsLoadingRecentContents(true);
      }

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
      if (isLoadMore) {
        setIsLoadingMoreRecentContents(false);
      } else {
        setIsLoadingRecentContents(false);
      }
    }
  };

  const fetchActivityLog = async (cursor = null) => {
    const isLoadMore = cursor !== null;
    try {
      if (isLoadMore) {
        setIsLoadingMoreActivityLog(true);
      } else {
        setIsLoadingActivityLog(true);
      }

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
      if (isLoadMore) {
        setIsLoadingMoreActivityLog(false);
      } else {
        setIsLoadingActivityLog(false);
      }
    }
  };

  useEffect(() => {
    document.title = "Bảng Điều Khiển quản trị";
    fetchDashboardStats();
    fetchRecentContents();
    fetchActivityLog();
  }, []);

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

  const stats = [
    {
      title: "Tất cả bộ truyện",
      value: dashboardData?.total_stories ?? 0,
      color: "green",
      icon: <FaBook />,
    },
    {
      title: "Tổng số bài viết",
      value: dashboardData?.total_posts ?? 0,
      color: "blue",
      icon: <FaTasks />,
    },
    {
      title: "Thành viên admin",
      value: dashboardData?.total_admins ?? 0,
      color: "purple",
      icon: <FaUsers />,
    },
    {
      title: "Tổng người dùng",
      value: dashboardData?.total_users ?? 0,
      color: "orange",
      icon: <FaChartLine />,
    },
  ];

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

  const activeMembers = dashboardData?.active_members ?? [];
  const recentReviews = dashboardData?.recent_reviews ?? [];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) =>
      i < rating ? (
        <FaStar key={i} className="star-filled" />
      ) : (
        <FaRegStar key={i} className="star-empty" />
      )
    );
  };

  const getReviewerAvatarUrl = (review) => {
    if (!review.user_avatar) return `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user_name)}&background=667eea&color=fff`;
    if (review.user_avatar.startsWith("http")) return review.user_avatar;
    return `${STORAGE_URL}${review.user_avatar}`;
  };

  const getAvatarUrl = (member) => {
    if (!member.avatar) return `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=667eea&color=fff`;
    if (member.avatar.startsWith("http")) return member.avatar;
    return `${STORAGE_URL}${member.avatar}`;
  };

  const getRoleLabel = (role) => {
    const roleMap = { admin: "Admin", staff: "Staff", user: "User" };
    return roleMap[role] ?? role;
  };

  const getContentTypeConfig = (type) => {
    switch (type) {
      case "story":
        return { label: "Bộ truyện", className: "type-story", icon: <FaBook /> };
      case "chapter":
        return { label: "Tập truyện", className: "type-chapter", icon: <FaHeadphones /> };
      case "post":
        return { label: "Bài viết", className: "type-post", icon: <FaFileAlt /> };
      default:
        return { label: type, className: "", icon: <FaLayerGroup /> };
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "story":
        return <FaBook />;
      case "chapter":
        return <FaHeadphones />;
      case "post":
        return <FaFileAlt />;
      default:
        return <FaCheckCircle />;
    }
  };

  const getActivityStatus = (type) => {
    switch (type) {
      case "story":
        return "success";
      case "chapter":
        return "warning";
      case "post":
        return "info";
      default:
        return "success";
    }
  };

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="page-title">📊 Bảng Điều Khiển quản trị</h1>
            <p className="page-subtitle">Tổng quan về hoạt động và thống kê của Book Audio</p>
          </div>
        </div>
        <div className="dashboard-container">
          <div className="dashboard-error">
            <FaExclamationCircle className="error-icon" />
            <p className="error-text">{error}</p>
            <button className="btn-retry" onClick={fetchDashboardStats}>
              <FaRedoAlt /> Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="page-title">📊 Bảng Điều Khiển quản trị</h1>
          <p className="page-subtitle">Tổng quan về hoạt động và thống kê của Book Audio</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-container">
        <div className="stats-grid">
          {stats.map((item, idx) => (
            <div key={idx} className={`stats-card ${item.color} ${isLoading ? "loading" : ""}`}>
              <div className="card-icon">{item.icon}</div>
              <div className="card-body">
                <div className="card-title">{item.title}</div>
                <div className="card-value">
                  {isLoading ? <span className="skeleton-text">&nbsp;</span> : item.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className="dashboard-container mt-30">
        <div className="dashboard-grid">
          <div className="col-main">
            {/* Recent Contents Table (gộp bộ truyện, tập truyện, bài viết) */}
            <div className="table-card">
              <div className="card-header">
                <h3 className="card-title">📝 Nội dung đăng tải gần đây</h3>
              </div>
              {isLoadingRecentContents ? (
                <div className="skeleton-table">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-row">
                      <div className="skeleton-cell wide"></div>
                      <div className="skeleton-cell"></div>
                      <div className="skeleton-cell"></div>
                      <div className="skeleton-cell"></div>
                    </div>
                  ))}
                </div>
              ) : recentContents.length === 0 ? (
                <div className="empty-state">
                  <FaTasks className="empty-icon" />
                  <p>Chưa có nội dung nào được đăng tải.</p>
                </div>
              ) : (
                <div
                  className="table-scroll-container"
                  ref={recentContentsRef}
                  onScroll={handleRecentContentsScroll}
                >
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Tên nội dung</th>
                        <th>Loại</th>
                        <th>Giờ</th>
                        <th>Ngày Đăng</th>
                        <th>Tác giả</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentContents.map((item) => {
                        const typeConfig = getContentTypeConfig(item.type);
                        return (
                          <tr key={item.id}>
                            <td>
                              <div className="post-info">
                                <div className="post-title">{item.title}</div>
                                <div className="post-meta">{item.subtitle}</div>
                              </div>
                            </td>
                            <td>
                              <span className={`content-type-badge ${typeConfig.className}`}>
                                {typeConfig.icon} {typeConfig.label}
                              </span>
                            </td>
                            <td>
                              <span className="status-badge pending">⏱ {formatTime(item.created_at)}</span>
                            </td>
                            <td>
                              <span className="status-badge approved">{formatDate(item.created_at)}</span>
                            </td>
                            <td>
                              <span className="author">{item.author}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {isLoadingMoreRecentContents && (
                    <div className="load-more-indicator">
                      <FaSpinner className="spinner-icon" />
                      <span>Đang tải thêm...</span>
                    </div>
                  )}
                  {!hasMoreRecentContents && recentContents.length > 0 && (
                    <div className="end-of-list">
                      <span>Đã hiển thị tất cả nội dung</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Activity Log (nhật ký hoạt động từ API) */}
            <div className="activity-card">
              <div className="card-header">
                <h3 className="card-title">📋 Nhật ký hoạt động</h3>
              </div>
              <div
                className="activity-list"
                ref={activityLogRef}
                onScroll={handleActivityLogScroll}
              >
                {isLoadingActivityLog ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-activity">
                      <div className="skeleton-circle"></div>
                      <div className="skeleton-lines">
                        <div className="skeleton-line wide"></div>
                        <div className="skeleton-line short"></div>
                      </div>
                    </div>
                  ))
                ) : activityLog.length === 0 ? (
                  <div className="empty-state">
                    <FaClock className="empty-icon" />
                    <p>Chưa có hoạt động nào.</p>
                  </div>
                ) : (
                  <>
                    {activityLog.map((activity) => {
                      const status = getActivityStatus(activity.type);
                      return (
                        <div key={activity.id} className={`activity-item ${status}`}>
                          <div className="activity-icon">{getActivityIcon(activity.type)}</div>
                          <div className="activity-body">
                            <p className="activity-text">{activity.message}</p>
                            <span className="activity-time">
                              {formatDate(activity.created_at)} {formatTime(activity.created_at)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {isLoadingMoreActivityLog && (
                      <div className="load-more-indicator">
                        <FaSpinner className="spinner-icon" />
                        <span>Đang tải thêm...</span>
                      </div>
                    )}
                    {!hasMoreActivityLog && activityLog.length > 0 && (
                      <div className="end-of-list">
                        <span>Đã hiển thị tất cả hoạt động</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Members Section */}
          <div className="col-sidebar">
            <div className="member-card">
              <div className="card-header">
                <h3 className="card-title">👥 Thành viên hoạt động</h3>
              </div>
              <div className="member-list">
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-member">
                      <div className="skeleton-avatar"></div>
                      <div className="skeleton-lines">
                        <div className="skeleton-line wide"></div>
                        <div className="skeleton-line short"></div>
                      </div>
                    </div>
                  ))
                ) : activeMembers.length === 0 ? (
                  <div className="empty-state">
                    <FaUsers className="empty-icon" />
                    <p>Chưa có thành viên nào.</p>
                  </div>
                ) : (
                  activeMembers.map((member) => (
                    <div key={member.id} className="member-item">
                      <img
                        src={getAvatarUrl(member)}
                        alt={member.name}
                        className="member-avatar"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=667eea&color=fff`;
                        }}
                      />
                      <div className="member-info">
                        <div className="member-name">{member.name}</div>
                        <div className="member-role">{getRoleLabel(member.role)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Reviews Section */}
            <div className="review-card">
              <div className="card-header">
                <h3 className="card-title">⭐ Đánh giá gần đây</h3>
              </div>
              <div className="review-list">
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-member">
                      <div className="skeleton-avatar"></div>
                      <div className="skeleton-lines">
                        <div className="skeleton-line wide"></div>
                        <div className="skeleton-line short"></div>
                      </div>
                    </div>
                  ))
                ) : recentReviews.length === 0 ? (
                  <div className="empty-state">
                    <FaStar className="empty-icon" />
                    <p>Chưa có đánh giá nào.</p>
                  </div>
                ) : (
                  recentReviews.map((review) => (
                    <div key={review.id} className="review-item">
                      <img
                        src={getReviewerAvatarUrl(review)}
                        alt={review.user_name}
                        className="review-avatar"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user_name)}&background=667eea&color=fff`;
                        }}
                      />
                      <div className="review-info">
                        <div className="review-header">
                          <span className="review-user">{review.user_name}</span>
                          <div className="review-stars">{renderStars(review.rating)}</div>
                        </div>
                        <div className="review-story">{review.story_title}</div>
                        <p className="review-content">{review.content}</p>
                        <span className="review-time">
                          {formatDate(review.created_at)} {formatTime(review.created_at)}
                        </span>
                      </div>
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
