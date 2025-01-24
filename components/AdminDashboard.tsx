import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { usePaymentProcessor } from '../hooks/usePaymentProcessor';

interface Payment {
  payer: string;
  amount: string;
  timestamp: number;
  paymentType: number;
  isDiscounted: boolean;
}

export default function AdminDashboard() {
  const { account, library } = useWeb3React();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalBNB, setTotalBNB] = useState('0');
  const [newTokenAddress, setNewTokenAddress] = useState('');
  const [newDiscount, setNewDiscount] = useState({ address: '', percent: 0 });
  const { contract } = usePaymentProcessor();

  useEffect(() => {
    loadPayments();
    loadBalance();
  }, [account, contract]);

  const loadPayments = async () => {
    if (!contract) return;
    try {
      const allPayments = await contract.getAllPayments();
      setPayments(allPayments);
    } catch (error) {
      console.error('Error al cargar pagos:', error);
    }
  };

  const loadBalance = async () => {
    if (!library || !contract) return;
    try {
      const balance = await library.getBalance(contract.address);
      setTotalBNB(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error('Error al cargar balance:', error);
    }
  };

  const handleAddToken = async () => {
    if (!contract || !newTokenAddress) return;
    try {
      const tx = await contract.addAcceptedToken(newTokenAddress);
      await tx.wait();
      setNewTokenAddress('');
    } catch (error) {
      console.error('Error al agregar token:', error);
    }
  };

  const handleSetDiscount = async () => {
    if (!contract || !newDiscount.address) return;
    try {
      const tx = await contract.setDiscount(newDiscount.address, newDiscount.percent);
      await tx.wait();
      setNewDiscount({ address: '', percent: 0 });
    } catch (error) {
      console.error('Error al establecer descuento:', error);
    }
  };

  const handleWithdrawBNB = async () => {
    if (!contract) return;
    try {
      const tx = await contract.withdrawBNB();
      await tx.wait();
      loadBalance();
    } catch (error) {
      console.error('Error al retirar BNB:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      {/* Balance y Retiros */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Balance Total</h2>
        <p className="text-2xl mb-4">{totalBNB} BNB</p>
        <button
          onClick={handleWithdrawBNB}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Retirar BNB
        </button>
      </div>

      {/* Gestión de Tokens */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Agregar Token</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newTokenAddress}
            onChange={(e) => setNewTokenAddress(e.target.value)}
            placeholder="Dirección del token"
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={handleAddToken}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Agregar
          </button>
        </div>
      </div>

      {/* Gestión de Descuentos */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Configurar Descuento</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newDiscount.address}
            onChange={(e) => setNewDiscount({ ...newDiscount, address: e.target.value })}
            placeholder="Dirección del usuario"
            className="flex-1 border rounded px-3 py-2"
          />
          <input
            type="number"
            value={newDiscount.percent}
            onChange={(e) => setNewDiscount({ ...newDiscount, percent: parseInt(e.target.value) })}
            placeholder="Porcentaje de descuento"
            className="w-32 border rounded px-3 py-2"
          />
          <button
            onClick={handleSetDiscount}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Establecer
          </button>
        </div>
      </div>

      {/* Historial de Pagos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Historial de Pagos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Pagador</th>
                <th className="px-4 py-2">Cantidad</th>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Descuento</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{payment.payer.substring(0, 8)}...</td>
                  <td className="px-4 py-2">{ethers.utils.formatEther(payment.amount)}</td>
                  <td className="px-4 py-2">{new Date(payment.timestamp * 1000).toLocaleString()}</td>
                  <td className="px-4 py-2">{payment.paymentType === 0 ? 'BNB' : 'Token'}</td>
                  <td className="px-4 py-2">{payment.isDiscounted ? 'Sí' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
