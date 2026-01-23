import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { WalletButton } from "@/components/WalletButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blink Tipping - Solana Tipping Platform",
  description: "Tip creators with SOL and USDC on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 
          WalletProvider wraps the entire app
          This makes wallet state available everywhere via useWallet() hook
        */}
        <WalletProvider>
          {/* Navigation bar with wallet button */}
          <nav className="border-b border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo/Brand */}
                <div className="flex items-center gap-8">
                  <a href="/" className="text-xl font-bold text-purple-600 hover:text-purple-700">
                    Blink Tipping
                  </a>

                  {/* Navigation Links */}
                  <div className="hidden md:flex gap-6">
                    <a href="/dashboard" className="text-gray-700 hover:text-purple-600 font-medium">
                      Dashboard
                    </a>
                    <a href="/faq" className="text-gray-700 hover:text-purple-600 font-medium">
                      FAQ
                    </a>
                    <a href="/test" className="text-gray-700 hover:text-purple-600 font-medium">
                      Test
                    </a>
                  </div>
                </div>

                {/* Wallet Button */}
                <WalletButton />
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  );
}
