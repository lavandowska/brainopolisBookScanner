'use client';

import { useAuth } from "@/context/AuthContext";
import { FC, useEffect, useState } from 'react';
import Payment from '@/components/Payment';

const PurchasePage: FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
    }
  }, [user]);

  if (!user) {
    return <p>Please log in to purchase credits.</p>;
  }

  return (
    <div>
      <h1>Purchase Credits</h1>
    </div>
  );
};

export default PurchasePage;
