import Link from "next/link";
import { redirect } from "next/navigation";

import { getProfile } from "@/lib/auth/getProfile";

export default async function Home() {
  const profile = await getProfile();
  if (profile) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-[#18181B] bg-[linear-gradient(to_right,rgba(63,63,70,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(63,63,70,0.15)_1px,transparent_1px)] bg-[size:36px_36px] px-4 py-12">
      <div className="mx-auto max-w-6xl space-y-16">
        <section className="pt-8 text-center">
          <h1 className="mx-auto max-w-4xl font-[family-name:var(--font-syne)] text-4xl font-bold leading-tight text-white md:text-6xl">
            The sharpest MLB prop analytics tool ever built.
          </h1>
          <p className="mx-auto mt-5 max-w-3xl font-[family-name:var(--font-outfit)] text-lg text-[#A1A1AA]">
            xDinger scores, zone heat maps, pitch splits, laser props. Built for bettors who
            take the data seriously.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-md bg-white px-6 py-3 font-[family-name:var(--font-outfit)] text-sm font-medium text-[#18181B]"
          >
            Start your free 1-day trial
          </Link>
          <p className="mt-3 font-[family-name:var(--font-dm-mono)] text-xs text-[#A1A1AA]">
            No credit card required · Cancel anytime
          </p>
        </section>

        <section className="rounded-xl border border-[#3F3F46] bg-[#27272A] p-5">
          <p className="mb-3 font-[family-name:var(--font-dm-mono)] text-xs text-[#A1A1AA]">
            Today&apos;s HR Intelligence
          </p>
          <div className="rounded-md border border-[#3F3F46] bg-[#18181B] p-4">
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between rounded bg-[#27272A] px-3 py-2">
                  <span className="font-[family-name:var(--font-outfit)] text-sm text-white">
                    Sample Batter {i}
                  </span>
                  <span className="font-[family-name:var(--font-dm-mono)] text-xs text-[#22C55E]">
                    {90 - i * 4}.0
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-md bg-gradient-to-t from-[#18181B] to-transparent p-4 text-center font-[family-name:var(--font-dm-mono)] text-xs text-[#A1A1AA]">
              Start free trial to see full slate
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[#3F3F46] bg-[#27272A] p-5">
            <h3 className="font-[family-name:var(--font-syne)] text-lg text-white">xDinger™ Score</h3>
            <p className="mt-2 font-[family-name:var(--font-outfit)] text-sm text-[#A1A1AA]">
              Our proprietary scoring model weighs batter power, pitcher vulnerability, handedness
              edge, pitch matchup, park factor, wind, recent form, and BvP history.
            </p>
          </div>
          <div className="rounded-xl border border-[#3F3F46] bg-[#27272A] p-5">
            <h3 className="font-[family-name:var(--font-syne)] text-lg text-white">Zone Heat Maps</h3>
            <p className="mt-2 font-[family-name:var(--font-outfit)] text-sm text-[#A1A1AA]">
              Click any player to see their xSLG by strike zone overlaid against the pitcher&apos;s
              zone tendencies. Spot the danger zones instantly.
            </p>
          </div>
          <div className="rounded-xl border border-[#3F3F46] bg-[#27272A] p-5">
            <h3 className="font-[family-name:var(--font-syne)] text-lg text-white">Laser Intelligence</h3>
            <p className="mt-2 font-[family-name:var(--font-outfit)] text-sm text-[#A1A1AA]">
              The 110+ exit velocity prop, scored and ranked. Avg EV, max EV, barrel rate, launch
              angle. Find the hitters who make hard contact.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-[#3F3F46] bg-[#27272A] p-6">
          <h3 className="font-[family-name:var(--font-syne)] text-2xl text-white">How It Works</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              "We pull Statcast data every morning",
              "Our model scores every matchup",
              "You open the dashboard and pick your plays",
            ].map((step, idx) => (
              <div key={step} className="rounded-md bg-[#18181B] p-4">
                <p className="font-[family-name:var(--font-dm-mono)] text-xs text-[#22C55E]">
                  {idx + 1}
                </p>
                <p className="mt-1 font-[family-name:var(--font-outfit)] text-sm text-white">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#3F3F46] bg-[#27272A] p-6">
            <h3 className="font-[family-name:var(--font-syne)] text-xl text-white">Monthly</h3>
            <p className="mt-2 font-[family-name:var(--font-outfit)] text-3xl text-white">
              $19.99<span className="text-base text-[#A1A1AA]">/month</span>
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-block rounded-md bg-white px-4 py-2 font-[family-name:var(--font-outfit)] text-sm text-[#18181B]"
            >
              View pricing
            </Link>
          </div>
          <div className="rounded-xl border border-[#22C55E]/40 bg-[#27272A] p-6">
            <p className="inline-block rounded-full bg-[#22C55E]/15 px-2 py-1 font-[family-name:var(--font-dm-mono)] text-[10px] text-[#22C55E]">
              Best Value · Save $90
            </p>
            <h3 className="mt-2 font-[family-name:var(--font-syne)] text-xl text-white">Annual</h3>
            <p className="mt-2 font-[family-name:var(--font-outfit)] text-3xl text-white">
              $149<span className="text-base text-[#A1A1AA]">/year</span>
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-block rounded-md bg-white px-4 py-2 font-[family-name:var(--font-outfit)] text-sm text-[#18181B]"
            >
              View pricing
            </Link>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#3F3F46] py-6">
          <p className="font-[family-name:var(--font-syne)] text-sm text-white">HR Intelligence</p>
          <div className="flex gap-4 font-[family-name:var(--font-dm-mono)] text-xs text-[#A1A1AA]">
            <Link href="/pricing">Pricing</Link>
            <Link href="/login">Login</Link>
            <Link href="/dashboard">Dashboard</Link>
          </div>
          <p className="font-[family-name:var(--font-dm-mono)] text-xs text-[#71717A]">
            Built for serious bettors
          </p>
        </footer>
      </div>
    </main>
  );
}
