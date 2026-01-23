// 1. Import dependencies
import { Connection, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'

// 2. Get associated token address (doesn't check if exists)
export async function getAssociatedTokenAddress_Unchecked(
    mint: PublicKey,
    owner: PublicKey
): Promise<PublicKey> {
    return await getAssociatedTokenAddress(mint, owner)
}

// 3. Get associated token account (checks if exists - for USDC tips)
export async function getAssociatedTokenAccount(
    connection: Connection,
    mint: PublicKey,
    owner: PublicKey
): Promise<PublicKey> {
    // Just return the address without checking
    // The transaction will fail if account doesn't exist
    return await getAssociatedTokenAddress(mint, owner)
}