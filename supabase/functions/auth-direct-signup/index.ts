import { withSupabase } from "npm:@supabase/server";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2.117.1";

const allowedOrigins = new Set([
  "https://hostivo-padmor.vercel.app",
  "https://hostivo-iota.vercel.app",
  "http://localhost:3000",
]);

function corsOrigin(origin: string) {
  return allowedOrigins.has(origin) ? origin : "*";
}

function response(
  body: Record<string, unknown>,
  status = 200,
  origin = "",
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": corsOrigin(origin),
      "Access-Control-Allow-Headers":
        "apikey, x-client-info, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Cache-Control": "no-store",
      Vary: "Origin",
    },
  });
}

function cleanString(value: unknown, max: number) {
  return typeof value === "string" ? value.trim() : "";
}

function validEmail(value: string) {
  return value.length <= 160 && /^\S+@\S+\.\S+$/.test(value);
}

function validPassword(value: string) {
  return value.length >= 8 && value.length <= 128;
}

function getPublishableKeys() {
  const keys: string[] = [];

  const named = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (named) {
    try {
      const parsed = JSON.parse(named) as Record<string, unknown>;
      for (const value of Object.values(parsed)) {
        if (typeof value === "string" && value) {
          keys.push(value);
        }
      }
    } catch {
      // Fall through to the single-key compatibility variable.
    }
  }

  const single =
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ??
    Deno.env.get("SUPABASE_ANON_KEY");

  if (single) {
    keys.push(single);
  }

  return [...new Set(keys)];
}

function isAuthorizedPublicCaller(req: Request) {
  const provided = req.headers.get("apikey") ?? "";
  if (!provided) return false;

  return getPublishableKeys().some((key) => key === provided);
}

function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = req.headers.get("x-real-ip")?.trim();
  return forwarded || real || "unknown";
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function findUserByEmail(
  supabaseAdmin: SupabaseClient,
  email: string,
) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) throw error;

    const match = data.users.find(
      (user) => (user.email ?? "").toLowerCase() === email,
    );

    if (match) return match;
    if (!data.nextPage) break;
  }

  return null;
}

export default {
  fetch: withSupabase({ auth: "none" }, async (req, ctx) => {
    const origin = req.headers.get("origin") ?? "";

    if (req.method === "OPTIONS") {
      return response({}, 204, origin);
    }

    if (req.method !== "POST") {
      return response({ ok: false, error: "Method not allowed." }, 405, origin);
    }

    if (!isAuthorizedPublicCaller(req)) {
      return response({ ok: false, error: "Unauthorized." }, 401, origin);
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return response({ ok: false, error: "Invalid request." }, 400, origin);
    }

    const email = cleanString(body.email, 160).toLowerCase();
    const password = cleanString(body.password, 128);

    if (!validEmail(email) || !validPassword(password)) {
      return response(
        {
          ok: false,
          error: "Enter a valid email and an 8-128 character password.",
        },
        400,
        origin,
      );
    }

    const [emailKey, ipKey] = await Promise.all([
      sha256("email:" + email),
      sha256("ip:" + clientIp(req)),
    ]);

    const ipLimit = await ctx.supabaseAdmin.rpc(
      "consume_signup_rate_limit",
      {
        p_key: ipKey,
        p_max_attempts: 20,
        p_window_seconds: 900,
      },
    );

    if (ipLimit.error) {
      console.error("signup_rate_limit_failed", {
        scope: "ip",
        message: ipLimit.error.message,
      });
      return response(
        { ok: false, error: "Signup service is temporarily unavailable." },
        503,
        origin,
      );
    }

    if (!ipLimit.data) {
      return response(
        {
          ok: false,
          error: "Too many account creation attempts. Please try again later.",
        },
        429,
        origin,
      );
    }

    const emailLimit = await ctx.supabaseAdmin.rpc(
      "consume_signup_rate_limit",
      {
        p_key: emailKey,
        p_max_attempts: 5,
        p_window_seconds: 900,
      },
    );

    if (emailLimit.error) {
      console.error("signup_rate_limit_failed", {
        scope: "email",
        message: emailLimit.error.message,
      });
      return response(
        { ok: false, error: "Signup service is temporarily unavailable." },
        503,
        origin,
      );
    }

    if (!emailLimit.data) {
      return response(
        {
          ok: false,
          error: "Too many account creation attempts. Please try again later.",
        },
        429,
        origin,
      );
    }

    let createdUserId: string | null = null;

    const { data: created, error: createError } =
      await ctx.supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (!createError && created.user) {
      createdUserId = created.user.id;
    } else {
      const existing = await findUserByEmail(ctx.supabaseAdmin, email);

      if (!existing) {
        console.error("signup_create_failed", {
          code: createError?.code ?? null,
          status: createError?.status ?? null,
          message: createError?.message ?? null,
        });
        return response(
          {
            ok: false,
            error: "Unable to create the account right now. Please try again.",
          },
          400,
          origin,
        );
      }

      if (existing.email_confirmed_at) {
        return response(
          {
            ok: false,
            error: "An account with that email already exists. Please sign in.",
          },
          409,
          origin,
        );
      }

      const { data: recovered, error: recoverError } =
        await ctx.supabaseAdmin.auth.admin.updateUserById(existing.id, {
          password,
          email_confirm: true,
        });

      if (recoverError || !recovered.user) {
        console.error("signup_recovery_failed", {
          code: recoverError?.code ?? null,
          status: recoverError?.status ?? null,
          message: recoverError?.message ?? null,
        });
        return response(
          {
            ok: false,
            error:
              "Unable to finish the account creation right now. Please try again.",
          },
          400,
          origin,
        );
      }

      createdUserId = recovered.user.id;
    }

    return response({ ok: true, userId: createdUserId }, 201, origin);
  }),
};
