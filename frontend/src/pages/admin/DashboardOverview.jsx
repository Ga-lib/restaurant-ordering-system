import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getOrderStats } from "../../services/orderService";
import { formatTk } from "../../utils/formatCurrency";

function StatCard({ label, value }) {
  return (
    <div className="liquid-glass rounded-2xl p-5">
      <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-2xl font-medium" style={{ color: "var(--text-primary)" }}>{value}</p>
    </div>
  );
}

function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrderStats().then(setStats).catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1 className="text-3xl mb-8" style={{ fontWeight: 500, color: "var(--text-primary)" }}>Dashboard</h1>

      {error && <p className="text-red-400 mb-6">Error loading stats: {error}</p>}

      {stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatCard label="Sales Today" value={formatTk(stats.total_sales_today)} />
            <StatCard label="Sales This Week" value={formatTk(stats.total_sales_week)} />
            <StatCard label="Sales This Month" value={formatTk(stats.total_sales_month)} />
            <StatCard label="Active Orders" value={stats.active_orders_count} />
          </div>

          <div className="liquid-glass rounded-2xl p-5 mb-8">
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Sales — Last 7 Days</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.last_7_days}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border-soft)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                <Tooltip
                  formatter={(value) => formatTk(value)}
                  contentStyle={{ background: "var(--bg-app)", border: "1px solid var(--glass-border-soft)", borderRadius: 8, color: "var(--text-primary)" }}
                />
                <Line type="monotone" dataKey="sales" stroke="var(--text-primary)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardOverview;