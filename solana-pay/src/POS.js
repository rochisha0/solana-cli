import React, { useState, useEffect, useCallback } from "react";
import {
  PublicKey,
  Connection,
  clusterApiUrl,
  Keypair,
} from "@solana/web3.js";
import {
  encodeURL,
  createQR,
  findReference,
  validateTransfer,
  FindReferenceError,
} from "@solana/pay";
import BigNumber from "bignumber.js";
import QRCodeStyling from "@solana/qr-code-styling";
import {
  Container,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar,
  Alert,
  Paper,
  Grid,
} from "@mui/material";

const POS = () => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [qrCode, setQrCode] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [paymentParams, setPaymentParams] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const merchantPublicKey = new PublicKey(
    "2FJZ49vWsN3LE3tmNsd14DmtSmxNtsr32vsrgKBUv77p"
  );

  const addItemToCart = (item) => {
    setCart([...cart, item]);
    setTotal(total + item.price);
  };

  const handlePayment = async () => {
    try {
      const connection = new Connection(clusterApiUrl("devnet"));
      const amount = new BigNumber(total);
      const reference = Keypair.generate().publicKey;
      const paymentParams = {
        recipient: merchantPublicKey,
        amount,
        reference,
        label: "Your Store",
        message: "Thank you for your purchase!",
      };

      setPaymentParams(paymentParams);

      // Generate QR code
      const qrCodeStyling = new QRCodeStyling({
        width: 300,
        height: 300,
        data: encodeURL(paymentParams),
        dotsOptions: {
          color: "#000000",
        },
      });
      setQrCode(qrCodeStyling);
      setTransactionStatus("pending");

      const findAndValidateTransaction = async () => {
        try {
          const signature = await findReference(connection, reference, {
            finality: "confirmed",
          });
          setTransactionStatus("confirmed");

          await validateTransfer(connection, signature.signature, {
            recipient: merchantPublicKey,
            amount,
            reference,
          });
          setTransactionStatus("validated");
          setSnackbarOpen(true);
        } catch (error) {
          if (error instanceof FindReferenceError) {
            setTimeout(findAndValidateTransaction, 1000);
          } else {
            console.error("Payment validation failed:", error);
            setPaymentError("Payment failed. Please try again.");
            setTransactionStatus("failed");
            setSnackbarOpen(true);
          }
        }
      };

      findAndValidateTransaction();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      setPaymentError("Payment initiation failed. Please try again.");
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    if (qrCode) {
      const qrElement = document.getElementById("qr-container");
      qrElement.innerHTML = "";
      qrCode.append(qrElement);
    }
  }, [qrCode]);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          POS System
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Cart</Typography>
          <List>
            {cart.map((item, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={item.name}
                  secondary={`$${item.price.toFixed(2)}`}
                />
              </ListItem>
            ))}
          </List>
          <Divider />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6">${total.toFixed(2)}</Typography>
          </Box>
        </Box>

        <Box id="qr-container" sx={{ textAlign: "center", mb: 2 }}></Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => addItemToCart({ name: "Item 1", price: 10.0 })}
            >
              Add Item 1 ($10)
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handlePayment}
              disabled={total === 0}
            >
              Pay Now
            </Button>
          </Grid>
        </Grid>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
        >
          {transactionStatus === "validated" ? (
            <Alert
              onClose={() => setSnackbarOpen(false)}
              severity="success"
              sx={{ width: "100%" }}
            >
              Payment Confirmed! Thank you for your purchase.
            </Alert>
          ) : (
            <Alert
              onClose={() => setSnackbarOpen(false)}
              severity="error"
              sx={{ width: "100%" }}
            >
              {paymentError}
            </Alert>
          )}
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default POS;
