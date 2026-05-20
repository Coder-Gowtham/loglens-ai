import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiRequestError } from "../services/api";

export function Login() {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (token) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Login failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">LogLens AI</p>
        <h1>Sign in</h1>
        <p className="auth-subtitle">Access your log intelligence dashboard.</p>

        {error && <p className="form-error">{error}</p>}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
        <p className="auth-footer">
          No account? <Link to="/register">Create one</Link>
        </p>

        <div className="login-hint-card">
          <p className="login-hint-title">How to use the app</p>
          <ul>
            <li>Use the demo recruiter account: <strong>gowtham@test.com</strong></li>
            <li>Password is the same as the email: <strong>gowtham@test.com</strong></li>
            <li>You may also use any dummy email/password combination.</li>
            <li>After login, create a project and submit a few logs.</li>
            <li>Keep log volume small — AI analysis uses credits.</li>
          </ul>
        </div>


      </form>
    </main>
  );
}
