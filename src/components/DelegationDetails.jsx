import React from 'react';

const DelegationDetails = ({ delegations }) => {
  if (!delegations || delegations.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        padding: "1.2rem",
        background: "#f4f8fb",
        borderRadius: 8,
        boxShadow: "0 1px 4px rgba(31,38,135,0.06)",
        fontSize: "0.55rem",
        width: "100%",
        minWidth: 0,
        marginLeft: "auto",
        marginRight: "auto",
        marginBottom: "15px",
      }}
    >
      <h3
        style={{
          fontSize: "0.7rem",
          fontWeight: 600,
          marginBottom: "0.7rem",
          color: "#357abd",
          lineHeight: 1.2,
        }}
      >
        Proofs
      </h3>
      {delegations.map((delegation, index) => (
        <div
          key={index}
          style={{
            marginBottom: "0.7rem",
            padding: "0.6rem",
            background: "#fff",
            borderRadius: "4px",
            border: "1px solid #e0e0e0",
            fontSize: "0.55rem",
            lineHeight: 1.3,
          }}
        >
          <div style={{ marginBottom: "0.3rem" }}>
            <strong>Issuer:</strong>{" "}
            <span
              style={{
                fontFamily: "Fira Mono, monospace",
                fontSize: "0.55rem",
                color: "#357abd",
                wordBreak: "break-all",
              }}
            >
              {delegation.issuer.did() || "—"}
            </span>
          </div>
          <div style={{ marginBottom: "0.3rem" }}>
            <strong>Audience:</strong>{" "}
            <span
              style={{
                fontFamily: "Fira Mono, monospace",
                fontSize: "0.55rem",
                color: "#357abd",
                wordBreak: "break-all",
              }}
            >
              {delegation.audience.did() || "—"}
            </span>
          </div>
          <div>
            <strong>Capabilities:</strong>
            <ul
              style={{
                margin: "0.3rem 0 0 1.2rem",
                padding: 0,
                listStyle: "disc",
                fontSize: "0.55rem",
              }}
            >
              {delegation.capabilities?.map((cap, capIndex) => (
                <li
                  key={capIndex}
                  style={{
                    marginBottom: "0.15rem",
                    fontSize: "0.55rem",
                    wordBreak: "break-all",
                  }}
                >
                  {" "}
                  <b>can</b>{" "}
                  <code
                    style={{
                      background: "#f4f8fb",
                      padding: "0.05rem 0.2rem",
                      borderRadius: "2px",
                      fontFamily: "Fira Mono, monospace",
                      fontSize: "0.55rem",
                    }}
                  >
                    {cap.can}
                  </code>
                  <br />
                  <b>with</b>{" "}
                  <code
                    style={{
                      background: "#f4f8fb",
                      padding: "0.05rem 0.2rem",
                      borderRadius: "2px",
                      fontFamily: "Fira Mono, monospace",
                      fontSize: "0.55rem",
                    }}
                  >
                    {cap.with}
                  </code>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DelegationDetails; 