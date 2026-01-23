import { Connection, clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

/**
 * Get Solana connection
 * Uses environment variable or defaults to devnet
 */
export function getConnection(): Connection {
    const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork) || WalletAdapterNetwork.Devnet;
    const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network);

    return new Connection(endpoint, 'confirmed');
}

/**
 * Format SOL amount from lamports
 * @param lamports - Amount in lamports
 * @returns Formatted string (e.g., "1.5 SOL")
 */
export function formatSol(lamports: number): string {
    return `${(lamports / 1_000_000_000).toFixed(4)} SOL`;
}

/**
 * Format USDC amount from token amount
 * @param amount - Amount in smallest unit (6 decimals)
 * @returns Formatted string (e.g., "10.50 USDC")
 */
export function formatUsdc(amount: number): string {
    return `${(amount / 1_000_000).toFixed(2)} USDC`;
}

/**
 * Shorten wallet address for display
 * @param address - Full address
 * @returns Shortened address (e.g., "ABC1...XYZ9")
 */
export function shortenAddress(address: string): string {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
