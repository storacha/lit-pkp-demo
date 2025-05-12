import { useEffect, useState } from 'react';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import GoogleProvider from '@lit-protocol/lit-auth-client/src/lib/providers/GoogleProvider';
import { LIT_NETWORK } from '@lit-protocol/constants';

export function useGoogleOAuthRedirect() {
  const [authMethod, setAuthMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('provider') === 'google' && urlParams.get('id_token')) {
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const litNodeClient = new LitNodeClient({ litNetwork: LIT_NETWORK.DatilDev, debug: true });
          await litNodeClient.connect();
          const provider = new GoogleProvider({ litNodeClient, redirectUri: window.location.origin });
          const authMethod = await provider.authenticate();
          console.log("setting authMethod", authMethod);
          setAuthMethod(authMethod);
          // Optionally clear URL params
          window.history.replaceState(null, document.title, window.location.pathname);
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, []);

  return { authMethod, loading, error };
} 