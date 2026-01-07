import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { SocketProvider } from "./context/SocketProvider.jsx";
import { Toaster } from "react-hot-toast";
import HeartbeatLoader from "./components/heartbeatLoader/HeartbeatLoader.jsx";

import PublicRoute from "./context/PublicRoute.jsx";
import ProtectedRoute from "./context/ProtectedRoute.jsx";
import MainLayout from "./context/MainLayout.jsx";

// Lazy-loaded pages
const SignupPage = lazy(() => import("./pages/signupPage/SignupPage"));
const Login = lazy(() => import("./pages/signinPage/SigninPage"));
const HomePage = lazy(() => import("./pages/homePage/HomePage"));
const HowItWorksPage = lazy(() =>
  import("./pages/howItWorksPage/HowItWorksPage")
);
const AboutPage = lazy(() => import("./pages/aboutPage/AboutPage"));
const InitialQuizzesPage = lazy(() =>
  import("./pages/initialQuizzesPage/InitialQuizzesPage")
);
const InitialQuizzesInterestsPage = lazy(() =>
  import("./pages/initialQuizzesInterestsPage/InitialQuizzesInterestsPage")
);
const InitialQuizzesQuestionsPage = lazy(() =>
  import("./pages/initialQuizzesQuestionsPage/InitialQuizzesQuestionsPage")
);
const ExplorePage = lazy(() => import("./pages/explorePage/ExplorePage"));
const ViewAllMatchedExploreUsersPage = lazy(() =>
  import(
    "./pages/viewAllMatchedExploreUsersPage/ViewAllMatchedExploreUsersPage"
  )
);
const UserDetailPage = lazy(() =>
  import("./pages/userDetailPage/UserDetailPage")
);
const MyMatchesPage = lazy(() => import("./pages/myMatchesPage/MyMatchesPage"));
const ViewAllMatchesPage = lazy(() =>
  import("./pages/viewAllMatchesPage/ViewAllMatchesPage")
);
const MessagesPage = lazy(() =>
  import("./pages/MessagesInboxPage/MessagesInboxPage")
);
const ChatPage = lazy(() => import("./pages/chatPage/ChatPage"));
const ProfilePage = lazy(() => import("./pages/profilePage/ProfilePage"));
const SwipePage = lazy(() => import("./pages/swipePage/SwipePage"));
const BlindDatePage = lazy(() => import("./pages/blindDatePage/BlindDatePage"));
const FeedPage = lazy(() => import("./pages/feedPage/FeedPage"));
const ReportProblemPage = lazy(() =>
  import("./pages/reportProblemPage/ReportProblemPage")
);
const NotFoundPage = lazy(() => import("./pages/notFound/NotFoundPage"));
const ForgotPassword = lazy(() =>
  import("./pages/forgotPasswordPage/ForgotPasswordPage")
);
const TermsOfService = lazy(() =>
  import("./pages/termsOfServicePage/TermsOfService")
);
const PrivacyPolicy = lazy(() =>
  import("./pages/PrivacyPolicyPage/PrivacyPolicy.jsx")
);

/**
 * AppContent Component:
 * We move the routing logic here so it sits INSIDE the Providers.
 * This allows us to use global hooks like useNotifications.
 */
const AppContent = () => {
  // Global listener for socket notifications (Toasts)
  // useNotifications();

  return (
    <Suspense fallback={<HeartbeatLoader />}>
      <Routes>
        {/* Public Pages */}
        <Route element={<PublicRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/signin" element={<Login />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/about-us" element={<AboutPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/privacypolicy" element={<PrivacyPolicy />} />
            <Route path="/termsofservice" element={<TermsOfService />} />
          </Route>
        </Route>

        {/* Protected Pages */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/initial-quizzes" element={<InitialQuizzesPage />} />
            <Route
              path="/initial-quizzes/interests"
              element={<InitialQuizzesInterestsPage />}
            />
            <Route
              path="/initial-quizzes/questionsbycategory"
              element={<InitialQuizzesQuestionsPage />}
            />

            <Route path="/explore" element={<ExplorePage />} />
            <Route
              path="/explore/view-all/:category"
              element={<ViewAllMatchedExploreUsersPage />}
            />
            <Route path="/user-profile/:userId" element={<UserDetailPage />} />

            <Route path="/mymatches" element={<MyMatchesPage />} />
            <Route
              path="/mymatches/view-all/:type"
              element={<ViewAllMatchesPage />}
            />
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
  );
};

const App = () => {
  return (
    <BrowserRouter>
      {/* AuthProvider must be top-level to provide user state */}
      <AuthProvider>
        {/* SocketProvider must be inside AuthProvider to access currentUser */}
        <SocketProvider>
          <Toaster
            position="top-center"
            reverseOrder={false}
            containerStyle={{
              top: 80,
              left: 20,
              right: 20,
            }}
            toastOptions={{
              className: "glass-toast",
              style: {
                maxWidth: "500px",
                width: "100%",
                margin: "0 auto",
              },
              success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
