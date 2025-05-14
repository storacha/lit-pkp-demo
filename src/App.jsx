import { AuthProvider } from './context/AuthContext'
import { Login } from './components/Login'
import { UploadFile } from './components/UploadFile'
import { DecryptFile } from './components/DecryptFile'
import { UploadSuccess } from './components/UploadSuccess'
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
            <Route path="/decrypt" element={<DecryptFile />} />
            <Route path="/upload-success" element={<UploadSuccess />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App 