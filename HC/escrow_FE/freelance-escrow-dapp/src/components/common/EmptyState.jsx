import { Briefcase } from "lucide-react";

export default function EmptyState({
  title = "No data found",
  description = "Get started by creating a new item.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="empty-state">
      <Briefcase size={48} className="empty-icon" />

      <h3>{title}</h3>
      <p>{description}</p>

      {actionLabel && (
        <button className="primary-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
