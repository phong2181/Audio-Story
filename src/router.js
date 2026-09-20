import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import HomePage from "./pages/users/homePage";
import { ADMIN_PATH, ROUTES } from "./utils/route";
import MasterLayout from "./pages/users/theme/masterLayout";
import ProfilePage from "./pages/users/ProfilePage";
import PostDetailPage from "./pages/users/PostDetailPage";
import PostListView  from "pages/users/PostListView";
import CourseGrid from "pages/users/homePage/PostList/postlist";
import StoryList from "pages/users/AudioList";
import AuthorPage from "pages/users/AuthorProfile";

import LoginAdmin from "./pages/admin/LoginAdmin";
import MasterADLayout from "pages/admin/theme/masterADLayout";
import AdminDashboard from "pages/admin/Dasboard";
import AddPost from "pages/admin/AddPosts";
import AllPost from "pages/admin/AllPost";
import CategoryPosts from "pages/admin/CategoryPosts";
import Footers from "pages/admin/Footers";
import ProtectedRoute from "./components/ProtectedRoute";
import StoryManagement from "pages/admin/Audio/ManageAudioSeries";
import ProfileAdmin from "pages/admin/Authors/InformationAuthor";
import UserManagement from "pages/admin/Authors/ManagerAuthors";
import CategoryManagement from "pages/admin/Audio/ManageAudioCategory";
import ChapterManagement from "pages/admin/Audio/ManageAudioAdd";
import StoryDetail from "pages/users/StoryDetail";
import AuthCallback from "pages/users/AuthCallback";
import EditPosts from "pages/admin/EditPosts";
import Notification from "pages/admin/Nofication";
import Membership from "pages/users/Membership";
import NotFound from "pages/users/NotFound";
import AddMember from "pages/admin/MembershipManager/AddMember";
import MembershipManager from "pages/admin/MembershipManager/AllMember";
import RevenueStatistics from "pages/admin/Revenue/Statistical";
import TransactionStatistics from "pages/admin/Revenue/Transaction";
import ManagerAuthorsUser from "pages/admin/Authors/ManagerAuthorsUser";
import AddFileRead from "pages/admin/Audio/Addfileread";
import ManageBackgroundMusic from "pages/admin/Audio/ManageBackgroundMusic";

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
      component: <CourseGrid />,
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
    }

  ];

  return (
    <MasterADLayout>
        <Routes>
          {/* Chuyển hướng khi người dùng gõ /admin trực tiếp */}
          <Route path="/admin" element={<Navigate to={ROUTES.ADMIN.LOGIN} replace />} />
          
          {AdminRoutes.map((item, key) => (
              <Route key={key} path={item.path} element={item.component} />
          ))}
        </Routes>
    </MasterADLayout>
  );
};

const RouterCustom = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith(ADMIN_PATH);
  return isAdminRoute ? renderAdminRoutes() : renderUsersRoutes();
};

export default RouterCustom;