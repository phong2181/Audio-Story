import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
    postAddnewPostAPI, 
    getCategoriesAPI, 
    postCategoryAPI, 
    updateCategoryAPI, 
    deleteCategoryAPI, 
    getFootersAPI,
    postFooterAPI,
    updateFooterAPI,
    deleteFooterAPI,
    postLoginAdminAPI,
    getUsersAPI,
    postAddUserAPI,
    updateUserAPI,
    getCategoriesAudioAPI,
    addCategoryAudioAPI,
    updateCategoryAudioAPI,
    deleteCategoryAudioAPI,
    getStoriesAPI,
    updateStoryAPI,
    deleteStoryAPI,
    addStoryAPI,
    getChaptersByStoryAPI,
    addChapterAPI,
    getChapterDetailAPI,
    postRegisterAPI,
    postLoginUserAPI,
    updateProfileAPI,
    getCategoriesAudioUserClientAPI,
    getStoriesClientAPI,
    getChaptersByStoryClientAPI,
    getChapterDetailClientAPI,
    saveUserHistoryAPI,
    getRecentHistoryAPI,
    getUserActivityHistoryAPI,
    addCommentAPI,
    updateCommentAPI,
    deleteCommentAPI,
    likeCommentAPI,
    getReviewsAPI,
    addReviewAPI,
    updateReviewAPI,
    deleteReviewAPI,
    getFavoritesAPI,
    addFavoriteAPI,
    removeFavoriteAPI,
    getStoryDetailClientAPI,
    checkFavoriteAPI,
    getAllChaptersClientAPI,
    getClientPostsAPI,
    getClientPostCategoriesAPI,
    getdeletePostAPI,
    getUpdetePostAPI,
    getPostDetailAPI,
    deleteMembershipPlanAPI,
    postMembershipPlanAPI,
    getMembershipPlansAPI,
    getMembershipPlansClientAPI,
    postCreatePaymentAPI,
    getAddNewPostsADAPI,
    getAdminMembershipsAPI,
    getAdminRevenueStatsAPI,
    getActiveNotificationAPI,
    updateAdminNotificationAPI,
    getAdminNotificationDetailAPI,
    deleteChapterAPI,
    postForgotPasswordVerifyCodeAPI,
    postForgotPasswordSendCodeAPI,
    postForgotPasswordResetAPI,
    updateProfileAdminAPI,
    getAuthorContentAPI,
    getPublicAuthorProfileAPI,
    getActiveUser
} from "./request";

// 🚀 Hook gửi mã OTP khôi phục mật khẩu
export const useForgotPasswordSendCode = () => {
    return useMutation({
        mutationFn: (email) => postForgotPasswordSendCodeAPI(email)
    });
};

// 🚀 Hook xác thực mã OTP
export const useForgotPasswordVerifyCode = () => {
    return useMutation({
        mutationFn: ({ email, code }) => postForgotPasswordVerifyCodeAPI(email, code)
    });
};

// 🚀 Hook tiến hành đặt lại mật khẩu mới
export const useForgotPasswordReset = () => {
    return useMutation({
        mutationFn: (data) => postForgotPasswordResetAPI(data)
    });
};

export const useDeleteChapterAD = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteChapterAPI(id),
        onSuccess: () => {
            // Làm tươi lại danh sách chương sau khi xóa thành công
            queryClient.invalidateQueries(["chapters"]); 
        }
    });
};

// 🚀 Hook lấy chi tiết thông báo đổ vào Form Admin
export const useGetAdminNotificationDetail = (id) => {
    return useQuery({
        queryKey: ["adminNotificationDetail", id],
        queryFn: () => getAdminNotificationDetailAPI(id),
        enabled: !!id, // Chỉ tự động chạy khi có id truyền vào
        retry: 1,
        refetchOnWindowFocus: false,
    });
};

