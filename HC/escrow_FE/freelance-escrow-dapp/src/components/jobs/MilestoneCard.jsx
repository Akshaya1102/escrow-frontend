import { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Upload,
} from "lucide-react";

export default function MilestoneCard({ milestone, index }) {
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitCID, setSubmitCID] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const getStatusIcon = () => {
    switch (milestone.status) {
      case "released":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "submitted":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    const styles = {
      released: "bg-green-100 text-green-700",
      submitted: "bg-yellow-100 text-yellow-700",
      pending: "bg-gray-100 text-gray-700",
    };
    return styles[milestone.status] || styles.pending;
  };

  const handleSubmitWork = () => {
    if (!submitCID.trim()) {
      alert("Please enter a valid IPFS CID");
      return;
    }
    alert(
      `Milestone ${index + 1} submitted!\n\nIPFS CID:\n${submitCID}`
    );
    setSubmitCID("");
    setShowSubmit(false);
  };

  const handleApprove = () => {
    alert(
      `Milestone ${index + 1} approved!\n\n${milestone.amount} ETH released`
    );
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert("Please provide rejection reason");
      return;
    }
    alert(
      `Milestone ${index + 1} rejected.\n\nReason:\n${rejectReason}`
    );
    setRejectReason("");
    setShowReject(false);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3 flex-1">
          {getStatusIcon()}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900">
                Milestone {index + 1}
              </h4>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge()}`}
              >
                {milestone.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {milestone.description}
            </p>
          </div>
        </div>
        <span className="font-bold text-gray-900">
          {milestone.amount} ETH
        </span>
      </div>

      {/* Submitted Work */}
      {milestone.status === "submitted" && milestone.cid && (
        <div className="mb-3 p-3 bg-white rounded border">
          <p className="text-xs font-medium text-gray-700 mb-1">
            Submitted Work (IPFS)
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-mono truncate flex-1">
              {milestone.cid}
            </p>
            <button
              onClick={() =>
                window.open(
                  `https://ipfs.io/ipfs/${milestone.cid}`,
                  "_blank"
                )
              }
              className="text-xs text-blue-600 font-medium"
            >
              View →
            </button>
          </div>
        </div>
      )}

      {/* Released */}
      {milestone.status === "released" && milestone.submittedAt && (
        <div className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded border">
          ✓ Released on {milestone.submittedAt}
        </div>
      )}

      {/* Pending Actions */}
      {milestone.status === "pending" && (
        <div className="mt-3">
          {!showSubmit ? (
            <button
              onClick={() => setShowSubmit(true)}
              className="w-full py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              Submit Work
            </button>
          ) : (
            <div className="space-y-2 bg-white p-3 rounded border">
              <input
                type="text"
                value={submitCID}
                onChange={(e) => setSubmitCID(e.target.value)}
                placeholder="IPFS CID"
                className="w-full px-3 py-2 border rounded font-mono text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitWork}
                  className="flex-1 bg-blue-600 text-white py-2 rounded"
                >
                  Confirm
                </button>
                <button
                  onClick={() => {
                    setShowSubmit(false);
                    setSubmitCID("");
                  }}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submitted Actions */}
      {milestone.status === "submitted" && (
        <div className="mt-3 space-y-2">
          {!showReject ? (
            <div className="flex gap-2">
              <button
                onClick={handleApprove}
                className="flex-1 bg-green-600 text-white py-2 rounded flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                Approve & Pay
              </button>
              <button
                onClick={() => setShowReject(true)}
                className="flex-1 bg-red-600 text-white py-2 rounded"
              >
                Reject
              </button>
            </div>
          ) : (
            <div className="space-y-2 bg-white p-3 rounded border border-red-200">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Rejection reason"
                className="w-full px-3 py-2 border rounded text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  className="flex-1 bg-red-600 text-white py-2 rounded"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setShowReject(false);
                    setRejectReason("");
                  }}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded border">
            💡 Auto-approve after 7 days if no client response
          </div>
        </div>
      )}
    </div>
  );
}
