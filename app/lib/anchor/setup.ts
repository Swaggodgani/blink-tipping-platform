import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { BlinkTipping } from './idl';
import { PROGRAM_ID } from './constants';
import IDL_JSON from './idl.json';

/**
 * Get the Anchor program instance
 * This is how we interact with your on-chain program
 * 
 * @param connection - Solana RPC connection
 * @param wallet - Connected wallet (optional for read-only operations)
 * @returns Anchor Program instance
 */
export function getProgram(
    connection: Connection,
    wallet?: AnchorWallet
): Program<BlinkTipping> {
    // Create provider (connection + wallet)
    const provider = new AnchorProvider(
        connection,
        wallet as any,
        { commitment: 'confirmed' }
    );

    // Create program instance with JSON IDL
    return new Program(IDL_JSON as any, provider);
}

/**
 * Derive PDA for platform config
 * Seeds: ["platform_config"]
 */
export function getPlatformConfigPDA(programId: PublicKey = PROGRAM_ID): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('platform_config')],
        programId
    );
}

/**
 * Derive PDA for creator account
 * Seeds: ["creator", creator_pubkey]
 */
export function getCreatorAccountPDA(
    creator: PublicKey,
    programId: PublicKey = PROGRAM_ID
): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('creator'), creator.toBuffer()],
        programId
    );
}

/**
 * Derive PDA for SOL vault
 * Seeds: ["vault_sol", creator_pubkey]
 */
export function getSolVaultPDA(
    creator: PublicKey,
    programId: PublicKey = PROGRAM_ID
): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('vault_sol'), creator.toBuffer()],
        programId
    );
}

/**
 * Derive PDA for USDC vault
 * Seeds: ["vault_usdc", creator_pubkey]
 */
export function getUsdcVaultPDA(
    creator: PublicKey,
    programId: PublicKey = PROGRAM_ID
): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('vault_usdc'), creator.toBuffer()],
        programId
    );
}
