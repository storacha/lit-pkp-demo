import { useState, useCallback } from 'react';
import { LitRelay } from '@lit-protocol/lit-auth-client';
import { LIT_NETWORK } from '@lit-protocol/constants';

export function useMintPKP() {
  const [pkp, setPKP] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const relayApiKey = import.meta.env.VITE_LIT_RELAY_API_KEY;
  if (!relayApiKey) {
    console.error('VITE_LIT_RELAY_API_KEY is not set. Please add it to your .env file and restart the dev server.');
  }

  const mintPKP = useCallback(async (authMethod) => {
    setLoading(true);
    setError(null);
    try {
      if (!relayApiKey) {
        throw new Error('VITE_LIT_RELAY_API_KEY is not set. Please add it to your .env file and restart the dev server.');
      }
      const litRelay = new LitRelay({
        relayUrl: LitRelay.getRelayUrl(LIT_NETWORK.DatilDev),
        relayApiKey,
      });
      console.log("authMethod", authMethod);
      console.log("litRelay", litRelay);
      const pkp = await litRelay.mintPKPWithAuthMethods([authMethod], {
        pkpPermissionScopes: [[1]], // This scope allows signing any data
        
      });
      console.log("pkp", pkp);
      setPKP(pkp);
      return pkp;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [relayApiKey]);

  return { pkp, loading, error, mintPKP };
} 