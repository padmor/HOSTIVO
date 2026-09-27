import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/auth/get-user-context";
import { logout } from "@/lib/auth/actions";
import { submitApplication } from "@/lib/tenant/actions";

type TenantPageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

export default async function TenantPage({ searchParams }: TenantPageProps) {
  const params = await searchParams;
  const { supabase, email, userId, role } = await getUserContext();

  if (role !== "tenant") {
    redirect("/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email,phone")
    .eq("id", userId)
    .maybeSingle();

  const { data: feePlans, error: feePlanError } = await supabase
    .from("fee_plans")
    .select("id,hostel_id,name,description,amount,currency,starts_at,ends_at")
    .eq("status", "active")
    .order("hostel_id")
    .order("name");

  if (feePlanError) {
    throw new Error("Unable to load accommodation options.");
  }

  const planRows = feePlans ?? [];
  const hostelIds = [...new Set(planRows.map((plan) => plan.hostel_id))];

  const { data: hostels, error: hostelsError } = hostelIds.length
    ? await supabase
        .from("hostels")
        .select("id,name,location")
        .in("id", hostelIds)
        .eq("status", "active")
        .order("name")
    : { data: [], error: null };

  if (hostelsError) {
    throw new Error("Unable to load hostel options.");
  }

  const hostelById = new Map(
    (hostels ?? []).map((hostel) => [hostel.id, hostel]),
  );

  const { data: applications, error: applicationError } = await supabase
    .from("applications")
    .select("id,hostel_id,application_number,status,submitted_at,created_at")
    .eq("applicant_user_id", userId)
    .order("created_at", { ascending: false });

  if (applicationError) {
    throw new Error("Unable to load your applications.");
  }

  const applicationRows = applications ?? [];
  const applicationIds = applicationRows.map((application) => application.id);

  const { data: charges, error: chargeError } = applicationIds.length
    ? await supabase
        .from("charges")
        .select("application_id,description,amount,currency,status")
        .in("application_id", applicationIds)
        .order("created_at", { ascending: false })
    : { data: [], error: null };

  if (chargeError) {
    throw new Error("Unable to load your charges.");
  }

  const chargeRows = charges ?? [];
  const chargeByApplication = new Map<
    string,
    (typeof chargeRows)[number]
  >();

  for (const charge of chargeRows) {
    if (charge.application_id && !chargeByApplication.has(charge.application_id)) {
      chargeByApplication.set(charge.application_id, charge);
    }
  }

  return (
    <main className="page-shell">
      <section className="page-card wide-card">
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">Hostivo</p>
            <h1 className="brand">Tenant Portal</h1>
            <p className="subtitle">
              Apply for an active hostel, receive the correct charge, and move
              to payment. Bed allocation is finalized only after verified payment.
            </p>
          </div>
          <form action={logout}>
            <button className="secondary-button button-auto" type="submit">
              Sign out
            </button>
          </form>
        </div>

        <p className="meta">
          {profile?.full_name ?? "Tenant"} · {profile?.email ?? email ?? "Authenticated user"}
        </p>

        {params.message ? <div className="notice">{params.message}</div> : null}
        {params.error ? <div className="error">{params.error}</div> : null}

        <section className="setup-section" style={{ marginTop: 24 }}>
          <div className="section-heading">
            <div>
              <h2>New accommodation application</h2>
              <p className="meta">
                Availability is checked on the server when you submit.
              </p>
            </div>
          </div>

          {planRows.length ? (
            <form className="form" action={submitApplication}>
              <div className="field">
                <label htmlFor="fee-plan">Hostel and fee plan</label>
                <select id="fee-plan" name="feePlanId" defaultValue="" required>
                  <option value="" disabled>
                    Choose an accommodation option
                  </option>
                  {planRows.map((plan) => {
                    const hostel = hostelById.get(plan.hostel_id);
                    if (!hostel) return null;

                    return (
                      <option key={plan.id} value={plan.id}>
                        {hostel.name} — {plan.name} —{" "}
                        {Number(plan.amount).toLocaleString()} {plan.currency}
                      </option>
                    );
                  })}
                </select>
              </div>
              <button className="primary-button" type="submit">
                Check availability and apply
              </button>
            </form>
          ) : (
            <div className="empty-state">
              <p>
                No active accommodation fee plans are available yet. Check back
                after a hostel manager publishes a fee plan.
              </p>
            </div>
          )}
        </section>

        <section className="inventory-section">
          <div className="section-heading">
            <div>
              <h2>Your applications</h2>
              <p className="meta">{applicationRows.length} application(s).</p>
            </div>
          </div>

          <div className="stack">
            {applicationRows.map((application) => {
              const hostel = hostelById.get(application.hostel_id);
              const charge = chargeByApplication.get(application.id);

              return (
                <article className="list-card" key={application.id}>
                  <div>
                    <h3>{hostel?.name ?? "Hostel"}</h3>
                    <p className="meta">
                      {application.application_number} ·{" "}
                      {application.status.replaceAll("_", " ")}
                    </p>
                    {charge ? (
                      <p className="meta">
                        Charge: {Number(charge.amount).toLocaleString()}{" "}
                        {charge.currency} ·{" "}
                        {charge.status.replaceAll("_", " ")}
                      </p>
                    ) : null}
                  </div>
                  <span className="status-pill">
                    {application.status.replaceAll("_", " ")}
                  </span>
                </article>
              );
            })}

            {!applicationRows.length ? (
              <div className="empty-state">
                <p>You have not submitted an accommodation application yet.</p>
              </div>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}
