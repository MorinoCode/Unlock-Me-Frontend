import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SignupPage from './pages/signupPage/SignupPage'
import Login from './pages/signinPage/SigninPage'
import InitialQuizzesPage from './pages/initialQuizzesPage/InitialQuizzesPage'
import InitialQuizzesInterestsPage from './pages/initialQuizzesInterestsPage/InitialQuizzesInterestsPage'
import InitialQuizzesQuestionsPage from './pages/initialQuizzesQuestionsPage/InitialQuizzesQuestionsPage.jsx'
import HomePage from './pages/homePage/HomePage'
import ExplorePage from './pages/explorePage/ExplorePage'
import ViewAllMatchedUsersPage from './pages/viewAllMatchedUsersPage/ViewAllMatchedUsersPage.jsx'

const App = () => {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage />}  />
        <Route path='/signup' element={<SignupPage />}  />
        <Route path='/signin'  element={<Login />}  />
        <Route path='/initial-quizzes'  element={<InitialQuizzesPage />}  />
        <Route path='/initial-quizzes/interests'  element={<InitialQuizzesInterestsPage />}  />
        <Route path='/initial-quizzes/questionsbycategory'  element={<InitialQuizzesQuestionsPage />}  />
        <Route path='/explore'  element={<ExplorePage />}  />
        <Route path="/explore/view-all/:category" element={<ViewAllMatchedUsersPage />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App