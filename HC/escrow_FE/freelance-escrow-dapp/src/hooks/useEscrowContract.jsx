import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

export function useEscrowContract() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Connect wallet
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to use this app.');
      }

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await web3Provider.send('eth_requestAccounts', []);
      const web3Signer = await web3Provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);

      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(contractInstance);
      setAccount(accounts[0]);
      setIsConnected(true);

      return accounts[0];
    } catch (err) {
      setError(err.message);
      console.error('Wallet connection error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount('');
    setIsConnected(false);
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Contract function: Create Job
  const createJob = async (freelancerAddress, milestoneAmounts, milestoneDescriptions, title, description) => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      setIsLoading(true);
      setError(null);

      const totalAmount = milestoneAmounts.reduce((sum, amount) => sum + amount, 0n);

      const tx = await contract.createJob(
        freelancerAddress,
        milestoneAmounts,
        milestoneDescriptions,
        title,
        description,
        { value: totalAmount }
      );

      const receipt = await tx.wait();

      // Extract jobId from JobCreated event
      const event = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === 'JobCreated';
        } catch {
          return false;
        }
      });

      const jobId = event ? contract.interface.parseLog(event).args.jobId : null;

      return { success: true, jobId: jobId?.toString(), receipt };
    } catch (err) {
      setError(err.message);
      console.error('Create job error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Contract function: Submit Work
  const submitWork = async (jobId, milestoneId, cid) => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      setIsLoading(true);
      setError(null);

      const tx = await contract.submitWork(jobId, milestoneId, cid);
      const receipt = await tx.wait();

      return { success: true, receipt };
    } catch (err) {
      setError(err.message);
      console.error('Submit work error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Contract function: Approve Milestone
  const approveMilestone = async (jobId, milestoneId) => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      setIsLoading(true);
      setError(null);

      const tx = await contract.approveMilestone(jobId, milestoneId);
      const receipt = await tx.wait();

      return { success: true, receipt };
    } catch (err) {
      setError(err.message);
      console.error('Approve milestone error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Contract function: Reject Milestone
  const rejectMilestone = async (jobId, milestoneId, reason) => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      setIsLoading(true);
      setError(null);

      const tx = await contract.rejectMilestone(jobId, milestoneId, reason);
      const receipt = await tx.wait();

      return { success: true, receipt };
    } catch (err) {
      setError(err.message);
      console.error('Reject milestone error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Contract function: Auto Approve Milestone
  const autoApproveMilestone = async (jobId, milestoneId) => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      setIsLoading(true);
      setError(null);

      const tx = await contract.autoApproveMilestone(jobId, milestoneId);
      const receipt = await tx.wait();

      return { success: true, receipt };
    } catch (err) {
      setError(err.message);
      console.error('Auto approve milestone error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Contract function: Raise Dispute
  const raiseDispute = async (jobId, milestoneId, reason) => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      setIsLoading(true);
      setError(null);

      const disputeFee = ethers.parseEther('0.01'); // 0.01 ETH
      const tx = await contract.raiseDispute(jobId, milestoneId, reason, { value: disputeFee });
      const receipt = await tx.wait();

      return { success: true, receipt };
    } catch (err) {
      setError(err.message);
      console.error('Raise dispute error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Contract function: Resolve Dispute (arbiter only)
  const resolveDispute = async (jobId, clientRefundPercentage, freelancerPaymentPercentage) => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      setIsLoading(true);
      setError(null);

      const tx = await contract.resolveDispute(jobId, clientRefundPercentage, freelancerPaymentPercentage);
      const receipt = await tx.wait();

      return { success: true, receipt };
    } catch (err) {
      setError(err.message);
      console.error('Resolve dispute error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Contract function: Cancel Job
  const cancelJob = async (jobId) => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      setIsLoading(true);
      setError(null);

      const tx = await contract.cancelJob(jobId);
      const receipt = await tx.wait();

      return { success: true, receipt };
    } catch (err) {
      setError(err.message);
      console.error('Cancel job error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // View function: Get Job
  const getJob = async (jobId) => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      const result = await contract.getJob(jobId);
      return {
        client: result[0],
        freelancer: result[1],
        totalAmount: result[2],
        releasedAmount: result[3],
        disputed: result[4],
        cancelled: result[5],
        title: result[6],
        description: result[7],
        createdAt: result[8],
        milestoneCount: result[9]
      };
    } catch (err) {
      console.error('Get job error:', err);
      throw err;
    }
  };

  // View function: Get Milestone
  const getMilestone = async (jobId, milestoneId) => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      const result = await contract.getMilestone(jobId, milestoneId);
      return {
        amount: result[0],
        submitted: result[1],
        released: result[2],
        rejected: result[3],
        workDescription: result[4],
        submittedWorkCID: result[5],
        submittedAt: result[6],
        releasedAt: result[7]
      };
    } catch (err) {
      console.error('Get milestone error:', err);
      throw err;
    }
  };

  // View function: Get Dispute
  const getDispute = async (jobId) => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      const result = await contract.getDispute(jobId);
      return {
        active: result[0],
        initiator: result[1],
        milestoneId: result[2],
        reason: result[3],
        raisedAt: result[4],
        clientRefundAmount: result[5],
        freelancerPaymentAmount: result[6],
        resolved: result[7],
        resolvedAt: result[8],
        resolver: result[9]
      };
    } catch (err) {
      console.error('Get dispute error:', err);
      throw err;
    }
  };

  // View function: Get Job Count
  const getJobCount = async () => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      const count = await contract.jobCount();
      return count;
    } catch (err) {
      console.error('Get job count error:', err);
      throw err;
    }
  };

  // Get all jobs for a user
  const getUserJobs = async (userAddress) => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      const count = await getJobCount();
      const jobs = [];

      for (let i = 1; i <= count; i++) {
        const job = await getJob(i);
        if (job.client.toLowerCase() === userAddress.toLowerCase() ||
            job.freelancer.toLowerCase() === userAddress.toLowerCase()) {

          const milestones = [];
          for (let j = 0; j < Number(job.milestoneCount); j++) {
            const milestone = await getMilestone(i, j);
            milestones.push({ ...milestone, id: j });
          }

          jobs.push({
            jobId: i,
            ...job,
            milestones
          });
        }
      }

      return jobs;
    } catch (err) {
      console.error('Get user jobs error:', err);
      throw err;
    }
  };

  // Get all disputed jobs (for arbiters)
  const getAllDisputedJobs = async () => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      const count = await getJobCount();
      const jobs = [];

      for (let i = 1; i <= count; i++) {
        const job = await getJob(i);

        // Only include disputed jobs
        if (job.disputed) {
          const milestones = [];
          for (let j = 0; j < Number(job.milestoneCount); j++) {
            const milestone = await getMilestone(i, j);
            milestones.push({ ...milestone, id: j });
          }

          jobs.push({
            jobId: i,
            ...job,
            milestones
          });
        }
      }

      return jobs;
    } catch (err) {
      console.error('Get all disputed jobs error:', err);
      throw err;
    }
  };

  return {
    // State
    provider,
    signer,
    contract,
    account,
    isConnected,
    isLoading,
    error,

    // Wallet functions
    connectWallet,
    disconnectWallet,

    // Contract write functions
    createJob,
    submitWork,
    approveMilestone,
    rejectMilestone,
    autoApproveMilestone,
    raiseDispute,
    resolveDispute,
    cancelJob,

    // Contract read functions
    getJob,
    getMilestone,
    getDispute,
    getJobCount,
    getUserJobs,
    getAllDisputedJobs
  };
}