// 🚀 Hook xử lý thay đổi nội dung thông báo
export const useUpdateAdminNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateAdminNotificationAPI({ id, data }),
        onSuccess: () => {
            // Làm tươi lại cache ở cả trang Admin lẫn Client
            queryClient.invalidateQueries({ queryKey: ["adminNotificationDetail"] });
            queryClient.invalidateQueries({ queryKey: ["activeNotification"] });
        }
    });
};

// Thêm hook này vào cuối file queries.js
export const useGetActiveNotification = () => {
    return useQuery({
        queryKey: ["activeNotification"],
        queryFn: () => getActiveNotificationAPI(), // Gọi hàm API từ file request.js
        retry: 1,
        refetchOnWindowFocus: false,
    });
};

export const useGetAdminRevenueStats = (year, options = {}) => {
    return useQuery({
        queryKey: ["adminRevenueStats", year],
        queryFn: () => getAdminRevenueStatsAPI(year),
        enabled: options.enabled ?? true,
        retry: 1,
        refetchOnWindowFocus: false,
    });
};

// queries.js
export const useCreatePayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const response = await postCreatePaymentAPI(data);
            return response; // Trả thẳng response (chứa success và payUrl của MoMo) về view
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["userProfile"]);
        }
    });
};

export const useGetMembershipPlansClient = () => {
    return useQuery({
        queryKey: ['GetMembershipPlansClient'],
        queryFn: () => getMembershipPlansClientAPI(),
        retry: 0,
        refetchOnWindowFocus: false,
    });
};

// Hook lấy danh sách gói
export const useGetMembershipPlansAD = () => {
    return useQuery({
        queryKey: ['GetMembershipPlansAPI'],
        queryFn: () => getMembershipPlansAPI(),
        retry: 0,
        refetchOnWindowFocus: false,
    });
};

// Hook thêm mới gói
export const useAddMembershipPlanAD = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => postMembershipPlanAPI(data),
        onSuccess: () => {
            // Tự động làm mới danh sách sau khi thêm thành công
            queryClient.invalidateQueries({ queryKey: ['GetMembershipPlansAPI'] });
        },
    });
};

// Hook xóa gói
export const useDeleteMembershipPlanAD = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteMembershipPlanAPI(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['GetMembershipPlansAPI'] });
        },
    });
};

// Thêm hook này vào cuối file queries.js
export const useGetPostDetail = (id) => {
    return useQuery({
        queryKey: ["postDetail", id],
        queryFn: () => getPostDetailAPI(id),
        enabled: !!id, // Chỉ tự động chạy khi có id truyền vào
        retry: 1,
        refetchOnWindowFocus: false,
    });
};

export const useUptatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => getUpdetePostAPI(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['GetPostsAPI'] });
        }
    });
};

//Hooks xoá bài viết
export const useDeletePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => getdeletePostAPI(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['GetPostsAPI'] });
        }
    });
};

export const useAddComment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => addCommentAPI(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["comments", variables.story_id]
            });
        }
    });
};

export const useUpdateComment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, content, story_id }) =>
            updateCommentAPI(id, content),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["comments", variables.story_id]
            });
        }
    });
};

export const useDeleteComment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }) => deleteCommentAPI(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["comments", variables.story_id]
            });
        }
    });
};

