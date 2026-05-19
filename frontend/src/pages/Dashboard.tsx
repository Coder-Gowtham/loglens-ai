import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLogs, reanalyzeLog, type Log } from "../api/logs";
import { createProject, getProjects, type Project } from "../api/projects";
import { useAuth } from "../context/AuthContext";
import { useDebounce } from "../hooks/useDebounce";
import { LogCard } from "../components/LogCard";
import { LogCreateForm } from "../components/LogCreateForm";
import { LogFilters } from "../components/LogFilters";
import { ApiRequestError } from "../services/api";

const LIMIT = 5;
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 20;

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [logs, setLogs] = useState<Log[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reanalyzingId, setReanalyzingId] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const loadProjects = useCallback(async () => {
    const response = await getProjects();
    setProjects(response.data);
    return response.data;
  }, []);

  const loadLogs = useCallback(async () => {
    const result = await getLogs(
      page,
      LIMIT,
      debouncedSearch,
      severityFilter,
      selectedProjectId
    );
    setLogs(result.data);
    setTotalPages(result.pagination.totalPages || 1);
  }, [page, debouncedSearch, severityFilter, selectedProjectId]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, severityFilter, selectedProjectId]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");
        const projectList = await loadProjects();
        const initialProjectId =
          selectedProjectId || projectList[0]?.id || "";

        if (!selectedProjectId && initialProjectId) {
          setSelectedProjectId(initialProjectId);
        }

        const result = await getLogs(
          page,
          LIMIT,
          debouncedSearch,
          severityFilter,
          initialProjectId
        );
        setLogs(result.data);
        setTotalPages(result.pagination.totalPages || 1);
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 401) {
          logout();
          navigate("/login");
          return;
        }
        setError("Could not load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [loadLogs, loadProjects, logout, navigate, page, debouncedSearch, severityFilter, selectedProjectId]);

  useEffect(() => {
    const hasPending = logs.some(
      (log) => log.status === "pending" || log.status === "processing"
    );

    if (!hasPending) return;

    const intervalId = window.setInterval(() => {
      loadLogs().catch(() => undefined);
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [logs, loadLogs]);

  async function handleReanalyze(logId: string) {
    setReanalyzingId(logId);

    try {
      await reanalyzeLog(logId);
      await loadLogs();

      let attempts = 0;
      const intervalId = window.setInterval(async () => {
        attempts += 1;

        try {
          const result = await getLogs(
            page,
            LIMIT,
            debouncedSearch,
            severityFilter,
            selectedProjectId
          );
          setLogs(result.data);

          const target = result.data.find((log) => log.id === logId);
          const done =
            target?.status === "completed" || target?.status === "failed";

          if (done || attempts >= MAX_POLL_ATTEMPTS) {
            window.clearInterval(intervalId);
            setReanalyzingId(null);
          }
        } catch {
          window.clearInterval(intervalId);
          setReanalyzingId(null);
        }
      }, POLL_INTERVAL_MS);
    } catch {
      setError("Failed to re-analyze log");
      setReanalyzingId(null);
    }
  }

  async function handleCreateProject(name: string) {
    const response = await createProject(name);
    await loadProjects();
    setSelectedProjectId(response.data.id);
    return { id: response.data.id };
  }

  function handleProjectChange(projectId: string) {
    setSelectedProjectId(projectId);
    setPage(1);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">AI-powered log monitoring</p>
          <h1>LogLens AI</h1>
          <p className="subtitle">
            Welcome back, {user?.name}. Analyze logs, detect severity, and get
            AI-powered fixes.
          </p>
        </div>
        <button
          className="logout-button"
          onClick={handleLogout}
          title="Log out of LogLens AI"
          data-tooltip="Logout"
          aria-label="Log out"
        >
          Log out
        </button>
      </header>

      <section className="dashboard-card">
        <LogCreateForm
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectChange={handleProjectChange}
          onCreated={loadLogs}
          onCreateProject={handleCreateProject}
        />

        <div className="section-header">
          <div>
            <h2>Logs</h2>
            <p>Search, filter, and re-analyze log intelligence.</p>
          </div>
          <button
            type="button"
            className="hint-button"
            onClick={() => setShowGuide((value) => !value)}
          >
            {showGuide ? "Hide Guide" : "Show Guide"}
          </button>
        </div>

        {showGuide && (
          <div className="dashboard-guide-card">
            <h3>How to use LogLens AI</h3>
            <ul>
              <li>Create a project first using the dropdown.</li>
              <li>Then submit a log with the message and optional source.</li>
              <li>Logs will be queued for AI analysis automatically.</li>
              <li>Only create a small number of logs — AI processing consumes credits.</li>
            </ul>
          </div>
        )}

        <LogFilters
          search={search}
          severityFilter={severityFilter}
          onSearchChange={setSearch}
          onSeverityChange={setSeverityFilter}
        />

        {loading && <p>Loading logs...</p>}
        {error && <p className="form-error">{error}</p>}

        {!loading && !error && logs.length === 0 && (
          <p className="empty-analysis">No matching logs found.</p>
        )}

        {!loading && !error && logs.length > 0 && (
          <ul className="logs-list">
            {logs.map((log) => (
              <LogCard
                key={log.id}
                log={log}
                reanalyzing={reanalyzingId === log.id}
                onReanalyze={handleReanalyze}
              />
            ))}
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
