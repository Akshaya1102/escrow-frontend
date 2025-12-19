import { useState } from "react";
import { AlertTriangle, Loader2, Scale } from "lucide-react";

export default function DisputeActions({
  job,
  milestone,
  milestoneIndex,
  escrowContract,
  onActionComplete,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showRaiseForm, setShowRaiseForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  const isClient = job.client.toLowerCase() === escrowContract.account.toLowerCase();
  const isFreelancer = job.freelancer.toLowerCase() === escrowContract.account.toLowerCase();

  const handleRaiseDispute = async () => {
    if (!disputeReason || disputeReason.length < 10) {
      alert("Please provide a detailed reason for the dispute (minimum 10 characters)");
      return;
    }

    if (!confirm(`Raise a dispute for this milestone? This will cost 0.01 ETH dispute fee.`)) {
      return;
    }

    try {
      setIsLoading(true);
      await escrowContract.raiseDispute(job.jobId, milestoneIndex, disputeReason);
      alert("Dispute raised successfully! The platform arbiter will review it.");
      setDisputeReason("");
      setShowRaiseForm(false);
      if (onActionComplete) onActionComplete();
    } catch (error) {
      console.error("Error raising dispute:", error);
      alert(`Failed to raise dispute: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (job.disputed) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
          <AlertTriangle size={18} />
          <span>Dispute Active</span>
        </div>
        <p className="text-sm text-red-700">
          This job is currently under dispute resolution by the platform arbiter.
        </p>
      </div>
    );
  }

  if (!milestone.submitted || milestone.released) {
    return null;
  }

  if (!(isClient || isFreelancer)) {
    return null;
  }

  return (
    <div className="space-y-3">
      {!showRaiseForm ? (
        <button
          onClick={() => setShowRaiseForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
        >
          <AlertTriangle size={16} />
          Raise Dispute
        </button>
      ) : (
        <div className="space-y-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 text-orange-800 font-medium">
            <AlertTriangle size={18} />
            <span>Raise Dispute</span>
          </div>

          <div className="text-sm text-orange-700 mb-2">
            <p className="mb-1">Dispute fee: 0.01 ETH</p>
            <p className="text-xs">
              The platform arbiter will review both sides and make a decision on fund distribution.
            </p>
          </div>

          <label className="block text-sm font-medium">
            Reason for Dispute
            <span className="text-red-500">*</span>
          </label>
          <textarea
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            placeholder="Provide detailed information about why you're raising this dispute..."
            className="w-full px-3 py-2 border rounded-lg text-sm h-32"
            disabled={isLoading}
          />

          <div className="text-xs text-gray-600">
            Minimum 10 characters. Be specific and provide evidence if possible.
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRaiseDispute}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm disabled:bg-gray-400"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <AlertTriangle size={16} />
              )}
              Submit Dispute (0.01 ETH)
            </button>
            <button
              onClick={() => {
                setShowRaiseForm(false);
                setDisputeReason("");
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
  );
}
