import { useState } from 'react';
import { cardStyle, titleStyle, contentStyle } from '../styles/common';

export function PKPDetails({ title, data, showCopyButton = false, email = null }) {
  const [copied, setCopied] = useState(false);
  const jsonData = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    if (showCopyButton) {
      navigator.clipboard.writeText(jsonData);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>{title} {email ? <span style={{ fontSize: '0.8em' }}>({email})</span> : ''}</div>
      <div style={{ ...contentStyle, position: showCopyButton ? "relative" : "static" }}>
        {showCopyButton && (
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
              transition: "color 0.2s",
            }}
          >
            {copied ? (
              <span role="img" aria-label="Copied">✅</span>
            ) : (
              <span role="img" aria-label="Copy">📋</span>
            )}
          </button>
        )}
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{jsonData}</pre>
      </div>
    </div>
  );
} 