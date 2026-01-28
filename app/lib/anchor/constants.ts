import { PublicKey } from '@solana/web3.js';

// Program ID from your deployed program on devnet
export const PROGRAM_ID = new PublicKey(
    'Hgdc6LBYxZeXTpA3Dr53HxwxWf96wsQBX3tS1R8ArDNS'
);

// USDC Mint on devnet (test token you can mint)
export const USDC_MINT = new PublicKey(
    'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'
);

// Platform config PDA seeds
export const PLATFORM_CONFIG_SEED = 'platform_config';

// Creator account PDA seeds
export const CREATOR_SEED = 'creator';

// Vault PDA seeds
export const SOL_VAULT_SEED = 'vault_sol';
export const USDC_VAULT_SEED = 'vault_usdc';

// Platform Owner Public Key (Authority)
export const PLATFORM_OWNER_PUBKEY = new PublicKey(
    (process.env.NEXT_PUBLIC_PLATFORM_OWNER_PUBKEY || 'EH8moVRZNisJCQtCF5sdi8oUAveeBvtDMnWbTrQDHGX9').trim()
);
