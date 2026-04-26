import Link from "next/link";

const features = [
  "Full table — all matchups sorted by xDinger™",
  "Laser Intelligence tab",
  "Zone heat maps — click any player",
  "Tuner panel — weight your own model",
  "Pitch splits, BvP history, odds movement",
  "Rain alerts and environmental scores",
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#18181B] px-4 py-10 text-[#F4F4F5]">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-center font-[family-name:var(--font-syne)] text-3xl font-bold">
          One price. Everything included.
        </h1>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#3F3F46] bg-[#27272A] p-6">
            <h2 className="font-[family-name:var(--font-syne)] text-xl">Monthly</h2>
            <p className="mt-2 font-[family-name:var(--font-outfit)] text-3xl font-semibold">
              $19.99<span className="text-base font-normal text-[#A1A1AA]">/month</span>
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block w-full rounded-md bg-white py-2 text-center font-[family-name:var(--font-outfit)] text-sm font-medium text-[#18181B]"
            >
              Start 1-Day Free Trial
            </Link>
          </div>

          <div className="rounded-xl border border-[#22C55E]/50 bg-[#27272A] p-6">
            <span className="rounded-full bg-[#22C55E]/20 px-2 py-1 font-[family-name:var(--font-dm-mono)] text-[10px] text-[#22C55E]">
              Best Value · Save $90
            </span>
            <h2 className="mt-2 font-[family-name:var(--font-syne)] text-xl">Annual</h2>
            <p className="mt-2 font-[family-name:var(--font-outfit)] text-3xl font-semibold">
              $149<span className="text-base font-normal text-[#A1A1AA]">/year</span>
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block w-full rounded-md bg-white py-2 text-center font-[family-name:var(--font-outfit)] text-sm font-medium text-[#18181B]"
            >
              Start 1-Day Free Trial
            </Link>
          </div>
        </div>

        <section className="mt-8 rounded-xl border border-[#3F3F46] bg-[#27272A] p-6">
          <h3 className="font-[family-name:var(--font-syne)] text-lg">Included Features</h3>
          <ul className="mt-3 space-y-2 font-[family-name:var(--font-outfit)] text-sm">
            {features.map((feature) => (
              <li key={feature}>✓ {feature}</li>
            ))}
          </ul>
        </section>

        <section className="mt-6 space-y-3 rounded-xl border border-[#3F3F46] bg-[#27272A] p-6 font-[family-name:var(--font-outfit)] text-sm">
          <p>
            <span className="font-semibold text-white">Can I cancel anytime?</span> Yes, you can
            cancel at any time from your billing portal.
          </p>
          <p>
            <span className="font-semibold text-white">What happens after my trial?</span> Your
            account continues on paid Pro unless cancelled before trial end.
          </p>
          <p>
            <span className="font-semibold text-white">Is my data used for anything?</span> No,
            your account data is used only to run your analytics experience.
          </p>
        </section>
      </div>
    </main>
  );
}
