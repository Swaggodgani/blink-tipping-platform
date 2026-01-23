import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { mintTo, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import * as fs from "fs";

async function mintTestUSDC() {
    // Connect to devnet
    const connection = new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed");

    // Load test wallet
    const testWallet = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync("./test-wallet.json", "utf-8")))
    );

    // Devnet USDC mint
    const usdcMint = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

    console.log("Test wallet:", testWallet.publicKey.toString());
    console.log("USDC Mint:", usdcMint.toString());

    // Get or create token account
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        testWallet,
        usdcMint,
        testWallet.publicKey
    );

    console.log("Token account:", tokenAccount.address.toString());
    console.log("Current balance:", tokenAccount.amount.toString());

    // Note: We can't mint to devnet USDC as we don't control the mint authority
    console.log("\n⚠️ Cannot mint devnet USDC - we don't control the mint authority");
    console.log("Options:");
    console.log("1. Use a devnet USDC faucet (if available)");
    console.log("2. Create our own test token for testing");
    console.log("3. Skip USDC testing (infrastructure is ready)");
}

mintTestUSDC().catch(console.error);
