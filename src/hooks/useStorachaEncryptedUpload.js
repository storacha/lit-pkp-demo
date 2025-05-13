import { useState } from 'react';
import { CarReader } from '@ipld/car';
import { importDAG } from '@ucanto/core/delegation';
import * as Client from '@storacha/client';
import { StoreMemory } from '@storacha/client/stores/memory';
import * as Signer from '@ucanto/principal/ed25519';
import { create as createEncryptionClient } from '@storacha/encrypt-upload-client';
import { BrowserCryptoAdapter } from '@storacha/encrypt-upload-client/browser';

function useStorachaEncryptedUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [space, setSpace] = useState(null);
  const [cid, setCid] = useState('');
  const [proof, setProof] = useState(null);

  // Helper to parse base64 CAR proof
  const parseProof = async (data) => {
    const blocks = [];
    const reader = await CarReader.fromBytes(Buffer.from(data, "base64"));
    for await (const block of reader.blocks()) {
      blocks.push(block);
    }
    return importDAG(blocks);
  }

  // Initialize Storacha client
  const createStorachaClient = async () => {
    const agentPk = import.meta.env.VITE_AGENT_PK || '';
    if (!agentPk) throw new Error('Agent private key not set in VITE_AGENT_PK');
    const principal = Signer.parse(agentPk);
    const store = new StoreMemory();
    return await Client.create({
      principal,
      store,
      serviceConf,
      receiptsEndpoint,
    });
  };

  // Step 1: Load delegation and set space
  const loadDelegation = async (delegation) => {
    setLoading(true);
    setError('');
    try {
      const proof = await parseProof(delegation);
      setProof(proof);
      const client = await createStorachaClient();
      const space = await client.addSpace(proof);
      await client.setCurrentSpace(space.did());
      setSpace(space.did());
      return space.did();
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
      const client = await createStorachaClient();
      await client.setCurrentSpace(space);
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

  return {
    loading,
    error,
    space,
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