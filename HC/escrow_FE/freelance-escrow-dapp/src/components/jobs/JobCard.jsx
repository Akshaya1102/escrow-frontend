import { ethers } from "ethers";

export default function JobCard({ job, currentAccount, status, onClick }) {
  const totalAmount = ethers.formatEther(job.totalAmount);
  const releasedAmount = ethers.formatEther(job.releasedAmount);
  const progress = (Number(job.releasedAmount) / Number(job.totalAmount)) * 100;

  const completedMilestones = job.milestones.filter((m) => m.released).length;

  const statusConfig = {
    active: {
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
      label: "active",
      progressBar: "bg-blue-600",
    },
    completed: {
      bgColor: "bg-green-100",
      textColor: "text-green-700",
      label: "completed",
      progressBar: "bg-green-600",
    },
    disputed: {
      bgColor: "bg-red-100",
      textColor: "text-red-700",
      label: "disputed",
      progressBar: "bg-red-600",
    },
    cancelled: {
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
      label: "cancelled",
      progressBar: "bg-gray-600",
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.active;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{job.title}</h3>
          <p className="text-sm text-gray-500">
            Job #{job.jobId} • Created {new Date(Number(job.createdAt) * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${currentStatus.bgColor} ${currentStatus.textColor}`}
        >
          {currentStatus.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Client</p>
          <p className="text-sm font-mono text-gray-900">{job.client.slice(0, 10)}...{job.client.slice(-4)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Freelancer</p>
          <p className="text-sm font-mono text-gray-900">{job.freelancer.slice(0, 10)}...{job.freelancer.slice(-4)}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">
            {releasedAmount} / {totalAmount} ETH
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${currentStatus.progressBar} h-2 rounded-full transition-all`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="text-sm text-gray-600">
        {completedMilestones} of {job.milestones.length} milestones completed
      </div>
    </div>
  );
}
