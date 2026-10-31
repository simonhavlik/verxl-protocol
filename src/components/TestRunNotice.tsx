import React from "react";
import { AlertTriangle, ArrowLeft, FileText, Mail } from "lucide-react";

export const TestRunNotice: React.FC = () => (
  <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
    <div className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.16em] text-[#b8f6dd]">
      <span className="h-1 w-1 bg-[#b8f6dd]" />
      <span>Notice / Test run</span>
    </div>
    <h1 className="mt-3 text-[38px] font-medium leading-[1.02] tracking-[-0.045em] text-white sm:text-[50px]">
      This is a test run.
    </h1>
    <p className="mt-5 max-w-2xl text-[13.5px] leading-relaxed text-[#9aa7ad]">
      Verxl Protocol is currently a research and demonstration project. No company, limited liability entity or
      other commercial legal entity has been established to operate it. It is run as an individual project by
      Simon Havlík in Prague, Czech Republic.
    </p>

    <div className="mt-8 border border-white/[0.09] bg-[#0b1117]">
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-3 text-[11px] text-[#d7e2de]">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        <span>What that means in practice</span>
      </div>
      <div className="divide-y divide-white/[0.06]">
        {[
          ["Status", "Experimental test/demonstration deployment. Not a production service."],
          ["Operator", "An individual research project, not a registered company."],
          ["Liability", "There is no corporate liability shield or established commercial entity behind the deployment."],
          ["Funds", "Do not send funds you cannot afford to lose. Blockchain transactions are irreversible."],
          ["Service level", "No production SLA, uptime guarantee or commercial support commitment."],
          ["Legal documents", "Terms and policies are working drafts pending entity formation and professional legal review."],
        ].map(([label, text]) => (
          <div key={label} className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[130px_1fr] sm:gap-4">
            <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#65737b]">{label}</div>
            <div className="text-[11.5px] leading-relaxed text-[#c9d4d8]">{text}</div>
          </div>
        ))}
      </div>
    </div>

    <div className="mt-6 space-y-3 text-[11.5px] leading-relaxed text-[#8b989e]">
      <p>
        The site uses a Sepolia test deployment and an experimental clearing path. Model outputs are probabilistic and
        may be wrong. Do not rely on this deployment for regulated, safety-critical, financial, medical or legal
        decisions.
      </p>
      <p>
        If you need a contract with an established legal entity, a production data-processing agreement or a
        regulated financial service, do not use this deployment yet.
      </p>
    </div>

    <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-white/[0.08] pt-5">
      <a href="/terms" className="inline-flex items-center gap-2 border border-white/[0.1] px-3 py-2 text-[10px] text-[#c9d4d8] transition hover:border-white/25 hover:text-white">
        <FileText className="h-3.5 w-3.5" /> Terms
      </a>
      <a href="/privacy" className="inline-flex items-center gap-2 border border-white/[0.1] px-3 py-2 text-[10px] text-[#c9d4d8] transition hover:border-white/25 hover:text-white">
        <FileText className="h-3.5 w-3.5" /> Privacy
      </a>
      <a href="mailto:me@simonhavlik.com" className="inline-flex items-center gap-2 px-3 py-2 text-[10px] text-[#9aa7ad] transition hover:text-white">
        <Mail className="h-3.5 w-3.5" /> me@simonhavlik.com
      </a>
      <a href="/" className="ml-auto inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-[#b8f6dd]">
        <ArrowLeft className="h-3 w-3" /> Back to site
      </a>
    </div>
  </div>
);
