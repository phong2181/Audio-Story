import { memo } from 'react';
import Header from '../Header';
import Footer from '../Footer';
import PullToRefresh from '../PullToRefresh';
import AnnouncementModal from 'pages/users/GlobalNotification';
import WPAdminBar from 'components/WPAdminBar';
import SeasonalEffect from 'components/SeasonalEffect';
import MaintenanceScreen from 'components/MaintenanceScreen';
import { useQuery } from '@tanstack/react-query';
import { getActiveNotificationAPI } from 'api/homePage/request'; 
import { useGetMaintenanceStatus } from 'api/homePage';
import { isAdminLoggedIn } from 'utils/adminAuth';

const MasterLayout = ({ children, ...props }) => {
    // 1. Kiểm tra trạng thái bảo trì hệ thống
    const { data: resMaintenance } = useGetMaintenanceStatus();

    // 2. Lấy thông báo hệ thống (banner thông báo)
    const { data: resNotification, isLoading } = useQuery({
        queryKey: ["activeNotification"],
        queryFn: getActiveNotificationAPI,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    let maintenanceData = null;
    if (resMaintenance) {
        if (resMaintenance.data?.is_active_now !== undefined) {
            maintenanceData = resMaintenance.data;
        } else if (resMaintenance.data?.data) {
            maintenanceData = resMaintenance.data.data;
        }
    }

    const isUnderMaintenance = maintenanceData && (maintenanceData.is_active_now || maintenanceData.is_maintenance);
    const isAdmin = isAdminLoggedIn();

    // Nếu đang bảo trì và KHÔNG PHẢI là Admin: Ẩn toàn bộ nội dung và hiển thị màn hình bảo trì
    if (isUnderMaintenance && !isAdmin) {
        return <MaintenanceScreen data={maintenanceData || {}} />;
    }

    // 🚀 Đoạn bẫy lỗi bóc tách:
    let realData = null;
    if (resNotification) {
        if (resNotification.success && resNotification.data) {
            realData = resNotification.data;
        } else if (resNotification.data?.success) {
            realData = resNotification.data.data;
        }
    }

    const isActive = realData && (realData.is_active === 1 || realData.is_active === true || realData.is_active === "1");

    return (
        <div className="app-layout" {...props}>
            {/* Banner thông báo dành cho Admin khi đang bật bảo trì */}
            {isUnderMaintenance && isAdmin && (
                <div style={{
                    background: "linear-gradient(90deg, #b45309, #d97706)",
                    color: "#ffffff",
                    textAlign: "center",
                    padding: "8px 16px",
                    fontWeight: "700",
                    fontSize: "13px",
                    position: "sticky",
                    top: 0,
                    zIndex: 99999,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                }}>
                    ⚠️ Chế độ Bảo trì đang BẬT (Khóa với người dùng). Bạn đang truy cập với quyền Quản trị viên (Admin).
                </div>
            )}
            <WPAdminBar />
            <SeasonalEffect />
            <Header />
            <PullToRefresh>
            {/* Nếu trong trường hợp có thông báo */}
            {!isLoading && isActive && (
                <AnnouncementModal data={realData} />
            )}
            
            <main className="layout-content">
                {children}
            </main>
            </PullToRefresh>

            <Footer />
        </div>
    );
}

export default memo(MasterLayout);