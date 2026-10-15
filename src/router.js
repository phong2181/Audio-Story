import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import HomePage from "./pages/users/homePage";
import { ADMIN_PATH, ROUTES } from "./utils/route";
import MasterLayout from "./pages/users/theme/masterLayout";
import ProfilePage from "./pages/users/ProfilePage";
import PostDetailPage from "./pages/users/PostDetailPage";
import PostListView from "pages/users/PostListView";
import StoryList from "pages/users/AudioList";
import AuthorPage from "pages/users/AuthorProfile";
import StoryDetail from "pages/users/StoryDetail";
import AuthCallback from "pages/users/AuthCallback";
import Membership from "pages/users/Membership";
import NotFound from "pages/users/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginAdmin from "./pages/admin/LoginAdmin";
import MasterADLayout from "pages/admin/theme/masterADLayout";

// Lazy-loaded Admin Pages để tối ưu dung lượng Bundle ban đầu
const AdminDashboard = lazy(() => import("pages/admin/Dasboard"));
const AddPost = lazy(() => import("pages/admin/AddPosts"));
const AllPost = lazy(() => import("pages/admin/AllPost"));
const CategoryPosts = lazy(() => import("pages/admin/CategoryPosts"));
const Footers = lazy(() => import("pages/admin/Footers"));
const HeaderCustomizer = lazy(() => import("pages/admin/Appearance/HeaderCustomizer"));
const ChapterManagement = lazy(() => import("pages/admin/Audio/ManageAudioAdd"));
const CategoryManagement = lazy(() => import("pages/admin/Audio/ManageAudioCategory"));
const StoryManagement = lazy(() => import("pages/admin/Audio/ManageAudioSeries"));
const ProfileAdmin = lazy(() => import("pages/admin/Authors/InformationAuthor"));
const UserManagement = lazy(() => import("pages/admin/Authors/ManagerAuthors"));
const EditPosts = lazy(() => import("pages/admin/EditPosts"));
const Notification = lazy(() => import("pages/admin/Nofication"));
const AddMember = lazy(() => import("pages/admin/MembershipManager/AddMember"));
const MembershipManager = lazy(() => import("pages/admin/MembershipManager/AllMember"));
const VietQRSettings = lazy(() => import("pages/admin/MembershipManager/VietQRSettings"));
const RevenueStatistics = lazy(() => import("pages/admin/Revenue/Statistical"));
const TransactionStatistics = lazy(() => import("pages/admin/Revenue/Transaction"));
const ManagerAuthorsUser = lazy(() => import("pages/admin/Authors/ManagerAuthorsUser"));
const AddFileRead = lazy(() => import("pages/admin/Audio/Addfileread"));
const ManageBackgroundMusic = lazy(() => import("pages/admin/Audio/ManageBackgroundMusic"));
const AdvertisementsManager = lazy(() => import("pages/admin/Advertisements"));
const ReportsManager = lazy(() => import("pages/admin/Reports"));
const MaintenanceManager = lazy(() => import("pages/admin/MaintenanceManager"));

const AdminLoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', gap: '10px' }}>
    <div style={{ width: '28px', height: '28px', border: '3px solid rgba(0,0,0,0.1)', borderTopColor: '#2271b1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <span style={{ fontSize: '14px', color: '#64748b' }}>Đang tải trang quản trị...</span>
  </div>
);

const renderUsersRoutes = () => {
  const usersRoutes = [
    {
      path: ROUTES.USER.HOME,
      component: <HomePage />,
    },
    {
      path: ROUTES.USER.MEMBERSHIP,
      component: <Membership />,
    },
    {
      path: ROUTES.USER.POSTS,
      component: <Navigate to={ROUTES.USER.POST_LIST_VIEW} replace />,
    },
    {
      path: ROUTES.USER.PROFILE,
      component: <ProfilePage />,
    },
    {
      path: ROUTES.USER.POST_DETAIL,
      component: <PostDetailPage />,
    },
    {
      path: ROUTES.USER.POST_LIST_VIEW,
      component: <PostListView />,
    },
    {
      path: ROUTES.USER.AUTHOR_PAGE,
      component: <AuthorPage />,
    },
    {
      path: ROUTES.USER.AUDIO_LIST,
      component: <StoryList />,
    },
    {
      path: ROUTES.USER.STORY_DETAIL,
      component: <StoryDetail />,
    },
    {
      path: "/auth/callback",
      component: <AuthCallback />,
    },
  ];

  return (
    <MasterLayout>
        <Routes>
          {usersRoutes.map((item, key) => (
              <Route key={key} path={item.path} element={item.component} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
    </MasterLayout>
  );
};

const renderAdminRoutes = () => {
  const AdminRoutes = [
    {
      path: ROUTES.ADMIN.LOGIN,
      component: <LoginAdmin />,
      protected: false,
    },
    {
      path: ROUTES.ADMIN.NOTEIFICATION,
      component: <ProtectedRoute><Notification /></ProtectedRoute>,
      protected: true,
    },
    {
      path: ROUTES.ADMIN.DASHBOARD,
      component: <ProtectedRoute><AdminDashboard /></ProtectedRoute>,
      protected: true,
    },
    {
      path: ROUTES.ADMIN.POSTS_ADD,
      component: <ProtectedRoute><AddPost /></ProtectedRoute>,
      protected: true,
    },
    {
      path: ROUTES.ADMIN.All_POSTS,
      component: <ProtectedRoute><AllPost /></ProtectedRoute>,
      protected: true,
    },
    {
      path: ROUTES.ADMIN.POSTS_CATEGORY,
      component: <ProtectedRoute><CategoryPosts /></ProtectedRoute>,
      protected: true,
    },
    {
      path: ROUTES.ADMIN.FOOTERS,
      component: <ProtectedRoute><Footers /></ProtectedRoute>,
      protected: true,
    },
    {
      path: ROUTES.ADMIN.HEADER_CUSTOMIZER,
      component: <ProtectedRoute><HeaderCustomizer /></ProtectedRoute>,
      protected: true,
    },
    {
      path: ROUTES.ADMIN.AUDIO_ADD,
      component: <ProtectedRoute><ChapterManagement /></ProtectedRoute>,
      protected: true,
    },
    {
      path: ROUTES.ADMIN.MANAGE_AUDIO_CATEGORY,
      component: <ProtectedRoute><CategoryManagement /></ProtectedRoute>,
      protected: true,  
    },
    {
      path: ROUTES.ADMIN.MANAGE_COMMENTS_AUDIO,
      component: <ProtectedRoute><StoryManagement /></ProtectedRoute>,
      protected: true,  
    },
    {
      path: ROUTES.ADMIN.INFOMATION_AUTHORS,
      component: <ProtectedRoute><ProfileAdmin /></ProtectedRoute>,
      protected: true,  
    },
    {
      path: ROUTES.ADMIN.MANAGE_USERS_AUTHORS,
      component: <ProtectedRoute><UserManagement /></ProtectedRoute>,
      protected: true,  
    },
    {
      path: ROUTES.ADMIN.EDITPOSTS,
      component: <ProtectedRoute><EditPosts /></ProtectedRoute>,
      protected: true,
    },
    {
      path: `${ROUTES.ADMIN.EDITPOSTS}/:id`,
      component: <ProtectedRoute><EditPosts /></ProtectedRoute>,
      protected: true,
    },
    {
      path: ROUTES.ADMIN.ADD_MEMBERSHIP,
      component: <ProtectedRoute><AddMember /></ProtectedRoute>,
      protected: true,
    },
    {
      path: ROUTES.ADMIN.MANAGE_USERS_MEMBERSHIP,
      component: <ProtectedRoute><MembershipManager /></ProtectedRoute>,
      protected: true,
    },
    {
      path: ROUTES.ADMIN.MEMBERSHIP_VIETQR,
      component: <ProtectedRoute><VietQRSettings /></ProtectedRoute>,
      protected: true,
    },
    {
      path: ROUTES.ADMIN.REVENUE_STATISTICS,
      component: <ProtectedRoute><RevenueStatistics /></ProtectedRoute>,
      protected: true,
    },
    {
      path: ROUTES.ADMIN.MANAGE_TRANSACTIONS,
      component: <ProtectedRoute><TransactionStatistics /></ProtectedRoute>,
      protected: true,
    },
    {
      path: ROUTES.ADMIN.MANAGE_VIP_APPROVAL,
      component: <ProtectedRoute><ManagerAuthorsUser /></ProtectedRoute>,
      protected: true,
    },
    {
      path: ROUTES.ADMIN.ADDFILEREAD,
      component: <ProtectedRoute><AddFileRead /></ProtectedRoute>,
      protected: true,
    },
    {
      path: ROUTES.ADMIN.MANAGE_BACKGROUND_MUSIC,
      component: <ProtectedRoute><ManageBackgroundMusic /></ProtectedRoute>,
      protected: true,
    },
    {
      path: ROUTES.ADMIN.MANAGE_ADVERTISEMENTS,
      component: <ProtectedRoute><AdvertisementsManager /></ProtectedRoute>,
      protected: true,
    },
    {
      path: ROUTES.ADMIN.MANAGE_REPORTS,
      component: <ProtectedRoute><ReportsManager /></ProtectedRoute>,
      protected: true,
    },
    {
      path: ROUTES.ADMIN.MAINTENANCE,
      component: <ProtectedRoute><MaintenanceManager /></ProtectedRoute>,
      protected: true,
    }
  ];

  return (
    <MasterADLayout>
      <Suspense fallback={<AdminLoadingFallback />}>
        <Routes>
          {/* Chuyển hướng khi người dùng gõ /admin trực tiếp */}
          <Route path="/admin" element={<Navigate to={ROUTES.ADMIN.LOGIN} replace />} />
          
          {AdminRoutes.map((item, key) => (
              <Route key={key} path={item.path} element={item.component} />
          ))}
        </Routes>
      </Suspense>
    </MasterADLayout>
  );
};

const RouterCustom = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith(ADMIN_PATH);
  return isAdminRoute ? renderAdminRoutes() : renderUsersRoutes();
};

export default RouterCustom;