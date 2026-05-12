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
                  <strong>{log.level}</strong> — {log.message}
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