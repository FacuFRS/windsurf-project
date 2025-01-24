import { NextPage } from 'next';
import Head from 'next/head';
import { TransactionHistory } from '../components/TransactionHistory';
import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { usePaymentProcessor } from '../hooks/usePaymentProcessor';

interface Transaction {
  payer: string;
  amount: string;
  timestamp: number;
  paymentType: number;
  isDiscounted: boolean;
}

const TransactionsPage: NextPage = () => {
  const { account } = useWeb3React();
  const { getUserPayments, userDiscount } = usePaymentProcessor();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [account]);

  const loadTransactions = async () => {
    if (!account) return;
    
    try {
      setLoading(true);
      const payments = await getUserPayments();
      setTransactions(payments);
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentTypeString = (type: number) => {
    return type === 0 ? 'BNB' : 'Token';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Historial de Transacciones - EduMarket</title>
        <meta name="description" content="Historial de transacciones en EduMarket" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Historial de Transacciones
        </h1>

        <div className="bg-white shadow rounded-lg">
          {userDiscount > 0 && (
            <div className="bg-green-100 text-green-800 px-6 py-4 rounded-lg mb-6">
              Tienes un descuento activo del {userDiscount}% en tus compras
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4">Cargando transacciones...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No hay transacciones para mostrar</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descuento Aplicado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ver en BSCScan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(tx.timestamp * 1000).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentTypeString(tx.paymentType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ethers.utils.formatEther(tx.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tx.isDiscounted ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Sí
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={`https://bscscan.com/tx/${tx.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver transacción
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TransactionsPage;
