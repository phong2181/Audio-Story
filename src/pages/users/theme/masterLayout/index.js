import { memo } from 'react';
import Header from '../Header';
import Footer from '../Footer';
import PullToRefresh from '../PullToRefresh';
import AnnouncementModal from 'pages/users/GlobalNotification';
import { useGetActiveNotification } from 'api/homePage'; 

const MasterLayout = ({ children, ...props }) => {
    const { data: resNotification, isLoading } = useGetActiveNotification();

    // 🚀 Đoạn bẫy lỗi bóc tách:
    // Nếu trong file cấu hình axios của bạn đã tự .data rồi, thì resNotification chính là { success: true, data: {...} }
    // Còn nếu chưa, thì resNotification.data mới là { success: true, data: {...} }
    let realData = null;
    if (resNotification) {
        if (resNotification.success && resNotification.data) {
            realData = resNotification.data; // Trường hợp axios đã filter sẵn
        } else if (resNotification.data?.success) {
            realData = resNotification.data.data; // Trường hợp chuẩn bọc qua axios
        }
    }

    // Ép kiểu kiểm tra trạng thái hoạt động gọn gàng
    const isActive = realData && (realData.is_active === 1 || realData.is_active === true || realData.is_active === "1");

    return (
        
            <div className="app-layout" {...props}>
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