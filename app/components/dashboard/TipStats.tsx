'use client'

import { useCreatorAccount } from '@/hooks/useCreatorAccount'
import { formatSol, formatUsdc } from '@/lib/utils/solana'

export function TipStats() {
    const { creatorData, loading, error } = useCreatorAccount()

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Your Tips</h2>
                <div className="text-gray-600">Loading...</div>
            </div>
        )
    }

    if (error || !creatorData) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Your Tips</h2>
                <div className="text-gray-600">No creator account found</div>
            </div>
        )
    }

    const totalSol = creatorData.totalTipsSol.toNumber()
    const totalUsdc = creatorData.totalTipsUsdc.toNumber()
    const tipCount = creatorData.tipCount.toNumber()

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Your Tips</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* SOL Tips Card */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
                    <div className="text-sm text-purple-600 font-semibold mb-2">Total SOL Tips</div>
                    <div className="text-3xl font-bold text-purple-900">{formatSol(totalSol)}</div>
                </div>

                {/* USDC Tips Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                    <div className="text-sm text-green-600 font-semibold mb-2">Total USDC Tips</div>
                    <div className="text-3xl font-bold text-green-900">{formatUsdc(totalUsdc)}</div>
                </div>

                {/* Tip Count Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                    <div className="text-sm text-blue-600 font-semibold mb-2">Total Tips</div>
                    <div className="text-3xl font-bold text-blue-900">{tipCount}</div>
                </div>

            </div>
        </div>
    )
}