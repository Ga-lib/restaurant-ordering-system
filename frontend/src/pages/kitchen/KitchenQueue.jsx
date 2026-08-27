import { useEffect, useState } from "react";
import { listOrders, updateOrderStatus } from "../../services/orderService";
import { useAuth } from "../../context/AuthContext";
import { formatTk } from "../../utils/formatCurrency";
import { useToast } from "../../context/ToastContext";
import ThemeToggle from "../../components/common/ThemeToggle";
import PageBackground from "../../components/common/PageBackground";

const ACTIVE_STATUSES = ["placed", "confirmed", "preparing", "ready"];
const NEXT_STATUS = { placed: "confirmed", confirmed: "preparing", preparing: "ready" };
const NEXT_LABEL = { placed: "Confirm Order", confirmed: "Start Preparing", preparing: "Mark Ready" };
const STATUS_COLOR = { placed: "var(--text-muted)", confirmed: "#60a5fa", preparing: "#f59e0b", ready: "#22c55e" };

function KitchenQueue() {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  function loadOrders() {
    setLoading(true);
    listOrders()
      .then((all) => setOrders(all.filter((o) => ACTIVE_STATUSES.includes(o.status))))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  async function handleAdvanceStatus(order) {
    const nextStatus = NEXT_STATUS[order.status];
    if (!nextStatus) return;
    setUpdatingId(order.id);
    try {
      await updateOrderStatus(order.id, { status: nextStatus });
      loadOrders();
      showToast(`Order status updated to "${nextStatus}"`);
    } catch (err) {
      alert("Failed to update order: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="min-h-screen relative p-4 lg:p-6" style={{ backgroundColor: "var(--bg-app)" }}>
      <PageBackground type="video" src="/videos/kitchen-hero.mp4" />
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="liquid-glass-strong rounded-3xl px-6 py-5 flex items-center justify-between mb-6">
          <h1 className="text-2xl" style={{ fontWeight: 500, color: "var(--text-primary)" }}>Kitchen Queue</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={logout} className="text-sm" style={{ color: "var(--text-muted)" }}>Log Out</button>
          </div>
        </div>

        {loading && <p style={{ color: "var(--text-muted)" }}>Loading orders...</p>}
        {error && <p className="text-red-400">Error: {error}</p>}
        {!loading && orders.length === 0 && <p style={{ color: "var(--text-muted)" }}>No active orders right now.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((order) => (
            <div key={order.id} className="liquid-glass rounded-2xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium" style={{ color: STATUS_COLOR[order.status] }}>{order.status}</span>
                <span className="text-xs uppercase" style={{ color: "var(--text-faint)" }}>
                  {order.order_type.replace("_", "-")}{order.table_id && ` · Table`}
                </span>
              </div>

              <div className="flex-1 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1" style={{ color: "var(--text-secondary)" }}>
                    <span>{item.name} × {item.quantity}</span>
                  </div>
                ))}
              </div>

              {order.special_instructions && (
                <p className="text-xs liquid-glass rounded-lg p-2 mb-3" style={{ color: "#f59e0b" }}>
                  Note: {order.special_instructions}
                </p>
              )}

              <div className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Total: {formatTk(order.total_amount)}</div>

              {NEXT_STATUS[order.status] && (
                <button
                  onClick={() => handleAdvanceStatus(order)}
                  disabled={updatingId === order.id}
                  className="liquid-glass-strong rounded-full py-2.5 text-sm font-medium disabled:opacity-50 hover:scale-105 transition-transform"
                  style={{ color: "var(--text-primary)" }}
                >
                  {updatingId === order.id ? "Updating..." : NEXT_LABEL[order.status]}
                </button>
              )}

              {order.status === "ready" && (
                <p className="text-center text-sm font-medium" style={{ color: "#22c55e" }}>Waiting for pickup/service</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default KitchenQueue;