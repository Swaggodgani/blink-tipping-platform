'use client';

import Link from 'next/link';

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-lg text-gray-600">
                        Everything you need to know about Blink Tipping.
                    </p>
                </div>

                {/* FAQ Items */}
                <div className="space-y-8">
                    {/* Q1 */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            What is Blink Tipping?
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            Blink Tipping is a decentralized platform that lets creators accept crypto tips directly on social media (like X/Twitter) using <span className="font-semibold text-purple-600">Solana Blinks</span>. Your fans can tip you without ever leaving their social feed, making the process instant and seamless.
                        </p>
                    </div>

                    {/* Q2 */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            How does it work?
                        </h3>
                        <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
                            <img src="/infographic.png" alt="Blink Tipping Architecture Infographic" className="w-full h-auto" />
                        </div>
                        <div className="text-gray-600 leading-relaxed space-y-4">
                            <p>It's simple:</p>
                            <ol className="list-decimal list-inside space-y-2 ml-2">
                                <li>Connect your Phantom wallet to create your Creator Account.</li>
                                <li>Copy your unique <strong>Blink URL</strong> from the dashboard.</li>
                                <li>Paste that URL into a post on X (Twitter).</li>
                            </ol>
                            <p>
                                Viewers with a compatible wallet (like Phantom or Solflare) will see a "Tip" button interface appear directly on the same page!
                            </p>
                        </div>
                    </div>

                    {/* Q3 */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Which currencies can I accept?
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            We currently support both <strong>SOL</strong> (Solana Native Token) and <strong>USDC</strong> (USD Coin). Your personalized Blink interface allows tippers to choose whichever currency they prefer.
                        </p>
                    </div>

                    {/* Q4 - Blink vs Link */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            What's the difference between a Blink and a regular link?
                        </h3>
                        <div className="text-gray-600 leading-relaxed space-y-4">
                            <div>
                                <strong className="text-purple-600">Regular Link:</strong>
                                <p className="mt-1">
                                    Takes people to your dedicated profile page. Fans can still connect their wallet and tip you here! Perfect for bios, Instagram, or sharing via apps where Blinks aren't supported yet.
                                </p>
                            </div>
                            <div>
                                <strong className="text-purple-600">Blink URL:</strong>
                                <p className="mt-1">
                                    A "Super Link" designed for X/Twitter. When posted, it transforms into an interactive card with "Tip" buttons, allowing users to pay you <strong>without leaving the current page they are on</strong>.
                                </p>
                                <p className="mt-2 text-sm text-purple-800 bg-purple-50 p-2 rounded">
                                    <strong>Note:</strong> Since this demo is running on <strong>Devnet</strong>, the Twitter card preview will only work on <a href="https://dial.to" target="_blank" className="underline hover:text-purple-900">dial.to</a> (set to Devnet). Direct Twitter integration requires a Mainnet deployment.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Q5 */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Are there any fees?
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            Yes, but they are extremely low. We charge a small platform fee of <strong>0.25%</strong> on withdrawals.
                        </p>
                        <p className="text-gray-500 text-sm mt-3 bg-gray-50 p-3 rounded-lg">
                            <span className="font-semibold text-purple-600">Why this matters:</span> Traditional platforms (like Patreon or Gumroad) often take <strong>5-10%</strong>, and credit card processors take another 2.9% + 30¢. Our 0.25% fee is roughly <strong>10x-20x cheaper</strong> than Web2 alternatives.
                        </p>
                    </div>

                    {/* Q7 */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Is it secure?
                        </h3>
                        <div className="text-gray-600 leading-relaxed">
                            Absolutely. The platform is <strong>non-custodial</strong>.
                            <br /><br />
                            This means:
                            <ul className="list-disc list-inside mt-2 ml-2 space-y-1">
                                <li>We never have access to your private keys.</li>
                                <li>Tips go into a secure "Vault" on the Blockchain that <strong>only your wallet</strong> can withdraw from.</li>
                                <li>Every transaction is verified on the Solana blockchain.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer / CTA */}
                <div className="mt-16 text-center">
                    <p className="text-gray-600 mb-6">Ready to start earning?</p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-purple-600 hover:bg-purple-700 transition-colors md:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