export const useLikeComment = () => {
    return useMutation({
        mutationFn: (id) => likeCommentAPI(id),
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

// Hook lấy lịch sử nghe gần đây của người dùng
export const useGetRecentHistory = () => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    return useQuery({
        queryKey: ["getRecentHistory"],
        queryFn: () => getRecentHistoryAPI(),
        enabled: !!token, // Chỉ gọi API khi có ACCESS_TOKEN
        retry: 0,
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

// Hook lấy lịch sử hoạt động đầy đủ của người dùng
export const useGetUserActivityHistory = () => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    return useQuery({
        queryKey: ["getUserActivityHistory"],
        queryFn: () => getUserActivityHistoryAPI(),
        enabled: !!token,
        retry: 0,
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

// Hook lưu lịch sử nghe của người dùng
export const useSaveUserHistory = () => {
    return useMutation({
        mutationFn: (data) => saveUserHistoryAPI(data),
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

// Hook cập nhật profile
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData) => updateProfileAPI(formData),
        onSuccess: (response) => {
            // Trích xuất thông tin user an toàn, tránh lỗi response.data là undefined
            const userData = response?.data?.user || response?.user || response;
            
            if (userData) {
                // Cập nhật lại thông tin mới trong localStorage
                localStorage.setItem("USER", JSON.stringify(userData));
            } else {
                console.warn("Dữ liệu người dùng không tồn tại trong response:", response);
            }
            // Invalidate hoặc cập nhật lại cache
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

// Hook đăng ký người dùng
export const useRegisterUser = ()=> {
    return useMutation({
        mutationFn: (registerData) => postRegisterAPI(registerData),
    });
}

// Hook đăng nhập người dùng
export const useLoginUser = () => {
    return useMutation({
        mutationFn: (loginData) => postLoginUserAPI(loginData),
    });
}

// --- HOOKS CHO CATEGORY (DANH MỤC) ---

export const useGetCategoriesAD = () => {
    return useQuery({
        queryKey: ['GetCategoriesAPI'],
        queryFn: () => getCategoriesAPI(),
        retry: 0,
        refetchOnWindowFocus: false,
    });
};

export const useAddCategoryAD = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (categoryData) => postCategoryAPI(categoryData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['GetCategoriesAPI'] });
        },
    });
};

export const useUpdateCategoryAD = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateCategoryAPI(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['GetCategoriesAPI'] });
        },
    });
};

export const useDeleteCategoryAD = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteCategoryAPI(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['GetCategoriesAPI'] });
        },
    });
};

export const useGetAddNewPostAD = () => {
    return useMutation({
        mutationFn: (newPost) => postAddnewPostAPI(newPost),
    });
};

export const useGetAddNewPostListAD = (filters) => {
    return useQuery({
        // Đưa filters vào queryKey để tự động refetch khi bộ lọc thay đổi
        queryKey: ["getAddNewPostsAD", filters], 
        queryFn: () => getAddNewPostsADAPI(filters),
        retry: 1,
        refetchOnWindowFocus: false,
    });
};


// --- HOOKS CHO FOOTER ---

export const useGetFootersAD = () => {
    return useQuery({
        queryKey: ['GetFootersAPI'],
        queryFn: () => getFootersAPI(),
        retry: 0,
        refetchOnWindowFocus: false,
    });
};

export const useAddFooterAD = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (footerData) => postFooterAPI(footerData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['GetFootersAPI'] });
        },
    });
};

export const useUpdateFooterAD = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateFooterAPI(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['GetFootersAPI'] });
        },
    });
};

export const useDeleteFooterAD = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteFooterAPI(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['GetFootersAPI'] });
        },
    });
};

export const useLoginAdminMutation = () => { // Đổi thành Mutation
    return useMutation({
        mutationFn: (loginData) => postLoginAdminAPI(loginData),
    });
};

// Trong file queries.js
export const useGetUsersAD = () => {
    return useQuery({
        queryKey: ['GetUsersAPI'],
        queryFn: () => getUsersAPI(),
        retry: 0,
        refetchOnWindowFocus: false,
    });
};

export const useAddUserAD = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userData) => postAddUserAPI(userData),
        onSuccess: () => {
            // Sau khi thêm thành công, tự động load lại danh sách mà không cần reload trang
            queryClient.invalidateQueries({ queryKey: ['GetUsersAPI'] }); 
        },
    });
};

export const useUpdateUserAD = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateUserAPI(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['GetUsersAPI'] });
        },
    });
};

// Hook lấy danh sách
export const useGetCategoriesAudioAD = () => {
    return useQuery({
        queryKey: ["GetCategoriesAudioAPI"],
        queryFn: () => getCategoriesAudioAPI(),
        retry: 1,
        onError: (error) => {
            console.error('useGetCategoriesAudioAD error:', error);
        }
    });
};

