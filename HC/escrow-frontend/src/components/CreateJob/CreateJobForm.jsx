import React, { useState } from 'react';
import { MilestoneForm } from './MilestoneForm';

export const CreateJobForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    freelancer: '',
    milestones: [{ description: '', amount: '' }]
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleMilestoneChange = (index, field, value) => {
    const updated = [...formData.milestones];
    updated[index][field] = value;
    setFormData({ ...formData, milestones: updated });
  };

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { description: '', amount: '' }]
    });
  };

  const removeMilestone = (index) => {
    const updated = formData.milestones.filter((_, i) => i !== index);
    setFormData({ ...formData, milestones: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      freelancer: '',
      milestones: [{ description: '', amount: '' }]
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h2 className="text-3xl font-bold text-white mb-6">Create New Job</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-purple-300 mb-2">Job Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
            placeholder="e.g., Build a responsive website"
            required
          />
        </div>

        <div>
          <label className="block text-purple-300 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
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
            value={formData.freelancer}
            onChange={(e) => handleInputChange('freelancer', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
            placeholder="0x..."
            required
          />
        </div>

        <MilestoneForm
          milestones={formData.milestones}
          onChange={handleMilestoneChange}
          onAdd={addMilestone}
          onRemove={removeMilestone}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Job...' : 'Create Job & Deposit Funds'}
        </button>
      </form>
    </div>
  );
};
