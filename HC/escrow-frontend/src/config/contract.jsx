export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const CONTRACT_ABI = [
  "function createJob(address freelancer, uint256[] calldata milestoneAmounts, string[] calldata milestoneDescriptions, string calldata title, string calldata description) external payable returns(uint256)",
  "function submitWork(uint256 jobId, uint256 milestoneId, string calldata work) external",
  "function approveMilestone(uint256 jobId, uint256 milestoneId) external",
  "function rejectMilestone(uint256 jobId, uint256 milestoneId, string calldata reason) external",
  "function raiseDispute(uint256 jobId) external",
  "function cancelJob(uint256 jobId) external",
  "function getJob(uint256 jobId) external view returns (address client, address freelancer, uint256 totalAmount, uint256 releasedAmount, bool disputed, bool cancelled, string memory title, string memory description, uint256 createdAt, uint256 milestoneCount)",
  "function getMilestones(uint256 jobId) external view returns(tuple(uint256 amount, bool submitted, bool released, bool rejected, string workDescription, string submittedWork, uint256 submittedAt, uint256 releasedAt)[] memory)",
  "function getJobsByParty(address party) external view returns(uint256[] memory)",
  "event JobCreated(uint256 indexed jobId, address indexed client, address indexed freelancer, uint256 totalAmount)",
  "event WorkSubmitted(uint256 indexed jobId, uint256 milestoneId, string work)",
  "event MilestoneApproved(uint256 indexed jobId, uint256 milestoneId, uint256 amount)",
  "event MilestoneRejected(uint256 indexed jobId, uint256 milestoneId, string reason)",
  "event DisputeRaised(uint256 indexed jobId, address raisedBy)"
];
