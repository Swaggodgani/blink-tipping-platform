import { PublicKey } from '@solana/web3.js';

// Program ID from your deployed program on devnet
export const PROGRAM_ID = new PublicKey(
    '6KMw7CqQMKnUg7RWq1815zNhJXBZU1woEZNDkZ2n7XmK'
);

// USDC Mint on devnet (Official Circle Devnet USDC)
export const USDC_MINT = new PublicKey(
    '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
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
