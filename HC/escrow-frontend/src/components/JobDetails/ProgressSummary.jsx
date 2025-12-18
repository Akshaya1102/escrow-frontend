// FILE: src/components/JobDetails/ProgressSummary.jsx
// ============================================
import React from 'react';
import { DollarSign, CheckCircle, Clock } from 'lucide-react';

export const ProgressSummary = ({ job }) => {
  const remainingAmount = (parseFloat(job.totalAmount) - parseFloat(job.releasedAmount)).toFixed(4);
  const progressPercentage = (parseFloat(job.releasedAmount) / parseFloat(job.totalAmount)) * 100;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-400/30">
          <p className="text-blue-300 text-sm mb-1">Total Amount</p>
          <p className="text-white text-2xl font-bold flex items-center gap-2">
            <DollarSign size={24} />
            {job.totalAmount} ETH
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-400/30">
          <p className="text-green-300 text-sm mb-1">Released</p>
          <p className="text-white text-2xl font-bold flex items-center gap-2">
            <CheckCircle size={24} />
            {job.releasedAmount} ETH
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-400/30">
          <p className="text-yellow-300 text-sm mb-1">Remaining</p>
          <p className="text-white text-2xl font-bold flex items-center gap-2">
            <Clock size={24} />
            {remainingAmount} ETH
          </p>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-4">
        <div className="flex justify-between text-sm text-purple-300 mb-2">
          <span>Progress</span>
          <span>{progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="bg-white/10 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-3 rounded-full transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

