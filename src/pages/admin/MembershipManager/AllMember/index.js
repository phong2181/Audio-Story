import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    FaSearch,
    FaCrown,
    FaUserCheck,
    FaClock,
    FaUsers,
    FaExclamationTriangle,
    FaCalendarAlt,
    FaTimes,
    FaCheck,
    FaCog,
    FaUserPlus,
    FaUndo,
    FaQrcode
} from 'react-icons/fa';
import { useGetAdminMemberships, useGetMembershipPlansAD, getActiveMember } from 'api/homePage';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { STORAGE_URL } from 'config/config';
import { getAdminInfo } from 'utils/adminAuth';
import { ROUTES } from 'utils/route';
import './style.scss';

const MembershipManager = () => {
    const adminInfo = getAdminInfo();
    const queryClient = useQueryClient();

    const { data: rawData = [], isLoading, isError } = useGetAdminMemberships();
    const { data: plans = [] } = useGetMembershipPlansAD();

    const [searchTerm, setSearchTerm] = useState("");
    const [subTab, setSubTab] = useState("all"); // 'all', 'active', 'expiring', 'expired'
    const [planFilter, setPlanFilter] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Modal chỉnh sửa / gia hạn VIP
    const [editModalUser, setEditModalUser] = useState(null);
    const [modalPlanId, setModalPlanId] = useState("");
    const [modalStartDate, setModalStartDate] = useState("");
    const [modalEndDate, setModalEndDate] = useState("");

    const membershipList = useMemo(() => {
        return Array.isArray(rawData) ? rawData : (rawData?.data || []);
    }, [rawData]);

    // Helper kiểm tra trạng thái VIP
    const checkStatus = (dateStr) => {
        if (!dateStr) return "none";
        const exp = new Date(dateStr);
        const now = new Date();
        if (exp <= now) return "expired";
        const sevenDays = new Date();
        sevenDays.setDate(now.getDate() + 7);
        if (exp <= sevenDays) return "expiring";
        return "active";
    };

    // Helper tính số ngày còn lại
    const getRemainingDays = (dateStr) => {
        if (!dateStr) return null;
        const exp = new Date(dateStr);
        const now = new Date();
        const diffMs = exp.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Mutation cập nhật / gia hạn VIP
    const updateVipMutation = useMutation({
        mutationFn: ({ id, data }) => getActiveMember(id, data),
        onSuccess: () => {
            toast.success("Cập nhật thời hạn VIP thành công! 🚀");
            queryClient.invalidateQueries({ queryKey: ["getAdminMemberships"] });
            queryClient.invalidateQueries({ queryKey: ["getActiveUsers"] });
            setEditModalUser(null);
        },
        onError: (err) => {
            toast.error("Lỗi: " + (err.response?.data?.message || "Không thể cập nhật VIP"));
        }
    });

    // Thống kê số liệu
    const statistics = useMemo(() => {
        let active = 0;
        let expiring = 0;
        let expired = 0;

        membershipList.forEach(item => {
            const st = checkStatus(item.vip_expires_at);
            if (st === "active") active++;
            else if (st === "expiring") {
                active++;
                expiring++;
            } else if (st === "expired") expired++;
        });

        return {
            total: membershipList.length,
            active,
            expiring,
            expired
        };
    }, [membershipList]);

    // Lọc danh sách
    const filteredMemberships = useMemo(() => {
        return membershipList.filter((item) => {
            const matchesSearch =
                (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(item.id).includes(searchTerm);

            const st = checkStatus(item.vip_expires_at);

            let matchesTab = true;
            if (subTab === "active") matchesTab = st === "active" || st === "expiring";
            else if (subTab === "expiring") matchesTab = st === "expiring";
            else if (subTab === "expired") matchesTab = st === "expired";

            const matchesPlan =
                planFilter === "" || String(item.membership_plan_id) === String(planFilter);

            return matchesSearch && matchesTab && matchesPlan;
        });
    }, [membershipList, searchTerm, subTab, planFilter]);

    // Các gói phân biệt
    const availablePlans = useMemo(() => {
        if (Array.isArray(plans) && plans.length > 0) return plans;
        const uniqueIds = Array.from(new Set(membershipList.map(i => i.membership_plan_id))).filter(Boolean);
        return uniqueIds.map(id => ({ id, name: `Gói #${id}` }));
    }, [plans, membershipList]);

    // Chọn tất cả
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedUsers(filteredMemberships.map(i => i.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectRow = (id) => {
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Mở modal sửa / gia hạn
    const handleOpenEdit = (user) => {
        setEditModalUser(user);
        setModalPlanId(user.membership_plan_id || (plans[0]?.id || ""));
        const today = new Date().toISOString().split("T")[0];
        setModalStartDate(today);

        // Mặc định ngày hết hạn là 30 ngày sau
        const exp = new Date();
        exp.setDate(exp.getDate() + 30);
        setModalEndDate(exp.toISOString().split("T")[0]);
    };

    // Thay đổi gói hoặc ngày bắt đầu trong modal
    const handleModalPlanChange = (planId) => {
        setModalPlanId(planId);
        const plan = plans.find(p => String(p.id) === String(planId));
        const start = modalStartDate ? new Date(modalStartDate) : new Date();
        let end = new Date(start);

        if (plan?.type === "yearly") {
            end.setFullYear(end.getFullYear() + 1);
        } else {
            end.setMonth(end.getMonth() + 1);
        }

        setModalEndDate(end.toISOString().split("T")[0]);
    };

    const handleSaveModal = (e) => {
        e.preventDefault();
        if (!editModalUser) return;

        updateVipMutation.mutate({
            id: editModalUser.id,
            data: {
                membership_plan_id: modalPlanId,
                start_date: modalStartDate,
                expires_at: modalEndDate
            }
        });
    };

    // Xử lý thu hồi VIP
    const handleRevokeVip = (user) => {
        if (!window.confirm(`Bạn có chắc chắn muốn thu hồi quyền VIP của hội viên "${user.name || user.email}"?`)) {
            return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split("T")[0];

        updateVipMutation.mutate({
            id: user.id,
            data: {
                membership_plan_id: user.membership_plan_id,
                expires_at: yStr
            }
        });
    };

    if (adminInfo?.role === "staff") {
        return (
            <div className="wp-membership-page">
                <div className="wp-permission-denied">
                    <h2>🚫 Truy cập bị từ chối</h2>
                    <p>Bạn không có quyền quản lý thành viên và hội viên VIP.</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="wp-membership-page">
                <div className="wp-loading-state">
                    <span className="spinner"></span>
                    <p>Đang tải danh sách hội viên VIP...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="wp-membership-page">
                <div className="wp-error-state">
                    <FaExclamationTriangle />
                    <p>Không thể kết nối đến máy chủ để lấy danh sách hội viên!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="wp-membership-page">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* WordPress Page Header */}
            <div className="wp-page-header">
                <div className="wp-header-left">
                    <h1 className="wp-page-title">
                        <FaCrown className="title-icon" /> Quản lý Hội Viên VIP
                    </h1>
                    <p className="wp-page-subtitle">
                        Theo dõi tài khoản có quyền đặc quyền VIP, thời hạn sử dụng và lịch sử gói dịch vụ
                    </p>
                </div>
                <div className="wp-header-actions">
                    <Link to={ROUTES.ADMIN.MEMBERSHIP_VIETQR} className="wp-btn-action">
                        <FaQrcode /> Liên kết ngân hàng VietQR
                    </Link>
                    <Link to={ROUTES.ADMIN.ADD_MEMBERSHIP} className="wp-btn-action">
                        <FaCog /> Cấu hình gói VIP
                    </Link>
                    <Link to={ROUTES.ADMIN.MANAGE_VIP_APPROVAL} className="wp-btn-action wp-btn-primary">
                        <FaUserPlus /> Kích hoạt VIP thủ công
                    </Link>
                </div>
            </div>

            {/* Metric Overview Cards (WordPress Dashboard Style) */}
            <div className="wp-metric-cards">
                <div className="wp-metric-card">
                    <div className="metric-icon total">
                        <FaUsers />
                    </div>
                    <div className="metric-content">
                        <span className="metric-label">Tổng hội viên VIP</span>
                        <h3 className="metric-value">{statistics.total}</h3>
                        <span className="metric-hint">Đã đăng ký hệ thống</span>
                    </div>
                </div>

                <div className="wp-metric-card">
                    <div className="metric-icon active">
                        <FaUserCheck />
                    </div>
                    <div className="metric-content">
                        <span className="metric-label">Đang hoạt động</span>
                        <h3 className="metric-value">{statistics.active}</h3>
                        <span className="metric-badge active">Khả dụng</span>
                    </div>
                </div>

                <div className="wp-metric-card">
                    <div className="metric-icon warning">
                        <FaClock />
                    </div>
                    <div className="metric-content">
                        <span className="metric-label">Sắp hết hạn (&le; 7 ngày)</span>
                        <h3 className="metric-value">{statistics.expiring}</h3>
                        <span className="metric-badge warning">Cần gia hạn</span>
                    </div>
                </div>

                <div className="wp-metric-card">
                    <div className="metric-icon expired">
                        <FaExclamationTriangle />
                    </div>
                    <div className="metric-content">
                        <span className="metric-label">Đã hết hạn VIP</span>
                        <h3 className="metric-value">{statistics.expired}</h3>
                        <span className="metric-badge expired">Hết hạn</span>
                    </div>
                </div>
            </div>

            {/* Subsubsub Navigation Tabs */}
            <ul className="subsubsub">
                <li className="all">
                    <button
                        type="button"
                        className={subTab === "all" ? "current" : ""}
                        onClick={() => setSubTab("all")}
                    >
                        Tất cả <span className="count">({statistics.total})</span>
                    </button>{" "}
                    |
                </li>
                <li className="active">
                    <button
                        type="button"
                        className={subTab === "active" ? "current" : ""}
                        onClick={() => setSubTab("active")}
                    >
                        Đang hoạt động <span className="count">({statistics.active})</span>
                    </button>{" "}
                    |
                </li>
                <li className="expiring">
                    <button
                        type="button"
                        className={subTab === "expiring" ? "current" : ""}
                        onClick={() => setSubTab("expiring")}
                    >
                        Sắp hết hạn <span className="count">({statistics.expiring})</span>
                    </button>{" "}
                    |
                </li>
                <li className="expired">
                    <button
                        type="button"
                        className={subTab === "expired" ? "current" : ""}
                        onClick={() => setSubTab("expired")}
                    >
                        Đã hết hạn <span className="count">({statistics.expired})</span>
                    </button>
                </li>
            </ul>

            {/* Filter & Search Bar */}
            <div className="wp-filter-bar">
                <div className="wp-search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="search"
                        placeholder="Tìm theo tên, email, ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="clear-search" onClick={() => setSearchTerm("")}>
                            <FaTimes />
                        </button>
                    )}
                </div>

                <div className="wp-filter-controls">
                    <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                        className="wp-select"
                    >
                        <option value="">Tất cả các gói</option>
                        {availablePlans.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name || `Gói #${p.id}`}
                            </option>
                        ))}
                    </select>

                    {(searchTerm || planFilter || subTab !== "all") && (
                        <button
                            type="button"
                            className="wp-button wp-button-secondary btn-reset"
                            onClick={() => {
                                setSearchTerm("");
                                setPlanFilter("");
                                setSubTab("all");
                            }}
                            title="Đặt lại bộ lọc"
                        >
                            <FaUndo /> Đặt lại
                        </button>
                    )}
                </div>
            </div>

            {/* WordPress List Table */}
            <div className="wp-table-container">
                <table className="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th className="check-column">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={
                                        filteredMemberships.length > 0 &&
                                        selectedUsers.length === filteredMemberships.length
                                    }
                                />
                            </th>
                            <th className="column-primary" style={{ width: "30%" }}>
                                Khách hàng / Hội viên
                            </th>
                            <th style={{ width: "18%" }}>Gói dịch vụ</th>
                            <th style={{ width: "20%" }}>Hạn VIP</th>
                            <th style={{ width: "16%" }}>Trạng thái</th>
                            <th style={{ width: "16%", textAlign: "right" }}>Thao tác</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredMemberships.length === 0 ? (
                            <tr className="no-items">
                                <td colSpan="6" className="colspanchange">
                                    <div className="empty-message">
                                        <FaCrown style={{ fontSize: "2rem", opacity: 0.3, marginBottom: 8 }} />
                                        <p>Không tìm thấy hội viên nào phù hợp với bộ lọc.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredMemberships.map((item) => {
                                const st = checkStatus(item.vip_expires_at);
                                const daysLeft = getRemainingDays(item.vip_expires_at);
                                const isChecked = selectedUsers.includes(item.id);

                                return (
                                    <tr key={item.id} className={isChecked ? "selected" : ""}>
                                        <th className="check-column">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleSelectRow(item.id)}
                                            />
                                        </th>

                                        {/* Cột Hội viên */}
                                        <td className="column-primary has-row-actions">
                                            <div className="member-cell">
                                                <div className="member-avatar">
                                                    {item.avatar ? (
                                                        <img
                                                            src={item.avatar.startsWith("http") ? item.avatar : `${STORAGE_URL}/${item.avatar}`}
                                                            alt={item.name}
                                                        />
                                                    ) : (
                                                        <span className="avatar-initial">
                                                            {(item.name?.[0] || item.email?.[0] || "U").toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="member-meta">
                                                    <strong className="member-name">
                                                        {item.name || "Ẩn danh"}
                                                    </strong>
                                                    <span className="member-email">{item.email || "Không có email"}</span>
                                                    <span className="member-id">ID: #{item.id}</span>
                                                </div>
                                            </div>

                                            {/* WordPress Row Actions on Hover */}
                                            <div className="row-actions">
                                                <span className="edit">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(item)}
                                                        className="button-link"
                                                    >
                                                        Gia hạn / Sửa hạn
                                                    </button>
                                                </span>
                                                {" | "}
                                                <span className="trash">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRevokeVip(item)}
                                                        className="button-link delete-link"
                                                    >
                                                        Thu hồi VIP
                                                    </button>
                                                </span>
                                            </div>
                                        </td>

                                        {/* Cột Gói VIP */}
                                        <td>
                                            <span className="wp-plan-badge">
                                                <FaCrown className="crown-icon" />
                                                <span>{item.plan?.name || item.plan?.type || `Gói #${item.membership_plan_id || "VIP"}`}</span>
                                            </span>
                                        </td>

                                        {/* Cột Hạn VIP */}
                                        <td>
                                            <div className="expire-date-cell">
                                                <div className="date-text">
                                                    <FaCalendarAlt className="cal-icon" />
                                                    <span>
                                                        {item.vip_expires_at
                                                            ? new Date(item.vip_expires_at).toLocaleDateString("vi-VN")
                                                            : "Chưa kích hoạt"}
                                                    </span>
                                                </div>
                                                {item.vip_expires_at && (
                                                    <span className={`countdown-tag ${st}`}>
                                                        {st === "expired"
                                                            ? `Hết hạn ${Math.abs(daysLeft)} ngày trước`
                                                            : daysLeft === 0
                                                            ? "Hết hạn hôm nay"
                                                            : `Còn ${daysLeft} ngày`}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Cột Trạng thái */}
                                        <td>
                                            {st === "active" && (
                                                <span className="wp-status-pill status-active">
                                                    <span className="pill-dot"></span> Đang hoạt động
                                                </span>
                                            )}
                                            {st === "expiring" && (
                                                <span className="wp-status-pill status-expiring">
                                                    <span className="pill-dot"></span> Sắp hết hạn
                                                </span>
                                            )}
                                            {st === "expired" && (
                                                <span className="wp-status-pill status-expired">
                                                    <span className="pill-dot"></span> Đã hết hạn
                                                </span>
                                            )}
                                            {st === "none" && (
                                                <span className="wp-status-pill status-none">
                                                    Chưa cấp
                                                </span>
                                            )}
                                        </td>

                                        {/* Cột Thao tác */}
                                        <td style={{ textAlign: "right" }}>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEdit(item)}
                                                className="wp-button wp-button-secondary wp-button-small"
                                            >
                                                Gia hạn VIP
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Gia Hạn / Cập Nhật VIP */}
            {editModalUser && (
                <div className="wp-modal-backdrop" onClick={() => setEditModalUser(null)}>
                    <div className="wp-modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="wp-modal-header">
                            <h3>
                                <FaCrown style={{ color: "#eab308" }} /> Gia hạn quyền VIP: {editModalUser.name}
                            </h3>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setEditModalUser(null)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleSaveModal}>
                            <div className="wp-modal-body">
                                <div className="modal-user-summary">
                                    <div className="avatar-circle">
                                        {(editModalUser.name?.[0] || "U").toUpperCase()}
                                    </div>
                                    <div>
                                        <strong>{editModalUser.name}</strong>
                                        <p>{editModalUser.email}</p>
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="modal-plan">Chọn gói thành viên</label>
                                    <select
                                        id="modal-plan"
                                        value={modalPlanId}
                                        onChange={(e) => handleModalPlanChange(e.target.value)}
                                        className="wp-input"
                                        required
                                    >
                                        {availablePlans.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name || `Gói #${p.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-field-row">
                                    <div className="form-field">
                                        <label htmlFor="modal-start">Ngày bắt đầu</label>
                                        <input
                                            type="date"
                                            id="modal-start"
                                            value={modalStartDate}
                                            onChange={(e) => setModalStartDate(e.target.value)}
                                            className="wp-input"
                                            required
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label htmlFor="modal-end">Ngày hết hạn VIP</label>
                                        <input
                                            type="date"
                                            id="modal-end"
                                            value={modalEndDate}
                                            onChange={(e) => setModalEndDate(e.target.value)}
                                            className="wp-input"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="wp-modal-footer">
                                <button
                                    type="button"
                                    className="wp-button wp-button-secondary"
                                    onClick={() => setEditModalUser(null)}
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="wp-button wp-button-primary"
                                    disabled={updateVipMutation.isPending}
                                >
                                    {updateVipMutation.isPending ? "Đang lưu..." : <><FaCheck /> Lưu cập nhật</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembershipManager;