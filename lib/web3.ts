import { InjectedConnector } from '@web3-react/injected-connector';
import { Web3Provider } from '@ethersproject/providers';

// Configuración de BSC
export const BSC_NETWORK = {
  chainId: '0x38', // 56 en hexadecimal
  chainName: 'Binance Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/'],
};

// Configurar solo BSC como red soportada
export const injected = new InjectedConnector({
  supportedChainIds: [56], // Solo BSC
});

// Función para obtener la biblioteca Web3
export const getLibrary = (provider: any): Web3Provider => {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
};

// Función para cambiar a la red BSC
export const switchToBSC = async () => {
  if (!window.ethereum) return false;
  
  try {
    // Intentar cambiar a BSC
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BSC_NETWORK.chainId }],
    });
    return true;
  } catch (switchError: any) {
    // Si la red no está agregada, intentar agregarla
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [BSC_NETWORK],
        });
        return true;
      } catch (addError) {
        console.error('Error al agregar BSC:', addError);
        return false;
      }
    }
    console.error('Error al cambiar a BSC:', switchError);
    return false;
  }
};

// Función para activar MetaMask
export const activateMetaMask = async (activate: any) => {
  try {
    await activate(injected);
    const success = await switchToBSC();
    return success;
  } catch (error) {
    console.error('Error al conectar con MetaMask:', error);
    return false;
  }
};

// Función para verificar si MetaMask está instalado
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && !!window.ethereum;
};
