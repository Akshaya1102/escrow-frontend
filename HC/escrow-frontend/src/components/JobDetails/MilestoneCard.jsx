// ============================================
// FILE: src/components/JobDetails/MilestoneCard.jsx
// ============================================
import React, { useState } from 'react';
import { CheckCircle, Clock, XCircle, FileText } from 'lucide-react';

export const MilestoneCard = ({ 
  milestone, 
  index, 
  job, 
  account, 
  onSubmitWork, 
  onApproveMilestone, 
  onRejectMilestone,
  loading 
}) => {
  const [workSubmission, setWorkSubmission] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  
  const isClient = job.client.toLowerCase() === account.toLowerCase();
  const isFreelancer = job.freelancer.toLowerCase() === account.toLowerCase();

  const handleSubmit = () => {
    if (!workSubmission.trim()) {
      alert('Please enter work description');
      return;
    }
    onSubmitWork(job.id, index, workSubmission);
    setWorkSubmission('');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Please enter rejection reason');
      return;
    }
    onRejectMilestone(job.id, index, rejectReason);
    setRejectReason('');
    setShowRejectForm(false);
  };

  // Check if previous milestone is completed (for sequential workflow)
  const canSubmit = index === 0 || job.milestones[index - 1].released;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h4 className="text-xl font-bold text-white">Milestone {index + 1}</h4>
            
            {/* Status Badges */}
            {milestone.released && (
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <CheckCircle size={16} /> Released
              </span>
            )}
            {milestone.submitted && !milestone.released && !milestone.rejected && (
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <Clock size={16} /> Pending Review
              </span>
            )}
            {milestone.rejected && (
              <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <XCircle size={16} /> Rejected
              </span>
            )}
            {!milestone.submitted && !milestone.released && !milestone.rejected && (
              <span className="bg-gray-500/20 text-gray-300 px-3 py-1 rounded-full text-sm font-semibold">
                Not Started
              </span>
            )}
          </div>
          
          {/* Milestone Description */}
          <p className="text-purple-200 mb-3">{milestone.workDescription}</p>
          
          {/* Amount */}
          <p className="text-white font-semibold text-lg flex items-center gap-2">
            <span className="text-purple-300">Amount:</span> {milestone.amount} ETH
          </p>
        </div>
      </div>

      {/* Submitted Work Display */}
      {milestone.submittedWork && (
        <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
          <p className="text-purple-300 text-sm mb-2 flex items-center gap-2 font-semibold">
            <FileText size={16} /> Submitted Work
          </p>
          <p className="text-white whitespace-pre-wrap">{milestone.submittedWork}</p>
          {milestone.submittedAt > 0 && (
            <p className="text-purple-300 text-sm mt-3">
              Submitted: {new Date(milestone.submittedAt * 1000).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Freelancer Actions - Submit Work */}
      {isFreelancer && 
       !milestone.released && 
       !milestone.submitted && 
       !job.disputed && 
       !job.cancelled && (
        <div className="space-y-3">
          {!canSubmit && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-300 text-sm mb-3">
              ⚠️ Complete the previous milestone first
            </div>
          )}
          
          <textarea
            placeholder="Describe your completed work in detail..."
            value={workSubmission}
            onChange={(e) => setWorkSubmission(e.target.value)}
            disabled={!canSubmit || loading}
            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
            rows="4"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !workSubmission.trim() || !canSubmit}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
          >
            {loading ? 'Submitting...' : 'Submit Work'}
          </button>
        </div>
      )}

      {/* Freelancer Info - Waiting for approval */}
      {isFreelancer && 
       milestone.submitted && 
       !milestone.released && 
       !job.disputed && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-blue-300 text-sm">
          ⏳ Waiting for client approval...
        </div>
      )}

      {/* Client Actions - Approve or Reject */}
      {isClient && 
       milestone.submitted && 
       !milestone.released && 
       !job.disputed && (
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Approve Button */}
            <button
              onClick={() => onApproveMilestone(job.id, index)}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              {loading ? 'Processing...' : 'Approve & Release Funds'}
            </button>
            
            {/* Reject Button */}
            <button
              onClick={() => setShowRejectForm(!showRejectForm)}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <XCircle size={20} />
              Reject Work
            </button>
          </div>

          {/* Reject Form */}
          {showRejectForm && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-3">
              <label className="text-red-300 text-sm font-semibold">
                Reason for Rejection:
              </label>
              <textarea
                placeholder="Explain what needs to be improved or corrected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-white/10 border border-red-400/50 rounded-lg p-3 text-white placeholder-red-300/50 focus:outline-none focus:border-red-400"
                rows="3"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={loading || !rejectReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
                <button
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectReason('');
                  }}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg font-semibold text-red-300 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Released Milestone Info */}
      {milestone.released && milestone.releasedAt > 0 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-300 text-sm flex items-center gap-2">
          <CheckCircle size={18} />
          <span>
            Released on {new Date(milestone.releasedAt * 1000).toLocaleString()}
          </span>
        </div>
      )}

      {/* Rejected Info */}
      {milestone.rejected && !milestone.submitted && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 text-sm">
          <p className="font-semibold mb-1">❌ This work was rejected</p>
          <p className="text-sm">Please revise and resubmit your work addressing the client's feedback.</p>
        </div>
      )}

      {/* Disputed Job Warning */}
      {job.disputed && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-orange-300 text-sm flex items-center gap-2">
          <XCircle size={18} />
          <span>This job is under dispute. All actions are frozen.</span>
        </div>
      )}

      {/* Cancelled Job Warning */}
      {job.cancelled && (
        <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4 text-gray-300 text-sm">
          This job has been cancelled.
        </div>
      )}
    </div>
  );
};