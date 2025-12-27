import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import Navbar from './components/navbar/Navbar.jsx';

// کامپوننت‌های سبک و ضروری را عادی ایمپورت می‌کنیم
import PublicRoute from './context/PublicRoute.jsx'; 
import ProtectedRoute from './context/ProtectedRoute.jsx'; 
import HeartbeatLoader from './components/heartbeatLoader/HeartbeatLoader'; // لودر برای زمان‌های انتظار

// 🔥 Lazy Loading: صفحات سنگین را فقط در زمان نیاز دانلود کن
const SignupPage = lazy(() => import('./pages/signupPage/SignupPage'));
const Login = lazy(() => import('./pages/signinPage/SigninPage'));
const InitialQuizzesPage = lazy(() => import('./pages/initialQuizzesPage/InitialQuizzesPage'));
const InitialQuizzesInterestsPage = lazy(() => import('./pages/initialQuizzesInterestsPage/InitialQuizzesInterestsPage'));
const InitialQuizzesQuestionsPage = lazy(() => import('./pages/initialQuizzesQuestionsPage/InitialQuizzesQuestionsPage.jsx'));
const HomePage = lazy(() => import('./pages/homePage/HomePage'));
const ExplorePage = lazy(() => import('./pages/explorePage/ExplorePage'));
const ViewAllMatchedExploreUsersPage = lazy(() => import('./pages/viewAllMatchedExploreUsersPage/ViewAllMatchedExploreUsersPage.jsx'));
const UserDetailPage = lazy(() => import('./pages/userDetailPage/UserDetailPage.jsx'));
const MyMatchesPage = lazy(() => import('./pages/myMatchesPage/MyMatchesPage.jsx'));
const ViewAllMatchesPage = lazy(() => import('./pages/viewAllMatchesPage/ViewAllMatchesPage.jsx'));
const ChatPage = lazy(() => import('./pages/chatPage/ChatPage.jsx'));
const MessagesPage = lazy(() => import('./pages/MessagesInboxPage/MessagesInboxPage.jsx'));
const ProfilePage = lazy(() => import('./pages/profilePage/ProfilePage.jsx'));
const SwipePage = lazy(() => import('./pages/swipePage/SwipePage.jsx'));

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Suspense تمام روت‌ها را در بر می‌گیرد.
          هر وقت کاربری روی لینکی کلیک کرد و آن صفحه هنوز دانلود نشده بود،
          HeartbeatLoader نمایش داده می‌شود تا دانلود تمام شود.
        */}
        <Suspense fallback={<HeartbeatLoader />}>
          <Routes>
            
            {/* صفحه اصلی */}
            <Route path='/' element={<> <Navbar/> <HomePage /> </>} />

            {/* روت‌های عمومی (لاگین و ثبت‌نام) */}
            <Route element={<PublicRoute />}>
              <Route path='/signup' element={<SignupPage />} />
              <Route path='/signin' element={<Login />} />
            </Route>

            {/* روت‌های محافظت شده (نیاز به لاگین) */}
            <Route element={<ProtectedRoute />}>
               <Route element={<MainLayout />}>
               
                  {/* کوییزهای اولیه */}
                  <Route path='/initial-quizzes' element={<InitialQuizzesPage />} />
                  <Route path='/initial-quizzes/interests' element={<InitialQuizzesInterestsPage />} />
                  <Route path='/initial-quizzes/questionsbycategory' element={<InitialQuizzesQuestionsPage />} />

                  {/* اکسپلور و پروفایل‌ها */}
                  <Route path='/explore' element={<ExplorePage />} />
                  <Route path="/explore/view-all/:category" element={<ViewAllMatchedExploreUsersPage />} />
                  <Route path="/user-profile/:userId" element={<UserDetailPage />} />
                  
                  {/* مچ‌ها و پیام‌ها */}
                  <Route path="/mymatches" element={<MyMatchesPage />} />
                  <Route path="/mymatches/view-all/:type" element={<ViewAllMatchesPage />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/chat/:receiverId" element={<ChatPage />} />
                  
                  {/* پروفایل شخصی و سواپ */}
                  <Route path="/myprofile" element={<ProfilePage />} />
                  <Route path="/swipe" element={<SwipePage />} />
                  
               </Route>
            </Route>

          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;