import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import GoogleProvider from '@lit-protocol/lit-auth-client/src/lib/providers/GoogleProvider';
import { useGoogleOAuthRedirect } from '../hooks/useGoogleOAuthRedirect';
import { useMintPKP } from '../hooks/useMintPKP';
import { LIT_NETWORK, LIT_ABILITY } from '@lit-protocol/constants';
import {
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { getLitNodeClient } from '../utils/lit';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // State hooks - keep them together at the top
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [primaryPKP, setPrimaryPKP] = useState(null);
  const [recoveryPKP, setRecoveryPKP] = useState(null);
  const [primaryAuthMethod, setPrimaryAuthMethod] = useState(null);
  const [recoveryAuthMethod, setRecoveryAuthMethod] = useState(null);
  const [error, setError] = useState(null);

  // Refs - keep them together
  const litNodeClientRef = useRef(null);
  const hasAuthenticated = useRef(false);

  // OAuth hooks - keep them together
  const { authMethod: primaryOAuthMethod, loading: primaryOAuthLoading, error: primaryOAuthError } = useGoogleOAuthRedirect();
  const { authMethod: recoveryOAuthMethod, loading: recoveryOAuthLoading, error: recoveryOAuthError } = useGoogleOAuthRedirect();

  // Minting hooks - keep them together
  const { mintPKP: mintPrimaryPKP, loading: mintPrimaryLoading, error: mintPrimaryError } = useMintPKP(false);
  const { mintPKP: mintRecoveryPKP, loading: mintRecoveryLoading, error: mintRecoveryError } = useMintPKP(true);

  // Update loading state based on all possible loading states
  useEffect(() => {
    setIsLoading(primaryOAuthLoading || recoveryOAuthLoading || mintPrimaryLoading || mintRecoveryLoading);
  }, [primaryOAuthLoading, recoveryOAuthLoading, mintPrimaryLoading, mintRecoveryLoading]);

  // Initialize Lit client
  useEffect(() => {
    const initLitClient = async () => {
      try {
        const client = await getLitNodeClient();
        litNodeClientRef.current = client;
      } catch (err) {
        console.error('Failed to initialize Lit client:', err);
        setError(err);
      }
    };

    initLitClient();
  }, []);

  // Handle primary PKP minting
  useEffect(() => {
    const handlePrimaryPKP = async () => {
      console.log('Checking primary PKP minting conditions:', {
        hasPrimaryOAuthMethod: !!primaryOAuthMethod,
        hasPrimaryPKP: !!primaryPKP,
        authMethodType: primaryOAuthMethod?.authMethodType,
        hasAccessToken: !!primaryOAuthMethod?.accessToken
      });

      if (primaryOAuthMethod && !primaryPKP) {
        try {
          console.log('Starting primary PKP minting process');
          setPrimaryAuthMethod(primaryOAuthMethod);
          setIsLoading(true);

          const pkp = await mintPrimaryPKP(primaryOAuthMethod);
          console.log('Primary PKP minted successfully:', pkp);
          
          setPrimaryPKP(pkp);
          setIsAuthenticated(true);
          
          // Store PKP data in localStorage
          localStorage.setItem('primaryPKP', JSON.stringify(pkp));
          localStorage.setItem('primaryAuthMethod', JSON.stringify(primaryOAuthMethod));
        } catch (err) {
          console.error('Failed to mint primary PKP:', err);
          setError(err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    handlePrimaryPKP();
  }, [primaryOAuthMethod, primaryPKP, mintPrimaryPKP]);

  // Handle recovery PKP minting
  useEffect(() => {
    const handleRecoveryPKP = async () => {
      console.log('Checking recovery PKP minting conditions:', {
        hasRecoveryOAuthMethod: !!recoveryOAuthMethod,
        hasRecoveryPKP: !!recoveryPKP,
        authMethodType: recoveryOAuthMethod?.authMethodType,
        hasAccessToken: !!recoveryOAuthMethod?.accessToken
      });

      if (recoveryOAuthMethod && !recoveryPKP) {
        try {
          console.log('Starting recovery PKP minting process');
          setRecoveryAuthMethod(recoveryOAuthMethod);
          setIsLoading(true);

          const pkp = await mintRecoveryPKP(recoveryOAuthMethod);
          console.log('Recovery PKP minted successfully:', pkp);
          setRecoveryPKP(pkp);
          localStorage.setItem('recoveryPKP', JSON.stringify(pkp));
          localStorage.setItem('recoveryAuthMethod', JSON.stringify(recoveryOAuthMethod));
        } catch (err) {
          console.error('Failed to mint recovery PKP:', err);
          setError(err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleRecoveryPKP();
  }, [recoveryOAuthMethod, recoveryPKP, mintRecoveryPKP]);

  // Load PKP data from localStorage on mount
  useEffect(() => {
    const loadPKPData = () => {
      try {
        const storedPrimaryPKP = localStorage.getItem('primaryPKP');
        const storedRecoveryPKP = localStorage.getItem('recoveryPKP');
        const storedPrimaryAuthMethod = localStorage.getItem('primaryAuthMethod');
        const storedRecoveryAuthMethod = localStorage.getItem('recoveryAuthMethod');

        if (storedPrimaryPKP) {
          setPrimaryPKP(JSON.parse(storedPrimaryPKP));
          setIsAuthenticated(true);
          hasAuthenticated.current = true;
        }
        if (storedRecoveryPKP) {
          setRecoveryPKP(JSON.parse(storedRecoveryPKP));
        }
        if (storedPrimaryAuthMethod) {
          setPrimaryAuthMethod(JSON.parse(storedPrimaryAuthMethod));
        }
        if (storedRecoveryAuthMethod) {
          setRecoveryAuthMethod(JSON.parse(storedRecoveryAuthMethod));
        }
      } catch (err) {
        console.error('Failed to load PKP data from localStorage:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPKPData();
  }, []);

  // Setup functions
  const setupPrimaryPKP = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const litNodeClient = await getLitNodeClient();
      console.log('Setting up primary PKP...');
      const provider = new GoogleProvider({
        litNodeClient,
        redirectUri: window.location.origin + window.location.pathname,
        state: '' // Empty string for primary to ensure no state is set
      });
      await provider.signIn();
    } catch (err) {
      console.error('Failed to setup primary PKP:', err);
      setError(err);
      setIsLoading(false);
    }
  };

  const setupRecoveryPKP = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const litNodeClient = await getLitNodeClient();
      console.log('Setting up recovery PKP...');
      const provider = new GoogleProvider({
        litNodeClient,
        redirectUri: window.location.origin + window.location.pathname,
        state: 'recovery=true' // Explicitly set for recovery
      });
      await provider.signIn();
    } catch (err) {
      console.error('Failed to setup recovery PKP:', err);
      setError(err);
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setPrimaryPKP(null);
    setRecoveryPKP(null);
    setPrimaryAuthMethod(null);
    setRecoveryAuthMethod(null);
    hasAuthenticated.current = false;
    
    // Clear localStorage
    localStorage.removeItem('primaryPKP');
    localStorage.removeItem('recoveryPKP');
    localStorage.removeItem('primaryAuthMethod');
    localStorage.removeItem('recoveryAuthMethod');
    
    // Use window.location for navigation
    window.location.href = '/';
  };

  const value = {
    isAuthenticated,
    isLoading,
    error,
    primaryPKP,
    recoveryPKP,
    primaryAuthMethod,
    recoveryAuthMethod,
    setupPrimaryPKP,
    setupRecoveryPKP,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 