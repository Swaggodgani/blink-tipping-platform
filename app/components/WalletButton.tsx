'use client';

import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const WalletButton: FC = () => {
    const { publicKey, connected } = useWallet();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by only rendering after client-side mount
    useEffect(() => {
        setMounted(true);
    }, []);

    // Show loading skeleton during SSR and initial render
    if (!mounted) {
        return (
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-md" />
        );
    }

    return (
        <div className="flex items-center gap-4">
            {connected && publicKey && (
                <div className="hidden sm:block text-sm text-gray-600">
                    {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                </div>
            )}

            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
        </div>
    );
};
