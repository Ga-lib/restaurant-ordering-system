import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../common/ThemeToggle";
import PageBackground from "../common/PageBackground";

const NAV_ITEMS = [
  { path: "/admin", label: "Dashboard" },
  { path: "/admin/menu", label: "Menu" },
  { path: "/admin/tables", label: "Tables" },
  { path: "/admin/orders", label: "Orders" },
  { path: "/admin/users", label: "Users" },
  { path: "/admin/promotions", label: "Promotions" },
  { path: "/admin/ai-report", label: "AI Reports" },
  { path: "/admin/settings", label: "Settings" },
];

function AdminLayout({ children, backgroundImage }) {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen relative flex flex-col lg:flex-row p-4 lg:p-6 gap-4" style={{ backgroundColor: "var(--bg-app)" }}>
      {backgroundImage && <PageBackground type="image" src={backgroundImage} />}
      <aside className="relative z-10 liquid-glass-strong rounded-3xl w-full lg:w-56 shrink-0 flex lg:flex-col">
        <div className="px-5 py-5 hidden lg:flex items-center justify-between">
          <p className="text-xl" style={{ fontWeight: 500, color: "var(--text-primary)" }}>Admin</p>
          <ThemeToggle />
        </div>
        <nav className="flex-1 px-3 py-3 lg:py-4 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          <div className="lg:hidden"><ThemeToggle /></div>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="px-4 py-2 rounded-full lg:rounded-xl text-sm whitespace-nowrap transition-transform hover:scale-105"
              style={{
                color: location.pathname === item.path ? "var(--text-primary)" : "var(--text-muted)",
                backgroundColor: location.pathname === item.path ? "var(--glass-tint)" : "transparent",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-3 lg:py-4 hidden lg:block">
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl text-sm w-full text-left"
            style={{ color: "var(--text-muted)" }}
          >
            Log Out
          </button>
        </div>
      </aside>

      <main className="relative z-10 flex-1 min-w-0">{children}</main>
    </div>
  );
}

export default AdminLayout;