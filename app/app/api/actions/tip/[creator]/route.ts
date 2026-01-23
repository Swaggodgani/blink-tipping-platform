import { Connection, PublicKey, Transaction, clusterApiUrl } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { getProgram } from '@/lib/anchor/setup';
import { USDC_MINT } from '@/lib/anchor/constants';
import { getAssociatedTokenAddress_Unchecked } from '@/lib/utils/token';

// CORS headers required for Blinks/Actions
const ACTIONS_CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept-Encoding',
    'X-Action-Version': '2.1.3',
    'X-Blockchain-Ids': 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1', // Devnet chain ID
};

// Handle CORS preflight
export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: ACTIONS_CORS_HEADERS
    });
}

// GET - Return action metadata
export async function GET(
    request: Request,
    context: { params: Promise<{ creator: string }> }
) {
    const { creator: creatorAddress } = await context.params;

    try {
        // Validate creator address
        new PublicKey(creatorAddress);
    } catch (err) {
        return Response.json(
            { error: 'Invalid creator address' },
            { status: 400, headers: ACTIONS_CORS_HEADERS }
        );
    }

    // Build action metadata
    const baseUrl = new URL(request.url).origin;

    const metadata = {
        icon: `${baseUrl}/tip-icon.png`,
        title: 'Send a Tip',
        description: 'Support this creator with SOL or USDC',
        label: 'Tip',
        links: {
            actions: [
                {
                    label: '0.001 SOL',
                    href: `${baseUrl}/api/actions/tip/${creatorAddress}?amount=0.001&currency=SOL`,
                },
                {
                    label: '0.005 SOL',
                    href: `${baseUrl}/api/actions/tip/${creatorAddress}?amount=0.005&currency=SOL`,
                },
                {
                    label: '0.01 SOL',
                    href: `${baseUrl}/api/actions/tip/${creatorAddress}?amount=0.01&currency=SOL`,
                },
                {
                    label: '1 USDC',
                    href: `${baseUrl}/api/actions/tip/${creatorAddress}?amount=1&currency=USDC`,
                },
                {
                    label: '5 USDC',
                    href: `${baseUrl}/api/actions/tip/${creatorAddress}?amount=5&currency=USDC`,
                },
                {
                    label: '10 USDC',
                    href: `${baseUrl}/api/actions/tip/${creatorAddress}?amount=10&currency=USDC`,
                },
            ],
        },
    };

    return Response.json(metadata, { headers: ACTIONS_CORS_HEADERS });
}

// POST - Build and return transaction
export async function POST(
    request: Request,
    context: { params: Promise<{ creator: string }> }
) {
    const { creator: creatorAddress } = await context.params;

    try {
        // Parse request body
        const body = await request.json();
        const { account } = body;

        if (!account) {
            return Response.json(
                { error: 'Missing account in request body' },
                { status: 400, headers: ACTIONS_CORS_HEADERS }
            );
        }

        // Get query parameters
        const url = new URL(request.url);
        const amountStr = url.searchParams.get('amount') || '0.01';
        const currency = url.searchParams.get('currency') || 'SOL';

        const amount = parseFloat(amountStr);

        // Validate inputs
        if (isNaN(amount) || amount <= 0) {
            return Response.json(
                { error: 'Invalid amount' },
                { status: 400, headers: ACTIONS_CORS_HEADERS }
            );
        }

        if (currency !== 'SOL' && currency !== 'USDC') {
            return Response.json(
                { error: 'Currency must be SOL or USDC' },
                { status: 400, headers: ACTIONS_CORS_HEADERS }
            );
        }

        // Build transaction
        const tipperPubkey = new PublicKey(account);
        const creatorPubkey = new PublicKey(creatorAddress);

        const connection = new Connection(clusterApiUrl('devnet'));
        const program = getProgram(connection);

        // Convert amount to smallest unit
        const amountInSmallestUnit = currency === 'SOL'
            ? Math.floor(amount * 1_000_000_000) // lamports
            : Math.floor(amount * 1_000_000);     // USDC base units

        // Get tipper's USDC account address
        const tipperUsdcAccount = await getAssociatedTokenAddress_Unchecked(
            USDC_MINT,
            tipperPubkey
        );

        // Build currency enum
        const currencyEnum = currency === 'SOL' ? { sol: {} } : { usdc: {} };

        // Build instruction
        const instruction = await program.methods
            .sendTip(new BN(amountInSmallestUnit), currencyEnum)
            .accounts({
                tipper: tipperPubkey,
                creator: creatorPubkey,
                tipperUsdcAccount: tipperUsdcAccount,
            })
            .instruction();

        // Build transaction
        const transaction = new Transaction();
        transaction.add(instruction);

        // Set recent blockhash and fee payer
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = tipperPubkey;

        // Serialize transaction
        const serializedTx = transaction.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
        });
        const base64Tx = serializedTx.toString('base64');

        // Return transaction response
        return Response.json(
            {
                transaction: base64Tx,
                message: `Sending ${amount} ${currency} tip! 🎉`,
            },
            { headers: ACTIONS_CORS_HEADERS }
        );

    } catch (error: any) {
        console.error('Error building transaction:', error);
        return Response.json(
            { error: error.message || 'Failed to build transaction' },
            { status: 500, headers: ACTIONS_CORS_HEADERS }
        );
    }
}
