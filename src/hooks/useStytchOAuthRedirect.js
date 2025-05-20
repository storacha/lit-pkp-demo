import { useEffect, useState } from "react";
import { useStytch } from "@stytch/react";
import { StytchAuthFactorOtpProvider } from '@lit-protocol/lit-auth-client';
import { getLitNodeClient } from '../utils/lit';

export function useStytchOAuthRedirect() {
  const [authMethod, setAuthMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const stytch = useStytch();

  const authenticateStytch = async (token) => {
    try {
      setLoading(true);
      setError(null);
      
      // Authenticate with Stytch
      const response = await stytch.magicLinks.authenticate(token, {
        session_duration_minutes: 60
      });

      // Get Lit client
      const litNodeClient = await getLitNodeClient();
      
      // Create Stytch provider
      const provider = new StytchAuthFactorOtpProvider(
        {
          litNodeClient,
        },
        { appId: import.meta.env.VITE_STYTCH_PROJECT_ID },
        'email'
      );

      // Get auth method
      const authMethod = await provider.authenticate({
        accessToken: response.session_jwt
      });

      setAuthMethod(authMethod);
      
      // Clean up URL
      window.history.replaceState(null, document.title, window.location.pathname);
    } catch (err) {
      console.error("Error authenticating Stytch token", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      return;
    }
    authenticateStytch(token);
  }, [stytch]);

  return { authMethod, loading, error };
} 