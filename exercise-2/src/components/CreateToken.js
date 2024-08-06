import React, { useState } from 'react';
import { Connection, Keypair } from '@solana/web3.js';
import { createMint } from '@solana/spl-token';

const CreateToken = () => {
  const [token, setToken] = useState(null);
  const [message, setMessage] = useState('');

  const createToken = async () => {
    const connection = new Connection(process.env.REACT_APP_SOLANA_NETWORK);
    const payer = Keypair.generate();

    // Airdrop SOL to the payer account for testing
    await connection.requestAirdrop(payer.publicKey, 2e9);

    try {
      const mint = await createMint(
        connection,
        payer,
        payer.publicKey,
        null,
        9
      );
      setToken(mint.toBase58());
      setMessage(`Token Created: ${mint.toBase58()}`);
    } catch (error) {
      console.error('Transaction error:', error);
      setMessage('Token creation failed.');
    }
  };

  return (
    <div>
      <h2>Create Token</h2>
      <button onClick={createToken}>Create Token</button>
      {token && <p>{message}</p>}
    </div>
  );
};

export default CreateToken;
