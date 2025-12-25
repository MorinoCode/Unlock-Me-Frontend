import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import SignupPage from './pages/signupPage/SignupPage';
import Login from './pages/signinPage/SigninPage';
import InitialQuizzesPage from './pages/initialQuizzesPage/InitialQuizzesPage';
import InitialQuizzesInterestsPage from './pages/initialQuizzesInterestsPage/InitialQuizzesInterestsPage';
import InitialQuizzesQuestionsPage from './pages/initialQuizzesQuestionsPage/InitialQuizzesQuestionsPage.jsx';
import HomePage from './pages/homePage/HomePage';
import ExplorePage from './pages/explorePage/ExplorePage';
import ViewAllMatchedUsersPage from './pages/viewAllMatchedUsersPage/ViewAllMatchedUsersPage.jsx';
import UserDetailPage from './pages/userDetailPage/UserDetailPage.jsx';
import MyMatchesPage from './pages/myMatchesPage/MyMatchesPage.jsx';
import ViewAllMatchesPage from './pages/viewAllMatchesPage/ViewAllMatchesPage.jsx';
import ChatPage from './pages/chatPage/ChatPage.jsx';
import MessagesPage from './pages/MessagesInboxPage/MessagesInboxPage.jsx';
import ProfilePage from './pages/profilePage/ProfilePage.jsx';
import Navbar from './components/navbar/Navbar.jsx';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/signup' element={<SignupPage />} />
          <Route path='/signin' element={<Login />} />
          <Route path='/initial-quizzes' element={<InitialQuizzesPage />} />
          <Route path='/initial-quizzes/interests' element={<InitialQuizzesInterestsPage />} />
          <Route path='/initial-quizzes/questionsbycategory' element={<InitialQuizzesQuestionsPage />} />
          <Route path='/explore' element={<ExplorePage />} />
          <Route path="/explore/view-all/:category" element={<ViewAllMatchedUsersPage />} />
          <Route path="/user-profile/:userId" element={<UserDetailPage />} />
          <Route path="/mymatches" element={<MyMatchesPage />} />
          <Route path="/mymatches/view-all/:type" element={<ViewAllMatchesPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/chat/:receiverId" element={<ChatPage />} />
          <Route path="/myprofile" element={<ProfilePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;