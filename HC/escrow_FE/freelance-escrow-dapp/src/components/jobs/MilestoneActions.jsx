import { useState } from "react";
import { CheckCircle, XCircle, Upload, Clock, Loader2 } from "lucide-react";
import { ethers } from "ethers";

export default function MilestoneActions({
  job,
  milestone,
  milestoneIndex,
  escrowContract,
  onActionComplete,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [workCID, setWorkCID] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  const isClient = job.client.toLowerCase() === escrowContract.account.toLowerCase();
  const isFreelancer = job.freelancer.toLowerCase() === escrowContract.account.toLowerCase();

  const handleSubmitWork = async () => {
    if (!workCID) {
      alert("Please enter an IPFS CID");
      return;
    }

    try {
      setIsLoading(true);
      await escrowContract.submitWork(job.jobId, milestoneIndex, workCID);
      alert("Work submitted successfully!");
      setWorkCID("");
      setShowSubmitForm(false);
      if (onActionComplete) onActionComplete();
    } catch (error) {
      console.error("Error submitting work:", error);
      alert(`Failed to submit work: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveMilestone = async () => {
    if (!confirm(`Approve this milestone and release ${ethers.formatEther(milestone.amount)} ETH to the freelancer?`)) {
      return;
    }

    try {
      setIsLoading(true);
      await escrowContract.approveMilestone(job.jobId, milestoneIndex);
      alert("Milestone approved successfully!");
      if (onActionComplete) onActionComplete();
    } catch (error) {
      console.error("Error approving milestone:", error);
      alert(`Failed to approve milestone: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectMilestone = async () => {
    if (!rejectReason) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      setIsLoading(true);
      await escrowContract.rejectMilestone(job.jobId, milestoneIndex, rejectReason);
      alert("Milestone rejected. Freelancer can resubmit work.");
      setRejectReason("");
      setShowRejectForm(false);
      if (onActionComplete) onActionComplete();
    } catch (error) {
      console.error("Error rejecting milestone:", error);
      alert(`Failed to reject milestone: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoApprove = async () => {
    try {
      setIsLoading(true);
      await escrowContract.autoApproveMilestone(job.jobId, milestoneIndex);
      alert("Milestone auto-approved successfully!");
      if (onActionComplete) onActionComplete();
    } catch (error) {
      console.error("Error auto-approving milestone:", error);
      alert(`Failed to auto-approve milestone: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const canAutoApprove = () => {
    if (!milestone.submitted || milestone.released) return false;
    const AUTO_APPROVE_PERIOD = 7 * 24 * 60 * 60;
    const currentTime = Math.floor(Date.now() / 1000);
    const submittedAt = Number(milestone.submittedAt);
    return currentTime >= submittedAt + AUTO_APPROVE_PERIOD;
  };

  if (milestone.released) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <CheckCircle size={16} />
        <span>Released on {new Date(Number(milestone.releasedAt) * 1000).toLocaleDateString()}</span>
      </div>
    );
  }

  if (milestone.rejected) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <XCircle size={16} />
          <span>Rejected - Can resubmit</span>
        </div>
        {isFreelancer && (
          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="text-blue-600 text-sm hover:underline"
          >
            Resubmit Work
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Freelancer Actions */}
      {isFreelancer && !milestone.submitted && (
        <div>
          {!showSubmitForm ? (
            <button
              onClick={() => setShowSubmitForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Upload size={16} />
              Submit Work
            </button>
          ) : (
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium">IPFS CID</label>
              <input
                type="text"
                value={workCID}
                onChange={(e) => setWorkCID(e.target.value)}
                placeholder="QmXx..."
                className="w-full px-3 py-2 border rounded-lg text-sm"
                disabled={isLoading}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitWork}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:bg-gray-400"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  Submit
                </button>
                <button
                  onClick={() => {
                    setShowSubmitForm(false);
                    setWorkCID("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Show submitted work */}
      {milestone.submitted && milestone.submittedWorkCID && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium mb-1">Submitted Work</div>
          <a
            href={`https://ipfs.io/ipfs/${milestone.submittedWorkCID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-all"
          >
            {milestone.submittedWorkCID}
          </a>
          <div className="text-xs text-gray-500 mt-1">
            Submitted on {new Date(Number(milestone.submittedAt) * 1000).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Client Actions */}
      {isClient && milestone.submitted && (
        <div className="flex gap-2">
          <button
            onClick={handleApproveMilestone}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:bg-gray-400"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            Approve
          </button>
          <button
            onClick={() => setShowRejectForm(!showRejectForm)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            disabled={isLoading}
          >
            <XCircle size={16} />
            Reject
          </button>
        </div>
      )}

      {/* Reject Form */}
      {showRejectForm && (
        <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium">Rejection Reason</label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Explain why you're rejecting this work..."
            className="w-full px-3 py-2 border rounded-lg text-sm h-20"
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <button
              onClick={handleRejectMilestone}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:bg-gray-400"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
              Confirm Rejection
            </button>
            <button
              onClick={() => {
                setShowRejectForm(false);
                setRejectReason("");
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Auto Approve (Freelancer only, after 7 days) */}
      {isFreelancer && canAutoApprove() && (
        <button
          onClick={handleAutoApprove}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm disabled:bg-gray-400"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
          Auto-Approve (7 days passed)
        </button>
      )}

      {/* Pending state */}
      {!milestone.submitted && !isFreelancer && (
        <div className="text-sm text-gray-500">
          Waiting for freelancer to submit work
        </div>
      )}
    </div>
  );
}
