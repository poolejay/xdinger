import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#18181B] px-4">
      <div className="w-full max-w-md rounded-xl border border-[#3F3F46] bg-[#27272A] p-8 text-center">
        <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-white">
          404 — Page not found
        </h1>
        <Link
          href="/dashboard"
          className="mt-5 inline-block rounded-md bg-white px-4 py-2 font-[family-name:var(--font-outfit)] text-sm text-[#18181B]"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
