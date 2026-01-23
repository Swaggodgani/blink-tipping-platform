'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useState } from 'react'

export function BlinkGenerator() {
    const { publicKey } = useWallet()
    const [copiedBlink, setCopiedBlink] = useState(false)
    const [copiedWeb, setCopiedWeb] = useState(false)

    // Build the Blink URL (use your actual domain when deployed)
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

    const blinkUrl = publicKey
        ? `solana-action:${baseUrl}/api/actions/tip/${publicKey.toString()}`
        : null

    // Regular link for fallback
    const webUrl = publicKey
        ? `${baseUrl}/tip/${publicKey.toString()}`
        : null

    const copyBlinkUrl = async () => {
        if (!blinkUrl) return
        try {
            await navigator.clipboard.writeText(blinkUrl)
            setCopiedBlink(true)
            setTimeout(() => setCopiedBlink(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const copyWebUrl = async () => {
        if (!webUrl) return
        try {
            await navigator.clipboard.writeText(webUrl)
            setCopiedWeb(true)
            setTimeout(() => setCopiedWeb(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    if (!publicKey) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Share Your Tip Link</h2>
                <p className="text-gray-600">Connect your wallet to generate your Blink URL.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Share Your Tip Link</h2>

            {/* Blink URL */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Blink URL (for Twitter/Discord/dial.to)
                </label>
                <div className="flex gap-2">
                    <input
                        readOnly
                        value={blinkUrl || ''}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm"
                    />
                    <button
                        onClick={copyBlinkUrl}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                    >
                        {copiedBlink ? '✅ Copied!' : 'Copy'}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Share this on platforms that support Solana Blinks
                </p>
            </div>

            {/* Web URL */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Regular URL (for anywhere)
                </label>
                <div className="flex gap-2">
                    <input
                        readOnly
                        value={webUrl || ''}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm"
                    />
                    <button
                        onClick={copyWebUrl}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                    >
                        {copiedWeb ? '✅ Copied!' : 'Copy'}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Use this on platforms without Blink support
                </p>
            </div>

            {/* How it works section */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">📱 How Blinks Work:</h3>
                <ul className="text-blue-800 space-y-2 text-sm">
                    <li className="flex items-start">
                        <span className="mr-2">✅</span>
                        <span><strong>With Blink support (dial.to):</strong> Shows interactive tip buttons directly</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">🔮</span>
                        <span><strong>Twitter/Discord (mainnet only):</strong> Will show Blink UI on mainnet</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">🌐</span>
                        <span><strong>Without Blink support:</strong> Use Regular URL, opens your tip page</span>
                    </li>
                </ul>
            </div>

            {/* Test link */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">🧪 Test Your Blink:</h3>
                <p className="text-sm text-green-800 mb-2">
                    Visit dial.to to test your Blink on devnet:
                </p>
                <a
                    href={`https://dial.to/?action=${encodeURIComponent(blinkUrl!)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm"
                >
                    Test on dial.to →
                </a>
            </div>
        </div>
    )
}
