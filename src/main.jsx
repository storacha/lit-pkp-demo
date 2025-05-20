import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { StytchProvider } from "@stytch/react";
import { StytchUIClient } from "@stytch/vanilla-js";

const stytchOptions = {
  cookieOptions: {
    opaqueTokenCookieName: "stytch_session",
    jwtCookieName: "stytch_session_jwt",
    path: "",
    availableToSubdomains: false,
    domain: "",
  },
};

const stytchClient = new StytchUIClient(
  import.meta.env.VITE_STYTCH_PUBLIC_TOKEN,
  stytchOptions
);
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    {/* <StytchProvider stytch={stytchClient}> */}
      <App />
    {/* </StytchProvider> */}
  </React.StrictMode>
); 