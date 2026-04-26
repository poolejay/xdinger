"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#18181B] px-4">
      <div className="w-full max-w-md rounded-xl border border-[#3F3F46] bg-[#27272A] p-8 text-center">
        <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-white">
          Something went wrong
        </h1>
        <button
          onClick={reset}
          className="mt-5 rounded-md bg-white px-4 py-2 font-[family-name:var(--font-outfit)] text-sm text-[#18181B]"
        >
          Try refreshing the page
        </button>
      </div>
    </main>
  );
}
