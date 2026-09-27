import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ErrorPage() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <Card className="w-full max-w-[760px] rounded-3xl p-9 shadow-md">
        <h1 className="text-[32px] font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-2.5 max-w-[68ch] leading-relaxed text-muted-foreground">
          Hostivo could not complete that request. Please try again.
        </p>
        <Button className="mt-5" asChild>
          <Link href="/login">Return to sign in</Link>
        </Button>
      </Card>
    </main>
  );
}
