import { useEffect, useState } from "react";
import { getLogs, reanalyzeLog } from "./api/logs";

type LogAnalysis = {
  id: string;
  summary?: string;
  severity?: string;
  possibleCause?: string;
  suggestedFix?: string;
  createdAt?: string;
};

type Log = {
  id: string;
  level: string;
  message: string;
  source?: string;
  createdAt: string;
  analysis?: LogAnalysis | null;
  logAnalysis?: LogAnalysis | null;
};

function App() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 5;

  useEffect(() => {
    setPage(1);
  }, [search, severityFilter]);

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        setError("");

        const result = await getLogs(page, limit, search, severityFilter);

        console.log("Logs API response:", result);

        setLogs(result.data);
        setTotalPages(result.pagination.totalPages || 1);
      } catch (err) {
        console.error(err);
        setError("Could not load logs");
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, [page, search, severityFilter]);

  async function handleReanalyze(logId: string) {
    try {
      await reanalyzeLog(logId);

      alert("Re-analysis started");

      let attempts = 0;

      const intervalId = window.setInterval(async () => {
        attempts += 1;

        const result = await getLogs(page, limit, search, severityFilter);

        setLogs(result.data);
        setTotalPages(result.pagination.totalPages || 1);

        if (attempts >= 5) {
          window.clearInterval(intervalId);
        }
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to re-analyze log");
    }
  }

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">AI-powered log monitoring</p>
          <h1>LogLens AI</h1>
          <p className="subtitle">
            Analyze application logs, detect severity, and generate AI-powered fixes.
          </p>
        </div>
      </header>

      <section className="dashboard-card">
        <div className="section-header">
          <div>
            <h2>Logs</h2>
            <p>Search, filter, and re-analyze log intelligence.</p>
          </div>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {loading && <p>Loading logs...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && logs.length === 0 && (
          <p className="empty-analysis">No matching logs found.</p>
        )}

        {!loading && !error && logs.length > 0 && (
          <ul className="logs-list">
            {logs.map((log) => {
              const analysis = log.analysis || log.logAnalysis;

              return (
                <li className="log-card" key={log.id}>
                  <div className="log-top-row">
                    <span
                      className={`severity-badge severity-${analysis?.severity || "unknown"
                        }`}
                    >
                      {analysis?.severity || log.level}
                    </span>

                    <span className="log-message">{log.message}</span>
                  </div>

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
                        <strong>Possible Cause:</strong> {analysis.possibleCause}
                      </p>
                      <p>
                        <strong>Suggested Fix:</strong> {analysis.suggestedFix}
                      </p>
                    </div>
                  ) : (
                    <p className="empty-analysis">No AI analysis yet.</p>
                  )}

                  <button
                    className="reanalyze-button"
                    onClick={() => handleReanalyze(log.id)}
                  >
                    Re-analyze
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </section>
    </main>
  );
}

export default App;