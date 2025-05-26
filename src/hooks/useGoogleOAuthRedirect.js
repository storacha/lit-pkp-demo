import { useState, useEffect } from 'react';
import { AuthMethodType } from '@lit-protocol/constants';

export function useGoogleOAuthRedirect(isRecovery = false) {
  const [authMethod, setAuthMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    const processOAuthRedirect = async () => {
      try {
        // Get URL parameters directly from window.location
        const params = new URLSearchParams(window.location.search);
        const provider = params.get('provider');
        const idToken = params.get('id_token');
        const accessToken = params.get('access_token');
        const state = params.get('state');
        
        console.log('OAuth Redirect Hook:', {
          isRecovery,
          state,
          isRecoveryFlow: state === 'recovery=true',
          hasProvider: !!provider,
          hasIdToken: !!idToken,
          hasAccessToken: !!accessToken,
          hasProcessed,
          rawParams: Object.fromEntries(params.entries())
        });

        // Skip if we've already processed this flow
        if (hasProcessed) {
          console.log(`Skipping ${isRecovery ? 'recovery' : 'primary'} flow - already processed`);
          setLoading(false);
          return;
        }

        // Skip if no provider
        if (!provider) {
          console.log('No provider found in URL params');
          setLoading(false);
          return;
        }

        // Skip if this flow doesn't match our expected flow
        const isRecoveryFlow = state === 'recovery=true';
        if (isRecovery !== isRecoveryFlow) {
          console.log(`Skipping ${isRecovery ? 'recovery' : 'primary'} flow - state mismatch`);
          setLoading(false);
          return;
        }

        // Create the auth method
        const authMethod = {
          authMethodType: AuthMethodType.GoogleJwt,
          accessToken: idToken // Use id_token for JWT auth
        };

        console.log(`Setting ${isRecovery ? 'recovery' : 'primary'} authMethod:`, {
          ...authMethod,
          accessToken: authMethod.accessToken ? 'present' : 'missing'
        });
        setAuthMethod(authMethod);
        setHasProcessed(true);

        // Clear URL parameters after successful processing
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error(`Error in ${isRecovery ? 'recovery' : 'primary'} authentication:`, err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    processOAuthRedirect();
  }, [isRecovery, hasProcessed]);

  return { authMethod, loading, error };
} 