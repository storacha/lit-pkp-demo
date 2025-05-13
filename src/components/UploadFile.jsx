import { useState, useEffect } from 'react';
import useStorachaEncryptedUpload from '../hooks/useStorachaEncryptedUpload';

export function UploadFile() {
  const [delegation, setDelegation] = useState('');
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(1);
  const envDelegation = import.meta.env.VITE_DELEGATION_CAR_BASE64;

  const {
    loading, error, spaceDid, spaceName, cid,
    loadDelegation, encryptAndUpload, setError
  } = useStorachaEncryptedUpload();

  // If env delegation is present and loaded, skip to step 2
  useEffect(() => {
    if (envDelegation && spaceDid) {
      setStep(2);
    }
  }, [envDelegation, spaceDid]);

  // Step 1: Handle delegation input
  const handleDelegationChange = (e) => {
    setDelegation(e.target.value);
    setError('');
  };

  const handleLoadDelegation = async () => {
    try {
      await loadDelegation(delegation);
      setStep(2);
    } catch (err) {
      // error is handled in hook
    }
  };

  // Step 2: Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  // Step 3: Encrypt and upload
  const handleEncryptAndUpload = async () => {
    try {
      await encryptAndUpload(file);
      setStep(3);
    } catch (err) {
      // error is handled in hook
    }
  };

  return (
    <div className="login-container pkp-panel-wide">
      <h2>Upload File</h2>
      <p>
        This is where you will upload and encrypt files with Storacha & Lit
        Protocol.
      </p>

      {/* Step 1: Delegation input (skip if env var is present and loaded) */}
      {step === 1 && !envDelegation && (
        <>
          <label htmlFor="delegation-input">
            <b>Paste Delegation (Base64 CAR)</b>
          </label>
          <textarea
            id="delegation-input"
            className="delegation-input"
            rows={6}
            value={delegation}
            onChange={handleDelegationChange}
            placeholder="Paste your delegation base64 CAR here..."
            style={{ width: "100%", marginBottom: "1rem" }}
          />
          <button
            className="next-btn"
            onClick={handleLoadDelegation}
            disabled={!delegation || loading}
          >
            {loading ? "Loading..." : "Load Delegation"}
          </button>
        </>
      )}

      {/* Step 2: File upload */}
      {step === 2 && (
        <>
          <div
            style={{
              marginBottom: "1.5rem",
              width: "100%",
              background: "#f4f8fb",
              borderRadius: "8px",
              padding: "1rem 1.2rem",
              boxShadow: "0 1px 4px rgba(31,38,135,0.06)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "0.5rem",
              textAlign: "left",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: "1.08rem" }}>
              Selected Space/Bucket
              <div style={{ marginTop: 4 }}>
                <span style={{ color: "#357abd" }}>
                  {spaceName ? spaceName : <i>Unnamed</i>}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontFamily: "Fira Mono, monospace",
                  fontSize: "0.58rem",
                  background: "#fff",
                  borderRadius: 4,
                  padding: "2px 6px",
                  wordBreak: "break-all",
                  maxWidth: 420,
                  display: "inline-block",
                }}
              >
                {spaceDid}
              </span>
              <button
                type="button"
                title="Copy DID"
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  color: "#357abd",
                  padding: 0,
                }}
                onClick={() => {
                  navigator.clipboard.writeText(spaceDid);
                }}
              >
                📋
              </button>
            </div>
          </div>

          {/* Improved file upload box */}
          <div
            style={{
              width: "100%",
              background: "#f4f8fb",
              borderRadius: "8px",
              padding: "1.2rem 1.2rem 1.5rem 1.2rem",
              boxShadow: "0 1px 4px rgba(31,38,135,0.06)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "1.2rem",
              marginBottom: "1.5rem",
              textAlign: "left",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: "1.08rem",
              }}
            >
              Select a file to encrypt and upload
            </div>
            <div style={{ position: "relative", width: "100%" }}>
              <label
                htmlFor="file-upload"
                style={{
                  display: "inline-block",
                  padding: "0.6rem 1.2rem",
                  background: "#357abd",
                  color: "#fff",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 500,
                  marginBottom: 8,
                }}
              >
                📁 Choose File
              </label>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              {file && (
                <div
                  style={{
                    fontSize: "0.95rem",
                    color: "#357abd",
                    marginTop: 4,
                  }}
                >
                  Selected: <b>{file.name}</b>
                </div>
              )}
            </div>
          </div>
          <div
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <button
              className="next-btn"
              onClick={handleEncryptAndUpload}
              disabled={!file || loading}
              style={{ width: "100%", maxWidth: 240, fontSize: "1.1rem" }}
            >
              {loading ? "Encrypting & Uploading..." : "Encrypt & Upload"}
            </button>
          </div>
        </>
      )}

      {/* Step 3: Show CID */}
      {step === 3 && cid && (
        <div style={{ marginTop: "2rem" }}>
          <b>File uploaded!</b>
          <div>
            CID: <code>{cid}</code>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message" style={{ marginTop: "1rem" }}>
          {error}
        </div>
      )}
    </div>
  );
} 