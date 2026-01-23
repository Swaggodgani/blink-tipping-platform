'use client'

import { useState } from 'react'
import { useSendTip } from '@/hooks/useSendTip'

interface TipFormProps {
    creatorAddress: string
}

export function TipForm({ creatorAddress }: TipFormProps) {
    const [amount, setAmount] = useState('')
    const [currency, setCurrency] = useState<'SOL' | 'USDC'>('SOL')

    const { sendTip, isLoading, error, success } = useSendTip()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter a valid amount')
            return
        }

        await sendTip(creatorAddress, parseFloat(amount), currency)
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Send a Tip</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Currency selector */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Currency
                    </label>
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as 'SOL' | 'USDC')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 font-medium"
                    >
                        <option value="SOL">SOL</option>
                        <option value="USDC">USDC</option>
                    </select>
                </div>

                {/* Amount input */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Amount
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 font-medium"
                    />
                </div>

                {/* Quick amount buttons */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quick amounts
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setAmount('0.01')}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors"
                        >
                            0.01
                        </button>
                        <button
                            type="button"
                            onClick={() => setAmount('0.1')}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors"
                        >
                            0.1
                        </button>
                        <button
                            type="button"
                            onClick={() => setAmount('1')}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors"
                        >
                            1
                        </button>
                    </div>
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors text-lg"
                >
                    {isLoading ? 'Sending...' : `Send ${amount || '0'} ${currency}`}
                </button>

                {/* Error message */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 font-semibold">Error:</p>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Success message */}
                {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 font-semibold">✅ Tip sent successfully!</p>
                        <p className="text-green-700 text-sm mt-1">Check the console for transaction details.</p>
                    </div>
                )}
            </form>
        </div>
    )
}