import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiRequest, ApiRequestError } from "../services/api";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthResponse = {
  message: string;
  data: {
    user: User;
    token: string;
  };
};

type MeResponse = {
  data: User;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  const persistSession = useCallback((nextToken: string, nextUser: User) => {
    localStorage.setItem("token", nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest<MeResponse>("/auth/me");
        setUser(response.data);
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [token, logout]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, [logout]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      persistSession(response.data.token, response.data.user);
    },
    [persistSession]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      persistSession(response.data.token, response.data.user);
    },
    [persistSession]
  );

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
