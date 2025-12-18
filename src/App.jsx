import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SignupPage from './pages/signupPage/SignupPage'
import Login from './pages/loginPage/LoginPage'

const App = () => {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/signup' element={<SignupPage />}  />
        <Route path='/login'  element={<Login />}  />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App