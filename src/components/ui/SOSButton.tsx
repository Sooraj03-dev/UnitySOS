"use client";

import { cn } from "@/lib/utils";

interface SOSButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

export default function SOSButton({ onClick, disabled }: SOSButtonProps) {
  return (
    <div className="relative flex items-center justify-center w-52 h-52">
      {/* Outward pulse rings */}
      <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-sos-ring" />
      <div className="absolute inset-0 rounded-full bg-red-500 opacity-15 animate-sos-ring-delay" />
      <div className="absolute inset-0 rounded-full bg-red-500 opacity-10 animate-sos-ring-delay-2" />

      {/* Inner halo */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-red-400/40 to-red-600/20 blur-lg" />

      {/* Button */}
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "relative z-10 w-40 h-40 rounded-full",
          "bg-gradient-to-br from-red-500 to-rose-700",
          "shadow-sos",
          "flex flex-col items-center justify-center gap-1",
          "text-white font-extrabold",
          "border-4 border-red-300/40",
          "transition-all duration-150 active:scale-95",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400",
          "select-none",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mb-1">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span className="text-3xl font-black tracking-widest leading-none">SOS</span>
      </button>
    </div>
  );
}
