import type { DashboardAlert } from "@/lib/domain/metrics";

const severityLabels: Record<DashboardAlert["severity"], string> = {
  INFO: "Information",
  WARNING: "Warning",
  ERROR: "Error",
};

export default function StatusAlert({ alert }: { alert: DashboardAlert }) {
  return (
    <li className={`dashboard-alert dashboard-alert--${alert.severity.toLowerCase()}`}>
      <span className="dashboard-alert-label">{severityLabels[alert.severity]}</span>
      <div>
        <h4>{alert.title}</h4>
        <p>{alert.message}</p>
      </div>
    </li>
  );
}
