"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { getUser, isLoggedIn, logout } from "@/lib/auth-client";

const subscribeToAccount = () => () => {};

function getAccountName() {
  if (!isLoggedIn()) return null;
  const user = getUser();
  return user?.name || user?.email || "User";
}

export function NavbarAccount({ mobile = false }: { mobile?: boolean }) {
  // The server deliberately renders the safe logged-out controls. On the
  // client, React reads the local account once without an effect-driven
  // follow-up render on every navigation.
  const name = useSyncExternalStore(subscribeToAccount, getAccountName, () => null);

  const handleLogout = () => {
    logout();
    window.location.assign("/");
  };

  if (!name) {
    return mobile ? (
      <div className="grid grid-cols-2 gap-2">
        <Link href="/login" className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-center text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white">Login</Link>
        <Link href="/signup" className="rounded-full bg-brand px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-brand/90">Sign Up</Link>
      </div>
    ) : (
      <div className="hidden items-center gap-3 sm:flex">
        <Link href="/login" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">Login</Link>
        <Link href="/signup" className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">Sign Up</Link>
      </div>
    );
  }

  if (mobile) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-2 text-sm text-zinc-300"><User className="h-4 w-4" /> <span className="truncate">{name}</span></div>
        <Link href="/dashboard" className="flex justify-center rounded-full bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand/90">Dashboard</Link>
        <button type="button" onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"><LogOut className="h-4 w-4" />Log out</button>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-3 sm:flex">
      <Link href="/dashboard" className="text-sm font-medium text-brand hover:underline">Dashboard</Link>
      <span className="flex max-w-36 items-center gap-2 truncate text-sm text-zinc-300"><User className="h-4 w-4 shrink-0" />{name.split(" ")[0]}</span>
      <button type="button" onClick={handleLogout} className="text-zinc-400 transition-colors hover:text-white" aria-label="Log out"><LogOut className="h-4 w-4" /></button>
    </div>
  );
}
