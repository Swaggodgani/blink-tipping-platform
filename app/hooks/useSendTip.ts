// 1. Import dependencies
import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { getProgram, getCreatorAccountPDA } from '@/lib/anchor/setup'
import { USDC_MINT } from '@/lib/anchor/constants'
import { getAssociatedTokenAccount, getAssociatedTokenAddress_Unchecked } from '@/lib/utils/token'
// 2. Define the hook
export function useSendTip() {
    // 3. State
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // 4. Get wallet and connection
    const wallet = useWallet()
    const { connection } = useConnection()

    // 5. Send tip function
    const sendTip = async (
        creatorAddress: string,
        amount: number,
        currency: 'SOL' | 'USDC'
    ) => {
        // 6. Validation
        if (!wallet.publicKey) {
            setError('Wallet not connected')
            return
        }

        try {
            // 7. Reset state
            setIsLoading(true)
            setError(null)
            setSuccess(false)

            // 8. Convert creator address to PublicKey
            const creatorPubkey = new PublicKey(creatorAddress)

            // 9. Get program instance
            const program = getProgram(connection, wallet as any)

            // 10. Convert amount to smallest unit
            let amountInSmallestUnit: number
            if (currency === 'SOL') {
                // SOL: 1 SOL = 1,000,000,000 lamports
                amountInSmallestUnit = Math.floor(amount * 1_000_000_000)
            } else {
                // USDC: 1 USDC = 1,000,000 (6 decimals)
                amountInSmallestUnit = Math.floor(amount * 1_000_000)
            }

            // 11. Get tipper's USDC token account address
            let tipperUsdcAccount: PublicKey

            if (currency === 'USDC') {
                // For USDC: Check that account exists
                tipperUsdcAccount = await getAssociatedTokenAccount(
                    connection,
                    USDC_MINT,
                    wallet.publicKey
                )
            } else {
                // For SOL: Just get the address (doesn't need to exist)
                tipperUsdcAccount = await getAssociatedTokenAddress_Unchecked(
                    USDC_MINT,
                    wallet.publicKey
                )
            }

            // 13. Build currency enum for Anchor
            const currencyEnum = currency === 'SOL' ? { sol: {} } : { usdc: {} }

            // 14. Call send_tip instruction
            const tx = await program.methods
                .sendTip(new BN(amountInSmallestUnit), currencyEnum)
                .accounts({
                    tipper: wallet.publicKey,
                    creator: creatorPubkey,
                    tipperUsdcAccount: tipperUsdcAccount,
                })
                .rpc()

            // 15. Log transaction
            console.log('Tip sent! Transaction:', tx)
            console.log('View on explorer:', `https://explorer.solana.com/tx/${tx}?cluster=devnet`)

            // 16. Set success
            setSuccess(true)

        } catch (err: any) {
            // 17. Handle error
            console.error('Error sending tip:', err)
            setError(err.message || 'Failed to send tip')
        } finally {
            // 18. Reset loading
            setIsLoading(false)
        }
    }

    // 19. Return state and function
    return {
        sendTip,
        isLoading,
        error,
        success,
    }
}