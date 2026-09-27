import { createClient } from "npm:@supabase/supabase-js@2.117.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const adminKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  (() => {
    const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
    if (!raw) return "";
    try {
      return JSON.parse(raw).default ?? "";
    } catch {
      return "";
    }
  })();

const supabaseAdmin = createClient(supabaseUrl, adminKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const json = (body: Record<string, unknown>, status = 200, origin = "*") =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Vary": "Origin",
    },
  });

function cleanString(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function findUserByEmail(email: string) {
  for (let page = 1; page <= 100; page += 1) {
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

async function audit(
  actorUserId: string,
  action: string,
  entityId: string | null,
  hostelId: string | null,
  result: "success" | "failure",
  metadata: Record<string, unknown>,
) {
  await supabaseAdmin.from("audit_logs").insert({
    actor_user_id: actorUserId,
    hostel_id: hostelId,
    action,
    entity_type: "user_provisioning",
    entity_id: entityId,
    result,
    metadata,
  });
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "*";

  if (req.method === "OPTIONS") {
    return json({}, 204, origin);
  }

  if (req.method !== "POST") {
    return json({ ok: false, error: "Method not allowed." }, 405, origin);
  }

  if (!supabaseUrl || !adminKey) {
    return json({ ok: false, error: "Provisioning service is not configured." }, 500, origin);
  }

  const authorization = req.headers.get("authorization") ?? "";
  const accessToken = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!accessToken) {
    return json({ ok: false, error: "Authentication required." }, 401, origin);
  }

  const { data: callerData, error: callerError } =
    await supabaseAdmin.auth.getUser(accessToken);

  if (callerError || !callerData.user) {
    return json({ ok: false, error: "Authentication required." }, 401, origin);
  }

  const actorUserId = callerData.user.id;

  const { data: actorRole, error: roleError } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", actorUserId)
    .maybeSingle();

  if (roleError || actorRole?.role !== "system_admin") {
    return json({ ok: false, error: "System administrator access required." }, 403, origin);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid request body." }, 400, origin);
  }

  const email = cleanString(body.email, 160).toLowerCase();
  const fullName = cleanString(body.fullName, 120);
  const requestedRole = cleanString(body.role, 20);
  const hostelId = cleanString(body.hostelId, 80);

  if (!/^\S+@\S+\.\S+$/.test(email) || fullName.length < 2) {
    return json({ ok: false, error: "Enter a valid name and email." }, 400, origin);
  }

  if (requestedRole !== "manager" && requestedRole !== "staff") {
    return json({ ok: false, error: "Only manager or staff provisioning is allowed." }, 400, origin);
  }

  if (!validUuid(hostelId)) {
    return json({ ok: false, error: "A valid hostel is required." }, 400, origin);
  }

  const { data: hostel, error: hostelError } = await supabaseAdmin
    .from("hostels")
    .select("id,name,status")
    .eq("id", hostelId)
    .maybeSingle();

  if (hostelError || !hostel) {
    return json({ ok: false, error: "The selected hostel does not exist." }, 400, origin);
  }

  if (hostel.status !== "active") {
    return json({ ok: false, error: "The selected hostel is inactive." }, 400, origin);
  }

  let targetUser = await findUserByEmail(email);
  let mode: "existing" | "invited" = "existing";
  let invitedUserId: string | null = null;

  if (!targetUser) {
    const { data: inviteData, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email);

    if (inviteError || !inviteData.user) {
      await audit(actorUserId, "provision_user", null, hostelId, "failure", {
        email,
        role: requestedRole,
        reason: "invite_failed",
      });
      return json({ ok: false, error: "Unable to invite that user." }, 400, origin);
    }

    targetUser = inviteData.user;
    invitedUserId = targetUser.id;
    mode = "invited";
  }

  const targetUserId = targetUser.id;

  const { data: existingRole } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (existingRole?.role === "system_admin") {
    if (invitedUserId) await supabaseAdmin.auth.admin.deleteUser(invitedUserId);
    return json({ ok: false, error: "A system administrator cannot be provisioned as manager or staff." }, 400, origin);
  }

  const { error: roleUpsertError } = await supabaseAdmin
    .from("user_roles")
    .upsert(
      { user_id: targetUserId, role: requestedRole },
      { onConflict: "user_id" },
    );

  if (roleUpsertError) {
    if (invitedUserId) await supabaseAdmin.auth.admin.deleteUser(invitedUserId);
    await audit(actorUserId, "provision_user", targetUserId, hostelId, "failure", {
      email,
      role: requestedRole,
      reason: "role_update_failed",
    });
    return json({ ok: false, error: "Unable to assign the account role." }, 500, origin);
  }

  const { error: membershipError } = await supabaseAdmin
    .from("hostel_memberships")
    .upsert(
      {
        hostel_id: hostelId,
        user_id: targetUserId,
        membership_role: requestedRole,
        status: "active",
      },
      { onConflict: "hostel_id,user_id" },
    );

  if (membershipError) {
    if (invitedUserId) await supabaseAdmin.auth.admin.deleteUser(invitedUserId);
    await audit(actorUserId, "provision_user", targetUserId, hostelId, "failure", {
      email,
      role: requestedRole,
      reason: "membership_update_failed",
    });
    return json({ ok: false, error: "Unable to assign the hostel membership." }, 500, origin);
  }

  await supabaseAdmin
    .from("profiles")
    .update({ full_name: fullName, email })
    .eq("id", targetUserId);

  await audit(actorUserId, "provision_user", targetUserId, hostelId, "success", {
    email,
    role: requestedRole,
    mode,
  });

  return json(
    {
      ok: true,
      mode,
      message:
        mode === "invited"
          ? "Invitation sent and hostel access configured."
          : "Existing account updated and hostel access configured.",
    },
    200,
    origin,
  );
});
