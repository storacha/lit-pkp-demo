import { useState } from 'react';
import { LitRelay } from '@lit-protocol/lit-auth-client';
import { LIT_NETWORK } from '@lit-protocol/constants';

export function useMintPKP(isRecovery = false) {
  const [pkp, setPkp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mintPKP = async (authMethod) => {
    if (!authMethod) {
      console.error('No auth method provided for PKP minting');
      return;
    }

    // Set loading state before any async operations
    setLoading(true);
    setError(null);

    try {
      const relayApiKey = import.meta.env.VITE_LIT_RELAY_API_KEY;
      if (!relayApiKey) {
        throw new Error('VITE_LIT_RELAY_API_KEY is not set. Please add it to your .env file and restart the dev server.');
      }

      console.log('Initializing LitRelay client...', { isRecovery });
      const litRelay = new LitRelay({
        relayUrl: LitRelay.getRelayUrl(LIT_NETWORK.DatilDev),
        relayApiKey,
      });

      console.log('Starting PKP minting process...', { 
        authMethodType: authMethod.authMethodType,
        isRecovery,
        hasAccessToken: !!authMethod.accessToken
      });

      const mintResult = await litRelay.mintPKPWithAuthMethods([authMethod], {
        pkpPermissionScopes: [[1]], // This scope allows signing any data
      });

      console.log('PKP minting successful:', { 
        tokenId: mintResult.pkpTokenId,
        publicKey: mintResult.pkpPublicKey,
        ethAddress: mintResult.pkpEthAddress,
        isRecovery
      });

      const pkp = {
        tokenId: mintResult.pkpTokenId,
        pkpPublicKey: mintResult.pkpPublicKey,
        pkpEthAddress: mintResult.pkpEthAddress,
        isRecovery
      };

      setPkp(pkp);
      return pkp;
    } catch (err) {
      console.error('Error minting PKP:', err);
      setError(err);
      throw err;
    } finally {
      // Keep loading state true until the component using this hook updates its state
      // This ensures the loading spinner stays visible during the entire process
      setTimeout(() => setLoading(false), 100);
    }
  };

  return { pkp, loading, error, mintPKP };
} 