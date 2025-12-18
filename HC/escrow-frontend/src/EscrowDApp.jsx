import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Briefcase, Clock, CheckCircle, XCircle, AlertTriangle, DollarSign, User, FileText } from 'lucide-react';

// Contract configuration - UPDATE THESE AFTER DEPLOYMENT
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Anvil default deployment address
const CONTRACT_ABI = [
  "function createJob(address freelancer, uint256[] calldata milestoneAmounts, string[] calldata milestoneDescriptions, string calldata title, string calldata description) external payable returns(uint256)",
  "function submitWork(uint256 jobId, uint256 milestoneId, string calldata work) external",
  "function approveMilestone(uint256 jobId, uint256 milestoneId) external",
  "function rejectMilestone(uint256 jobId, uint256 milestoneId, string calldata reason) external",
  "function raiseDispute(uint256 jobId) external",
  "function cancelJob(uint256 jobId) external",
  "function getJob(uint256 jobId) external view returns (address client, address freelancer, uint256 totalAmount, uint256 releasedAmount, bool disputed, bool cancelled, string memory title, string memory description, uint256 createdAt, uint256 milestoneCount)",
  "function getMilestones(uint256 jobId) external view returns(tuple(uint256 amount, bool submitted, bool released, bool rejected, string workDescription, string submittedWork, uint256 submittedAt, uint256 releasedAt)[] memory)",
  "function getJobsByParty(address party) external view returns(uint256[] memory)",
  "event JobCreated(uint256 indexed jobId, address indexed client, address indexed freelancer, uint256 totalAmount)",
  "event WorkSubmitted(uint256 indexed jobId, uint256 milestoneId, string work)",
  "event MilestoneApproved(uint256 indexed jobId, uint256 milestoneId, uint256 amount)",
  "event MilestoneRejected(uint256 indexed jobId, uint256 milestoneId, string reason)",
  "event DisputeRaised(uint256 indexed jobId, address raisedBy)"
];

