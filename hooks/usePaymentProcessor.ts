import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Contract } from '@ethersproject/contracts';
import PaymentProcessorABI from '../contracts/abis/PaymentProcessor.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS;

export function usePaymentProcessor() {
  const { library, account } = useWeb3React();
  const [contract, setContract] = useState<Contract | null>(null);
  const [userDiscount, setUserDiscount] = useState<number>(0);

  useEffect(() => {
    if (!library || !account) return;

    const paymentProcessor = new Contract(
      CONTRACT_ADDRESS!,
      PaymentProcessorABI,
      library.getSigner()
    );

    setContract(paymentProcessor);

    // Cargar descuento del usuario
    loadUserDiscount();
  }, [library, account]);

  const loadUserDiscount = async () => {
    if (!contract || !account) return;
    try {
      const discount = await contract.userDiscounts(account);
      setUserDiscount(discount.toNumber());
    } catch (error) {
      console.error('Error al cargar descuento:', error);
    }
  };

  const payWithBNB = async (amount: string) => {
    if (!contract || !account) throw new Error('No hay conexión');
    
    try {
      const tx = await contract.receive({
        value: amount
      });
      return await tx.wait();
    } catch (error) {
      console.error('Error en el pago con BNB:', error);
      throw error;
    }
  };

  const payWithToken = async (tokenAddress: string, amount: string) => {
    if (!contract || !account) throw new Error('No hay conexión');

    try {
      const tx = await contract.payWithToken(tokenAddress, amount);
      return await tx.wait();
    } catch (error) {
      console.error('Error en el pago con token:', error);
      throw error;
    }
  };

  const getUserPayments = async () => {
    if (!contract || !account) throw new Error('No hay conexión');

    try {
      return await contract.getUserPayments(account);
    } catch (error) {
      console.error('Error al obtener pagos:', error);
      throw error;
    }
  };

  return {
    contract,
    userDiscount,
    payWithBNB,
    payWithToken,
    getUserPayments,
  };
}
