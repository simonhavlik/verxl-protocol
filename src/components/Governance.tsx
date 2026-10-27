import React, { useState } from "react";
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
} from "lucide-react";

export const Governance: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"dao" | "whitepaper" | "charter">("dao");
  const [copiedAddress, setCopiedAddress] = useState(false);

  const daoAddress = "0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a";
  const adminTxHash = "0x247d5d5b5fca30b1cfadc102322a22001e6c828e41705aafe1bb54e23921b6b6";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 mb-2">
          <Shield className="w-3.5 h-3.5" />
          <span>ON-CHAIN GOVERNANCE & INSTITUTIONAL WHITEPAPER</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Aragon OSx DAO & Protocol Specification
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Decentralized ownership, on-chain proposals, and the theoretical framework governing
          non-custodial AI inference clearing.
        </p>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex border-b border-slate-800 gap-2 pb-1">
        <button
          onClick={() => setActiveSubTab("dao")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-medium rounded-t-lg transition border-b-2 ${
            activeSubTab === "dao"
              ? "border-blue-500 text-white bg-slate-900/40"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Vote className="w-3.5 h-3.5 text-blue-400" />
          <span>Live DAO Governance</span>
        </button>

        <button
          onClick={() => setActiveSubTab("whitepaper")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-medium rounded-t-lg transition border-b-2 ${
            activeSubTab === "whitepaper"
              ? "border-blue-500 text-white bg-slate-900/40"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>Institutional Whitepaper</span>
        </button>

        <button
          onClick={() => setActiveSubTab("charter")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-medium rounded-t-lg transition border-b-2 ${
            activeSubTab === "charter"
              ? "border-blue-500 text-white bg-slate-900/40"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Founders' Charter (MoA)</span>
        </button>
      </div>

      {/* SubTab 1: Live DAO Portal */}
      {activeSubTab === "dao" && (
        <div className="space-y-6">
          {/* DAO Address & Quick Status Card */}
          <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">
                  ARAGON OSx DAO CONTRACT (ETHEREUM SEPOLIA)
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm sm:text-base font-bold font-mono text-white">
                    {daoAddress}
                  </span>
                  <button
                    onClick={() => handleCopy(daoAddress)}
                    className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition"
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
                <a
                  href={`https://sepolia.etherscan.io/address/${daoAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-mono text-slate-300 transition"
                >
                  <span>Etherscan</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <a
                  href={`https://app.aragon.org/dao/ethereum-sepolia/${daoAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-mono text-white transition shadow-sm shadow-blue-500/20"
                >
                  <span>Aragon App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 font-mono text-xs">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">TREASURY BALANCE</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  0.009 SepoliaETH
                </div>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">VOTING BODIES</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  Admin & VIP Multisig
                </div>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">MULTISIG THRESHOLD</div>
                <div className="text-sm font-bold text-blue-400 mt-0.5">
                  2 / 3 Approvals (66.7%)
                </div>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">ACTIVE PROPOSALS</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5">
                  1 Voting Poll (VIP-1)
                </div>
              </div>
            </div>
          </div>

          {/* Proposals Feed */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Vote className="w-4 h-4 text-blue-400" />
              <span>On-Chain Proposal Log</span>
            </h3>

            {/* Proposal 1: VIP-1 (Active) */}
            <div className="bg-[#0c1322] border border-blue-500/40 rounded-xl p-5 space-y-4 shadow-lg shadow-blue-500/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    VIP-1
                  </span>
                  <h4 className="text-sm font-semibold text-white">
                    Verxl Protocol Stage 1 Architecture & Seed Collateral Authorization
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Clock className="w-3 h-3" />
                  <span>ACTIVE VOTING</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                Ratification of the Verxl Protocol 1-page charter, initial seed collateral allocation for
                autonomous canary probe oracles, and authorization of the 50 bps protocol fee clearing
                schedule for external GPU compute providers.
              </p>

              {/* Voting Progress Bar */}
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Multisig Support (2 / 3 Required)</span>
                  <span className="text-blue-400 font-semibold">1 / 3 Approved (33.3%)</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-blue-500 w-1/3 rounded-full"></div>
                </div>
                <div className="text-[11px] text-slate-400 flex flex-wrap gap-3 pt-1">
                  <span className="text-emerald-400 font-semibold">
                    ✓ Šimon Havlík (0x14f1...742b): Voted YES
                  </span>
                  <span>• Pending: Teammate 1 (0x4E5e...05Ab)</span>
                  <span>• Pending: Teammate 2 (0xE4a1...272F)</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <a
                  href={`https://app.aragon.org/dao/ethereum-sepolia/${daoAddress}/proposals/VIP-1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-mono text-white transition shadow-sm shadow-blue-500/20"
                >
                  <span>Cast Team Vote on Aragon</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Proposal 2: ADMIN-1 (Executed) */}
            <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-slate-300">
                    ADMIN-1
                  </span>
                  <h4 className="text-sm font-semibold text-slate-200">
                    Initial Treasury Verification & 0.001 SepoliaETH Test Transfer
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>EXECUTED ON-CHAIN</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Verification of vault custody and execution capability under Aragon OSx plugin.
                Transferred 0.001 ETH from DAO Vault to verify non-custodial asset routing.
              </p>

              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
                <span className="text-[11px]">
                  Tx: <code className="text-slate-300">0x247d5d5...b6b6</code>
                </span>
                <a
                  href={`https://sepolia.etherscan.io/tx/${adminTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition"
                >
                  <span>View Execution Tx</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Tokenomics Distribution Card */}
          <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>Tokenomics: Fixed 1,000,000 $VRXL Supply Architecture</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">COMPUTE LIQUIDITY</div>
                <div className="text-base font-bold text-blue-400 mt-1">400,000 $VRXL</div>
                <div className="text-[10px] text-slate-400 mt-0.5">40% Node Incentives</div>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">DAO TREASURY</div>
                <div className="text-base font-bold text-emerald-400 mt-1">300,000 $VRXL</div>
                <div className="text-[10px] text-slate-400 mt-0.5">30% Aragon Vault</div>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">CORE CONTRIBUTORS</div>
                <div className="text-base font-bold text-indigo-400 mt-1">200,000 $VRXL</div>
                <div className="text-[10px] text-slate-400 mt-0.5">20% 24mo Vesting</div>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">COMMUNITY & ECOSYSTEM</div>
                <div className="text-base font-bold text-amber-400 mt-1">100,000 $VRXL</div>
                <div className="text-[10px] text-slate-400 mt-0.5">10% Public Testnet</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Institutional Whitepaper */}
      {activeSubTab === "whitepaper" && (
        <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8 font-serif leading-relaxed text-slate-200">
          <div className="border-b border-slate-800 pb-6 text-center font-sans space-y-2">
            <div className="text-xs font-mono text-blue-400 tracking-widest uppercase">
              Academic Protocol Whitepaper • Course 4KE404/4KE505 Crypto • FIR VŠE Prague
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              VERXL PROTOCOL
            </h1>
            <p className="text-sm text-slate-400 font-mono">
              Non-Custodial Decentralized Artificial Intelligence Inference Routing And Compute Clearinghouse
            </p>
            <div className="text-xs text-slate-400 font-mono pt-2">
              Author Šimon Havlík • Prague • October 2026
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-sm text-slate-300">
            <h3 className="text-lg font-bold text-white font-sans">
              1. The Theoretical Failure Of Centralized Inference Intermediation
            </h3>
            <p>
              The contemporary market for machine learning compute exhibits an acute structural market failure.
              While physical high performance hardware undergoes rapid commoditization across decentralized data centres
              and specialized hosting facilities throughout Central Europe and North America, retail and enterprise consumers
              remain captive to concentrated cloud cartels. Centralized aggregators extract take rates ranging between
              eight hundred and forty basis points and one thousand and forty basis points above raw hardware marginal depreciation.
            </p>
            <p>
              This rent extraction generates severe deadweight loss across the global technological frontier.
              Early stage venture teams, autonomous machine learning agents, and quantitative algorithmic systems
              are forced to absorb substantial financial spreads. Furthermore, centralized routing creates concentrated
              single points of structural failure, proprietary surveillance bottlenecks, and systematic vulnerability
              to localized data center outages.
            </p>

            <h3 className="text-lg font-bold text-white font-sans">
              2. Pareto Optimum And Mechanism Design Of The Verxl Protocol
            </h3>
            <p>
              Verxl Protocol resolves this systemic market distortion through an unbundled, decentralized clearing architecture.
              By separating compute execution from transaction clearing and governance, Verxl introduces a trust minimized
              clearinghouse operating at a fixed protocol fee of exactly fifty basis points.
            </p>
            <p>
              This architectural design achieves a ninety four point one percent compression in intermediary rent extraction.
              Consumer surplus expands while independent high performance compute providers retain the complete economic
              proceeds of their hardware operations. Transactions settle atomically without centralized custody of capital
              or arbitrary gatekeeping.
            </p>

            <h3 className="text-lg font-bold text-white font-sans">
              3. Verxl Operational Realization And Game Theoretic Enforcement
            </h3>
            <p>
              The operational implementation of Verxl unites edge routing via Cloudflare global workers, deterministic
              quality assurance, and cryptographic staking governed by the Aragon smart contract framework on Ethereum.
            </p>
            <p>
              Compute providers bond digital collateral in the native protocol currency VRXL before receiving routed inference traffic.
              To guarantee that hardware clusters serve authentic floating point precision rather than secretly downsampled
              quantized weights, autonomous oracle nodes dispatch cryptographic canary probes with fixed random seeds.
            </p>
            <p>
              Any verified deviation in token output distribution or execution latency beyond agreed service level thresholds
              triggers an automated ten percent collateral slash. Half of the forfeited collateral is permanently burned from
              the circulating monetary supply, while the remainder flows directly to the decentralized autonomous organization treasury vault.
              This asymmetric penalty structure renders intentional protocol defection strictly economically irrational under Nash equilibrium.
            </p>
          </div>
        </div>
      )}

      {/* SubTab 3: Founders' Agreement */}
      {activeSubTab === "charter" && (
        <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-6 font-mono text-xs text-slate-300 leading-relaxed">
          <div className="border-b border-slate-800 pb-4 text-center space-y-1">
            <span className="text-[10px] text-blue-400 tracking-widest uppercase">
              FOUNDERS' CHARTER & MEMORANDUM OF ASSOCIATION
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              VERXL DAO PROTOCOL FOUNDERS' AGREEMENT
            </h2>
            <p className="text-[11px] text-slate-400">
              Executed under Aragon OSx Framework on Ethereum Sepolia
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-white font-bold text-sm">Article I: Founding Signatories & Wallets</div>
              <p className="text-slate-400">
                1. Šimon Havlík (Founding Protocol Architect & Project Lead):{" "}
                <code className="text-blue-300">0x14f10A865e277C0B1949e18Dd9856602DB11742b</code>
              </p>
              <p className="text-slate-400">
                2. Founding Core Team Member 1 (Infrastructure Engineering):{" "}
                <code className="text-blue-300">0x4E5e69DcFE7DF0D3E5bA074C7a66CE0597cF05Ab</code>
              </p>
              <p className="text-slate-400">
                3. Founding Core Team Member 2 (Clearing & Protocol Governance):{" "}
                <code className="text-blue-300">0xE4a112C573a750b2d3Cc418CFF45FFEf9Fd1272F</code>
              </p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-white font-bold text-sm">Article II: Governance & Voting Quorum</div>
              <p className="text-slate-400">
                All protocol parameter alterations, fee adjustments, and treasury disbursements from DAO Vault{" "}
                <code className="text-slate-200">0xf0e51fB0FFBD8ef36281b6f643E0f7953BD5111a</code> require a{" "}
                <strong className="text-white">minimum two-thirds (66.7%) multisig affirmative vote</strong>.
              </p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-white font-bold text-sm">Article III: Slashing Penalty Distribution</div>
              <p className="text-slate-400">
                Compute providers who commit quantization fraud or exceed latency SLAs suffer a mandatory 10% collateral slash:
                50% is permanently burned to reduce supply, and 50% is routed directly to the DAO Treasury Vault.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
