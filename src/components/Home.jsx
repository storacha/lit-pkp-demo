import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PKPDetails } from "./PKPDetails";
import {
  spinnerStyle,
  overlayStyle,
  buttonContainerStyle,
  buttonStyle,
} from "../styles/common";

// Add keyframes for spinner
const spinnerKeyframes = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;

export function Home() {
  const {
    setupPrimaryPKP,
    setupRecoveryPKP,
    isLoading,
    isAuthenticated,
    primaryPKP,
    recoveryPKP,
    primaryAuthMethod,
    recoveryAuthMethod,
    logout,
  } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSettingUpRecovery, setIsSettingUpRecovery] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await setupPrimaryPKP();
    } catch (error) {
      console.error("Sign in error:", error);
      setIsSigningIn(false);
    }
  };

  const handleSetupRecovery = async () => {
    setIsSettingUpRecovery(true);
    try {
      await setupRecoveryPKP();
    } catch (error) {
      console.error("Recovery setup error:", error);
      setIsSettingUpRecovery(false);
    }
  };

  // Function to decode JWT and get email
  const getEmailFromAuthMethod = (authMethod) => {
    if (!authMethod?.accessToken) return null;
    try {
      const base64Url = authMethod.accessToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      return payload.email;
    } catch (err) {
      console.error("Error decoding JWT:", err);
      return null;
    }
  };

  // Show loading state during initial load, sign in, or PKP minting
  if (isLoading || isSigningIn || isSettingUpRecovery) {
    return (
      <div className="login-container">
        <style>{spinnerKeyframes}</style>
        <div style={overlayStyle}>
          <div style={spinnerStyle}></div>
          <div
            style={{
              marginTop: 24,
              fontSize: 20,
              color: "#357abd",
              fontWeight: 500,
            }}
          >
            {isSigningIn
              ? "Connecting to Google..."
              : isSettingUpRecovery
              ? "Connecting to Google..."
              : "Loading..."}
          </div>
        </div>
      </div>
    );
  }

  // Show PKP details if authenticated
  if (isAuthenticated && primaryPKP) {
    const primaryEmail = getEmailFromAuthMethod(primaryAuthMethod);
    const recoveryEmail = getEmailFromAuthMethod(recoveryAuthMethod);

    return (
      <div className="login-container pkp-panel-wide">
        <style>{spinnerKeyframes}</style>
        <h2>Your PKP is Minted! 🎉</h2>

        <PKPDetails
          title="Primary PKP Details"
          data={primaryPKP}
          email={primaryEmail}
          showCopyButton={true}
        />

        {recoveryPKP && (
          <PKPDetails
            title="Recovery PKP Details"
            email={recoveryEmail}
            data={recoveryPKP}
          />
        )}

        {/* <PKPDetails 
          title="Associated Account DID" 
          data="did:mailto:storacha.network:felipe" 
        /> */}

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
              onClick={handleSetupRecovery}
              style={{ ...buttonStyle, background: "#0077B6" }}
            >
              Setup Recovery PKP
            </button>
          )}
        </div>

        {recoveryPKP && (
          <div>
            <h2>Recovery PKP</h2>
            <p>Associated Email: {recoveryEmail || "Not available"}</p>
          </div>
        )}
      </div>
    );
  }

  // Show sign-in button if not authenticated
  return (
    <div className="login-container">
      <style>{spinnerKeyframes}</style>
      <h2>Welcome</h2>
      <p>This is a demo of Storacha & Lit PKPs integration</p>
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
