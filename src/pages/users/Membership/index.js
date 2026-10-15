import React, { useState, useEffect } from 'react';
import { useGetMembershipPlansClient } from 'api/homePage';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaCrown,
  FaCheck,
  FaHeadphones,
  FaShieldAlt,
  FaBolt,
  FaQuestionCircle,
  FaChevronDown,
  FaStar,
  FaQrcode
} from 'react-icons/fa';
import AuthDialog from "../LoginRigister/index";
import VietQRPayment from './VietQRPayment';
import './style.scss';

const Membership = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showVietQR, setShowVietQR] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const { data: apiPlans, isLoading, isError } = useGetMembershipPlansClient();

  const location = useLocation();
  const navigate = useNavigate();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  useEffect(() => {
    document.title = "Gói Thành Viên VIP - Audio Story";

    const queryParams = new URLSearchParams(location.search);
    const resultCode = queryParams.get('resultCode');
    const orderId = queryParams.get('orderId');

    if (resultCode !== null) {
      if (resultCode === '0') {
        Swal.fire({
          title: 'Nâng Cấp Thành Công! 🎉',
          text: `Cảm ơn bạn đã đồng hành cùng Audio Story. Gói hội viên ${orderId} đã được kích hoạt VIP!`,
          icon: 'success',
          confirmButtonText: 'Khám phá kho truyện ngay',
          confirmButtonColor: '#2271b1'
        });
      } else {
        Swal.fire({
          title: 'Giao dịch chưa hoàn tất',
          text: 'Thanh toán đã bị hủy hoặc gặp sự cố xử lý. Bạn có thể thử lại bất cứ lúc nào!',
          icon: 'error',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#b32d2e'
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
        text: 'Vui lòng đăng nhập để nâng cấp tài khoản và bảo toàn quyền lợi VIP của bạn.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Đăng nhập ngay',
        cancelButtonText: 'Để sau',
        confirmButtonColor: '#2271b1',
        cancelButtonColor: '#8c8f94'
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
      title: 'Xác nhận đăng ký gói VIP',
      html: `
        <div style="text-align: left; padding: 10px 0;">
          <p style="margin: 0 0 8px;">Gói dịch vụ: <strong>${plan.name}</strong></p>
          <p style="margin: 0 0 8px;">Mức thanh toán: <strong style="color: #059669; font-size: 1.1rem;">${Number(plan.price).toLocaleString('vi-VN')}đ</strong></p>
          <p style="margin: 0; font-size: 13px; color: #64748b;">Phương thức: Quét mã VietQR chuyển khoản ngân hàng tự động.</p>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: '💳 Thanh toán bằng VietQR',
      cancelButtonText: 'Để sau',
      confirmButtonColor: '#2271b1',
      cancelButtonColor: '#8c8f94'
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
      title: '🎉 Chúc mừng Bạn!',
      html: `
        <p style="font-size: 15px; margin: 15px 0;">
          Bạn đã nâng cấp thành công lên <strong>${selectedPlan?.name}</strong>
        </p>
        <p style="color: #059669; font-size: 14px;">
          📅 Hạn dùng VIP: <strong>${response.vip_expires_at}</strong>
        </p>
      `,
      icon: 'success',
      confirmButtonText: 'Trải nghiệm ngay',
      confirmButtonColor: '#2271b1',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then(() => {
      navigate('/truyen');
    });
  };

  const handlePaymentCancel = () => {
    setShowVietQR(false);
    setSelectedPlan(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  // Faq data
  const faqs = [
    {
      q: "Sau khi chuyển khoản VietQR, tôi có được kích hoạt VIP ngay không?",
      a: "Hệ thống tự động đồng bộ giao dịch ngân hàng theo thời gian thực (Webhook VietQR). Thông thường tài khoản của bạn sẽ nhận quyền VIP ngay trong vòng 30 - 60 giây sau khi chuyển khoản thành công."
    },
    {
      q: "Gói thành viên VIP có tự động gia hạn và trừ tiền không?",
      a: "Không. Audio Story không tự động trừ tiền trong tài khoản của bạn. Khi hết hạn gói, bạn hoàn toàn chủ động quyết định việc đăng ký tiếp hay không."
    },
    {
      q: "Tôi có thể nghe truyện VIP trên nhiều thiết bị khác nhau được không?",
      a: "Có! Bạn chỉ cần đăng nhập tài khoản đã nâng cấp VIP trên máy tính, điện thoại hoặc máy tính bảng để đồng bộ và tiếp tục thưởng thức."
    },
    {
      q: "Tôi cần làm gì nếu gặp sự cố trong quá trình nâng cấp?",
      a: "Đội ngũ hỗ trợ của chúng tôi sẵn sàng giải đáp 24/7. Bạn có thể để lại phản hồi hoặc liên hệ trực tiếp qua mục Gửi thư góp ý tại trang thông tin."
    }
  ];

  if (isError) {
    return (
      <div className="membership-page-wrapper">
        <div className="error-box">
          <p>Không thể tải dữ liệu bảng giá gói thành viên. Vui lòng tải lại trang sau giây lát!</p>
        </div>
      </div>
    );
  }

  // VietQR Modal
  if (showVietQR && selectedPlan) {
    return (
      <VietQRPayment
        plan={selectedPlan}
        onSuccess={handlePaymentSuccess}
        onClose={handlePaymentCancel}
      />
    );
  }

  const rawList = Array.isArray(apiPlans) ? apiPlans : (apiPlans?.data || []);
  const activePlans = rawList.filter((plan) => plan.type === billingCycle);

  return (
    <div className="membership-page-wrapper">
      {/* Hero Section */}
      <section className="membership-hero">
        <div className="hero-content">
          <div className="hero-pill">
            <FaCrown className="crown-icon" /> HỘI VIÊN ĐẶC QUYỀN VIP
          </div>
          <h1 className="hero-title">
            Thăng Hoa Trải Nghiệm Cùng <span className="highlight-text">Kho Truyện Không Giới Hạn</span>
          </h1>
          <p className="hero-desc">
            Mở khóa toàn bộ các tập truyện đặc sắc, tận hưởng chất lượng âm thanh cao cấp cùng đa dạng giọng đọc AI truyền cảm hứng.
          </p>

          {/* Toggle Tháng / Năm */}
          <div className="billing-switcher-wrap">
            <div className="billing-switcher">
              <button
                type="button"
                className={`switch-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                onClick={() => setBillingCycle('monthly')}
              >
                Thanh toán theo Tháng
              </button>
              <button
                type="button"
                className={`switch-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
                onClick={() => setBillingCycle('yearly')}
              >
                Thanh toán theo Năm
                <span className="save-badge">Tiết kiệm 20%</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="membership-pricing-section">
        <div className="container">
          {isLoading ? (
            <div className="pricing-grid skeleton-loading">
              {[1, 2, 3].map((i) => (
                <div key={i} className="pricing-card skeleton-card">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-price"></div>
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line"></div>
                  <div className="skeleton-btn"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="pricing-grid">
              {/* Thẻ Gói Thường / Miễn Phí */}
              <div className="pricing-card free-tier">
                <div className="card-top">
                  <span className="plan-badge">Cơ Bản</span>
                  <h3 className="plan-name">Độc Giả Thường</h3>
                  <p className="plan-subtitle">Dành cho độc giả trải nghiệm ban đầu</p>
                  <div className="price-tag">
                    <span className="price-num">0đ</span>
                    <span className="price-unit">/vĩnh viễn</span>
                  </div>
                </div>

                <div className="card-features">
                  <ul className="feature-list">
                    <li><FaCheck className="check-ico" /> Nghe các chương truyện miễn phí</li>
                    <li><FaCheck className="check-ico" /> Giọng đọc AI cơ bản</li>
                    <li><FaCheck className="check-ico" /> Tham gia đánh giá, bình luận truyện</li>
                    <li className="dimmed">✕ Không mở khóa chương VIP độc quyền</li>
                    <li className="dimmed">✕ Giới hạn chất lượng audio tải về</li>
                  </ul>
                </div>

                <div className="card-cta">
                  <button type="button" className="btn-plan btn-default" disabled>
                    Gói Đang Sử Dụng
                  </button>
                </div>
              </div>

              {/* Các gói từ API */}
              {activePlans.length > 0 ? (
                activePlans.map((plan, index) => {
                  const isPopular = plan.type === 'yearly' || index === 0;

                  // Parse features
                  let featArr = [];
                  if (Array.isArray(plan.features)) featArr = plan.features;
                  else if (typeof plan.features === 'string') {
                    try {
                      featArr = JSON.parse(plan.features);
                    } catch {
                      featArr = plan.features.split('\n').filter(Boolean);
                    }
                  }

                  return (
                    <div
                      key={plan.id}
                      className={`pricing-card vip-tier ${isPopular ? 'popular' : ''}`}
                    >
                      {isPopular && (
                        <div className="popular-ribbon">
                          <FaStar /> ĐƯỢC CHỌN NHIỀU NHẤT
                        </div>
                      )}

                      <div className="card-top">
                        <span className="plan-badge vip">
                          <FaCrown /> Gói VIP
                        </span>
                        <h3 className="plan-name">{plan.name}</h3>
                        <p className="plan-subtitle">
                          {plan.type === 'monthly'
                            ? 'Linh hoạt gia hạn từng tháng'
                            : 'Đặc quyền trọn năm tiết kiệm tối đa'}
                        </p>
                        <div className="price-tag">
                          <span className="price-num">{formatPrice(plan.price)}</span>
                          <span className="price-unit">
                            /{billingCycle === 'monthly' ? 'tháng' : 'năm'}
                          </span>
                        </div>
                      </div>

                      <div className="card-features">
                        <ul className="feature-list">
                          {featArr.length > 0 ? (
                            featArr.map((f, fIdx) => (
                              <li key={fIdx}>
                                <FaCheck className="check-ico vip" /> {f}
                              </li>
                            ))
                          ) : (
                            <>
                              <li><FaCheck className="check-ico vip" /> Mở khóa tất cả chương truyện VIP</li>
                              <li><FaCheck className="check-ico vip" /> Tải audio ngoại tuyến không giới hạn</li>
                              <li><FaCheck className="check-ico vip" /> Mọi giọng đọc AI Bắc - Trung - Nam</li>
                              <li><FaCheck className="check-ico vip" /> Huy hiệu Hội Viên VIP phát sáng</li>
                            </>
                          )}
                        </ul>
                      </div>

                      <div className="card-cta">
                        <button
                          type="button"
                          className="btn-plan btn-vip"
                          onClick={() => handleSelectPlan(plan)}
                        >
                          <FaQrcode /> Nâng Cấp VIP Ngay
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="pricing-card vip-tier popular">
                  <div className="popular-ribbon">
                    <FaStar /> GÓI NỔI BẬT
                  </div>
                  <div className="card-top">
                    <span className="plan-badge vip">
                      <FaCrown /> VIP Tiêu Chuẩn
                    </span>
                    <h3 className="plan-name">Hội Viên Thân Thiết</h3>
                    <p className="plan-subtitle">Đầy đủ quyền lợi đặc quyền cao cấp</p>
                    <div className="price-tag">
                      <span className="price-num">
                        {billingCycle === 'monthly' ? '49.000đ' : '499.000đ'}
                      </span>
                      <span className="price-unit">
                        /{billingCycle === 'monthly' ? 'tháng' : 'năm'}
                      </span>
                    </div>
                  </div>

                  <div className="card-features">
                    <ul className="feature-list">
                      <li><FaCheck className="check-ico vip" /> Mở khóa 100% truyện và chương VIP</li>
                      <li><FaCheck className="check-ico vip" /> Nghe không quảng cáo gián đoạn</li>
                      <li><FaCheck className="check-ico vip" /> Trọn bộ 21 giọng đọc AI đỉnh cao</li>
                      <li><FaCheck className="check-ico vip" /> Hỗ trợ ưu tiên từ ban biên tập</li>
                    </ul>
                  </div>

                  <div className="card-cta">
                    <button
                      type="button"
                      className="btn-plan btn-vip"
                      onClick={() =>
                        handleSelectPlan({
                          id: 1,
                          name: "Hội Viên Thân Thiết",
                          price: billingCycle === 'monthly' ? 49000 : 499000,
                          type: billingCycle
                        })
                      }
                    >
                      <FaQrcode /> Nâng Cấp VIP Ngay
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="membership-benefits-section">
        <div className="container">
          <div className="section-header-center">
            <h2>Đặc Quyền Dành Riêng Cho Hội Viên VIP</h2>
            <p>Trải nghiệm nghe truyện chuẩn mực được thiết kế để mang lại sự hài lòng cao nhất</p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <FaHeadphones />
              </div>
              <h3>Kho Truyện Mở Khóa 100%</h3>
              <p>Thưởng thức mọi chương truyện hấp dẫn, không bao giờ bị giới hạn nội dung độc quyền.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <FaBolt />
              </div>
              <h3>21 Giọng Đọc AI Cao Cấp</h3>
              <p>Lắng nghe cảm xúc chân thật từ kho giọng đọc chuẩn các miền Bắc, Trung, Nam sống động.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <FaShieldAlt />
              </div>
              <h3>Không Bị Gián Đoạn</h3>
              <p>Hoàn toàn không xuất hiện quảng cáo làm ngắt quãng mạch cảm xúc của bạn khi nghe truyện.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <FaCrown />
              </div>
              <h3>Huy Hiệu VIP Danh Dự</h3>
              <p>Khẳng định vị thế độc giả thân thiết với huy hiệu vàng phát sáng bên cạnh tên hiển thị.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="membership-faq-section">
        <div className="container">
          <div className="section-header-center">
            <FaQuestionCircle className="faq-main-icon" />
            <h2>Câu Hỏi Thường Gặp</h2>
            <p>Những điều bạn cần biết trước khi nâng cấp gói thành viên</p>
          </div>

          <div className="faq-accordion">
            {faqs.map((f, idx) => (
              <div
                key={idx}
                className={`faq-item ${openFaq === idx ? 'open' : ''}`}
                onClick={() => toggleFaq(idx)}
              >
                <div className="faq-question">
                  <h4>{f.q}</h4>
                  <FaChevronDown className="arrow-icon" />
                </div>
                {openFaq === idx && (
                  <div className="faq-answer">
                    <p>{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

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