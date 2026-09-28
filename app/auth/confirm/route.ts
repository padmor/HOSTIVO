import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/login";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = request.nextUrl.clone();
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      requestUrl.pathname = next;
      requestUrl.search = "";
      return NextResponse.redirect(requestUrl);
    }
  }

  requestUrl.pathname = "/forgot-password";
  requestUrl.search = "error=" + encodeURIComponent(
    "This authentication link is invalid or has expired. Request a new one.",
  );
  return NextResponse.redirect(requestUrl);
}
