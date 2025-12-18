import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const JobCard = ({ job, account, onClick }) => {
  const isClient = job.client.toLowerCase() === account.toLowerCase();
  const remainingAmount = (parseFloat(job.totalAmount) - parseFloat(job.releasedAmount)).toFixed(4);
  const completedMilestones = job.milestones.filter(m => m.released).length;
  const progressPercentage = (parseFloat(job.releasedAmount) / parseFloat(job.totalAmount)) * 100;

  return (
    <div
      onClick={onClick}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-2">{job.title}</h3>
          <p className="text-purple-200">{job.description}</p>
        </div>
        <div className="flex gap-2">
          {job.disputed && (
            <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
              <AlertTriangle size={16} /> Disputed
            </span>
          )}
          {job.cancelled && (
            <span className="bg-gray-500/20 text-gray-300 px-3 py-1 rounded-full text-sm font-semibold">
              Cancelled
            </span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-purple-300 text-sm mb-1">Role</p>
          <p className="text-white font-semibold">{isClient ? 'Client' : 'Freelancer'}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-purple-300 text-sm mb-1">Total Amount</p>
          <p className="text-white font-semibold">{job.totalAmount} ETH</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-purple-300 text-sm mb-1">Released</p>
          <p className="text-green-300 font-semibold">{job.releasedAmount} ETH</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-purple-300 text-sm mb-1">Remaining</p>
          <p className="text-yellow-300 font-semibold">{remainingAmount} ETH</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 bg-white/5 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="text-white font-semibold">
          {completedMilestones} / {job.milestones.length} milestones
        </span>
      </div>
    </div>
  );
};
