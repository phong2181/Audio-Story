import React, { useState } from "react";
import { FaLayerGroup, FaPlus, FaListUl, FaTrash, FaCheck } from "react-icons/fa";
import { useGetMembershipPlansAD, useAddMembershipPlanAD, useDeleteMembershipPlanAD } from "api/homePage"; // Đường dẫn file queries của bạn
import "./style.scss";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { getAdminInfo } from "utils/adminAuth";

const AddMember = () => {
  // State quản lý Form
  const [formData, setFormData] = useState({ name: "", price: "", type: "monthly", features: "" });
  const adminInfo = getAdminInfo();

  // Gọi Hooks
  const { data: plans = [], isLoading } = useGetMembershipPlansAD();
  const addMutation = useAddMembershipPlanAD();
  const deleteMutation = useDeleteMembershipPlanAD();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSend = {
      ...formData,
      features: formData.features.split('\n').filter(item => item.trim() !== '')
    };

    // Hiển thị trạng thái đang xử lý (tùy chọn)
    const idToast = toast.loading("Đang gửi yêu cầu...");

    addMutation.mutate(dataToSend, {
      onSuccess: () => {
        // Cập nhật toast thành thành công
        toast.update(idToast, { 
            render: "Thêm gói thành công! 🚀", 
            type: "success", 
            isLoading: false, 
            autoClose: 3000 
        });
        
        setFormData({ name: "", price: "", type: "monthly", features: "" });
      },
      onError: (error) => {
        // Cập nhật toast thành lỗi
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
            title: 'Xác nhận xóa?',
            text: `Gói "${plan.name}" sẽ bị xóa vĩnh viễn!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444', // Màu đỏ danger của bạn
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Vâng, xóa luôn!',
            cancelButtonText: 'Hủy',
            background: '#ffffff',
            borderRadius: '16px',
            customClass: {
                popup: 'swal2-modern-round',
                title: 'swal2-title-custom'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Thực hiện gọi API xóa
                deleteMutation.mutate(plan.id, {
                    onSuccess: () => {
                        toast.success(`Đã xóa gói ${plan.name} thành công!`);
                    },
                    onError: () => {
                        toast.error("Không thể xóa, vui lòng thử lại.");
                    }
                });
            }
        });
    };

    if (adminInfo?.role === "staff") {
      return (
          <div
              style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "60vh",
                  textAlign: "center"
              }}
          >
              <h2>🚫 Truy cập bị từ chối</h2>
              <p>Bạn không có quyền truy cập.</p>
          </div>
      );
  }

  return (
    <div className="admin-member-page">
      <header className="admin-header-sticky">
        <div className="header-content">
          <div className="header-text">
            <h2><FaLayerGroup /> Quản lý Membership</h2>
            <p>Thiết lập quyền lợi cho các gói của bạn</p>
          </div>
          <div className="header-stats">
            {plans.length} Gói đang hoạt động
          </div>
        </div>
      </header>

      <main className="admin-content-layout">
        <section className="form-section-card">
          <h3><FaPlus /> Chi tiết gói mới</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên gói thành viên</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nhập tên gói..." 
                required 
              />
            </div>

            <div className="form-group">
              <label>Chu kỳ thanh toán</label>
              <div className="radio-group">
                <label className={`radio-option ${formData.type === 'monthly' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="cycle" 
                    checked={formData.type === 'monthly'} 
                    onChange={() => setFormData({...formData, type: 'monthly'})} 
                  />
                  <span>Theo Tháng</span>
                </label>
                <label className={`radio-option ${formData.type === 'yearly' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="cycle" 
                    checked={formData.type === 'yearly'} 
                    onChange={() => setFormData({...formData, type: 'yearly'})} 
                  />
                  <span>Theo Năm</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Số tiền gói (VNĐ)</label>
              <input 
                type="number" 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="Ví dụ: 100000" 
                required 
              />
            </div>

            <div className="form-group">
              <label>Tính năng ưu đãi (Mỗi dòng một tính năng)</label>
              <textarea 
                rows="5" 
                value={formData.features}
                onChange={(e) => setFormData({...formData, features: e.target.value})}
                placeholder="Ví dụ:&#10;Đọc 5 chương VIP&#10;Tải audio ngoại tuyến..." 
              />
            </div>

            <button type="submit" className="btn-submit-main" disabled={addMutation.isPending}>
              {addMutation.isPending ? "Đang lưu..." : <><FaCheck /> Lưu cấu hình gói</>}
            </button>
          </form>
        </section>

        <section className="table-card form-section-card">
          <h3><FaListUl /> Danh sách gói</h3>
          <div className="table-responsive">
            {isLoading ? <p>Đang tải dữ liệu...</p> : (
              <table>
                <thead>
                  <tr>
                    <th>Thông tin gói</th>
                    <th>Giá trị</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id}>
                      <td>
                        <div className="plan-info-cell">
                          <span className="plan-name">{plan.name}</span>
                          <span className={`badge ${plan.type}`}>
                            {plan.type === "monthly" ? "Gói Tháng" : "Gói Năm"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="price-cell">
                          <span className="amount">{Number(plan.price).toLocaleString()}đ</span>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                          <button 
                            className="btn-action delete" 
                            onClick={() => handleDelete(plan)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AddMember;