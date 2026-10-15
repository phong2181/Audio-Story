import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaUniversity,
  FaQrcode,
  FaSave,
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaExternalLinkAlt,
  FaCopy,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCrown,
  FaUsers,
  FaListUl,
} from "react-icons/fa";
import { useGetVietQRSettingAD, useUpdateVietQRSettingAD } from "api/homePage";
import { getAdminInfo } from "utils/adminAuth";
import { ROUTES } from "utils/route";
import Swal from "sweetalert2";
import "./style.scss";

// Danh sách ngân hàng phổ biến tại Việt Nam
const DEFAULT_BANKS = [
  { code: "MB", short_name: "MBBank", name: "Ngân hàng Quân Đội", bin: "970422" },
  { code: "VCB", short_name: "Vietcombank", name: "Ngân hàng Ngoại Thương Việt Nam", bin: "970436" },
  { code: "TCB", short_name: "Techcombank", name: "Ngân hàng Kỹ Thương Việt Nam", bin: "970407" },
  { code: "BIDV", short_name: "BIDV", name: "Ngân hàng Đầu tư và Phát triển VN", bin: "970010" },
  { code: "CTG", short_name: "VietinBank", name: "Ngân hàng Công Thương Việt Nam", bin: "970415" },
  { code: "VPB", short_name: "VPBank", name: "Ngân hàng Việt Nam Thịnh Vượng", bin: "970432" },
  { code: "ACB", short_name: "ACB", name: "Ngân hàng Á Châu", bin: "970005" },
  { code: "TPB", short_name: "TPBank", name: "Ngân hàng Tiên Phong", bin: "970423" },
  { code: "STB", short_name: "Sacombank", name: "Ngân hàng Sài Gòn Thương Tín", bin: "970014" },
  { code: "SHB", short_name: "SHB", name: "Ngân hàng Sài Gòn Hà Nội", bin: "970403" },
  { code: "VIB", short_name: "VIB", name: "Ngân hàng Quốc Tế Việt Nam", bin: "970044" },
  { code: "HDB", short_name: "HDBank", name: "Ngân hàng Phát triển TP.HCM", bin: "970441" },
  { code: "MSB", short_name: "MSB", name: "Ngân hàng Hàng Hải Việt Nam", bin: "970426" },
  { code: "OCB", short_name: "OCB", name: "Ngân hàng Phương Đông", bin: "970448" },
  { code: "LPB", short_name: "LPBank", name: "Ngân hàng Lộc Phát Việt Nam", bin: "970449" },
  { code: "SEAB", short_name: "SeABank", name: "Ngân hàng Đông Nam Á", bin: "970440" },
  { code: "NAB", short_name: "Nam A Bank", name: "Ngân hàng Nam Á", bin: "970428" },
  { code: "VAB", short_name: "VietABank", name: "Ngân hàng Việt Á", bin: "970427" },
  { code: "KLB", short_name: "Kienlongbank", name: "Ngân hàng Kiên Long", bin: "970452" },
  { code: "BAB", short_name: "Bac A Bank", name: "Ngân hàng Bắc Á", bin: "970409" },
  { code: "BVB", short_name: "BaoViet Bank", name: "Ngân hàng Bảo Việt", bin: "970438" },
  { code: "ABB", short_name: "ABBank", name: "Ngân hàng An Bình", bin: "970425" },
  { code: "NCB", short_name: "NCB", name: "Ngân hàng Quốc Dân", bin: "970419" },
];

const TEMPLATES = [
  { id: "compact", name: "Gọn nhẹ (Compact) - Khuyên dùng", desc: "Hiển thị logo ngân hàng và thông tin chuyển khoản gọn gàng" },
  { id: "compact2", name: "Hiện đại (Compact 2)", desc: "Mẫu hiện đại với viền bo mềm và khung thẻ card" },
  { id: "qr_only", name: "Mã QR thuần túy (QR Only)", desc: "Chỉ hiển thị mã vuông QR, tối giản" },
  { id: "print", name: "Đầy đủ hóa đơn (Print)", desc: "Khung in phiếu thanh toán trang trọng" },
];

