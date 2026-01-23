import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BlinkTipping } from "../target/types/blink_tipping";
import { PublicKey, Keypair } from "@solana/web3.js";
import { assert } from "chai";
import {
  getOrCreateAssociatedTokenAccount,
  getAccount,
} from "@solana/spl-token";
import * as fs from "fs";

describe("blink-tipping", () => {
  // Load test wallet
  const testWalletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync("./test-wallet.json", "utf-8")))
  );

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.BlinkTipping as Program<BlinkTipping>;

  // Use test wallet as creator
  const creator = testWalletKeypair;

  // USDC mint (devnet)
  const usdcMint = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
  let creatorUsdcAccount: PublicKey;
  let tipperUsdcAccount: PublicKey;
  let platformUsdcAccount: PublicKey;

  it("Initializes platform config", async () => {
    const [platformConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_config")],
      program.programId
    );

    // Check if already exists
    try {
      const existing = await program.account.platformConfig.fetch(platformConfig);
      console.log("✅ Platform config already exists");
      console.log("Fee basis points:", existing.feeBasisPoints);
      return;
    } catch (e) {
      // Doesn't exist, create it
    }

    const tx = await program.methods
      .initializePlatformConfig()
      .signers([creator])
      .rpc();

    console.log("Platform config initialized:", tx);

    const config = await program.account.platformConfig.fetch(platformConfig);
    assert.equal(config.feeBasisPoints, 25);
    console.log("✅ Platform config initialized successfully!");
  });

  it("Creates USDC token accounts", async () => {
    console.log("Setting up USDC token accounts...");
    console.log("Test wallet:", creator.publicKey.toString());

    // Create token accounts
    const creatorTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      creator,
      usdcMint,
      creator.publicKey
    );
    creatorUsdcAccount = creatorTokenAccount.address;

    const tipperTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      creator,
      usdcMint,
      creator.publicKey
    );
    tipperUsdcAccount = tipperTokenAccount.address;

    const platformTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      creator,
      usdcMint,
      creator.publicKey
    );
    platformUsdcAccount = platformTokenAccount.address;

    console.log("✅ USDC token accounts ready");
    console.log("Creator USDC:", creatorUsdcAccount.toString());
  });

  it("Initializes a creator account with USDC vault", async () => {
    const [creatorAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("creator"), creator.publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .initializeCreator()
      .accounts({
        creator: creator.publicKey,
        usdcMint: usdcMint,
      })
      .signers([creator])
      .rpc();

    console.log("Transaction signature:", tx);

    const account = await program.account.creatorAccount.fetch(creatorAccount);
    assert.equal(account.creator.toString(), creator.publicKey.toString());
    assert.equal(account.totalTipsSol.toNumber(), 0);
    assert.equal(account.totalTipsUsdc.toNumber(), 0);
    console.log("✅ Creator account initialized with USDC vault!");
  });

  it("Sends a SOL tip", async () => {
    const [creatorAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("creator"), creator.publicKey.toBuffer()],
      program.programId
    );

    const initialAccount = await program.account.creatorAccount.fetch(creatorAccount);
    const initialTipsSol = initialAccount.totalTipsSol.toNumber();

    const tipAmount = 10_000_000; // 0.01 SOL

    const tx = await program.methods
      .sendTip(new anchor.BN(tipAmount), { sol: {} })
      .accounts({
        tipper: creator.publicKey,
        creator: creator.publicKey,
        tipperUsdcAccount: tipperUsdcAccount,
      })
      .signers([creator])
      .rpc();

    console.log("SOL tip transaction:", tx);

    const updatedAccount = await program.account.creatorAccount.fetch(creatorAccount);
    assert.equal(
      updatedAccount.totalTipsSol.toNumber(),
      initialTipsSol + tipAmount
    );

    console.log("✅ SOL tip sent successfully!");
    console.log("Total SOL tips:", updatedAccount.totalTipsSol.toNumber());
  });

  it("Sends a USDC tip", async () => {
    console.log("⚠️ Skipping USDC tip - need USDC tokens in test wallet");
    console.log("To test USDC: Get devnet USDC from a faucet first");
    // Would need actual USDC tokens in the test wallet to test this
  });

  it("Withdraws SOL tips with platform fee", async () => {
    const [creatorAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("creator"), creator.publicKey.toBuffer()],
      program.programId
    );

    const [platformConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_config")],
      program.programId
    );

    const initialCreatorAccount = await program.account.creatorAccount.fetch(creatorAccount);
    const initialPlatformConfig = await program.account.platformConfig.fetch(platformConfig);

    const withdrawAmount = initialCreatorAccount.totalTipsSol.toNumber();

    if (withdrawAmount === 0) {
      console.log("⚠️ No SOL to withdraw, skipping");
      return;
    }

    const expectedFee = Math.floor((withdrawAmount * 25) / 10000);

    const tx = await program.methods
      .withdrawTips(new anchor.BN(withdrawAmount), { sol: {} })
      .accounts({
        creator: creator.publicKey,
        platformWallet: initialPlatformConfig.authority,
        creatorUsdcAccount: creatorUsdcAccount,
        platformUsdc: platformUsdcAccount,
      })
      .signers([creator])
      .rpc();

    console.log("SOL withdrawal:", tx);

    const updatedCreatorAccount = await program.account.creatorAccount.fetch(creatorAccount);
    assert.equal(updatedCreatorAccount.totalTipsSol.toNumber(), 0);

    const updatedPlatformConfig = await program.account.platformConfig.fetch(platformConfig);
    assert.equal(
      updatedPlatformConfig.totalFeesCollectedSol.toNumber(),
      initialPlatformConfig.totalFeesCollectedSol.toNumber() + expectedFee
    );

    console.log("✅ SOL withdrawal successful!");
    console.log("Fee collected:", expectedFee);
  });

  it("Withdraws USDC tips with platform fee", async () => {
    console.log("⚠️ Skipping USDC withdrawal - no USDC tips to withdraw");
  });
});