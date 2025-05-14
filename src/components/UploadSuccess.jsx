import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export function UploadSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const cid = location.state && location.state.cid;

  useEffect(() => {
    if (!cid) {
      navigate('/upload');
    }
  }, [cid, navigate]);

  if (!cid) {
    return null;
  }

  const handleGoToDecrypt = () => {
    navigate('/decrypt', { state: { cid } });
  };

  return (
    <div className="login-container pkp-panel-wide">
      <div
        style={{
          marginTop: "2rem",
          background: "#f4f8fb",
          borderRadius: 8,
          padding: "1.2rem 1.2rem 1.5rem 1.2rem",
          boxShadow: "0 1px 4px rgba(31,38,135,0.06)",
          textAlign: "left",
        }}
      >
        <div style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: 8 }}>
          ✅ File uploaded!
        </div>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontWeight: 500 }}>CID:</span>
          <span
            style={{
              fontFamily: "Fira Mono, monospace",
              fontSize: "0.5rem",
              background: "#fff",
              borderRadius: 4,
              padding: "2px 6px",
              marginLeft: 8,
              wordBreak: "break-all",
            }}
          >
            {cid}
          </span>
          <button
            type="button"
            title="Copy CID"
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "1.1rem",
              color: "#357abd",
              marginLeft: 6,
            }}
            onClick={() => navigator.clipboard.writeText(cid)}
          >
            📋
          </button>
        </div>
        <a
          href={`https://storacha.link/ipfs/${cid}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: 8,
            padding: "0.6rem 1.2rem",
            background: "#357abd",
            color: "#fff",
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          🔗 View File Metadata
        </a>
      </div>

      <button
        className="next-btn"
        style={{
          marginTop: 16,
          width: "100%",
          maxWidth: 260,
          fontSize: "1.1rem",
        }}
        onClick={handleGoToDecrypt}
      >
        Go to Decrypt File
      </button>
    </div>
  );
} 