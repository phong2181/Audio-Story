import React, { useState } from 'react';
import { FaSearch, FaUserCheck, FaLock, FaUsers, FaTrash, FaUnlock, FaCrown } from 'react-icons/fa';
import { useGetActiveUser, useGetMembershipPlansAD, getActiveMember } from 'api/homePage'; 
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import './style.scss';
import { getAdminInfo } from 'utils/adminAuth';

const ManagerAuthorsUser = () => {
    const adminInfo = getAdminInfo();
    const isAdmin = adminInfo?.role === "admin";
    const { data: userList = [], isLoading, isError } = useGetActiveUser({enabled: isAdmin});
    
    // Fetch danh sách các gói VIP phục vụ cho Modal Mở VIP
    const { data: plans = [] } = useGetMembershipPlansAD();

    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");


    // Phân trang
    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);

    // States phục vụ cho Modal Mở VIP
    const [selectedUser, setSelectedUser] = useState(null);
    const [isVipModalOpen, setIsVipModalOpen] = useState(false);
    const [vipPlanId, setVipPlanId] = useState("");
    const [vipStartDate, setVipStartDate] = useState("");
    const [vipEndDate, setVipEndDate] = useState("");

    // Mutation thực hiện cập nhật VIP cho User thông qua API updateUserAPI
    const vipMutation = useMutation({
        mutationFn: ({ id, data }) => getActiveMember(id, data),
        onSuccess: () => {
            toast.success("Mở VIP thành công! 🚀");
            queryClient.invalidateQueries({ queryKey: ["getActiveUsers"] });
            setIsVipModalOpen(false);
            setSelectedUser(null);
        },
        onError: (error) => {
            toast.error("Lỗi: " + (error.response?.data?.message || "Không thể kích hoạt VIP"));
        }
    });

    if (isLoading) {
        return (
            <div className="membership-manager skeleton-loading">
                <div className="membership-manager__header">
                    <div className="skeleton-title"></div>
                </div>

                <div className="membership-manager__overview">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="overview-card skeleton-card">
                            <div className="skeleton-icon"></div>
                            <div className="overview-card__info">
                                <div className="skeleton-text-sm"></div>
                                <div className="skeleton-text-lg"></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="membership-manager__filter-bar skeleton-filter-bar">
                    <div className="skeleton-search"></div>
                    <div className="skeleton-select"></div>
                </div>

                <div className="membership-manager__table-wrapper">
                    <table className="membership-table">
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'center' }}>Thông tin</th>
                                <th style={{ textAlign: 'center' }}>Trạng thái</th>
                                <th style={{ textAlign: 'center' }}>Vi phạm</th>
                                <th style={{ textAlign: 'center' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i}>
                                    <td>
                                        <div className="user-info">
                                            <div className="avatar-wrapper">
                                                <div className="skeleton-avatar"></div>
                                            </div>
                                            <div className="user-details">
                                                <div className="skeleton-text-md"></div>
                                                <div className="skeleton-text-sm"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="skeleton-badge"></div>
                                    </td>
                                    <td>
                                        <div className="skeleton-switch"></div>
                                    </td>
                                    <td>
                                        <div className="skeleton-actions">
                                            <div className="skeleton-btn-vip"></div>
                                            <div className="skeleton-btn-delete"></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
       
    if (isError) return <div className="membership-manager" style={{ padding: '24px', color: 'red' }}>Lỗi hệ thống!</div>;
    
    // Tính toán thống kê từ danh sách user
    const statistics = {
        total_revenue: userList.length, 
        active_members: userList.filter(u => u.membership_plan_id !== null).length,
        expiring_soon: userList.filter(u => u.is_banned).length
    };

    // Logic lọc dữ liệu dựa trên tên/email và trạng thái
    const filteredUsers = userList.filter((item) => {
        const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              item.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "" || 
                              (statusFilter === "active" && item.membership_plan_id !== null) || 
                              (statusFilter === "banned" && item.is_banned);

        return matchesSearch && matchesStatus;
    });

    // Các biến phục vụ phân trang
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const activePage = Math.min(currentPage, totalPages || 1);
    const startIndex = (activePage - 1) * itemsPerPage;
    const displayList = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Tự động tính ngày kết thúc khi chọn gói VIP hoặc thay đổi ngày bắt đầu
    const handlePlanOrDateChange = (planId, startDateStr) => {
        setVipPlanId(planId);
        if (!startDateStr) return;
        
        const plan = plans.find(p => String(p.id) === String(planId));
        if (!plan) return;

        const start = new Date(startDateStr);
        let end = new Date(start);

        if (plan.type === "monthly") {
            end.setMonth(end.getMonth() + 1);
        } else if (plan.type === "yearly") {
            end.setFullYear(end.getFullYear() + 1);
        } else {
            end.setDate(end.getDate() + 30);
        }

        const yyyy = end.getFullYear();
        const mm = String(end.getMonth() + 1).padStart(2, '0');
        const dd = String(end.getDate()).padStart(2, '0');
        setVipEndDate(`${yyyy}-${mm}-${dd}`);
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, activePage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    className={`pagination-btn ${activePage === i ? 'active' : ''}`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </button>
            );
        }
        return pageNumbers;
    };

    const handleToggleBan = (id) => { console.log("Toggle user:", id); };

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
        <div className="membership-manager">
            <div className="membership-manager__header">
                <h2>Quản lý Người Dùng</h2>
            </div>

            <div className="membership-manager__overview">
                <div className="overview-card overview-card--banned">
                    <div className="overview-card__icon"><FaLock /></div>
                    <div className="overview-card__info">
                        <span>Đã khoá</span>
                        <h3>{statistics.expiring_soon}</h3>
                    </div>
                </div>
                <div className="overview-card overview-card--active">
                    <div className="overview-card__icon"><FaUserCheck /></div>
                    <div className="overview-card__info">
                        <span>Đang hoạt động</span>
                        <h3>{statistics.active_members}</h3>
                    </div>
                </div>
                <div className="overview-card overview-card--total">
                    <div className="overview-card__icon"><FaUsers /></div>
                    <div className="overview-card__info">
                        <span>Tổng số</span>
                        <h3>{statistics.total_revenue}</h3>
                    </div>
                </div>
            </div>

            <div className="membership-manager__filter-bar">
                <div className="filter-search">
                    <FaSearch className="filter-search__icon"/>
                    <input 
                        type="text" 
                        placeholder="Tìm tên, email..." 
                        value={searchTerm} 
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }} 
                    />
                </div>
                <select 
                    className="filter-select" 
                    value={statusFilter} 
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="banned">Đã khoá</option>
                </select>
            </div>

            <div className="membership-manager__table-wrapper">
                <table className="membership-table">
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'center' }}>Thông tin</th>
                            <th style={{ textAlign: 'center' }}>Trạng thái</th>
                            <th style={{ textAlign: 'center' }}>Vi phạm</th>
                            <th style={{ textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                      {displayList.length > 0 ? (
                          displayList.map((item) => (
                              <tr key={item.id}>
                                  <td>
                                    <div className="user-info">
                                        <div className="avatar-wrapper">
                                            {item.avatar ? (
                                                <img
                                                    src={item.avatar}
                                                    alt={item.name}
                                                    className="user-avatar"
                                                />
                                            ) : (
                                                <div className="user-avatar avatar-fallback" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '40px'}}>
                                                    {item.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                            )}

                                            <span className="status-dot"></span>
                                        </div>

                                        <div className="user-details">
                                            <span>{item.name || "N/A"}</span>
                                            <small>{item.email || "N/A"}</small>
                                        </div>
                                    </div>
                                  </td>
                                  <td>
                                      <span className={`status-badge ${item.is_banned ? 'status-badge--expired' : 'status-badge--active'}`}>
                                          {item.is_banned ? 'Đã khoá' : 'Bình Thường'}
                                      </span>
                                  </td>
                                 <td> 
                                  <div className="status-switch-wrapper"> 
                                    <label className="switch"> 
                                      <input 
                                        type="checkbox" checked={!item.is_banned} 
                                        onChange={() => handleToggleBan(item.id)} 
                                        /> 
                                        <span className="slider"></span> 
                                    </label> 
                                    <span className={`switch-label ${item.is_banned ? "banned" : "active"}`}> {item.is_banned ? "Đã khóa" : "Hoạt động"} </span> 
                                  </div> 
                                  </td> 
                                  <td> 
                                    <div className="action-group"> 
                                      <button 
                                        className="btn-action btn-vip"
                                        onClick={() => {
                                            setSelectedUser(item);
                                            setVipPlanId(item.membership_plan_id || "");
                                            
                                            // Set mặc định ngày bắt đầu là ngày hiện tại dạng yyyy-MM-dd
                                            const today = new Date();
                                            const yyyy = today.getFullYear();
                                            const mm = String(today.getMonth() + 1).padStart(2, '0');
                                            const dd = String(today.getDate()).padStart(2, '0');
                                            const todayStr = `${yyyy}-${mm}-${dd}`;
                                            setVipStartDate(todayStr);
                                            
                                            // Lấy hạn dùng cũ nếu có, nếu chưa thì để trống hoặc tự tính
                                            if (item.vip_expires_at) {
                                                const expiryDate = new Date(item.vip_expires_at);
                                                const ey = expiryDate.getFullYear();
                                                const em = String(expiryDate.getMonth() + 1).padStart(2, '0');
                                                const ed = String(expiryDate.getDate()).padStart(2, '0');
                                                setVipEndDate(`${ey}-${em}-${ed}`);
                                            } else {
                                                setVipEndDate("");
                                            }
                                            setIsVipModalOpen(true);
                                        }}
                                      > 
                                        <FaCrown /> <span>Mở VIP</span> 
                                      </button> 
                                      <button className="btn-action btn-delete"> 
                                        <FaTrash /> 
                                      </button> 
                                    </div> 
                                  </td>
                              </tr>
                          ))
                      ) : (
                          <tr><td colSpan="4" style={{textAlign:'center', padding: '20px'}}>Không tìm thấy người dùng phù hợp.</td></tr>
                      )}
                  </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="membership-manager__pagination">
                    <div className="pagination-info">
                        Hiển thị <strong>{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)}</strong> trong tổng số <strong>{filteredUsers.length}</strong> người dùng
                    </div>
                    <div className="pagination-controls">
                        <button 
                            className="pagination-btn" 
                            disabled={activePage === 1}
                            onClick={() => handlePageChange(activePage - 1)}
                        >
                            Trước
                        </button>
                        {renderPageNumbers()}
                        <button 
                            className="pagination-btn" 
                            disabled={activePage === totalPages}
                            onClick={() => handlePageChange(activePage + 1)}
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Kích hoạt quyền VIP cho tài khoản */}
            {isVipModalOpen && selectedUser && (
                <div className="vip-modal-overlay">
                    <div className="vip-modal-card">
                        <div className="vip-modal-card__header">
                            <h3><FaCrown /> Kích Hoạt Quyền VIP</h3>
                            <button className="close-btn" onClick={() => setIsVipModalOpen(false)}>&times;</button>
                        </div>
                        <div className="vip-modal-card__body">
                            <div className="target-user-info">
                                <div className="avatar-wrapper">
                                    <img 
                                        src={
                                            selectedUser.avatar 
                                                ? `http://bloger.test/storage/${selectedUser.avatar}` 
                                                : "https://via.placeholder.com/40"
                                        } 
                                        alt={selectedUser.name} 
                                    />
                                </div>
                                <div className="user-text">
                                    <strong>{selectedUser.name || "N/A"}</strong>
                                    <span>{selectedUser.email || "N/A"}</span>
                                </div>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                vipMutation.mutate({
                                    id: selectedUser.id,
                                    data: {
                                        membership_plan_id: vipPlanId,
                                        vip_expires_at: vipEndDate
                                    }
                                });
                            }}>
                                <div className="form-group">
                                    <label>Chọn Gói Thành Viên VIP</label>
                                    <select 
                                        required 
                                        value={vipPlanId} 
                                        onChange={(e) => handlePlanOrDateChange(e.target.value, vipStartDate)}
                                    >
                                        <option value="">-- Chọn gói thành viên --</option>
                                        {plans.map(plan => (
                                            <option key={plan.id} value={plan.id}>
                                                {plan.name} ({Number(plan.price).toLocaleString('vi-VN')}đ / {plan.type === 'monthly' ? 'Tháng' : 'Năm'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="date-row">
                                    <div className="form-group">
                                        <label>Ngày Bắt Đầu</label>
                                        <input 
                                            type="date" 
                                            required 
                                            value={vipStartDate} 
                                            onChange={(e) => {
                                                setVipStartDate(e.target.value);
                                                handlePlanOrDateChange(vipPlanId, e.target.value);
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Ngày Kết Thúc</label>
                                        <input 
                                            type="date" 
                                            required 
                                            value={vipEndDate} 
                                            onChange={(e) => setVipEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="action-buttons">
                                    <button type="button" className="btn-cancel" onClick={() => setIsVipModalOpen(false)}>Hủy</button>
                                    <button type="submit" className="btn-confirm" disabled={vipMutation.isPending}>
                                        {vipMutation.isPending ? "Đang xử lý..." : "Xác nhận Mở VIP"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerAuthorsUser;