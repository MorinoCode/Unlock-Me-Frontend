import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SignupPage from './pages/signupPage/SignupPage'

const App = () => {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/signup' element={<SignupPage />}  />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App