'use client';

//import { useAuth } from '@/components/providers/auth-provider';
import { useAuth } from "@/context/AuthContext";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { FC, useEffect, useState } from 'react';
import Payment from '@/components/Payment';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

const PurchasePage: FC = () => {
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    if (user) {
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid, amount: 1000 }), // Amount in cents
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret));
    }
  }, [user]);

  if (!user) {
    return <p>Please log in to purchase credits.</p>;
  }

  return (
    <div>
      <h1>Purchase Credits</h1>
      {clientSecret && (
        <Elements options={{ clientSecret }} stripe={stripePromise}>
          <Payment />
        </Elements>
      )}
    </div>
  );
};

export default PurchasePage;
