import axiosinstance from "../axios";
import { useQuery } from "@tanstack/react-query";

const END_POINT = {
    ADDNEWPOST: "/admin/addnewposts",
    CATEGORY: "/admin/category",
    SLIDER: "/admin/sliders",
    FOOTER: "/admin/footer",
    LOGIN: "/admin/login",
    PROFILE: "/admin/profile",
    UPLOAD_AVATAR: "/admin/profile/avatar",
    CHANGE_PASSWORD: "/admin/profile/change-password",
    USERS: "/admin/users",
    MEMBERSHIP: "/membership-plans",
    STOR_MEMBERSHIP: "/admin/store/membership-plans",
    DELETE_MEMBERSHIP: "/admin/delete/membership-plans",
    
};

const END_POINT_USER = {
    REGISTER: "/register",
    LOGIN: "/login",
    UPDATE_PROFILE: "/profile/update",
    
};

export const postForgotPasswordSendCodeAPI = async (email) => {
    return await axiosinstance({
        method: "POST",
        url: "/forgot-password/send-code",
        data: { email }
    });
};

export const postForgotPasswordVerifyCodeAPI = async (email, code) => {
    return await axiosinstance({
        method: "POST",
        url: "/forgot-password/verify-code",
        data: { email, code }
    });
};

export const postForgotPasswordResetAPI = async (data) => {
    return await axiosinstance({
        method: "POST",
        url: "/forgot-password/reset",
        data: data // Gồm: email, code, password, password_confirmation
    });
};

export const deleteChapterAPI = async (id) => {
    const token = localStorage.getItem("ADMIN_TOKEN"); // Hoặc ACCESS_TOKEN tùy dự án của bạn
    return await axiosinstance({
        method: "DELETE",
        url: `/admin/chapters/delete/${id}`, // Căn chỉnh url chính xác theo route của bạn
        headers: { "Authorization": `Bearer ${token}` }
    });
};

// 🚀 Thêm API lấy chi tiết 1 thông báo hệ thống để sửa (Admin)
export const getAdminNotificationDetailAPI = async (id) => {
    const token = localStorage.getItem("ADMIN_TOKEN"); // hoặc adminToken tùy dự án của Dũng
    return await axiosinstance({
        method: "GET",
        url: `/system-notification`,
        headers: { "Authorization": `Bearer ${token}` }
    });
};

// 🚀 Thêm API cập nhật nội dung thông báo hệ thống (Admin)
export const updateAdminNotificationAPI = async ({ id, data }) => {
    const token = localStorage.getItem("ADMIN_TOKEN");
    return await axiosinstance({
        method: "PUT",
        url: `/admin/system-notification/${id}`,
        data: data,
        headers: { "Authorization": `Bearer ${token}` }
    });
};

// 🎯 ĐẢM BẢO CÓ CHỮ RETURN Ở ĐÂY
export const getActiveNotificationAPI = async () => {
    return await axiosinstance({
        method: "GET",
        url: "/system-notification",
    });
};

export const exportTransactionExcelAPI = async (status) => {
    const token = localStorage.getItem("ADMIN_TOKEN");
    return await axiosinstance({
        method: "GET",
        url: `/admin/transactions-export?status=${status}`, // 🚀 Đường dẫn endpoint backend tí nữa mình viết
        responseType: 'blob', // Ép kiểu nhận file nhị phân
        headers: { "Authorization": `Bearer ${token}` }
    });
};
// Sửa lại hàm này trong file api/homePage.js của Dũng:
export const exportRevenueExcelAPI = async (year, month) => {
    const token = localStorage.getItem("ADMIN_TOKEN");
    return await axiosinstance({
        method: "GET",
        url: `/admin/revenue-export?year=${year}&month=${month}`,
        responseType: 'blob', // 🚀 BẮT BUỘC nằm ở đây để Axios hiểu cần nhận Stream File nhị phân
        headers: { 
            "Authorization": `Bearer ${token}` 
        }
    });
};

export const getAdminRevenueStatsAPI = async (year) => {
    const token = localStorage.getItem("ADMIN_TOKEN");
    return await axiosinstance({
        method: "GET",
        url: `/admin/revenue-statistics?year=${year}`, // Truyền Year lên Query String
        headers: { "Authorization": `Bearer ${token}` }
    });
};