const VietQRSettings = () => {
  const adminInfo = getAdminInfo();
  const isAdmin = adminInfo?.role === "admin";

  const { data: settingRes, isLoading, error } = useGetVietQRSettingAD();
  const updateMutation = useUpdateVietQRSettingAD();

  const [formData, setFormData] = useState({
    bank_code: "MB",
    bank_name: "MBBank - Ngân hàng Quân Đội",
    account_number: "0123456789",
    account_name: "AUDIO STORY",
    template: "compact",
    is_active: true,
    auto_activation: true,
    payment_instruction: "Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử để thanh toán nhanh 24/7.",
    custom_description_prefix: "Nang cap VIP",
  });

  const [testAmount, setTestAmount] = useState(50000);
  const [copySuccess, setCopySuccess] = useState(false);

  const supportedBanks = settingRes?.supported_banks?.length
    ? settingRes.supported_banks
    : DEFAULT_BANKS;

  useEffect(() => {
    if (settingRes?.data) {
      const d = settingRes.data;
      setFormData({
        bank_code: d.bank_code || "MB",
        bank_name: d.bank_name || "MBBank - Ngân hàng Quân Đội",
        account_number: d.account_number || "",
        account_name: d.account_name || "",
        template: d.template || "compact",
        is_active: d.is_active !== false,
        auto_activation: d.auto_activation !== false,
        payment_instruction:
          d.payment_instruction ||
          "Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử để thanh toán nhanh 24/7.",
        custom_description_prefix: d.custom_description_prefix || "Nang cap VIP",
      });
    }
  }, [settingRes]);

  const handleBankChange = (e) => {
    const code = e.target.value;
    const matched = supportedBanks.find((b) => b.code === code);
    setFormData((prev) => ({
      ...prev,
      bank_code: code,
      bank_name: matched ? `${matched.short_name} - ${matched.name}` : code,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalVal = type === "checkbox" ? checked : value;

    if (name === "account_name" && typeof finalVal === "string") {
      finalVal = finalVal.toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalVal,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      Swal.fire({
        icon: "error",
        title: "Quyền hạn bị từ chối",
        text: "Chỉ Quản trị viên tối cao (Admin) mới có quyền chỉnh sửa cấu hình liên kết ngân hàng VietQR.",
        confirmButtonColor: "#2271b1",
      });
      return;
    }

    if (!formData.account_number.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu số tài khoản",
        text: "Vui lòng nhập số tài khoản ngân hàng thụ hưởng.",
        confirmButtonColor: "#2271b1",
      });
      return;
    }

    if (!formData.account_name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu tên chủ tài khoản",
        text: "Vui lòng nhập tên chủ tài khoản ngân hàng.",
        confirmButtonColor: "#2271b1",
      });
      return;
    }

    try {
      await updateMutation.mutateAsync(formData);

      Swal.fire({
        icon: "success",
        title: "Đã lưu cài đặt!",
        text: "Cấu hình tài khoản ngân hàng VietQR đã được cập nhật thành công.",
        confirmButtonColor: "#2271b1",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Lỗi lưu cấu hình",
        text: err?.response?.data?.message || "Không thể cập nhật cấu hình VietQR. Vui lòng thử lại.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  // Nạp tài khoản mẫu nhanh để kiểm thử
  const handleLoadSampleAccount = () => {
    setFormData((prev) => ({
      ...prev,
      bank_code: "MB",
      bank_name: "MBBank - Ngân hàng Quân Đội",
      account_number: "0988889999",
      account_name: "AUDIO STORY VIETNAM",
      template: "compact",
      is_active: true,
      auto_activation: true,
      payment_instruction: "Vui lòng giữ nguyên mã giao dịch trong nội dung chuyển khoản để hệ thống kích hoạt gói VIP tức thì.",
      custom_description_prefix: "Nang cap VIP",
    }));
  };

  // Tính URL QR code xem trước trực tiếp
  const directQrPreviewUrl = `https://img.vietqr.io/image/${formData.bank_code}-${formData.account_number || "0123456789"}-${formData.template}.png?amount=${testAmount}&addInfo=${encodeURIComponent(formData.custom_description_prefix + " TEST")}&accountName=${encodeURIComponent(formData.account_name || "AUDIO STORY")}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directQrPreviewUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="wrap wp-vietqr-page">
        <div className="wp-loading-spinner">
          <FaSpinner className="spin" /> Đang tải cấu hình liên kết ngân hàng VietQR...
        </div>
      </div>
    );
  }

  return (
    <div className="wrap wp-vietqr-page">
      {/* WordPress Page Header */}
      <div className="wp-header-section">
        <div className="header-title-wrap">
          <h1 className="wp-heading-inline">
            <FaUniversity className="header-icon" /> Cài đặt Phương thức Liên kết Ngân hàng VietQR
          </h1>
          <span className={`status-pill ${formData.is_active ? "active" : "inactive"}`}>
            {formData.is_active ? "● Đang hoạt động" : "○ Tạm dừng"}
          </span>
        </div>
        <p className="wp-subtitle">
          Cấu hình tài khoản ngân hàng thụ hưởng nhận thanh toán quét mã QR chuẩn quốc gia (VietQR) khi độc giả nâng cấp gói VIP.
        </p>
      </div>

      {/* WordPress Navigation Tabs */}
      <nav className="nav-tab-wrapper wp-clearfix" aria-label="Điều hướng Membership">
        <Link to={ROUTES.ADMIN.ADD_MEMBERSHIP} className="nav-tab">
          <FaListUl /> Gói Đăng Ký VIP
        </Link>
        <Link to={ROUTES.ADMIN.MANAGE_USERS_MEMBERSHIP} className="nav-tab">
          <FaUsers /> Quản Lý Thành Viên
        </Link>
        <span className="nav-tab nav-tab-active">
          <FaQrcode /> Liên kết ngân hàng VietQR
        </span>
      </nav>

      {/* Phân quyền Notice: Nếu không phải Admin */}
      {!isAdmin && (
        <div className="notice notice-error wp-role-warning">
          <p>
            <FaExclamationTriangle /> <strong>Cảnh báo phân quyền:</strong> Bạn đang đăng nhập với vai trò{" "}
            <strong>{adminInfo?.role ? adminInfo.role.toUpperCase() : "STAFF"}</strong>. Chỉ{" "}
            <strong>Quản trị viên tối cao (Admin)</strong> mới có quyền chỉnh sửa cấu hình tài khoản ngân hàng và phương thức VietQR.
          </p>
        </div>
      )}

      {/* WordPress Poststuff 2-Column Layout */}
      <div id="poststuff">
        <form onSubmit={handleSubmit}>
          <div id="post-body" className="metabox-holder columns-2">
            {/* CỘT TRÁI CHÍNH: FORM CẤU HÌNH NGÂN HÀNG */}
            <div id="post-body-content">
              {/* Metabox 1: Thông tin tài khoản thụ hưởng */}
              <div className="postbox wp-metabox">
                <div className="postbox-header">
                  <h2>
                    <FaUniversity /> Thông tin Tài khoản Ngân hàng Thụ hưởng
                  </h2>
                </div>
                <div className="inside">
                  <table className="form-table" role="presentation">
                    <tbody>
                      {/* Chọn Ngân hàng */}
                      <tr>
                        <th scope="row">
                          <label htmlFor="bank_code">
                            Ngân hàng thụ hưởng <span className="required">*</span>
                          </label>
                        </th>
                        <td>
                          <select
                            id="bank_code"
                            name="bank_code"
                            className="regular-text"
                            value={formData.bank_code}
                            onChange={handleBankChange}
                            disabled={!isAdmin}
                          >
                            {supportedBanks.map((bank) => (
                              <option key={bank.code} value={bank.code}>
                                {bank.short_name} - {bank.name} ({bank.code})
                              </option>
                            ))}
                          </select>
                          <p className="description">
                            Ngân hàng tiếp nhận dòng tiền thanh toán trực tiếp từ độc giả qua hệ thống Napas/VietQR.
                          </p>
                        </td>
                      </tr>

                      {/* Số tài khoản */}
                      <tr>
                        <th scope="row">
                          <label htmlFor="account_number">
                            Số tài khoản ngân hàng <span className="required">*</span>
                          </label>
                        </th>
                        <td>
                          <input
                            type="text"
                            id="account_number"
                            name="account_number"
                            className="regular-text"
                            placeholder="Ví dụ: 0988776655, 1903..."
                            value={formData.account_number}
                            onChange={handleChange}
                            required
                            disabled={!isAdmin}
                          />
                          <p className="description">
                            Nhập chính xác số tài khoản ngân hàng thụ hưởng (không chứa khoảng trắng).
                          </p>
                        </td>
                      </tr>

                      {/* Tên chủ tài khoản */}
                      <tr>
                        <th scope="row">
                          <label htmlFor="account_name">
                            Tên chủ tài khoản <span className="required">*</span>
                          </label>
                        </th>
                        <td>
                          <input
                            type="text"
                            id="account_name"
                            name="account_name"
                            className="regular-text uppercase"
                            placeholder="Ví dụ: NGUYEN VAN A hoặc AUDIO STORY"
                            value={formData.account_name}
                            onChange={handleChange}
                            required
                            disabled={!isAdmin}
                          />
                          <p className="description">
                            Tên người thụ hưởng in hoa không dấu (tự động chuyển HOA khi nhập).
                          </p>
                        </td>
                      </tr>

                      {/* Kiểu mẫu hiển thị VietQR */}
                      <tr>
                        <th scope="row">
                          <label htmlFor="template">Mẫu hiển thị VietQR</label>
                        </th>
                        <td>
                          <select
                            id="template"
                            name="template"
                            className="regular-text"
                            value={formData.template}
                            onChange={handleChange}
                            disabled={!isAdmin}
                          >
                            {TEMPLATES.map((tpl) => (
                              <option key={tpl.id} value={tpl.id}>
                                {tpl.name}
                              </option>
                            ))}
                          </select>
                          <p className="description">
                            Định dạng khung hình mã QR hiển thị trong popup thanh toán của người dùng.
                          </p>
                        </td>
                      </tr>

                      {/* Trạng thái Bật/Tắt */}
                      <tr>
                        <th scope="row">Trạng thái thanh toán</th>
                        <td>
                          <fieldset>
                            <label htmlFor="is_active" className="checkbox-label">
                              <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                disabled={!isAdmin}
                              />
                              <strong>Kích hoạt thanh toán VietQR cho người dùng</strong>
                            </label>
                            <p className="description">
                              Nếu bỏ tích, độc giả sẽ không thể chọn phương thức chuyển khoản quét mã VietQR.
                            </p>
                          </fieldset>
                        </td>
                      </tr>

                      {/* Tự động kích hoạt VIP */}
                      <tr>
                        <th scope="row">Quy trình kích hoạt</th>
                        <td>
                          <fieldset>
                            <label htmlFor="auto_activation" className="checkbox-label">
                              <input
                                type="checkbox"
                                id="auto_activation"
                                name="auto_activation"
                                checked={formData.auto_activation}
                                onChange={handleChange}
                                disabled={!isAdmin}
                              />
                              <strong>Tự động kích hoạt gói VIP tức thì khi người dùng bấm xác nhận</strong>
                            </label>
                            <p className="description">
                              Hệ thống sẽ ngay lập tức mở khóa quyền lợi VIP cho độc giả khi họ hoàn tất chuyển khoản và nhấn nút xác nhận trên màn hình.
                            </p>
                          </fieldset>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Metabox 2: Tiền tố & Hướng dẫn thanh toán */}
              <div className="postbox wp-metabox">
                <div className="postbox-header">
                  <h2>
                    <FaInfoCircle /> Nội dung Giao dịch & Hướng dẫn Độc giả
                  </h2>
                </div>
                <div className="inside">
                  <table className="form-table" role="presentation">
                    <tbody>
                      <tr>
                        <th scope="row">
                          <label htmlFor="custom_description_prefix">Tiền tố nội dung CK</label>
                        </th>
                        <td>
                          <input
                            type="text"
                            id="custom_description_prefix"
                            name="custom_description_prefix"
                            className="regular-text"
                            placeholder="Ví dụ: Nang cap VIP"
                            value={formData.custom_description_prefix}
                            onChange={handleChange}
                            disabled={!isAdmin}
                          />
                          <p className="description">
                            Tiền tố xuất hiện trong nội dung chuyển tiền ngân hàng kèm mã giao dịch duy nhất.
                          </p>
                        </td>
                      </tr>

                      <tr>
                        <th scope="row">
                          <label htmlFor="payment_instruction">Hướng dẫn thanh toán</label>
                        </th>
                        <td>
                          <textarea
                            id="payment_instruction"
                            name="payment_instruction"
                            rows="4"
                            className="large-text"
                            value={formData.payment_instruction}
                            onChange={handleChange}
                            disabled={!isAdmin}
                          />
                          <p className="description">
                            Dòng thông điệp chỉ dẫn xuất hiện bên dưới mã QR giúp độc giả thao tác chuyển khoản chính xác.
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* WordPress Submit Button Bar */}
              {isAdmin && (
                <div className="wp-submit-bar">
                  <button
                    type="submit"
                    className="button button-primary button-hero"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <>
                        <FaSpinner className="spin" /> Đang lưu cấu hình...
                      </>
                    ) : (
                      <>
                        <FaSave /> Lưu thay đổi (Save Changes)
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="button button-secondary button-hero"
                    onClick={handleLoadSampleAccount}
                    title="Điền nhanh dữ liệu mẫu để kiểm tra tính năng"
                  >
                    Nạp tài khoản mẫu MBBank
                  </button>
                </div>
              )}
            </div>

            {/* CỘT PHẢI: XEM TRƯỚC LIVE PREVIEW & BẢO MẬT */}
            <div id="postbox-container-1" className="postbox-container">
              {/* Metabox Xem trước VietQR Trực tiếp */}
              <div className="postbox wp-metabox qr-preview-postbox">
                <div className="postbox-header">
                  <h2>
                    <FaQrcode /> Xem trước Trực tiếp (Live Preview)
                  </h2>
                </div>
                <div className="inside">
                  <div className="qr-preview-card">
                    {/* Header Thẻ QR */}
                    <div className="qr-card-header">
                      <div className="qr-bank-tag">
                        <span className="bank-badge">{formData.bank_code}</span>
                        <span className="bank-name-text">{formData.bank_name}</span>
                      </div>
                      <span className="template-pill">{formData.template}</span>
                    </div>

                    {/* Khung ảnh QR Code thực tế */}
                    <div className="qr-image-wrapper">
                      <img
                        src={directQrPreviewUrl}
                        alt="VietQR Preview"
                        className="live-qr-img"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/300x300?text=VietQR+Preview";
                        }}
                      />
                    </div>

                    {/* Thông tin chuyển khoản giả định */}
                    <div className="qr-meta-info">
                      <div className="meta-row">
                        <span className="meta-label">Chủ tài khoản:</span>
                        <strong className="meta-value">{formData.account_name || "AUDIO STORY"}</strong>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">Số tài khoản:</span>
                        <strong className="meta-value mono">{formData.account_number || "0123456789"}</strong>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">Số tiền thử:</span>
                        <div className="test-amount-picker">
                          {[20000, 50000, 100000].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              className={`amt-btn ${testAmount === amt ? "active" : ""}`}
                              onClick={() => setTestAmount(amt)}
                            >
                              {amt.toLocaleString("vi-VN")}đ
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">Nội dung CK:</span>
                        <span className="meta-value desc-preview">
                          {formData.custom_description_prefix} TEST
                        </span>
                      </div>
                    </div>

                    {/* Công cụ thao tác QR */}
                    <div className="qr-actions-bar">
                      <a
                        href={directQrPreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button button-small"
                      >
                        <FaExternalLinkAlt /> Mở ảnh đầy đủ
                      </a>
                      <button
                        type="button"
                        className="button button-small"
                        onClick={handleCopyLink}
                      >
                        <FaCopy /> {copySuccess ? "Đã chép link!" : "Sao chép URL"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metabox Trạng thái & Bảo mật */}
              <div className="postbox wp-metabox security-postbox">
                <div className="postbox-header">
                  <h2>
                    <FaShieldAlt /> Bảo mật & Phân quyền
                  </h2>
                </div>
                <div className="inside">
                  <ul className="security-specs-list">
                    <li>
                      <FaCheckCircle className="check-icon" />
                      <span>
                        <strong>Quyền chỉnh sửa:</strong> Chỉ Admin tối cao.
                      </span>
                    </li>
                    <li>
                      <FaCheckCircle className="check-icon" />
                      <span>
                        <strong>Chuẩn thanh toán:</strong> VietQR / Napas 247.
                      </span>
                    </li>
                    <li>
                      <FaCheckCircle className="check-icon" />
                      <span>
                        <strong>Tự động quét:</strong> Hỗ trợ tất cả ứng dụng ngân hàng và ví điện tử Việt Nam.
                      </span>
                    </li>
                  </ul>

                  <div className="api-health-box">
                    <span className="health-dot online" />
                    <span>Cổng tạo mã VietQR: <strong>Sẵn sàng</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VietQRSettings;
