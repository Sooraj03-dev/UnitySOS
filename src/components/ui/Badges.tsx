import { cn } from "@/lib/utils";

// Role badge types
export type UserRole = "Civilian" | "Volunteer" | "Doctor" | "Firefighter" | "Rescue" | "Paramedic";

export type BadgeStatus = "unverified" | "pending" | "verified";

interface RoleBadgeProps {
  role: UserRole;
  size?: "sm" | "md";
}

interface VerifiedBadgeProps {
  status: BadgeStatus;
  size?: "sm" | "md";
}

const roleConfig: Record<UserRole, { color: string; bg: string }> = {
  Civilian:    { color: "text-gray-700",   bg: "bg-gray-100" },
  Volunteer:   { color: "text-indigo-700", bg: "bg-indigo-50" },
  Doctor:      { color: "text-teal-700",   bg: "bg-teal-50" },
  Firefighter: { color: "text-orange-700", bg: "bg-orange-50" },
  Rescue:      { color: "text-rose-700",   bg: "bg-rose-50" },
  Paramedic:   { color: "text-purple-700", bg: "bg-purple-50" },
};

const verifiedConfig: Record<BadgeStatus, { color: string; bg: string; border: string; label: string; icon: string }> = {
  unverified: { color: "text-gray-500",   bg: "bg-gray-50",    border: "border-gray-200", label: "Unverified", icon: "○" },
  pending:    { color: "text-yellow-700", bg: "bg-yellow-50",  border: "border-yellow-200", label: "Pending",   icon: "◑" },
  verified:   { color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200",  label: "Verified",  icon: "✓" },
};

export function RoleBadge({ role, size = "sm" }: RoleBadgeProps) {
  const cfg = roleConfig[role];
  return (
    <span className={cn(
      "inline-flex items-center font-semibold rounded-md border",
      cfg.color, cfg.bg,
      size === "sm" ? "text-[10px] px-1.5 py-0.5 border-transparent" : "text-xs px-2 py-0.5 border-transparent"
    )}>
      {role}
    </span>
  );
}

export function VerifiedBadge({ status, size = "sm" }: VerifiedBadgeProps) {
  const cfg = verifiedConfig[status];
  return (
    <span className={cn(
      "inline-flex items-center gap-1 font-bold rounded-full border",
      cfg.color, cfg.bg, cfg.border,
      size === "sm" ? "text-[9px] px-1.5 py-0.5" : "text-xs px-2 py-1"
    )}>
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

// Badge Status Display (for profile page)
interface BadgeStatusDisplayProps {
  status: BadgeStatus;
}

const badgeStatusFull: Record<BadgeStatus, { title: string; desc: string; color: string; bg: string; border: string }> = {
  unverified: {
    title: "Not Verified",
    desc: "Upload documents to become a verified responder.",
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
  pending: {
    title: "Verification Pending",
    desc: "Your documents are under review. This may take up to 48 hours.",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
  verified: {
    title: "Verified Responder ✓",
    desc: "Your profile is verified. You appear with a badge across the app.",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
};

export function BadgeStatusDisplay({ status }: BadgeStatusDisplayProps) {
  const cfg = badgeStatusFull[status];
  return (
    <div className={cn("rounded-2xl border p-4 flex flex-col gap-1", cfg.bg, cfg.border)}>
      <span className={cn("font-bold text-sm", cfg.color)}>{cfg.title}</span>
      <span className="text-xs text-muted-foreground leading-relaxed">{cfg.desc}</span>
    </div>
  );
}
