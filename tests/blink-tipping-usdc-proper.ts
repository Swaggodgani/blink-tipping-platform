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

describe("blink-tipping-usdc-proper", () => {
    // Load test wallet for funding
    const funder = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync("./test-wallet.json", "utf-8")))
    );

    // Create SEPARATE keypairs for each role
    const creator = Keypair.generate();
    const tipper = Keypair.generate();
    const platform = Keypair.generate(); // Separate platform wallet

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.BlinkTipping as Program<BlinkTipping>;

    let testUsdcMint: PublicKey;
    let creatorUsdcAccount: PublicKey;
    let tipperUsdcAccount: PublicKey;
    let platformUsdcAccount: PublicKey;

    it("Funds all wallets", async () => {
        console.log("Creator:", creator.publicKey.toString());
        console.log("Tipper:", tipper.publicKey.toString());
        console.log("Platform:", platform.publicKey.toString());

        // Fund creator
        const tx1 = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: funder.publicKey,
                toPubkey: creator.publicKey,
                lamports: 0.1 * anchor.web3.LAMPORTS_PER_SOL,
            })
        );
        await provider.sendAndConfirm(tx1, [funder]);

        // Fund tipper
        const tx2 = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: funder.publicKey,
                toPubkey: tipper.publicKey,
                lamports: 0.1 * anchor.web3.LAMPORTS_PER_SOL,
            })
        );
        await provider.sendAndConfirm(tx2, [funder]);

        console.log("✅ All wallets funded");
    });

    it("Creates test USDC mint and token accounts", async () => {
        // Create test USDC mint
        testUsdcMint = await createMint(
            provider.connection,
            funder,
            creator.publicKey, // Creator controls mint
            null,
            6
        );

        console.log("Test USDC Mint:", testUsdcMint.toString());

        // Create SEPARATE token accounts for each person
        const creatorTokenAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            funder,
            testUsdcMint,
            creator.publicKey // Creator's account
        );
        creatorUsdcAccount = creatorTokenAccount.address;

        const tipperTokenAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            funder,
            testUsdcMint,
            tipper.publicKey // Tipper's account (different!)
        );
        tipperUsdcAccount = tipperTokenAccount.address;

        const platformTokenAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            funder,
            testUsdcMint,
            platform.publicKey // Platform's account (different!)
        );
        platformUsdcAccount = platformTokenAccount.address;

        // Mint 1000 USDC to TIPPER (not creator)
        await mintTo(
            provider.connection,
            creator, // Creator signs as mint authority
            testUsdcMint,
            tipperUsdcAccount, // Give to tipper
            creator.publicKey,
            1000_000_000
        );

        console.log("✅ Token accounts created");
        console.log("Creator USDC account:", creatorUsdcAccount.toString());
        console.log("Tipper USDC account:", tipperUsdcAccount.toString());
        console.log("Platform USDC account:", platformUsdcAccount.toString());
    });

    it("Initializes creator with USDC vault", async () => {
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

    it("Sends a USDC tip from tipper to creator", async () => {
        const [creatorAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("creator"), creator.publicKey.toBuffer()],
            program.programId
        );

        const [usdcVault] = PublicKey.findProgramAddressSync(
            [Buffer.from("vault_usdc"), creator.publicKey.toBuffer()],
            program.programId
        );

        const tipAmount = 10_000_000; // 10 USDC

        // TIPPER sends tip to CREATOR
        const tx = await program.methods
            .sendTip(new anchor.BN(tipAmount), { usdc: {} })
            .accounts({
                tipper: tipper.publicKey, // Tipper signs
                creator: creator.publicKey, // Creator receives
                tipperUsdcAccount: tipperUsdcAccount, // Tipper's tokens
            })
            .signers([tipper]) // Tipper signs!
            .rpc();

        console.log("USDC tip transaction:", tx);

        const updatedAccount = await program.account.creatorAccount.fetch(creatorAccount);
        assert.equal(updatedAccount.totalTipsUsdc.toNumber(), tipAmount);

        const vaultAccount = await getAccount(provider.connection, usdcVault);
        assert.equal(Number(vaultAccount.amount), tipAmount);

        console.log("✅ USDC tip sent successfully!");
        console.log("Vault balance:", Number(vaultAccount.amount) / 1_000_000, "USDC");
    });

    it("Withdraws USDC tips with platform fee (proper test)", async () => {
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

        // Get initial balances (should all be 0 since they're separate accounts)
        const initialCreatorBalance = await getAccount(provider.connection, creatorUsdcAccount);
        const initialPlatformBalance = await getAccount(provider.connection, platformUsdcAccount);

        console.log("Initial creator balance:", Number(initialCreatorBalance.amount) / 1_000_000, "USDC");
        console.log("Initial platform balance:", Number(initialPlatformBalance.amount) / 1_000_000, "USDC");

        const tx = await program.methods
            .withdrawTips(new anchor.BN(withdrawAmount), { usdc: {} })
            .accounts({
                creator: creator.publicKey,
                platformWallet: initialPlatformConfig.authority,
                creatorUsdcAccount: creatorUsdcAccount,
                platformUsdc: platformUsdcAccount, // Platform's separate account
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

        console.log("Final creator balance:", Number(finalCreatorBalance.amount) / 1_000_000, "USDC");
        console.log("Final platform balance:", Number(finalPlatformBalance.amount) / 1_000_000, "USDC");
        console.log("Creator received:", creatorReceived / 1_000_000, "USDC");
        console.log("Platform received:", platformReceived / 1_000_000, "USDC");

        // NOW these assertions should work!
        assert.equal(creatorReceived, expectedCreatorAmount, "Creator should receive amount minus fee");
        assert.equal(platformReceived, expectedFee, "Platform should receive the fee");

        console.log("✅ USDC withdrawal successful!");
        console.log("✅ Fee calculation verified: 0.25% = ", expectedFee / 1_000_000, "USDC");
    });
});
