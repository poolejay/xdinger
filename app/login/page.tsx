"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        await fetch("/api/auth/start-trial", { method: "POST" });
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setError(null);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (oauthError) setError(oauthError.message);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#18181B] px-4">
      <div className="w-full max-w-md rounded-xl border border-[#3F3F46] bg-[#27272A] p-6">
        <p className="text-center font-[family-name:var(--font-syne)] text-2xl font-extrabold tracking-[0.2em] text-white">
          PROPIQ
        </p>
        <div className="mt-5 flex rounded-md border border-[#3F3F46] p-1 font-[family-name:var(--font-dm-mono)] text-xs">
          <button
            className={`flex-1 rounded py-1 ${mode === "signin" ? "bg-[#303033] text-white" : "text-[#A1A1AA]"}`}
            onClick={() => setMode("signin")}
          >
            Sign In
          </button>
          <button
            className={`flex-1 rounded py-1 ${mode === "signup" ? "bg-[#303033] text-white" : "text-[#A1A1AA]"}`}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-md border border-[#3F3F46] bg-[#18181B] px-3 py-2 font-[family-name:var(--font-geist-sans)] text-sm text-white outline-none"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-md border border-[#3F3F46] bg-[#18181B] px-3 py-2 font-[family-name:var(--font-geist-sans)] text-sm text-white outline-none"
          />
          {error ? (
            <p className="font-[family-name:var(--font-dm-mono)] text-xs text-[#EF4444]">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-white py-2 font-[family-name:var(--font-outfit)] text-sm font-medium text-[#18181B] disabled:opacity-60"
          >
            {mode === "signup" ? "Start your free 1-day trial" : "Sign In"}
          </button>
        </form>

        <button
          onClick={signInWithGoogle}
          className="mt-3 w-full rounded-md border border-[#3F3F46] py-2 font-[family-name:var(--font-outfit)] text-sm text-[#F4F4F5]"
        >
          Continue with Google
        </button>

        <p className="mt-4 text-center font-[family-name:var(--font-dm-mono)] text-xs text-[#A1A1AA]">
          {mode === "signin" ? "Need an account?" : "Already have an account?"}{" "}
          <button
            className="text-white underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </main>
  );
}
