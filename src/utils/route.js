
export const ADMIN_PATH = '/admin';


export const ROUTES = {
    USER: {
        HOME: "/",
        PROFILE: "/profile",
        POSTS: "/post",
        AUTHOR_PAGE: "/authors/:authorName",
        POST_DETAIL: "/post/:id",
        POST_LIST_VIEW: "/bai-viet",
        AUDIO_LIST: "/truyen",
        STORY_DETAIL: "/story/:slug",
        MEMBERSHIP: "/membership",
    },

    ADMIN: {
        LOGIN: `${ADMIN_PATH}/login`,
        DASHBOARD: `${ADMIN_PATH}/dashboard`,
        POSTS: `${ADMIN_PATH}/all/posts`,
        LOGOUT: `${ADMIN_PATH}/logout`,
        POSTS_ADD: `${ADMIN_PATH}/add/posts`,
        EDITPOSTS: `${ADMIN_PATH}/edit/posts/:id`,
        All_POSTS: `${ADMIN_PATH}/all/posts`,
        POSTS_CATEGORY: `${ADMIN_PATH}/category/posts`,
        FOOTERS: `${ADMIN_PATH}/footers`,
        LETTER_FEEDBACK: `${ADMIN_PATH}/letters/feedback`,
        LETTER_NOTIFICATION: `${ADMIN_PATH}/letters/notification`,
        AUDIO_ADD: `${ADMIN_PATH}/add/audio`,
        MANAGE_AUDIO_CATEGORY: `${ADMIN_PATH}/manage/audio/category`,
        MANAGE_COMMENTS_AUDIO: `${ADMIN_PATH}/manage/audio/series`,
        INFOMATION_AUTHORS: `${ADMIN_PATH}/profile/authors`,
        MANAGE_USERS_AUTHORS: `${ADMIN_PATH}/manage/users/authors`,
        NOTEIFICATION: `${ADMIN_PATH}/notification`,
        ADD_MEMBERSHIP: `${ADMIN_PATH}/membership/add`,
        MANAGE_USERS_MEMBERSHIP: `${ADMIN_PATH}/membership/manage`,
        REVENUE_STATISTICS: `${ADMIN_PATH}/revenue/statistics`,
        MANAGE_TRANSACTIONS: `${ADMIN_PATH}/revenue/transactions`,
        MANAGE_VIP_APPROVAL: `${ADMIN_PATH}/vip/approval`,
        ADDFILEREAD: `${ADMIN_PATH}/add/audio/fileread`,
    },
}