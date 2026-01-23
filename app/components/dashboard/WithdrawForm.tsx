// 1. Mark as client component
'use client'
// 2. Import dependencies
import { useState } from 'react'
import { useWithdraw } from '@/hooks/useWithdraw'
import { useCreatorAccount } from '@/hooks/useCreatorAccount'
// 3. Create component
export function WithdrawForm() {
    // 4. State for form inputs
    const [amount, setAmount] = useState('')
    const [currency, setCurrency] = useState<'SOL' | 'USDC'>('SOL')

    // 5. Get withdraw function from hook
    const { withdraw, isLoading, error, success } = useWithdraw()

    // Get creator account data for balance checking
    const { creatorData } = useCreatorAccount()

    // Calculate available balances
    const availableSol = creatorData ? Number(creatorData.totalTipsSol) / 1_000_000_000 : 0
    const availableUsdc = creatorData ? Number(creatorData.totalTipsUsdc) / 1_000_000 : 0

    // 6. Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // 7. Validate amount
        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter a valid amount')
            return
        }

        // Check if user has enough balance
        const withdrawAmount = parseFloat(amount)
        const availableBalance = currency === 'SOL' ? availableSol : availableUsdc

        if (withdrawAmount > availableBalance) {
            alert(`Insufficient balance! You only have ${availableBalance.toFixed(4)} ${currency} available`)
            return
        }

        // 8. Call withdraw function
        await withdraw(parseFloat(amount), currency)
    }

    // 9. Render form
    return (
        <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Withdraw Tips</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Currency selector */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Currency
                    </label>
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as 'SOL' | 'USDC')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                    >
                        <option value="SOL">SOL</option>
                        <option value="USDC">USDC</option>
                    </select>
                </div>

                {/* Amount input */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Amount
                        {creatorData && (
                            <span className="text-xs text-gray-500 ml-2">
                                (Available: {currency === 'SOL' ? availableSol.toFixed(4) : availableUsdc.toFixed(2)} {currency})
                            </span>
                        )}
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                    />
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg"
                >
                    {isLoading ? 'Withdrawing...' : `Withdraw ${amount || '0'} ${currency}`}
                </button>

                {/* Error message */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">Error: {error}</p>
                    </div>
                )}

                {/* Success message */}
                {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800">✅ Withdrawal successful!</p>
                    </div>
                )}

                {/* First withdrawal info */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                        <strong>Note:</strong> Your first withdrawal may require approving 2 transactions (one to create your USDC account, one for the withdrawal). Subsequent withdrawals only need 1 approval.
                    </p>
                </div>
            </form>
        </div>
    )
}