import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../../services/orderService";
import { formatTk } from "../../utils/formatCurrency";
import Navbar from "../../components/common/Navbar";
import PageBackground from "../../components/common/PageBackground";
import { useAuth } from "../../context/AuthContext";

const STATUS_COLOR = {
  placed: "var(--text-muted)", confirmed: "#60a5fa", preparing: "#f59e0b", ready: "#2dd4bf",
  served: "#818cf8", picked_up: "#818cf8", out_for_delivery: "#a78bfa", delivered: "#a78bfa",
  completed: "#22c55e", cancelled: "#ef4444",
};

function MyOrders() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "var(--bg-app)" }}>
      <PageBackground type="image" src="/images/my-orders-bg.jpg" />
      <div className="relative z-20 p-4 lg:p-6">
        <div className="liquid-glass-strong rounded-3xl">
          <Navbar />
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        <div className="liquid-glass-dropdown rounded-3xl p-8 mb-10 flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-4xl" style={{ fontWeight: 500, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
            Your <span className="font-accent" style={{ color: "var(--text-secondary)" }}>Orders</span>
          </h1>
          <div className="liquid-glass rounded-full px-5 py-2.5 text-sm" style={{ color: "var(--text-primary)" }}>
            ★ {profile?.loyalty_points || 0} loyalty points
          </div>
        </div>

        {loading && <p style={{ color: "var(--text-muted)" }}>Loading your orders...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <div className="liquid-glass rounded-2xl p-8 text-center">
            <p style={{ color: "var(--text-muted)" }} className="mb-4">You haven't placed any orders yet.</p>
            <Link to="/menu" className="underline" style={{ color: "var(--text-primary)" }}>
              Browse the menu
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/order/${order.id}`}
              className="liquid-glass rounded-2xl p-5 flex items-center justify-between hover:scale-[1.01] transition-transform"
            >
              <div>
                <p className="text-sm mb-1" style={{ color: "var(--text-faint)" }}>
                  {new Date(order.created_at).toLocaleDateString(undefined, {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                  {" · "}
                  {order.order_type.replace("_", "-")}
                </p>
                <p className="text-base" style={{ color: "var(--text-primary)" }}>
                  {order.items.map((i) => i.name).join(", ")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg" style={{ color: "var(--text-primary)" }}>
                  {formatTk(order.final_amount || order.total_amount)}
                </p>
                <p className="text-xs" style={{ color: STATUS_COLOR[order.status] || "var(--text-muted)" }}>
                  {order.status}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyOrders;