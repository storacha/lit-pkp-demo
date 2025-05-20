import { modalOverlayStyle, modalContentStyle, closeButtonStyle } from '../styles/common';

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <button onClick={onClose} style={closeButtonStyle}>
          ×
        </button>
        {title && <h3 style={{ marginBottom: "1rem" }}>{title}</h3>}
        {children}
      </div>
    </div>
  );
} 