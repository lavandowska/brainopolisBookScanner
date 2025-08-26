const functions = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const {defineString} = require("firebase-functions/params");
const admin = require("firebase-admin");
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const app = express();

// Define Stripe secret keys using Firebase's secret management
const stripeToken = defineString("stripe_token");
const paymentsWebhookSecret = defineString("payments_webhook_secret");

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Add middleware to parse raw body for Stripe signature verification
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf } }));

exports.stripeSessionCompletedWebhook = onRequest(
  // Make secrets available to the function
  { secrets: ["stripe_token", "payments_webhook_secret"] },
  async (req, res) => {
    const stripe = require("stripe")(stripeToken.value());
    let event;

    try {
      const whSec = paymentsWebhookSecret.value();
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
