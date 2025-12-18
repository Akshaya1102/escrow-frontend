import React from 'react';
import { User, Clock, AlertTriangle } from 'lucide-react';

export const JobHeader = ({ job, account, onRaiseDispute, onBack, loading }) => {
  const isClient = job.client.toLowerCase() === account.toLowerCase();

  return (
    <>
      <button
        onClick={onBack}
        className="text-purple-300 hover:text-white transition-colors mb-4"
      >
        ← Back to Jobs
      </button>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{job.title}</h2>
            <p className="text-purple-200 mb-4">{job.description}</p>
            <div className="flex gap-4 text-sm">
              <span className="text-purple-300">
                <User size={16} className="inline mr-1" />
                Your Role: <span className="text-white font-semibold">
                  {isClient ? 'Client' : 'Freelancer'}
                </span>
              </span>
              <span className="text-purple-300">
                <Clock size={16} className="inline mr-1" />
                Created: {new Date(job.createdAt * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {job.disputed && (
              <span className="bg-red-500/20 text-red-300 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                <AlertTriangle size={20} /> Disputed
              </span>
            )}
            {!job.disputed && !job.cancelled && (
              <button
                onClick={onRaiseDispute}
                disabled={loading}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                Raise Dispute
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
