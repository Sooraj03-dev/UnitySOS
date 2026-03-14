"use client";

import { useState } from "react";

export function useAuth() {
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string, role: "admin" | "responder") => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 450));

    const validAdmin = email === "admin@unitysos.com" && password === "password123";
    const validResponder = email === "responder@unitysos.com" && password === "password123";

    if (role === "admin" && !validAdmin) {
      setLoading(false);
      throw new Error("Invalid admin credentials.");
    }
    if (role === "responder" && !validResponder) {
      setLoading(false);
      throw new Error("Invalid responder credentials.");
    }

    setLoading(false);
    return {
      user: {
        email,
        role,
      },
      token: "mocked-token",
    };
  };

  const signUp = async (email: string, password: string, fullName: string, role: "admin" | "responder") => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 450));

    if (!email || !password || !fullName) {
      setLoading(false);
      throw new Error("Please fill in all required fields.");
    }
    if (password.length < 8) {
      setLoading(false);
      throw new Error("Password must be at least 8 characters long.");
    }

    // Quick mock validation for admin code? For now just success.
    setLoading(false);
    return {
      user: {
        email,
        fullName,
        role,
      },
      token: "mocked-signup-token",
    };
  };

  return {
    loading,
    login,
    signUp,
  };
}
