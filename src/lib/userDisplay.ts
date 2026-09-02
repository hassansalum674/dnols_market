import type { AuthUser } from "./authActions";
import { loadProfile } from "./profile";

export function userDisplayName(user: AuthUser | null): string {
  if (!user) return "Guest";
  const local = user.uid ? loadProfile(user.uid).displayName?.trim() : "";
  return (
    local ||
    user.displayName?.trim() ||
    user.email?.split("@")[0] ||
    "Account"
  );
}

export function userInitial(user: AuthUser | null): string {
  return userDisplayName(user).charAt(0).toUpperCase();
}

export function providerLabel(provider: string): string {
  if (provider.includes("google")) return "Google";
  if (provider.includes("password")) return "Email";
  return "Account";
}
