'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { getProgram, getPlatformConfigPDA } from '@/lib/anchor/setup';
import { PLATFORM_OWNER_PUBKEY } from '@/lib/anchor/constants';

export default function TestPage() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [platformConfig, setPlatformConfig] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Check if wallet is connected
    if (!wallet.connected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 max-w-md w-full shadow-sm">
                    <h1 className="text-2xl font-bold text-yellow-800 mb-4">Connect Wallet</h1>
                    <p className="text-yellow-700 mb-6">
                        Please connect your wallet to access the administrative test page.
                    </p>
                </div>
            </div>
        );
    }

    // 2. Check if connected wallet is the platform owner
    if (!wallet.publicKey?.equals(PLATFORM_OWNER_PUBKEY)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md w-full shadow-sm">
                    <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h1>
                    <p className="text-red-600 mb-6">
                        This page is restricted to the platform administrator only.
                    </p>
                    <div className="flex flex-col gap-1 text-left bg-white p-3 rounded border border-red-100 text-xs">
                        <span className="text-gray-500 font-medium">Your Wallet:</span>
                        <code className="text-gray-700 break-all">{wallet.publicKey?.toString()}</code>
                    </div>
                </div>
            </div>
        );
    }

    const fetchPlatformConfig = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get program instance
            const program = getProgram(connection, wallet as any);

            // Get platform config PDA
            const [platformConfigPDA] = getPlatformConfigPDA();

            // Fetch the account
            const config = await program.account.platformConfig.fetch(platformConfigPDA);

            setPlatformConfig(config);
            console.log('Platform config:', config);
        } catch (err: any) {
            console.error('Error fetching platform config:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Program Integration Test</h1>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Test: Fetch Platform Config</h2>

                <button
                    onClick={fetchPlatformConfig}
                    disabled={loading}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Fetch Platform Config'}
                </button>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 font-semibold">Error:</p>
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {platformConfig && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 font-semibold mb-2">✅ Success! Platform Config:</p>

                        {/* Show PDA address with Explorer link */}
                        <div className="mb-3 p-2 bg-white rounded border border-green-300">
                            <p className="text-xs text-gray-600 mb-1">Platform Config PDA:</p>
                            <div className="flex items-center gap-2 flex-wrap">
                                <code className="text-xs text-gray-800 break-all">
                                    {getPlatformConfigPDA()[0].toString()}
                                </code>
                                <a
                                    href={`https://explorer.solana.com/address/${getPlatformConfigPDA()[0].toString()}?cluster=devnet`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-600 hover:text-purple-800 text-xs whitespace-nowrap font-semibold"
                                >
                                    View on Explorer →
                                </a>
                            </div>
                        </div>

                        <pre className="text-sm text-gray-700 overflow-auto">
                            {JSON.stringify({
                                authority: platformConfig.authority.toString(),
                                feeBasisPoints: platformConfig.feeBasisPoints,
                                feePercentage: `${platformConfig.feeBasisPoints / 100}%`,
                                totalFeesCollectedSol: `${(Number(platformConfig.totalFeesCollectedSol) / 1_000_000_000).toFixed(9)} SOL (${platformConfig.totalFeesCollectedSol.toString()} lamports)`,
                                totalFeesCollectedUsdc: `${(Number(platformConfig.totalFeesCollectedUsdc) / 1_000_000).toFixed(6)} USDC (${platformConfig.totalFeesCollectedUsdc.toString()} units)`,
                            }, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">What This Tests:</h3>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                    <li>IDL is correctly imported</li>
                    <li>Program instance is created</li>
                    <li>PDA derivation works</li>
                    <li>Can read on-chain data from your program</li>
                </ul>
            </div>
        </div>
    );
}
