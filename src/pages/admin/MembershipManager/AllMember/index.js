import React, { useState } from 'react';
import { FaSearch, FaCrown, FaUserCheck, FaClock, FaDollarSign, FaEllipsisV } from 'react-icons/fa';
import { useGetAdminMemberships } from 'api/homePage';
import './style.scss';
import { STORAGE_URL } from 'config/config';
import { getAdminInfo } from 'utils/adminAuth';

const MembershipManager = () => {

    // ✅ CÁCH 1: rename data -> response
    const { data: plant = [] , isLoading, isError } = useGetAdminMemberships();

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [planFilter, setPlanFilter] = useState("");
    const adminInfo = getAdminInfo();

    if (isLoading) {
        return (
            <div className="membership-manager" style={{ padding: '24px', color: '#999' }}>
                Đang tải dữ liệu hội viên...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="membership-manager" style={{ padding: '24px', color: 'red' }}>
                Lỗi tải dữ liệu!
            </div>
        );
    }

    // =========================
    // BACKEND RESPONSE
    // =========================
    const membershipList = Array.isArray(plant)
    ? plant
    : [];


    const statistics = {
        active_members: membershipList.filter(u =>
            new Date(u.vip_expires_at) > new Date()
        ).length,

        expiring_soon: membershipList.filter(u => {
            const exp = new Date(u.vip_expires_at);
            const now = new Date();
            const sevenDays = new Date();
            sevenDays.setDate(now.getDate() + 7);

            return exp > now && exp <= sevenDays;
        }).length
    };

    

    // =========================
    // CHECK ACTIVE VIP
    // =========================
    const checkIsActive = (expiryDateStr) => {
        if (!expiryDateStr) return false;
        return new Date(expiryDateStr) > new Date();
    };

    // =========================
    // FORMAT MONEY (optional)
    // =========================
    const formatVND = (value) => {
        if (!value) return "---";
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    // =========================
    // FILTER DATA
    // =========================
    const filteredMemberships = membershipList.filter((item) => {

        const matchesSearch =
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const isActive = checkIsActive(item.vip_expires_at);

        const matchesStatus =
            statusFilter === "" ||
            (statusFilter === "1" && isActive) ||
            (statusFilter === "" && !isActive);

        const matchesPlan =
            planFilter === "" ||
            String(item.vip_expires_at) === planFilter;

        return matchesSearch && matchesStatus && matchesPlan;
    });

    // =========================
    // UNIQUE PLANS
    // =========================
    const uniquePlans = Array.from(
        new Set(membershipList.map(item => item.membership_plan_id))
    ).filter(Boolean);

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
                <p>Bạn không có quyền quản lý thành viên.</p>
            </div>
        );
    }

    return (
        <div className="membership-manager">

            {/* HEADER */}
            <div className="membership-manager__header">
                <h2>Quản lý Hội Viên</h2>
                <p>Danh sách người dùng đang sử dụng VIP</p>
            </div>

            {/* OVERVIEW */}
            <div className="membership-manager__overview">

                <div className="overview-card">
                    <div className="overview-card__icon overview-card__icon--revenue">
                        <FaDollarSign />
                    </div>
                    <div className="overview-card__info">
                        <span>Tổng doanh thu</span>
                        <h3>---</h3>
                    </div>
                </div>

                <div className="overview-card">
                    <div className="overview-card__icon overview-card__icon--active">
                        <FaUserCheck />
                    </div>
                    <div className="overview-card__info">
                        <span>Hội viên đang hoạt động</span>
                        <h3>{statistics.active_members}</h3>
                    </div>
                </div>

                <div className="overview-card">
                    <div className="overview-card__icon overview-card__icon--warning">
                        <FaClock />
                    </div>
                    <div className="overview-card__info">
                        <span>Sắp hết hạn</span>
                        <h3>{statistics.expiring_soon}</h3>
                    </div>
                </div>

            </div>

            {/* FILTER */}
            <div className="membership-manager__filter-bar">

                <div className="filter-search">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tên, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-actions">

                    <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                    >
                        <option value="">Tất cả gói</option>
                        {uniquePlans.map((id) => (
                            <option key={id} value={id}>
                                Gói #{id}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="expired">Đã hết hạn</option>
                    </select>

                </div>

            </div>

            {/* TABLE */}
            <div className="membership-manager__table-wrapper">
                <table className="membership-table">
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'center' }}>Khách hàng</th>
                            <th style={{ textAlign: 'center' }}>Gói</th>
                            <th style={{ textAlign: 'center' }}>Email</th>
                            <th style={{ textAlign: 'center' }}>Hạn VIP</th>
                            <th style={{ textAlign: 'center' }}>Trạng thái</th>
                            <th align="center">Thao tác</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredMemberships.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            filteredMemberships.map((item) => {

                                const isActive = checkIsActive(item.vip_expires_at);

                                return (
                                    <tr key={item.id}>

                                        {/* USER */}
                                        <td>
                                            <div className="membership-table__user">
                                                <div className="user-avatar">
                                                    {item.avatar ? (
                                                        <img
                                                            src={`${STORAGE_URL}/${item.avatar}`}
                                                            alt="avatar"
                                                        />
                                                    ) : (
                                                        <span className="avatar-fallback">
                                                            {(item.name?.[0] || "U").toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="user-info">
                                                    <span className="user-info__name">
                                                        {item.name || "Ẩn danh"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* PLAN */}
                                        <td>
                                            <span className="plan-badge">
                                                <FaCrown /> {item.plan?.type || "Gói không xác định"}
                                            </span>
                                        </td>

                                        {/* EMAIL */}
                                        <td>{item.email || "N/A"}</td>

                                        {/* EXPIRE */}
                                        <td>
                                            {item.vip_expires_at
                                                ? new Date(item.vip_expires_at).toLocaleDateString("vi-VN")
                                                : "Chưa kích hoạt"}
                                        </td>

                                        {/* STATUS */}
                                        <td>
                                            <span className={`status-badge status-badge--${isActive ? 'active' : 'expired'}`}>
                                                {isActive ? 'Đang hoạt động' : 'Đã hết hạn'}
                                            </span>
                                        </td>

                                        {/* ACTION */}
                                        <td align="center">
                                            <button className="action-btn-trigger">
                                                <FaEllipsisV />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default MembershipManager;