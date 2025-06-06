import { useState, useEffect } from "react";
import useStorachaDecryptedDownload from "../hooks/useStorachaDecryptedDownload";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as Proof from "@storacha/client/proof";
import { parseLink } from "@ucanto/core";
import DelegationDetails from "./DelegationDetails";
import { getLitNodeClient } from '../utils/lit';
import { Signer } from "@ucanto/principal/ed25519";

// Spinner CSS (inline for simplicity)
const spinnerStyle = {
  width: 48,
  height: 48,
  border: "6px solid #e0e0e0",
  borderTop: "6px solid #357abd",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  margin: "0 auto",
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(255,255,255,0.7)",
  zIndex: 1000,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

// Add keyframes for spinner
const spinnerKeyframes = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;

export function DecryptFile() {
  const location = useLocation();
  const [cid, setCid] = useState(
    () => (location.state && location.state.cid) || ""
  );
  const [delegation, setDelegation] = useState("");
  const [delegationLoaded, setDelegationLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [parsedDelegations, setParsedDelegations] = useState(null);
  const {
    primaryPKP,
    primaryAuthMethod,
    recoveryPKP,
    recoveryAuthMethod,
  } = useAuth();
  const [decrypterDid, setDecrypterDid] = useState(null);
  const {
    loading,
    error,
    decryptedContent,
    loadDelegation,
    decryptFile,
    setError,
    setDecryptedUrl,
    setDecryptedContent,
  } = useStorachaDecryptedDownload();

  // Load delegation when it changes
  useEffect(() => {
    setDelegationLoaded(false);
    setError("");
    setDecryptedUrl(null);
    setDecryptedContent("");
    setParsedDelegations(null);
    if (delegation) {
      loadDelegation(delegation)
        .then(() => {
          setDelegationLoaded(true);
          // Parse and set delegations for display
          Proof.parse(delegation)
            .then((proof) => setParsedDelegations([proof]))
            .catch((err) =>
              console.error("Error parsing delegation for display:", err)
            );
        })
        .catch(() => setDelegationLoaded(false));
    }
  }, [delegation]);

  useEffect(() => {
    const signer = Signer.parse(import.meta.env.VITE_AGENT_PK);
    setDecrypterDid(signer.did());
  }, []);

  // Handle decryption
  const handleDecrypt = async () => {
    setError("");
    setDecryptedUrl(null);
    setDecryptedContent("");
    const litClient = await getLitNodeClient();
    const proof = await Proof.parse(delegation);
    const result = await proof.archive();
    if (result.error) {
      setError(result.error);
      return;
    }
    const link = parseLink(cid);
    const delegationData = result.ok;
    await decryptFile(
      link,
      delegationData,
      primaryPKP,
      primaryAuthMethod,
      litClient
    );
  };

  const handleRecoveryDecrypt = async () => {
    const litClient = await getLitNodeClient();
    const proof = await Proof.parse(delegation);
    const result = await proof.archive();
    if (result.error) {
      setError(result.error);
      return;
    }
    const link = parseLink(cid);
    const delegationData = result.ok;
    await decryptFile(link, delegationData, recoveryPKP, recoveryAuthMethod, litClient);
  };

  return (
    <div
      className="login-container pkp-panel-wide"
      style={{
        maxWidth: 820,
        margin: "2rem auto",
        boxShadow: "0 8px 32px 0 rgba(31,38,135,0.10)",
        borderRadius: 18,
        padding: "2.5rem 2rem",
        background: "#fff",
      }}
    >
      {/* Spinner keyframes style tag */}
      <style>{spinnerKeyframes}</style>
      {/* Loading overlay with spinner and message */}
      {loading && (
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
            Downloading & Decrypting...
          </div>
        </div>
      )}
      <h2 style={{ textAlign: "center", marginBottom: 8 }}>Decrypt File</h2>
      <p style={{ textAlign: "center", marginBottom: 24, color: "#444" }}>
        Enter the CID and your decrypt delegation proof. The file content will
        be downloaded, decrypted locally, and shown below.
      </p>
      {/* Blue panel for CID and Delegation */}
      <div
        style={{
          background: "#f4f8fb",
          borderRadius: 8,
          padding: "1.2rem",
          marginBottom: 18,
          width: "100%",
          maxWidth: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          boxShadow: "0 1px 4px rgba(31,38,135,0.06)",
        }}
      >
        <label
          htmlFor="did-input"
          style={{
            fontWeight: 500,
            fontSize: 15,
            color: "#357abd",
            marginBottom: 4,
            display: "block",
          }}
        >
          Application DID
        </label>
        <input
          id="did-input"
          type="text"
          value={decrypterDid}
          style={{
            width: "100%",
            padding: "0.7rem",
            borderRadius: 6,
            border: "1px solid #d0d7de",
            fontSize: 15,
            marginBottom: 12,
          }}
        />
        <label
          htmlFor="cid-input"
          style={{
            fontWeight: 500,
            fontSize: 15,
            color: "#357abd",
            marginBottom: 4,
            display: "block",
          }}
        >
          CID
        </label>
        <input
          id="cid-input"
          type="text"
          value={cid}
          onChange={(e) => setCid(e.target.value)}
          placeholder="Paste the file CID here..."
          style={{
            width: "100%",
            padding: "0.7rem",
            borderRadius: 6,
            border: "1px solid #d0d7de",
            fontSize: 15,
            marginBottom: 12,
          }}
        />

        <label
          htmlFor="delegation-input"
          style={{
            fontWeight: 500,
            fontSize: 15,
            marginBottom: 4,
            color: "#357abd",
            display: "block",
          }}
        >
          Delegation (Base64 CAR)
        </label>
        <textarea
          id="delegation-input"
          className="delegation-input"
          rows={5}
          value={delegation}
          onChange={(e) => setDelegation(e.target.value)}
          placeholder="Paste your delegation base64 CAR here..."
          style={{
            width: "100%",
            padding: "0.7rem",
            borderRadius: 6,
            border: "1px solid #d0d7de",
            fontSize: 15,
            resize: "vertical",
          }}
        />
      </div>

      {parsedDelegations && (
        <DelegationDetails delegations={parsedDelegations} />
      )}

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button
          className="next-btn"
          onClick={handleDecrypt}
          disabled={!cid || !delegationLoaded || loading}
          style={{
            width: "100%",
            maxWidth: 240,
            fontSize: "1.1rem",
            margin: "0 auto 1.5rem auto",
            display: "block",
          }}
        >
          {loading
            ? `Downloading & Decrypting with primary PKP...`
            : "Download & Decrypt (primary PKP)"}
        </button>
        <button
          className="next-btn"
          onClick={handleRecoveryDecrypt}
          disabled={!cid || !delegationLoaded || loading}
          style={{
            width: "100%",
            maxWidth: 240,
            fontSize: "1.1rem",
            margin: "0 auto 1.5rem auto",
            display: "block",
            backgroundColor: "#007bff",
          }}
        >
          {loading
            ? `Downloading & Decrypting with recovery PKP...`
            : "Download & Decrypt (recovery PKP)"}
        </button>
      </div>

      <div
        style={{
          marginTop: "1.5rem",
          background: "#f4f8fb",
          borderRadius: 8,
          padding: "1.2rem",
          boxShadow: "0 1px 4px rgba(31,38,135,0.06)",
          textAlign: "left",
          wordBreak: "break-word",
          position: "relative",
          width: "100%",
          maxWidth: 540,
          minHeight: 80,
          maxHeight: 220,
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          fontFamily: "Fira Mono, Consolas, Menlo, monospace",
          fontSize: "1rem",
          color: "#222",
          border: decryptedContent ? "1px solid #d0d7de" : "1px dashed #b3b3b3",
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        {decryptedContent ? (
          <span>{decryptedContent}</span>
        ) : (
          <span style={{ color: "#888", fontStyle: "italic" }}>
            Decrypted content will appear here.
          </span>
        )}
      </div>
      {error && (
        <div className="error-message" style={{ marginTop: "1rem" }}>
          {error}
        </div>
      )}
    </div>
  );
}
