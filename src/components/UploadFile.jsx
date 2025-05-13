import { useState } from 'react';
import useStorachaEncryptedUpload from '../hooks/useStorachaEncryptedUpload';

export function UploadFile() {
  const [delegation, setDelegation] = useState('');
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(1);

  const {
    loading, error, space, cid,
    loadDelegation, encryptAndUpload, setError
  } = useStorachaEncryptedUpload();

  // Step 1: Handle delegation input
  const handleDelegationChange = (e) => {
    setDelegation(e.target.value);
    setError('');
  };

  const handleLoadDelegation = async () => {
    try {
      await loadDelegation(delegation);
      setStep(2);
    } catch (err) {
      // error is handled in hook
    }
  };

  // Step 2: Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  // Step 3: Encrypt and upload
  const handleEncryptAndUpload = async () => {
    try {
      await encryptAndUpload(file);
      setStep(3);
    } catch (err) {
      // error is handled in hook
    }
  };

  return (
    <div className="login-container pkp-panel-wide">
      <h2>Upload File</h2>
      <p>This is where you will upload and encrypt files with Storacha & Lit Protocol.</p>

      {/* Step 1: Delegation input */}
      {step === 1 && (
        <>
          <label htmlFor="delegation-input"><b>Paste Delegation (Base64 CAR)</b></label>
          <textarea
            id="delegation-input"
            className="delegation-input"
            rows={6}
            value={delegation}
            onChange={handleDelegationChange}
            placeholder="Paste your delegation base64 CAR here..."
            style={{ width: '100%', marginBottom: '1rem' }}
          />
          <button className="next-btn" onClick={handleLoadDelegation} disabled={!delegation || loading}>
            {loading ? 'Loading...' : 'Load Delegation'}
          </button>
        </>
      )}

      {/* Step 2: File upload */}
      {step === 2 && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <b>Loaded Space/Bucket:</b> <span>{space}</span>
          </div>
          <input type="file" onChange={handleFileChange} />
          <button className="next-btn" onClick={handleEncryptAndUpload} disabled={!file || loading} style={{ marginLeft: '1rem' }}>
            {loading ? 'Encrypting & Uploading...' : 'Encrypt & Upload'}
          </button>
        </>
      )}

      {/* Step 3: Show CID */}
      {step === 3 && cid && (
        <div style={{ marginTop: '2rem' }}>
          <b>File uploaded!</b>
          <div>CID: <code>{cid}</code></div>
        </div>
      )}

      {error && <div className="error-message" style={{ marginTop: '1rem' }}>{error}</div>}
    </div>
  );
} 