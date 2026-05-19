import { useState, type ChangeEvent, type FormEvent } from "react";
import type { Project } from "../api/projects";
import { createLog } from "../api/logs";
import { ApiRequestError } from "../services/api";

type LogCreateFormProps = {
  projects: Project[];
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
  onCreated: () => void;
  onCreateProject: (name: string) => Promise<{ id: string }>;
};

export function LogCreateForm({
  projects,
  selectedProjectId,
  onProjectChange,
  onCreated,
  onCreateProject,
}: LogCreateFormProps) {
  const [message, setMessage] = useState("");
  const [source, setSource] = useState("");
  const [projectNameInput, setProjectNameInput] = useState("");
  const [showCreateProjectPopup, setShowCreateProjectPopup] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreateProjectSubmit() {
    if (!projectNameInput.trim()) return;

    setError("");
    try {
      const created = await onCreateProject(projectNameInput.trim());
      onProjectChange(created.id);
      setProjectNameInput("");
      setShowCreateProjectPopup(false);
      setSuccessMessage("Project created successfully. Ready to submit logs.");
      window.setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Failed to create project"
      );
    }
  }

  function handleProjectChange(event: ChangeEvent<HTMLSelectElement>) {
    const selected = event.target.value;

    if (selected === "__create__") {
      setProjectNameInput("");
      setShowCreateProjectPopup(true);
      return;
    }

    onProjectChange(selected);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!selectedProjectId) {
      setError("Create a project before submitting logs.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      await createLog({
        projectId: selectedProjectId,
        message,
        source: source || undefined,
      });

      setMessage("");
      setSource("");
      setSuccessMessage("Log submitted successfully and queued for AI analysis.");
      window.setTimeout(() => setSuccessMessage(""), 4000);
      onCreated();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Failed to create log"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className={`create-log-form collapsible ${collapsed ? "collapsed" : ""}`}>
        <div className="create-log-header" onClick={() => setCollapsed((s) => !s)}>
          <h3>Submit a log</h3>
          <button
            type="button"
            className="collapse-toggle log-toggle"
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand submit form" : "Collapse submit form"}
            title={collapsed ? "Expand" : "Collapse"}
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed((s) => !s);
            }}
          >
            {collapsed ? "▼" : "▲"}
          </button>
        </div>

        {!collapsed && (
          <form onSubmit={handleSubmit}>

            {error && <p className="form-error">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            <div className="project-row">
              <label>
                Project
                <select
                  value={selectedProjectId}
                  onChange={handleProjectChange}
                  className="project-select"
                >
                  {projects.length === 0 && (
                    <option value="">No projects yet</option>
                  )}
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                  <option value="__create__">+ Create new project</option>
                </select>
              </label>
              <p className="field-help">Choose a project or create one directly from the list.</p>
            </div>

            <label>
              Message
              <textarea
                className="message-input"
                placeholder="Paste or type the log message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
              />
            </label>

            <label>
              Source (optional)
              <input
                className="source-input"
                type="text"
                placeholder="Service name, subsystem, or file path"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </label>

            <button type="submit" disabled={submitting || !selectedProjectId} className="submit-button">
              {submitting ? "Submitting..." : "Submit log"}
            </button>
          </form>
        )}
      </div>

      {showCreateProjectPopup && (
        <div className="project-modal-backdrop">
          <div className="project-modal">
            <h4>Create project</h4>
            <label>
              Project name
              <input
                type="text"
                placeholder="Enter a project name"
                value={projectNameInput}
                onChange={(e) => setProjectNameInput(e.target.value)}
                autoFocus
              />
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setShowCreateProjectPopup(false);
                  setProjectNameInput("");
                  if (!selectedProjectId && projects[0]) {
                    onProjectChange(projects[0].id);
                  }
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="submit-button"
                onClick={handleCreateProjectSubmit}
              >
                Create project
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
