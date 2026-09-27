import { Card } from "@/components/ui/card";

type SectionCardProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export function SectionCard({
  title,
  description,
  action,
  children,
}: SectionCardProps) {
  return (
    <Card className="overflow-hidden rounded-[8px]">
      <div className="flex items-start justify-between gap-4 p-5 pb-3.5">
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold leading-5 tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      <div>{children}</div>
    </Card>
  );
}
