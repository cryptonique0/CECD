import React, { useState, useEffect } from "react";
import { useWallet } from "../contexts/WalletContext";

interface Proposal {
  id: number;
  title: string;
  description: string;
  amount: string;
  recipient: string;
  approvals: number;
  requiredApprovals: number;
  executed: boolean;
  proposer: string;
}

const MultiSigWallet: React.FC = () => {
  const { account } = useWallet();
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: 1,
      title: "Emergency Medical Supplies",
      description: "Purchase medical supplies for disaster relief",
      amount: "500",
      recipient: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      approvals: 2,
      requiredApprovals: 3,
      executed: false,
      proposer: "0x1234...5678",
    },
    {
      id: 2,
      title: "Temporary Shelter Construction",
      description: "Build temporary shelters for displaced families",
      amount: "2000",
      recipient: "0x9876...4321",
      approvals: 3,
      requiredApprovals: 3,
      executed: true,
      proposer: "0xabcd...efgh",
    },
  ]);

  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
    amount: "",
    recipient: "",
  });

  const [showCreateForm, setShowCreateForm] = useState(false);

  const createProposal = () => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    if (!newProposal.title || !newProposal.amount || !newProposal.recipient) {
      alert("Please fill all required fields");
      return;
    }

    const proposal: Proposal = {
      id: proposals.length + 1,
      title: newProposal.title,
      description: newProposal.description,
      amount: newProposal.amount,
      recipient: newProposal.recipient,
      approvals: 1,
      requiredApprovals: 3,
      executed: false,
      proposer: account,
    };

    setProposals([proposal, ...proposals]);
    setNewProposal({ title: "", description: "", amount: "", recipient: "" });
    setShowCreateForm(false);
  };

  const approveProposal = (id: number) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    setProposals(
      proposals.map((p) =>
        p.id === id && p.approvals < p.requiredApprovals ? { ...p, approvals: p.approvals + 1 } : p
      )
    );
  };

  const executeProposal = (id: number) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    const proposal = proposals.find((p) => p.id === id);
    if (!proposal) return;

    if (proposal.approvals < proposal.requiredApprovals) {
      alert("Not enough approvals to execute");
      return;
    }

    setProposals(proposals.map((p) => (p.id === id ? { ...p, executed: true } : p)));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Multi-Signature Emergency Fund</h3>
          <p className="text-sm text-gray-600 mt-1">Secure fund management requiring multiple approvals</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {showCreateForm ? "Cancel" : "New Proposal"}
        </button>
      </div>

      {/* Fund Balance */}
      <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
        <p className="text-sm opacity-90">Total Fund Balance</p>
        <p className="text-3xl font-bold mt-1">5,000 CELO</p>
        <p className="text-xs opacity-75 mt-2">≈ $5,000 USD</p>
      </div>

      {/* Create Proposal Form */}
      {showCreateForm && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
          <h4 className="font-semibold">Create New Proposal</h4>
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={newProposal.title}
              onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Emergency Medical Supplies"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={newProposal.description}
              onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
              placeholder="Detailed description of the proposal..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount (CELO) *</label>
            <input
              type="number"
              value={newProposal.amount}
              onChange={(e) => setNewProposal({ ...newProposal, amount: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Recipient Address *</label>
            <input
              type="text"
              value={newProposal.recipient}
              onChange={(e) => setNewProposal({ ...newProposal, recipient: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
              placeholder="0x..."
            />
          </div>
          <button
            onClick={createProposal}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Submit Proposal
          </button>
        </div>
      )}

      {/* Proposals List */}
      <div className="space-y-4">
        <h4 className="font-semibold">Active & Recent Proposals</h4>
        {proposals.map((proposal) => (
          <div
            key={proposal.id}
            className={`p-4 rounded-lg border-2 ${
              proposal.executed
                ? "bg-gray-50 border-gray-300"
                : "bg-white border-blue-200"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h5 className="font-semibold">{proposal.title}</h5>
                <p className="text-sm text-gray-600 mt-1">{proposal.description}</p>
              </div>
              {proposal.executed && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
                  Executed ✓
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
              <div>
                <span className="text-gray-600">Amount:</span>
                <span className="ml-2 font-semibold">{proposal.amount} CELO</span>
              </div>
              <div>
                <span className="text-gray-600">Proposer:</span>
                <span className="ml-2 font-mono text-xs">{proposal.proposer}</span>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Approvals</span>
                <span className="font-semibold">
                  {proposal.approvals}/{proposal.requiredApprovals}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    proposal.approvals >= proposal.requiredApprovals ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${(proposal.approvals / proposal.requiredApprovals) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="text-xs text-gray-600 mb-3">
              <strong>Recipient:</strong> {proposal.recipient}
            </div>

            {!proposal.executed && (
              <div className="flex gap-2">
                <button
                  onClick={() => approveProposal(proposal.id)}
                  disabled={proposal.approvals >= proposal.requiredApprovals}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  Approve
                </button>
                <button
                  onClick={() => executeProposal(proposal.id)}
                  disabled={proposal.approvals < proposal.requiredApprovals}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  Execute
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiSigWallet;
