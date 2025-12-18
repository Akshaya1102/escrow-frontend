import React from 'react';
import { JobHeader } from './JobHeader';
import { ProgressSummary } from './ProgressSummary';
import { MilestonesList } from './MilestonesList';

export const JobDetails = ({ 
  job, 
  account, 
  onBack, 
  onRaiseDispute,
  onSubmitWork,
  onApproveMilestone,
  onRejectMilestone,
  loading 
}) => {
  return (
    <div className="space-y-6">
      <JobHeader
        job={job}
        account={account}
        onRaiseDispute={onRaiseDispute}
        onBack={onBack}
        loading={loading}
      />
      
      <ProgressSummary job={job} />
      
      <MilestonesList
        job={job}
        account={account}
        onSubmitWork={onSubmitWork}
        onApproveMilestone={onApproveMilestone}
        onRejectMilestone={onRejectMilestone}
        loading={loading}
      />
    </div>
  );
};