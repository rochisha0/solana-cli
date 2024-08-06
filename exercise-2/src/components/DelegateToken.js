import React, { useState } from 'react';
import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createApproveInstruction, getAssociatedTokenAddress } from '@solana/spl-token';

const DelegateToken = () => {
  const [mintAddress, setMintAddress] = useState('');
  const [delegate, setDelegate] = useState('');
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState('');

  const delegateToken = async () => {
    const connection = new Connection(process.env.REACT_APP_SOLANA_NETWORK);
    const payer = Keypair.generate();
    const mint = new PublicKey(mintAddress);
    const tokenAccountAddress = await getAssociatedTokenAddress(mint, payer.publicKey);

    const transaction = new Transaction().add(
      createApproveInstruction(
        tokenAccountAddress,
        new PublicKey(delegate),
        payer.publicKey,
        amount
      )
    );

    await sendAndConfirmTransaction(connection, transaction, [payer]);

    setMessage(`Delegated ${amount} tokens to ${delegate}`);
  };

  return (
    <div>
      <h2>Delegate Token</h2>
      <input 
        type="text" 
        placeholder="Mint Address" 
        value={mintAddress}
        onChange={(e) => setMintAddress(e.target.value)} 
      />
      <input 
        type="text" 
        placeholder="Delegate Address" 
        value={delegate}
        onChange={(e) => setDelegate(e.target.value)} 
      />
      <input 
        type="number" 
        placeholder="Amount" 
        value={amount}
        onChange={(e) => setAmount(e.target.value)} 
      />
      <button onClick={delegateToken}>Delegate</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default DelegateToken;
