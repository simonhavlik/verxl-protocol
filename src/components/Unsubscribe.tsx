import React, { useState } from "react";
import { Mail, Check, AlertTriangle } from "lucide-react";

export const Unsubscribe: React.FC = () => {
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("email") || "";
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => null)) as any;
      if (!res.ok) {
        setError(data?.error || "Could not save the preference.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setError("Network error. Retry.");
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#b8f6dd]">Email / Preferences</div>
      <h1 className="mt-2 text-[34px] font-medium tracking-[-0.04em] text-white">Unsubscribe.</h1>
      <p className="mt-3 text-[13px] leading-relaxed text-[#9aa7ad]">
        Verxl does not send newsletters, product marketing or promotional email. The only messages we send are
        transactional security emails: sign-in codes, account recovery and material service notices.
      </p>
      <p className="mt-2 text-[12px] leading-relaxed text-[#65737b]">
        You can record an opt-out from any future non-transactional email here. Transactional login emails continue
        while your account is active; deleting your account stops them.
      </p>

      {status === "done" ? (
        <div className="mt-8 border border-[#b8f6dd]/25 bg-[#b8f6dd]/[0.04] p-4">
          <div className="flex items-center gap-2 text-[12px] text-[#dff8ef]">
            <Check className="h-4 w-4 text-[#b8f6dd]" />
            <span>Preference recorded for {email}.</span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-[#9aa7ad]">
            No marketing email will be sent. Security and login emails remain transactional.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 border border-white/[0.08] bg-[#0b1117] p-4">
          <label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8b989e]">Email address</label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#65737b]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-10 w-full border border-white/[0.09] bg-[#05070b] pl-9 pr-3 text-[12px] text-white outline-none focus:border-[#b8f6dd]/50"
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="h-10 bg-[#b8f6dd] px-4 text-[10px] font-semibold text-[#07110d] disabled:opacity-50"
            >
              {status === "sending" ? "Saving…" : "Record opt-out"}
            </button>
          </div>
          {error && (
            <div className="mt-3 flex items-center gap-2 text-[10.5px] text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{error}</span>
            </div>
          )}
        </form>
      )}

      <p className="mt-6 text-[10.5px] leading-relaxed text-[#65737b]">
        Account deletion and data-rights requests: <a className="text-[#b8f6dd] underline underline-offset-2" href="mailto:support@verxl.com">support@verxl.com</a>.
        See the <a className="text-[#b8f6dd] underline underline-offset-2" href="/privacy">Privacy Policy</a>.
      </p>
    </div>
  );
};
