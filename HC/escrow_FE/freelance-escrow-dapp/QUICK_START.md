# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js v16+ installed
- MetaMask browser extension
- A local blockchain (Hardhat/Ganache) OR testnet access

### Step 1: Install Dependencies
```bash
cd /home/akshaya/HC/escrow_FE/freelance-escrow-dapp
npm install
```

### Step 2: Configure Contract Address
Edit `src/config/contract.jsx`:
```javascript
export const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE";
```

### Step 3: Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Step 4: Connect Wallet
1. Open the app in your browser
2. Click "Connect Wallet" in the header
3. Approve MetaMask connection
4. Ensure you're on the correct network

### Step 5: Create Your First Job
1. Go to "Create Job" tab
2. Fill in:
   - Job Title: "Test Website Project"
   - Description: "Build a landing page"
   - Freelancer Address: (use another account address)
   - Milestone 1: "Design mockup" - 0.1 ETH
   - Milestone 2: "Development" - 0.2 ETH
3. Click "Create Job & Deposit Funds"
4. Approve transaction in MetaMask
5. Wait for confirmation
6. You'll see Job ID in success message

### Step 6: Test as Freelancer
1. Switch MetaMask to the freelancer account
2. Refresh the app or reconnect wallet
3. Go to "My Jobs" tab
4. Click on the job you created
5. Click "Submit Work" on Milestone 1
6. Enter an IPFS CID (e.g., "QmTest123...")
7. Submit transaction
8. Wait for confirmation

### Step 7: Test as Client (Approve)
1. Switch back to client account
2. Refresh or reconnect
3. Open the job from "My Jobs"
4. See the submitted work
5. Click "Approve"
6. Confirm transaction
7. Freelancer receives payment!

## 🎯 What You Can Do

### As Client
- ✅ Create jobs with multiple milestones
- ✅ Review submitted work (IPFS links)
- ✅ Approve and release payments
- ✅ Reject work with feedback
- ✅ Raise disputes
- ✅ Cancel jobs (before work submission)

### As Freelancer
- ✅ View assigned jobs
- ✅ Submit work with IPFS CIDs
- ✅ Resubmit if rejected
- ✅ Auto-approve after 7 days
- ✅ Raise disputes

### As Arbiter
- ✅ View all disputes
- ✅ Review dispute details
- ✅ Resolve with custom split
- ✅ Set client refund %
- ✅ Set freelancer payment %
- ✅ Platform keeps remainder

## 📋 Test Scenarios

### Scenario 1: Happy Path
```
1. Client creates job with 2 milestones
2. Freelancer submits work for M1
3. Client approves M1
4. Freelancer submits work for M2
5. Client approves M2
6. Job completed! ✅
```

### Scenario 2: Rejection & Resubmit
```
1. Client creates job
2. Freelancer submits work
3. Client rejects with reason
4. Freelancer resubmits
5. Client approves
6. Payment released ✅
```

### Scenario 3: Auto-Approve
```
1. Client creates job
2. Freelancer submits work
3. Wait 7+ days (or adjust time in tests)
4. Freelancer clicks "Auto-Approve"
5. Payment released automatically ✅
```

### Scenario 4: Dispute
```
1. Client creates job
2. Freelancer submits work
3. Client unfairly rejects
4. Freelancer raises dispute (0.01 ETH)
5. Arbiter reviews
6. Arbiter resolves (e.g., 50% client, 50% freelancer)
7. Funds distributed ✅
```

### Scenario 5: Cancellation
```
1. Client creates job
2. No work submitted yet
3. Client cancels job
4. Full refund issued ✅
```

## 🛠️ Common Issues

### Issue: "Please connect your wallet"
**Solution:** Click "Connect Wallet" and approve MetaMask

### Issue: "Contract not initialized"
**Solution:** Check CONTRACT_ADDRESS in `src/config/contract.jsx`

### Issue: "Transaction failed"
**Possible causes:**
- Insufficient gas
- Wrong network
- Not authorized (wrong role)
- Milestone prerequisites not met

### Issue: Jobs not showing
**Solution:** 
- Click Refresh button
- Check correct wallet connected
- Verify contract address is correct

### Issue: MetaMask not connecting
**Solution:**
- Refresh page
- Unlock MetaMask
- Check correct network selected
- Try resetting account in MetaMask

## 📁 Important Files

```
src/
├── App.jsx                           - Main app
├── hooks/useEscrowContract.jsx      - Contract logic
├── config/contract.jsx               - Contract address & ABI
├── components/
│   ├── jobs/
│   │   ├── CreateJobForm.jsx        - Create jobs
│   │   ├── MyJobs.jsx               - View jobs
│   │   ├── JobDetailModal.jsx       - Job details
│   │   └── MilestoneActions.jsx     - Submit/Approve/Reject
│   └── disputes/
│       ├── DisputeManagement.jsx    - Dispute resolution
│       └── DisputeActions.jsx       - Raise disputes
└── utils/helpers.js                  - Utility functions
```

## 🔗 Network Setup

### Local Network (Hardhat)
```bash
# In your smart contract project
npx hardhat node
# Deploy contract
npx hardhat run scripts/deploy.js --network localhost
# Copy deployed address to contract.jsx
```

### Testnet (Sepolia Example)
1. Get Sepolia ETH from faucet
2. Deploy contract to Sepolia
3. Update CONTRACT_ADDRESS
4. Switch MetaMask to Sepolia network
5. Test app

## 📚 Documentation

- **PROJECT_GUIDE.md** - Complete user guide
- **IMPLEMENTATION_SUMMARY.md** - Technical details
- **COMPONENT_ARCHITECTURE.md** - Architecture docs
- **FILES_MODIFIED.md** - What was built

## 🎓 Learn More

### About the Smart Contract
- Location: `/home/akshaya/HC/freelance_escrow/src/freelance_new.sol`
- Features:
  - Milestone-based escrow
  - IPFS work submission
  - Auto-approve (7 days)
  - Dispute resolution
  - 0.01 ETH dispute fee

### Key Technologies
- **React 19** - UI framework
- **Ethers.js v6** - Blockchain interaction
- **Vite** - Build tool
- **Solidity 0.8.20** - Smart contract

## 🤝 Support

### If You Get Stuck
1. Check QUICK_START.md (this file)
2. Review PROJECT_GUIDE.md
3. Check console for errors (F12)
4. Verify contract address
5. Ensure correct network
6. Try on testnet first

### Debug Mode
```javascript
// In browser console
console.log(window.ethereum); // Check MetaMask
localStorage.clear(); // Clear cached data
```

## ✅ Checklist Before Using

- [ ] Node.js installed
- [ ] MetaMask installed
- [ ] Contract deployed
- [ ] CONTRACT_ADDRESS updated
- [ ] npm install complete
- [ ] Development server running
- [ ] Wallet connected
- [ ] Correct network selected
- [ ] Have test ETH

## 🎉 You're Ready!

Now you can:
1. Create jobs as a client
2. Submit work as a freelancer
3. Manage disputes as parties
4. Resolve disputes as arbiter

**Happy escrow-ing!** 🚀

---

Need help? Check the detailed guides:
- User workflows: PROJECT_GUIDE.md
- Technical details: IMPLEMENTATION_SUMMARY.md
- Architecture: COMPONENT_ARCHITECTURE.md
