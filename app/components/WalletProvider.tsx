'use client';

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProviderProps {
    children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
    // 1. Set the network (devnet for testing)
    const network = WalletAdapterNetwork.Devnet;

    // 2. Get the RPC endpoint for devnet
    // You can use custom RPC or the default one
    const endpoint = useMemo(() => {
        // Use environment variable if set, otherwise use default devnet
        return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network);
    }, [network]);

    // 3. Define which wallets to support
    // useMemo ensures this only runs once (performance optimization)
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),  // Phantom wallet
            new SolflareWalletAdapter(), // Solflare wallet
            // Add more wallets here if needed
        ],
        []
    );

    return (
        // ConnectionProvider: Manages connection to Solana
        <ConnectionProvider endpoint={endpoint}>
            {/* WalletProvider: Manages wallet state (connected, disconnected, etc.) */}
            <SolanaWalletProvider wallets={wallets} autoConnect>
                {/* WalletModalProvider: Provides the wallet selection modal UI */}
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </SolanaWalletProvider>
        </ConnectionProvider>
    );
};
