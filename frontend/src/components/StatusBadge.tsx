const statusLabels: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-badge status-${status}`}>
      {statusLabels[status] || status}
    </span>
  );
}