// Hook thêm mới
export const useAddCategoryAudioAD = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => addCategoryAudioAPI(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GetCategoriesAudioAPI"] });
        },
    });
};

// Hook cập nhật
export const useUpdateCategoryAudioAD = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateCategoryAudioAPI(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GetCategoriesAudioAPI"] });
        },
    });
};

// Hook xóa
export const useDeleteCategoryAudioAD = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteCategoryAudioAPI(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GetCategoriesAudioAPI"] });
        },
    });
};

// Thêm hook này vào queries.js
export const useAddStoryAD = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData) => addStoryAPI(formData),
        onSuccess: () => {
            // Sau khi thêm thành công, làm tươi lại danh sách truyện
            queryClient.invalidateQueries({ queryKey: ["GetStoriesAPI"] });
        },
    });
};

// 1. Hook lấy danh sách truyện
export const useGetStoriesAD = () => {
    return useQuery({
        queryKey: ["GetStoriesAPI"],
        queryFn: () => getStoriesAPI(),
    });
};

// 2. Hook cập nhật truyện
export const useUpdateStoryAD = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateStoryAPI(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GetStoriesAPI"] });
        },
    });
};

// 3. Hook xóa truyện
export const useDeleteStoryAD = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteStoryAPI(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GetStoriesAPI"] });
            
        },
    });
};

export const useGetChaptersByStoryAD = (storyId) => {
    return useQuery({
        queryKey: ["GetChaptersByStory", storyId],
        queryFn: () => getChaptersByStoryAPI(storyId),
        enabled: !!storyId, // Chỉ gọi khi có ID
        retry: false,       // Tắt tự động gọi lại khi lỗi
        refetchOnWindowFocus: false, // Tắt tự động load lại khi chuyển tab
    });
};

export const useAddChapterAD = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData) => addChapterAPI(formData),
        onSuccess: (data, variables) => {
            // Tự động load lại danh sách chương của đúng bộ truyện vừa đăng
            queryClient.invalidateQueries({ 
                queryKey: ["GetChaptersByStory", variables.get("story_id")] 
            });
        },
    });
};

