import React, { useState } from 'react';
import { FaSearch, FaFilter, FaDownload, FaExchangeAlt, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { useGetAdminMemberships, exportTransactionExcelAPI } from 'api/homePage';
import './style.scss';
import { getAdminInfo } from 'utils/adminAuth';

const TransactionStatistics = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isExporting, setIsExporting] = useState(false);
    const adminInfo = getAdminInfo();

    // Gọi API lấy danh sách giao dịch (truyền kèm filter nếu backend của Dũng có hỗ trợ phân trang/lọc)
    const { data: response, isLoading, isError } = useGetAdminMemberships({
        page: currentPage,
        status: statusFilter,
        search: searchTerm
    });

    const formatVND = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Hàm xuất Excel danh sách giao dịch
    const handleExportExcel = async () => {
        try {
            setIsExporting(true);
            const res = await exportTransactionExcelAPI(statusFilter, searchTerm);
            
            // Xử lý Blob chuẩn không bị lỗi undefined ô A1
            const blob = new Blob([res.data || res], { type: 'application/vnd.ms-excel' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Danh_Sach_Giao_Dich_${statusFilter}_${Date.now()}.xls`);
            document.body.appendChild(link);
            link.click();
            
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert("Lỗi xuất file Excel giao dịch, Dũng kiểm tra lại nhé!");
            console.error(error);
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading) return <div className="loading-state">Đang tải danh sách giao dịch...</div>;
    if (isError) return <div className="error-state">Lỗi tải dữ liệu giao dịch từ hệ thống!</div>;

    // Lấy mảng dữ liệu từ API Laravel trả về (Thường bọc trong data hoặc data.data nếu có phân trang)
    const transactions = response?.data?.data || response?.data || [];
    const pagination = response?.data?.meta || null; // Nếu Laravel dùng paginate()

    // Render badge trạng thái giao dịch
    const renderStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'successful':
            case 'completed':
                return <span className="status-badge status-badge--success"><FaCheckCircle /> Thành công</span>;
            case 'pending':
                return <span className="status-badge status-badge--pending"><FaClock /> Chờ xử lý</span>;
            case 'failed':
                return <span className="status-badge status-badge--failed"><FaTimesCircle /> Thất bại</span>;
            default:
                return <span className="status-badge status-badge--unknown">{status}</span>;
        }
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
        <div className="transaction-stats">
            {/* Header */}
            <div className="transaction-stats__header">
                <div className="header-title">
                    <h2>Quản Lý Giao Dịch</h2>
                    <p>Xem, tra cứu và xuất báo cáo lịch sử giao dịch toàn hệ thống</p>
                </div>
                <button 
                    className="export-btn" 
                    onClick={handleExportExcel}
                    disabled={isExporting}
                    style={{ opacity: isExporting ? 0.6 : 1 }}
                >
                    <FaDownload /> {isExporting ? "Đang xuất..." : "Xuất File Excel"}
                </button>
            </div>

            {/* Thanh công cụ: Tìm kiếm & Bộ lọc */}
            <div className="transaction-stats__toolbar">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Tìm theo Mã GD, Tên hoặc Email khách hàng..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-box">
                    <FaFilter className="filter-icon" />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="successful">Thành công</option>
                        <option value="pending">Đang xử lý</option>
                        <option value="failed">Thất bại</option>
                    </select>
                </div>
            </div>

            {/* Bảng danh sách */}
            <div className="transaction-stats__table-wrapper">
                <table className="transaction-table">
                    <thead>
                        <tr>
                            <th>Mã Giao Dịch</th>
                            <th>Khách Hàng</th>
                            <th>Gói Hội Viên</th>
                            <th>Số Tiền</th>
                            <th>Thời Gian Giao Dịch</th>
                            <th>Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="empty-row">Không tìm thấy lịch sử giao dịch nào phù hợp.</td>
                            </tr>
                        ) : (
                            transactions.map((tx) => (
                                <tr key={tx.id}>
                                    <td><span className="tx-code">#{tx.order_id || tx.id}</span></td>
                                    <td>
                                        <div className="user-info">
                                            <strong>{tx.user?.name || 'Ẩn danh'}</strong>
                                            <span>{tx.user?.email || '---'}</span>
                                        </div>
                                    </td>
                                    <td><span className="membership-plan">{tx.membership_plan?.name || tx.plan_name || 'Gói VIP'}</span></td>
                                    <td><strong className="tx-amount">{formatVND(tx.amount)}</strong></td>
                                    <td><span className="tx-time">{formatDate(tx.created_at)}</span></td>
                                    <td>{renderStatusBadge(tx.status)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Phân trang (Nếu Laravel dùng Paginate) */}
            {pagination && pagination.last_page > 1 && (
                <div className="transaction-stats__pagination">
                    <button 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        Trước
                    </button>
                    <span>Trang {currentPage} / {pagination.last_page}</span>
                    <button 
                        disabled={currentPage === pagination.last_page} 
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
};

export default TransactionStatistics;