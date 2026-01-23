import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { getProgram } from '@/lib/anchor/setup';
import { USDC_MINT } from '@/lib/anchor/constants';

export function useInitializeCreator() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const wallet = useWallet();
    const { connection } = useConnection();

    const initialize = async () => {
        // Validation
        if (!wallet.publicKey) {
            setError('Wallet not connected');
            return;
        }

        try {
            // Reset state
            setIsLoading(true);
            setError(null);
            setSuccess(false);

            // Get program instance
            const program = getProgram(connection, wallet as any);

            // Call initialize_creator instruction
            const tx = await program.methods
                .initializeCreator()
                .accounts({
                    creator: wallet.publicKey,
                    usdcMint: USDC_MINT,
                })
                .rpc();

            // Log transaction signature
            console.log('Transaction signature:', tx);
            console.log('View on explorer:', `https://explorer.solana.com/tx/${tx}?cluster=devnet`);

            // Set success
            setSuccess(true);

        } catch (err: any) {
            // Handle error
            console.error('Error initializing creator:', err);
            setError(err.message || 'Failed to initialize creator');
        } finally {
            // Reset loading
            setIsLoading(false);
        }
    };

    return {
        initialize,
        isLoading,
        error,
        success,
    };
}
