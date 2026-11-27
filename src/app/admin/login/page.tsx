"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMessage(data?.error?.message || "Invalid email or password.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setErrorMessage("Network error during login. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#121218] p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-white">Pathixo Admin Portal</h1>
          <p className="mt-1 text-xs text-neutral-400">
            Authorized exhibition staff & leadership login only.
          </p>
        </div>

        {errorMessage && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300">Username</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Adminji12"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3.5 text-xs text-white placeholder-neutral-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-neutral-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3.5 text-xs text-white placeholder-neutral-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-xs text-white transition hover:bg-brand-500 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
