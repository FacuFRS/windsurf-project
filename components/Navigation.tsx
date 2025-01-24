import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContract } from '../hooks/useContract';

export function Navigation() {
  const router = useRouter();
  const { account } = useContract();

  const isActive = (path: string) => router.pathname === path;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-xl font-bold text-indigo-600 cursor-pointer">
                  EduMarket
                </span>
              </Link>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <span className={`${
                  isActive('/') 
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer`}>
                  Inicio
                </span>
              </Link>

              <Link href="/transactions">
                <span className={`${
                  isActive('/transactions')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer`}>
                  Transacciones
                </span>
              </Link>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {account ? (
              <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md text-sm">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            ) : (
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                onClick={() => window.ethereum.request({ method: 'eth_requestAccounts' })}
              >
                Conectar Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
