import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import JobCard from "./JobCard";
import JobDetailModal from "./JobDetailModal";

export default function MyJobs({ escrowContract }) {
  const [filter, setFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    if (!escrowContract.isConnected) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const userJobs = await escrowContract.getUserJobs(escrowContract.account);
      setJobs(userJobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [escrowContract.isConnected, escrowContract.account]);

  const getJobStatus = (job) => {
    if (job.cancelled) return "cancelled";
    if (job.disputed) return "disputed";

    const allReleased = job.milestones.every((m) => m.released);
    if (allReleased) return "completed";

    return "active";
  };

  const filteredJobs =
    filter === "all"
      ? jobs
      : jobs.filter((j) => getJobStatus(j) === filter);

  const handleJobAction = () => {
    fetchJobs();
    if (selectedJob) {
      setSelectedJob(null);
    }
  };

  if (!escrowContract.isConnected) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-500">Please connect your wallet to view your jobs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex space-x-4">
        {['all', 'active', 'completed', 'disputed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Jobs List */}
      {isLoading && !jobs.length ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
          <p className="text-gray-500 font-medium">Loading your jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-lg font-medium text-gray-500">No {filter} jobs found</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.jobId}
              job={job}
              currentAccount={escrowContract.account}
              status={getJobStatus(job)}
              onClick={() => setSelectedJob(job)}
            />
          ))}
        </div>
      )}

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          escrowContract={escrowContract}
          onClose={() => setSelectedJob(null)}
          onJobUpdated={handleJobAction}
        />
      )}
    </div>
  );
}
