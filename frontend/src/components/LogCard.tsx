import { useState } from "react";
import type { Log } from "../api/logs";
import { StatusBadge } from "./StatusBadge";

type LogCardProps = {
  log: Log;
  reanalyzing: boolean;
  onReanalyze: (logId: string) => void;
};

export function LogCard({ log, reanalyzing, onReanalyze }: LogCardProps) {
  const analysis = log.analysis;
  const [collapsed, setCollapsed] = useState(true);

  return (
    <li className={`log-card ${collapsed ? "collapsed" : ""}`}>
      <div className="log-top-row" onClick={() => setCollapsed((s: boolean) => !s)}>
        <StatusBadge status={log.status} />
        <span
          className={`severity-badge severity-${analysis?.severity || "unknown"}`}
        >
          {analysis?.severity || log.level}
        </span>
        <span className="log-message">{log.message}</span>
        <button
          type="button"
          className="collapse-toggle log-toggle"
          aria-expanded={!collapsed}
          onClick={(e) => {
            e.stopPropagation();
            setCollapsed((s: boolean) => !s);
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d={collapsed ? "M6 9L12 15L18 9" : "M6 15L12 9L18 15"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <>
          {log.errorMessage && (
            <p className="form-error">Processing error: {log.errorMessage}</p>
          )}

          {analysis ? (
            <div className="analysis-box">
              <h3>AI Analysis</h3>
              <p>
                <strong>Summary:</strong> {analysis.summary}
              </p>
              <p>
                <strong>Severity:</strong> {analysis.severity}
              </p>
              <p>
                <strong>Category:</strong> {analysis.category}
              </p>
              <p>
                <strong>Possible Cause:</strong> {analysis.possibleCause}
              </p>
              <p>
                <strong>Suggested Fix:</strong> {analysis.suggestedFix}
              </p>
            </div>
          ) : (
            <p className="empty-analysis">
              {log.status === "processing" || log.status === "pending"
                ? "AI analysis in progress..."
                : "No AI analysis yet."}
            </p>
          )}

          <button
            className="reanalyze-button"
            disabled={reanalyzing || log.status === "processing"}
            onClick={() => onReanalyze(log.id)}
          >
            {reanalyzing ? "Re-analyzing..." : "Re-analyze"}
          </button>
        </>
      )}
    </li>
  );
}