export default function EscrowDApp() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('jobs');

  // Form states
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    freelancer: '',
    milestones: [{ description: '', amount: '' }]
  });
  const [submitWork, setSubmitWork] = useState({ milestoneId: 0, work: '' });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    if (contract && account) {
      loadJobs();
      setupEventListeners();
    }
  }, [contract, account]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        setProvider(provider);
        setSigner(signer);
        setContract(contract);
        setAccount(address);
      } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Failed to connect wallet');
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const setupEventListeners = () => {
    if (!contract) return;

    contract.on('JobCreated', (jobId) => {
      console.log('New job created:', jobId.toString());
      loadJobs();
    });

    contract.on('WorkSubmitted', (jobId, milestoneId) => {
      console.log('Work submitted:', jobId.toString(), milestoneId.toString());
      if (selectedJob && selectedJob.id === jobId.toString()) {
        loadJobDetails(jobId.toString());
      }
    });

    contract.on('MilestoneApproved', (jobId, milestoneId) => {
      console.log('Milestone approved:', jobId.toString(), milestoneId.toString());
      if (selectedJob && selectedJob.id === jobId.toString()) {
        loadJobDetails(jobId.toString());
      }
    });

    return () => {
      contract.removeAllListeners();
    };
  };

  const loadJobs = async () => {
    if (!contract || !account) return;
    
    setLoading(true);
    try {
      const jobIds = await contract.getJobsByParty(account);
      const jobsData = [];

      for (let jobId of jobIds) {
        const job = await contract.getJob(jobId);
        const milestones = await contract.getMilestones(jobId);
        
        jobsData.push({
          id: jobId.toString(),
          client: job[0],
          freelancer: job[1],
          totalAmount: ethers.formatEther(job[2]),
          releasedAmount: ethers.formatEther(job[3]),
          disputed: job[4],
          cancelled: job[5],
          title: job[6],
          description: job[7],
          createdAt: Number(job[8]),
          milestones: milestones.map(m => ({
            amount: ethers.formatEther(m.amount),
            submitted: m.submitted,
            released: m.released,
            rejected: m.rejected,
            workDescription: m.workDescription,
            submittedWork: m.submittedWork,
            submittedAt: Number(m.submittedAt),
            releasedAt: Number(m.releasedAt)
          }))
        });
      }

      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobDetails = async (jobId) => {
    try {
      const job = await contract.getJob(jobId);
      const milestones = await contract.getMilestones(jobId);
      
      setSelectedJob({
        id: jobId,
        client: job[0],
        freelancer: job[1],
        totalAmount: ethers.formatEther(job[2]),
        releasedAmount: ethers.formatEther(job[3]),
        disputed: job[4],
        cancelled: job[5],
        title: job[6],
        description: job[7],
        createdAt: Number(job[8]),
        milestones: milestones.map(m => ({
          amount: ethers.formatEther(m.amount),
          submitted: m.submitted,
          released: m.released,
          rejected: m.rejected,
          workDescription: m.workDescription,
          submittedWork: m.submittedWork,
          submittedAt: Number(m.submittedAt),
          releasedAt: Number(m.releasedAt)
        }))
      });
    } catch (error) {
      console.error('Error loading job details:', error);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!contract) return;

    setLoading(true);
    try {
      const amounts = newJob.milestones.map(m => ethers.parseEther(m.amount));
      const descriptions = newJob.milestones.map(m => m.description);
      const totalAmount = amounts.reduce((a, b) => a + b, 0n);

      const tx = await contract.createJob(
        newJob.freelancer,
        amounts,
        descriptions,
        newJob.title,
        newJob.description,
        { value: totalAmount }
      );

      await tx.wait();
      alert('Job created successfully!');
      setNewJob({ title: '', description: '', freelancer: '', milestones: [{ description: '', amount: '' }] });
      setView('jobs');
      loadJobs();
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWork = async (jobId, milestoneId) => {
    if (!contract || !submitWork.work) return;

    setLoading(true);
    try {
      const tx = await contract.submitWork(jobId, milestoneId, submitWork.work);
      await tx.wait();
      alert('Work submitted successfully!');
      setSubmitWork({ milestoneId: 0, work: '' });
      loadJobDetails(jobId);
    } catch (error) {
      console.error('Error submitting work:', error);
      alert('Failed to submit work: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMilestone = async (jobId, milestoneId) => {
    if (!contract) return;

    setLoading(true);
    try {
      const tx = await contract.approveMilestone(jobId, milestoneId);
      await tx.wait();
      alert('Milestone approved and funds released!');
      loadJobDetails(jobId);
    } catch (error) {
      console.error('Error approving milestone:', error);
      alert('Failed to approve milestone: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectMilestone = async (jobId, milestoneId) => {
    if (!contract || !rejectReason) return;

    setLoading(true);
    try {
      const tx = await contract.rejectMilestone(jobId, milestoneId, rejectReason);
      await tx.wait();
      alert('Milestone rejected!');
      setRejectReason('');
      loadJobDetails(jobId);
    } catch (error) {
      console.error('Error rejecting milestone:', error);
      alert('Failed to reject milestone: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseDispute = async (jobId) => {
    if (!contract) return;
    if (!confirm('Are you sure you want to raise a dispute?')) return;

    setLoading(true);
    try {
      const tx = await contract.raiseDispute(jobId);
      await tx.wait();
      alert('Dispute raised successfully!');
      loadJobDetails(jobId);
    } catch (error) {
      console.error('Error raising dispute:', error);
      alert('Failed to raise dispute: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addMilestone = () => {
    setNewJob({
      ...newJob,
      milestones: [...newJob.milestones, { description: '', amount: '' }]
    });
  };

  const removeMilestone = (index) => {
    const updated = newJob.milestones.filter((_, i) => i !== index);
    setNewJob({ ...newJob, milestones: updated });
  };

  const isClient = (job) => job.client.toLowerCase() === account.toLowerCase();
  const isFreelancer = (job) => job.freelancer.toLowerCase() === account.toLowerCase();

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
          <Briefcase size={64} className="mx-auto mb-4 text-blue-300" />
          <h1 className="text-3xl font-bold text-white mb-4">Freelance Escrow dApp</h1>
          <p className="text-purple-200 mb-6">Connect your wallet to get started</p>
          <button
            onClick={connectWallet}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Freelance Escrow</h1>
              <p className="text-purple-200 text-sm">Account: {account.substring(0, 6)}...{account.substring(38)}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setView('jobs'); setSelectedJob(null); }}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  view === 'jobs' ? 'bg-white/20 text-white' : 'bg-white/5 text-purple-200 hover:bg-white/10'
                }`}
              >
                My Jobs
              </button>
              <button
                onClick={() => setView('create')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  view === 'create' ? 'bg-white/20 text-white' : 'bg-white/5 text-purple-200 hover:bg-white/10'
                }`}
              >
                Create Job
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {view === 'jobs' && !selectedJob && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-white py-12">Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
                <Briefcase size={64} className="mx-auto mb-4 text-purple-300" />
                <p className="text-white text-xl">No jobs found</p>
                <p className="text-purple-200 mt-2">Create a new job to get started</p>
              </div>
            ) : (
              jobs.map(job => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
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
                      <p className="text-white font-semibold">{isClient(job) ? 'Client' : 'Freelancer'}</p>
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
                      <p className="text-yellow-300 font-semibold">
                        {(parseFloat(job.totalAmount) - parseFloat(job.releasedAmount)).toFixed(4)} ETH
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-white/5 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${(parseFloat(job.releasedAmount) / parseFloat(job.totalAmount)) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-white font-semibold">
                      {job.milestones.filter(m => m.released).length} / {job.milestones.length} milestones
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {view === 'jobs' && selectedJob && (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedJob(null)}
              className="text-purple-300 hover:text-white transition-colors mb-4"
            >
              ← Back to Jobs
            </button>

            {/* Job Details */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedJob.title}</h2>
                  <p className="text-purple-200 mb-4">{selectedJob.description}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-purple-300">
                      <User size={16} className="inline mr-1" />
                      Your Role: <span className="text-white font-semibold">{isClient(selectedJob) ? 'Client' : 'Freelancer'}</span>
                    </span>
                    <span className="text-purple-300">
                      <Clock size={16} className="inline mr-1" />
                      Created: {new Date(selectedJob.createdAt * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedJob.disputed && (
                    <span className="bg-red-500/20 text-red-300 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                      <AlertTriangle size={20} /> Disputed
                    </span>
                  )}
                  {!selectedJob.disputed && !selectedJob.cancelled && (
                    <button
                      onClick={() => handleRaiseDispute(selectedJob.id)}
                      disabled={loading}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                    >
                      Raise Dispute
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-400/30">
                  <p className="text-blue-300 text-sm mb-1">Total Amount</p>
                  <p className="text-white text-2xl font-bold flex items-center gap-2">
                    <DollarSign size={24} />
                    {selectedJob.totalAmount} ETH
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-400/30">
                  <p className="text-green-300 text-sm mb-1">Released</p>
                  <p className="text-white text-2xl font-bold flex items-center gap-2">
                    <CheckCircle size={24} />
                    {selectedJob.releasedAmount} ETH
                  </p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-400/30">
                  <p className="text-yellow-300 text-sm mb-1">Remaining</p>
                  <p className="text-white text-2xl font-bold flex items-center gap-2">
                    <Clock size={24} />
                    {(parseFloat(selectedJob.totalAmount) - parseFloat(selectedJob.releasedAmount)).toFixed(4)} ETH
                  </p>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between text-sm text-purple-300 mb-2">
                  <span>Progress</span>
                  <span>{((parseFloat(selectedJob.releasedAmount) / parseFloat(selectedJob.totalAmount)) * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-white/10 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${(parseFloat(selectedJob.releasedAmount) / parseFloat(selectedJob.totalAmount)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Milestones</h3>
              {selectedJob.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-white">Milestone {index + 1}</h4>
                        {milestone.released && (
                          <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                            <CheckCircle size={16} /> Released
                          </span>
                        )}
                        {milestone.submitted && !milestone.released && (
                          <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                            <Clock size={16} /> Pending Review
                          </span>
                        )}
                        {milestone.rejected && (
                          <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                            <XCircle size={16} /> Rejected
                          </span>
                        )}
                      </div>
                      <p className="text-purple-200 mb-3">{milestone.workDescription}</p>
                      <p className="text-white font-semibold text-lg">{milestone.amount} ETH</p>
                    </div>
                  </div>

                  {milestone.submittedWork && (
                    <div className="bg-white/5 rounded-lg p-4 mb-4">
                      <p className="text-purple-300 text-sm mb-2 flex items-center gap-2">
                        <FileText size={16} /> Submitted Work
                      </p>
                      <p className="text-white">{milestone.submittedWork}</p>
                      {milestone.submittedAt > 0 && (
                        <p className="text-purple-300 text-sm mt-2">
                          Submitted: {new Date(milestone.submittedAt * 1000).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Freelancer Actions */}
                  {isFreelancer(selectedJob) && !milestone.released && !milestone.submitted && !selectedJob.disputed && !selectedJob.cancelled && (
                    <div className="space-y-3">
                      <textarea
                        placeholder="Describe your completed work..."
                        value={submitWork.milestoneId === index ? submitWork.work : ''}
                        onChange={(e) => setSubmitWork({ milestoneId: index, work: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                        rows="3"
                      />
                      <button
                        onClick={() => handleSubmitWork(selectedJob.id, index)}
                        disabled={loading || !submitWork.work || submitWork.milestoneId !== index}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit Work
                      </button>
                    </div>
                  )}

                  {/* Client Actions */}
                  {isClient(selectedJob) && milestone.submitted && !milestone.released && !selectedJob.disputed && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveMilestone(selectedJob.id, index)}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
                      >
                        <CheckCircle size={20} className="inline mr-2" />
                        Approve & Release Funds
                      </button>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Reason for rejection..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-purple-300 focus:outline-none focus:border-red-400 mb-2"
                        />
                        <button
                          onClick={() => handleRejectMilestone(selectedJob.id, index)}
                          disabled={loading || !rejectReason}
                          className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all disabled:opacity-50"
                        >
                          <XCircle size={20} className="inline mr-2" />
                          Reject Work
                        </button>
                      </div>
                    </div>
                  )}

                  {milestone.released && milestone.releasedAt > 0 && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-300 text-sm">
                      Released on {new Date(milestone.releasedAt * 1000).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'create' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">Create New Job</h2>
            <form onSubmit={handleCreateJob} className="space-y-6">
              <div>
                <label className="block text-purple-300 mb-2">Job Title</label>
                <input
                  type="text"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                  placeholder="e.g., Build a responsive website"
                  required
                />
              </div>

              <div>
                <label className="block text-purple-300 mb-2">Description</label>
                <textarea
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                  placeholder="Detailed project description..."
                  rows="4"
                  required
                />
              </div>

              <div>
                <label className="block text-purple-300 mb-2">Freelancer Address</label>
                <input
                  type="text"
                  value={newJob.freelancer}
                  onChange={(e) => setNewJob({ ...newJob, freelancer: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                  placeholder="0x..."
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-purple-300 font-semibold">Milestones</label>
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-2 rounded-lg font-semibold transition-all"
                  >
                    + Add Milestone
                  </button>
                </div>

                {newJob.milestones.map((milestone, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 mb-3">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-white font-semibold">Milestone {index + 1}</h4>
                      {newJob.milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={milestone.description}
                        onChange={(e) => {
                          const updated = [...newJob.milestones];
                          updated[index].description = e.target.value;
                          setNewJob({ ...newJob, milestones: updated });
                        }}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                        placeholder="Milestone description"
                        required
                      />
                      <input
                        type="number"
                        step="0.001"
                        value={milestone.amount}
                        onChange={(e) => {
                          const updated = [...newJob.milestones];
                          updated[index].amount = e.target.value;
                          setNewJob({ ...newJob, milestones: updated });
                        }}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                        placeholder="Amount in ETH"
                        required
                      />
                    </div>
                  </div>
                ))}

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
                  <p className="text-blue-300 font-semibold">
                    Total: {newJob.milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0).toFixed(4)} ETH
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Job...' : 'Create Job & Deposit Funds'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}