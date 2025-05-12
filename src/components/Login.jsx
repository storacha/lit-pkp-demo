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
      <p>Below is your PKP JSON. You can copy and save it for your records.</p>
      <div className="pkp-json-panel">
        <button className="copy-icon-btn" onClick={handleCopy} title="Copy to Clipboard">
          {copied ? (
            <span role="img" aria-label="Copied">✅</span>
          ) : (
            <span role="img" aria-label="Copy">📋</span>
          )}
        </button>
        <pre className="pkp-json-box">{pkpJson}</pre>
      </div>
      <button className="next-btn" onClick={goToUpload} style={{ marginTop: '2rem' }}>
        Go to Upload File Page
      </button>
    </div>
  );
} 