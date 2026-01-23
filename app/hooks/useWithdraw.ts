// 1. Import dependencies
import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { getProgram, getCreatorAccountPDA, getSolVaultPDA, getUsdcVaultPDA, getPlatformConfigPDA } from '@/lib/anchor/setup'
import { USDC_MINT } from '@/lib/anchor/constants'
import { getAssociatedTokenAddress_Unchecked } from '@/lib/utils/token'
import { TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction } from '@solana/spl-token'

// 2. Define the hook
export function useWithdraw() {
    // 3. State
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // 4. Get wallet and connection
    const wallet = useWallet()
    const { connection } = useConnection()

    // 5. Withdraw function
    const withdraw = async (
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

            // 8. Get program instance
            const program = getProgram(connection, wallet as any)

            // 9. Convert amount to smallest unit
            let amountInSmallestUnit: number
            if (currency === 'SOL') {
                // SOL: 1 SOL = 1,000,000,000 lamports
                amountInSmallestUnit = Math.floor(amount * 1_000_000_000)
            } else {
                // USDC: 1 USDC = 1,000,000 (6 decimals)
                amountInSmallestUnit = Math.floor(amount * 1_000_000)
            }

            // 10. Derive all required PDAs
            const [creatorAccountPDA] = getCreatorAccountPDA(wallet.publicKey)
            const [solVaultPDA] = getSolVaultPDA(wallet.publicKey)
            const [usdcVaultPDA] = getUsdcVaultPDA(wallet.publicKey)
            const [platformConfigPDA] = getPlatformConfigPDA()

            // 11. Get platform config to find platform authority
            const platformConfig = await program.account.platformConfig.fetch(platformConfigPDA)
            const platformWallet = platformConfig.authority

            // 12. Get token accounts
            const creatorUsdcAccount = await getAssociatedTokenAddress_Unchecked(
                USDC_MINT,
                wallet.publicKey
            )
            const platformUsdcAccount = await getAssociatedTokenAddress_Unchecked(
                USDC_MINT,
                platformWallet
            )

            // 12.5. Check if creator USDC account exists, create if not
            const creatorUsdcAccountInfo = await connection.getAccountInfo(creatorUsdcAccount)
            if (!creatorUsdcAccountInfo) {
                console.log('Creator USDC account does not exist, creating it...')
                const createAtaIx = createAssociatedTokenAccountInstruction(
                    wallet.publicKey, // payer
                    creatorUsdcAccount, // ata
                    wallet.publicKey, // owner
                    USDC_MINT // mint
                )
                const createAtaTx = new Transaction().add(createAtaIx)
                const createAtaSig = await wallet.sendTransaction(createAtaTx, connection)
                await connection.confirmTransaction(createAtaSig, 'confirmed')
                console.log('Creator USDC account created:', creatorUsdcAccount.toString())
            }

            // 13. Build currency enum for Anchor
            const currencyEnum = currency === 'SOL' ? { sol: {} } : { usdc: {} }

            // 14. Call withdraw_tips instruction
            const tx = await program.methods
                .withdrawTips(new BN(amountInSmallestUnit), currencyEnum)
                .accounts({
                    creator: wallet.publicKey,
                    creatorAccount: creatorAccountPDA,
                    creatorUsdcAccount: creatorUsdcAccount,
                    solVault: solVaultPDA,
                    usdcVault: usdcVaultPDA,
                    platformConfig: platformConfigPDA,
                    platformWallet: platformWallet,
                    platformUsdc: platformUsdcAccount,
                    tokenProgram: TOKEN_PROGRAM_ID,
                } as any)
                .rpc()

            // 15. Log transaction
            console.log('Withdrawal successful! Transaction:', tx)
            console.log('View on explorer:', `https://explorer.solana.com/tx/${tx}?cluster=devnet`)

            // 16. Set success
            setSuccess(true)

        } catch (err: any) {
            // 17. Handle error
            console.error('Error withdrawing:', err)
            setError(err.message || 'Failed to withdraw')
        } finally {
            // 18. Reset loading
            setIsLoading(false)
        }
    }

    // 19. Return state and function
    return {
        withdraw,
        isLoading,
        error,
        success,
    }
}