export const getAdminDashboardStatsAPI = async () => {
    return await axiosinstance({
        method: "GET",
        url: "/admin/dashboard-stats",
    });
};

export const getDashboardRecentContentsAPI = async (cursor, perPage = 10) => {
    const params = { per_page: perPage };
    if (cursor) params.cursor = cursor;
    return await axiosinstance({
        method: "GET",
        url: "/admin/dashboard/recent-contents",
        params,
    });
};

export const getDashboardActivityLogAPI = async (cursor, perPage = 10) => {
    const params = { per_page: perPage };
    if (cursor) params.cursor = cursor;
    return await axiosinstance({
        method: "GET",
        url: "/admin/dashboard/activity-log",
        params,
    });
};

// API tạo yêu cầu thanh toán (Client) - BỎ HEADERS THỦ CÔNG
export const postCreatePaymentAPI = async (data) => {
    return await axiosinstance({
        method: "POST",
        url: "/payment/create", // Đường dẫn chuẩn chạy thẳng không qua client
        data: data,
        // TUYỆT ĐỐI KHÔNG viết headers thủ công ở đây để Interceptor toàn cục tự đính kèm Token chuẩn
    });
};

export const getMembershipPlansClientAPI = async () => {
    return await axiosinstance({
        method: "GET",
        url: "/membership-plans", 
    });
};

// API Lấy danh sách gói
export const getMembershipPlansAPI = async () => {
    return await axiosinstance({
        method: "GET",
        url: END_POINT.MEMBERSHIP,
    });
};

// API Tạo gói mới
export const postMembershipPlanAPI = async (data) => {
    return await axiosinstance({
        method: "POST",
        url: END_POINT.STOR_MEMBERSHIP,
        data: data,
    });
};

// API Xóa gói
export const deleteMembershipPlanAPI = async (id) => {
    return await axiosinstance({
        method: "DELETE",
        url: `${END_POINT.DELETE_MEMBERSHIP}/${id}`,
    });
};

// Nếu hàm cũ của bạn chưa hỗ trợ params, hãy sửa lại dạng này:
export const getAddNewPostsADAPI = async (params) => {
    const token = localStorage.getItem("adminToken");
    return await axiosinstance({
        method: "GET",
        url: "/admin/addnewposts", // Khớp với END_POINT.ADDNEWPOST của bạn
        params: params, // Giúp truyền ?status=draft hoặc ?search=... lên Laravel
        headers: { Authorization: `Bearer ${token}` }
    });
};

// 1. Sửa hàm lấy chi tiết bài viết
export const getPostDetailAPI = async (id) => {
    const token = localStorage.getItem("adminToken");
    return await axiosinstance({
        method: "GET",
        url: `/admin/addnewposts/${id}`, // Đổi từ /admin/addnewposts/${id} thành /admin/posts/${id}
        headers: { Authorization: `Bearer ${token}` }
    });
};

// 2. Sửa hàm cập nhật bài viết
export const getUpdetePostAPI = async (id, data) => {
    const token = localStorage.getItem("adminToken");
    return await axiosinstance({
        method: "POST", // POST + _method: PUT
        url: `/admin/addnewposts/${id}`, // Đổi từ /admin/addnewposts/${id} thành /admin/posts/${id}
        headers: { Authorization: `Bearer ${token}` },
        data
    });
};

// 3. Sửa hàm xoá bài viết
export const getdeletePostAPI = async (id) => {
    const token = localStorage.getItem("adminToken");
    return await axiosinstance({
        method: "DELETE",
        url: `/admin/addnewposts/${id}`, // Giữ nguyên hoặc khớp với api.php
        headers: { Authorization: `Bearer ${token}` }
    });
};

// Lấy comments theo story
export const getCommentsAPI = async (storyId) => {
    return await axiosinstance({
        method: "GET",
        url: `/comments/${storyId}`,
    });
};
 
// Thêm comment hoặc reply
export const addCommentAPI = async (data) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    return await axiosinstance({
        method: "POST",
        url: "/comments",
        data,
        headers: { "Authorization": `Bearer ${token}` }
    });
};
 
