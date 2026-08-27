import { useEffect, useState } from "react";
import { listOrders, updateOrderStatus, updatePayment } from "../../services/orderService";
import { useAuth } from "../../context/AuthContext";
import { formatTk } from "../../utils/formatCurrency";
import ThemeToggle from "../../components/common/ThemeToggle";
import { useToast } from "../../context/ToastContext";
import PageBackground from "../../components/common/PageBackground";

function RiderDashboard() {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  function loadOrders() {
    setLoading(true);
    listOrders({ order_type: "online" })
      .then((all) => setOrders(all.filter((o) => ["ready", "out_for_delivery"].includes(o.status))))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  async function handleAcceptDelivery(order) {
    setBusyId(order.id);
    try {
      await updateOrderStatus(order.id, { status: "out_for_delivery" });
      loadOrders();
      showToast("Delivery started");
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleMarkDelivered(order) {
    setBusyId(order.id);
    try {
      await updateOrderStatus(order.id, { status: "delivered" });
      if (order.payment_method === "cash_on_delivery" && order.payment_status === "unpaid") {
        await updatePayment(order.id, { payment_status: "paid" });
      }
      await updateOrderStatus(order.id, { status: "completed" });
      loadOrders();
      showToast("Delivery completed");
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setBusyId(null);
    }
  }

  const readyForPickup = orders.filter((o) => o.status === "ready");
  const outForDelivery = orders.filter((o) => o.status === "out_for_delivery");

  return (
    <div className="min-h-screen relative p-4 lg:p-6" style={{ backgroundColor: "var(--bg-app)" }}>
      <PageBackground type="image" src="/images/rider-bg.jpg" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="liquid-glass-strong rounded-3xl px-6 py-5 flex items-center justify-between mb-6">
          <h1 className="text-2xl" style={{ fontWeight: 500, color: "var(--text-primary)" }}>Delivery Dashboard</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={logout} className="text-sm" style={{ color: "var(--text-muted)" }}>Log Out</button>
          </div>
        </div>

        {loading && <p style={{ color: "var(--text-muted)" }}>Loading orders...</p>}
        {error && <p className="text-red-400">Error: {error}</p>}

        <h2 className="text-lg mb-3" style={{ fontWeight: 500, color: "var(--text-primary)" }}>Ready for Pickup</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {readyForPickup.length === 0 && <p className="text-sm col-span-3" style={{ color: "var(--text-faint)" }}>Nothing waiting for pickup right now.</p>}
          {readyForPickup.map((order) => (
            <div key={order.id} className="liquid-glass rounded-2xl p-5">
              <p className="text-xs mb-2" style={{ color: "var(--text-faint)" }}>Order {order.id.slice(0, 6)}</p>
              {order.items.map((item, idx) => <p key={idx} className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.name} × {item.quantity}</p>)}
              <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>Deliver to: {order.delivery_address || "No address provided"}</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Total: {formatTk(order.total_amount)}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>Payment: {order.payment_method?.replace(/_/g, " ")} ({order.payment_status})</p>
              <button
                onClick={() => handleAcceptDelivery(order)}
                disabled={busyId === order.id}
                className="mt-4 w-full liquid-glass-strong rounded-full py-2.5 text-sm font-medium disabled:opacity-50 hover:scale-105 transition-transform"
                style={{ color: "var(--text-primary)" }}
              >
                {busyId === order.id ? "Updating..." : "Accept & Start Delivery"}
              </button>
            </div>
          ))}
        </div>

        <h2 className="text-lg mb-3" style={{ fontWeight: 500, color: "var(--text-primary)" }}>Out for Delivery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {outForDelivery.length === 0 && <p className="text-sm col-span-3" style={{ color: "var(--text-faint)" }}>No active deliveries right now.</p>}
          {outForDelivery.map((order) => (
            <div key={order.id} className="liquid-glass rounded-2xl p-5">
              <p className="text-xs mb-2" style={{ color: "var(--text-faint)" }}>Order {order.id.slice(0, 6)}</p>
              {order.items.map((item, idx) => <p key={idx} className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.name} × {item.quantity}</p>)}
              <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>Deliver to: {order.delivery_address || "No address provided"}</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Total: {formatTk(order.total_amount)}</p>

              {order.payment_method === "cash_on_delivery" && order.payment_status === "unpaid" ? (
                <p className="text-xs liquid-glass rounded-lg p-2 mt-2" style={{ color: "#f59e0b" }}>
                  Collect {formatTk(order.total_amount)} cash on delivery
                </p>
              ) : (
                <p className="text-xs liquid-glass rounded-lg p-2 mt-2" style={{ color: "#22c55e" }}>
                  Already paid ({order.payment_method?.replace(/_/g, " ")})
                </p>
              )}

              <button
                onClick={() => handleMarkDelivered(order)}
                disabled={busyId === order.id}
                className="mt-4 w-full liquid-glass-strong rounded-full py-2.5 text-sm font-medium disabled:opacity-50 hover:scale-105 transition-transform"
                style={{ color: "var(--text-primary)" }}
              >
                {busyId === order.id ? "Processing..." : "Mark Delivered & Complete"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RiderDashboard;