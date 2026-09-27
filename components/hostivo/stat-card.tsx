type StatCardProps = {
  label: string;
  value: string | number;
  detail: string;
  icon: string;
  trend?: string;
};

export function StatCard({ label, value, detail, icon, trend }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span className="stat-icon" aria-hidden="true">{icon}</span>
        {trend ? <span className="trend-pill">{trend}</span> : null}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-detail">{detail}</div>
    </article>
  );
}
