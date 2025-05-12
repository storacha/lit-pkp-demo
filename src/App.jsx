import { AuthProvider } from './context/AuthContext'
import { Login } from './components/Login'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function UploadPage() {
  return (
    <div className="login-container pkp-panel-wide">
      <h2>Upload File</h2>
      <p>This is where you will upload and encrypt files with Storacha & Lit Protocol.</p>
      {/* File upload UI will go here */}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App 