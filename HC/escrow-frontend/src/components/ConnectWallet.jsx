import React from 'react';
import { Briefcase } from 'lucide-react';

export const ConnectWallet = ({ onConnect, loading }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
        <Briefcase size={64} className="mx-auto mb-4 text-blue-300" />
        <h1 className="text-3xl font-bold text-white mb-4">Freelance Escrow dApp</h1>
        <p className="text-purple-200 mb-6">Connect your wallet to get started</p>
        <button
          onClick={onConnect}
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      </div>
    </div>
  );
};

