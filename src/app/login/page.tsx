"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type Tab = "login" | "signup";

export default function LoginPage() {
  const { login, signUp, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("login");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [showSignupPw, setShowSignupPw] = useState(false);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError((err as Error).message ?? "Login failed.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!signupName || !signupEmail || !signupPhone || !signupPassword || !signupConfirm) {
      setError("Please fill in all fields."); return;
    }
    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    if (signupPassword !== signupConfirm) {
      setError("Passwords do not match."); return;
    }
    try {
      const { needsConfirmation } = await signUp(signupEmail, signupPassword, signupName, signupPhone);
      if (needsConfirmation) {
        setSuccessMsg("Account created! Please check your email to verify your account before logging in.");
        setSignupName(""); setSignupEmail(""); setSignupPhone(""); setSignupPassword(""); setSignupConfirm("");
      }
    } catch (err: unknown) {
      setError((err as Error).message ?? "Sign up failed.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Brand Header ──────────────────────────────────────── */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6 bg-gradient-to-b from-red-50 to-white">
        <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-200 mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Unity<span className="text-red-600">SOS</span>
        </h1>
        <p className="text-[13px] text-slate-500 font-medium mt-1">Emergency Response Platform</p>
      </div>

      {/* ── Tab Switcher ─────────────────────────────────────── */}
      <div className="px-6 mb-6">
        <div className="flex bg-slate-100 rounded-2xl p-1">
          {(["login", "signup"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); setSuccessMsg(""); }}
              className={`flex-1 py-3 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-200 ${
                tab === t
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {t === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error / Success Messages ─────────────────────────── */}
      <div className="px-6">
        {error && (
          <div className="mb-4 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl animate-fade-up">
            <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <p className="text-[13px] text-red-600 font-medium">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-start gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl animate-fade-up">
            <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <p className="text-[13px] text-emerald-700 font-medium">{successMsg}</p>
          </div>
        )}
      </div>

      {/* ── Forms ─────────────────────────────────────────────── */}
      <div className="flex-1 px-6 pb-10">

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 mb-1">Welcome back</h2>
            <p className="text-[13px] text-slate-500 mb-4">Sign in to access your dashboard</p>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg className="w-[17px] h-[17px] text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" autoComplete="email"
                  className="w-full pl-11 pr-4 py-[14px] rounded-2xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 focus:bg-white transition-all"/>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg className="w-[17px] h-[17px] text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input id="login-password" type={showPw ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-[14px] rounded-2xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 focus:bg-white transition-all"/>
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600">
                  <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPw
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button id="login-submit" type="submit" disabled={loading}
              className="w-full py-[15px] rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold text-[14px] tracking-wide shadow-lg shadow-red-200 hover:shadow-red-300 hover:from-red-500 hover:to-rose-400 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in…</>
                : <>Sign In<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></>
              }
            </button>

            {/* Admin link */}
            <p className="text-center text-[13px] text-slate-500 mt-4">
              Admin?{" "}
              <Link href="/admin/login" className="text-red-600 font-bold hover:text-red-500">Admin login →</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 mb-1">Create account</h2>
            <p className="text-[13px] text-slate-500 mb-4">Join the emergency response network</p>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg className="w-[17px] h-[17px] text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <input id="signup-name" type="text" value={signupName} onChange={e => setSignupName(e.target.value)}
                  placeholder="Your full name" autoComplete="name"
                  className="w-full pl-11 pr-4 py-[14px] rounded-2xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 focus:bg-white transition-all"/>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg className="w-[17px] h-[17px] text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <input id="signup-email" type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                  placeholder="you@example.com" autoComplete="email"
                  className="w-full pl-11 pr-4 py-[14px] rounded-2xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 focus:bg-white transition-all"/>
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg className="w-[17px] h-[17px] text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </div>
                <input id="signup-phone" type="tel" value={signupPhone} onChange={e => setSignupPhone(e.target.value)}
                  placeholder="+91 98765 43210" autoComplete="tel"
                  className="w-full pl-11 pr-4 py-[14px] rounded-2xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 focus:bg-white transition-all"/>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg className="w-[17px] h-[17px] text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input id="signup-password" type={showSignupPw ? "text" : "password"} value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)} placeholder="Min 6 characters" autoComplete="new-password"
                  className="w-full pl-11 pr-12 py-[14px] rounded-2xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 focus:bg-white transition-all"/>
                <button type="button" onClick={() => setShowSignupPw(!showSignupPw)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600">
                  <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showSignupPw
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg className="w-[17px] h-[17px] text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <input id="signup-confirm" type="password" value={signupConfirm}
                  onChange={e => setSignupConfirm(e.target.value)} placeholder="Re-enter password" autoComplete="new-password"
                  className="w-full pl-11 pr-4 py-[14px] rounded-2xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 focus:bg-white transition-all"/>
              </div>
            </div>

            {/* Submit */}
            <button id="signup-submit" type="submit" disabled={loading}
              className="w-full py-[15px] rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold text-[14px] tracking-wide shadow-lg shadow-red-200 hover:shadow-red-300 hover:from-red-500 hover:to-rose-400 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating account…</>
                : <>Create Account<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></>
              }
            </button>

            {/* Email verification note */}
            <div className="mt-4 p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex gap-2.5">
              <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              <p className="text-[12px] text-blue-700 leading-relaxed">
                A verification email will be sent to confirm your account before you can log in.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
