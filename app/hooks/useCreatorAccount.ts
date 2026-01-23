// 1. Import dependencies
import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { getProgram, getCreatorAccountPDA } from '@/lib/anchor/setup'
// 2. Define the hook
export function useCreatorAccount() {
    // 3. State for storing creator data
    const [creatorData, setCreatorData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // 4. Get wallet and connection
    const { publicKey } = useWallet()
    const { connection } = useConnection()

    // 5. Fetch creator account data
    useEffect(() => {
        async function fetchCreatorAccount() {
            // 6. Check if wallet is connected
            if (!publicKey) {
                setLoading(false)
                return
            }

            try {
                // 7. Reset state
                setLoading(true)
                setError(null)

                // 8. Get program instance
                const program = getProgram(connection)

                // 9. Get creator account PDA
                const [creatorAccountPDA] = getCreatorAccountPDA(publicKey)

                // 10. Fetch the account data
                const account = await program.account.creatorAccount.fetch(creatorAccountPDA)

                // 11. Store the data
                setCreatorData(account)

            } catch (err: any) {
                // 12. Handle error (account might not exist)
                console.error('Error fetching creator account:', err)
                setError(err.message)
                setCreatorData(null)
            } finally {
                // 13. Stop loading
                setLoading(false)
            }
        }

        // 14. Call the function
        fetchCreatorAccount()

        // 15. Re-fetch when wallet changes
    }, [publicKey, connection])

    // 16. Return state
    return {
        creatorData,
        loading,
        error,
    }
}