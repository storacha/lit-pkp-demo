import { useState, useRef } from 'react';
import * as Client from '@storacha/client';
import * as Proof from '@storacha/client/proof';
import { DID } from '@ucanto/core';
import {
  accessServiceConnection,
  uploadServiceConnection,
  filecoinServiceConnection,
  gatewayServiceConnection,
} from '@storacha/client/service';
import { StoreMemory } from '@storacha/client/stores/memory';
import * as Signer from '@ucanto/principal/ed25519';
import { create as createEncryptionClient } from '@storacha/encrypt-upload-client';
import { BrowserCryptoAdapter } from '../crypto-adapters/browser-crypto-adapter';

const STORAGE_SERVICE_DID = 'did:web:web3.storage';

function useStorachaDecryptedDownload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [decryptedUrl, setDecryptedUrl] = useState(null);
  const [decryptedContent, setDecryptedContent] = useState('');
  const clientRef = useRef(null);
  const [proof, setProof] = useState(null);

  // Helper to parse base64 CAR proof
  const parseProof = async (data) => {
    if (!data) throw new Error('No proof data provided');
    return Proof.parse(data);
  };

  // Initialize Storacha client ONCE
  const getOrCreateStorachaClient = async () => {
    if (clientRef.current) return clientRef.current;
    const agentPk = import.meta.env.VITE_AGENT_PK || '';
    if (!agentPk) throw new Error('Agent private key not set in VITE_AGENT_PK');
    const principal = Signer.parse(agentPk);
    const store = new StoreMemory();
    const serviceDID = DID.parse(STORAGE_SERVICE_DID);
    const serviceConf = {
      access: accessServiceConnection({ id: serviceDID }),
      upload: uploadServiceConnection({ id: serviceDID }),
      filecoin: filecoinServiceConnection({ id: serviceDID }),
      gateway: gatewayServiceConnection(),
    };
    const client = await Client.create({ principal, store, serviceConf });
    clientRef.current = client;
    return client;
  };

  // Load delegation and set proof
  const loadDelegation = async (delegation) => {
    setLoading(true);
    setError('');
    try {
      const proof = await parseProof(delegation);
      setProof(proof);
      const client = await getOrCreateStorachaClient();
      await client.addProof(proof);
      // Optionally: set space if needed
    } catch (err) {
      setError('Invalid delegation or failed to load proof: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Decrypt file using encryptedClient.retrieveAndDecryptFile
  // Accepts: cid, litClient, sessionSigs
  const decryptFile = async (cid, litClient, sessionSigs) => {
    setLoading(true);
    setError('');
    setDecryptedUrl(null);
    setDecryptedContent('');
    try {
      const client = await getOrCreateStorachaClient();
      // TODO: set current space if needed
      const encryptedClient = await createEncryptionClient({
        storachaClient: client,
        cryptoAdapter: new BrowserCryptoAdapter(),
        litClient,
        sessionSigs,
      });
      const result = await encryptedClient.retrieveAndDecryptFile(cid, {
        // Add any required options here
      });
      // result may be a Blob, Uint8Array, or object with metadata
      if (result instanceof Blob) {
        // Try to detect text vs binary
        const text = await result.text();
        // Heuristic: if text is printable, show as text, else offer download
        if (/^[\x20-\x7E\r\n\t]+$/.test(text) && text.length < 10000) {
          setDecryptedContent(text);
        } else {
          setDecryptedUrl(URL.createObjectURL(result));
        }
      } else if (result instanceof Uint8Array) {
        // Try to decode as text
        const decoder = new TextDecoder();
        const text = decoder.decode(result);
        if (/^[\x20-\x7E\r\n\t]+$/.test(text) && text.length < 10000) {
          setDecryptedContent(text);
        } else {
          setDecryptedUrl(URL.createObjectURL(new Blob([result])));
        }
      } else if (result && result.content) {
        // If result is an object with content and metadata
        const { content, fileType } = result;
        if (fileType && fileType.startsWith('text/')) {
          setDecryptedContent(await content.text());
        } else {
          setDecryptedUrl(URL.createObjectURL(content));
        }
      } else {
        setError('Unknown file format or decryption result');
      }
    } catch (err) {
      setError('Failed to decrypt file: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    decryptedUrl,
    decryptedContent,
    loadDelegation,
    decryptFile,
    setError,
    setDecryptedUrl,
    setDecryptedContent,
  };
}

export default useStorachaDecryptedDownload; 