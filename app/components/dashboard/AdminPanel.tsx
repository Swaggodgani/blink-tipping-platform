
import { useState, useEffect } from 'react';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { getProgram, getPlatformConfigPDA } from '@/lib/anchor/setup';
import { PLATFORM_OWNER_PUBKEY } from '@/lib/anchor/constants';
import toast from 'react-hot-toast';

export function AdminPanel() {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [isOwner, setIsOwner] = useState(false);
    const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (wallet && wallet.publicKey.toString() === PLATFORM_OWNER_PUBKEY.toString()) {
            setIsOwner(true);
            checkInitialization();
        } else {
            setIsOwner(false);
        }
    }, [wallet]);

    const checkInitialization = async () => {
        if (!wallet) return;
        try {
            const program = getProgram(connection, wallet);
            const [platformConfigPda] = getPlatformConfigPDA();
            const account = await program.account.platformConfig.fetchNullable(platformConfigPda);
            setIsInitialized(!!account);
        } catch (error) {
            console.error('Error checking platform config:', error);
        }
    };

    const initializePlatform = async () => {
        if (!wallet) return;
        setLoading(true);
        const toastId = toast.loading('Initializing Platform Config...');

        try {
            const program = getProgram(connection, wallet);

            const tx = await program.methods
                .initializePlatformConfig()
                .rpc();

            console.log('Platform initialized:', tx);
            toast.success('Platform Config Initialized!', { id: toastId });
            setIsInitialized(true);
        } catch (error: any) {
            console.error('Error initializing platform:', error);
            toast.error('Failed to initialize: ' + error.message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    if (!isOwner) return null;

    return (
        <div className="bg-purple-900 text-white p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
                🛡️ Admin Panel
            </h2>

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-purple-200 text-sm mb-1">Status</p>
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${isInitialized ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="font-medium">
                            {isInitialized === null ? 'Checking...' : isInitialized ? 'Platform Initialized' : 'Not Initialized'}
                        </span>
                    </div>
                </div>

                {!isInitialized && (
                    <button
                        onClick={initializePlatform}
                        disabled={loading}
                        className="bg-white text-purple-900 px-6 py-2 rounded-lg font-bold hover:bg-purple-100 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Initializing...' : 'Initialize Platform'}
                    </button>
                )}

                {isInitialized && (
                    <div className="text-green-300 text-sm font-mono bg-purple-800 px-3 py-1 rounded">
                        Ready for Creators
                    </div>
                )}
            </div>
        </div>
    );
}
