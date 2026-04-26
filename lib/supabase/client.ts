import { createBrowserClient } from "@supabase/ssr";

import { getNormalizedSupabaseUrl } from "@/lib/supabase/url";

export function createClient() {
  return createBrowserClient(
    getNormalizedSupabaseUrl() || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
