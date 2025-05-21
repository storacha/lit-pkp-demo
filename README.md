# Lit PKP Demo

A proof of concept demonstrating Lit Protocol's PKP (Programmable Key Pairs) integration with Storacha for encrypted file storage and access control.

## Features

- Client side file encryption using Lit PKPs
- PKP minting with social auth (Google)
- Recovery PKP setup (Google)
- Delegation of decryption capabilities
- Secure file retrieval and client side decryption

## Prerequisites

- Node.js 16+
- pnpm
- Lit Protocol API key
- Storacha Agent credentials and delegation

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd lit-pkp-demo
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your credentials:
```
# Lit Protocol configuration
VITE_LIT_RELAY_API_KEY=your_lit_relay_api_key
VITE_WALLET_PK="test"

# Storacha configuration
VITE_AGENT_PK=your_storacha_agent_private_key
VITE_DELEGATION_CAR_BASE64=your_base64_encoded_delegation
```

## Usage

1. Start the app:
```bash
pnpm dev
```

2. Open http://localhost:5173

3. First-time setup:
   - Sign in with Google
   - Mint your primary PKP
   - Set up recovery PKP
   - Go to upload page
   - Upload a file
   - Go to the decryption page
   - Set the decryption delegation
   - Download & Decrypt the file with Primary and/or Recovery PKP's


## Security Considerations

- PKP private keys are never exposed
- All encryption happens client-side
- Recovery PKP provides backup access
- Decryption delegations should be generated via Storacha CLI and should be time-limited
- Decryption delegation CAR should be properly encoded

## Limitations

- Currently supports Google OAuth only
- Requires Lit Relay API Key
- PKP minting and decryption have associated costs (if running in mainnet)
- Recovery setup is optional
- Requires Storacha Agent private key
