import React, { useState } from 'react';
import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createAssociatedTokenAccount, createBurnInstruction, getAccount, getAssociatedTokenAddress } from '@solana/spl-token';

const BurnToken = () => {
  const [mintAddress, setMintAddress] = useState('');
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState('');

  const burnToken = async () => {
    const connection = new Connection(process.env.REACT_APP_SOLANA_NETWORK);
    const payer = Keypair.generate();

    // Airdrop SOL to the payer account for testing
    await connection.requestAirdrop(payer.publicKey, 2e9);

    const mint = new PublicKey(mintAddress);
    const tokenAccountAddress = await getAssociatedTokenAddress(mint, payer.publicKey);

    try {
      await getAccount(connection, tokenAccountAddress);
    } catch (error) {
      await createAssociatedTokenAccount(connection, payer, mint, payer.publicKey);
    }

    const transaction = new Transaction().add(
      createBurnInstruction(
        tokenAccountAddress,
        mint,
        payer.publicKey,
        amount
      )
    );

    try {
      await sendAndConfirmTransaction(connection, transaction, [payer]);
      setMessage(`Burned ${amount} tokens from ${tokenAccountAddress.toBase58()}`);
    } catch (error) {
      console.error('Transaction error:', error);
      setMessage('Burn transaction failed.');
    }
  };

  return (
    <div>
      <h2>Burn Token</h2>
      <input 
        type="text" 
        placeholder="Mint Address" 
        value={mintAddress}
        onChange={(e) => setMintAddress(e.target.value)} 
      />
      <input 
        type="number" 
        placeholder="Amount" 
        value={amount}
        onChange={(e) => setAmount(e.target.value)} 
      />
      <button onClick={burnToken}>Burn</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default BurnToken;
