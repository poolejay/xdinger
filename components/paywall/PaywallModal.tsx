"use client";

import { useState } from "react";

import { purchasePro } from "@/lib/revenuecat/purchases";

type PaywallModalProps = {
  open: boolean;
  onClose: () => void;
  userId?: string;
  trialUsed?: boolean;
};

const features = [
  "Full table — all matchups sorted by xDinger™",
  "Laser Intelligence tab",
  "Zone heat maps — click any player",
  "Tuner panel — weight your own model",
  "Pitch splits, BvP history, odds movement",
  "Rain alerts and environmental scores",
];

export function PaywallModal({ open, onClose, userId, trialUsed }: PaywallModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!open) return null;

  async function handlePurchase() {
    if (!userId) {
      setError("Sign in to continue.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await purchasePro(userId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#3F3F46] bg-[#27272A] p-6">
        <h3 className="font-[family-name:var(--font-syne)] text-xl font-bold text-white">
          ⚡ Unlock Pro Access
        </h3>
        <p className="mt-2 font-[family-name:var(--font-dm-mono)] text-sm text-[#A1A1AA]">
          You&apos;re seeing 5 of 127 matchups. Unlock everything.
        </p>

        <ul className="mt-4 space-y-2 font-[family-name:var(--font-outfit)] text-sm text-[#F4F4F5]">
          {features.map((feature) => (
            <li key={feature}>✓ {feature}</li>
          ))}
        </ul>

        <div className="mt-5 rounded-md bg-[#18181B] p-3 text-center">
          <p className="font-[family-name:var(--font-outfit)] text-2xl font-semibold text-white">
            $19.99/month
          </p>
          <p className="font-[family-name:var(--font-dm-mono)] text-xs text-[#A1A1AA]">
            or $149/year — save $90
          </p>
        </div>

        <button
          onClick={handlePurchase}
          disabled={loading}
          className="mt-4 w-full rounded-md bg-white py-2 font-[family-name:var(--font-outfit)] text-sm font-medium text-[#18181B] disabled:opacity-60"
        >
          {trialUsed ? "Go Pro — $19.99/month" : "Start 1-Day Free Trial"}
        </button>
        {error ? (
          <p className="mt-2 font-[family-name:var(--font-dm-mono)] text-xs text-[#EF4444]">
            {error}
          </p>
        ) : null}
        <button
          onClick={onClose}
          className="mt-3 w-full font-[family-name:var(--font-dm-mono)] text-xs text-[#A1A1AA] underline"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
