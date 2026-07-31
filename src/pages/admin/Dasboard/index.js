
import { memo, useEffect } from "react";
import "./style.scss";
import {
  FaBook,
  FaTasks,
  FaUsers,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaTimesCircle,
} from "react-icons/fa";

const AdminDashboard = () => {
  useEffect(() => {
    document.title = "Bảng Điều Khiển quản trị";
  }, []);
  const stats = [
    {
      title: "Tất cả bộ truyện",
      value: 36,
      color: "green",
      icon: <FaBook />,
    },
    {
      title: "Tổng số bài viết",
      value: 132,
      color: "blue",
      icon: <FaTasks />,
    },
    {
      title: "Thành viên admin",
      value: 3,
      color: "purple",
      icon: <FaUsers />,
    },
    {
      title: "Điểm SEO",
      value: "76%",
      color: "orange",
      icon: <FaChartLine />,
    },
  ];

  const activities = [
    {
      status: "success",
      text: "Bài viết 'Hướng dẫn React' được duyệt bởi Admin.",
      date: "20 tháng 1 10:30 sáng",
      icon: <FaCheckCircle />,
    },
    {
      status: "warning",
      text: "Bài viết 'Vue.js Basics' đang chờ duyệt.",
      date: "19 tháng 1 3:45 chiều",
      icon: <FaClock />,
    },
    {
      status: "success",
      text: "Người dùng 'User123' đã đăng bài mới.",
      date: "18 tháng 1 9:15 sáng",
      icon: <FaCheckCircle />,
    },
    {
      status: "danger",
      text: "Bài viết 'Test Post' đã bị từ chối.",
      date: "17 tháng 1 2:30 chiều",
      icon: <FaTimesCircle />,
    },
    {
      status: "success",
      text: "Bài viết 'JavaScript Tips' được duyệt.",
      date: "16 tháng 1 11:00 sáng",
      icon: <FaCheckCircle />,
    },
    {
      status: "warning",
      text: "Bài viết 'CSS Tricks' cần chỉnh sửa.",
      date: "15 tháng 1 4:20 chiều",
      icon: <FaExclamationCircle />,
    },
  ];
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
            <div key={idx} className={`stats-card ${item.color}`}>
              <div className="card-icon">{item.icon}</div>
              <div className="card-body">
                <div className="card-title">{item.title}</div>
                <div className="card-value">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className="dashboard-container mt-30">
        <div className="dashboard-grid">
          <div className="col-main">
            {/* Outstanding Posts Table */}
            <div className="table-card">
              <div className="card-header">
                <h3 className="card-title">📝 Nội dung mới đăng tải gần đây</h3>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tên bài viết</th>
                    <th>Giờ</th>
                    <th>Ngày Đăng</th>
                    <th>Tác giả</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="post-info">
                        <div className="post-title">Hướng dẫn React Hooks</div>
                        <div className="post-meta">danh mục: React</div>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge pending">⏱ 11:16 </span>
                    </td>
                    <td>
                      <span className="status-badge approved">04/05/2026</span>
                    </td>
                    <td>
                      <span className="author">Admin</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="post-info">
                        <div className="post-title">Vue.js Best Practices</div>
                        <div className="post-meta">danh mục: Vue.js</div>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge pending">⏱19:30 </span>
                    </td>
                    <td>
                      <span className="status-badge approved">03/05/2026</span>
                    </td>
                    <td>
                      <span className="author">User1</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Activity Log */}
            <div className="activity-card">
              <div className="card-header">
                <h3 className="card-title">📋 Nhật ký hoạt động</h3>
              </div>
              <div className="activity-list">
                {activities.map((item, index) => (
                  <div key={index} className={`activity-item ${item.status}`}>
                    <div className="activity-icon">{item.icon}</div>
                    <div className="activity-body">
                      <p className="activity-text">{item.text}</p>
                      <span className="activity-time">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn-view-more">Xem tất cả nhật ký</button>
            </div>
          </div>

          {/* Members Section */}
          <div className="col-sidebar">
            <div className="member-card">
              <div className="card-header">
                <h3 className="card-title">👥 Thành viên hoạt động</h3>
              </div>
              <div className="member-list">
                {[
                  {
                    id: 1,
                    name: "Nguyễn Văn A",
                    role: "Admin",
                    img: "https://i.pravatar.cc/40?img=1",
                  },
                  {
                    id: 2,
                    name: "Trần Thị B",
                    role: "Editor",
                    img: "https://i.pravatar.cc/40?img=2",
                  },
                  {
                    id: 3,
                    name: "Lê Văn C",
                    role: "Member",
                    img: "https://i.pravatar.cc/40?img=3",
                  },
                ].map((member) => (
                  <div key={member.id} className="member-item">
                    <img
                      src={member.img}
                      alt={member.name}
                      className="member-avatar"
                      loading="lazy"
                    />
                    <div className="member-info">
                      <div className="member-name">{member.name}</div>
                      <div className="member-role">{member.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(AdminDashboard);
