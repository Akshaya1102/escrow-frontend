import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Loader2, Scale } from "lucide-react";
import { ethers } from "ethers";

export default function DisputeManagement({ escrowContract }) {
  const [disputes, setDisputes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resolvingDispute, setResolvingDispute] = useState(null);
  const [clientRefund, setClientRefund] = useState(50);
  const [freelancerPayment, setFreelancerPayment] = useState(50);

  const fetchDisputes = async () => {
    if (!escrowContract.isConnected) return;

    try {
      setIsLoading(true);

      // Get user's jobs (for client/freelancer)
      const userJobs = await escrowContract.getUserJobs(escrowContract.account);
      const userDisputedJobs = userJobs.filter((job) => job.disputed);

      // Also fetch all disputed jobs (for arbiter view)
      const allDisputedJobs = await escrowContract.getAllDisputedJobs();

      // If user has no jobs at all (not a client/freelancer in any job),
      // they are likely an arbiter - show all disputes
      // Otherwise, show only their disputed jobs
      let disputedJobs;
      if (userJobs.length === 0 && allDisputedJobs.length > 0) {
        // User is likely an arbiter - show all disputes
        disputedJobs = allDisputedJobs;
      } else {
        // User is client/freelancer - show only their disputes
        disputedJobs = userDisputedJobs;
      }

      const disputesData = await Promise.all(
        disputedJobs.map(async (job) => {
          const dispute = await escrowContract.getDispute(job.jobId);
          return { job, dispute };
        })
      );

      setDisputes(disputesData);
    } catch (error) {
      console.error("Error fetching disputes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [escrowContract.isConnected, escrowContract.account]);

  const handleResolveDispute = async (jobId) => {
    if (clientRefund + freelancerPayment > 100) {
      alert("Total percentages cannot exceed 100%");
      return;
    }

    if (!confirm(`Resolve this dispute?\nClient: ${clientRefund}%\nFreelancer: ${freelancerPayment}%\nPlatform: ${100 - clientRefund - freelancerPayment}%`)) {
      return;
    }

    try {
      await escrowContract.resolveDispute(jobId, clientRefund, freelancerPayment);
      alert("Dispute resolved successfully!");
      setResolvingDispute(null);
      fetchDisputes();
    } catch (error) {
      console.error("Error resolving dispute:", error);
      alert(`Failed to resolve dispute: ${error.message}`);
    }
  };

  if (!escrowContract.isConnected) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please connect your wallet to view disputes</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (disputes.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <Shield /> Dispute Resolution
        </h2>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Shield className="mx-auto mb-3 text-gray-400" size={48} />
          <p className="text-gray-500">No active disputes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
          <Shield className="text-blue-600" size={28} />
          Dispute Resolution
        </h2>
        <p className="text-sm text-gray-500 mt-2">Manage and resolve disputes</p>
      </div>

      {disputes.map(({ job, dispute }) => (
        <div
          key={job.jobId}
          className="bg-white p-6 rounded-xl border-2 border-red-200 shadow-md"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-xl flex-shrink-0">
                <AlertTriangle className="text-red-600" size={28} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-1">{job.title}</h3>
                <p className="text-sm text-gray-500">Job #{job.jobId}</p>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 lg:min-w-[200px]">
              <div className="text-xs font-semibold text-orange-700 mb-1 uppercase">Disputed Milestone</div>
              <div className="font-bold text-lg text-orange-900">
                Milestone #{Number(dispute.milestoneId) + 1}
              </div>
              <div className="text-sm font-semibold text-gray-700 mt-1">
                {ethers.formatEther(job.milestones[Number(dispute.milestoneId)].amount)} ETH
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="text-sm font-bold text-gray-700 mb-2">Dispute Reason</div>
              <p className="text-sm text-gray-800 leading-relaxed">{dispute.reason}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-xs font-semibold text-blue-700 mb-2 uppercase">Initiated By</div>
                <div className="text-sm font-mono text-gray-800 break-all">
                  {dispute.initiator}
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="text-xs font-semibold text-purple-700 mb-2 uppercase">Raised On</div>
                <div className="text-sm font-semibold text-gray-800">
                  {new Date(Number(dispute.raisedAt) * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {dispute.resolved ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                <Scale size={18} />
                <span>Dispute Resolved</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Client Refund:</span>{" "}
                  <span className="font-semibold">
                    {ethers.formatEther(dispute.clientRefundAmount)} ETH
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Freelancer Payment:</span>{" "}
                  <span className="font-semibold">
                    {ethers.formatEther(dispute.freelancerPaymentAmount)} ETH
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Resolved on {new Date(Number(dispute.resolvedAt) * 1000).toLocaleDateString()} by{" "}
                {dispute.resolver.slice(0, 10)}...
              </div>
            </div>
          ) : (
            <>
              {resolvingDispute === job.jobId ? (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-4">
                  <div className="flex items-center gap-2 text-purple-800 font-medium">
                    <Scale size={18} />
                    <span>Resolve Dispute</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Client Refund: {clientRefund}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={clientRefund}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setClientRefund(val);
                          setFreelancerPayment(Math.min(100 - val, 100));
                        }}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Freelancer Payment: {freelancerPayment}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={freelancerPayment}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setFreelancerPayment(val);
                          setClientRefund(Math.min(100 - val, 100));
                        }}
                        className="w-full"
                      />
                    </div>

                    <div className="p-3 bg-white rounded border">
                      <div className="text-sm font-medium mb-2">Distribution</div>
                      <div className="space-y-1 text-sm">
                        <div>Client: {clientRefund}%</div>
                        <div>Freelancer: {freelancerPayment}%</div>
                        <div>Platform Fee: {100 - clientRefund - freelancerPayment}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolveDispute(job.jobId)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                    >
                      <Scale size={16} />
                      Confirm Resolution
                    </button>
                    <button
                      onClick={() => setResolvingDispute(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setResolvingDispute(job.jobId)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  <Scale size={16} />
                  Resolve Dispute (Arbiter Only)
                </button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
