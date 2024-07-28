import { Command } from 'commander';
import { Connection, PublicKey, clusterApiUrl, Keypair, LAMPORTS_PER_SOL, Transaction, SystemProgram } from '@solana/web3.js';
import bs58 from 'bs58';

const program = new Command();

program
    .name('solana-cli')
    .description('CLI tool to interact with Solana blockchain')
    .version('1.0.0');

// Command to create a new keypair
program
    .command('create-keypair')
    .description('Create a new keypair')
    .action(() => {
        const keypair = Keypair.generate();
        console.log('Public Key:', keypair.publicKey.toBase58());
        console.log('Secret Key:', bs58.encode(keypair.secretKey));
    });

// Command to request an airdrop
program
    .command('airdrop')
    .description('Request an airdrop to a public key')
    .argument('<publicKey>', 'Public key to receive the airdrop')
    .argument('<amount>', 'Amount of SOL to airdrop')
    .action(async (publicKey, amount) => {
        try {
            const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
            const pubKey = new PublicKey(publicKey);
            const signature = await connection.requestAirdrop(pubKey, Number(amount) * LAMPORTS_PER_SOL);
            const latestBlockHash = await connection.getLatestBlockhash();
            await connection.confirmTransaction(
                {
                    signature: signature,
                    blockhash: latestBlockHash.blockhash,
                    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                },
                'confirmed'
            );
            console.log(`Airdrop requested: ${amount} SOL to ${publicKey}`);
        } catch (error) {
            console.error('Failed to request airdrop:', error);
        }
    });

// Command to send SOL to another public key
program
    .command('send')
    .description('Send SOL from one keypair to another public key')
    .argument('<fromSecretKey>', 'Secret key of the sender')
    .argument('<toPublicKey>', 'Public key of the recipient')
    .argument('<amount>', 'Amount of SOL to send')
    .action(async (fromSecretKey, toPublicKey, amount) => {
        try {
            const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
            const fromKeypair = Keypair.fromSecretKey(bs58.decode(fromSecretKey));
            const toPubKey = new PublicKey(toPublicKey);

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: fromKeypair.publicKey,
                    toPubkey: toPubKey,
                    lamports: Number(amount) * LAMPORTS_PER_SOL,
                }),
            );

            const signature = await connection.sendTransaction(transaction, [fromKeypair]);
            const latestBlockHash = await connection.getLatestBlockhash();
            await connection.confirmTransaction(
                {
                    signature: signature,
                    blockhash: latestBlockHash.blockhash,
                    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                },
                'confirmed'
            );

            console.log(`Sent ${amount} SOL from ${fromKeypair.publicKey.toBase58()} to ${toPubKey.toBase58()}`);
        } catch (error) {
            console.error('Failed to send SOL:', error);
        }
    });

program.parse(process.argv);
