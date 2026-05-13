import { useEffect, useState } from "react";
import { getLogs } from "./api/logs";

type Log = {
  id: string;
  level: string;
  message: string;
  source?: string;
  createdAt: string;
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

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);

        const result = await getLogs(page, limit);

        console.log("Logs API response:", result);

        setLogs(result.data);
        setTotalPages(result.pagination.totalPages);
      } catch (err) {
        console.error(err);
        setError("Could not load logs");
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, [page]);

  const filteredLogs = logs.filter((log) => {
    const analysis = log.analysis || log.logAnalysis;

    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase());

    const matchesSeverity =
      severityFilter === "all" ||
      analysis?.severity?.toLowerCase() === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  return (
    <main>
      <h1>LogLens AI</h1>


      {loading && <p>Loading logs...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <section>
          <h2>Logs</h2>

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

          {filteredLogs.length === 0 ? (
            <p>No matching logs found.</p>
          ) : (
            <ul>
              {filteredLogs.map((log) => (

                <li key={log.id}>
                  <div>
                    <strong>{log.level}</strong> — {log.message}
                  </div>

                  {(log.analysis || log.logAnalysis) ? (
                    <div>
                      <h3>AI Analysis</h3>
                      <p>
                        <strong>Summary:</strong>{" "}
                        {(log.analysis || log.logAnalysis)?.summary || "Not available"}
                      </p>
                      <p>
                        <strong>Severity:</strong>{" "}
                        {(log.analysis || log.logAnalysis)?.severity || "Not available"}
                      </p>
                      <p>
                        <strong>Possible Cause:</strong>{" "}
                        {(log.analysis || log.logAnalysis)?.possibleCause || "Not available"}
                      </p>
                      <p>
                        <strong>Suggested Fix:</strong>{" "}
                        {(log.analysis || log.logAnalysis)?.suggestedFix || "Not available"}
                      </p>
                    </div>
                  ) : (
                    <p>No AI analysis yet.</p>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage((currentPage) => currentPage - 1)}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              Next
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;