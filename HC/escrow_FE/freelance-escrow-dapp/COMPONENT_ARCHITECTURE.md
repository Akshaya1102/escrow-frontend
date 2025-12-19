# Component Architecture

## Component Hierarchy

```
App.jsx (Root)
├── useEscrowContract() hook
├── Header
│   └── Connect Wallet Button
│
├── TabNavigation
│   ├── Create Job Tab
│   ├── My Jobs Tab
│   └── Disputes Tab
│
└── Main Content (conditional rendering based on active tab)
    │
    ├── [Create Job Tab]
    │   └── CreateJobForm
    │       ├── Title Input
    │       ├── Description Textarea
    │       ├── Freelancer Address Input
    │       ├── Milestones (dynamic array)
    │       │   ├── Milestone 1 (description + amount)
    │       │   ├── Milestone 2
    │       │   └── Add/Remove buttons
    │       └── Submit Button
    │
    ├── [My Jobs Tab]
    │   └── MyJobs
    │       ├── Filter Buttons (all/active/completed/disputed/cancelled)
    │       ├── Refresh Button
    │       ├── Job List
    │       │   ├── JobCard (client job 1)
    │       │   ├── JobCard (client job 2)
    │       │   ├── JobCard (freelancer job 1)
    │       │   └── ...
    │       │
    │       └── JobDetailModal (when job clicked)
    │           ├── Job Info (title, description, parties)
    │           ├── Amounts (total, released, remaining)
    │           ├── Milestone List
    │           │   └── For each milestone:
    │           │       ├── Milestone Info
    │           │       ├── MilestoneActions
    │           │       │   ├── [Freelancer] Submit Work
    │           │       │   ├── [Freelancer] Auto-Approve
    │           │       │   ├── [Client] Approve
    │           │       │   └── [Client] Reject
    │           │       │
    │           │       └── DisputeActions
    │           │           └── [Both] Raise Dispute
    │           │
    │           └── [Client Only] Cancel Job Button
    │
    └── [Disputes Tab]
        └── DisputeManagement
            ├── Dispute List
            │   └── For each dispute:
            │       ├── Job Info
            │       ├── Dispute Details
            │       ├── Initiator & Date
            │       └── [Arbiter Only] Resolution Controls
            │           ├── Client Refund Slider
            │           ├── Freelancer Payment Slider
            │           ├── Platform Fee Display
            │           └── Confirm Button
            │
            └── Empty State (if no disputes)
```

## Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
useEscrowContract Hook Function
    ↓
Ethers.js → Smart Contract
    ↓
Transaction Sent
    ↓
Wait for Confirmation
    ↓
Update UI / Refresh Data
    ↓
