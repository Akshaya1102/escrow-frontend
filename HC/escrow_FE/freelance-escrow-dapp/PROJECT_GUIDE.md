# Freelance Escrow DApp - Complete Guide

A decentralized application for managing freelance work with milestone-based payments using smart contracts on the Ethereum blockchain.

## Features

### Core Functionality
- **Create Jobs**: Clients can create jobs with multiple milestones and deposit funds
- **Submit Work**: Freelancers submit work with IPFS CIDs for each milestone
- **Approve/Reject**: Clients can approve or reject submitted work
- **Auto-Approve**: Freelancers can auto-approve milestones after 7 days if client doesn't respond
- **Dispute Resolution**: Both parties can raise disputes for platform arbiter resolution
- **Cancel Jobs**: Clients can cancel jobs before work submission

### Smart Contract Functions
All functions from `freelance_new.sol` are integrated:
- `createJob()` - Create a new escrow job with milestones
- `submitWork()` - Submit work with IPFS CID
- `approveMilestone()` - Approve and release payment
- `rejectMilestone()` - Reject work with reason
- `autoApproveMilestone()` - Auto-approve after 7 days
- `raiseDispute()` - Raise dispute (0.01 ETH fee)
- `resolveDispute()` - Arbiter resolves disputes
- `cancelJob()` - Cancel job and refund

## Setup

### Prerequisites
- Node.js (v16 or higher)
- MetaMask wallet
- Local Ethereum node (Hardhat, Ganache) or testnet access

### Installation Steps

1. **Install dependencies** (if not already done):
```bash
cd /home/akshaya/HC/escrow_FE/freelance-escrow-dapp
npm install
```

