import { useState, useEffect } from 'react';
import useStorachaEncryptedUpload from '../hooks/useStorachaEncryptedUpload';
import { useNavigate } from 'react-router-dom';
import { getLitNodeClient } from '../utils/lit';

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

export function EncryptFile() {
  const [delegation, setDelegation] = useState('');
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [step, setStep] = useState(1);
  const envDelegation = import.meta.env.VITE_DELEGATION_CAR_BASE64;

  const {
    loading, error, spaceDid, spaceName,
    loadDelegation, encryptAndUpload, setError
  } = useStorachaEncryptedUpload();

  const navigate = useNavigate();

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
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError('');

    if (selectedFile) {
      if (selectedFile.type.startsWith('text/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFileContent(e.target.result);
        };
        reader.onerror = (error) => {
          console.error('Error reading file:', error);
          setFileContent(null);
        };
        reader.readAsText(selectedFile);
      } else {
        setFileContent(`Binary file: ${(selectedFile.size / 1024).toFixed(2)} KB`);
      }
    }
  };

  // Step 3: Encrypt and upload
  const handleEncryptAndUpload = async () => {
    try {
      const litClient = await getLitNodeClient();
      const uploadedCid = await encryptAndUpload(file, litClient);
      navigate("/upload-success", { state: { cid: uploadedCid.toString() } });
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Unknown error');
    }
  };

  return (
    <div className="login-container pkp-panel-wide">
      {/* Spinner keyframes style tag */}
      <style>{spinnerKeyframes}</style>
      {/* Loading overlay with spinner and message */}
      {loading && step === 2 && (
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
            Encrypting & Uploading...
          </div>
        </div>
      )}
      {step !== 3 && (
        <>
          <h2>Upload File</h2>
          <p>
            This is where you will upload and encrypt files with Storacha & Lit
            Protocol.
          </p>
        </>
      )}

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
              Selected Space
              <div style={{ marginTop: 4 }}>
                <span style={{ color: "#357abd" }}>
                  {spaceName ? <b>{spaceName}</b> : <i>Unnamed</i>}
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

              {/* File Content Preview */}
              {file && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    border: "1px solid #dee2e6",
                    width: "100%"
                  }}
                >
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                      maxHeight: "300px",
                      overflow: "auto",
                      backgroundColor: "#fff",
                      padding: "10px",
                      borderRadius: "4px",
                      border: "1px solid #dee2e6",
                      margin: 0
                    }}
                  >
                    {fileContent || "Loading content..."}
                  </pre>
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

      {/* Only show error if not on step 3 */}
      {error && step !== 3 && (
        <div className="error-message" style={{ marginTop: "1rem" }}>
          {error}
        </div>
      )}
    </div>
  );
} 