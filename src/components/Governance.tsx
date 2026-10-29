import React, { useState, useEffect } from "react";
import { WhitepaperContent } from "./WhitepaperContent";
import { useAuth } from "../context/AuthContext";
import { AdminRegistryTab } from "./AdminRegistryTab";
import { AdminUsersTab } from "./AdminUsersTab";
import {
  Shield,
  ExternalLink,
  CheckCircle2,
  Clock,
  Vote,
  FileText,
  PieChart,
  Copy,
  Check,
  RefreshCw,
  Database,
  Server,
  Users,
} from "lucide-react";

interface DaoStats {
  dao_address: string;
  network: string;
  treasury_eth: number;
  treasury_usd: number;
  voting_system: string;
  approval_threshold_pct: number;
  quorum_pct: number;
  active_proposals_count: number;
  total_proposals_count: number;
  block_height: number;
  aragon_app_url: string;
  etherscan_url: string;
  postgres_sync: {
    host: string;
    database: string;
    schema: string;
    tables: string[];
    cron_schedule: string;
    status: string;
  };
  last_synced_at: string;
}

interface ProposalVoter {
  voter: string;
  name: string;
  vote: "YES" | "NO" | "PENDING";
  power: string;
}

interface ProposalItem {
  id: string;
  proposalIndex: number;
  title: string;
  description: string;
  creator: string;
  creatorName: string;
  status: "ACTIVE" | "PASSED" | "EXECUTED" | "REJECTED";
  yesVotes: number;
  noVotes: number;
  totalVotingPower: number;
  approvalPct: number;
  quorumPct: number;
  quorumReached: boolean;
  startDate: string;
  endDate: string;
  aragonUrl: string;
  txHash?: string;
  postgresSynced: boolean;
  voters: ProposalVoter[];
}

