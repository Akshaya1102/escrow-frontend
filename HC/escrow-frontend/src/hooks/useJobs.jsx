import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const useJobs = (contract, account) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

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
      
      return {
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
      };
    } catch (error) {
      console.error('Error loading job details:', error);
      return null;
    }
  };

  useEffect(() => {
    if (contract && account) {
      loadJobs();
    }
  }, [contract, account]);

  return {
    jobs,
    loading,
    loadJobs,
    loadJobDetails
  };
};

