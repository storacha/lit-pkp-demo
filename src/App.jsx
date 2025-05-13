import { AuthProvider } from './context/AuthContext'
import { Login } from './components/Login'
import { UploadFile } from './components/UploadFile'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/upload" element={<UploadFile />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App 