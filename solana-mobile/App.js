import React, { useState } from 'react';
import { View, Button, Image, Text } from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import { Connection, PublicKey, Keypair, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { actions, programs } from '@metaplex/js';
import { v4 as uuidv4 } from 'uuid'; // For unique metadata

const App = () => {
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState(null);
  const [mintingStatus, setMintingStatus] = useState('');

  const captureImage = () => {
    launchCamera({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera picker');
      } else if (response.error) {
        console.log('Camera error: ', response.error);
      } else {
        setImageUri(response.assets[0].uri);
        getLocation();
      }
    });
  };

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
      },
      (error) => console.log(error),
      { enableHighAccuracy: true }
    );
  };

  const mintNFT = async () => {
    if (!imageUri || !location) {
      console.log("Image or location not available");
      return;
    }

    setMintingStatus('Minting NFT...');
    
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    
    // Create a new wallet keypair or use an existing one
    const wallet = Keypair.generate();
    
    // Airdrop SOL for transaction fees (Devnet only)
    const airdropSignature = await connection.requestAirdrop(
      wallet.publicKey,
      LAMPORTS_PER_SOL, // 1 SOL for testing
    );

    await connection.confirmTransaction(airdropSignature);

    const { metadata, mint } = programs.metadata;
    
    const uniqueMetadataUri = `https://example.com/metadata/${uuidv4()}.json`; // Upload image & metadata to IPFS or Arweave and get the URI
    
    // Prepare the NFT metadata
    const nftMetadata = {
      name: "NFT with Location",
      symbol: "",
      uri: uniqueMetadataUri, // Link to metadata JSON (which contains the image and location)
      seller_fee_basis_points: 500, // 5% royalty fee
      creators: null,
    };

    // Mint the NFT
    try {
      const mintNFTTransaction = await actions.mintNFT({
        connection,
        wallet: {
          publicKey: wallet.publicKey,
          signTransaction: (tx) => wallet.signTransaction(tx),
          signAllTransactions: (txs) => wallet.signAllTransactions(txs),
        },
        metadata: nftMetadata,
      });

      console.log('NFT Minted!', mintNFTTransaction);
      setMintingStatus('NFT Minted Successfully!');
    } catch (error) {
      console.error('Error minting NFT:', error);
      setMintingStatus('Error Minting NFT');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Capture Image" onPress={captureImage} />
      {imageUri && <Image source={{ uri: imageUri }} style={{ width: 300, height: 300, marginVertical: 10 }} />}
      {location && (
        <Text>Location: {location.latitude}, {location.longitude}</Text>
      )}
      <Button title="Mint NFT" onPress={mintNFT} />
      {mintingStatus && <Text>{mintingStatus}</Text>}
    </View>
  );
};

export default App;
