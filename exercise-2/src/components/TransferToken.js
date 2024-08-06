import React, { useState } from 'react';
import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';

const TransferToken = () => {
  const [mintAddress, setMintAddress] = useState('');
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState('');

  const transferToken = async () => {
    const connection = new Connection(process.env.REACT_APP_SOLANA_NETWORK);
    const payer = Keypair.generate();

    // Airdrop SOL to the payer account for testing
    await connection.requestAirdrop(payer.publicKey, 2e9);

    const mint = new PublicKey(mintAddress);
    const sourceTokenAccount = await getAssociatedTokenAddress(mint, payer.publicKey);
    const destinationTokenAccount = await getAssociatedTokenAddress(mint, new PublicKey(destination));

    const transaction = new Transaction().add(
      createTransferInstruction(
        sourceTokenAccount,
        destinationTokenAccount,
        payer.publicKey,
        amount
      )
    );

    try {
      await sendAndConfirmTransaction(connection, transaction, [payer]);
      setMessage(`Transferred ${amount} tokens to ${destinationTokenAccount.toBase58()}`);
    } catch (error) {
      console.error('Transaction error:', error);
      setMessage('Transfer transaction failed.');
    }
  };

  return (
    <div>
      <h2>Transfer Token</h2>
      <input 
        type="text" 
        placeholder="Mint Address" 
        value={mintAddress}
        onChange={(e) => setMintAddress(e.target.value)} 
      />
      <input 
        type="text" 
        placeholder="Destination Address" 
        value={destination}
        onChange={(e) => setDestination(e.target.value)} 
      />
      <input 
        type="number" 
        placeholder="Amount" 
        value={amount}
        onChange={(e) => setAmount(e.target.value)} 
      />
      <button onClick={transferToken}>Transfer</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TransferToken;