// Sửa comment
export const updateCommentAPI = async (id, content) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    return await axiosinstance({
        method: "PUT",
        url: `/comments/${id}`,
        data: { content },
        headers: { "Authorization": `Bearer ${token}` }
    });
};
 
// Xóa comment
export const deleteCommentAPI = async (id) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    return await axiosinstance({
        method: "DELETE",
        url: `/comments/${id}`,
        headers: { "Authorization": `Bearer ${token}` }
    });
};
 
// Like comment
export const likeCommentAPI = async (id) => {
    const res = await axiosinstance.post(`/comments/${id}/like`);
    return res;
};

// Hooks
export const useGetComments = (storyId) => {
    return useQuery({
        queryKey: ["comments", storyId],
        queryFn: () => getCommentsAPI(storyId),
        enabled: !!storyId,
    });
};



// API Lấy lịch sử gần đây của người dùng
export const getRecentHistoryAPI = async () => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    return await axiosinstance({
        method: "GET",
        url: "/client/history",
        headers: {
            "Accept": "application/json", // Bắt lỗi chính xác
            "Authorization": `Bearer ${token}`
        }
    });
};

// API Lấy lịch sử hoạt động đầy đủ của người dùng
export const getUserActivityHistoryAPI = async () => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    return await axiosinstance({
        method: "GET",
        url: "/client/activity-history",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
};

// API Lưu lịch sử người dùng
export const saveUserHistoryAPI = async (data) => {
    const token = localStorage.getItem("ACCESS_TOKEN"); // Hoặc ACCESS_TOKEN của bạn
    return await axiosinstance({
        method: "POST",
        url: "/client/history", // Trùng với route bạn định nghĩa
        data: data,
        headers: {
            "Accept": "application/json", // Thêm Accept header
            "Authorization": `Bearer ${token}`
        }
    });
};

// request.js
export const updateProfileAPI = async (formData) => {
    // 1. Lấy token từ LocalStorage (Bạn hãy thay đổi key cho đúng với dự án, ví dụ: 'token' hoặc 'access_token')
    const token = localStorage.getItem("ACCESS_TOKEN"); 

    return await axiosinstance({
        method: "POST",
        url: END_POINT_USER.UPDATE_PROFILE,
        data: formData,
        headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}` 
        },
    });
};

export const postRegisterAPI = async (data) => {
    return await axiosinstance({
        method: "POST",
        url: END_POINT_USER.REGISTER,
        data: data,
    });
}

export const postLoginUserAPI = async (data) => {
    return await axiosinstance({
        method: "POST",
        url: END_POINT_USER.LOGIN,
        data: data,
    });
}

//API Lấy danh mục hiện ra
export const getCategoriesAPI = async () => {
    return await axiosinstance({
        method: "GET",
        url: END_POINT.CATEGORY,
    })
}

//API Tạo danh mục mới
export const postCategoryAPI = async (data) => {
    return await axiosinstance({
        method: "POST",
        url: END_POINT.CATEGORY,
        data: data,
    });
};

// API Sửa danh mục
export const updateCategoryAPI = async (id, data) => {
    return await axiosinstance({
        method: "PUT", // Hoặc PATCH tùy Route Laravel của Dũng
        url: `${END_POINT.CATEGORY}/${id}`,
        data: data,
    });
};

// API Xóa danh mục
export const deleteCategoryAPI = async (id) => {
    return await axiosinstance({
        method: "DELETE",
        url: `${END_POINT.CATEGORY}/${id}`,
    });
};

//API Tạo bài viết mới
export const postAddnewPostAPI = async (data) => {
    return await axiosinstance({
        method: "POST",
        url: END_POINT.ADDNEWPOST,
        data: data,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

// API Lấy danh sách footer
export const getFootersAPI = async () => {
    return await axiosinstance({
        method: "GET",
        url: END_POINT.FOOTER,
    });
};

// API Thêm footer mới
export const postFooterAPI = async (data) => {
    return await axiosinstance({
        method: "POST",
        url: END_POINT.FOOTER,
        data: data,
    });
};

// API Sửa footer
export const updateFooterAPI = async (id, data) => {
    return await axiosinstance({
        method: "PUT",
        url: `${END_POINT.FOOTER}/${id}`,
        data: data,
    });
};

// API Xóa footer
export const deleteFooterAPI = async (id) => {
    return await axiosinstance({
        method: "DELETE",
        url: `${END_POINT.FOOTER}/${id}`,
    });
};


// File request.js
export const postLoginAdminAPI = async (data) => { // Đổi tên cho đúng bản chất POST và nhận data
    return await axiosinstance({
        method: "POST",
        url: END_POINT.LOGIN,
        data: data, // Bắt buộc phải có dòng này để gửi email/password lên Laravel
    });
}

// Trong file request.js
export const getUsersAPI = async () => {
    return await axiosinstance({
        method: "GET",
        url: "/admin/users", // Đảm bảo bạn đã tạo Route này bên Laravel
    });
};

export const uploadAvatarAPI = async (formData) => {
    return await axiosinstance({
        method: "POST",
        url: END_POINT.UPLOAD_AVATAR,
        data: formData,
        headers: {
            "Content-Type": "multipart/form-data", // Quan trọng để gửi file
        },
    });
};

// API Đổi mật khẩu
export const changePasswordAPI = async (data) => {
    return await axiosinstance({
        method: "POST",
        url: END_POINT.CHANGE_PASSWORD,
        data: data,
    });
};

// API tạo nhân viên mới
export const postAddUserAPI = async (data) => {
    return await axiosinstance({
        method: "POST",
        url: END_POINT.USERS,
        data: data,
    });
};

// API Cập nhật thông tin người dùng
export const updateUserAPI = async (id, data) => {
    return await axiosinstance({
        method: "PUT",
        url: `/admin/users/${id}`,
        data: data,
    });
};

// API Lấy danh sách thể loại
export const getCategoriesAudioAPI = async () => {
    try {
        const response = await axiosinstance({
            method: "GET",
            url: "/categories",
        });
        console.log('Categories API response:', response);
        return response;
    } catch (error) {
        console.error('Categories API error:', error);
        throw error;
    }
};

// API Thêm mới thể loại
export const addCategoryAudioAPI = async (data) => {
    return await axiosinstance({
        method: "POST",
        url: "/admin/categories",
        data: data,
    });
};

// API Cập nhật thể loại
export const updateCategoryAudioAPI = async (id, data) => {
    return await axiosinstance({
        method: "PUT",
        url: `/admin/categories/${id}`,
        data: data,
    });
};

// API Xóa thể loại
export const deleteCategoryAudioAPI = async (id) => {
    return await axiosinstance({
        method: "DELETE",
        url: `/admin/categories/${id}`,
    });
};

// Thêm mới truyện (Phải dùng FormData)
export const addStoryAPI = async (formData) => {
    return await axiosinstance({
        method: "POST",
        url: "/admin/stories",
        data: formData, // Đây là đối tượng FormData
        headers: { "Content-Type": "multipart/form-data" }, 
    });
};

// Cập nhật truyện
export const updateStoryAPI = async (id, formData) => {
    return await axiosinstance({
        method: "POST", // Mẹo: Dùng POST kèm _method=PUT để Laravel nhận File dễ hơn
        url: `/admin/stories/${id}`,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
    });
};

// API lấy danh sách truyện (Dũng nhớ check lại tên function bên request.js nhé)
export const getStoriesAPI = async () => {
    return await axiosinstance({
        method: "GET",
        url: "/admin/stories",
    });
};

// API xóa truyện
export const deleteStoryAPI = async (id) => {
    return await axiosinstance({
        method: "DELETE",
        url: `/admin/stories/${id}`,
    });
};

// Lấy danh sách chương theo bộ truyện
export const getChaptersByStoryAPI = async (storyId) => {
    return await axiosinstance({
        method: "GET",
        url: `/chapters/list/${storyId}`,
    });
};

// =========================================================================
// TTS (Piper) - Backend
// =========================================================================

// Lấy danh sách giọng đọc từ backend (quét model trong storage/app/tts/models)
export const getTTSVoicesAPI = async () => {
    const token = localStorage.getItem("adminToken");
    return await axiosinstance({
        method: "GET",
        url: "/admin/tts/voices",
        headers: { "Authorization": `Bearer ${token}` },
    });
};

// Gọi backend sinh audio từ text + voice. Trả về Blob binary (WAV).
// - isPreview=1 → POST /admin/tts/preview  (nghe thử, cắt 300 ký tự)
// - isPreview=0 → POST /admin/tts/synthesize (toàn bộ văn bản)
export const generateTTSAudioAPI = async ({ text, model, speed, isPreview = 0, background_music_id = null, bg_volume = 15 }) => {
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("text", text);
    formData.append("voice", model); // Backend nhận field "voice", không phải "model"
    formData.append("speed", speed || 1.0);
    formData.append("is_preview", isPreview);

    // Nhạc nền (tùy chọn) - trộn vào file giọng đọc
if (background_music_id) {
        formData.append("background_music_id", background_music_id);
        formData.append("bg_volume", bg_volume || 15);
    }

    // Chọn endpoint đúng: preview (nghe thử) hoặc synthesize (sinh đầy đủ)
    const endpoint = isPreview ? "/admin/tts/preview" : "/admin/tts/synthesize";

    return await axiosinstance({
        method: "POST",
        url: endpoint,
        data: formData,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
        // TTS (Piper) chạy local nên mất nhiều thời gian hơn các request thường.
        // Ghi đè timeout mặc định 20s -> 5 phút để tránh lỗi "timeout of 20000ms exceeded".
        timeout: 300000,
        // Cho phép nhận file audio lớn (blob WAV) trả về từ backend.
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
    });
};
// =========================================================================
// END TTS
// =========================================================================

// Đăng chương audio mới
export const addChapterAPI = async (formData) => {
    return await axiosinstance({
        method: "POST",
        url: "chapters/add",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
    });
};

    
// Lấy chi tiết truyện kèm theo các chương
export const getChapterDetailAPI = async (id) => {
    return await axiosinstance({
        method: "GET",
        url: `chapters/${id}`,
    });
};

export const getCategoriesAudioUserClientAPI = async () => {
    return await axiosinstance({
        method: "GET",
        url: "/categories",
    });
};

export const getStoriesClientAPI = async () => {
    return await axiosinstance({
        method: "GET",
        url: "/stories",
    });
};

export const getStoryDetailClientAPI = async (identifier) => {
    return await axiosinstance({
        method: "GET",
        url: `/stories/${identifier}`,
    });
};

export const getChaptersByStoryClientAPI = async (storyId) => {
    return await axiosinstance({
        method: "GET",
        url: `/chapters/list/${storyId}`,
    });
};

// File request.js
export const getChapterDetailClientAPI = async (id) => {
    try {
        const token = localStorage.getItem("ACCESS_TOKEN");
        const res = await axiosinstance({
            method: "GET",
            url: `/chapters/detail/${id}`,
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        // Đảm bảo trả về object chứa dữ liệu, nếu không có thì trả về object rỗng
        return res?.data || { data: {} };
    } catch (error) {
        console.error("API Error:", error);
        // Trả về object rỗng để React Query có dữ liệu hợp lệ
        return { data: {} }; 
    }
};

// API Reviews
export const getReviewsAPI = async (storyId) => {
    return await axiosinstance({
        method: "GET",
        url: `/reviews?story_id=${storyId}`
    });
};

export const addReviewAPI = async (data) => {
    return await axiosinstance({
        method: "POST",
        url: "/reviews",
        data
    });
};

export const updateReviewAPI = async (id, data) => {
    return await axiosinstance({
        method: "PUT",
        url: `/reviews/${id}`,
        data
    });
};

export const deleteReviewAPI = async (id) => {
    return await axiosinstance({
        method: "DELETE",
        url: `/reviews/${id}`
    });
};

// API Favorites
export const getFavoritesAPI = async () => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    return await axiosinstance({
        method: "GET",
        url: "/favorites",
        headers: { "Authorization": `Bearer ${token}` }
    });
};

export const addFavoriteAPI = async (data) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    return await axiosinstance({
        method: "POST",
        url: "/favorites",
        data,
        headers: { "Authorization": `Bearer ${token}` }
    });
};

export const removeFavoriteAPI = async (storyId) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    return await axiosinstance({
        method: "DELETE",
        url: `/favorites/${storyId}`,
        headers: { "Authorization": `Bearer ${token}` }
    });
};

export const checkFavoriteAPI = async (storyId) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    return await axiosinstance({
        method: "GET",
        url: `/favorites/check/${storyId}`,
        headers: { "Authorization": `Bearer ${token}` }
    });
}

// API Lấy toàn bộ chương của tất cả bộ truyện từ backend
export const getAllChaptersClientAPI = async () => {
    return await axiosinstance({
        method: "GET",
        url: "/chapters/all", // Đảm bảo khớp với route bạn định nghĩa ở Laravel api.php
    });
};

// API lấy danh sách bài viết công khai dành cho Client
export const getClientPostsAPI = async () => {
    return await axiosinstance({
        method: "GET",
        url: "/client/posts", // Gọi tới Route công khai vừa tạo ở trên
    });
};

// API lấy danh mục bài viết công khai dành cho Client
export const getClientPostCategoriesAPI = async () => {
    return await axiosinstance({
        method: "GET",
        url: "/client/post-categories",
    });
};

// Thêm vào cuối file api/homePage/request.js của bạn

export const updateProfileAdminAPI = async (formData) => {
    const token = localStorage.getItem("ACCESS_TOKEN"); // Hoặc dùng getAdminToken() tùy dự án của bạn
    return await axiosinstance({
        method: "POST",
        url: "/admin/update-profile", // Khớp chính xác với cấu trúc route ở Laravel api.php
        data: formData,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // Bắt buộc khi truyền file nhị phân kèm text
        }
    });
};

export const getAuthorContentAPI = async () => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    return await axiosinstance({
        method: "GET",
        url: "/admin/author-content",
        headers: { "Authorization": `Bearer ${token}` }
    });
};

export const getPublicAuthorProfileAPI = async (authorName) => {
    // Không cần gửi token vì đây là trang công khai (Client)
    return await axiosinstance({
        method: "GET",
        url: `/author/${encodeURIComponent(authorName)}/profile`
    });
};

// =========================================================================
// Background Music (Nhạc nền) - Quản lý
// =========================================================================

// Lấy danh sách nhạc nền (Admin)
export const getBackgroundMusicsAPI = async () => {
    const token = localStorage.getItem("adminToken");
    return await axiosinstance({
        method: "GET",
        url: "/admin/background-musics",
        headers: { "Authorization": `Bearer ${token}` }
    });
};

// Upload nhạc nền mới (Chỉ Admin)
export const addBackgroundMusicAPI = async (formData) => {
    const token = localStorage.getItem("adminToken");
    return await axiosinstance({
        method: "POST",
        url: "/admin/background-musics",
        data: formData,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
    });
};

// Xóa nhạc nền (Chỉ Admin)
export const deleteBackgroundMusicAPI = async (id) => {
    const token = localStorage.getItem("adminToken");
    return await axiosinstance({
        method: "DELETE",
        url: `/admin/background-musics/${id}`,
        headers: { "Authorization": `Bearer ${token}` }
    });
};

// Lấy danh sách nhạc nền công khai (Client)
export const getBackgroundMusicsPublicAPI = async () => {
    return await axiosinstance({
        method: "GET",
        url: "/background-musics"
    });
};

//file request.js
export const getActiveUser = async () => {
    const token = localStorage.getItem("adminToken");
    const response = await axiosinstance({
        method: "GET",
        url: "/admin/users/active",
        headers: {"Authorization": `Bearer ${token}`},
    });
    return response;
}

export const getAdminMembershipsAPI = async () => {
    try {
        const token = localStorage.getItem("adminToken");

        const res = await axiosinstance({
            method: "GET",
            url: "/admin/memberships",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return res.data || { data: [], statistics: {} };
    } catch (error) {
        console.error("API error:", error);
        return { data: [], statistics: {} };
    }
};

export const getActiveMember = async (id, data) => {
    return await axiosinstance({
        method: "PUT",
        url: `/admin/users/${id}/active-membership`,
        data: data,
    });
}