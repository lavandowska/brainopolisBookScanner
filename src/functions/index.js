const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { defineString } = require("firebase-functions/params");
const express = require("express");
const cors = require("cors");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Define secret parameters
const stripeToken = defineString("STRIPE_TOKEN");
const paymentsWebhookSecret = defineString("PAYMENTS_WEBHOOK_SECRET");

const app = express();

// Use CORS middleware
app.use(cors({ origin: true }));

// Handle POST requests to /stripe-webhook
app.post("/stripe-webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const stripe = require("stripe")(stripeToken.value());
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            req.headers["stripe-signature"],
            paymentsWebhookSecret.value()
        );
    } catch (err) {
        console.error("Webhook signature verification failed.", err.message);
        return res.sendStatus(400);
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const amountTotal = session.amount_total;

        if (!userId) {
            console.error("No client_reference_id in Stripe session");
            return res.status(400).send("Client reference ID is missing");
        }

        try {
            const customerRecord = await admin.firestore().collection("customers").doc(userId).get();
            const userEmail = customerRecord.data()?.email;

            if (!userEmail) {
                 console.error(`No email found for customer ${userId}`);
                 return res.status(400).send("User email not found");
            }

            const userProfileRef = admin.firestore().collection("user_profiles").doc(userEmail);
            
            await admin.firestore().runTransaction(async (transaction) => {
                const userProfileDoc = await transaction.get(userProfileRef);
                if (!userProfileDoc.exists) {
                    throw new Error(`User profile not found for ${userEmail}`);
                }
                const currentCredits = userProfileDoc.data().credits || 0;
                // Assuming 100 credits for every 1000 cents ($10.00)
                const creditsToAdd = (amountTotal / 1000) * 1000;
                const newCredits = currentCredits + creditsToAdd;
                transaction.update(userProfileRef, { credits: newCredits });
                console.log(`Successfully added ${creditsToAdd} credits to ${userEmail}. New balance: ${newCredits}`);
            });
            
        } catch (error) {
            console.error("Error updating user credits:", error);
            return res.status(500).send("Internal server error while updating credits.");
        }
    }

    res.status(200).send();
});


// Expose Express app as a single Cloud Function
exports.stripeSessionCompletedWebhook = functions.https.onRequest(app);
