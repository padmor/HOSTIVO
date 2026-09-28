import { NextResponse } from "next/server";

import {
  supabasePublishableKey,
  supabaseUrl,
} from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

type Check = {
  ok: boolean;
  status: number | null;
  detail?: string;
};

async function runCheck(
  request: () => Promise<Response>,
  timeoutMs = 8000,
): Promise<Check> {
  try {
    const response = await Promise.race([
      request(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeoutMs),
      ),
    ]);

    return {
      ok: response.ok,
      status: response.status,
    };
  } catch {
    return {
      ok: false,
      status: null,
      detail: "request_failed",
    };
  }
}

export async function GET() {
  const headers = {
    apikey: supabasePublishableKey,
    Authorization: "Bearer " + supabasePublishableKey,
  };

  const rest = await runCheck(() =>
    fetch(supabaseUrl + "/rest/v1/hostels?select=id&limit=1", {
      headers,
      cache: "no-store",
    }),
  );

  const auth = await runCheck(() =>
    fetch(supabaseUrl + "/auth/v1/settings", {
      headers,
      cache: "no-store",
    }),
  );

  const directSignup = await runCheck(() =>
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

  const directSignupConfigured =
    directSignup.status === 400 ||
    directSignup.status === 409 ||
    directSignup.status === 429;

  const directSignupGatewayFailure =
    directSignup.status === 401 || directSignup.status === 403;

  const directSignupRuntimeFailure =
    directSignup.status === 500 || directSignup.status === 503;

  const ok =
    rest.ok &&
    auth.ok &&
    directSignupConfigured;

  return NextResponse.json(
    {
      ok,
      supabase: {
        url_configured: Boolean(supabaseUrl),
        publishable_key_configured: Boolean(supabasePublishableKey),
        rest,
        auth,
      },
      direct_signup: {
        status: directSignup.status,
        reachable: directSignup.status !== null,
        configured: directSignupConfigured,
        gateway_failure: directSignupGatewayFailure,
        runtime_failure: directSignupRuntimeFailure,
      },
    },
    {
      status: ok ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
