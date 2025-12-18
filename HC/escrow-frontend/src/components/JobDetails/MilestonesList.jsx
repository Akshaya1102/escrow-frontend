import React from 'react';
import { MilestoneCard } from './MilestoneCard';

export const MilestonesList = ({ 
  job, 
  account, 
  onSubmitWork, 
  onApproveMilestone, 
  onRejectMilestone,
  loading 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-white">Milestones</h3>
      {job.milestones.map((milestone, index) => (
        <MilestoneCard
          key={index}
          milestone={milestone}
          index={index}
          job={job}
          account={account}
          onSubmitWork={onSubmitWork}
          onApproveMilestone={onApproveMilestone}
          onRejectMilestone={onRejectMilestone}
          loading={loading}
        />
      ))}
    </div>
  );
};

