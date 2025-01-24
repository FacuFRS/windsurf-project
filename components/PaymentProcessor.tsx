import React, { useState } from 'react';
import { useContract } from '../hooks/useContract';

export function PaymentProcessor() {
  const { account, error, processPayment } = useContract();
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setSuccess(false);

    try {
      // Generar un ID de pago único (en producción, esto vendría del backend)
      const paymentId = Math.floor(Math.random() * 1000000);
      
      const result = await processPayment(paymentId, amount);
      if (result) {
        setSuccess(true);
        setAmount('');
      }
    } catch (err) {
      console.error('Error al procesar el pago:', err);
    }

    setProcessing(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Procesar Pago</h2>
      
      {!account && (
        <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded">
          Por favor, conecta tu wallet para continuar
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          ¡Pago procesado con éxito!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Monto (BNB)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="0.1"
          />
        </div>

        <button
          type="submit"
          disabled={!account || processing}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            !account || processing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {processing ? 'Procesando...' : 'Pagar'}
        </button>
      </form>

      {account && (
        <div className="mt-4 text-sm text-gray-600">
          Conectado como: {account.slice(0, 6)}...{account.slice(-4)}
        </div>
      )}
    </div>
  );
}
