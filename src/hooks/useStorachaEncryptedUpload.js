import { useState, useEffect, useRef } from 'react';
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

/**
 * The Storage Service Identifier which will verify the delegation.
 */
const STORAGE_SERVICE_DID = 'did:web:web3.storage';

function useStorachaEncryptedUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [space, setSpace] = useState(null); // space object
  const [spaceDid, setSpaceDid] = useState('');
  const [spaceName, setSpaceName] = useState('');
  const [cid, setCid] = useState('');
  const [proof, setProof] = useState(null);
  const clientRef = useRef(null);

  // Helper to parse base64 CAR proof
  const parseProof = async (data) => {
    if (!data) throw new Error('No proof data provided');
    return Proof.parse(data);
  }

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

  // Step 1: Load delegation and set space
  const loadDelegation = async (delegation) => {
    setLoading(true);
    setError('');
    try {
      const proof = await parseProof(delegation);
      setProof(proof);
      const client = await getOrCreateStorachaClient();
      const spaceObj = await client.addSpace(proof);
      await client.addProof(proof);
      await client.setCurrentSpace(spaceObj.did());
      setSpace(spaceObj);
      setSpaceDid(spaceObj.did());
      if (spaceObj.name) setSpaceName(spaceObj.name);
      return spaceObj.did();
    } catch (err) {
      setError('Invalid delegation or failed to load space: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Encrypt and upload file
  const encryptAndUpload = async (file, litClient) => {
    setLoading(true);
    setError('');
    setCid('');
    try {
      const client = await getOrCreateStorachaClient();
      await client.setCurrentSpace(spaceDid);
      const encryptedClient = await createEncryptionClient({
        storachaClient: client,
        cryptoAdapter: new BrowserCryptoAdapter(),
        litClient,
      });
      
      // Read and log file content
      const fileContent = await file.text();
      console.log('File content:', fileContent);
      console.log('Uploading file:', file);
      
      const result = await encryptedClient.uploadEncryptedFile(file);
      setCid(result.toString());
      return result.toString();
    } catch (err) {
      setError('Failed to encrypt and upload file: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-load delegation from env var on mount
  useEffect(() => {
    const envDelegation = import.meta.env.VITE_DELEGATION_CAR_BASE64;
    if (envDelegation) {
      loadDelegation(envDelegation).catch(() => { });
    }
  }, []);

  return {
    loading,
    error,
    space,
    spaceDid,
    spaceName,
    cid,
    proof,
    loadDelegation,
    encryptAndUpload,
    setError,
    setCid,
    setSpace,
  };
}

export default useStorachaEncryptedUpload; 