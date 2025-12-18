import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import Header from '../components/Header'
import JobList from '../components/JobList'
import CreateJobForm from '../components/CreateJobForm'

export default function Dashboard() {
  const { account } = useWallet()
  const [view, setView] = useState('jobs')
  const [jobs, setJobs] = useState([])

  if (!account) {
    return <div className="min-h-screen flex items-center justify-center">Connect Wallet</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Header account={account} view={view} setView={setView} />
      {view === 'jobs' && <JobList jobs={jobs} onSelect={()=>{}} />}
      {view === 'create' && <CreateJobForm onSubmit={()=>{}} />}
    </div>
  )
}
