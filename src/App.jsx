import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SignupPage from './pages/signupPage/SignupPage'
import Login from './pages/signinPage/SigninPage'

const App = () => {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/signup' element={<SignupPage />}  />
        <Route path='/signin'  element={<Login />}  />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App