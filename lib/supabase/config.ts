const fallbackSupabaseUrl = "https://bsraovzcintutfzmdenm.supabase.co";
const fallbackSupabasePublishableKey =
  "sb_publishable_QMCxkLAJcxX5AHdoRbVHgQ_W8E0Nq_1";

export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || fallbackSupabaseUrl;

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  fallbackSupabasePublishableKey;

export const supabaseSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
