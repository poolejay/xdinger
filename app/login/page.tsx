"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signup");

  const handleSubmit = async () => {
    setError("");
    const supabase = createClient();

    if (mode === "signup") {
      {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) {
          setError(error.message);
          return;
        }
        if (data.session) {
          router.refresh();
          router.push("/dashboard");
        }
      }
    } else {
      const { error: passError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (passError) {
        setError(passError.message);
        return;
      }
      router.refresh();
      router.push("/dashboard");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#18181B] px-4">
      <div className="w-full max-w-sm rounded-xl border border-[#3F3F46] bg-[#27272A] p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black tracking-tight text-white font-[family-name:var(--font-syne)]">
            PROPIQ
          </h1>
        </div>
        <div className="mb-6 flex rounded-lg bg-[#18181B] p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
              mode === "signin" ? "bg-[#3F3F46] text-white" : "text-[#71717A]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
              mode === "signup" ? "bg-[#3F3F46] text-white" : "text-[#71717A]"
            }`}
          >
            Sign Up
          </button>
        </div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded-lg border border-[#3F3F46] bg-[#18181B] px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-[#3F3F46] bg-[#18181B] px-4 py-3 text-sm text-white outline-none"
        />
        {error ? <p className="mb-4 font-mono text-sm text-red-400">{error}</p> : null}
        <button
          type="button"
          onClick={handleSubmit}
          className="mb-3 w-full rounded-lg bg-white py-3 text-sm font-semibold text-[#18181B]"
        >
          {mode === "signup" ? "Start your free 1-day trial" : "Sign In"}
        </button>
      </div>
    </main>
  );
}
