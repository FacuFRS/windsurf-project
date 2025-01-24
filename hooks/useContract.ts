import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { PAYMENT_PROCESSOR_ADDRESS, PAYMENT_PROCESSOR_ABI } from '../config/contracts';

declare global {
  interface Window {
    ethereum: any;
  }
}

export function useContract() {
  const [account, setAccount] = useState<string>('');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // Solicitar conexión a la wallet
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);

        // Crear provider y signer
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        // Crear instancia del contrato
        const contractInstance = new ethers.Contract(
          PAYMENT_PROCESSOR_ADDRESS,
          PAYMENT_PROCESSOR_ABI,
          signer
        );

        setContract(contractInstance);
      } else {
        setError('Por favor instala MetaMask');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const processPayment = async (paymentId: number, amount: string) => {
    try {
      if (!contract) throw new Error('Contrato no inicializado');
      
      // Convertir el monto a wei
      const amountInWei = ethers.utils.parseEther(amount);
      
      // Llamar a la función del contrato
      const tx = await contract.processPayment(paymentId, {
        value: amountInWei
      });

      // Esperar a que la transacción sea minada
      await tx.wait();

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return {
    account,
    contract,
    error,
    connectWallet,
    processPayment
  };
}
