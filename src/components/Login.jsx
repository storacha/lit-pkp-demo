import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PKPDetails } from './PKPDetails';
import { Modal } from './Modal';
import { spinnerStyle, overlayStyle, buttonContainerStyle, buttonStyle } from '../styles/common';

// Add keyframes for spinner
const spinnerKeyframes = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;

export function Login() {
  const { setupPrimaryPKP, setupRecoveryPKP, isLoading, isAuthenticated, primaryPKP, recoveryPKP } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await setupPrimaryPKP();
    } catch (error) {
      console.error('Sign in error:', error);
      setIsSigningIn(false);
    }
  };

  // Show loading state
  if (isLoading || isSigningIn) {
    return (
      <div className="login-container">
        <style>{spinnerKeyframes}</style>
        <div style={overlayStyle}>
          <div style={spinnerStyle}></div>
          <div style={{ marginTop: 24, fontSize: 20, color: '#357abd', fontWeight: 500 }}>
            {isSigningIn ? 'Connecting to Google...' : 'Minting PKP...'}
          </div>
        </div>
      </div>
    );
  }

  // Show PKP details if authenticated
  if (isAuthenticated && primaryPKP) {
    return (
      <div className="login-container pkp-panel-wide">
        <style>{spinnerKeyframes}</style>
        <h2>Your PKP is Minted! 🎉</h2>
        
        <PKPDetails 
          title="Primary PKP Details" 
          data={primaryPKP} 
          showCopyButton={true} 
        />

        {recoveryPKP && (
          <PKPDetails 
            title="Recovery PKP Details" 
            data={recoveryPKP} 
          />
        )}

        <PKPDetails 
          title="Associated Account DID" 
          data="did:mailto:storacha.network:felipe" 
        />

        <div style={buttonContainerStyle}>
          <button 
            className="next-btn" 
            onClick={() => navigate("/upload")}
            style={buttonStyle}
          >
            Go to Upload File Page
          </button>
          
          {!recoveryPKP && (
            <button 
              className="next-btn" 
              onClick={() => setupRecoveryPKP()}
              style={{ ...buttonStyle, background: "#0077B6" }}
            >
              Setup Recovery PKP
            </button>
          )}
        </div>
      </div>
    );
  }

  // Show sign-in button if not authenticated
  return (
    <div className="login-container">
      <style>{spinnerKeyframes}</style>
      <h2>Welcome</h2>
      <p>This is a demo of Storacha & Lit Protocol integration.</p>
      <button
        className="next-btn"
        onClick={handleSignIn}
        disabled={isSigningIn}
        style={buttonStyle}
      >
        Sign in with Google
      </button>
    </div>
  );
} 