import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { useState } from 'react';
import { activateMetaMask, isMetaMaskInstalled } from '../lib/web3';
import { usePaymentProcessor } from '../hooks/usePaymentProcessor';

interface CryptoPaymentButtonProps {
  amount: number; // Precio en USD
  onSuccess: () => void;
  onError: (error: string) => void;
}

// Lista de tokens BEP20 soportados
const SUPPORTED_TOKENS = {
  BUSD: {
    address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    symbol: 'BUSD',
    decimals: 18,
    logo: '/busd-logo.png'
  },
  USDT: {
    address: '0x55d398326f99059fF775485246999027B3197955',
    symbol: 'USDT',
    decimals: 18,
    logo: '/usdt-logo.png'
  }
};

export default function CryptoPaymentButton({ amount, onSuccess, onError }: CryptoPaymentButtonProps) {
  const { activate, account, library } = useWeb3React();
  const { userDiscount, payWithBNB, payWithToken } = usePaymentProcessor();
  const [loading, setLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string>('BNB');

  // Calcular precio con descuento
  const discountedAmount = userDiscount > 0 ? amount * (100 - userDiscount) / 100 : amount;

  // Función para convertir USD a BNB (simplificada, deberías usar un oracle para precios reales)
  const convertUSDtoBNB = async (usdAmount: number) => {
    // TODO: Integrar con un oracle de precios como Chainlink
    const bnbPrice = 300; // USD por BNB
    const bnbAmount = usdAmount / bnbPrice;
    return ethers.utils.parseEther(bnbAmount.toFixed(18));
  };

  const handlePayment = async () => {
    if (!isMetaMaskInstalled()) {
      onError('Por favor instala MetaMask para realizar pagos en crypto');
      return;
    }

    try {
      setLoading(true);

      // Conectar MetaMask si no está conectado
      if (!account) {
        const success = await activateMetaMask(activate);
        if (!success) {
          throw new Error('Error al conectar con MetaMask o cambiar a BSC');
        }
      }

      let receipt;
      
      if (selectedToken === 'BNB') {
        // Pago con BNB
        const priceInBNB = await convertUSDtoBNB(discountedAmount);
        receipt = await payWithBNB(priceInBNB);
      } else {
        // Pago con token BEP20
        const token = SUPPORTED_TOKENS[selectedToken];
        const priceInToken = ethers.utils.parseUnits(
          discountedAmount.toString(),
          token.decimals
        );
        receipt = await payWithToken(token.address, priceInToken);
      }

      // Verificar la transacción en BSCScan
      const bscScanUrl = `https://bscscan.com/tx/${receipt.transactionHash}`;
      console.log('Transacción confirmada:', bscScanUrl);

      onSuccess();
    } catch (error) {
      console.error('Error en el pago:', error);
      onError(error.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {userDiscount > 0 && (
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
          ¡Tienes un {userDiscount}% de descuento! 
          Precio final: ${discountedAmount.toFixed(2)}
        </div>
      )}

      <div className="flex space-x-2">
        <select
          value={selectedToken}
          onChange={(e) => setSelectedToken(e.target.value)}
          className="border rounded-lg px-4 py-2"
          disabled={loading}
        >
          <option value="BNB">BNB</option>
          {Object.entries(SUPPORTED_TOKENS).map(([symbol, token]) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
        </select>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="flex-1 bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-gray-400 flex items-center justify-center space-x-2"
        >
          {selectedToken === 'BNB' ? (
            <img src="/bnb-logo.png" alt="BNB" className="w-5 h-5" />
          ) : (
            <img 
              src={SUPPORTED_TOKENS[selectedToken]?.logo} 
              alt={selectedToken} 
              className="w-5 h-5" 
            />
          )}
          <span>
            {loading ? 'Procesando...' : `Pagar con ${selectedToken}`}
          </span>
        </button>
      </div>
    </div>
  );
}
