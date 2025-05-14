import { useState, useEffect } from 'react';
import useStorachaDecryptedDownload from '../hooks/useStorachaDecryptedDownload';
import { useLocation } from 'react-router-dom';

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

export function DecryptFile() {
  const location = useLocation();
  const [cid, setCid] = useState(() => (location.state && location.state.cid) || '');
  const [delegation, setDelegation] = useState('');
  const [delegationLoaded, setDelegationLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const {
    loading, error, decryptedUrl, loadDelegation, decryptFile, setError, setDecryptedUrl
  } = useStorachaDecryptedDownload();
  const [decryptedContent, setDecryptedContent] = useState('');

  // Load delegation when it changes
  useEffect(() => {
    setDelegationLoaded(false);
    setError('');
    setDecryptedUrl(null);
    setDecryptedContent('');
    if (delegation) {
      loadDelegation(delegation)
        .then(() => setDelegationLoaded(true))
        .catch(() => setDelegationLoaded(false));
    }
  }, [delegation]);

  // Handle decryption
  const handleDecrypt = async () => {
    setError('');
    setDecryptedUrl(null);
    setDecryptedContent('');
    // Placeholder: simulate decryption and show content
    // Replace with real decryption logic
    setTimeout(() => {
      setDecryptedContent('This is the decrypted file content!');
    }, 1200);
  };

  // Copy decrypted content
  const handleCopy = () => {
    navigator.clipboard.writeText(decryptedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div
      className="login-container pkp-panel-wide"
      style={{
        maxWidth: 620,
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
          <div style={{ marginTop: 24, fontSize: 20, color: '#357abd', fontWeight: 500 }}>
            Downloading & Decrypting...
          </div>
        </div>
      )}
      <h2 style={{ textAlign: "center", marginBottom: 8 }}>Decrypt File</h2>
      <p style={{ textAlign: "center", marginBottom: 24, color: "#444" }}>
        Enter the CID and your delegation proof. The file content will be downloaded, decrypted locally, and shown below.
      </p>
      <div style={{ marginBottom: 18, width: 520, maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
        <label htmlFor="cid-input" style={{ fontWeight: 500, fontSize: 15, marginBottom: 4, display: "block" }}>
          CID
        </label>
        <input
          id="cid-input"
          type="text"
          value={cid}
          onChange={e => setCid(e.target.value)}
          placeholder="Paste the file CID here..."
          style={{
            width: "100%",
            padding: "0.7rem",
            borderRadius: 6,
            border: "1px solid #d0d7de",
            fontSize: 15,
            marginBottom: 0,
          }}
        />
      </div>
      <div style={{ marginBottom: 24, width: 520, maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
        <label htmlFor="delegation-input" style={{ fontWeight: 500, fontSize: 15, marginBottom: 4, display: "block" }}>
          Delegation (Base64 CAR)
        </label>
        <textarea
          id="delegation-input"
          className="delegation-input"
          rows={5}
          value={delegation}
          onChange={e => setDelegation(e.target.value)}
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
        {loading ? "Downloading & Decrypting..." : "Download & Decrypt"}
      </button>
      {decryptedContent && (
        <div style={{
          marginTop: '2rem',
          background: '#f4f8fb',
          borderRadius: 8,
          padding: '1.2rem',
          boxShadow: '0 1px 4px rgba(31,38,135,0.06)',
          textAlign: 'left',
          wordBreak: 'break-word',
          position: 'relative'
        }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Decrypted Content</div>
          <button
            onClick={handleCopy}
            title="Copy to Clipboard"
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'none',
              border: 'none',
              fontSize: '1.2rem',
              color: '#357abd',
              cursor: 'pointer',
              zIndex: 2
            }}
          >
            {copied ? '✅' : '📋'}
          </button>
          <pre style={{
            background: '#fff',
            borderRadius: 6,
            padding: '1rem',
            fontSize: '1rem',
            fontFamily: 'Fira Mono, Consolas, Menlo, monospace',
            margin: 0,
            overflowX: 'auto',
            minHeight: 80
          }}>{decryptedContent}</pre>
        </div>
      )}
      {error && <div className="error-message" style={{ marginTop: '1rem' }}>{error}</div>}
    </div>
  );
} 