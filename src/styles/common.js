// Spinner styles
export const spinnerStyle = {
  width: 48,
  height: 48,
  border: '6px solid #e0e0e0',
  borderTop: '6px solid #357abd',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '0 auto',
};

export const overlayStyle = {
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

// Button styles
export const buttonContainerStyle = {
  display: "flex",
  gap: "1rem",
  justifyContent: "center",
};

export const buttonStyle = {
  width: "100%",
  maxWidth: 240,
  fontSize: "1.1rem",
  margin: "0 auto 1.5rem auto",
};

// Card styles
export const cardStyle = {
  marginBottom: "2rem",
  width: "100%",
  background: "#f4f8fb",
  borderRadius: "8px",
  padding: "1rem 1.2rem",
  boxShadow: "0 1px 4px rgba(31,38,135,0.06)",
};

export const titleStyle = {
  fontWeight: 600,
  fontSize: "1.08rem",
  marginBottom: "0.5rem",
};

export const contentStyle = {
  fontFamily: "Fira Mono, monospace",
  fontSize: "0.8rem",
  background: "#fff",
  borderRadius: 4,
  padding: "8px 12px",
  wordBreak: "break-all",
};

// Modal styles
export const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

export const modalContentStyle = {
  background: "white",
  padding: "2rem",
  borderRadius: "8px",
  width: "90%",
  maxWidth: "500px",
  position: "relative",
};

export const closeButtonStyle = {
  position: "absolute",
  top: "1rem",
  right: "1rem",
  background: "none",
  border: "none",
  fontSize: "1.5rem",
  cursor: "pointer",
}; 