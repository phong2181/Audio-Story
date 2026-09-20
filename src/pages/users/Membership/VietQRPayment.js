/**
 * 🎯 VietQR Payment Component
 * Displays QR code and handles payment confirmation
 */

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { createVietQRPayment, confirmVietQRPayment } from 'api/membership/vietqrService';
import './vietqrPayment.scss';

const VietQRPayment = ({ plan, onSuccess, onClose }) => {
  const [qrData, setQrData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('generating'); // 'generating' | 'showing' | 'confirming' | 'success'

  // 🎬 Step 1: Generate QR Code
  useEffect(() => {
    const generateQR = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await createVietQRPayment(plan.id);
        
        if (response.success) {
          setQrData(response);
          setStep('showing');
          
          // 📞 Notify user
          Swal.fire({
            title: '✅ QR Code Được Tạo',
            html: `
              <p>Quét mã QR bằng <strong>ứng dụng ngân hàng của bạn</strong> để thanh toán</p>
              <p style="color: #ff6b6b; margin-top: 10px;">⏰ QR có hiệu lực trong 24 giờ</p>
            `,
            icon: 'success',
            confirmButtonText: 'Đã hiểu',
            confirmButtonColor: '#3085d6',
            allowOutsideClick: false,
            allowEscapeKey: false
          });
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Lỗi tạo mã QR';
        setError(errorMsg);
        setStep('error');
        
        Swal.fire({
          title: '❌ Lỗi',
          text: errorMsg,
          icon: 'error',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#d33'
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateQR();
  }, [plan.id]);

  // 🎬 Step 2: Handle Payment Confirmation
  const handleConfirmPayment = async () => {
    setIsConfirming(true);
    setError(null);

    try {
      const response = await confirmVietQRPayment(qrData.paymentCode);

      if (response.success) {
        setStep('success');

        // ✨ Success notification
        await Swal.fire({
          title: '🎉 Thanh Toán Thành Công!',
          html: `
            <p style="font-size: 16px; margin: 15px 0;">
              Gói <strong>${plan.name}</strong> đã được kích hoạt
            </p>
            <p style="color: #27ae60; font-size: 14px;">
              📅 Hết hạn: <strong>${response.vip_expires_at}</strong>
            </p>
            <p style="color: #666; font-size: 12px; margin-top: 10px;">
              Cảm ơn bạn đã ủng hộ!
            </p>
          `,
          icon: 'success',
          confirmButtonText: 'Quay lại',
          confirmButtonColor: '#27ae60',
          allowOutsideClick: false,
          allowEscapeKey: false
        });

        // 🔄 Redirect after success
        if (onSuccess) {
          onSuccess(response);
        } else {
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Lỗi xác nhận thanh toán';
      
      // Check if payment is still pending
      if (err.response?.status === 400) {
        Swal.fire({
          title: '⏳ Đang Chờ Xác Nhận',
          text: 'Hệ thống chưa ghi nhận khoản thanh toán. Vui lòng đảm bảo bạn đã chuyển đúng số tiền và thử lại sau 1-2 phút.',
          icon: 'info',
          confirmButtonText: 'Thử lại',
          confirmButtonColor: '#3085d6'
        });
      } else {
        Swal.fire({
          title: '❌ Lỗi',
          text: errorMsg,
          icon: 'error',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#d33'
        });
      }
      
      setError(errorMsg);
    } finally {
      setIsConfirming(false);
    }
  };

  // 🎬 Render different states
  if (isLoading) {
    return (
      <div className="vietqr-payment">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tạo mã QR...</p>
        </div>
      </div>
    );
  }

  if (error && !qrData) {
    return (
      <div className="vietqr-payment">
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={onClose} className="close-btn">Đóng</button>
        </div>
      </div>
    );
  }

  if (!qrData) return null;

  return (
    <div className="vietqr-payment">
      <div className="payment-container">
        
        {/* Header */}
        <div className="payment-header">
          <h2>💳 Thanh Toán VietQR</h2>
          <p>Gói: <strong>{plan.name}</strong></p>
        </div>

        {/* QR Code Section */}
        <div className="qr-section">
          <div className="qr-container">
            <img 
              src={qrData.qrUrl} 
              alt="VietQR Code" 
              className="qr-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
            {/* Fallback if QR image fails to load */}
            <div className="qr-fallback" style={{ display: 'none' }}>
              <p>QR Code không thể hiển thị</p>
              <details>
                <summary>Xem QR Data</summary>
                <p>{qrData.qrData}</p>
              </details>
            </div>
          </div>

          {/* Instructions */}
          <div className="instructions">
            <h3>📱 Cách thanh toán:</h3>
            <ol>
              <li>Mở <strong>ứng dụng ngân hàng</strong> của bạn</li>
              <li>Chọn <strong>"Quét mã QR"</strong> hoặc <strong>"Chuyển tiền"</strong></li>
              <li>Quét mã QR bên trên</li>
              <li>Kiểm tra thông tin và xác nhận thanh toán</li>
            </ol>
          </div>
        </div>

        {/* Payment Details */}
        <div className="payment-details">
          <div className="detail-row">
            <span className="label">🏦 Ngân hàng:</span>
            <span className="value">{qrData.bank}</span>
          </div>
          <div className="detail-row">
            <span className="label">💰 Số tiền:</span>
            <span className="value highlight">
              {Number(qrData.amount).toLocaleString('vi-VN')} ₫
            </span>
          </div>
          <div className="detail-row">
            <span className="label">📝 Chuyển cho:</span>
            <span className="value">{qrData.accountName}</span>
          </div>
          <div className="detail-row">
            <span className="label">🔢 Tài khoản:</span>
            <span className="value account-number">
              {qrData.accountNumber}
              <button 
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(qrData.accountNumber);
                  Swal.fire('Đã sao chép!', '', 'success');
                }}
                title="Sao chép"
              >
                📋
              </button>
            </span>
          </div>
          <div className="detail-row">
            <span className="label">📄 Nội dung:</span>
            <span className="value description">{qrData.description}</span>
          </div>
        </div>

        {/* Confirmation Button */}
        <div className="confirmation-section">
          <p className="warning">
            ⚠️ <strong>Chỉ bấm nút này sau khi đã chuyển tiền!</strong>
          </p>
          
          <button 
            onClick={handleConfirmPayment} 
            disabled={isConfirming}
            className="confirm-btn"
          >
            {isConfirming ? '⏳ Đang xác nhận...' : '✅ Tôi đã chuyển tiền - Xác nhận'}
          </button>

          <button 
            onClick={onClose}
            className="cancel-btn"
          >
            ❌ Hủy bỏ
          </button>
        </div>

        {/* Additional Info */}
        <div className="info-box">
          <p>
            <strong>💡 Mẹo:</strong> Nếu thanh toán không được xác nhận sau 5 phút, 
            vui lòng kiểm tra lại thông tin hoặc liên hệ hỗ trợ.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VietQRPayment;
