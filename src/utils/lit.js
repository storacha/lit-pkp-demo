import { LitRelay } from '@lit-protocol/lit-auth-client';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LIT_NETWORK } from '@lit-protocol/constants';

const DefaultLitNetwork = LIT_NETWORK.DatilDev;

let litRelayInstance = null;
let litNodeClientInstance = null;

const relayApiKey = import.meta.env.VITE_LIT_RELAY_API_KEY;

export function getLitRelay() {
  if (!relayApiKey) {
    throw new Error('VITE_LIT_RELAY_API_KEY is not set. Please add it to your .env file and restart the dev server.');
  }
  if (!litRelayInstance) {
    console.log("[%cLitUtils%c] Initializing LitRelay...", "font-weight:bold;", "font-weight:normal;");
    console.debug("[%cLitUtils%c] LitRelay constructor availability:", "font-weight:bold;", "font-weight:normal;", typeof LitRelay);
    console.debug("[%cLitUtils%c] LitRelay.getRelayUrl availability:", "font-weight:bold;", "font-weight:normal;", typeof LitRelay.getRelayUrl);
    console.debug("[%cLitUtils%c] DefaultLitNetwork value:", "font-weight:bold;", "font-weight:normal;", DefaultLitNetwork);
    console.debug("[%cLitUtils%c] relayApiKey (first 5 chars):", "font-weight:bold;", "font-weight:normal;", relayApiKey ? relayApiKey.substring(0, 5) : 'undefined');

    let url;
    try {
      url = LitRelay.getRelayUrl(DefaultLitNetwork);
      console.debug("[%cLitUtils%c] Relay URL determined:", "font-weight:bold;", "font-weight:normal;", url);
    } catch (e) {
      console.error("[%cLitUtils%c] Error calling LitRelay.getRelayUrl:", "font-weight:bold;color:red;", "font-weight:normal;color:red;", e);
      throw e; 
    }

    try {
      litRelayInstance = new LitRelay({
        relayUrl: url,
        relayApiKey,
      });
      console.log("[%cLitUtils%c] LitRelay initialized successfully.", "font-weight:bold;color:green;", "font-weight:normal;color:green;");
    } catch (e) {
      console.error("[%cLitUtils%c] Error during new LitRelay() instantiation:", "font-weight:bold;color:red;", "font-weight:normal;color:red;", e);
      console.error("[%cLitUtils%c] Arguments to new LitRelay were:", "font-weight:bold;color:red;", "font-weight:normal;color:red;", { relayUrl: url, relayApiKey: relayApiKey ? 'present' : 'absent' });
      throw e; 
    }
  }
  return litRelayInstance;
}

export async function getLitNodeClient() {
  if (!litNodeClientInstance) {
    console.log("[%cLitUtils%c] Initializing LitNodeClient...", "font-weight:bold;", "font-weight:normal;");
    litNodeClientInstance = new LitNodeClient({ litNetwork: DefaultLitNetwork, debug: true });
    await litNodeClientInstance.connect();
    console.log("[%cLitUtils%c] LitNodeClient connected successfully.", "font-weight:bold;color:green;", "font-weight:normal;color:green;");
  }
  return litNodeClientInstance;
}