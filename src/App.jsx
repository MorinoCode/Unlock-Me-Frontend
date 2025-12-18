import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SignupPage from './pages/signupPage/SignupPage'
import Login from './pages/signinPage/SigninPage'
import InitialQuizzesPage from './pages/initialQuizzesPage/InitialQuizzesPage'
import HomePage from './pages/homePage/HomePage'

const App = () => {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage />}  />
        <Route path='/signup' element={<SignupPage />}  />
        <Route path='/signin'  element={<Login />}  />
        <Route path='/initial-quizzes'  element={<InitialQuizzesPage />}  />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App