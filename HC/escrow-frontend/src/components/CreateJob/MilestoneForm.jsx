import React from 'react';

export const MilestoneForm = ({ milestones, onChange, onAdd, onRemove }) => {
  const totalAmount = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <label className="text-purple-300 font-semibold">Milestones</label>
        <button
          type="button"
          onClick={onAdd}
          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-2 rounded-lg font-semibold transition-all"
        >
          + Add Milestone
        </button>
      </div>

      {milestones.map((milestone, index) => (
        <div key={index} className="bg-white/5 rounded-lg p-4 mb-3">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-white font-semibold">Milestone {index + 1}</h4>
            {milestones.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
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
              onChange={(e) => onChange(index, 'description', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
              placeholder="Milestone description"
              required
            />
            <input
              type="number"
              step="0.001"
              min="0"
              value={milestone.amount}
              onChange={(e) => onChange(index, 'amount', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
              placeholder="Amount in ETH"
              required
            />
          </div>
        </div>
      ))}

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
        <p className="text-blue-300 font-semibold">
          Total: {totalAmount.toFixed(4)} ETH
        </p>
      </div>
    </div>
  );
};