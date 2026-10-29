import React, { useState } from "react";
import {
  ShieldCheck,
  FileText,
  Scale,
  Lock,
  AlertTriangle,
  Building,
} from "lucide-react";

interface LegalProps {
  initialTab?: "privacy" | "terms" | "mica" | "charter";
}

export const Legal: React.FC<LegalProps> = ({ initialTab = "privacy" }) => {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms" | "mica" | "charter">(initialTab);

  return (
    <div className="space-y-6 font-mono text-slate-200">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-500/20 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs">
            <Scale className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-white uppercase tracking-wider">
              Legal, Regulatory & Data Governance Center
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400 text-[11px]">EU & Czechia Jurisdiction</span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Formal legal terms, GDPR privacy covenants, non-custodial declarations, and EU MiCA regulatory perimeter.
          </p>
        </div>

        {/* Quick Nav Badges */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            GDPR Art. 12–22 Compliant
          </span>
          <span className="px-2 py-0.5 rounded-[2px] bg-blue-500/10 text-blue-400 border border-blue-500/30">
            MiCA Non-Custodial
          </span>
        </div>
      </div>

      {/* Document Selection Tabs */}
      <div className="flex border-b border-slate-800 gap-1 text-xs">
        <button
          onClick={() => setActiveTab("privacy")}
          className={`py-2.5 px-4 font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition ${
            activeTab === "privacy"
              ? "border-blue-400 text-white bg-blue-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Privacy Policy (GDPR)</span>
        </button>
        <button
          onClick={() => setActiveTab("terms")}
          className={`py-2.5 px-4 font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition ${
            activeTab === "terms"
              ? "border-blue-400 text-white bg-blue-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Terms of Service & Liability Disclaimer</span>
        </button>
        <button
          onClick={() => setActiveTab("mica")}
          className={`py-2.5 px-4 font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition ${
            activeTab === "mica"
              ? "border-blue-400 text-white bg-blue-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>EU MiCA & Regulatory Statement</span>
        </button>
        <button
          onClick={() => setActiveTab("charter")}
          className={`py-2.5 px-4 font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition ${
            activeTab === "charter"
              ? "border-blue-400 text-white bg-blue-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Competition Charter & IP Attribution</span>
        </button>
      </div>

      {/* DOCUMENT 1: PRIVACY POLICY (GDPR) */}
      {activeTab === "privacy" && (
        <div className="bg-[#0a0e17] border border-blue-500/25 rounded-[3px] p-5 sm:p-7 space-y-6 shadow-xl text-xs font-sans">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wider">
                Verxl Protocol Privacy Policy
              </h1>
              <div className="text-[11px] text-slate-400 font-mono">
                Effective Date: October 27, 2026 · Compliant with Regulation (EU) 2016/679 (GDPR)
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-[2px] font-mono">
              Zero Persistent Prompt Logging
            </span>
          </div>

          <div className="space-y-4 text-slate-300 leading-relaxed">
            {/* Section 1 */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">1.</span>
                <span>Data Controller & Contact Information</span>
              </h2>
              <p>
                The Data Controller for processing under the EU General Data Protection Regulation (GDPR) is the Verxl Protocol software architecture team, represented by lead project architect Simon Havlík, operating in Prague, Czech Republic.
              </p>
              <div className="bg-[#05070b] p-3 rounded-[2px] border border-slate-800 font-mono text-[11px] text-slate-300 space-y-0.5">
                <div><strong>Entity / Representation:</strong> Verxl Protocol Research & Development</div>
                <div><strong>Lead Architect / Contact:</strong> Simon Havlík</div>
                <div><strong>Jurisdiction:</strong> Prague, Czech Republic (European Union)</div>
                <div><strong>Data Protection Queries:</strong> me@simonhavlik.com</div>
                <div><strong>Supervisory Authority:</strong> Office for Personal Data Protection (<em>Úřad pro ochranu osobních údajů - ÚOOÚ</em>), Pplk. Sochora 27, 170 00 Prague 7, Czech Republic.</div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">2.</span>
                <span>Core Architectural Principle: Zero Prompt Retention</span>
              </h2>
              <p>
                Verxl Protocol is architecturally engineered on a <strong>stateless in-transit routing paradigm</strong>. When a client application dispatches prompts or completion requests to the routing endpoint (<code className="text-cyan-300">api.verxl.com/v1/chat/completions</code>), the payload is processed strictly in volatile random-access memory (RAM) across edge nodes:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>No Disk Persistence:</strong> Raw prompt content, system instructions, and completion tokens are streamed in-flight and are never written to hard drives, persistent storage, or telemetry archives.</li>
                <li><strong>No Machine Learning Training:</strong> Neither Verxl Protocol nor its edge routers harvest, store, or reuse user prompts to train or fine-tune neural networks or commercial AI models.</li>
                <li><strong>Autonomous Edge Clearing:</strong> Only deterministic metadata (token counts, timestamp, fee calculation in basis points) is registered to our transaction ledger on Charizard PostgreSQL to settle provider balances.</li>
              </ul>
            </div>

            {/* Section 2.1: Critical Disclosure on Upstream Silicon Hosts (DeepSeek, Xiaomi MiMo) */}
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-[2px] p-4 space-y-2.5 text-amber-200 font-mono">
              <div className="font-bold flex items-center gap-2 uppercase text-amber-300 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Critical Notice: Verxl Stateless Proxy vs. Upstream Provider Data Retention (DeepSeek, Xiaomi MiMo)</span>
              </div>
              <div className="space-y-2 text-[11px] text-slate-300 font-sans leading-relaxed">
                <p>
                  A clear legal and architectural distinction exists between <strong>Verxl Protocol's routing infrastructure</strong> and the <strong>independent upstream AI compute providers</strong> to which queries are routed:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                  <li>
                    <strong>Verxl Platform Perimeter:</strong> Verxl operates purely as a non-custodial routing switch. Our Cloudflare edge workers stream prompt and completion tokens through volatile memory (RAM) and do not write, log, or persist prompt or completion text to disk.
                  </li>
                  <li>
                    <strong>Upstream Commercial Providers (DeepSeek AI, Xiaomi MiMo):</strong> When you select a bridge-routed model (such as DeepSeek V4.1 Flash or Xiaomi MiMo 2.6 Flash), your inference payload is forwarded directly to the upstream host’s API servers (e.g., DeepSeek servers located in Hangzhou/Beijing, China, or Xiaomi infrastructure). <strong>These upstream providers DO log and store prompt inputs, reasoning traces, and completion data</strong> in accordance with their respective domestic privacy policies, terms of service, and regulatory reporting mandates (including mandatory logging under PRC cybersecurity and generative AI provisions).
                  </li>
                  <li>
                    <strong>Developer Responsibility & Confidentiality:</strong> Verxl does not and cannot control upstream provider storage or retention. Developers transmitting confidential, proprietary, or regulated personal data must not route such workloads to public bridge models without appropriate enterprise guarantees.
                  </li>
                  <li>
                    <strong>True Hardware-Level Zero-Logging:</strong> For absolute zero-retention across the entire execution stack, users must select dedicated, verified bare-metal nodes (such as the Prague Bulbasaur 01 cluster running localized Ollama/vLLM with disk telemetry disabled) or deploy private self-hosted Verxl nodes.
                  </li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">3.</span>
                <span>Categories of Personal Data Collected</span>
              </h2>
              <p>
                We minimize data collection in strict accordance with the principle of Data Minimisation (GDPR Article 5(1)(c)). The categories of data processed include:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                <div className="bg-[#05070b] p-3 rounded-[2px] border border-slate-800 space-y-1">
                  <div className="font-bold text-white text-[11px] font-mono">Authentication Data</div>
                  <p className="text-[10.5px] text-slate-400">
                    Email address (solely for passwordless OTP dispatch), PBKDF2-HMAC-SHA256 salted password hashes, and RFC 6238 Base32 TOTP secrets.
                  </p>
                </div>
                <div className="bg-[#05070b] p-3 rounded-[2px] border border-slate-800 space-y-1">
                  <div className="font-bold text-white text-[11px] font-mono">Financial Ledger Records</div>
                  <p className="text-[10.5px] text-slate-400">
                    Public blockchain addresses (Ethereum & Arbitrum L2), on-chain transaction hashes for USDC deposits, and non-custodial balance records.
                  </p>
                </div>
                <div className="bg-[#05070b] p-3 rounded-[2px] border border-slate-800 space-y-1">
                  <div className="font-bold text-white text-[11px] font-mono">Ephemeral Edge Telemetry</div>
                  <p className="text-[10.5px] text-slate-400">
                    IP addresses processed strictly in volatile memory by Cloudflare edge workers for rate limiting and DDoS mitigation; automatically discarded.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">4.</span>
                <span>Lawful Bases for Processing (GDPR Article 6)</span>
              </h2>
              <p>We process personal data solely on legitimate grounds recognized under GDPR Article 6:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>Performance of Contract (Art. 6(1)(b)):</strong> To authenticate developers, provision API keys, route requested model inference, and settle clearing fees.</li>
                <li><strong>Legitimate Interests (Art. 6(1)(f)):</strong> To maintain protocol security, prevent brute-force abuse or Sybil attacks via 2FA and rate limiting, and detect fraudulent deposit activity.</li>
                <li><strong>Legal Obligation (Art. 6(1)(c)):</strong> To maintain verifiable on-chain financial records and audit trails as required by tax and accounting legislation.</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">5.</span>
                <span>Your Rights as a European Data Subject</span>
              </h2>
              <p>Under GDPR Articles 15 through 22, you possess the following enforceable rights:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[10.5px]">
                <div className="bg-[#05070b] p-2.5 rounded-[2px] border border-slate-800">
                  <span className="text-blue-400 font-bold">• Right of Access (Art. 15):</span> Request confirmation of all data held on your account.
                </div>
                <div className="bg-[#05070b] p-2.5 rounded-[2px] border border-slate-800">
                  <span className="text-blue-400 font-bold">• Right to Erasure (Art. 17):</span> Request complete deletion of your account credentials and keys.
                </div>
                <div className="bg-[#05070b] p-2.5 rounded-[2px] border border-slate-800">
                  <span className="text-blue-400 font-bold">• Right to Data Portability (Art. 20):</span> Receive your transaction ledger history in structured JSON.
                </div>
                <div className="bg-[#05070b] p-2.5 rounded-[2px] border border-slate-800">
                  <span className="text-blue-400 font-bold">• Right to Object (Art. 21):</span> Object at any time to processing based on legitimate interests.
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                To exercise any of these rights, email <code className="text-cyan-300">me@simonhavlik.com</code>. Requests are verified cryptographically and answered within 30 days without charge.
              </p>
            </div>

            {/* Section 6 */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">6.</span>
                <span>Cookies & Local Storage Policy</span>
              </h2>
              <p>
                Verxl Protocol does <strong>not</strong> use third-party marketing, advertising, profiling, or tracking cookies. We utilize strictly necessary browser LocalStorage solely to maintain your authenticated session token (<code className="text-cyan-300">vrxl_auth_token</code>). Clearing your browser cache terminates the session immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT 2: TERMS OF SERVICE & LIMITATION OF LIABILITY */}
      {activeTab === "terms" && (
        <div className="bg-[#0a0e17] border border-blue-500/25 rounded-[3px] p-5 sm:p-7 space-y-6 shadow-xl text-xs font-sans">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wider">
                Terms of Service & Disclaimer of Liability
              </h1>
              <div className="text-[11px] text-slate-400 font-mono">
                Last Updated: October 27, 2026 · Governing Law: Czech Republic (EU)
              </div>
            </div>
            <span className="text-[10px] text-amber-400 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded-[2px] font-mono">
              Strict Limitation of Liability
            </span>
          </div>

          <div className="space-y-4 text-slate-300 leading-relaxed">
            {/* Disclaimer Alert Box */}
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-[2px] p-3 text-amber-200 text-xs space-y-1 font-mono">
              <div className="font-bold flex items-center gap-1.5 uppercase text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Critical Notice: Software Protocol Only — No Fiduciary or Custodial Relationship</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Verxl Protocol is an open-source decentralized clearing software router. By interacting with the smart contracts, APIs, or website, you acknowledge that compute clearing is non-custodial and software-driven. You assume all operational, financial, and technological risks.
              </p>
            </div>

            {/* Section 1 */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">1.</span>
                <span>Nature of the Software Protocol</span>
              </h2>
              <p>
                Verxl Protocol provides a decentralized technical coordination switch connecting autonomous AI developers with independent compute clusters. Verxl Protocol:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Does <strong>not</strong> own, operate, or maintain third-party GPU clusters or hardware servers.</li>
                <li>Does <strong>not</strong> act as a broker, custodian, financial advisor, bank, or exchange.</li>
                <li>Does <strong>not</strong> take custody, control, or possession of user cryptocurrency deposits or private keys.</li>
                <li>Operates solely on a non-custodial basis, charging a fixed 50 basis point (0.5%) clearing spread programmatically routed to Aragon OSx smart contracts on Arbitrum L2.</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">2.</span>
                <span>Disclaimer of Warranties ("AS IS" & "AS AVAILABLE")</span>
              </h2>
              <p className="uppercase text-[11px] font-mono text-slate-200 font-bold bg-[#05070b] p-3 border border-slate-800 rounded-[2px] leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE VERXL PROTOCOL, SMART CONTRACTS, APIs, AND WEBSITE ARE PROVIDED STRICTLY ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. THE PROTOCOL DEVELOPERS AND CONTRIBUTORS EXPRESSLY DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, ACCURACY, NON-INFRINGEMENT, AND UNINTERRUPTED OPERATION.
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">3.</span>
                <span>Comprehensive Limitation of Liability</span>
              </h2>
              <p>
                To the fullest extent permissible under Act No. 89/2012 Coll., the Civil Code of the Czech Republic, and relevant European Union directives:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>No Consequential Damages:</strong> In no event shall Verxl Protocol, its lead architects, contributors, developers, or affiliates be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages, including but not limited to loss of profits, loss of data, loss of goodwill, hardware downtime, loss of business opportunities, or smart contract bugs.</li>
                <li><strong>Absolute Aggregate Liability Cap:</strong> Under all circumstances, the total aggregate liability of the Protocol developers arising out of or related to your use of the services, whether in contract, tort (including negligence), or strict liability, shall be strictly capped at the lesser of: (i) fifty euros (€50.00 EUR); or (ii) the total protocol clearing fees paid by you to Verxl in the thirty (30) days preceding the incident.</li>
                <li><strong>Third-Party Model Outputs:</strong> Verxl routes requests to independent third-party models (e.g. DeepSeek, Qwen, MiMo). Verxl assumes zero liability for model accuracy, hallucinations, bias, omissions, or algorithmic errors produced by underlying weights.</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">4.</span>
                <span>Assumption of Blockchain & Cryptographic Risks</span>
              </h2>
              <p>
                By using Verxl Protocol, you acknowledge and agree that:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Cryptocurrency balances and Layer 2 transactions are subject to price volatility, blockchain consensus reorganizations, network forks, and gas fee fluctuations.</li>
                <li>Smart contracts are subject to inherent technological risks. You accept full responsibility for verifying contract code and auditing addresses.</li>
                <li>You are solely responsible for safeguarding your private keys, 2FA authenticator applications, and emergency recovery codes.</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">5.</span>
                <span>Acceptable Use Policy & EU AI Act Compliance</span>
              </h2>
              <p>
                You warrant and represent that you will not use Verxl Protocol to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Engage in illegal activities, terrorist financing, sanctions evasion, or automated malware and cyberweapon development.</li>
                <li>Deploy applications that violate Article 5 of the EU AI Act (Regulation (EU) 2024/1689), including biometric categorization, cognitive behavioral manipulation, or social scoring systems.</li>
                <li>Execute unauthorized penetration testing, denial-of-service floods, or prompt injection attacks intended to compromise compute provider hardware.</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">6.</span>
                <span>Governing Law & Exclusive Prague Jurisdiction</span>
              </h2>
              <p>
                These Terms of Service and any non-contractual obligations arising out of them shall be governed by, and construed in accordance with, the laws of the Czech Republic and applicable European Union law. Any dispute, controversy, or claim arising out of or relating to these Terms shall be submitted to the exclusive jurisdiction of the competent courts of Prague, Czech Republic.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT 3: EU MICA & REGULATORY STATEMENT */}
      {activeTab === "mica" && (
        <div className="bg-[#0a0e17] border border-blue-500/25 rounded-[3px] p-5 sm:p-7 space-y-6 shadow-xl text-xs font-sans">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wider">
                EU MiCA & Regulatory Compliance Statement
              </h1>
              <div className="text-[11px] text-slate-400 font-mono">
                Regulation (EU) 2023/1114 on Markets in Crypto-Assets (MiCA) & Non-Custodial Perimeter
              </div>
            </div>
            <span className="text-[10px] text-blue-400 border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 rounded-[2px] font-mono">
              Technical Exemption Status
            </span>
          </div>

          <div className="space-y-4 text-slate-300 leading-relaxed">
            {/* Executive Summary Card */}
            <div className="bg-[#05070b] border border-blue-500/30 p-4 rounded-[2px] space-y-2">
              <div className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Regulatory Summary: Non-Custodial Technical Switch</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Verxl Protocol operates strictly as an autonomous, decentralized software messaging and cryptographic routing layer. Under European Union financial regulations, including the <strong>Markets in Crypto-Assets Regulation (EU) 2023/1114 (MiCA)</strong> and <strong>Directive (EU) 2015/2366 (PSD2)</strong>, Verxl does not qualify as a Crypto-Asset Service Provider (CASP) or a Payment Institution.
              </p>
            </div>

            {/* Section 1: Non-Custodial Exemption */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">1.</span>
                <span>MiCA Recital 22 & Non-Custodial Router Exemption</span>
              </h2>
              <p>
                Pursuant to Recital 22 of MiCA (Regulation (EU) 2023/1114), purely decentralized software protocols that do not provide intermediation services through an identified central issuer or custodian fall outside the scope of authorization requirements:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>No Custody of Funds:</strong> User funds deposited on Arbitrum L2 are held in immutable, non-custodial smart contract vaults. Protocol contributors do not have unilateral access to transfer, seize, or pool user funds.</li>
                <li><strong>No Order Book Matching / Trading:</strong> Verxl does not operate an exchange, multilateral trading facility, or broker-dealer service. Compute fees are settled programmatically based on token volume at fixed smart contract rates.</li>
                <li><strong>No Proprietary Token Issuance on Mainnet:</strong> Staking operations utilize standard on-chain contracts. In accordance with testnet execution guidelines, $VRXL operates as an experimental utility governance instrument on Ethereum Sepolia.</li>
              </ul>
              <div className="bg-[#05070b] p-3 rounded-[2px] border border-slate-800 text-[10.5px] font-mono text-slate-400 space-y-1 mt-2">
                <div className="text-white font-bold">Important Jurisdictional Separation: MiCA vs. Data Privacy (GDPR / AI Act)</div>
                <p>
                  Regulation (EU) 2023/1114 (MiCA) addresses exclusively crypto-assets, capital adequacy, and financial custody. It does <em>not</em> regulate prompt storage, AI weights, or user telemetry. In-transit prompt streaming and data protection are governed independently by <strong>GDPR (Regulation (EU) 2016/679)</strong> and the <strong>EU AI Act (Regulation (EU) 2024/1689)</strong>. As detailed in our Privacy Policy, while Verxl operates statelessly without disk persistence, third-party upstream model hosts (such as DeepSeek and Xiaomi MiMo) maintain separate, independent data logging and storage practices on their own servers over which Verxl exercises no control.
                </p>
              </div>
            </div>

            {/* Section 2: EU AI Act Transparency */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">2.</span>
                <span>EU AI Act (Regulation (EU) 2024/1689) Article 50 Compliance</span>
              </h2>
              <p>
                In alignment with European Union AI governance directives:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>AI Disclosure:</strong> All outputs routed through the Protocol are generated by artificial intelligence models. Developers utilizing the endpoint are responsible for providing clear downstream disclosure to end-users as required by Article 50(2).</li>
                <li><strong>Model Cards & Provenance:</strong> The Verxl Model Registry exposes verifiable hardware architecture, quantization levels, and seed invariants for all clusters in the network.</li>
                <li><strong>Prohibited AI Systems:</strong> The Protocol maintains an automated blacklist preventing the deployment of high-risk prohibited AI systems under Article 5.</li>
              </ul>
            </div>

            {/* Section 3: Decentralized Governance & DAO Perimeter */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">3.</span>
                <span>Aragon OSx On-Chain DAO Governance Perimeter</span>
              </h2>
              <p>
                Protocol parameters, fee distribution ratios, and slashing adjustments are governed exclusively through the Aragon OSx DAO on Ethereum Sepolia and Arbitrum One. No individual or corporate entity retains administrative override keys, multi-sig backdoors, or arbitrary freeze capabilities over settled balances.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT 4: APPLIED BLOCKCHAIN COMPETITION CHARTER & IP ATTRIBUTION AGREEMENT */}
      {activeTab === "charter" && (
        <div className="bg-[#0a0e17] border border-blue-500/25 rounded-[3px] p-5 sm:p-7 space-y-6 shadow-xl text-xs font-sans">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wider">
                Applied Blockchain Competition Charter & IP Attribution
              </h1>
              <div className="text-[11px] text-slate-400 font-mono">
                Prague University of Economics and Business (VŠE Praha) · Czech Law (Act No. 121/2000 Coll. & Act No. 89/2012 Coll.)
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-[2px] font-mono">
              Sole Ownership & IP Protection
            </span>
          </div>

          <div className="space-y-4 text-slate-300 leading-relaxed text-[11px]">
            {/* Context Notice Box */}
            <div className="bg-[#05070b] border border-blue-500/30 p-3.5 rounded-[2px] space-y-1 font-mono text-[10.5px]">
              <div className="text-white font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Executive Context & Institutional Framework</span>
              </div>
              <p className="text-slate-400 font-sans">
                This charter establishes the definitive legal and intellectual property (IP) boundary for Verxl Protocol, launched as an applied blockchain and decentralized compute competition project at the Prague University of Economics and Business (VŠE Praha). The project brings together specialized competencies across software engineering, quality process auditing, and regulatory market strategy.
              </p>
            </div>

            {/* Section 1: Parties to the Charter */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">1.</span>
                <span>Parties to the Charter & Role Characterization</span>
              </h2>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>
                  <strong>Project Lead, Software Engineer & Sole Funder (Party A):</strong> Šimon Havlík. Conceived, coded, funded, and deployed the Verxl Protocol routing core, smart contracts, and bare-metal infrastructure fleet.
                </li>
                <li>
                  <strong>Founding Partners & Project Collaborators (Parties B & C):</strong> Daniel Kolárovský (Quality Assurance & Process Verification Lead) and Miroslava Valová (Regulatory Compliance & Market Strategy Lead). Directing independent quality benchmarking, SLA verification methodologies, and institutional market and compliance alignment.
                </li>
              </ul>
            </div>

            {/* Section 2: Intellectual Property & Non-Co-Authorship */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">2.</span>
                <span>Exclusive Intellectual Property Rights & Core Architecture (§ 2 & § 8 Autorského zákona)</span>
              </h2>
              <p>
                Pursuant to Act No. 121/2000 Coll. on Copyright (Autorský zákon):
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>
                  <strong>Exclusive IP Ownership (§ 2):</strong> 100.0% of all software source code, smart contracts (<code className="text-blue-300">VerxlStakingRegistry.sol</code>, <code className="text-blue-300">VerxlQualityOracle.sol</code>, <code className="text-blue-300">VerxlToken.sol</code>), deterministic <code className="text-blue-300">seed=42</code> verification algorithms, database schemas (PostgreSQL on Charizard), domains (<code className="text-blue-300">verxl.com</code>), and technical whitepapers are the sole, exclusive, and undivided property of Šimon Havlík.
                </li>
                <li>
                  <strong>Attribution & Authorship Scope (§ 8):</strong> The Collaborators confirm that their advisory review, empirical testing, and strategy formulation operate in support of the protocol and do not constitute co-authorship (*spoluautorství*) over core software or contract source code under Section 8 of the Copyright Act.
                </li>
                <li>
                  <strong>Confirmatory Assignment (§ 12 a násl.):</strong> To the maximum extent any peer feedback, review commentary, or project work product could be construed under law as copyrightable, all economic exploitation rights are assigned to Šimon Havlík on a worldwide, perpetual, and transferable basis.
                </li>
              </ul>
            </div>

            {/* Section 3: Financial Capital, Infrastructure & Risk Allocation */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">3.</span>
                <span>Financial Investment, Infrastructure Fleet & Risk Allocation</span>
              </h2>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>
                  <strong>100% Capital Provision:</strong> All operational expenses, domain acquisitions, server hosting costs (IONOS Charizard VM, Bulbasaur Prague Vulkan GPU node, Oracle Cloud Diglett VM, Cloudflare Workers edge proxy), and Web3 RPC nodes (Alchemy Ethereum & Arbitrum) are funded 100.0% by Šimon Havlík.
                </li>
                <li>
                  <strong>Complete Indemnification & Liability Release:</strong> Šimon Havlík assumes 100.0% of all commercial, regulatory (EU MiCA, GDPR, AI Act), operational, and financial liabilities. The Founding Collaborators are fully indemnified, held harmless, and released from any commercial or legal claims.
                </li>
              </ul>
            </div>

            {/* Section 4: Commercial Equity, Token Rights & Governance Role */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">4.</span>
                <span>Commercial Equity, Token Distribution & Governance Alignment</span>
              </h2>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>
                  <strong>Commercial Operating Entity:</strong> Verxl Protocol operates as an open-source research initiative and non-custodial decentralized clearinghouse. Founding assembly role allocations on presentation decks reflect functional governance domains within the VŠE competition initiative.
                </li>
                <li>
                  <strong>Non-Custodial Design:</strong> The protocol router never takes custody of user deposits; 99.5% of gross inference volume is cleared directly to independent GPU nodes in USDC, and 0.5% accumulates in the autonomous Aragon OSx DAO treasury vault.
                </li>
              </ul>
            </div>

            {/* Section 5: Competition Attribution Covenant */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">5.</span>
                <span>Competition Attribution Covenant</span>
              </h2>
              <p>
                Šimon Havlík covenants that Daniel Kolárovský and Miroslava Valová shall be fully credited as Founding Partners and Leads on all official competition deliverables, presentation decks, and technical dossiers submitted under the VŠE Praha applied blockchain project initiative.
              </p>
            </div>

            {/* Section 6: Governing Law & Jurisdiction */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="text-blue-400">6.</span>
                <span>Governing Law & Jurisdiction</span>
              </h2>
              <p>
                This Charter is governed exclusively by the laws of the Czech Republic, specifically Act No. 89/2012 Coll. (Civil Code) and Act No. 121/2000 Coll. (Copyright Act). Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts of Prague, Czech Republic.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
