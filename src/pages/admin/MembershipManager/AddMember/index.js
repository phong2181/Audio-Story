import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaLayerGroup,
  FaPlus,
  FaTrash,
  FaCheck,
  FaCrown,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaListUl,
  FaUsers,
  FaArrowLeft,
  FaQrcode,
} from "react-icons/fa";
import {
  useGetMembershipPlansAD,
  useAddMembershipPlanAD,
  useDeleteMembershipPlanAD
} from "api/homePage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { getAdminInfo } from "utils/adminAuth";
import { ROUTES } from "utils/route";
import "./style.scss";

const AddMember = () => {
  const adminInfo = getAdminInfo();

  // State form
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    type: "monthly",
    features: ""
  });

  const { data: rawPlans = [], isLoading } = useGetMembershipPlansAD();
  const addMutation = useAddMembershipPlanAD();
  const deleteMutation = useDeleteMembershipPlanAD();

  const plans = Array.isArray(rawPlans) ? rawPlans : (rawPlans?.data || []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSend = {
      ...formData,
      features: formData.features
        ? formData.features.split("\n").filter((item) => item.trim() !== "")
        : []
    };

    const idToast = toast.loading("Đang lưu cấu hình gói...");

    addMutation.mutate(dataToSend, {
      onSuccess: () => {
        toast.update(idToast, {
          render: "Đã thêm gói thành viên thành công! 🚀",
          type: "success",
          isLoading: false,
          autoClose: 3000
        });

        setFormData({ name: "", price: "", type: "monthly", features: "" });
      },
      onError: (error) => {
        toast.update(idToast, {
          render: "Lỗi: " + (error.response?.data?.message || "Không thể thêm gói"),
          type: "error",
          isLoading: false,
          autoClose: 3000
        });
      }
    });
  };

  const handleDelete = (plan) => {
    Swal.fire({
      title: "Xác nhận xóa gói?",
      html: `Bạn có chắc chắn muốn xóa gói <strong>"${plan.name}"</strong> không?<br/><small style="color: #64748b">Thao tác này không thể hoàn tác.</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#b32d2e",
      cancelButtonColor: "#2271b1",
      confirmButtonText: "Xóa vĩnh viễn",
      cancelButtonText: "Hủy bỏ",
      customClass: {
        popup: "wp-swal-popup",
        title: "wp-swal-title"
      }
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(plan.id, {
          onSuccess: () => {
            toast.success(`Đã xóa gói "${plan.name}" thành công!`);
          },
          onError: () => {
            toast.error("Không thể xóa gói, vui lòng thử lại.");
          }
        });
      }
    });
  };

  if (adminInfo?.role === "staff") {
    return (
      <div className="wp-membership-plans-page">
        <div className="wp-permission-denied">
          <h2>🚫 Truy cập bị từ chối</h2>
          <p>Bạn không có quyền quản lý và cấu hình gói VIP.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wp-membership-plans-page">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* WordPress Page Header */}
      <div className="wp-page-header">
        <div className="wp-header-left">
          <h1 className="wp-page-title">
            <FaCrown className="title-icon" /> Cấu hình Gói Thành Viên VIP
          </h1>
          <p className="wp-page-subtitle">
            Thiết lập danh mục các gói thuê bao định kỳ, quyền lợi và mức phí áp dụng cho độc giả
          </p>
        </div>
        <div className="wp-header-actions">
          <Link to={ROUTES.ADMIN.MEMBERSHIP_VIETQR} className="wp-btn-action">
            <FaQrcode /> Liên kết ngân hàng VietQR
          </Link>
          <Link to={ROUTES.ADMIN.MANAGE_USERS_MEMBERSHIP} className="wp-btn-action">
            <FaUsers /> Danh sách Hội viên
          </Link>
        </div>
      </div>

      {/* WordPress 2-Column Taxonomy Layout (#col-container) */}
      <div className="wp-col-container">
        {/* Left Column: Form Thêm Mới */}
        <div className="wp-col-left">
          <div className="wp-card wp-form-wrap">
            <div className="wp-card-header">
              <h3>
                <FaPlus /> Thêm Gói VIP Mới
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="wp-tax-form">
              <div className="form-field">
                <label htmlFor="plan-name">
                  Tên gói VIP <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="plan-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Gói VIP Tháng, Hội Viên Hoàng Kim..."
                  required
                  className="wp-input"
                />
                <p className="description">Tên gói sẽ hiển thị trực tiếp tại bảng giá trang người dùng.</p>
              </div>

              <div className="form-field">
                <label>Chu kỳ thanh toán <span className="required">*</span></label>
                <div className="wp-radio-group">
                  <label className={`wp-radio-pill ${formData.type === "monthly" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="cycle"
                      checked={formData.type === "monthly"}
                      onChange={() => setFormData({ ...formData, type: "monthly" })}
                    />
                    <FaCalendarAlt /> Theo Tháng
                  </label>
                  <label className={`wp-radio-pill ${formData.type === "yearly" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="cycle"
                      checked={formData.type === "yearly"}
                      onChange={() => setFormData({ ...formData, type: "yearly" })}
                    />
                    <FaCrown /> Theo Năm
                  </label>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="plan-price">
                  Giá niêm yết (VNĐ) <span className="required">*</span>
                </label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    id="plan-price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Ví dụ: 49000, 499000"
                    required
                    className="wp-input"
                    min="0"
                  />
                  <span className="suffix">đ</span>
                </div>
                <p className="description">
                  {formData.price
                    ? `Thành tiền: ${Number(formData.price).toLocaleString("vi-VN")} VNĐ`
                    : "Nhập giá số nguyên không dấu."}
                </p>
              </div>

              <div className="form-field">
                <label htmlFor="plan-features">
                  Quyền lợi & Tính năng ưu đãi
                </label>
                <textarea
                  id="plan-features"
                  rows="5"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Mỗi dòng một quyền lợi. Ví dụ:&#10;Mở khóa tất cả chương truyện VIP&#10;Tải audio ngoại tuyến không giới hạn&#10;Tùy chọn mọi giọng đọc AI chất lượng cao&#10;Huy hiệu Hội Viên VIP phát sáng"
                  className="wp-textarea"
                />
                <p className="description">Nhập từng quyền lợi trên một dòng mới để tự động tạo danh sách dấu kiểm.</p>
              </div>

              <div className="form-submit-wrap">
                <button
                  type="submit"
                  className="wp-button wp-button-primary"
                  disabled={addMutation.isPending}
                >
                  {addMutation.isPending ? "Đang lưu..." : <><FaCheck /> Thêm gói thành viên mới</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Bảng Danh Sách Gói */}
        <div className="wp-col-right">
          <div className="wp-card wp-table-wrap">
            <div className="wp-card-header">
              <h3>
                <FaListUl /> Danh Sách Gói Thành Viên
              </h3>
              <span className="count-badge">{plans.length} gói đang hoạt động</span>
            </div>

            <div className="table-responsive">
              {isLoading ? (
                <div className="wp-table-loading">
                  <span className="spinner"></span>
                  <p>Đang tải danh sách gói...</p>
                </div>
              ) : (
                <table className="wp-list-table widefat fixed striped">
                  <thead>
                    <tr>
                      <th style={{ width: "35%" }}>Tên gói & Chu kỳ</th>
                      <th style={{ width: "25%" }}>Mức phí</th>
                      <th style={{ width: "40%" }}>Quyền lợi kèm theo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="no-items">
                          Chưa có gói VIP nào được cấu hình.
                        </td>
                      </tr>
                    ) : (
                      plans.map((plan) => {
                        // Features có thể là array hoặc json string
                        let featList = [];
                        if (Array.isArray(plan.features)) {
                          featList = plan.features;
                        } else if (typeof plan.features === "string") {
                          try {
                            featList = JSON.parse(plan.features);
                          } catch {
                            featList = plan.features.split("\n").filter(Boolean);
                          }
                        }

                        return (
                          <tr key={plan.id}>
                            <td className="column-primary has-row-actions">
                              <strong className="plan-title">{plan.name}</strong>
                              <div className="plan-cycle-badge">
                                <span className={`cycle-tag ${plan.type}`}>
                                  {plan.type === "monthly" ? "Theo Tháng" : "Theo Năm"}
                                </span>
                              </div>

                              {/* Row Actions on Hover */}
                              <div className="row-actions">
                                <span className="trash">
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(plan)}
                                    className="button-link delete-link"
                                  >
                                    Xóa gói này
                                  </button>
                                </span>
                              </div>
                            </td>

                            <td>
                              <span className="plan-price-text">
                                {Number(plan.price).toLocaleString("vi-VN")}đ
                              </span>
                              <span className="plan-period">
                                /{plan.type === "monthly" ? "tháng" : "năm"}
                              </span>
                            </td>

                            <td>
                              {featList.length > 0 ? (
                                <ul className="wp-feature-bullets">
                                  {featList.slice(0, 3).map((f, idx) => (
                                    <li key={idx}>
                                      <FaCheck className="check-icon" /> {f}
                                    </li>
                                  ))}
                                  {featList.length > 3 && (
                                    <li className="more-count">
                                      +{featList.length - 3} quyền lợi khác
                                    </li>
                                  )}
                                </ul>
                              ) : (
                                <span className="no-feature-hint">Toàn bộ quyền VIP tiêu chuẩn</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMember;