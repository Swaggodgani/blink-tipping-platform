
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { getAccount } from '@solana/spl-token';

const PROGRAM_ID = new PublicKey('DJPC2oUD3YkjEF2EKmcuStte92vSBrYh9nZaEmna9RmJ');
const CREATOR_PUBKEY = new PublicKey('EH8moVRZNisJCQtCF5sdi8oUAveeBvtDMnWbTrQDHGX9');
const EXPECTED_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

async function main() {
    console.log("Checking state for Creator:", CREATOR_PUBKEY.toString());
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    // 1. Derive PDAs
    const [creatorAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("creator"), CREATOR_PUBKEY.toBuffer()],
        PROGRAM_ID
    );
    console.log("Creator Account PDA:", creatorAccountPda.toString());

    const [usdcVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault_usdc"), CREATOR_PUBKEY.toBuffer()],
        PROGRAM_ID
    );
    console.log("USDC Vault PDA:", usdcVaultPda.toString());

    // 2. Check Creator Account
    const creatorInfo = await connection.getAccountInfo(creatorAccountPda);
    if (!creatorInfo) {
        console.log("❌ Creator Account does NOT exist (AccountNotInitialized)");
    } else {
        console.log("✅ Creator Account exists. Data length:", creatorInfo.data.length);
    }

    // 3. Check USDC Vault
    const vaultInfo = await connection.getAccountInfo(usdcVaultPda);
    if (!vaultInfo) {
        console.log("❌ USDC Vault does NOT exist (AccountNotInitialized)");
    } else {
        console.log("✅ USDC Vault exists.");

        // Check Mint
        try {
            const tokenAccount = await getAccount(connection, usdcVaultPda);
            console.log("   Vault Mint:", tokenAccount.mint.toString());
            console.log("   Expected:  ", EXPECTED_MINT.toString());

            if (tokenAccount.mint.toString() === EXPECTED_MINT.toString()) {
                console.log("   ✅ Vault Mint MATCHES expected mint.");
            } else {
                console.log("   ⚠️ Vault Mint DOES NOT MATCH!");
                console.log("   CRITICAL: This creator is locked to the old mint.");
            }
        } catch (e) {
            console.log("   Error parsing token account:", e);
        }
    }
}

main().catch(console.error);
