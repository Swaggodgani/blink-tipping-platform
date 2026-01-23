import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BlinkTipping } from "../target/types/blink_tipping";
import { PublicKey, Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { assert } from "chai";
import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    getAccount,
} from "@solana/spl-token";
import * as fs from "fs";

describe("blink-tipping-usdc", () => {
    // Load test wallet for funding
    const funder = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync("./test-wallet.json", "utf-8")))
    );

    // Create a NEW keypair for this test (fresh creator)
    const creator = Keypair.generate();

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.BlinkTipping as Program<BlinkTipping>;

    // We'll create our own test USDC mint
    let testUsdcMint: PublicKey;
    let creatorUsdcAccount: PublicKey;
    let tipperUsdcAccount: PublicKey;
    let platformUsdcAccount: PublicKey;

    it("Funds new creator wallet from test wallet", async () => {
        console.log("New creator:", creator.publicKey.toString());
        console.log("Funder:", funder.publicKey.toString());

        // Transfer SOL from funder to creator
        const tx = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: funder.publicKey,
                toPubkey: creator.publicKey,
                lamports: 0.5 * anchor.web3.LAMPORTS_PER_SOL,
            })
        );

        await provider.sendAndConfirm(tx, [funder]);

        const balance = await provider.connection.getBalance(creator.publicKey);
        console.log("✅ Creator funded with", balance / anchor.web3.LAMPORTS_PER_SOL, "SOL");
    });

    it("Creates test USDC mint and funds accounts", async () => {
        console.log("Creating test USDC mint...");

        // Create our own USDC-like token (6 decimals)
        testUsdcMint = await createMint(
            provider.connection,
            funder, // Use funder to pay
            creator.publicKey, // Creator controls mint
            null,
            6
        );

        console.log("Test USDC Mint:", testUsdcMint.toString());

        // Create token accounts
        const creatorTokenAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            funder,
            testUsdcMint,
            creator.publicKey
        );
        creatorUsdcAccount = creatorTokenAccount.address;

        const tipperTokenAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            funder,
            testUsdcMint,
            creator.publicKey
        );
        tipperUsdcAccount = tipperTokenAccount.address;

        const platformTokenAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            funder,
            testUsdcMint,
            creator.publicKey
        );
        platformUsdcAccount = platformTokenAccount.address;

        // Mint 1000 test USDC to tipper
        await mintTo(
            provider.connection,
            creator, // Creator signs as mint authority
            testUsdcMint,
            tipperUsdcAccount,
            creator.publicKey,
            1000_000_000 // 1000 USDC
        );

        const balance = await getAccount(provider.connection, tipperUsdcAccount);
        console.log("✅ Test USDC minted!");
        console.log("Tipper balance:", Number(balance.amount) / 1_000_000, "USDC");
    });

    it("Initializes creator with test USDC vault", async () => {
        const tx = await program.methods
            .initializeCreator()
            .accounts({
                creator: creator.publicKey,
                usdcMint: testUsdcMint,
            })
            .signers([creator])
            .rpc();

        console.log("✅ Creator initialized:", tx);
    });

    it("Sends a USDC tip", async () => {
        const [creatorAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("creator"), creator.publicKey.toBuffer()],
            program.programId
        );

        const [usdcVault] = PublicKey.findProgramAddressSync(
            [Buffer.from("vault_usdc"), creator.publicKey.toBuffer()],
            program.programId
        );

        const tipAmount = 10_000_000; // 10 USDC

        const tx = await program.methods
            .sendTip(new anchor.BN(tipAmount), { usdc: {} })
            .accounts({
                tipper: creator.publicKey,
                creator: creator.publicKey,
                tipperUsdcAccount: tipperUsdcAccount,
            })
            .signers([creator])
            .rpc();

        console.log("USDC tip transaction:", tx);

        const updatedAccount = await program.account.creatorAccount.fetch(creatorAccount);
        assert.equal(updatedAccount.totalTipsUsdc.toNumber(), tipAmount);

        // Verify vault received tokens
        const vaultAccount = await getAccount(provider.connection, usdcVault);
        assert.equal(Number(vaultAccount.amount), tipAmount);

        console.log("✅ USDC tip sent successfully!");
        console.log("Total USDC tips:", updatedAccount.totalTipsUsdc.toNumber() / 1_000_000, "USDC");
        console.log("Vault balance:", Number(vaultAccount.amount) / 1_000_000, "USDC");
    });

    it("Withdraws USDC tips with platform fee", async () => {
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

        const withdrawAmount = initialCreatorAccount.totalTipsUsdc.toNumber();
        const expectedFee = Math.floor((withdrawAmount * 25) / 10000);
        const expectedCreatorAmount = withdrawAmount - expectedFee;

        console.log("Withdrawing:", withdrawAmount / 1_000_000, "USDC");
        console.log("Expected fee:", expectedFee / 1_000_000, "USDC (0.25%)");
        console.log("Expected to creator:", expectedCreatorAmount / 1_000_000, "USDC");

        // Get initial balances
        const initialCreatorBalance = await getAccount(provider.connection, creatorUsdcAccount);
        const initialPlatformBalance = await getAccount(provider.connection, platformUsdcAccount);

        const tx = await program.methods
            .withdrawTips(new anchor.BN(withdrawAmount), { usdc: {} })
            .accounts({
                creator: creator.publicKey,
                platformWallet: initialPlatformConfig.authority,
                creatorUsdcAccount: creatorUsdcAccount,
                platformUsdc: platformUsdcAccount,
            })
            .signers([creator])
            .rpc();

        console.log("USDC withdrawal transaction:", tx);

        // Verify account updates
        const updatedCreatorAccount = await program.account.creatorAccount.fetch(creatorAccount);
        assert.equal(updatedCreatorAccount.totalTipsUsdc.toNumber(), 0);

        const updatedPlatformConfig = await program.account.platformConfig.fetch(platformConfig);
        assert.equal(
            updatedPlatformConfig.totalFeesCollectedUsdc.toNumber(),
            initialPlatformConfig.totalFeesCollectedUsdc.toNumber() + expectedFee
        );

        // Verify token balances
        const finalCreatorBalance = await getAccount(provider.connection, creatorUsdcAccount);
        const finalPlatformBalance = await getAccount(provider.connection, platformUsdcAccount);

        const creatorReceived = Number(finalCreatorBalance.amount) - Number(initialCreatorBalance.amount);
        const platformReceived = Number(finalPlatformBalance.amount) - Number(initialPlatformBalance.amount);

        console.log("Debug - Initial creator balance:", Number(initialCreatorBalance.amount));
        console.log("Debug - Final creator balance:", Number(finalCreatorBalance.amount));
        console.log("Debug - Creator received:", creatorReceived);
        console.log("Debug - Expected creator amount:", expectedCreatorAmount);
        console.log("Debug - Initial platform balance:", Number(initialPlatformBalance.amount));
        console.log("Debug - Final platform balance:", Number(finalPlatformBalance.amount));
        console.log("Debug - Platform received:", platformReceived);
        console.log("Debug - Expected fee:", expectedFee);

        assert.equal(creatorReceived, expectedCreatorAmount);
        assert.equal(platformReceived, expectedFee);

        console.log("✅ USDC withdrawal successful!");
        console.log("Creator received:", creatorReceived / 1_000_000, "USDC");
        console.log("Platform fee:", platformReceived / 1_000_000, "USDC");
        console.log("Total platform USDC fees:", updatedPlatformConfig.totalFeesCollectedUsdc.toNumber() / 1_000_000, "USDC");
    });
});
