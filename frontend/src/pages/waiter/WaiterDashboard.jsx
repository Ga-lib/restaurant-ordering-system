import { useEffect, useState } from "react";
import { listOrders, updateOrderStatus, updatePayment } from "../../services/orderService";
import { releaseTable } from "../../services/tableService";
import { useAuth } from "../../context/AuthContext";
import { formatTk } from "../../utils/formatCurrency";
import BillSlip from "../../components/admin/BillSlip";
import { useToast } from "../../context/ToastContext";
import ThemeToggle from "../../components/common/ThemeToggle";
import PageBackground from "../../components/common/PageBackground";

function WaiterDashboard() {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [billOrder, setBillOrder] = useState(null);

  function loadOrders() {
    setLoading(true);
    listOrders()
      .then((all) => {
        const relevant = all.filter(
          (o) =>
            (o.order_type === "dine_in" && (o.status === "ready" || o.status === "served")) ||
            (o.order_type === "takeaway" && o.status === "ready")
        );
        setOrders(relevant);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  async function handleMarkServed(order) {
    setBusyId(order.id);
    try {
      await updateOrderStatus(order.id, { status: "served" });
      loadOrders();
      showToast("Order marked served");
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleMarkPaidAndComplete(order) {
    setBusyId(order.id);
    try {
      await updatePayment(order.id, { payment_status: "paid", payment_method: "offline" });
      await updateOrderStatus(order.id, { status: "completed" });
      if (order.table_id) await releaseTable(order.table_id);
      loadOrders();
      showToast("Order completed");
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleTakeawayPickedUp(order) {
    setBusyId(order.id);
    try {
      await updatePayment(order.id, { payment_status: "paid" });
      await updateOrderStatus(order.id, { status: "completed" });
      loadOrders();
      showToast("Takeaway order completed");
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setBusyId(null);
    }
  }

  const readyDineInOrders = orders.filter((o) => o.order_type === "dine_in" && o.status === "ready");
  const readyTakeawayOrders = orders.filter((o) => o.order_type === "takeaway" && o.status === "ready");
  const servedOrders = orders.filter((o) => o.status === "served");

  return (
    <div className="min-h-screen relative p-4 lg:p-6" style={{ backgroundColor: "var(--bg-app)" }}>
      <PageBackground type="image" src="/images/waiter-bg.jpg" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="liquid-glass-strong rounded-3xl px-6 py-5 flex items-center justify-between mb-6">
          <h1 className="text-2xl" style={{ fontWeight: 500, color: "var(--text-primary)" }}>Waiter Dashboard</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={logout} className="text-sm" style={{ color: "var(--text-muted)" }}>Log Out</button>
          </div>
        </div>

        {loading && <p style={{ color: "var(--text-muted)" }}>Loading orders...</p>}
        {error && <p className="text-red-400">Error: {error}</p>}

        <h2 className="text-lg mb-3" style={{ fontWeight: 500, color: "var(--text-primary)" }}>Ready to Serve (Dine-in)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {readyDineInOrders.length === 0 && <p className="text-sm col-span-3" style={{ color: "var(--text-faint)" }}>Nothing waiting right now.</p>}
          {readyDineInOrders.map((order) => (
            <div key={order.id} className="liquid-glass rounded-2xl p-5">
              <p className="text-xs mb-2" style={{ color: "var(--text-faint)" }}>Order {order.id.slice(0, 6)}</p>
              {order.items.map((item, idx) => <p key={idx} className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.name} × {item.quantity}</p>)}
              <button
                onClick={() => handleMarkServed(order)}
                disabled={busyId === order.id}
                className="mt-4 w-full liquid-glass-strong rounded-full py-2.5 text-sm font-medium disabled:opacity-50 hover:scale-105 transition-transform"
                style={{ color: "var(--text-primary)" }}
              >
                {busyId === order.id ? "Updating..." : "Mark Served"}
              </button>
            </div>
          ))}
        </div>

        <h2 className="text-lg mb-3" style={{ fontWeight: 500, color: "var(--text-primary)" }}>Ready for Pickup (Takeaway)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {readyTakeawayOrders.length === 0 && <p className="text-sm col-span-3" style={{ color: "var(--text-faint)" }}>No takeaway orders waiting.</p>}
          {readyTakeawayOrders.map((order) => (
            <div key={order.id} className="liquid-glass rounded-2xl p-5">
              <p className="text-xs mb-2" style={{ color: "var(--text-faint)" }}>Order {order.id.slice(0, 6)}</p>
              {order.items.map((item, idx) => <p key={idx} className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.name} × {item.quantity}</p>)}
              <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>Total: {formatTk(order.final_amount || order.total_amount)}</p>
              <p className="text-xs" style={{ color: "var(--text-faint)" }}>Payment: {order.payment_method?.replace(/_/g, " ")} ({order.payment_status})</p>
              <button
                onClick={() => handleTakeawayPickedUp(order)}
                disabled={busyId === order.id}
                className="mt-4 w-full liquid-glass-strong rounded-full py-2.5 text-sm font-medium disabled:opacity-50 hover:scale-105 transition-transform"
                style={{ color: "var(--text-primary)" }}
              >
                {busyId === order.id ? "Processing..." : "Confirm Picked Up & Paid"}
              </button>
            </div>
          ))}
        </div>

        <h2 className="text-lg mb-3" style={{ fontWeight: 500, color: "var(--text-primary)" }}>Served — Awaiting Payment</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {servedOrders.length === 0 && <p className="text-sm col-span-3" style={{ color: "var(--text-faint)" }}>No served orders waiting on payment.</p>}
          {servedOrders.map((order) => (
            <div key={order.id} className="liquid-glass rounded-2xl p-5">
              <p className="text-xs mb-2" style={{ color: "var(--text-faint)" }}>Order {order.id.slice(0, 6)}</p>
              {order.items.map((item, idx) => <p key={idx} className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.name} × {item.quantity}</p>)}
              <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>Total: {formatTk(order.final_amount || order.total_amount)}</p>
              <button
                onClick={() => setBillOrder(order)}
                className="mt-4 w-full liquid-glass rounded-full py-2.5 text-sm font-medium hover:scale-105 transition-transform"
                style={{ color: "var(--text-muted)" }}
              >
                View / Print Bill
              </button>
              <button
                onClick={() => handleMarkPaidAndComplete(order)}
                disabled={busyId === order.id}
                className="mt-2 w-full liquid-glass-strong rounded-full py-2.5 text-sm font-medium disabled:opacity-50 hover:scale-105 transition-transform"
                style={{ color: "var(--text-primary)" }}
              >
                {busyId === order.id ? "Processing..." : "Mark Paid & Complete"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {billOrder && <BillSlip order={billOrder} onClose={() => setBillOrder(null)} />}
    </div>
  );
}

export default WaiterDashboard;