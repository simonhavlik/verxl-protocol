import React, { useState } from "react";
import {
  Download,
  Copy,
  Check,
  Printer,
  FileText,
} from "lucide-react";

export const Whitepaper: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = async () => {
    try {
      const res = await fetch("/whitepaper.md");
      const text = await res.text();
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Minimal Utility Bar */}
      <div className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] px-3.5 py-2 flex items-center justify-between text-xs font-mono shadow-sm">
        <div className="flex items-center gap-2 text-slate-300">
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-white">docs/WHITEPAPER.md</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-400 text-[11px]">Academic Specification</span>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href="/whitepaper.md"
            download="VERXL_PROTOCOL_WHITEPAPER.md"
            className="hero-btn hero-btn--ghost !py-1 !px-2.5 !text-[10.5px]"
            title="Download pure Markdown document"
          >
            <Download className="w-3 h-3 text-blue-400" />
            <span>Download .MD</span>
          </a>

          <button
            onClick={handleCopyMarkdown}
            className="hero-btn hero-btn--ghost !py-1 !px-2.5 !text-[10.5px]"
            title="Copy raw markdown to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy Raw</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="hero-btn hero-btn--ghost !py-1 !px-2.5 !text-[10.5px]"
            title="Print or export as PDF"
          >
            <Printer className="w-3 h-3 text-slate-400" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Main Document Body — Pure Whitepaper Article */}
      <article className="bg-[#0a0e17] border border-blue-500/20 rounded-[3px] p-6 sm:p-10 shadow-2xl space-y-6 text-slate-200 leading-[1.78] font-sans">
        {/* Document Header */}
        <div className="space-y-3 border-b border-slate-800/80 pb-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Verxl Protocol
          </h1>
          <h2 className="text-base sm:text-xl font-medium text-slate-300">
            Non Custodial Clearing, Mechanism Design, and Compute Routing
          </h2>
          <div className="text-xs font-mono text-slate-400 pt-1">
            Asset verxl.com | Testnet Clearing Layer Ethereum Sepolia | Governance Token $VRXL
          </div>

          {/* ASCII Banner */}
          <pre className="font-mono text-[9px] sm:text-[11px] leading-tight text-blue-400/90 py-3 overflow-x-auto inline-block text-left border border-slate-800/90 bg-[#05070b] p-3.5 rounded-[2px] mt-2">
{`__      ________ _____  __   __ _      
\\ \\    / /  ____|  __ \\ \\ \\ / /| |     
 \\ \\  / /| |__  | |__) | \\ V / | |     
  \\ \\/ / |  __| |  _  /   > <  | |     
   \\  /  | |____| | \\ \\  / . \\ | |____ 
    \\/   |______|_|  \\_\\/_/ \\_\\|______|
               D   A   O`}
          </pre>
        </div>

        {/* Abstract */}
        <div className="bg-[#05070b] border-l-2 border-blue-500 p-4 sm:p-5 rounded-[2px] space-y-2">
          <h3 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
            Abstract
          </h3>
          <p className="text-xs sm:text-[13.5px] text-slate-300 leading-relaxed">
            Artificial intelligence inference markets suffer from severe structural friction driven by centralized broker dealers that extract substantial deadweight loss, mandate custodial float, and fail to resolve asymmetric information. This paper models the prevailing market failure through transaction cost economics and the Akerlof lemons equilibrium, derives the theoretically optimal non custodial clearing mechanism, and introduces Verxl Protocol as its practical realization. By aligning compute buyers, independent hardware suppliers, and protocol governance around a 50 basis point fee switch and collateralized surety bonding, Verxl achieves a Pareto efficient equilibrium that compresses transaction friction without imposing rigid centralized operational liabilities.
          </p>
        </div>

        {/* The Market Failure and Intermediary Deadweight Loss */}
        <div className="space-y-3 pt-2">
          <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide border-b border-slate-800/60 pb-1.5 font-mono">
            The Market Failure and Intermediary Deadweight Loss
          </h3>
          <p className="text-[13.5px] sm:text-[14px] text-slate-300">
            The contemporary market for distributed artificial intelligence inference is characterized by severe institutional friction. Centralized aggregators operate as principal broker dealers, inserting themselves into bilateral transactions, purchasing wholesale compute via opaque agreements, and reselling access at an administered retail markup. This structure introduces an aggregate intermediation deadweight loss between 840 and 1040 basis points. The loss comprises a 550 basis point gross platform distributor margin, 290 basis points plus thirty cents per transaction in acquiring gateway interchange, and foreign exchange spreads between 100 and 200 basis points for non dollar counterparties.
          </p>
          <p className="text-[13.5px] sm:text-[14px] text-slate-300">
            Beyond direct fee extraction, the centralized model imposes substantial working capital distortions. Buyers must prefund unsegregated custodial balances on the balance sheet of the broker. These balances function as interest free, unsecured subordinated debt obligations, forcing enterprise consumers to absorb negative real carry, duration risk, and vulnerability to broker insolvency or arbitrary account suspension. Simultaneously, routing opacity enables the broker to internalize order flow based on private margin maximization rather than consumer allocative efficiency.
          </p>
          <p className="text-[13.5px] sm:text-[14px] text-slate-300">
            The market failure is compounded by asymmetric information, characterized by the economic lemons problem first formulated by George Akerlof. Because deep neural networks are served over opaque network interfaces, compute suppliers face an acute moral hazard incentive to engage in quality degradation. An operator can advertise full precision sixteen bit floating point weights at prevailing market clearing prices while silently serving four bit quantized representations or distilled student architectures on depreciated hardware. The computational cost to the supplier drops by up to seventy percent, yet the buyer absorbs degraded reasoning and severe hallucination variance. Because buyers cannot audit weight matrices ex ante over standard network layers, rational market participants discount their reservation prices to reflect the expected value of adulterated hardware. This discount depresses equilibrium market clearing prices below the marginal operational cost of authentic high tier GPU clusters, driving institutional compute operators from open networks and leaving an adverse selection equilibrium dominated by degraded endpoints.
          </p>
        </div>

        {/* Theoretical Mechanism Design and The Pareto Optimum */}
        <div className="space-y-3 pt-2">
          <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide border-b border-slate-800/60 pb-1.5 font-mono">
            Theoretical Mechanism Design and The Pareto Optimum
          </h3>
          <p className="text-[13.5px] sm:text-[14px] text-slate-300">
            To resolve this systemic market failure, mechanism design theory requires a transition from principal dealer intermediation to an automated, non custodial clearinghouse. In theoretical economics, a market structure reaches Pareto efficiency when transaction friction is minimized such that no participant can be made better off without making another worse off, holding rent extraction to zero.
          </p>
          <p className="text-[13.5px] sm:text-[14px] text-slate-300">
            The optimal theoretical design requires three foundational properties. First, clearing must operate on an agency basis rather than a principal basis. The clearinghouse must not take inventory risk, hold customer float, or intermediate capital flows through an off balance sheet balance. Settlement must occur directly between buyer and supplier via non custodial commitments, eliminating counterparty credit risk and deadweight payment processing overhead.
          </p>
          <p className="text-[13.5px] sm:text-[14px] text-slate-300">
            Second, the clearing fee must approximate marginal transaction processing cost. Because cryptographic execution on distributed networks possesses near zero marginal cost, setting an ultra thin fee schedule eliminates monopoly deadweight loss and maximizes total consumer and producer surplus.
          </p>
          <p className="text-[13.5px] sm:text-[14px] text-slate-300">
            Third, the information asymmetry problem must be resolved through an incentive compatible screening contract backed by exogenous capital bonding. Suppliers must post collateral that is vulnerable to automated forfeiture upon verified breach of contract. By introducing deterministic auditing probes that penalize precision deviation, the expected payoff of quality degradation becomes strictly negative, aligning supplier self interest with truthful precision disclosure and restoring equilibrium prices for institutional hardware. Under this theoretical model, buyers achieve lower net compute costs, suppliers capture higher gross revenue margins, and the market transitions from an adverse selection trap to a Pareto efficient equilibrium.
          </p>
        </div>

        {/* Verxl Protocol as The Operational Realization */}
        <div className="space-y-3 pt-2">
          <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide border-b border-slate-800/60 pb-1.5 font-mono">
            Verxl Protocol as The Operational Realization
          </h3>
          <p className="text-[13.5px] sm:text-[14px] text-slate-300">
            Verxl Protocol operationalizes this theoretical mechanism design without imposing centralized enterprise overhead or rigid corporate liabilities that would restrict operational flexibility. The protocol coordinates transactions through decentralized edge proxy routing at verxl.com/v1 and smart contracts deployed on Ethereum Sepolia.
          </p>
          <p className="text-[13.5px] sm:text-[14px] text-slate-300">
            Under the Verxl architecture, compute buyers establish cryptographic balance allowances on chain, bypassing custodial float capture and maintaining sovereign ownership of capital until execution occurs. When an inference call is processed, the edge router clears the order directly against registered compute nodes. The protocol activates an ultra thin 50 basis point fee switch on gross transaction value, compressing prevailing broker markups by over ninety percent.
          </p>
          <p className="text-[13.5px] sm:text-[14px] text-slate-300">
            The protocol cash flow waterfall executes programmatically. Exactly 99.5 percent of gross transaction value clears directly to the independent compute provider withdrawal balance, ensuring near perfect pass through of market liquidity. The residual 50 basis points settles into the Verxl DAO treasury vault on Ethereum Sepolia as protocol revenue. Rather than making rigid operational guarantees or static service level commitments that could expose the protocol to legal or balance sheet liabilities, the system relies on self executing smart contract rules. Control over accumulated treasury assets resides with the founding equity tranche via the $VRXL governance asset, allowing flexible capital reinvestment, treasury diversification, or governance dividends through transparent on chain voting.
          </p>
          <p className="text-[13.5px] sm:text-[14px] text-slate-300">
            To enforce quality without administrative bureaucracy, compute operators post a performance bond into the VerxlStakingRegistry contract before entering the active routing registry, establishing verifiable economic collateral with a baseline requirement of one thousand $VRXL tokens. Autonomous quality oracle nodes dispatch periodic deterministic canary probes at thirty minute intervals, enforcing zero temperature parameters and static mathematical seeds to audit latency, throughput, and output fidelity against deterministic baselines.
          </p>
          <p className="text-[13.5px] sm:text-[14px] text-slate-300">
            Detected performance divergence or model spoofing triggers an automated ten percent slashing event against bonded collateral. Half of the forfeited bond capitalizes the Verxl DAO treasury vault to absorb systemic disruption, while the remaining half is permanently routed to an unrecoverable burn address, contracting the aggregate circulating supply of $VRXL. A mandatory 86400 second unbonding cooldown delay prevents capital flight during active audit cycles.
          </p>
        </div>

        {/* Competitive Moats and Risk Governance */}
        <div className="space-y-3 pt-2">
          <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide border-b border-slate-800/60 pb-1.5 font-mono">
            Competitive Moats and Risk Governance
          </h3>
          <p className="text-[13.5px] sm:text-[14px] text-slate-300">
            Centralized model brokers possess an endogenous marginal cost floor determined by legacy payment processing interchange, fraud screening, banking compliance overhead, and balance sheet float financing. These fixed costs mandate minimum broker markups of 500 to 600 basis points, making it economically impossible for centralized incumbents to match Verxl 50 basis point limit pricing without incurring operating losses. Simultaneously, Verxl cryptoeconomic surety bonding enables the protocol to safely onboard secondary GPU supply from regional data centers and amortized cryptocurrency mining facilities that centralized platforms cannot trust, unlocking massive tranches of low cost institutional compute.
          </p>
          <p className="text-[13.5px] sm:text-[14px] text-slate-300">
            Protocol parameters, slashing schedules, fee switches, and treasury disbursements are governed on chain through Aragon OSx. The native governance unit, $VRXL, features a fixed genesis supply of one million ERC twenty tokens with zero uncollateralized inflation mechanisms. Governance settings enforce a twenty percent circulating quorum and a strict majority threshold exceeding fifty percent for proposal execution. Sovereign custody of protocol cash flows resides exclusively within the treasury vault contract, ensuring that long term parameter evolution remains decentralized, adaptable to shifting market conditions, and free of binding corporate promises.
          </p>
        </div>

        {/* Subdued Academic Attribution */}
        <div className="border-t border-slate-800/80 pt-6 text-center text-[11px] font-mono text-slate-400 space-y-1">
          <div>Prague University of Economics and Business (VŠE Praha) • Faculty of International Relations (FIR)</div>
          <div>Project Verxl Protocol • October 2026 • Published to <code className="text-blue-400">verxl.com/whitepaper</code></div>
        </div>
      </article>
    </div>
  );
};
