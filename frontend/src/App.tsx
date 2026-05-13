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
        const data = await getLogs();

        console.log("Logs API response:", data);

        setLogs(data.logs || data.data || data);
      } catch (err) {
        console.error(err);
        setError("Could not load logs");
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  return (
    <main>
      <h1>LogLens AI</h1>
      <p>Day 20: Frontend connected to backend</p>

      {loading && <p>Loading logs...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <section>
          <h2>Logs</h2>

          {logs.length === 0 ? (
            <p>No logs found.</p>
          ) : (
            <ul>
              {logs.map((log) => (
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
        </section>
      )}
    </main>
  );
}

export default App;