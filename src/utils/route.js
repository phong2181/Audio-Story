/**
 * Route configuration constants for Bloger.
 * Centralizes all route paths used across the app.
 */

/** Prefix for all admin routes */
export const ADMIN_PATH = '/admin';

/**
 * All route paths organized by domain (USER / ADMIN).
 */
export const ROUTES = {
  USER: {
    HOME: '/',
    AUDIO_LIST: '/truyen',
    STORY_DETAIL: '/story/:slug',
    POSTS: '/posts',
    POST_DETAIL: '/post/:id',
    POST_LIST_VIEW: '/bai-viet',
    PROFILE: '/profile',
    MEMBERSHIP: '/membership',
    AUTHOR_PAGE: '/authors/:authorName',
  },
  ADMIN: {
    LOGIN: '/admin/login',
    DASHBOARD: '/admin/dashboard',
    POSTS_ADD: '/admin/posts/add',
    All_POSTS: '/admin/posts',
    POSTS_CATEGORY: '/admin/posts/category',
    EDITPOSTS: '/admin/edit-posts',
    FOOTERS: '/admin/footers',
    AUDIO_ADD: '/admin/stories/add',
    MANAGE_COMMENTS_AUDIO: '/admin/stories',
    MANAGE_AUDIO_CATEGORY: '/admin/categories',
    INFOMATION_AUTHORS: '/admin/profile',
    MANAGE_USERS_AUTHORS: '/admin/users',
    MANAGE_VIP_APPROVAL: '/admin/users/vip',
    NOTEIFICATION: '/admin/notifications',
    ADD_MEMBERSHIP: '/admin/membership/add',
    MANAGE_USERS_MEMBERSHIP: '/admin/membership',
    REVENUE_STATISTICS: '/admin/revenue',
    MANAGE_TRANSACTIONS: '/admin/transactions',
ADDFILEREAD: '/admin/add-file-read',
    MANAGE_BACKGROUND_MUSIC: '/admin/background-music',
    LETTER_FEEDBACK: '/admin/letters',
    LOGOUT: '/admin/logout',
  },
};

