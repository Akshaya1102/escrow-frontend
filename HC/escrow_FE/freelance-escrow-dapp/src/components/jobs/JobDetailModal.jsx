import { X, AlertCircle } from "lucide-react";
import { ethers } from "ethers";
import MilestoneActions from "./MilestoneActions";
import DisputeActions from "../disputes/DisputeActions";

export default function JobDetailModal({ job, escrowContract, onClose, onJobUpdated }) {
  if (!job) return null;

  const totalAmount = ethers.formatEther(job.totalAmount);
  const releasedAmount = ethers.formatEther(job.releasedAmount);
  const isClient = job.client.toLowerCase() === escrowContract.account.toLowerCase();

  const handleCancelJob = async () => {
    if (!confirm("Are you sure you want to cancel this job? This can only be done before any work is submitted.")) {
      return;
    }

    try {
      await escrowContract.cancelJob(job.jobId);
      alert("Job cancelled successfully! Funds have been refunded.");
      if (onJobUpdated) onJobUpdated();
      onClose();
    } catch (error) {
      console.error("Error cancelling job:", error);
      alert(`Failed to cancel job: ${error.message}`);
    }
  };

  const getMilestoneStatus = (milestone) => {
    if (milestone.released) return "Released";
    if (milestone.rejected) return "Rejected";
    if (milestone.submitted) return "Submitted";
    return "Pending";
  };

  const getMilestoneStatusColor = (milestone) => {
    if (milestone.released) return "bg-green-100 text-green-800";
    if (milestone.rejected) return "bg-red-100 text-red-800";
    if (milestone.submitted) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {job.disputed && (
            <div className="p-5 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
              <div>
                <div className="font-semibold text-red-800 text-lg mb-1">Dispute Active</div>
                <div className="text-sm text-red-700">
                  This job is under dispute resolution. Check the Disputes tab for details.
                </div>
              </div>
            </div>
          )}

          {job.cancelled && (
            <div className="p-5 bg-gray-50 border-2 border-gray-200 rounded-xl">
              <div className="font-semibold text-gray-800 text-lg mb-1">Job Cancelled</div>
              <div className="text-sm text-gray-700">
                This job has been cancelled and funds have been refunded.
              </div>
            </div>
          )}

          <section>
            <h3 className="text-lg font-bold mb-3 text-gray-800">Description</h3>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-gray-700 leading-relaxed">
                {job.description || "No description provided"}
              </p>
            </div>
          </section>

          {/* Job Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 mb-1">Client Address</p>
              <p className="text-sm font-mono text-gray-900">{job.client}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Freelancer Address</p>
              <p className="text-sm font-mono text-gray-900">{job.freelancer}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Amount</p>
              <p className="text-sm font-bold text-gray-900">{totalAmount} ETH</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Released</p>
              <p className="text-sm font-bold text-green-600">{releasedAmount} ETH</p>
            </div>
          </div>

          {/* Milestones */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Milestones</h3>
            <div className="space-y-4">
              {job.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">Milestone {index + 1}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getMilestoneStatusColor(milestone)}`}>
                            {getMilestoneStatus(milestone)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{milestone.workDescription}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 ml-4">{ethers.formatEther(milestone.amount)} ETH</span>
                  </div>

                  {!job.cancelled && !job.disputed && (
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                      <MilestoneActions
                        job={job}
                        milestone={milestone}
                        milestoneIndex={index}
                        escrowContract={escrowContract}
                        onActionComplete={onJobUpdated}
                      />

                      {milestone.submitted && !milestone.released && (
                        <DisputeActions
                          job={job}
                          milestone={milestone}
                          milestoneIndex={index}
                          escrowContract={escrowContract}
                          onActionComplete={onJobUpdated}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isClient && !job.cancelled && !job.disputed && (
            <div className="pt-4 border-t">
              <button
                onClick={handleCancelJob}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Cancel Job
              </button>
              <p className="text-xs text-gray-500 mt-2">
                You can only cancel the job before any work has been submitted
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
