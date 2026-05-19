type LogFiltersProps = {
  search: string;
  severityFilter: string;
  onSearchChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
};

export function LogFilters({
  search,
  severityFilter,
  onSearchChange,
  onSeverityChange,
}: LogFiltersProps) {
  return (
    <div className="filters">
      <input
        type="text"
        placeholder="Search logs..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <select
        value={severityFilter}
        onChange={(e) => onSeverityChange(e.target.value)}
      >
        <option value="all">All Severities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
  );
}
