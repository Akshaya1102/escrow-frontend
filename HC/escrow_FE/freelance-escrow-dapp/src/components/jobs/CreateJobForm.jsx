import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { ethers } from "ethers";

export default function CreateJobForm({ escrowContract, onJobCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    freelancer: "",
    milestones: [{ description: "", amount: "" }],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const addMilestone = () => {
    setFormData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, { description: "", amount: "" }],
    }));
  };

  const removeMilestone = (index) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  const updateMilestone = (index, field, value) => {
    const updated = [...formData.milestones];
    updated[index][field] = value;
    setFormData({ ...formData, milestones: updated });
  };

  const totalAmount = formData.milestones.reduce(
    (sum, m) => sum + (parseFloat(m.amount) || 0),
    0
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Job title is required";
    }

    if (!formData.freelancer.trim()) {
      newErrors.freelancer = "Freelancer address is required";
    } else if (!ethers.isAddress(formData.freelancer)) {
      newErrors.freelancer = "Invalid Ethereum address";
    }

    formData.milestones.forEach((m, index) => {
      if (!m.description.trim()) {
        newErrors[`milestone_${index}_desc`] = "Description required";
      }
      if (!m.amount || parseFloat(m.amount) <= 0) {
        newErrors[`milestone_${index}_amount`] = "Amount must be greater than 0";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!escrowContract.isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const milestoneAmounts = formData.milestones.map((m) =>
        ethers.parseEther(m.amount.toString())
      );
      const milestoneDescriptions = formData.milestones.map((m) => m.description);

      const result = await escrowContract.createJob(
        formData.freelancer,
        milestoneAmounts,
        milestoneDescriptions,
        formData.title,
        formData.description || "No description provided"
      );

      alert(
        `Job created successfully!\n\nJob ID: ${result.jobId}\nTotal Amount: ${totalAmount.toFixed(3)} ETH\n\nTransaction Hash: ${result.receipt.hash}`
      );

      setFormData({
        title: "",
        description: "",
        freelancer: "",
        milestones: [{ description: "", amount: "" }],
      });
      setErrors({});

      if (onJobCreated) {
        onJobCreated();
      }
    } catch (error) {
      console.error("Error creating job:", error);
      alert(`Failed to create job: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Job</h2>

        <div className="space-y-6">
          {!escrowContract.isConnected && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 font-medium">Please connect your wallet to create a job</p>
            </div>
          )}

          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Website Redesign Project"
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-red-600 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
              placeholder="Describe the project requirements..."
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Freelancer Address
            </label>
            <input
              type="text"
              value={formData.freelancer}
              onChange={(e) => {
                setFormData({ ...formData, freelancer: e.target.value });
                if (errors.freelancer) setErrors({ ...errors, freelancer: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                errors.freelancer ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0x..."
              disabled={isSubmitting}
            />
            {errors.freelancer && (
              <p className="text-red-600 text-xs mt-1">{errors.freelancer}</p>
            )}
          </div>

          {/* Milestones */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Milestones
              </label>
              <button
                onClick={addMilestone}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add Milestone</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.milestones.map((m, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">Milestone {index + 1}</h4>
                    {formData.milestones.length > 1 && (
                      <button
                        onClick={() => removeMilestone(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={m.description}
                      onChange={(e) => {
                        updateMilestone(index, "description", e.target.value);
                        if (errors[`milestone_${index}_desc`]) {
                          const newErrors = { ...errors };
                          delete newErrors[`milestone_${index}_desc`];
                          setErrors(newErrors);
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        errors[`milestone_${index}_desc`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Milestone description"
                      disabled={isSubmitting}
                    />
                    {errors[`milestone_${index}_desc`] && (
                      <p className="text-red-600 text-xs mt-1">{errors[`milestone_${index}_desc`]}</p>
                    )}
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.001"
                        value={m.amount}
                        onChange={(e) => {
                          updateMilestone(index, "amount", e.target.value);
                          if (errors[`milestone_${index}_amount`]) {
                            const newErrors = { ...errors };
                            delete newErrors[`milestone_${index}_amount`];
                            setErrors(newErrors);
                          }
                        }}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          errors[`milestone_${index}_amount`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Amount"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm text-gray-500 font-medium">ETH</span>
                    </div>
                    {errors[`milestone_${index}_amount`] && (
                      <p className="text-red-600 text-xs mt-1">{errors[`milestone_${index}_amount`]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <span className="font-medium text-gray-900">Total Contract Value</span>
            <span className="text-xl font-bold text-blue-600">{totalAmount.toFixed(3)} ETH</span>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!escrowContract.isConnected || isSubmitting}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Creating Job & Depositing Funds...
              </>
            ) : (
              "Create Job & Deposit Funds"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