export const Governance: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = Boolean(
    user?.is_admin ||
    user?.email?.toLowerCase() === "me@simonhavlik.com" ||
    user?.wallet_address?.toLowerCase() === "0x14f10a865e277c0b1949e18dd9856602db11742b" ||
    user?.wallet_address?.toLowerCase() === "0x9b64203878f24eb0cdf55c8c6fa7d08ba0cf77e5"
  );

  const [activeSubTab, setActiveSubTab] = useState<"dao" | "whitepaper" | "charter" | "registry" | "users">("dao");
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [stats, setStats] = useState<DaoStats | null>(null);
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const daoAddress = "0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a";

  const fetchGovernanceData = async () => {
    try {
      const [statsRes, propsRes] = await Promise.all([
        fetch("/api/governance/stats"),
        fetch("/api/governance/proposals"),
      ]);

      if (statsRes.ok) {
        const statsData = (await statsRes.json()) as DaoStats;
        setStats(statsData);
      }

      if (propsRes.ok) {
        const propsData = (await propsRes.json()) as any;
        if (propsData && propsData.proposals) {
          setProposals(propsData.proposals);
        }
      }
    } catch (err) {
      console.error("Failed to load governance telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGovernanceData();
  }, []);

  const triggerSync = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await fetch("/api/governance/sync", { method: "POST" });
      const data = (await res.json()) as any;
      if (res.ok) {
        setSyncFeedback(
          `Synced Sepolia block #${data.block_number} (${data.treasury_eth} ETH) · Persisted to PostgreSQL on managed PostgreSQL (verxl.dao_stats & verxl.proposals)`
        );
        await fetchGovernanceData();
      } else {
        setSyncFeedback("Sync failed: " + (data.error || "RPC unavailable"));
      }
    } catch {
      setSyncFeedback("Sync failed: network timeout");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncFeedback(null), 8000);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Fallback defaults if initial network call is loading
  const treasuryEth = stats ? stats.treasury_eth : 0.04;
  const treasuryUsd = stats ? stats.treasury_usd : 106.0;
  const blockHeight = stats ? stats.block_height : 7900000;
  const activeCount = stats ? stats.active_proposals_count : 2;

  return (
    <div className="mobile-compact space-y-3.5">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.2 rounded-[2px] bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-400 mb-1 uppercase tracking-wider">
          <Shield className="w-3 h-3" />
          <span>ON-CHAIN GOVERNANCE · SEPOLIA TESTNET</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Aragon OSx DAO & Protocol Specification
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Decentralized ownership, on-chain proposals, and automated persistence to managed PostgreSQL telemetry via Cloudflare Hyperdrive.
        </p>
      </div>

      {/* Sepolia Test Run Notice */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-[3px] p-2.5 font-mono text-xs text-amber-300 flex items-start gap-2.5">
        <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold text-amber-300 tracking-wider uppercase text-[10px] flex items-center gap-2">
            <span>Sepolia Testnet DAO Deployment</span>
            <span className="px-1.5 py-0.2 rounded-[2px] bg-amber-500/20 text-amber-400 text-[9px]">
              SEPOLIA TESTNET
            </span>
          </div>
          <p className="text-slate-300 text-[10.5px] leading-relaxed">
            The Aragon OSx DAO vault (<code className="text-[#b8f6dd]">0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a</code>) and proposals VIP-1, VIP-2, VIP-3 are live on the Ethereum Sepolia testnet as an academic demonstration started as an academic university project at Prague University of Economics and Business (VŠE Praha). All votes, telemetry, and treasury actions are continuously synced into managed PostgreSQL telemetry via Cloudflare Hyperdrive.
          </p>
        </div>
      </div>

      {/* Sub-navigation tabs — Hairline sharp tabs */}
      <div className="flex border-b border-slate-800 gap-1 pb-1 font-mono text-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("dao")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] uppercase tracking-wider font-medium text-[11px] transition whitespace-nowrap ${
            activeSubTab === "dao"
              ? "bg-blue-600 text-white shadow-sm border border-blue-400/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Vote className="w-3.5 h-3.5" />
          <span>Live DAO Governance</span>
        </button>

        <button
          onClick={() => setActiveSubTab("whitepaper")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] uppercase tracking-wider font-medium text-[11px] transition whitespace-nowrap ${
            activeSubTab === "whitepaper"
              ? "bg-blue-600 text-white shadow-sm border border-blue-400/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Institutional Whitepaper</span>
        </button>

        <button
          onClick={() => setActiveSubTab("charter")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] uppercase tracking-wider font-medium transition whitespace-nowrap text-[11px] ${
            activeSubTab === "charter"
              ? "bg-blue-600 text-white shadow-sm border border-blue-400/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Founders' Charter (MoA)</span>
        </button>

        {/* ADMIN TAB 4: REGISTRY (Strictly visible only to Šimon / Admin) */}
        {isAdmin && (
          <button
            onClick={() => setActiveSubTab("registry")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] uppercase tracking-wider font-medium transition whitespace-nowrap text-[11px] ${
              activeSubTab === "registry"
                ? "bg-purple-600 text-white shadow-sm border border-purple-400/50"
                : "text-purple-300 hover:text-white hover:bg-purple-950/40 border border-purple-500/20"
            }`}
          >
            <Server className="w-3.5 h-3.5 text-purple-400" />
            <span>Registry</span>
            <span className="px-1 py-0.2 text-[8.5px] rounded-[2px] bg-purple-500/30 text-purple-200 font-bold">
              ADMIN
            </span>
          </button>
        )}

        {/* ADMIN TAB 5: USERS (Strictly visible only to Šimon / Admin) */}
        {isAdmin && (
          <button
            onClick={() => setActiveSubTab("users")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] uppercase tracking-wider font-medium transition whitespace-nowrap text-[11px] ${
              activeSubTab === "users"
                ? "bg-emerald-600 text-white shadow-sm border border-emerald-400/50"
                : "text-emerald-300 hover:text-white hover:bg-emerald-950/40 border border-emerald-500/20"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Users</span>
            <span className="px-1 py-0.2 text-[8.5px] rounded-[2px] bg-emerald-500/30 text-emerald-200 font-bold">
              ADMIN
            </span>
          </button>
        )}
      </div>

      {/* SubTab 1: Live DAO Portal */}
      {activeSubTab === "dao" && (
        <div className="space-y-4">
          {/* Sync Telemetry Banner */}
          {syncFeedback && (
            <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-[3px] p-2.5 font-mono text-xs text-emerald-300 flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px]">{syncFeedback}</span>
              </div>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-[2px] bg-emerald-500/20 text-emerald-300 font-bold shrink-0">
                PostgreSQL Sync OK
              </span>
            </div>
          )}

          {/* DAO Address & Quick Status Card */}
          <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[4px] p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    ARAGON OSx DAO CONTRACT (ETHEREUM SEPOLIA)
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-[2px] bg-emerald-500/10 text-emerald-400 text-[9px] border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    BLOCK #{blockHeight}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs sm:text-sm font-bold text-white tabular break-all">
                    {daoAddress}
                  </span>
                  <button
                    onClick={() => handleCopy(daoAddress)}
                    className="p-1 rounded-[2px] bg-[#05070b] border border-slate-800 text-slate-400 hover:text-white transition shrink-0"
                    title="Copy Address"
                  >
                    {copiedAddress ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={triggerSync}
                  disabled={syncing}
                  className="hero-btn hero-btn--ghost !py-1.5 !px-3 !text-[11px] inline-flex items-center gap-1.5"
                  title="Force re-sync with on-chain Aragon DAO and managed PostgreSQL"
                >
                  <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin text-blue-400" : "text-slate-400"}`} />
                  <span>{syncing ? "Syncing..." : "Sync On-Chain"}</span>
                </button>

                <a
                  href={`https://sepolia.etherscan.io/address/${daoAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-btn hero-btn--ghost !py-1.5 !px-3 !text-[11px]"
                >
                  <span>Etherscan</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <a
                  href={`https://app.aragon.org/dao/ethereum-sepolia/${daoAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-btn hero-btn--primary !py-1.5 !px-3 !text-[11px]"
                >
                  <span>Aragon App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-3 border-t border-slate-800/80 font-mono text-xs">
              <div className="bg-[#05070b] p-2.5 rounded-[3px] border border-slate-800">
                <div className="text-[9.5px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>TREASURY VAULT</span>
                  <span className="text-[8.5px] text-emerald-400">LIVE</span>
                </div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5 tabular">
                  {treasuryEth.toFixed(4)} SepoliaETH
                </div>
                <div className="text-[9.5px] text-slate-500 mt-0.5">
                  ≈ ${treasuryUsd.toFixed(2)} USD (@ $2,650/ETH)
                </div>
              </div>

              <div className="bg-[#05070b] p-2.5 rounded-[3px] border border-slate-800">
                <div className="text-[9.5px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>POSTGRESQL SYNC</span>
                  <Database className="w-3 h-3 text-blue-400" />
                </div>
                <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Hyperdrive</span>
                </div>
                <div className="text-[9.5px] text-slate-500 mt-0.5 font-mono">
                  schema verxl · crontab */5m
                </div>
              </div>

              <div className="bg-[#05070b] p-2.5 rounded-[3px] border border-slate-800">
                <div className="text-[9.5px] text-slate-400 uppercase tracking-wider">APPROVAL THRESHOLD</div>
                <div className="text-sm font-bold text-blue-400 mt-0.5 tabular">
                  2 / 3 Multisig (66.7%)
                </div>
                <div className="text-[9.5px] text-slate-500 mt-0.5">
                  Quorum: 200,000 $VRXL (20%)
                </div>
              </div>

              <div className="bg-[#05070b] p-2.5 rounded-[3px] border border-slate-800">
                <div className="text-[9.5px] text-slate-400 uppercase tracking-wider">ACTIVE PROPOSALS</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5 tabular">
                  {activeCount} Active Voting Polls
                </div>
                <div className="text-[9.5px] text-slate-500 mt-0.5">
                  VIP-1 & VIP-3 currently open
                </div>
              </div>
            </div>
          </div>

          {/* Proposals Feed */}
          <div className="space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                <Vote className="w-4 h-4 text-blue-400" />
                <span>On-Chain Proposal Log & PostgreSQL Mirror</span>
              </h3>
              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                <Server className="w-3 h-3 text-emerald-400" />
                <span>Auto-Persisted to PostgreSQL on managed PostgreSQL</span>
              </div>
            </div>

            {loading ? (
              <div className="bg-[#0a0e17] border border-slate-800 rounded-[4px] p-8 text-center text-xs text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-400" />
                <span>Reading proposals from Sepolia RPC & managed PostgreSQL...</span>
              </div>
            ) : proposals.length > 0 ? (
              proposals.map((proposal) => {
                const isActive = proposal.status === "ACTIVE";
                const isPassed = proposal.status === "PASSED";
                const isExecuted = proposal.status === "EXECUTED";

                return (
                  <div
                    key={proposal.id}
                    className={`bg-[#0a0e17] border rounded-[4px] p-4 sm:p-5 space-y-3 shadow-md transition ${
                      isActive
                        ? "border-blue-500/40"
                        : isPassed
                        ? "border-emerald-500/30"
                        : "border-slate-800"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-1.5 py-0.5 rounded-[2px] text-[10.5px] font-bold border ${
                            isActive
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                              : isPassed
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                              : "bg-[#05070b] border-slate-800 text-slate-300"
                          }`}
                        >
                          {proposal.id}
                        </span>
                        <h4 className="text-sm font-semibold text-white">{proposal.title}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {proposal.postgresSynced && (
                          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[9.5px] font-mono bg-blue-950/40 text-blue-300 border border-blue-700/40">
                            <Database className="w-2.5 h-2.5 text-blue-400" />
                            <span>managed telemetry PG</span>
                          </span>
                        )}

                        <div
                          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] text-[10.5px] font-semibold border ${
                            isActive
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : isPassed
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-slate-800/40 text-slate-300 border-slate-700/40"
                          }`}
                        >
                          {isActive && <Clock className="w-3 h-3" />}
                          {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {isExecuted && <CheckCircle2 className="w-3 h-3 text-slate-400" />}
                          <span>{proposal.status}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{proposal.description}</p>

                    {/* Voting Progress Bar */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>
                          Multisig Approval Threshold: {proposal.approvalPct.toFixed(1)}%
                        </span>
                        <span className="text-blue-400 font-semibold tabular">
                          {proposal.yesVotes.toLocaleString()} / {proposal.totalVotingPower.toLocaleString()} $VRXL
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#05070b] rounded-[1px] overflow-hidden border border-slate-800">
                        <div
                          className={`h-full ${
                            isPassed || isExecuted ? "bg-emerald-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${Math.min(proposal.approvalPct, 100)}%` }}
                        ></div>
                      </div>

                      {/* Voters Breakdown */}
                      {proposal.voters && proposal.voters.length > 0 && (
                        <div className="text-[10.5px] text-slate-400 flex flex-wrap gap-2 pt-1">
                          {proposal.voters.map((v, i) => (
                            <span key={i} className="flex items-center gap-1">
                              {v.vote === "YES" ? (
                                <span className="text-emerald-400 font-semibold">
                                  ✓ {v.name} ({v.voter}): Voted YES
                                </span>
                              ) : (
                                <span className="text-slate-400">
                                  • Pending: {v.name} ({v.voter})
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Proposal Action Footer */}
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-800/60 mt-2">
                      <div className="text-[10.5px] text-slate-500">
                        {proposal.txHash && (
                          <span>
                            Tx: <code className="text-slate-400">{proposal.txHash.slice(0, 10)}...{proposal.txHash.slice(-6)}</code>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {proposal.txHash && (
                          <a
                            href={`https://sepolia.etherscan.io/tx/${proposal.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hero-btn hero-btn--ghost !py-1 !px-2.5 !text-[10.5px] inline-flex items-center gap-1"
                          >
                            <span>Etherscan</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}

                        <a
                          href={proposal.aragonUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hero-btn hero-btn--primary !py-1 !px-2.5 !text-[10.5px] inline-flex items-center gap-1"
                        >
                          <span>{isActive ? "Vote on Aragon" : "View Aragon Proposal"}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Default Fallback if fetch was empty
              <div className="bg-[#0a0e17] border border-blue-500/40 rounded-[4px] p-4 sm:p-5 space-y-3 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded-[2px] text-[10.5px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                      VIP-1
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      Verxl Protocol Stage 1 Architecture & Seed Collateral Authorization
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] text-[10.5px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Clock className="w-3 h-3" />
                    <span>ACTIVE TEAM VOTING</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ratification of the Verxl Protocol 1-page charter, initial seed collateral allocation for autonomous canary probe oracles, and authorization of the 50 bps protocol fee clearing schedule for external GPU compute providers.
                </p>
                <div className="pt-1 flex justify-end">
                  <a
                    href={`https://app.aragon.org/dao/ethereum-sepolia/${daoAddress}/proposals/VIP-1`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hero-btn hero-btn--primary !py-1.5 !px-3 !text-[11px]"
                  >
                    <span>Cast Vote on Aragon</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Tokenomics Distribution Card */}
          <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[4px] p-5 shadow-xl space-y-3 font-mono">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2 uppercase tracking-wider">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>Tokenomics: Fixed 1,000,000 $VRXL Supply Architecture</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-[#05070b] p-2.5 rounded-[3px] border border-slate-800">
                <div className="text-[9.5px] text-slate-400 uppercase tracking-wider">COMPUTE LIQUIDITY</div>
                <div className="text-sm font-bold text-blue-400 mt-1 tabular">400,000 $VRXL</div>
                <div className="text-[9.5px] text-slate-400 mt-0.5">40% Node Incentives</div>
              </div>

              <div className="bg-[#05070b] p-2.5 rounded-[3px] border border-slate-800">
                <div className="text-[9.5px] text-slate-400 uppercase tracking-wider">DAO TREASURY</div>
                <div className="text-sm font-bold text-emerald-400 mt-1 tabular">300,000 $VRXL</div>
                <div className="text-[9.5px] text-slate-400 mt-0.5">30% Aragon Vault</div>
              </div>

              <div className="bg-[#05070b] p-2.5 rounded-[3px] border border-slate-800">
                <div className="text-[9.5px] text-slate-400 uppercase tracking-wider">CORE CONTRIBUTORS</div>
                <div className="text-sm font-bold text-indigo-400 mt-1 tabular">200,000 $VRXL</div>
                <div className="text-[9.5px] text-slate-400 mt-0.5">20% 24mo Vesting</div>
              </div>

              <div className="bg-[#05070b] p-2.5 rounded-[3px] border border-slate-800">
                <div className="text-[9.5px] text-slate-400 uppercase tracking-wider">COMMUNITY & ECOSYSTEM</div>
                <div className="text-sm font-bold text-amber-400 mt-1 tabular">100,000 $VRXL</div>
                <div className="text-[9.5px] text-slate-400 mt-0.5">10% Public Testnet</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Institutional Whitepaper */}
      {activeSubTab === "whitepaper" && (
        <WhitepaperContent />
      )}

      {/* SubTab 3: Founders' Agreement */}
      {activeSubTab === "charter" && (
        <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[4px] p-6 sm:p-10 shadow-2xl space-y-5 font-mono text-xs text-slate-300 leading-relaxed">
          <div className="border-b border-slate-800 pb-4 text-center space-y-1">
            <span className="text-[10px] text-blue-400 tracking-widest uppercase">
              FOUNDERS' CHARTER & MEMORANDUM OF ASSOCIATION
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              VERXL DAO PROTOCOL FOUNDERS' AGREEMENT
            </h2>
            <p className="text-[10.5px] text-slate-400">
              Executed under Aragon OSx Framework on Ethereum Sepolia
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-[#05070b] p-3.5 rounded-[3px] border border-slate-800 space-y-2">
              <div className="text-white font-bold text-xs uppercase tracking-wider">Article I: Founding Signatories & Wallets</div>
              <p className="text-slate-400">
                1. Šimon Havlík (Project Lead & Head Developer):{" "}
                <code className="text-blue-300">0x14f10A865e277C0B1949e18Dd9856602DB11742b</code>
              </p>
              <p className="text-slate-400">
                2. Quality Assurance & Process Verification Lead:{" "}
                <code className="text-blue-300">0x4E5e69DcFE7DF0D3E5bA074C7a66CE0597cF05Ab</code>
              </p>
              <p className="text-slate-400">
                3. Regulatory Compliance & Market Research Lead:{" "}
                <code className="text-blue-300">0xE4a112C573a750b2d3Cc418CFF45FFEf9Fd1272F</code>
              </p>
            </div>

            <div className="bg-[#05070b] p-3.5 rounded-[3px] border border-slate-800 space-y-2">
              <div className="text-white font-bold text-xs uppercase tracking-wider">Article II: Governance & Voting Quorum</div>
              <p className="text-slate-400">
                All protocol parameter alterations, fee adjustments, and treasury disbursements from DAO Vault{" "}
                <code className="text-slate-200">0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a</code> require a{" "}
                <strong className="text-white">minimum two-thirds (66.7%) multisig affirmative vote</strong>.
              </p>
            </div>

            <div className="bg-[#05070b] p-3.5 rounded-[3px] border border-slate-800 space-y-2">
              <div className="text-white font-bold text-xs uppercase tracking-wider">Article III: Slashing Penalty Distribution</div>
              <p className="text-slate-400">
                Compute providers who commit quantization fraud or exceed latency SLAs suffer a mandatory 10% collateral slash:
                50% is permanently burned to reduce supply, and 50% is routed directly to the DAO Treasury Vault.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 4: Admin Registry (Model Submissions, Fleet Monitoring & Agent Mail) */}
      {activeSubTab === "registry" && isAdmin && (
        <AdminRegistryTab />
      )}

      {/* SubTab 5: Admin Users (User Management, Balance Rewriting, Suspensions, Activity) */}
      {activeSubTab === "users" && isAdmin && (
        <AdminUsersTab />
      )}
    </div>
  );
};
