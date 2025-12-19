import { Briefcase, Wallet } from "lucide-react";

export default function Header({ account, onConnect, isConnected }) {
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand">
          <Briefcase size={32} className="brand-icon" />
          <div>
            <h1>FreelanceEscrow</h1>
            <p>Secure milestone-based payments on blockchain</p>
          </div>
        </div>

        <button
          className={`connect-btn flex items-center gap-2 ${
            isConnected ? "bg-green-600 hover:bg-green-700" : ""
          }`}
          onClick={onConnect}
        >
          <Wallet size={18} />
          {isConnected ? formatAddress(account) : "Connect Wallet"}
        </button>
      </div>
    </header>
  );
}
