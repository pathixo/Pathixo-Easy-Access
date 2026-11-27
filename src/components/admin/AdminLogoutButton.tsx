"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-white/10 hover:text-white"
      title="Sign Out"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
