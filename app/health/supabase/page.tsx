import {
  supabasePublishableKey,
  supabaseUrl,
} from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

async function check(
  request: () => Promise<Response>,
  timeoutMs = 8000,
): Promise<{ ok: boolean; status: number | null }> {
  try {
    const response = await Promise.race([
      request(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeoutMs),
      ),
    ]);

    return { ok: response.ok, status: response.status };
  } catch {
    return { ok: false, status: null };
  }
}

export default async function SupabaseHealthPage() {
  const headers = {
    apikey: supabasePublishableKey,
    Authorization: "Bearer " + supabasePublishableKey,
  };

  const rest = await check(() =>
    fetch(supabaseUrl + "/rest/v1/hostels?select=id&limit=1", {
      headers,
      cache: "no-store",
    }),
  );

  const auth = await check(() =>
    fetch(supabaseUrl + "/auth/v1/settings", {
      headers,
      cache: "no-store",
    }),
  );

  const signup = await check(() =>
    fetch(supabaseUrl + "/functions/v1/auth-direct-signup", {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      cache: "no-store",
    }),
  );

  const signupConfigured =
    signup.status === 400 ||
    signup.status === 409 ||
    signup.status === 429;

  const overall = rest.ok && auth.ok && signupConfigured;

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-6 py-12 text-[#14233d]">
      <div className="mx-auto max-w-[720px] rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold">Hostivo Supabase Health</h1>
        <p className="mt-2 text-sm text-[#60728e]">
          Server-to-server checks from the production Vercel runtime.
        </p>

        <div className="mt-8 grid gap-4 font-mono text-sm">
          <p>overall: {overall ? "OK" : "FAILED"}</p>
          <p>supabase_rest: {rest.ok ? "OK" : "FAILED"} ({rest.status ?? "no-response"})</p>
          <p>supabase_auth: {auth.ok ? "OK" : "FAILED"} ({auth.status ?? "no-response"})</p>
          <p>
            auth_direct_signup:{" "}
            {signupConfigured ? "REACHABLE_AND_CONFIGURED" : "FAILED"} (
            {signup.status ?? "no-response"})
          </p>
        </div>

        <p className="mt-8 text-xs text-[#7a8ba4]">
          No account is created by this diagnostic page.
        </p>
      </div>
    </main>
  );
}
