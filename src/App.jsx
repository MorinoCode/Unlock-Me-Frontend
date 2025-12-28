import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import Navbar from './components/navbar/Navbar.jsx';

import PublicRoute from './context/PublicRoute.jsx'; 
import ProtectedRoute from './context/ProtectedRoute.jsx'; 
import HeartbeatLoader from './components/heartbeatLoader/HeartbeatLoader'; 

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
        <Suspense fallback={<HeartbeatLoader />}>
          <Routes>
            
            <Route path='/' element={<> <Navbar/> <HomePage /> </>} />

            <Route element={<PublicRoute />}>
              <Route path='/signup' element={<SignupPage />} />
              <Route path='/signin' element={<Login />} />
            </Route>

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
                  
               </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
            <Route path="/report-problem" element={<ReportProblemPage />} />

          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;