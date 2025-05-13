import { useState, useEffect, useRef } from 'react';
import * as Client from '@storacha/client';
import * as Proof from '@storacha/client/proof';
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
    console.log("data", data);
    return Proof.parse(data);
  }

  // Initialize Storacha client ONCE
  const getOrCreateStorachaClient = async () => {
    if (clientRef.current) return clientRef.current;
    const agentPk = import.meta.env.VITE_AGENT_PK || '';
    if (!agentPk) throw new Error('Agent private key not set in VITE_AGENT_PK');
    const principal = Signer.parse(agentPk);
    const store = new StoreMemory();
    const serviceID = principal.did();
    const serviceConf = {
      access: accessServiceConnection({ id: serviceID }),
      upload: uploadServiceConnection({ id: serviceID }),
      filecoin: filecoinServiceConnection({ id: serviceID }),
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
  const encryptAndUpload = async (file) => {
    setLoading(true);
    setError('');
    setCid('');
    try {
      const client = await getOrCreateStorachaClient();
      await client.setCurrentSpace(spaceDid);
      const encryptedClient = await createEncryptionClient({
        storachaClient: client,
        cryptoAdapter: new BrowserCryptoAdapter()
      });
      const link = await encryptedClient.uploadEncryptedFile(file);
      setCid(link.cid || link);
      return link.cid || link;
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