Display Result to User
```

## State Management

### Global State (via useEscrowContract hook)
- `provider` - Ethers provider instance
- `signer` - Connected wallet signer
- `contract` - Contract instance
- `account` - Connected wallet address
- `isConnected` - Connection status
- `isLoading` - Transaction loading state
- `error` - Error messages

### Component-Level State
- **CreateJobForm**: Form data (title, description, freelancer, milestones)
- **MyJobs**: jobs array, filter, selectedJob, loading, error
- **JobDetailModal**: Modal open/close state
- **MilestoneActions**: Form inputs (CID, reject reason), loading states
- **DisputeActions**: Dispute form data, loading
- **DisputeManagement**: disputes array, resolution percentages

## Component Responsibilities

### Presentational Components
- **JobCard**: Display job summary
- **Header**: Display brand and wallet button
- **TabNavigation**: Display tabs and handle switching
- **EmptyState**: Display empty states

### Container Components
- **App**: Route between tabs, manage wallet connection
- **MyJobs**: Fetch and filter jobs
- **DisputeManagement**: Fetch and display disputes

### Form Components
- **CreateJobForm**: Handle job creation
- **MilestoneActions**: Handle milestone operations
- **DisputeActions**: Handle dispute raising

### Modal Components
- **JobDetailModal**: Display full job details

## Hook Architecture

### useEscrowContract
```javascript
{
  // State
  provider, signer, contract,
  account, isConnected, isLoading, error,

  // Wallet
  connectWallet(), disconnectWallet(),

  // Write Functions
  createJob(), submitWork(), approveMilestone(),
  rejectMilestone(), autoApproveMilestone(),
  raiseDispute(), resolveDispute(), cancelJob(),

  // Read Functions
  getJob(), getMilestone(), getDispute(),
  getJobCount(), getUserJobs()
}
```

## Smart Contract Integration Points

| Component | Contract Functions Used |
|-----------|------------------------|
| CreateJobForm | createJob() |
| MilestoneActions | submitWork(), approveMilestone(), rejectMilestone(), autoApproveMilestone() |
| DisputeActions | raiseDispute() |
| DisputeManagement | resolveDispute(), getDispute() |
| MyJobs | getUserJobs() (uses getJob, getMilestone internally) |
| JobDetailModal | cancelJob() |

## Event Flow Examples

### Example 1: Create Job
```
1. User fills form in CreateJobForm
2. Click "Create Job & Deposit Funds"
3. CreateJobForm validates inputs
4. Calls escrowContract.createJob(...)
5. useEscrowContract sends transaction
6. MetaMask pops up for approval
7. User approves transaction
8. Wait for blockchain confirmation
9. Parse JobCreated event for jobId
10. Show success message with jobId
11. Reset form
12. Switch to My Jobs tab
```

### Example 2: Submit Work
```
1. User opens JobDetailModal
2. Clicks "Submit Work" in MilestoneActions
3. Form appears for IPFS CID input
4. User enters CID and clicks Submit
5. MilestoneActions validates CID
6. Calls escrowContract.submitWork(jobId, milestoneId, cid)
7. Transaction sent and confirmed
8. Success message shown
9. Refresh job data (onActionComplete callback)
10. Modal updates to show submitted work
```

### Example 3: Raise Dispute
```
1. User views milestone in JobDetailModal
2. Clicks "Raise Dispute" in DisputeActions
3. Form expands for dispute reason
4. User enters detailed reason
5. Clicks "Submit Dispute (0.01 ETH)"
6. DisputeActions validates reason length
7. Calls escrowContract.raiseDispute(jobId, milestoneId, reason)
8. Transaction sent with 0.01 ETH
9. Confirmation received
10. Job status updates to "disputed"
11. Dispute appears in Disputes tab
```

## Component Communication

### Parent → Child (Props)
- App → All tabs: `escrowContract` (hook instance)
- MyJobs → JobCard: `job`, `currentAccount`, `status`
- MyJobs → JobDetailModal: `job`, `escrowContract`, `onClose`, `onJobUpdated`
- JobDetailModal → MilestoneActions: `job`, `milestone`, `milestoneIndex`, `escrowContract`, `onActionComplete`

### Child → Parent (Callbacks)
- CreateJobForm → App: `onJobCreated()` - Switch to My Jobs tab
- JobDetailModal → MyJobs: `onJobUpdated()` - Refresh job list
- MilestoneActions → JobDetailModal: `onActionComplete()` - Refresh job data
- DisputeActions → JobDetailModal: `onActionComplete()` - Refresh job data

## Styling Architecture

### CSS Organization
```
index.css
├── Global Resets
├── Layout (containers, spacing)
├── Header & Navigation
├── Cards & Modals
├── Forms & Inputs
├── Buttons & States
├── Animations
└── Utility Classes
```

### Inline Utility Classes (Tailwind-style)
- Spacing: `p-4`, `m-2`, `gap-3`
- Colors: `bg-blue-600`, `text-white`
- Layout: `flex`, `grid`, `items-center`
- Borders: `rounded-lg`, `border`
- Typography: `font-bold`, `text-sm`

## Error Handling Flow

```
User Action
    ↓
Try Block
    ↓
Contract Function Call
    ↓
[Success]                [Error]
    ↓                        ↓
Show Success          Catch Block
    ↓                        ↓
Update UI            Parse Error Message
    ↓                        ↓
Callback              Show User-Friendly Error
                            ↓
                      Log to Console
```

## Loading States

### Global Loading
- `escrowContract.isLoading` - General contract loading

### Component Loading
- `isSubmitting` - Form submission
- `isLoading` - Data fetching
- Button disabled states
- Spinner animations

## Validation Layers

1. **Client-Side (UI)**
   - Required fields
   - Input formats (address, numbers)
   - IPFS CID format
   - Minimum character counts

2. **Contract-Side**
   - Address validation
   - Amount checks
   - State verification
   - Role authorization

---

This architecture provides:
- Clear separation of concerns
- Unidirectional data flow
- Reusable components
- Predictable state management
- Easy testing and maintenance
