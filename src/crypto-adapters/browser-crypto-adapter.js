const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256; // bits
const IV_LENGTH = 12; // bytes for GCM

/**
 * BrowserCryptoAdapter is a class that implements the CryptoAdapter interface for the browser.
 * It is used to encrypt and decrypt data using AES-GCM.
 * Compatible with @storacha/encrypt-upload-client.
 * @class
 * @implements {CryptoAdapter}
 */
export class BrowserCryptoAdapter {
  async generateKey() {
    return window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt a stream of data using AES-GCM.
   * @param {Blob} data
   * @returns {Promise<{ key: Uint8Array, iv: Uint8Array, encryptedStream: ReadableStream }>}
   */
  async encryptStream(data) {
    // Generate key and IV
    const symmetricKey = window.crypto.getRandomValues(new Uint8Array(KEY_LENGTH / 8));
    const initializationVector = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      symmetricKey,
      { name: ENCRYPTION_ALGORITHM },
      false,
      ['encrypt', 'decrypt']
    );

    // Buffer all chunks, then encrypt at the end
    const chunks = [];
    const reader = data.stream().getReader();

    const encryptedStream = new ReadableStream({
      async start(controller) {
        let done, value;
        while (!( { done, value } = await reader.read() ).done) {
          chunks.push(value);
        }
        // Concatenate all chunks
        const plain = new Uint8Array(chunks.reduce((acc, val) => [...acc, ...val], []));
        // Encrypt
        const encrypted = new Uint8Array(
          await window.crypto.subtle.encrypt(
            { name: ENCRYPTION_ALGORITHM, iv: initializationVector },
            cryptoKey,
            plain
          )
        );
        controller.enqueue(encrypted);
        controller.close();
      }
    });

    return {
      key: symmetricKey,
      iv: initializationVector,
      encryptedStream
    };
  }

  /**
   * Decrypt a stream of data using AES-GCM.
   * @param {ReadableStream} encryptedData
   * @param {Uint8Array} key
   * @param {Uint8Array} iv
   * @returns {ReadableStream}
   */
  async decryptStream(encryptedData, key, iv) {
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      key,
      { name: ENCRYPTION_ALGORITHM },
      false,
      ['encrypt', 'decrypt']
    );

    const chunks = [];
    const reader = encryptedData.getReader();

    return new ReadableStream({
      async start(controller) {
        let done, value;
        while (!( { done, value } = await reader.read() ).done) {
          chunks.push(value);
        }
        const encrypted = new Uint8Array(chunks.reduce((acc, val) => [...acc, ...val], []));
        // Decrypt
        const decrypted = new Uint8Array(
          await window.crypto.subtle.decrypt(
            { name: ENCRYPTION_ALGORITHM, iv },
            cryptoKey,
            encrypted
          )
        );
        controller.enqueue(decrypted);
        controller.close();
      }
    });
  }
}