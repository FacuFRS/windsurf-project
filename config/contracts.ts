export const PAYMENT_PROCESSOR_ADDRESS = '0x679cc85aFDDca3d717A290Cc2cC97caedF4B781C';

export const PAYMENT_PROCESSOR_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "payer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "paymentId",
        "type": "uint256"
      }
    ],
    "name": "PaymentProcessed",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "paymentId",
        "type": "uint256"
      }
    ],
    "name": "processPayment",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];
