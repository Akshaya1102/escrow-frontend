// Replace with your deployed contract address
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const CONTRACT_ABI = [
  "function createJob(address freelancer, uint256[] milestoneAmounts, string[] milestoneDescriptions, string title, string description) external payable returns (uint256)",
  "function submitWork(uint256 jobId, uint256 milestoneId, string cid) external",
  "function approveMilestone(uint256 jobId, uint256 milestoneId) external",
  "function rejectMilestone(uint256 jobId, uint256 milestoneId, string reason) external",
  "function raiseDispute(uint256 jobId, uint256 milestoneId, string reason) external payable",
  "function resolveDispute(uint256 jobId, uint256 clientRefundPercentage, uint256 freelancerPaymentPercentage) external",
  "function autoApproveMilestone(uint256 jobId, uint256 milestoneId) external",
  "function cancelJob(uint256 jobId) external",
  "function getJob(uint256 jobId) external view returns (address, address, uint256, uint256, bool, bool, string, string, uint256, uint256)",
  "function getMilestone(uint256 jobId, uint256 milestoneId) external view returns (uint256, bool, bool, bool, string, string, uint256, uint256)",
  "function getDispute(uint256 jobId) external view returns (bool, address, uint256, string, uint256, uint256, uint256, bool, uint256, address)",
  "function jobCount() external view returns (uint256)",
  "event JobCreated(uint256 indexed jobId, address indexed client, address indexed freelancer, uint256 totalAmount)",
  "event WorkSubmitted(uint256 indexed jobId, uint256 milestoneId, string cid)",
  "event MilestoneApproved(uint256 indexed jobId, uint256 milestoneId, uint256 amount)",
  "event MilestoneRejected(uint256 indexed jobId, uint256 milestoneId, string reason)",
  "event DisputeRaised(uint256 indexed jobId, address indexed initiator, uint256 milestoneId, string reason)",
  "event DisputeResolved(uint256 indexed jobId, uint256 clientRefund, uint256 freelancerPayment, address resolver)"
];