export const useGetChapterDetail = (id) => {
    return useQuery({
        queryKey: ["getChapterDetail", id],
        queryFn: () => getChapterDetailAPI(id),
        enabled: !!id,
        retry: 0,
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useCategoriesClient = () => {
    return useQuery({
        queryKey: ["getCategoriesClient"],
        queryFn: () => getCategoriesAudioUserClientAPI(),
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export const useGetStoriesClient = () => {
    return useQuery({
        queryKey: ["getStoriesClient"],
        queryFn: () => getStoriesClientAPI(),
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export const useGetStoryDetailClient = (identifier) => {
    return useQuery({
        queryKey: ["getStoryDetailClient", identifier],
        queryFn: () => getStoryDetailClientAPI(identifier),
        enabled: !!identifier,
        retry: 0,
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export const useGetChaptersByStoryClient = (storyId) => {
    return useQuery({
        queryKey: ["GetChaptersByStoryClient", storyId],
        queryFn: () => getChaptersByStoryClientAPI(storyId),
        enabled: !!storyId, // Chỉ gọi
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export const useGetChapterDetailClient = (id) => {
    return useQuery({
        queryKey: ["getChapterDetailClient", id],
        queryFn: () => getChapterDetailClientAPI(id),
        enabled: !!id,
        retry: 1, // Chỉ thử lại 1 lần nếu lỗi
    });
};

// Hooks cho Reviews
export const useGetReviews = (storyId) => {
    return useQuery({
        queryKey: ["reviews", storyId],
        queryFn: () => getReviewsAPI(storyId),
        enabled: !!storyId,
        retry: 0,
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useAddReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => addReviewAPI(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(["reviews", variables.story_id]);
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useUpdateReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateReviewAPI(id, data),
        onSuccess: (_, variables) => {
            // Có thể invalidate theo story_id nếu có trong variables
            queryClient.invalidateQueries(["reviews"]);
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useDeleteReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteReviewAPI(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["reviews"]);
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

// Hooks cho Favorites
export const useGetFavorites = () => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    return useQuery({
        queryKey: ["favorites"],
        queryFn: () => getFavoritesAPI(),
        enabled: !!token,
        retry: 0,
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useAddFavorite = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => addFavoriteAPI(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(["favorites"]);
            queryClient.invalidateQueries(["favorite", variables.story_id]);
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useRemoveFavorite = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (storyId) => removeFavoriteAPI(storyId),
        onSuccess: (_, storyId) => {
            queryClient.invalidateQueries(["favorites"]);
            queryClient.invalidateQueries(["favorite", storyId]);
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useCheckFavorite = (storyId) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    return useQuery({
        queryKey: ["favorite", storyId],
        queryFn: () => checkFavoriteAPI(storyId),
        enabled: !!token && !!storyId,
        retry: 0,
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

// Thêm vào cuối file queries.js của bạn

export const useGetAllChaptersClient = () => {
    return useQuery({
        queryKey: ["getAllChaptersClient"],
        queryFn: () => getAllChaptersClientAPI(),
        retry: 1,
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};



// Hook lấy danh sách bài viết Client
export const useGetClientPosts = () => {
    return useQuery({
        queryKey: ["clientPosts"],
        queryFn: () => getClientPostsAPI(),
        retry: 1,
        staleTime: 5 * 60 * 1000,   // Dữ liệu truyện được coi là mới trong 5 phút. Trong 5 phút này user click qua lại sẽ KHÔNG bị tải lại API.
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

// Hook lấy danh mục bài viết Client
export const useGetClientPostCategories = () => {
    return useQuery({
        queryKey: ["clientPostCategories"],
        queryFn: () => getClientPostCategoriesAPI(),
        retry: 1,
        staleTime: 5 * 60 * 1000,   // Dữ liệu truyện được coi là mới trong 5 phút. Trong 5 phút này user click qua lại sẽ KHÔNG bị tải lại API.
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useUpdateProfileAdmin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData) => updateProfileAdminAPI(formData),
    });
};

// Thêm hook này vào cuối file queries.js của bạn
export const useGetAuthorContent = () => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    return useQuery({
        queryKey: ["getAuthorContent"],
        queryFn: async () => {
            // Đảm bảo trích xuất dữ liệu thẳng từ Axios response
            // Giả định hàm api getAuthorContentAPI() đã có sẵn trong request.js
            // Nếu hàm request của bạn đặt tên khác, hãy đổi tên cho khớp nhé
            const res = await getAuthorContentAPI(); 
            return res;
        },
        enabled: !!token, // Chỉ chạy khi có Token đăng nhập
        retry: 1,
        refetchOnWindowFocus: false,
    });
};

export const useGetPublicAuthorProfile = (authorName) => {
    return useQuery({
        queryKey: ["publicAuthor", authorName],
        queryFn: () => getPublicAuthorProfileAPI(authorName),
        enabled: !!authorName, // Chỉ gọi khi có tên tác giả
        refetchOnWindowFocus: false,
    });
};

// File queries.js
export const useGetActiveUser = ({ enabled = true } = {}) => {
    const token = localStorage.getItem("adminToken");

    return useQuery({
        queryKey: ["getActiveUsers"],
        queryFn: async () => {
            const res = await getActiveUser();

            const users = res.data;

            return Array.isArray(users) ? users : [];
        },
        enabled: enabled && !!token,
        retry: false,
    });
};

export const useGetAdminMemberships = () => {
    const token = localStorage.getItem("adminToken");

    return useQuery({
        queryKey: ["adminMemberships"],
        queryFn: async () => {
            const res = await getAdminMembershipsAPI();

            // ✅ return full response (KHÔNG bóp data)
            return res || { data: [], statistics: {} };
        },
        enabled: !!token,
        retry: 1,
        refetchOnWindowFocus: false,
    });
};