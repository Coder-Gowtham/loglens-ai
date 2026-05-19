import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiRequestError } from "../services/api";

export function Register() {
  const { register, token } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
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
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Registration failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">LogLens AI</p>
        <h1>Create account</h1>
        <p className="auth-subtitle">Start analyzing logs with AI insights.</p>

        {error && <p className="form-error">{error}</p>}

        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

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
            minLength={8}
            required
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </button>

        <p className="auth-footer">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
