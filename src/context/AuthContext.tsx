"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface MFAEnrollResult {
  factorId: string;
  qrCode: string;       // SVG data URI for the QR code
  secret: string;        // TOTP secret for manual entry
  uri: string;           // otpauth:// URI
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ mfaRequired: boolean }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ needsConfirmation: boolean }>;
  logout: () => Promise<void>;
  // MFA
  enrollMFA: () => Promise<MFAEnrollResult>;
  verifyMFA: (factorId: string, code: string) => Promise<void>;
  getAssuranceLevel: () => Promise<{ currentLevel: string; nextLevel: string | null; currentFactor: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Check if MFA is enrolled
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const totpFactors = factorsData?.totp ?? [];
    const hasVerifiedFactor = totpFactors.some(f => f.status === "verified");

    if (hasVerifiedFactor) {
      // User has MFA — caller needs to handle the 2FA step
      return { mfaRequired: true };
    }

    // No MFA — go straight to home
    if (data.session) {
      router.push("/home");
    }
    return { mfaRequired: false };
  }, [router]);

  const signUp = useCallback(async (email: string, password: string, fullName: string, phone?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          ...(phone ? { phone_number: phone } : {}),
        },
      },
    });
    if (error) throw error;

    const needsConfirmation = !data.session;
    if (!needsConfirmation) {
      router.push("/home");
    }
    return { needsConfirmation };
  }, [router]);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.push("/login");
  }, [router]);

  // ── MFA functions ──────────────────────────────────────────────

  /** Enroll a new TOTP factor — returns QR code and secret */
  const enrollMFA = useCallback(async (): Promise<MFAEnrollResult> => {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Authenticator App",
    });
    if (error) throw error;
    return {
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      uri: data.totp.uri,
    };
  }, []);

  /** Verify a TOTP code against a factor — creates challenge + verifies */
  const verifyMFA = useCallback(async (factorId: string, code: string) => {
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });
    if (challengeError) throw challengeError;

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });
    if (verifyError) throw verifyError;

    // After successful MFA verification, redirect to home
    router.push("/home");
  }, [router]);

  /** Get current assurance level (aal1 vs aal2) */
  const getAssuranceLevel = useCallback(async () => {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) throw error;

    // Check enrolled factors
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const totpFactors = factorsData?.totp ?? [];
    const verifiedFactor = totpFactors.find(f => f.status === "verified");

    return {
      currentLevel: data.currentLevel ?? "aal1",
      nextLevel: data.nextLevel,
      currentFactor: verifiedFactor?.id ?? null,
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      login, signUp, logout,
      enrollMFA, verifyMFA, getAssuranceLevel,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

