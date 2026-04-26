export const config = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  revenueCatApiKey: process.env.NEXT_PUBLIC_REVENUECAT_API_KEY!,
  isProd: process.env.NODE_ENV === "production",
  season: {
    start: "2026-03-20",
    end: "2026-11-01",
  },
};

export function isInSeason(): boolean {
  const today = new Date();
  const start = new Date(config.season.start);
  const end = new Date(config.season.end);
  return today >= start && today <= end;
}
