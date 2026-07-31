import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './style.scss';

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "404 - Không tìm thấy trang";
  }, []);

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        {/* Số 404 lớn có hiệu ứng gợn sóng hoặc bóng đổ */}
        <div className="error-code">
          4<span>0</span>4
        </div>

        {/* Biểu tượng cảnh báo */}
        <div className="error-icon">
          <svg viewBox="0 0 24 24" width="80" height="80" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>

        <h2>Trang này không tồn tại</h2>
        <p className="error-message">
          Đường dẫn bạn nhập có thể bị sai, hoặc trang này đã bị Admin xóa hoặc di chuyển sang một địa chỉ khác.
        </p>

        {/* Nhóm nút hành động */}
        <div className="action-buttons">
          <button onClick={() => navigate(-1)} className="btn-back">
            <span>←</span> Quay lại trang trước
          </button>
          
          <Link to="/" className="btn-home">
            Quay về Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;