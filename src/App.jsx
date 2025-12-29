import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import Navbar from './components/navbar/Navbar.jsx';
import Footer from './components/footer/Footer.jsx';
import { Toaster } from 'react-hot-toast';
import PublicRoute from './context/PublicRoute.jsx'; 
import ProtectedRoute from './context/ProtectedRoute.jsx'; 
import HeartbeatLoader from './components/heartbeatLoader/HeartbeatLoader.jsx';

// Lazy-loaded pages
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
const NotFoundPage = lazy(() => import('./pages/notFound/NotFoundPage.jsx'));
const ReportProblemPage = lazy(() => import('./pages/reportProblemPage/ReportProblemPage'));
const HowItWorksPage = lazy(() => import('./pages/howItWorksPage/HowItWorksPage'));
const AboutPage = lazy(() => import('./pages/aboutPage/AboutPage'));
const BlindDatePage = lazy(() => import('./pages/blindDatePage/BlindDatePage'));
const FeedPage = lazy(() => import('./pages/feedPage/FeedPage'));

// Layout for protected pages
const MainLayout = () => {
  const location = useLocation();
  const noFooterRoutes = ['/chat', "/swipe","/blind-date"];
  const hideFooter = noFooterRoutes.some(path => location.pathname.startsWith(path));

  return (
  <>
    <Navbar />
    <Outlet />
    {!hideFooter && <Footer/>}
  </>
)};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            className: 'glass-toast',
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />

        <Suspense fallback={<HeartbeatLoader />}>
          <Routes>

            {/* Public Pages */}
            <Route path='/' element={<><Navbar/><HomePage /></>} />
            <Route path='/how-it-works' element={<><Navbar/><HowItWorksPage /></>} />
            <Route path='/about-us' element={<><Navbar/><AboutPage /></>} />

            {/* Auth Pages */}
            <Route element={<PublicRoute />}>
              <Route path='/signup' element={<SignupPage />} />
              <Route path='/signin' element={<Login />} />
            </Route>

            {/* Protected Pages */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path='/initial-quizzes' element={<InitialQuizzesPage />} />
                <Route path='/initial-quizzes/interests' element={<InitialQuizzesInterestsPage />} />
                <Route path='/initial-quizzes/questionsbycategory' element={<InitialQuizzesQuestionsPage />} />

                <Route path='/explore' element={<ExplorePage />} />
                <Route path="/explore/view-all/:category" element={<ViewAllMatchedExploreUsersPage />} />
                <Route path="/user-profile/:userId" element={<UserDetailPage />} />

                <Route path="/mymatches" element={<MyMatchesPage />} />
                <Route path="/mymatches/view-all/:type" element={<ViewAllMatchesPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/chat/:receiverId" element={<ChatPage />} />

                <Route path="/myprofile" element={<ProfilePage />} />
                <Route path="/swipe" element={<SwipePage />} />
                <Route path="/blind-date" element={<BlindDatePage />} />
                <Route path="/feed" element={<FeedPage />} />
              </Route>
            </Route>

            {/* Other Routes */}
            <Route path="/report-problem" element={<ReportProblemPage />} />
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
