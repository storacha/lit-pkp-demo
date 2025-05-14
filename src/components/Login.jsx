import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const { isAuthenticated, isLoading, oauthError, mintError, primaryPKP, signInWithGoogle } = useAuth();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="login-container">
        <h1>Lit PKP & Storacha Encryption Demo</h1>
        <div>Loading... Please wait while we authenticate and mint your PKP.</div>
      </div>
    );
  }

  // Only show error if not authenticated and no PKP
  if ((oauthError || mintError) && (!isAuthenticated || !primaryPKP)) {
    return (
      <div className="login-container">
        <h1>Lit PKP & Storacha Encryption Demo</h1>
        <div className="error-message">{(oauthError || mintError).message}</div>
        <button onClick={signInWithGoogle} className="google-signin-button">
          Try Again
        </button>
      </div>
    );
  }

  if (!isAuthenticated || !primaryPKP) {
    // Show sign-in
    return (
      <div className="login-container">
        <h1>Lit PKP & Storacha Encryption Demo</h1>
        <button onClick={signInWithGoogle} className="google-signin-button">
          Sign in with Google
        </button>
      </div>
    );
  }

  // Show PKP JSON content in a box after successful mint
  const pkpJson = JSON.stringify(primaryPKP, null, 2);
  const handleCopy = () => {
    navigator.clipboard.writeText(pkpJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const goToUpload = () => {
    navigate('/upload');
  };

  return (
    <div className="login-container pkp-panel-wide">
      <h2>Your PKP is Minted!</h2>
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
      <button className="next-btn" onClick={goToUpload}>
        Go to Upload File Page
      </button>
    </div>
  );
} 