import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getRedirectPathForRole } from "../../utils/roleRedirect";
import PageBackground from "../../components/common/PageBackground";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const myProfile = await login(email, password);
      navigate(getRedirectPathForRole(myProfile.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ backgroundColor: "var(--bg-app)" }}>
      <PageBackground type="video" src="/videos/login-hero.mp4" />
      <div className="liquid-glass-strong rounded-3xl p-10 w-full max-w-sm relative z-10">
        <h1 className="text-3xl text-center mb-8" style={{ fontWeight: 500, color: "var(--text-primary)" }}>
          Log <span className="font-accent" style={{ color: "var(--text-secondary)" }}>In</span>
        </h1>

        {error && (
          <div className="liquid-glass rounded-xl p-3 mb-5 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-transparent border rounded-full px-5 py-3 outline-none"
            style={{ borderColor: "var(--text-faint)", color: "var(--text-primary)" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-transparent border rounded-full px-5 py-3 outline-none"
            style={{ borderColor: "var(--text-faint)", color: "var(--text-primary)" }}
          />
          <button
            type="submit"
            disabled={loading}
            className="liquid-glass-strong rounded-full py-3 font-medium mt-2 hover:scale-105 transition-transform disabled:opacity-50"
            style={{ color: "var(--text-primary)" }}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-sm mt-6 text-center" style={{ color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/signup" className="underline" style={{ color: "var(--text-primary)" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;