import { AuthProvider } from './context/AuthContext'
import { Home } from './components/Home'
import { EncryptFile } from './components/EncryptFile'
import { DecryptFile } from './components/DecryptFile'
import { UploadSuccess } from './components/UploadSuccess'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LogoutButton } from './components/LogoutButton'
import { useAuth } from './context/AuthContext'

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  
  return (
    <div style={{ width: "100vw", background: "transparent" }}>
      {isAuthenticated &&
        !isLoading && (
          <header
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              padding: "1rem 2rem 0.5rem 2rem",
              background: "transparent",
              boxSizing: "border-box",
              minHeight: 0,
            }}
          >
            <LogoutButton />
          </header>
        )}
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<EncryptFile />} />
          <Route path="/decrypt" element={<DecryptFile />} />
          <Route path="/upload-success" element={<UploadSuccess />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App; 