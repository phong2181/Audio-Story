import React, { useState, useEffect } from 'react';
import { useGetMembershipPlansClient } from 'api/homePage'; 
import Swal from 'sweetalert2';
import './style.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthDialog from "../LoginRigister/index";
import VietQRPayment from './VietQRPayment'; 

const Membership = () => {
  const [billingCycle, setBillingCycle] = useState('monthly'); 
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showVietQR, setShowVietQR] = useState(false);
  
  const { data: apiPlans, isLoading, isError } = useGetMembershipPlansClient();

  const location = useLocation();
  const navigate = useNavigate();
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const resultCode = queryParams.get('resultCode');
        const orderId = queryParams.get('orderId');

        if (resultCode !== null) {
            if (resultCode === '0') {
                Swal.fire({
                    title: 'Nâng Cấp Thành Công!',
                    text: `Cảm ơn bạn đã ủng hộ gói dịch vụ. Gói dịch vụ ${orderId} đã được kích hoạt VIP!`,
                    icon: 'success',
                    confirmButtonText: 'Đọc truyện ngay',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                Swal.fire({
                    title: 'Thanh toán thất bại',
                    text: 'Giao dịch đã bị hủy hoặc gặp sự cố trong quá trình xử lý. Vui lòng thử lại!',
                    icon: 'error',
                    confirmButtonText: 'Đóng',
                    confirmButtonColor: '#d33'
                });
            }
            navigate('/membership', { replace: true });
        }
    }, [location, navigate]);

  const handleSelectPlan = (plan) => {
      const userInfo = JSON.parse(localStorage.getItem("USER") || "null");
      
      if (!userInfo) {
          Swal.fire({
              title: 'Yêu cầu đăng nhập',
              text: 'Vui lòng đăng nhập hoặc đăng ký tài khoản để thực hiện mua gói thành viên VIP!',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Đăng nhập ngay',
              cancelButtonText: 'Để sau',
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#aaa'
          }).then((result) => {
              if (result.isConfirmed) {
                  setIsLoginMode(true);
                  setIsAuthOpen(true);
                  const event = new CustomEvent("OPEN_AUTH_DIALOG", { detail: { isLogin: true } });
                  window.dispatchEvent(event);
              }
          });
          return; 
      }

      Swal.fire({
          title: 'Xác nhận nâng cấp gói',
          html: `Bạn có chắc chắn muốn nâng cấp lên gói <b>${plan.name}</b> với giá <b>${Number(plan.price).toLocaleString()}đ</b> không?`,
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: '💳 Thanh toán VietQR',
          cancelButtonText: 'Hủy bỏ',
          confirmButtonColor: '#667eea',
          cancelButtonColor: '#aaa'
      }).then((result) => {
          if (result.isConfirmed) {
              setSelectedPlan(plan);
              setShowVietQR(true);
          }
      });
  };

  const handlePaymentSuccess = (response) => {
    setShowVietQR(false);
    setSelectedPlan(null);
    
    Swal.fire({
      title: '🎉 Chúc mừng!',
      html: `
        <p style="font-size: 16px; margin: 15px 0;">
          Bạn đã nâng cấp thành công lên <strong>${selectedPlan?.name}</strong>
        </p>
        <p style="color: #27ae60; font-size: 14px;">
          📅 Hết hạn: <strong>${response.vip_expires_at}</strong>
        </p>
      `,
      icon: 'success',
      confirmButtonText: 'Quay lại',
      confirmButtonColor: '#27ae60',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then(() => {
      navigate('/dashboard');
    });
  };

  const handlePaymentCancel = () => {
    setShowVietQR(false);
    setSelectedPlan(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (isError) return <div className="error">Không thể tải dữ liệu.</div>;

  // 🎯 Show VietQR Payment Modal khi user bấm nâng cấp
  if (showVietQR && selectedPlan) {
    return (
      <VietQRPayment 
        plan={selectedPlan} 
        onSuccess={handlePaymentSuccess}
        onClose={handlePaymentCancel}
      />
    );
  }

  return (
    <div className="membership-container">
      <div className="membership-header">
        <h1>Nâng Cấp Tài Khoản</h1>
        <p>Mở khóa toàn bộ kho truyện hấp dẫn và ủng hộ các tác giả</p>
        
        <div className="billing-toggle">
          <button 
            className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Theo Tháng
          </button>
          <button 
            className={`toggle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('yearly')}
          >
            Theo Năm <span className="discount-badge">Ưu đãi lớn</span>
          </button>
        </div>
      </div>

      {/* 🎯 HIỆU ỨNG SKELETON LOADING KHI ĐANG TẢI DỮ LIỆU */}
      {isLoading ? (
        <div className="pricing-grid skeleton-loading">
          {[1, 2, 3].map((index) => (
            <div key={index} className="pricing-card skeleton-card">
              <div className="skeleton-header">
                <div className="skeleton-line title"></div>
                <div className="skeleton-line price"></div>
              </div>
              <div className="skeleton-body">
                <div className="skeleton-line text"></div>
                <div className="skeleton-line text"></div>
                <div className="skeleton-line text short"></div>
              </div>
              <div className="skeleton-footer">
                <div className="skeleton-btn"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* GIAO DIỆN CHÍNH SAU KHI LOAD XONG */
        <div className="pricing-grid">
          {/* Gói Free mặc định */}
          <div className="pricing-card free">
            <div className="card-header">
              <h3>Miễn phí</h3>
              <div className="price-box">
                <span className="amount">0đ</span>
                <span className="period">/vĩnh viễn</span>
              </div>
            </div>
            <div className="card-body">
              <ul className="features-list">
                <li><span className="check-icon">✓</span> Đọc truyện có quảng cáo</li>
                <li><span className="check-icon">✓</span> Lưu tối đa 3 truyện offline</li>
              </ul>
            </div>
            <div className="card-footer">
              <button className="select-plan-btn disabled" disabled>Gói mặc định</button>
            </div>
          </div>

          {/* Danh sách gói từ API */}
          {apiPlans
            ?.filter((plan) => plan.type === billingCycle)
            .map((plan) => (
              <div key={plan.id} className={`pricing-card premium ${plan.id === 2 ? 'popular' : ''}`}>
                {plan.id === 2 && <div className="popular-badge">Phổ biến nhất</div>}
                
                <div className="card-header">
                  <h3>{plan.name}</h3>
                  <div className="price-box">
                    <span className="amount">{formatPrice(plan.price)}</span>
                    <span className="period">/{billingCycle === 'monthly' ? 'tháng' : 'năm'}</span>
                  </div>
                </div>

                <div className="card-body">
                  <ul className="features-list">
                    {plan.features?.map((feature, index) => (
                      <li key={index}>
                        <span className="check-icon">✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-footer">
                  <button 
                    className="select-plan-btn"
                    onClick={() => handleSelectPlan(plan)}
                  >
                    Nâng cấp ngay
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {isAuthOpen && (
          <AuthDialog 
              onClose={() => setIsAuthOpen(false)} 
              isLogin={isLoginMode} 
          />
      )}
    </div>
  );
};

export default Membership;