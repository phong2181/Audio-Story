import React, { useState, useEffect } from 'react';
import { useGetAdminNotificationDetail, useUpdateAdminNotification } from 'api/homePage'; 
import './style.scss';
import { getAdminInfo } from 'utils/adminAuth';

const Notification = ({ notificationId }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isActive, setIsActive] = useState(false);
    const adminInfo = getAdminInfo();

    // 🚀 1. Sử dụng useQuery Hook để tự động lấy dữ liệu chi tiết từ Laravel
    const isAdmin = adminInfo?.role === "admin";

    const {
        data: resDetail,
        isLoading,
        isError
    } = useGetAdminNotificationDetail({
        enabled: isAdmin
    });
    
    // 🚀 2. Sử dụng useMutation Hook để quản lý luồng cập nhật/gửi dữ liệu
    const updateMutation = useUpdateAdminNotification();

    // Đổ dữ liệu cũ vào Form khi React Query đã fetch thành công từ Server về
    useEffect(() => {
        if (resDetail?.success && resDetail?.data) {
            const noti = resDetail.data;
            setTitle(noti.title);
            setContent(noti.content);
            setIsActive(!!noti.is_active);
        }
    }, [resDetail]);

    // Hàm xử lý khi Admin bấm Submit Form
    const handleUpdate = (e) => {
        e.preventDefault();
        
        updateMutation.mutate({
            data: { 
                title: title, 
                content: content, 
                is_active: isActive ? 1 : 0 
            }
        }, {
            onSuccess: (res) => {
                if (res.success) {
                    alert("Đã cập nhật thông báo thành công!");
                }
            },
            onError: (error) => {
                alert("Gặp lỗi khi cập nhật rồi Dũng ơi!");
                console.error(error);
            }
        });
    };

    // Hiển thị trạng thái chờ trong lúc React Query đang tải dữ liệu cũ
    if (isLoading) return <div className="admin-noti-loading">Đang tải chi tiết thông báo...</div>;
    if (isError) return <div className="admin-noti-error">Lỗi tải dữ liệu thông báo từ hệ thống!</div>;
    if (adminInfo?.role === "staff") {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "60vh",
                    flexDirection: "column"
                }}
            >
                <h2>🚫 Truy cập bị từ chối</h2>
                <p>Bạn không có quyền truy cập.</p>
            </div>
        );
    }
    return (
        <form onSubmit={handleUpdate} className="admin-form-noti">
            <h3>Chỉnh Sửa Thông Báo Hệ Thống</h3>
            
            <div className="form-group">
                <label>Tiêu đề thông báo:</label>
                <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                />
            </div>

            <div className="form-group">
                <label>Nội dung hiển thị:</label>
                <textarea 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    rows="5"
                    required
                />
            </div>

            <div className="form-group form-inline">
                <input 
                    type="checkbox" 
                    id="isActiveCheck"
                    checked={isActive} 
                    onChange={(e) => setIsActive(e.target.checked)} 
                />
                <label htmlFor="isActiveCheck">Kích hoạt hiển thị cho Client</label>
            </div>

            {/* 🎯 SỬA: Dùng thuộc tính .isPending của Mutation để làm mờ nút/chống spam click */}
            <button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Đang lưu..." : "Cập Nhật Ngay"}
            </button>
        </form>
    );
};

export default Notification;