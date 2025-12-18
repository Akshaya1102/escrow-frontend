import React from 'react';

export const Header = ({ account, currentView, onViewChange }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Freelance Escrow</h1>
          <p className="text-purple-200 text-sm">
            Account: {account.substring(0, 6)}...{account.substring(38)}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onViewChange('jobs')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              currentView === 'jobs' 
                ? 'bg-white/20 text-white' 
                : 'bg-white/5 text-purple-200 hover:bg-white/10'
            }`}
          >
            My Jobs
          </button>
          <button
            onClick={() => onViewChange('create')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              currentView === 'create' 
                ? 'bg-white/20 text-white' 
                : 'bg-white/5 text-purple-200 hover:bg-white/10'
            }`}
          >
            Create Job
          </button>
        </div>
      </div>
    </div>
  );
};
