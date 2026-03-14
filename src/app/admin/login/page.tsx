"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type Step = "credentials" | "2fa" | "setup-2fa";

export default function AdminLoginPage() {
  const { login, enrollMFA, verifyMFA, getAssuranceLevel, loading } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [step, setStep]         = useState<Step>("credentials");
  const [otp, setOtp]           = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);

  // MFA state
  const [factorId, setFactorId]   = useState<string | null>(null);
  const [qrCode, setQrCode]       = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("All fields are required."); return; }

    try {
      const { mfaRequired } = await login(email, password);
      if (mfaRequired) {
        // User has MFA enrolled — go to verification step
        const assurance = await getAssuranceLevel();
        if (assurance.currentFactor) {
          setFactorId(assurance.currentFactor);
          setStep("2fa");
        }
      } else {
        // No MFA enrolled yet — auto-enroll now (user is authenticated at this point)
        try {
          const result = await enrollMFA();
          setFactorId(result.factorId);
          setQrCode(result.qrCode);
          setTotpSecret(result.secret);
          setStep("setup-2fa");
        } catch {
          // If MFA enrollment fails (e.g. not enabled in Supabase), just go to home
          // login() would have already redirected, but ensure it here
        }
      }
    } catch (err: unknown) {
      setError((err as Error).message ?? "Authentication failed.");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length !== 6) { setError("Please enter a 6-digit code."); return; }
    if (!factorId) { setError("MFA factor not found."); return; }

    setVerifying(true);
    try {
      await verifyMFA(factorId, code);
      // verifyMFA redirects to /home on success
    } catch (err: unknown) {
      setError((err as Error).message ?? "Invalid verification code.");
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleOtp = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp]; next[index] = value; setOtp(next);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  // Auto-focus first OTP input when switching to 2FA step
  useEffect(() => {
    if (step === "2fa" || step === "setup-2fa") {
      setTimeout(() => document.getElementById("otp-0")?.focus(), 100);
    }
  }, [step]);

  const stepLabels = step === "setup-2fa"
    ? ["Credentials", "Setup 2FA"]
    : ["Credentials", "2FA Verify"];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-14 pb-6 bg-white border-b border-red-100">
        <Link href="/login" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/15 active:scale-95 transition-all">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
          </svg>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/30">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
          <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Admin Portal</span>
        </div>
        <div className="w-9"/>
      </div>

      {/* ── Brand ────────────────────────────────────────────────── */}
      <div className="px-5 mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-900">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-[22px] font-black text-slate-900 tracking-tight">
              Unity<span className="text-red-600">SOS</span>
            </h1>
            <p className="text-[11px] text-red-600 font-semibold uppercase tracking-wider">Control Center</p>
          </div>
        </div>

        <h2 className="text-[26px] font-black text-slate-900 leading-tight mb-1">
          {step === "credentials"
            ? "Administrator\nSign In"
            : step === "setup-2fa"
              ? "Setup Two-Factor\nAuthentication"
              : "Two-Factor\nVerification"}
        </h2>
        <p className="text-[13px] text-slate-600 font-medium">
          {step === "credentials"
            ? "Restricted access — authorised personnel only"
            : step === "setup-2fa"
              ? "Scan the QR code with your authenticator app"
              : "Enter the 6-digit code from your authenticator app"}
        </p>
      </div>

      {/* ── Step indicators ──────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-5 mb-7">
        {stepLabels.map((label, i) => {
          const active = (i === 0 && step === "credentials") || (i === 1 && (step === "2fa" || step === "setup-2fa"));
          const done   = i === 0 && (step === "2fa" || step === "setup-2fa");
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${done ? "bg-red-600" : active ? "bg-red-500" : "bg-red-100"}`}>
                {done
                  ? <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  : <span className={active ? "text-white" : "text-red-600"}>{i + 1}</span>
                }
              </div>
              <span className={`text-[12px] font-semibold ${active ? "text-red-700" : done ? "text-red-700" : "text-slate-600"}`}>{label}</span>
              {i < 1 && <div className={`flex-1 h-px mx-1 w-8 ${done ? "bg-red-600" : "bg-red-200"}`}/>}
            </div>
          );
        })}
      </div>

      {/* ── Form ─────────────────────────────────────────────────── */}
      <div className="flex-1 px-5 pb-10">
        {error && (
          <div className="mb-5 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl animate-fade-up">
            <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <p className="text-[13px] text-red-600 font-medium">{error}</p>
          </div>
        )}

        {step === "credentials" ? (
          <form onSubmit={handleCredentials} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Admin Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg className="w-[17px] h-[17px] text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@unitysos.com" autoComplete="email"
                  className="w-full pl-11 pr-4 py-[14px] rounded-2xl border border-red-200 bg-white text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"/>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg className="w-[17px] h-[17px] text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input type={showPw ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-[14px] rounded-2xl border border-red-200 bg-white text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"/>
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 right-4 flex items-center text-red-600 hover:text-red-500">
                  <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPw
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center -mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-red-500"/>
                <span className="text-[12px] text-gray-500 font-medium">Remember this device</span>
              </label>
              <Link href="/forgot-password" className="text-[12px] font-semibold text-red-500 hover:text-red-400">
                Forgot?
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-[15px] rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-[14px] tracking-wide shadow-lg shadow-red-200 hover:from-red-500 hover:to-red-400 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Authenticating…</>
                : <>Continue<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></>
              }
            </button>

            {/* 2FA info notice */}
            <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex gap-2.5">
              <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <p className="text-[12px] text-amber-800 leading-relaxed font-medium">
                Admin accounts require 2FA. After sign-in, you&apos;ll be prompted to set up your authenticator app if not already configured.
              </p>
            </div>
          </form>
        ) : step === "setup-2fa" ? (
          /* ── 2FA Setup: QR code + verify ────────────────────────── */
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            {qrCode && (
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white rounded-2xl border border-red-100 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCode} alt="TOTP QR Code" className="w-48 h-48"/>
                </div>
                <p className="text-[12px] text-slate-500 text-center max-w-[260px]">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>

                {/* Manual secret */}
                {totpSecret && (
                  <div className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Manual Entry Key</p>
                    <p className="text-[13px] font-mono font-bold text-slate-700 tracking-widest break-all select-all">
                      {totpSecret}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* OTP verification after scanning */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block text-center">
                Enter code from authenticator
              </label>
              <div className="flex gap-2.5 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i} id={`otp-${i}`}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtp(i, e.target.value)}
                    onKeyDown={e => { if (e.key === "Backspace" && !digit && i > 0) document.getElementById(`otp-${i - 1}`)?.focus(); }}
                    className="w-11 h-14 rounded-2xl border border-red-200 bg-red-50/30 text-center text-slate-900 text-[20px] font-black focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                  />
                ))}
              </div>
            </div>

            <button type="submit" disabled={verifying}
              className="w-full py-[15px] rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-[14px] tracking-wide shadow-lg shadow-red-200 hover:from-red-500 hover:to-red-400 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {verifying
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Verifying…</>
                : <>Verify & Enable 2FA</>
              }
            </button>

            <button type="button" onClick={() => { setStep("credentials"); setOtp(["","","","","",""]); setError(""); }}
              className="w-full text-center text-[12px] text-red-600 hover:text-red-500 font-semibold">
              ← Back to credentials
            </button>
          </form>
        ) : (
          /* ── 2FA Verify (returning user with MFA enrolled) ────── */
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="flex flex-col items-center gap-3 mb-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <p className="text-[13px] text-slate-500 text-center">
                Open your authenticator app and enter the 6-digit code
              </p>
            </div>

            <div className="flex gap-2.5 justify-center">
              {otp.map((digit, i) => (
                <input
                  key={i} id={`otp-${i}`}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={e => handleOtp(i, e.target.value)}
                  onKeyDown={e => { if (e.key === "Backspace" && !digit && i > 0) document.getElementById(`otp-${i - 1}`)?.focus(); }}
                  className="w-11 h-14 rounded-2xl border border-red-200 bg-red-50/30 text-center text-slate-900 text-[20px] font-black focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                />
              ))}
            </div>

            <button type="submit" disabled={verifying}
              className="w-full py-[15px] rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-[14px] tracking-wide shadow-lg shadow-red-200 hover:from-red-500 hover:to-red-400 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {verifying
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Verifying…</>
                : <>Verify & Access Control Center</>
              }
            </button>

            <button type="button" onClick={() => { setStep("credentials"); setOtp(["","","","","",""]); setError(""); }}
              className="w-full text-center text-[12px] text-red-600 hover:text-red-500 font-semibold">
              ← Back to credentials
            </button>
          </form>
        )}

        {/* Security notice */}
        <div className="mt-8 p-4 rounded-2xl bg-red-50 border border-red-200 flex gap-3">
          <svg className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
          </svg>
          <p className="text-[12px] text-slate-700 leading-relaxed">
            This is a secure admin session. All activity is logged and monitored. Unauthorized access attempts are reported.
          </p>
        </div>

        {/* User portal link */}
        <p className="text-center text-[13px] text-slate-600 mt-6">
          Not an admin?{" "}
          <Link href="/login" className="text-red-600 font-bold hover:text-red-500">Responder login →</Link>
        </p>
      </div>
    </div>
  );
}
