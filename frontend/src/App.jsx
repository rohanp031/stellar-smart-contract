import React, { useState, useEffect } from 'react';
// We'll use a simple loading spinner component
const Spinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

// --- Main App Component ---
export default function App() {
  // --- State ---
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState(null); // Will hold project data from contract
  const [error, setError] = useState(null);

  // --- Mock Data & Handlers ---
  // In a real app, this would come from a contract call
  const MOCK_PROJECT = {
    creator: 'GC...CREATOR',
    token: 'USDC-T...ASSET',
    goal: 10000,
    raised: 4500,
    deadline: '12/31/2025',
    goal_met: false,
    milestones: [
      { id: 0, title: 'Prototype Development', amount_to_release: 2500, is_complete: false, votes: 1200 },
      { id: 1, title: 'External Audit', amount_to_release: 1500, is_complete: false, votes: 0 },
      { id: 2, title: 'Mainnet Launch', amount_to_release: 6000, is_complete: false, votes: 0 },
    ],
  };

  // --- Effects ---
  useEffect(() => {
    // On load, try to fetch project data
    fetchProjectData();
  }, []);

  // --- Functions ---
  
  // Mock function to "connect" to the Freighter wallet
  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, you'd use:
      // await freighter.connect();
      // const address = freighter.getPublicKey();
      await new Promise(res => setTimeout(res, 1000)); // Simulate connection delay
      const mockAddress = 'GB...USER...WALLET';
      setWalletAddress(mockAddress);
      setIsConnected(true);
    } catch (e) {
      setError('Could not connect to wallet.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock function to fetch project state from the blockchain
  const fetchProjectData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, you'd use soroban-client to make a read-only
      // call to the contract's `get_project` function.
      await new Promise(res => setTimeout(res, 1500)); // Simulate network delay
      setProject(MOCK_PROJECT);
    } catch (e) {
      setError('Failed to fetch project data.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock function to call the `fund` contract function
  const handleFundProject = async (amount) => {
    if (!isConnected) {
      setError('Please connect your wallet first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    alert(`
      --- SIMULATION ---
      Calling 'fund' contract function with:
      Amount: ${amount}
      Backer: ${walletAddress}
      
      This would open Freighter wallet for transaction signing.
    `);
    await new Promise(res => setTimeout(res, 2000)); // Simulate transaction
    // After "success", we'd refetch the project data
    // For this mock, we'll just update the UI optimistically
    setProject(prev => ({
      ...prev,
      raised: prev.raised + amount,
    }));
    setIsLoading(false);
  };
  
  // Mock function to call the `vote` contract function
  const handleVoteMilestone = async (milestoneId) => {
    if (!isConnected) {
      setError('Please connect your wallet first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    alert(`
      --- SIMULATION ---
      Calling 'vote' contract function for:
      Milestone ID: ${milestoneId}
      Backer: ${walletAddress}
      
      This would open Freighter wallet for transaction signing.
    `);
    await new Promise(res => setTimeout(res, 2000)); // Simulate transaction
    setIsLoading(false);
    // You would then refetch data to see the new vote count
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <Header
        isConnected={isConnected}
        walletAddress={walletAddress}
        onConnect={handleConnect}
        isLoading={isLoading}
      />
      <main className="container mx-auto p-6">
        <h1 className="text-4xl font-bold text-center text-purple-400 mb-8">
          MilestoneFund
        </h1>
        <p className="text-center text-lg text-gray-300 mb-12">
          A decentralized crowdfunding platform on the Stellar Network.
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* We would also have a "Create Project" form here */}
        {/* <CreateProjectForm /> */}

        {/* Display Project */}
        {!project && isLoading && (
          <div className="flex justify-center items-center h-64">
            <Spinner />
            <span className="ml-3 text-lg">Loading Project Data...</span>
          </div>
        )}
        
        {project && (
          <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <ProjectCard project={project} onFund={handleFundProject} />
            <MilestoneList
              milestones={project.milestones}
              onVote={handleVoteMilestone}
              totalRaised={project.raised}
            />
          </div>
        )}
      </main>
    </div>
  );
}

// --- Sub-Components ---

function Header({ isConnected, walletAddress, onConnect, isLoading }) {
  return (
    <header className="p-4 bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
      <nav className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-semibold">
          <span className="text-purple-400">Milestone</span>Fund
        </div>
        <button
          onClick={onConnect}
          disabled={isConnected || isLoading}
          className={`
            px-6 py-2 rounded-lg font-medium text-white transition-all duration-300
            ${isConnected ? 'bg-green-600 cursor-default' : 'bg-purple-600 hover:bg-purple-700'}
            ${isLoading ? 'bg-gray-500' : ''}
          `}
        >
          {isLoading ? (
            <Spinner />
          ) : isConnected ? (
            <span className="truncate w-32">{walletAddress.substring(0, 4)}...{walletAddress.substring(walletAddress.length - 4)}</span>
          ) : (
            'Connect Wallet'
          )}
        </button>
      </nav>
    </header>
  );
}

function ProjectCard({ project, onFund }) {
  const [fundAmount, setFundAmount] = useState(100);
  const progress = Math.min((project.raised / project.goal) * 100, 100);

  const handleSubmit = (e) => {
    e.preventDefault();
    onFund(Number(fundAmount));
  };

  return (
    <div className="p-8 border-b border-gray-700">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Info */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-2 text-purple-300">Project: Mainnet Launch</h2>
          <p className="text-gray-400 mb-4">
            Created by: <span className="font-mono text-sm">{project.creator}</span>
          </p>
          <div className="text-lg mb-6">
            <p>Raising <span className="font-bold text-xl text-white">{project.goal}</span> {project.token}</p>
            <p>Deadline: <span className="font-bold text-white">{project.deadline}</span></p>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm font-medium mb-1">
              <span>{project.raised} {project.token} Raised</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-purple-500 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Right: Funding */}
        <div className="w-full md:w-1/3">
          <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4 text-center">Fund This Project</h3>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
              Amount ({project.token})
            </label>
            <input
              type="number"
              id="amount"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              min="1"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="w-full mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-lg transition-all"
            >
              Fund Project
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function MilestoneList({ milestones, onVote, totalRaised }) {
  return (
    <div className="p-8">
      <h3 className="text-3xl font-semibold mb-6">Milestones</h3>
      <div className="space-y-6">
        {milestones.map((milestone) => (
          <MilestoneItem
            key={milestone.id}
            milestone={milestone}
            onVote={onVote}
            totalRaised={totalRaised}
          />
        ))}
      </div>
    </div>
  );
}

function MilestoneItem({ milestone, onVote, totalRaised }) {
  const voteProgress = totalRaised > 0 ? (milestone.votes / (totalRaised / 2)) * 100 : 0;
  const isApproved = voteProgress >= 100;
  
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 flex flex-col md:flex-row justify-between items-start">
      <div className="flex-1 mb-4 md:mb-0">
        <h4 className="text-xl font-bold text-purple-300">{milestone.title}</h4>
        <p className="text-gray-400">Release Amount: <span className="font-medium text-white">{milestone.amount_to_release}</span></p>
        <p className="text-gray-400">Status: 
          <span className={`font-medium ml-2 ${milestone.is_complete ? 'text-green-400' : 'text-yellow-400'}`}>
            {milestone.is_complete ? 'Completed & Paid' : 'Pending'}
          </span>
        </p>
      </div>
      
      {!milestone.is_complete && (
        <div className="w-full md:w-1/2">
          <div className="mb-2">
            <span className="text-sm">Approval Votes: {milestone.votes} / {totalRaised / 2} (50% threshold)</span>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full ${isApproved ? 'bg-green-500' : 'bg-purple-500'}`}
                style={{ width: `${Math.min(voteProgress, 100)}%` }}
              ></div>
            </div>
          </div>
          <button
            onClick={() => onVote(milestone.id)}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all"
          >
            Vote to Approve
          </button>
        </div>
      )}
    </div>
  );
}