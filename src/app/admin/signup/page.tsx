"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type Step = "account" | "identity" | "access" | "done";

const STEPS: Step[] = ["account", "identity", "access", "done"];

const STEP_META: Record<Step, { label: string; title: string; sub: string }> = {
  account:  { label: "Account",  title: "Create Your\nAdmin Account",  sub: "Start with your login credentials" },
  identity: { label: "Identity", title: "Verify Your\nIdentity",       sub: "Tell us who you are" },
  access:   { label: "Access",   title: "Access &\nPermissions",       sub: "Configure your admin privileges" },
  done:     { label: "Done",     title: "Account\nCreated!",           sub: "Welcome to the control center" },
};

interface FormData {
  fullName:    string;
  email:       string;
  phone:       string;
  password:    string;
  confirmPw:   string;
  department:  string;
  adminCode:   string;
  role:        string;
  agreed:      boolean;
}

const ROLES = [
  { id: "super_admin",     label: "Super Admin",     icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", desc: "Full system access" },
  { id: "ops_admin",       label: "Operations",      icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7", desc: "Dispatch & field ops" },
  { id: "data_admin",      label: "Data & Reports",  icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", desc: "Analytics & reporting" },
  { id: "support_admin",   label: "Support",         icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", desc: "User support & help" },
];

export default function AdminSignupPage() {
  const { signUp, loading } = useAuth();
  const [step, setStep] = useState<Step>("account");
  const [showPw, setShowPw]   = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [error, setError]     = useState("");

  const [form, setForm] = useState<FormData>({
    fullName:   "",
    email:      "",
    phone:      "",
    password:   "",
    confirmPw:  "",
    department: "",
    adminCode:  "",
    role:       "",
    agreed:     false,
  });

  const set = (key: keyof FormData, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const stepIndex = STEPS.indexOf(step);
  const progress  = ((stepIndex) / (STEPS.length - 1)) * 100;

  // ── Validation per step ────────────────────────────────────────
  const validateStep = (): string => {
    if (step === "account") {
      if (!form.email)    return "Email is required.";
      if (!/\S+@\S+\.\S+/.test(form.email)) return "Enter a valid email address.";
      if (!form.password) return "Password is required.";
      if (form.password.length < 8) return "Password must be at least 8 characters.";
      if (form.password !== form.confirmPw) return "Passwords do not match.";
    }
    if (step === "identity") {
      if (!form.fullName)   return "Full name is required.";
      if (!form.department) return "Department is required.";
    }
    if (step === "access") {
      if (!form.role)      return "Please select an admin role.";
      if (!form.adminCode) return "Admin invite code is required.";
      if (!form.agreed)    return "You must accept the terms to continue.";
    }
    return "";
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    try {
      // signUp with "admin" role — invite code should be verified server-side
      await signUp(form.email, form.password, form.fullName);
      setStep("done");
    } catch (err: unknown) {
      setError((err as Error).message ?? "Sign up failed.");
    }
  };

  // ── Password strength ──────────────────────────────────────────
  const pwStrength = (() => {
    const p = form.password;
    let score = 0;
    if (p.length >= 8)  score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const pwLabels  = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const pwColors  = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400", "bg-emerald-500"];
  const pwTextCol = ["", "text-red-500", "text-orange-500", "text-yellow-500", "text-green-500", "text-emerald-500"];

  return (
    <div className="min-h-screen bg-white flex flex-col select-none">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-b from-red-50 via-rose-50 to-white overflow-hidden">
        {/* Subtle rings — smaller, calmer than login */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[96, 72, 52].map((size, i) => (
            <span key={i} className="absolute rounded-full border border-red-200 opacity-50"
              style={{ width: `${size * 4}px`, height: `${size * 4}px` }}/>
          ))}
        </div>

        {/* Top nav */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-3">
          <Link href="/admin/login"
            className="w-9 h-9 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
            <div className="w-2 h-2 rounded-full bg-red-500"/>
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Admin Signup</span>
          </div>
          <div className="w-9"/>
        </div>

        {/* Brand + icon */}
        <div className="relative z-10 flex flex-col items-center pt-3 pb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-xl shadow-red-300 mb-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <h1 className="text-[24px] font-black tracking-tight">
            <span className="text-gray-900">Unity</span><span className="text-red-500">SOS</span>
          </h1>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Control Center</p>
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────────────────────── */}
      {step !== "done" && (
        <div className="px-5 pt-5 pb-2">
          {/* Step labels */}
          <div className="flex justify-between mb-2.5">
            {STEPS.filter(s => s !== "done").map((s, i) => {
              const idx    = STEPS.indexOf(s);
              const active = s === step;
              const done   = idx < stepIndex;
              return (
                <div key={s} className="flex flex-col items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300
                    ${done   ? "bg-red-500 text-white shadow-md shadow-red-200"
                    : active ? "bg-white border-2 border-red-500 text-red-500"
                    :          "bg-gray-100 text-gray-400"}`}>
                    {done
                      ? <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      : i + 1
                    }
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wide
                    ${active ? "text-red-500" : done ? "text-gray-500" : "text-gray-300"}`}>
                    {STEP_META[s].label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Progress track */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}/>
          </div>
        </div>
      )}

      {/* ── Step heading ─────────────────────────────────────────── */}
      {step !== "done" && (
        <div className="px-5 pt-6 pb-2">
          <h2 className="text-[22px] font-black text-gray-900 leading-tight whitespace-pre-line">
            {STEP_META[step].title}
          </h2>
          <p className="text-[13px] text-gray-400 font-medium mt-1">{STEP_META[step].sub}</p>
        </div>
      )}

      {/* ── Form body ─────────────────────────────────────────────── */}
      <div className="flex-1 px-5 pb-12">
        {/* Error banner */}
        {error && (
          <div className="mt-4 mb-2 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl">
            <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <p className="text-[13px] text-red-600 font-medium leading-snug">{error}</p>
          </div>
        )}

        {/* ── STEP 1: Account ─────────────────────────────────────── */}
        {step === "account" && (
          <div className="mt-5 space-y-4">
            {/* Email */}
            <Field label="Admin Email" icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
              <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                placeholder="admin@unitysos.com" autoComplete="email"
                className={inputCls}/>
            </Field>

            {/* Password */}
            <Field label="Password" icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z">
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={form.password}
                  onChange={e => set("password", e.target.value)}
                  placeholder="Min. 8 characters" autoComplete="new-password"
                  className={inputCls + " pr-12"}/>
                <EyeBtn show={showPw} onToggle={() => setShowPw(!showPw)}/>
              </div>
            </Field>

            {/* Password strength */}
            {form.password.length > 0 && (
              <div className="-mt-2 space-y-1.5">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= pwStrength ? pwColors[pwStrength] : "bg-gray-100"}`}/>
                  ))}
                </div>
                <p className={`text-[11px] font-bold ${pwTextCol[pwStrength]}`}>
                  {pwStrength > 0 ? `Password strength: ${pwLabels[pwStrength]}` : ""}
                </p>
              </div>
            )}

            {/* Confirm password */}
            <Field label="Confirm Password" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z">
              <div className="relative">
                <input type={showCPw ? "text" : "password"} value={form.confirmPw}
                  onChange={e => set("confirmPw", e.target.value)}
                  placeholder="Re-enter password" autoComplete="new-password"
                  className={inputCls + " pr-12 " + (form.confirmPw && form.confirmPw !== form.password ? "ring-2 ring-red-300 border-transparent" : form.confirmPw && form.confirmPw === form.password ? "ring-2 ring-green-300 border-transparent" : "")}/>
                <EyeBtn show={showCPw} onToggle={() => setShowCPw(!showCPw)}/>
                {form.confirmPw && (
                  <div className="absolute inset-y-0 right-10 flex items-center pointer-events-none pr-1">
                    {form.confirmPw === form.password
                      ? <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      : <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                    }
                  </div>
                )}
              </div>
            </Field>
          </div>
        )}

        {/* ── STEP 2: Identity ────────────────────────────────────── */}
        {step === "identity" && (
          <div className="mt-5 space-y-4">
            <Field label="Full Name" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
              <input type="text" value={form.fullName} onChange={e => set("fullName", e.target.value)}
                placeholder="Dr. Jane Smith" autoComplete="name"
                className={inputCls}/>
            </Field>

            <Field label="Phone Number" icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z">
              <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)}
                placeholder="+91 98765 43210" autoComplete="tel"
                className={inputCls}/>
            </Field>

            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Department</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg className="w-[17px] h-[17px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
                <select value={form.department} onChange={e => set("department", e.target.value)}
                  className={inputCls + " appearance-none cursor-pointer"}>
                  <option value="">Select department…</option>
                  {["Emergency Operations", "Disaster Management", "Medical Services", "Fire & Rescue", "Law Enforcement", "Logistics & Coordination", "IT & Systems"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* ID preview card */}
            {(form.fullName || form.department) && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-lg font-black shadow-md shadow-red-200">
                  {form.fullName.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-gray-800">{form.fullName || "—"}</p>
                  <p className="text-[12px] text-gray-500">{form.department || "No department"}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-[10px] font-black text-red-500 bg-red-100 px-2 py-1 rounded-full uppercase tracking-wider">Admin</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Access ──────────────────────────────────────── */}
        {step === "access" && (
          <div className="mt-5 space-y-5">
            {/* Role picker */}
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-3">Admin Role</label>
              <div className="grid grid-cols-2 gap-2.5">
                {ROLES.map(r => (
                  <button key={r.id} type="button" onClick={() => set("role", r.id)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all active:scale-[0.97]
                      ${form.role === r.id
                        ? "border-red-500 bg-red-50 shadow-md shadow-red-100"
                        : "border-gray-100 bg-gray-50 hover:border-gray-200"}`}>
                    <div className={`w-9 h-9 rounded-xl mb-2.5 flex items-center justify-center
                      ${form.role === r.id ? "bg-red-500" : "bg-gray-200"}`}>
                      <svg className={`w-4.5 h-4.5 w-[18px] h-[18px] ${form.role === r.id ? "text-white" : "text-gray-500"}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={r.icon}/>
                      </svg>
                    </div>
                    <p className={`text-[13px] font-bold leading-tight ${form.role === r.id ? "text-red-600" : "text-gray-700"}`}>{r.label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Admin invite code */}
            <Field label="Admin Invite Code" icon="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z">
              <input type="text" value={form.adminCode} onChange={e => set("adminCode", e.target.value)}
                placeholder="ADMIN-XXXX-XXXX" autoComplete="off" spellCheck={false}
                className={inputCls + " font-mono tracking-widest uppercase"}/>
            </Field>
            <p className="text-[12px] text-gray-400 -mt-2 pl-1">
              Contact your system administrator for an invite code.
            </p>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all">
              <div className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all
                ${form.agreed ? "bg-red-500 border-red-500" : "border-gray-300 bg-white"}`}
                onClick={() => set("agreed", !form.agreed)}>
                {form.agreed && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
              </div>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                I agree to the{" "}
                <span className="text-red-500 font-bold">Admin Terms of Service</span> and{" "}
                <span className="text-red-500 font-bold">Data Privacy Policy</span>.
                I understand my actions are logged and monitored.
              </p>
            </label>
          </div>
        )}

        {/* ── STEP 4: Done ────────────────────────────────────────── */}
        {step === "done" && (
          <div className="mt-8 flex flex-col items-center text-center gap-5">
            {/* Success animation */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-2xl shadow-red-300">
                <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-red-100 flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>

            <div>
              <h2 className="text-[26px] font-black text-gray-900">Welcome, {form.fullName.split(" ")[0]}!</h2>
              <p className="text-[14px] text-gray-400 mt-1.5 leading-relaxed max-w-xs">
                Your admin account has been created. Check your email to verify your address before signing in.
              </p>
            </div>

            {/* Summary card */}
            <div className="w-full p-5 rounded-3xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 text-left space-y-3">
              {[
                { label: "Email",      value: form.email },
                { label: "Name",       value: form.fullName },
                { label: "Department", value: form.department },
                { label: "Role",       value: ROLES.find(r => r.id === form.role)?.label ?? form.role },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
                  <span className="text-[13px] font-bold text-gray-700">{value || "—"}</span>
                </div>
              ))}
            </div>

            <Link href="/admin/login"
              className="w-full py-[15px] rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-[14px] tracking-wide shadow-lg shadow-red-200 hover:from-red-600 hover:to-red-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              Go to Admin Login
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </Link>
          </div>
        )}

        {/* ── Navigation buttons ────────────────────────────────── */}
        {step !== "done" && (
          <div className="mt-8 space-y-3">
            {step === "access" ? (
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="w-full py-[15px] rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-[14px] tracking-wide shadow-lg shadow-red-200 hover:from-red-600 hover:to-red-700 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {loading
                  ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating account…</>
                  : <>Create Admin Account<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></>
                }
              </button>
            ) : (
              <button type="button" onClick={nextStep}
                className="w-full py-[15px] rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-[14px] tracking-wide shadow-lg shadow-red-200 hover:from-red-600 hover:to-red-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                Continue
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </button>
            )}

            {stepIndex > 0 && (
              <button type="button" onClick={() => { setError(""); setStep(STEPS[stepIndex - 1]); }}
                className="w-full py-[15px] rounded-2xl bg-gray-100 text-gray-600 font-bold text-[14px] text-center hover:bg-gray-200 active:scale-[0.98] transition-all">
                ← Back
              </button>
            )}
          </div>
        )}

        {/* ── Footer link ─────────────────────────────────────────── */}
        {step !== "done" && (
          <p className="text-center text-[13px] text-gray-400 mt-7">
            Already have an account?{" "}
            <Link href="/admin/login" className="text-red-500 font-bold hover:text-red-600">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────

const inputCls =
  "w-full pl-11 pr-4 py-[14px] rounded-2xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all";

function Field({
  label, icon, children,
}: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
          <svg className="w-[17px] h-[17px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon}/>
          </svg>
        </div>
        {children}
      </div>
    </div>
  );
}

function EyeBtn({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}
      className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 z-10">
      <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {show
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
          : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
        }
      </svg>
    </button>
  );
}
