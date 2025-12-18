import React from 'react';
import { Briefcase } from 'lucide-react';
import { JobCard } from './JobCard';

export const JobsList = ({ jobs, account, loading, onJobSelect }) => {
  if (loading) {
    return (
      <div className="text-center text-white py-12">Loading jobs...</div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
        <Briefcase size={64} className="mx-auto mb-4 text-purple-300" />
        <p className="text-white text-xl">No jobs found</p>
        <p className="text-purple-200 mt-2">Create a new job to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map(job => (
        <JobCard
          key={job.id}
          job={job}
          account={account}
          onClick={() => onJobSelect(job)}
        />
      ))}
    </div>
  );
};
