import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type StatCardProps = {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ReactNode;
  trend?: string;
};

export function StatCard({ label, value, detail, icon, trend }: StatCardProps) {
  return (
    <Card className="p-[18px]">
      <div className="flex items-center justify-between gap-2">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-primary-soft text-primary-dark"
          aria-hidden="true"
        >
          {icon}
        </span>
        {trend ? <Badge variant="success">{trend}</Badge> : null}
      </div>
      <div className="mt-4 text-[27px] font-black leading-none tracking-tight">
        {value}
      </div>
      <div className="mt-1 text-xs font-extrabold">{label}</div>
      <div className="mt-1.5 text-[11px] text-muted-foreground">{detail}</div>
    </Card>
  );
}
