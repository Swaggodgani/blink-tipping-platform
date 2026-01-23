'use client'

import { useParams } from 'next/navigation'
import { PublicKey } from '@solana/web3.js'
import { TipForm } from '@/components/tip/TipForm'
import { useState, useEffect } from 'react'
import { getProgram, getCreatorAccountPDA } from '@/lib/anchor/setup'
import { useConnection } from '@solana/wallet-adapter-react'

export default function TipPage() {
    const params = useParams()
    const creatorAddress = params.address as string

    const [creatorExists, setCreatorExists] = useState(false)
    const [loading, setLoading] = useState(true)
    const { connection } = useConnection()

    useEffect(() => {
        async function checkCreator() {
            try {
                const creatorPubkey = new PublicKey(creatorAddress)
                const program = getProgram(connection)
                const [creatorAccountPDA] = getCreatorAccountPDA(creatorPubkey)
                await program.account.creatorAccount.fetch(creatorAccountPDA)
                setCreatorExists(true)
            } catch (err) {
                setCreatorExists(false)
            } finally {
                setLoading(false)
            }
        }

        checkCreator()
    }, [creatorAddress, connection])

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="text-center text-gray-600">Loading...</div>
            </div>
        )
    }

    if (!creatorExists) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                    <h1 className="text-2xl font-bold text-red-900 mb-2">Creator Not Found</h1>
                    <p className="text-red-700">This creator hasn't initialized their account yet.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-2 text-gray-900">Tip Creator</h1>
            <p className="text-gray-600 mb-8">
                Sending tip to: <code className="text-sm bg-gray-100 px-2 py-1 rounded">{creatorAddress.slice(0, 4)}...{creatorAddress.slice(-4)}</code>
            </p>

            <TipForm creatorAddress={creatorAddress} />
        </div>
    )
}