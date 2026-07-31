import React, { useState } from 'react';
import { FaCalendarAlt, FaDollarSign, FaArrowUp, FaArrowDown, FaDownload, FaChartLine } from 'react-icons/fa';
import { useGetAdminRevenueStats } from 'api/homePage'; 
import { exportRevenueExcelAPI } from 'api/homePage'; // Nhớ import thêm hàm export từ file request của Dũng nhé
import './style.scss';
import { getAdminInfo } from 'utils/adminAuth';

const RevenueStatistics = () => {
    const [selectedYear, setSelectedYear] = useState('2026');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [isExporting, setIsExporting] = useState(false); // Trạng thái đợi xuất file
    const adminInfo = getAdminInfo();
    const isAdmin = adminInfo?.role === "admin";

    // Gọi API lấy dữ liệu thật từ Laravel theo Năm đang chọn
    const { data: response, isLoading, isError } = useGetAdminRevenueStats(selectedYear, {enabled: isAdmin});

    // Hàm xử lý hành động click xuất file Excel
    const handleExportExcel = async () => {
        try {
            setIsExporting(true);
            const res = await exportRevenueExcelAPI(selectedYear, selectedMonth);
            
            // 🎯 THAY DÒNG NÀY: Truyền trực tiếp res thay vì res.data
            const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            const fileName = selectedMonth === 'all' 
                ? `Bao_Cao_Doanh_Thu_Nam_${selectedYear}.xls`
                : `Bao_Cao_Doanh_Thu_Thang_${selectedMonth}_Nam_${selectedYear}.xls`;
                
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert("Lỗi xuất file Excel!");
            console.error(error);
        } finally {
            setIsExporting(false);
        }
    };

    const formatVND = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    if (isLoading) return <div style={{ padding: '24px', color: '#666' }}>Đang tổng hợp dữ liệu doanh thu...</div>;
    if (isError) return <div style={{ padding: '24px', color: 'red' }}>Lỗi tải dữ liệu doanh thu từ hệ thống!</div>;

    // Lấy data sạch từ cấu trúc API Laravel trả về
    const summary = response?.data?.summary || { total_year: 0, total_month: 0, growth_rate: 0, is_positive: true };
    const allMonths = response?.data?.months || [];

    // Bộ lọc tháng ở phía Client giao diện
    const filteredMonths = allMonths.filter((item, index) => {
        if (selectedMonth === 'all') return true;
        return (index + 1) === parseInt(selectedMonth);
    });

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
        <div className="revenue-stats">
            {/* Header */}
            <div className="revenue-stats__header">
                <div className="header-title">
                    <h2>Thống Kê Doanh Thu</h2>
                    <p>Theo dõi và phân tích doanh thu từ các gói Membership theo mốc thời gian</p>
                </div>
                
                {/* Nút xuất báo cáo Excel */}
                <button 
                    className="export-btn" 
                    onClick={handleExportExcel} 
                    disabled={isExporting}
                    style={{ 
                        opacity: isExporting ? 0.6 : 1, 
                        cursor: isExporting ? 'not-allowed' : 'pointer' 
                    }}
                >
                    <FaDownload /> {isExporting ? "Đang xuất file..." : "Xuất Báo Cáo Excel"}
                </button>
            </div>

            {/* Thống kê dạng Card */}
            <div className="revenue-stats__overview">
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--year"><FaDollarSign /></div>
                    <div className="stat-card__info">
                        <span>Doanh thu năm {selectedYear}</span>
                        <h3>{formatVND(summary.total_year)}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--month"><FaChartLine /></div>
                    <div className="stat-card__info">
                        <span>Doanh thu tháng này</span>
                        <h3>{formatVND(summary.total_month)}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--growth">
                        {summary.is_positive ? <FaArrowUp color="#2ecc71" /> : <FaArrowDown color="#e74c3c" />}
                    </div>
                    <div className="stat-card__info">
                        <span>Tăng trưởng (so tháng trước)</span>
                        <h3 className={summary.is_positive ? "text-success" : "text-danger"}>
                            {summary.is_positive ? "+" : "-"}{summary.growth_rate}%
                        </h3>
                    </div>
                </div>
            </div>

            {/* Bộ lọc thời gian */}
            <div className="revenue-stats__filter-bar">
                <div className="filter-title">
                    <FaCalendarAlt /> <span>Bộ lọc thời gian</span>
                </div>
                <div className="filter-controls">
                    <select className="filter-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        <option value="2026">Năm 2026</option>
                        <option value="2025">Năm 2025</option>
                    </select>
                    <select className="filter-select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                        <option value="all">Tất cả các tháng</option>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Bảng hiển thị dữ liệu */}
            <div className="revenue-stats__table-wrapper">
                <table className="revenue-table">
                    <thead>
                        <tr>
                            <th>Thời gian</th>
                            <th>Số lượt giao dịch (Thành công)</th>
                            <th>Doanh thu đạt được</th>
                            <th>Xu hướng biến động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMonths.map((item, index) => (
                            <tr key={index}>
                                <td><span className="month-label">{item.month}</span></td>
                                <td><strong>{item.transactions}</strong> lượt đăng ký</td>
                                <td><span className="revenue-amount">{formatVND(item.revenue)}</span></td>
                                <td>
                                    <span className={`trend-badge trend-badge--${item.is_up ? 'up' : 'down'}`}>
                                        {item.is_up ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(item.growth)}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RevenueStatistics;