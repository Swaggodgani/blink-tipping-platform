import { PublicKey } from '@solana/web3.js';

// Program ID from your deployed program on devnet
export const PROGRAM_ID = new PublicKey(
    process.env.NEXT_PUBLIC_PROGRAM_ID || 'DJPC2oUD3YkjEF2EKmcuStte92vSBrYh9nZaEmna9RmJ'
);

// USDC Mint on devnet (test token you can mint)
export const USDC_MINT = new PublicKey(
    process.env.NEXT_PUBLIC_USDC_MINT || '6bEbNy2gUKrh37Skvb5ov2UudpfCUfZv5L7QZMNeoqCk'
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
    process.env.NEXT_PUBLIC_PLATFORM_OWNER_PUBKEY || 'EH8moVRZNisJCQtCF5sdi8oUAveeBvtDMnWbTrQDHGX9'
);
