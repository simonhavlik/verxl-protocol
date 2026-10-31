import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Scale, ShieldCheck, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LEGAL_VERSION = "2026-10-31";

type GateStatus = "idle" | "checking" | "required" | "accepted" | "error";

export const LegalGate: React.FC = () => {
  const { token, user } = useAuth();
  const [status, setStatus] = useState<GateStatus>("idle");
  const [age, setAge] = useState(false);
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const legalPath =
    typeof window !== "undefined" &&
    /^\/(terms|privacy|legal|mica|charter|unsubscribe)/.test(window.location.pathname);

  useEffect(() => {
    if (!token || !user) {
      setStatus("idle");
      return;
    }
    let cancelled = false;
    setStatus("checking");
    (async () => {
      try {
        const res = await fetch("/api/legal/consent", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;
        if (!res.ok) {
          setStatus("error");
          setError("We could not verify your legal acceptance. Check your connection and retry.");
          return;
        }
        const data = (await res.json()) as any;
        if (cancelled) return;
        if (data?.accepted === true) {
          setStatus("accepted");
        } else {
          setStatus("required");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setError("We could not verify your legal acceptance. Check your connection and retry.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, user?.id]);

  if (!token || !user || legalPath) return null;
  if (status === "idle" || status === "checking" || status === "accepted") return null;

  const accept = async () => {
    if (!age || !terms || !token || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/legal/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ageConfirmed: true, termsAccepted: true, termsVersion: LEGAL_VERSION }),
      });
      const data = (await res.json().catch(() => null)) as any;
      if (!res.ok || !data?.accepted) {
        setError(data?.error || "Could not record your acceptance. Retry.");
        return;
      }
      setStatus("accepted");
    } catch {
      setError("Network error. Your acceptance was not recorded; retry.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#020407]/90 p-4 backdrop-blur-md">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-gate-title"
        className="w-full max-w-[540px] border border-white/12 bg-[#080c10] shadow-2xl"
      >
        <div className="h-[2px] bg-[#b8f6dd]" />
        <div className="p-5 sm:p-7">
          <div className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.16em] text-[#b8f6dd]">
            <Scale className="h-3.5 w-3.5" />
            <span>Account / Legal</span>
          </div>
          <h2 id="legal-gate-title" className="mt-3 text-[25px] font-medium tracking-[-0.035em] text-white sm:text-[28px]">
            Before you continue.
          </h2>
          <p className="mt-2 text-[12px] leading-relaxed text-[#9aa7ad]">
            Verxl is an adult-only service. Your acceptance is recorded against this account and is required before
            using Chat, Playground, Registry or the API console.
          </p>

          <div className="mt-5 space-y-3 border-t border-white/[0.08] pt-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={age}
                onChange={(e) => setAge(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#b8f6dd]"
              />
              <span className="text-[11.5px] leading-relaxed text-[#d7e2de]">
                I confirm that I am <strong className="text-white">18 years of age or older</strong> and have legal
                capacity to enter into this agreement.
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#b8f6dd]"
              />
              <span className="text-[11.5px] leading-relaxed text-[#d7e2de]">
                I have read and accept the{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#b8f6dd] underline underline-offset-2">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#b8f6dd] underline underline-offset-2">
                  Privacy Policy
                </a>
                , including the age requirement and AI-output limitations.
              </span>
            </label>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 border border-amber-500/30 bg-amber-500/[0.06] p-2.5 text-[10.5px] leading-relaxed text-amber-200">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={accept}
            disabled={!age || !terms || submitting}
            className="mt-5 flex w-full items-center justify-center gap-2 bg-[#b8f6dd] px-4 py-3 text-[11px] font-semibold text-[#07110d] transition hover:bg-[#d7f8ec] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShieldCheck className="h-4 w-4" />
            {submitting ? "Recording acceptance…" : "Accept and continue"}
          </button>

          <p className="mt-3 font-mono text-[8px] leading-relaxed text-[#65737b]">
            Version {LEGAL_VERSION}. You can withdraw by deleting your account. Questions: support@verxl.com.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};
