const functions = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const {defineString} = require("firebase-functions/params");
const admin = require("firebase-admin");
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Add middleware to parse raw body for Stripe signature verification
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf } }));

exports.stripeWebhook = onRequest(async (req, res) => {
  const stripeConfig = (functions.config ? functions.config().stripe : defineString("stripe_token"));
  const stripe = require("stripe")(stripeConfig.token);
  let event;

  try {
    const whSec = stripeConfig.payments_webhook_secret;
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      req.headers["stripe-signature"],
      whSec,
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed.", err);
    return res.sendStatus(400);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const dataObject = event.data.object;
    console.log("Checkout session completed:", JSON.stringify(dataObject));
    await admin.firestore().collection("orders").add({
      checkoutSessionId: dataObject.id,
      paymentStatus: dataObject.payment_status,
      shippingInfo: dataObject.shipping,
      amountTotal: dataObject.amount_total,
      userId: dataObject.userId
    });
    creditsPurchased(dataObject.userId, dataObject.amount_total)
  
    return res.sendStatus(200);
  }

  // Return a response to acknowledge receipt of the event
  res.sendStatus(200);
});