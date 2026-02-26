"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInAdmin } from "@/lib/session";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = signInAdmin(password);
    if (!ok) { setError("Invalid password."); return; }
    router.push("/admin/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center pb-12">
      <div className="glass p-8 w-full max-w-sm space-y-5">
        <div className="text-center">
          <div className="text-xl font-semibold">ArrivoHub</div>
          <div className="mt-1 text-sm text-white/60">Admin Panel</div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <div className="label">Email</div>
            <input className="input mt-1" type="email" value="admin@arrivohub.com" readOnly />
          </label>
          <label className="block">
            <div className="label">Password</div>
            <input className="input mt-1" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoFocus />
          </label>
          {error && <div className="rounded-xl border border-red-200/20 bg-red-500/10 px-3 py-2 text-xs text-red-100">{error}</div>}
          <button className="glass-btn w-full" type="submit">Sign in</button>
        </form>
      </div>
    </div>
  );
}
