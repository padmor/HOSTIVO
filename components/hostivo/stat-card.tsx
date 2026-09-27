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
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="pt-1 text-[11px] font-semibold uppercase tracking-[0.02em] text-muted-foreground">
          {label}
        </span>
        <span
          className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-primary-soft text-primary"
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>

      <div className="mt-4 text-[28px] font-extrabold leading-[29px] tracking-[-0.02em]">
        {value}
      </div>

      <div className="mt-1 text-[11px] leading-4 text-muted-foreground">
        {detail}
      </div>

      {trend ? (
        <div className="mt-2">
          <Badge variant="success">{trend}</Badge>
        </div>
      ) : null}
    </Card>
  );
}
