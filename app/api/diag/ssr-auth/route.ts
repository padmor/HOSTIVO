import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  supabasePublishableKey,
  supabaseUrl,
} from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const email = `hostivo-ssr-e2e-${crypto.randomUUID()}@example.invalid`;
  const password = `${crypto.randomUUID()}-Aa1!`;

  const signupResponse = await fetch(
    supabaseUrl + "/functions/v1/auth-direct-signup",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabasePublishableKey,
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    },
  );

  let signupData: { ok?: boolean } = {};
  try {
    signupData = (await signupResponse.json()) as typeof signupData;
  } catch {}

  if (!signupResponse.ok || !signupData.ok) {
    return NextResponse.json(
      { ok: false, stage: "signup", status: signupResponse.status },
      { status: 502 },
    );
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  const cookieSnapshot = (await cookies()).getAll();
  const authCookies = cookieSnapshot.filter((cookie) =>
    cookie.name.includes("auth-token"),
  );

  const { data: claims } = await supabase.auth.getClaims();

  return NextResponse.json({
    ok: Boolean(!signInError && claims?.claims?.sub && authCookies.length > 0),
    signInOk: !signInError,
    claimsOk: Boolean(claims?.claims?.sub),
    authCookieCount: authCookies.length,
    signInError: signInError?.message ?? null,
  });
}
