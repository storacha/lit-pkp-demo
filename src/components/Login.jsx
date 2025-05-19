import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Spinner CSS (inline for simplicity)
const spinnerStyle = {
  width: 48,
  height: 48,
  border: '6px solid #e0e0e0',
  borderTop: '6px solid #357abd',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '0 auto',
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(255,255,255,0.7)',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

// Add keyframes for spinner
const spinnerKeyframes = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;

export function Login() {
  const { signInWithGoogle, isLoading, isAuthenticated, primaryPKP } = useAuth();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // Show loading state
  if (isLoading) {
    return (
      <div className="login-container">
        <style>{spinnerKeyframes}</style>
        <div style={overlayStyle}>
          <div style={spinnerStyle}></div>
          <div style={{ marginTop: 24, fontSize: 20, color: '#357abd', fontWeight: 500 }}>
            Minting PKP...
          </div>
        </div>
      </div>
    );
  }

  // Show PKP details if authenticated
  if (isAuthenticated && primaryPKP) {
    const pkpJson = JSON.stringify(primaryPKP, null, 2);
    const handleCopy = () => {
      navigator.clipboard.writeText(pkpJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };

    return (
      <div className="login-container pkp-panel-wide">
        <style>{spinnerKeyframes}</style>
        <h2>Your PKP is Minted! 🎉</h2>
        <div style={{ 
          marginBottom: "2rem", 
          width: "100%", 
          background: "#f4f8fb", 
          borderRadius: "8px", 
          padding: "1rem 1.2rem",
          boxShadow: "0 1px 4px rgba(31,38,135,0.06)"
        }}>
          <div style={{ fontWeight: 600, fontSize: "1.08rem", marginBottom: "0.5rem" }}>
            PKP Details
          </div>
          <div style={{ 
            fontFamily: "Fira Mono, monospace", 
            fontSize: "0.8rem", 
            background: "#fff", 
            borderRadius: 4, 
            padding: "8px 12px",
            wordBreak: "break-all",
            position: "relative"
          }}>
            <button
              className="copy-icon-btn" 
              onClick={handleCopy} 
              title="Copy to Clipboard"
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: "transparent",
                border: "none",
                fontSize: "1.4rem",
                cursor: "pointer",
                zIndex: 2,
                padding: "0.2rem 0.4rem",
                color: "#357abd",
                transition: "color 0.2s"
              }}
            >
              {copied ? (
                <span role="img" aria-label="Copied">✅</span>
              ) : (
                <span role="img" aria-label="Copy">📋</span>
              )}
            </button>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{pkpJson}</pre>
          </div>
        </div>
        <div style={{ 
          marginBottom: "2rem", 
          width: "100%", 
          background: "#f4f8fb", 
          borderRadius: "8px", 
          padding: "1rem 1.2rem",
          boxShadow: "0 1px 4px rgba(31,38,135,0.06)"
        }}>
          <div style={{ fontWeight: 600, fontSize: "1.08rem", marginBottom: "0.5rem" }}>
            Associated Account DID
          </div>
          <div style={{ 
            fontFamily: "Fira Mono, monospace", 
            fontSize: "0.9rem", 
            background: "#fff", 
            borderRadius: 4, 
            padding: "8px 12px",
            wordBreak: "break-all"
          }}>
            did:mailto:storacha.network:felipe
          </div>
        </div>
        <button 
          className="next-btn" 
          onClick={() => navigate('/upload')}
          style={{
            width: "100%",
            maxWidth: 240,
            fontSize: "1.1rem",
            margin: "0 auto 1.5rem auto",
            display: "block",
          }}
        >
          Go to Upload File Page
        </button>
      </div>
    );
  }

  // Show sign-in button if not authenticated
  return (
    <div className="login-container">
      <style>{spinnerKeyframes}</style>
      <h2>Welcome</h2>
      <p>
        This is a demo of Storacha & Lit Protocol integration.
      </p>
      <button
        className="next-btn"
        onClick={signInWithGoogle}
        disabled={isLoading}
        style={{
          width: "100%",
          maxWidth: 240,
          fontSize: "1.1rem",
          margin: "0 auto 1.5rem auto",
          display: "block",
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
} 