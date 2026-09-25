type MetricCardProps = {
  label: string;
  value: string;
  supportingText: string;
  tone?: "default" | "accent" | "success" | "warning";
};

export default function MetricCard({
  label,
  value,
  supportingText,
  tone = "default",
}: MetricCardProps) {
  return (
    <article className={`dashboard-metric dashboard-metric--${tone}`}>
      <h4>{label}</h4>
      <p className="dashboard-metric-value">{value}</p>
      <p className="dashboard-metric-detail">{supportingText}</p>
    </article>
  );
}
