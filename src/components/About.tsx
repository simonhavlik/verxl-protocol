import React from "react";
import { ArrowRight, ArrowUpRight, Github, Mail } from "lucide-react";

interface AboutProps {
  onNavigate: (tab: string) => void;
}

const Eyebrow: React.FC<{ kicker: string; index: string }> = ({ kicker, index }) => (
  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#87959b]">
    <span className="h-1.5 w-1.5 bg-[#b8f6dd]" />
    <span>{kicker}</span>
    <span className="text-white/20">/ {index}</span>
  </div>
);

const SectionHead: React.FC<{
  kicker: string;
  index: string;
  title: React.ReactNode;
  copy: string;
}> = ({ kicker, index, title, copy }) => (
  <div>
    <Eyebrow kicker={kicker} index={index} />
    <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <h2 className="text-[clamp(2rem,4.2vw,3.8rem)] font-medium leading-[0.95] tracking-[-0.045em] text-[#f3f6f5]">
        {title}
      </h2>
      <p className="max-w-sm text-[14px] leading-relaxed text-[#a9b6bd]">{copy}</p>
    </div>
  </div>
);

export const About: React.FC<AboutProps> = ({ onNavigate }) => {
  return (
    <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="grid grid-cols-1 items-center gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-20">
        <div className="space-y-6 lg:col-span-7">
          <Eyebrow kicker="About" index="06" />

          <h1 className="text-[clamp(2.8rem,5.4vw,4.9rem)] font-medium leading-[0.93] tracking-[-0.055em] text-[#f3f6f5]">
            A small team.
            <br />
            <span className="text-[#8fa39b]">A narrow thesis.</span>
          </h1>

          <p className="max-w-[560px] text-[15px] leading-[1.65] text-[#a9b6bd]">
            Verxl is an applied blockchain project at VŠE Praha. We build a private, fast and affordable
            inference clearing layer: an OpenAI-compatible API, an encrypted chat and a non-custodial
            settlement path.
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate("vision")}
              className="inline-flex items-center gap-2 border border-[#b8f6dd]/35 bg-[#b8f6dd]/10 px-4 py-2.5 text-[12px] font-medium text-[#dff8ef] transition-colors hover:border-[#b8f6dd]/70 hover:bg-[#b8f6dd]/15"
            >
              Read the Vision
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <a
              href="mailto:havlik.simon@post.cz"
              className="inline-flex items-center gap-2 border border-white/12 px-4 py-2.5 text-[12px] font-medium text-[#c9d4d8] transition-colors hover:border-white/25 hover:text-white"
            >
              <Mail className="h-3.5 w-3.5" />
              Talk to us
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[9.5px] text-[#7d8a92]">
            <span>Prague, CZ</span>
            <span>·</span>
            <span>VŠE Praha</span>
            <span>·</span>
            <span>Sepolia</span>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="border border-white/10 bg-[#080c12]">
            <div className="border-b border-white/10 px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[#87959b]">
              Working note / 2026
            </div>
            <div className="p-5">
              <p className="text-[clamp(1.45rem,2.4vw,2.1rem)] font-medium leading-[1.15] tracking-[-0.035em] text-[#f3f6f5]">
                The model is not the product.
                <br />
                <span className="text-[#8fa39b]">The clearing is.</span>
              </p>
              <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-white/10 pt-4 font-mono text-[9px] uppercase tracking-[0.12em]">
                <div>
                  <div className="text-[#65737b]">Founded</div>
                  <div className="mt-1 text-[#dff8ef]">2026</div>
                </div>
                <div>
                  <div className="text-[#65737b]">Base</div>
                  <div className="mt-1 text-[#dff8ef]">Prague, CZ</div>
                </div>
                <div>
                  <div className="text-[#65737b]">Programme</div>
                  <div className="mt-1 text-[#dff8ef]">VŠE Praha</div>
                </div>
                <div>
                  <div className="text-[#65737b]">Boundary</div>
                  <div className="mt-1 text-[#b8f6dd]">Sepolia, not mainnet</div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 font-mono text-[8.5px] leading-relaxed text-[#65737b]">
            A one-host, three-model clearing layer. No fleet theatre, no token, no invented benchmarks.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <SectionHead
          kicker="The team"
          index="01"
          title={<>Three roles.<br /><span className="text-[#8fa39b]">One project.</span></>}
          copy="Verxl is a VŠE Praha applied blockchain project. Architecture, verification and governance operate as one small team."
        />

        <div className="mt-10 grid grid-cols-1 gap-8 border-t border-white/10 pt-8 md:grid-cols-3">
          {[
            {
              name: "Simon Havlík",
              role: "Founder / Lead Architect",
              bio: "Simon built the edge router, the clearing switch, the Prague Qwen host and the encrypted Chat. He is the lead architect of the VŠE Praha applied blockchain project.",
              image: "/team/simon-havlik.jpg",
              meta: "PROTOCOL · PRODUCT · INFRASTRUCTURE",
              links: true,
            },
            {
              name: "Daniel Kolárovský",
              role: "Head of Verification / SLA & Process",
              bio: "Daniel runs the empirical side: canary probes, SLA measurement and the process checks behind each release. The verification loop is part of the product, not a postscript.",
              image: "/team/daniel-kolarovsky.jpg",
              meta: "VERIFICATION · PROCESS · EVIDENCE",
              links: false,
            },
            {
              name: "Miroslava Valová",
              role: "Head of Compliance / Research & Governance",
              bio: "Miroslava leads regulatory scope, market research and institutional governance, including the MiCA/GDPR boundary, partner diligence and the protocol's public positioning.",
              image: "/team/miroslava-valova.jpg",
              meta: "COMPLIANCE · RESEARCH · GOVERNANCE",
              links: false,
            },
          ].map((member, i) => (
            <div key={member.name}>
              <div className="overflow-hidden border border-white/10 bg-[#080c12]">
                <img
                  src={member.image}
                  alt={member.name}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover object-top saturate-[.85]"
                />
              </div>
              <div className="mt-3 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.12em] text-[#65737b]">
                <span>Prague, CZ</span>
                <span>0{i + 1}</span>
              </div>
              <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-[#b8f6dd]/70">
                {member.role}
              </div>
              <h3 className="mt-1 text-[22px] font-medium tracking-[-0.025em] text-[#f3f6f5]">
                {member.name}
              </h3>
              <p className="mt-2 max-w-[330px] text-[13px] leading-relaxed text-[#9aa7ad]">{member.bio}</p>
              <div className="mt-3 font-mono text-[8px] uppercase tracking-[0.14em] text-[#65737b]">
                {member.meta}
              </div>
              {member.links && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[9.5px]">
                  <a
                    href="https://github.com/simonhavlik"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#9aa7ad] hover:text-white"
                  >
                    <Github className="h-3 w-3" />
                    GitHub
                    <ArrowUpRight className="h-2.5 w-2.5" />
                  </a>
                  <a
                    href="mailto:havlik.simon@post.cz"
                    className="inline-flex items-center gap-1 text-[#9aa7ad] hover:text-white"
                  >
                    <Mail className="h-3 w-3" />
                    Email
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-4 font-mono text-[9px] text-[#65737b] sm:flex-row sm:items-center sm:justify-between">
          <span>VŠE Praha applied blockchain project · Prague</span>
          <a
            href="https://github.com/simonhavlik/verxl-protocol"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#9aa7ad] hover:text-white"
          >
            Repository <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </section>

      {/* Beliefs */}
      <section className="py-16">
        <SectionHead
          kicker="Why we build it"
          index="02"
          title={<>Three beliefs.<br /><span className="text-[#8fa39b]">No slogans.</span></>}
          copy="The product is an argument. These are the parts of it we are willing to be judged on."
        />

        <div className="mt-10 grid grid-cols-1 border-t border-white/10 md:grid-cols-3 md:divide-x md:divide-white/10">
          {[
            {
              n: "01",
              title: "Models commoditize.",
              body: "Access, privacy and settlement do not. The durable layer is the clearing path between a request and a paid answer.",
            },
            {
              n: "02",
              title: "Privacy is architecture.",
              body: "Ciphertext at rest, keys in the browser. A policy promise is not a boundary; the data model has to make the promise true.",
            },
            {
              n: "03",
              title: "Claims must be inspectable.",
              body: "Every number carries a method and a limit. Unmeasured claims do not ship, and the boundary is stated before the feature.",
            },
          ].map((item) => (
            <div key={item.n} className="py-7 md:px-6 md:first:pl-0 md:last:pr-0">
              <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#b8f6dd]/70">{item.n}</div>
              <h3 className="mt-3 max-w-[240px] text-[22px] font-medium leading-[1.1] tracking-[-0.025em] text-[#f3f6f5]">
                {item.title}
              </h3>
              <p className="mt-3 max-w-[300px] text-[13px] leading-relaxed text-[#9aa7ad]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Record */}
      <section className="py-16">
        <SectionHead
          kicker="The record"
          index="03"
          title={<>What exists.<br /><span className="text-[#8fa39b]">Not what might.</span></>}
          copy="A short, deployed record. The horizon and its limits are on the Vision page."
        />

        <div className="mt-10 border-t border-white/10">
          {[
            ["2026", "VŠE Praha", "The applied blockchain project begins."],
            ["2026", "Prague", "Bare-metal Qwen host, edge routing and the first three-model catalogue."],
            ["2026", "Sepolia", "Clearing switch, DAO vault, OpenAI-compatible API and Playground."],
            ["2026", "Chat", "Client-side encrypted chat with wallet-derived keys and ciphertext-only storage."],
            ["Now", "Next", "MCP connections, external audit and more providers. Explicitly not mainnet, SLA or a token."],
          ].map(([year, title, body], i) => (
            <div
              key={`${year}_${title}`}
              className={`grid grid-cols-1 gap-2 py-5 sm:grid-cols-12 sm:items-baseline ${
                i > 0 ? "border-t border-white/10" : ""
              }`}
            >
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#65737b] sm:col-span-1">
                {year}
              </div>
              <div className="text-[17px] font-medium tracking-[-0.02em] text-[#f3f6f5] sm:col-span-3">
                {title}
              </div>
              <div className="max-w-2xl text-[13px] leading-relaxed text-[#9aa7ad] sm:col-span-8">{body}</div>
            </div>
          ))}
        </div>
        <button
          onClick={() => onNavigate("vision")}
          className="mt-6 inline-flex items-center gap-2 border border-white/12 px-4 py-2.5 text-[12px] font-medium text-[#c9d4d8] transition-colors hover:border-white/25 hover:text-white"
        >
          The auditable horizon
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </section>

      {/* Contact */}
      <section className="py-20">
        <div className="grid grid-cols-1 items-end gap-6 border-t border-white/10 pt-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(2rem,4.4vw,4rem)] font-medium leading-[0.95] tracking-[-0.05em] text-[#f3f6f5]">
              Talk to
              <br />
              <span className="text-[#8fa39b]">the builder.</span>
            </h2>
          </div>
          <div className="space-y-3 lg:col-span-5">
            <p className="text-[13.5px] leading-relaxed text-[#9aa7ad]">
              For research, partnerships, or a request that needs a human. We answer directly.
            </p>
            <div className="flex flex-wrap gap-3 font-mono text-[10px]">
              <a
                href="mailto:havlik.simon@post.cz"
                className="inline-flex items-center gap-1.5 border border-[#b8f6dd]/35 bg-[#b8f6dd]/10 px-3 py-2 text-[#dff8ef] hover:border-[#b8f6dd]/70"
              >
                <Mail className="h-3.5 w-3.5" />
                havlik.simon@post.cz
              </a>
              <a
                href="https://github.com/simonhavlik/verxl-protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 border border-white/12 px-3 py-2 text-[#c9d4d8] hover:border-white/25 hover:text-white"
              >
                <Github className="h-3.5 w-3.5" />
                Repository
                <ArrowUpRight className="h-3 w-3" />
              </a>
              <button
                onClick={() => onNavigate("charter")}
                className="inline-flex items-center gap-1.5 border border-white/12 px-3 py-2 text-[#c9d4d8] hover:border-white/25 hover:text-white"
              >
                Founders charter
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] text-[#65737b]">
          <span>Sepolia demonstration. Not a mainnet production system.</span>
          <span>VŠE Praha applied blockchain project · © 2026 Verxl Protocol</span>
        </div>
      </section>
    </div>
  );
};
