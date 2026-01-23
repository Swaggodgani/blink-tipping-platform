'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useInitializeCreator } from '@/hooks/useInitializeCreator';
import { useState, useEffect } from 'react';
import { getProgram, getCreatorAccountPDA } from '@/lib/anchor/setup';

export function InitializeCreator() {
    const { publicKey } = useWallet();
    const { connection } = useConnection();

    // State for checking if account exists
    const [accountExists, setAccountExists] = useState(false);
    const [loading, setLoading] = useState(true);

    // Get the initialize function from custom hook
    const { initialize, isLoading, error, success } = useInitializeCreator();

    // Check if creator account already exists
    useEffect(() => {
        async function checkAccount() {
            if (!publicKey) return;

            try {
                const program = getProgram(connection);
                const [creatorAccountPDA] = getCreatorAccountPDA(publicKey);

                // Try to fetch the account
                await program.account.creatorAccount.fetch(creatorAccountPDA);

                // If we get here, account exists
                setAccountExists(true);
            } catch (err) {
                // If error, account doesn't exist
                setAccountExists(false);
            } finally {
                setLoading(false);
            }
        }

        checkAccount();
    }, [publicKey, connection, success]); // Re-check after success

    // Handle initialize button click
    const handleInitialize = async () => {
        await initialize();
    };

    // Render UI
    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-600">Checking account...</div>
            </div>
        );
    }

    // Show success message if just initialized (don't re-check immediately)
    if (success) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🎉</span>
                    <h2 className="text-xl font-semibold text-green-800">You're now a creator!</h2>
                </div>
                <p className="mt-2 text-green-700">
                    Your creator account has been successfully initialized! You can now receive tips in SOL and USDC.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 text-purple-600 hover:text-purple-800 font-semibold"
                >
                    Refresh to continue →
                </button>
            </div>
        );
    }

    if (accountExists) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">✅</span>
                    <h2 className="text-xl font-semibold text-green-800">You're already a creator!</h2>
                </div>
                <p className="mt-2 text-green-700">Your creator account is set up and ready to receive tips.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-10">
                <h2 className="text-3xl font-bold text-white mb-2">
                    🚀 Become a Creator
                </h2>
                <p className="text-purple-100 text-lg">
                    Start receiving tips in SOL and USDC from your supporters
                </p>
            </div>

            {/* Content */}
            <div className="px-8 py-8">
                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-xl">💰</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Dual Currency</h3>
                            <p className="text-sm text-gray-600">Accept SOL & USDC</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <span className="text-xl">⚡</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Instant Tips</h3>
                            <p className="text-sm text-gray-600">Real-time payments</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-xl">🔗</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Blinks Ready</h3>
                            <p className="text-sm text-gray-600">Share on socials</p>
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    onClick={handleInitialize}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Initializing...
                        </span>
                    ) : (
                        '✨ Initialize Creator Account'
                    )}
                </button>

                {/* Info Note */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-semibold text-gray-900">What happens next:</span> After clicking "Initialize Creator Account", you'll approve a transaction in your wallet that creates your creator profile and two secure vaults (SOL and USDC). Network fee: ~0.001 SOL.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-xl">❌</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-red-800 font-semibold">Error</p>
                                <p className="text-red-600 text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-xl">✅</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-green-800 font-semibold">Success!</p>
                                <p className="text-green-700 text-sm mt-1">Your creator account is ready. Refreshing...</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
