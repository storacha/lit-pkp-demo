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
import { BrowserCryptoAdapter } from '@storacha/encrypt-upload-client/browser';

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
  const decryptFile = async (cid, delegation, primaryPKP, authMethod, litClient) => {
    console.log('Decrypting file with CID:', cid);
    setLoading(true);
    setError('');
    setDecryptedUrl(null);
    setDecryptedContent('');
    try {
      const client = await getOrCreateStorachaClient();
      const encryptedClient = await createEncryptionClient({
        storachaClient: client,
        cryptoAdapter: new BrowserCryptoAdapter(),
        litClient,
      });
      const signer = {
        pkpPublicKey: primaryPKP.pkpPublicKey,
        authMethod: authMethod,
      }
      console.log('Signer:', signer);
      const result = await encryptedClient.retrieveAndDecryptFile(signer, cid, delegation);
      const reader = result.getReader()
      const decoder = new TextDecoder()
      let content = ''

      let done = false
      while (!done) {
        const { value, done: isDone } = await reader.read()
        done = isDone
        if (value) {
          content += decoder.decode(value, { stream: true })
        }
      }
      console.log('Decrypted content:', content);
      setDecryptedContent(content);
    } catch (err) {
      console.error('Error in decryptFile:', err);
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