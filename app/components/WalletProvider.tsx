'use client';

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { TipLinkWalletAdapter } from '@tiplink/wallet-adapter';

// ... (imports)

// 3. Define which wallets to support
// useMemo ensures this only runs once (performance optimization)
const wallets = useMemo(
    () => [
        new PhantomWalletAdapter(),  // Phantom wallet
        new SolflareWalletAdapter(), // Solflare wallet
        new TipLinkWalletAdapter({
            title: "Blink Tipping",
            clientId: "fc8b7e28-3e49-4f73-9a35-1313437651a5", // Using a demo/test client ID or need to register one. 
            theme: "dark"
        }),
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
