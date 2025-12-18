// ============================================
// FILE: src/App.jsx
// ============================================
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useContract } from './hooks/useContract';
import { useJobs } from './hooks/useJobs';
import { ConnectWallet } from './components/ConnectWallet';
import { Header } from './components/Header';
import { JobsList } from './components/JobsList';
import { JobDetails } from './components/JobDetails/JobDetails';
import { CreateJobForm } from './components/CreateJob/CreateJobForm';

export default function App() {
  const { contract, account, loading: walletLoading, connectWallet } = useContract();
  const { jobs, loading: jobsLoading, loadJobs, loadJobDetails } = useJobs(contract, account);
  
  const [view, setView] = useState('jobs');
  const [selectedJob, setSelectedJob] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Setup event listeners when contract is ready
  useEffect(() => {
    if (contract && account) {
      setupEventListeners();
    }
    
    // Cleanup function
    return () => {
      if (contract) {
        contract.removeAllListeners();
      }
    };
  }, [contract, account]);

  // Listen to contract events for real-time updates
  const setupEventListeners = () => {
    if (!contract) return;

    // Job Created Event
    contract.on('JobCreated', (jobId, client, freelancer, totalAmount) => {
      console.log('New job created:', {
        jobId: jobId.toString(),
        client,
        freelancer,
        totalAmount: ethers.formatEther(totalAmount)
      });
      loadJobs();
    });

    // Work Submitted Event
    contract.on('WorkSubmitted', (jobId, milestoneId, work) => {
      console.log('Work submitted:', {
        jobId: jobId.toString(),
        milestoneId: milestoneId.toString()
      });
      
      if (selectedJob && selectedJob.id === jobId.toString()) {
        refreshSelectedJob(jobId.toString());
      }
      loadJobs();
    });

    // Milestone Approved Event
    contract.on('MilestoneApproved', (jobId, milestoneId, amount) => {
      console.log('Milestone approved:', {
        jobId: jobId.toString(),
        milestoneId: milestoneId.toString(),
        amount: ethers.formatEther(amount)
      });
      
      if (selectedJob && selectedJob.id === jobId.toString()) {
        refreshSelectedJob(jobId.toString());
      }
      loadJobs();
    });

    // Milestone Rejected Event
    contract.on('MilestoneRejected', (jobId, milestoneId, reason) => {
      console.log('Milestone rejected:', {
        jobId: jobId.toString(),
        milestoneId: milestoneId.toString(),
        reason
      });
      
      if (selectedJob && selectedJob.id === jobId.toString()) {
        refreshSelectedJob(jobId.toString());
      }
    });

    // Dispute Raised Event
    contract.on('DisputeRaised', (jobId, raisedBy) => {
      console.log('Dispute raised:', {
        jobId: jobId.toString(),
        raisedBy
      });
      
      if (selectedJob && selectedJob.id === jobId.toString()) {
        refreshSelectedJob(jobId.toString());
      }
      loadJobs();
    });

    console.log('Event listeners setup complete');
  };

  // Refresh the currently selected job details
  const refreshSelectedJob = async (jobId) => {
    try {
      const updated = await loadJobDetails(jobId);
      if (updated) {
        setSelectedJob(updated);
      }
    } catch (error) {
      console.error('Error refreshing job:', error);
    }
  };

  // Handle job creation
  const handleCreateJob = async (formData) => {
    if (!contract) {
      alert('Contract not connected');
      return;
    }

    setActionLoading(true);
    try {
      // Convert amounts to Wei
      const amounts = formData.milestones.map(m => ethers.parseEther(m.amount));
      const descriptions = formData.milestones.map(m => m.description);
      const totalAmount = amounts.reduce((a, b) => a + b, 0n);

      console.log('Creating job:', {
        freelancer: formData.freelancer,
        title: formData.title,
        totalAmount: ethers.formatEther(totalAmount),
        milestoneCount: amounts.length
      });

      // Call contract function
      const tx = await contract.createJob(
        formData.freelancer,
        amounts,
        descriptions,
        formData.title,
        formData.description,
        { value: totalAmount }
      );

      console.log('Transaction sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.blockNumber);
      
      alert('Job created successfully!');
      setView('jobs');
      await loadJobs();
    } catch (error) {
      console.error('Error creating job:', error);
      
      // User-friendly error messages
      if (error.code === 'ACTION_REJECTED') {
        alert('Transaction was rejected');
      } else if (error.message.includes('insufficient funds')) {
        alert('Insufficient funds to create job');
      } else {
        alert('Failed to create job: ' + (error.reason || error.message));
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle work submission by freelancer
  const handleSubmitWork = async (jobId, milestoneId, work) => {
    if (!contract || !work) {
      alert('Please provide work description');
      return;
    }

    setActionLoading(true);
    try {
      console.log('Submitting work:', { jobId, milestoneId });
      
      const tx = await contract.submitWork(jobId, milestoneId, work);
      console.log('Transaction sent:', tx.hash);
      
      await tx.wait();
      console.log('Work submitted successfully');
      
      alert('Work submitted successfully!');
      await refreshSelectedJob(jobId);
    } catch (error) {
      console.error('Error submitting work:', error);
      
      if (error.code === 'ACTION_REJECTED') {
        alert('Transaction was rejected');
      } else if (error.message.includes('Only freelancer')) {
        alert('Only the freelancer can submit work');
      } else if (error.message.includes('Previous milestone not released')) {
        alert('Complete the previous milestone first');
      } else {
        alert('Failed to submit work: ' + (error.reason || error.message));
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle milestone approval by client
  const handleApproveMilestone = async (jobId, milestoneId) => {
    if (!contract) return;

    const confirmApproval = window.confirm(
      'Are you sure you want to approve this milestone and release the funds?'
    );
    
    if (!confirmApproval) return;

    setActionLoading(true);
    try {
      console.log('Approving milestone:', { jobId, milestoneId });
      
      const tx = await contract.approveMilestone(jobId, milestoneId);
      console.log('Transaction sent:', tx.hash);
      
      await tx.wait();
      console.log('Milestone approved successfully');
      
      alert('Milestone approved and funds released!');
      await refreshSelectedJob(jobId);
      await loadJobs();
    } catch (error) {
      console.error('Error approving milestone:', error);
      
      if (error.code === 'ACTION_REJECTED') {
        alert('Transaction was rejected');
      } else if (error.message.includes('Only client')) {
        alert('Only the client can approve milestones');
      } else if (error.message.includes('Not submitted')) {
        alert('Work has not been submitted yet');
      } else {
        alert('Failed to approve milestone: ' + (error.reason || error.message));
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle milestone rejection by client
  const handleRejectMilestone = async (jobId, milestoneId, reason) => {
    if (!contract || !reason) {
      alert('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      console.log('Rejecting milestone:', { jobId, milestoneId, reason });
      
      const tx = await contract.rejectMilestone(jobId, milestoneId, reason);
      console.log('Transaction sent:', tx.hash);
      
      await tx.wait();
      console.log('Milestone rejected successfully');
      
      alert('Milestone rejected. Freelancer can resubmit.');
      await refreshSelectedJob(jobId);
    } catch (error) {
      console.error('Error rejecting milestone:', error);
      
      if (error.code === 'ACTION_REJECTED') {
        alert('Transaction was rejected');
      } else if (error.message.includes('Only client')) {
        alert('Only the client can reject milestones');
      } else {
        alert('Failed to reject milestone: ' + (error.reason || error.message));
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle dispute raising
  const handleRaiseDispute = async (jobId) => {
    if (!contract) return;
    
    const confirmDispute = window.confirm(
      'Are you sure you want to raise a dispute? This will freeze all job actions.'
    );
    
    if (!confirmDispute) return;

    setActionLoading(true);
    try {
      console.log('Raising dispute for job:', jobId);
      
      const tx = await contract.raiseDispute(jobId);
      console.log('Transaction sent:', tx.hash);
      
      await tx.wait();
      console.log('Dispute raised successfully');
      
      alert('Dispute raised successfully! The job is now frozen.');
      await refreshSelectedJob(jobId);
      await loadJobs();
    } catch (error) {
      console.error('Error raising dispute:', error);
      
      if (error.code === 'ACTION_REJECTED') {
        alert('Transaction was rejected');
      } else if (error.message.includes('Unauthorized')) {
        alert('You are not authorized to raise a dispute for this job');
      } else if (error.message.includes('Already disputed')) {
        alert('This job is already disputed');
      } else {
        alert('Failed to raise dispute: ' + (error.reason || error.message));
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle view changes
  const handleViewChange = (newView) => {
    setView(newView);
    setSelectedJob(null);
  };

  // Handle job selection
  const handleJobSelect = (job) => {
    setSelectedJob(job);
  };

  // Show connect wallet screen if not connected
  if (!account) {
    return (
      <ConnectWallet 
        onConnect={connectWallet} 
        loading={walletLoading} 
      />
    );
  }

  // Main application UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with navigation */}
        <Header 
          account={account} 
          currentView={view} 
          onViewChange={handleViewChange} 
        />

        {/* Jobs List View */}
        {view === 'jobs' && !selectedJob && (
          <JobsList
            jobs={jobs}
            account={account}
            loading={jobsLoading}
            onJobSelect={handleJobSelect}
          />
        )}

        {/* Job Details View */}
        {view === 'jobs' && selectedJob && (
          <JobDetails
            job={selectedJob}
            account={account}
            onBack={() => setSelectedJob(null)}
            onRaiseDispute={handleRaiseDispute}
            onSubmitWork={handleSubmitWork}
            onApproveMilestone={handleApproveMilestone}
            onRejectMilestone={handleRejectMilestone}
            loading={actionLoading}
          />
        )}

        {/* Create Job View */}
        {view === 'create' && (
          <CreateJobForm
            onSubmit={handleCreateJob}
            loading={actionLoading}
          />
        )}
      </div>
    </div>
  );
}