2. **Update contract address**:
Edit `src/config/contract.jsx` and replace with your deployed contract address:
```javascript
export const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

3. **Start development server**:
```bash
npm run dev
```

## Usage Guide

### For Clients

1. **Connect Wallet**:
   - Click "Connect Wallet" button in the header
   - Approve MetaMask connection

2. **Create Job**:
   - Navigate to "Create Job" tab
   - Fill in job details:
     - Job Title (required)
     - Description (optional)
     - Freelancer Address (required - must be valid Ethereum address)
   - Add Milestones:
     - Click "Add Milestone" to add more
     - Enter description and ETH amount for each
     - Remove milestones with X button if needed
   - Review total contract value
   - Click "Create Job & Deposit Funds"
   - Approve the MetaMask transaction (deposits full amount)

3. **Manage Jobs**:
   - Go to "My Jobs" tab
   - Filter by: All, Active, Completed, Disputed, Cancelled
   - Click on any job card to view details

4. **Approve Work**:
   - Open job details
   - Find submitted milestone
   - Review the IPFS link to the work
   - Click "Approve" to release payment
   - Or click "Reject" with a reason to request resubmission

5. **Raise Dispute**:
   - If you disagree with submitted work
   - Click "Raise Dispute" on the milestone
   - Provide detailed reason (minimum 10 characters)
   - Pay 0.01 ETH dispute fee
   - Wait for arbiter resolution

6. **Cancel Job**:
   - Only possible before any work is submitted
   - Open job details
   - Click "Cancel Job" at the bottom
   - Confirm - all funds will be refunded

### For Freelancers

1. **Connect Wallet**:
   - Click "Connect Wallet" button

2. **View Assigned Jobs**:
   - Go to "My Jobs" tab
   - See jobs where you're the freelancer

3. **Submit Work**:
   - Open job details
   - Find the current milestone
   - Click "Submit Work"
   - Enter IPFS CID of your work (e.g., from Pinata, NFT.Storage)
   - Submit transaction
   - Work link will be visible to client

4. **Resubmit if Rejected**:
   - If work is rejected, you'll see the rejection
   - Click "Resubmit Work"
   - Enter new IPFS CID
   - Submit again

5. **Auto-Approve**:
   - If client doesn't respond within 7 days
   - "Auto-Approve" button will appear
   - Click to claim payment automatically

6. **Raise Dispute**:
   - If client unfairly rejects work
   - Click "Raise Dispute"
   - Provide detailed evidence
   - Pay 0.01 ETH fee

### For Platform Arbiters

1. **View Disputes**:
   - Go to "Disputes" tab
   - See all active disputes involving you

2. **Resolve Disputes**:
   - Review dispute reason and milestone details
   - Click "Resolve Dispute"
   - Use sliders to set percentages:
     - Client Refund: 0-100%
     - Freelancer Payment: 0-100%
     - Platform Fee: Remainder (max 100% total)
   - Confirm resolution
   - Funds distributed automatically

## Component Overview

### Main Components

1. **App.jsx** - Main application container
   - Manages wallet connection
   - Tab navigation
   - Renders active tab content

2. **CreateJobForm.jsx** - Job creation interface
   - Dynamic milestone management
   - Form validation
   - Contract interaction for createJob

3. **MyJobs.jsx** - Job list and management
   - Fetches user jobs from blockchain
   - Filtering by status
   - Refresh functionality

4. **JobDetailModal.jsx** - Detailed job view
   - Shows all job information
   - Milestone management
   - Cancel job option

5. **MilestoneActions.jsx** - Milestone interaction
   - Submit work (freelancer)
   - Approve/reject (client)
   - Auto-approve (freelancer)
   - Shows submitted work link

6. **DisputeActions.jsx** - Dispute management
   - Raise dispute button
   - Dispute form with reason
   - Fee display

7. **DisputeManagement.jsx** - Arbiter interface
   - List all disputes
   - Resolution sliders
   - Distribution preview

### Hook

**useEscrowContract.jsx** - Main contract interaction hook
- Wallet connection management
- All contract write functions
- All contract read functions
- Event handling
- Error management

## Smart Contract Integration

### Contract: `EscrowMilestonesWithDispute`

**Key Properties:**
- Milestone-based escrow system
- IPFS work submission
- 7-day auto-approve period
- 0.01 ETH dispute fee
- Platform arbiter for disputes

**Job Lifecycle:**
1. Client creates job → funds locked in contract
2. Freelancer submits work → IPFS CID stored
3. Client approves → payment released to freelancer
4. OR Client rejects → freelancer can resubmit
5. OR Either party raises dispute → arbiter resolves
6. OR 7 days pass → freelancer can auto-approve

### Contract ABI

Located in `src/config/contract.jsx` - includes all function signatures and events.

## Technologies Used

- **React 19** - Frontend framework
- **Ethers.js v6** - Ethereum interaction library
- **Vite** - Fast build tool
- **Lucide React** - Icon library
- **MetaMask** - Wallet provider
- **Solidity 0.8.20** - Smart contract

## File Structure

```
freelance-escrow-dapp/
├── src/
│   ├── components/
│   │   ├── jobs/
│   │   │   ├── CreateJobForm.jsx
│   │   │   ├── MyJobs.jsx
│   │   │   ├── JobCard.jsx
│   │   │   ├── JobDetailModal.jsx
│   │   │   ├── MilestoneActions.jsx
│   │   │   └── MilestoneCard.jsx
│   │   ├── disputes/
│   │   │   ├── DisputeManagement.jsx
│   │   │   └── DisputeActions.jsx
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   └── TabNavigation.jsx
│   │   └── common/
│   │       └── EmptyState.jsx
│   ├── hooks/
│   │   └── useEscrowContract.jsx
│   ├── config/
│   │   └── contract.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── public/
├── package.json
└── vite.config.js
```

## Security Best Practices

1. **Always verify addresses** - Double-check freelancer/client addresses
2. **Test on testnet first** - Use Goerli, Sepolia before mainnet
3. **Review amounts** - Verify ETH amounts before submitting
4. **IPFS for work** - Use IPFS for immutable work storage
5. **Keep keys safe** - Never share private keys or seed phrases
6. **Check contract** - Verify contract address matches deployment

## Troubleshooting

### MetaMask Issues
**Problem**: Wallet won't connect
- **Solution**:
  - Refresh page
  - Check MetaMask is unlocked
  - Ensure you're on correct network
  - Try resetting account (Settings → Advanced → Reset Account)

### Transaction Failures
**Problem**: Transaction reverts
- **Causes**:
  - Insufficient gas
  - Not correct party (client/freelancer)
  - Milestone not in correct state
  - Previous milestone not released
- **Solution**: Check error message, verify your role and milestone status

### Jobs Not Showing
**Problem**: Created job doesn't appear
- **Solution**:
  - Wait for transaction confirmation
  - Click "Refresh" button
  - Check correct wallet is connected
  - Verify transaction on block explorer

### IPFS Links Not Loading
**Problem**: Submitted work link doesn't work
- **Solution**:
  - Use public IPFS gateway
  - Try: ipfs.io, cloudflare-ipfs.com, dweb.link
  - Ensure CID is correct format (starts with Qm or bafy)

## Development

### Run development server:
```bash
npm run dev
```

### Build for production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

### Lint code:
```bash
npm run lint
```

## Future Enhancements

Potential improvements:
- Multi-signature wallet support
- Escrow insurance/bonding
- Rating/reputation system
- ENS name support
- Multi-chain support
- Gas optimization
- Batch operations
- Email notifications
- Chat system

## Contributing

To contribute:
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License

## Contact & Support

For issues:
1. Check this guide
2. Review smart contract documentation
3. Check MetaMask connection
4. Verify contract address
5. Test on testnet first

---

**Built with blockchain technology for transparent, trustless freelance payments.**
