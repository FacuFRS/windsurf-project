import { useState, useEffect } from 'react';
import { useContract } from './useContract';
import { ethers } from 'ethers';

export interface Transaction {
  payer: string;
  amount: string;
  timestamp: Date;
  paymentType: number;
  isDiscounted: boolean;
}

export function useTransactions() {
  const { contract } = useContract();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadTransactions();
  }, [contract]);

  const loadTransactions = async () => {
    if (!contract) return;

    try {
      setLoading(true);
      const payments = await contract.getAllPayments();
      
      const formattedPayments = payments.map((payment: any) => ({
        payer: payment.payer,
        amount: ethers.utils.formatEther(payment.amount),
        timestamp: new Date(payment.timestamp.toNumber() * 1000),
        paymentType: payment.paymentType,
        isDiscounted: payment.isDiscounted
      }));

      setTransactions(formattedPayments);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshTransactions = () => {
    loadTransactions();
  };

  return {
    transactions,
    loading,
    error,
    refreshTransactions
  };
}
