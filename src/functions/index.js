const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const stripeConfig = functions.config.stripe;
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
      console.error("⚠️ Webhook signature verification failed.");
      return res.sendStatus(400);
    }
  
    const dataObject = event.data.object;
    console.log(JSON.stringify(dataObject));
  
    await admin.firestore().collection("orders").doc().set({
      checkoutSessionId: dataObject.id,
      paymentStatus: dataObject.payment_status,
      shippingInfo: dataObject.shipping,
      amountTotal: dataObject.amount_total,
    });
  
    return res.sendStatus(200);
  });