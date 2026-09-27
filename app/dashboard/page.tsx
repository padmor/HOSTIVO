import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/auth/get-user-context";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function DashboardRouter() {
  const { userId, email, role } = await getUserContext();

  if (role === "manager") redirect("/manager");
  if (role === "staff") redirect("/staff");
  if (role === "tenant") redirect("/tenant");
  if (role === "system_admin") redirect("/admin");

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <Card className="w-full max-w-[760px] rounded-3xl p-9 shadow-md">
        <h1 className="text-[32px] font-semibold tracking-tight">
          Hostivo account
        </h1>
        <p className="mt-2.5 max-w-[68ch] leading-relaxed text-muted-foreground">
          Your account is authenticated, but no Hostivo role has been assigned
          yet.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Signed in as: {email ?? userId}
        </p>
        <form action={logout} className="mt-5">
          <Button variant="outline" type="submit">
            Sign out
          </Button>
        </form>
      </Card>
    </main>
  );
}
