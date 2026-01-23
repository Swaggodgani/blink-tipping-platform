export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Blink Tipping
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Tip creators with SOL and USDC on Solana
        </p>

        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Getting Started</h2>
          <ol className="text-left space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Connect your Solana wallet using the button in the top right</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Make sure you're on Solana Devnet</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Get some devnet SOL from a faucet if needed</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
