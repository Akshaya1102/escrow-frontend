import { useState } from "react";
import { Briefcase, FileText, Shield } from "lucide-react";

import Header from "./components/layout/Header";
import TabNavigation from "./components/layout/TabNavigation";
import CreateJobForm from "./components/jobs/CreateJobForm";
import MyJobs from "./components/jobs/MyJobs";
import DisputeManagement from "./components/disputes/DisputeManagement";
import { useEscrowContract } from "./hooks/useEscrowContract";

import "./index.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("create");
  const escrowContract = useEscrowContract();

  const handleConnect = async () => {
    try {
      await escrowContract.connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert(error.message || "Failed to connect wallet");
    }
  };

  return (
    <>
      <Header
        account={escrowContract.account}
        onConnect={handleConnect}
        isConnected={escrowContract.isConnected}
      />

      <TabNavigation
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "create", label: "Create Job", icon: <Briefcase size={18} /> },
          { id: "myjobs", label: "My Jobs", icon: <FileText size={18} /> },
          { id: "disputes", label: "Disputes", icon: <Shield size={18} /> },
        ]}
      />

      <main className="app-container">
        {activeTab === "create" && (
          <div className="card">
            <CreateJobForm
              escrowContract={escrowContract}
              onJobCreated={() => setActiveTab("myjobs")}
            />
          </div>
        )}

        {activeTab === "myjobs" && (
          <div className="card">
            <MyJobs
              escrowContract={escrowContract}
            />
          </div>
        )}

        {activeTab === "disputes" && (
          <div className="card">
            <DisputeManagement
              escrowContract={escrowContract}
            />
          </div>
        )}
      </main>
    </>
  );
}
