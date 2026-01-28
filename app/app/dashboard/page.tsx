'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { InitializeCreator } from '@/components/dashboard/InitializeCreator'
import { TipStats } from '@/components/dashboard/TipStats'
import { WithdrawForm } from '@/components/dashboard/WithdrawForm'
import { BlinkGenerator } from '@/components/dashboard/BlinkGenerator'
import { AdminPanel } from '@/components/dashboard/AdminPanel'
import { useCreatorAccount } from '@/hooks/useCreatorAccount'

export default function Dashboard() {
    const { connected, publicKey } = useWallet()
    const { creatorData, loading } = useCreatorAccount()

    if (!connected) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                    <h2 className="text-2xl font-bold text-yellow-900 mb-2">Wallet Not Connected</h2>
                    <p className="text-yellow-700">Please connect your wallet to access the creator dashboard.</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="flex items-center justify-center p-12">
                    <div className="text-gray-600 text-lg">Loading dashboard...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-5xl font-bold text-gray-900">
                            Creator Dashboard
                        </h1>
                        <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                            <p className="text-sm text-gray-600 font-medium">
                                {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                            </p>
                        </div>
                    </div>
                    <p className="text-lg text-gray-600">
                        Manage your tips, track earnings, and share your Blink
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {/* Admin Panel (Only visible to Authority) */}
                    <AdminPanel />

                    {/* If no creator account, show initialize */}
                    {!creatorData && <InitializeCreator />}

                    {/* If creator account exists, show stats and withdraw */}
                    {creatorData && (
                        <>
                            <TipStats />
                            <WithdrawForm />
                            <BlinkGenerator />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}