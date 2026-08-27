import { useEffect, useState } from "react";
import { listOrders, cancelOrder, updatePayment, listOrderMessages, sendOrderMessage } from "../../services/orderService";
import { useToast } from "../../context/ToastContext";
import { formatTk } from "../../utils/formatCurrency";

const STATUS_COLOR = {
  placed: "var(--text-muted)", confirmed: "#60a5fa", preparing: "#f59e0b", ready: "#2dd4bf",
  served: "#818cf8", picked_up: "#818cf8", out_for_delivery: "#a78bfa", delivered: "#a78bfa",
  completed: "#22c55e", cancelled: "#ef4444",
};
const PAYMENT_COLOR = { unpaid: "var(--text-muted)", paid: "#22c55e", refunded: "#ef4444" };

function AdminOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [chatOrderId, setChatOrderId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newReply, setNewReply] = useState("");

  function loadOrders() {
    setLoading(true);
    listOrders().then(setOrders).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOrders();
  }, []);

  function openChat(orderId) {
    setChatOrderId(orderId);
    listOrderMessages(orderId).then(setChatMessages).catch(() => {});
  }

  async function handleSendReply(e) {
    e.preventDefault();
    if (!newReply.trim()) return;
    try {
      await sendOrderMessage(chatOrderId, newReply);
      setNewReply("");
      const updated = await listOrderMessages(chatOrderId);
      setChatMessages(updated);
      showToast("Reply sent");
    } catch (err) {
      alert("Failed: " + err.message);
    }
  }

  async function handleCancel(order) {
    if (!confirm(`Cancel order ${order.id.slice(0, 6)}? This cannot be undone.`)) return;
    setBusyId(order.id);
    try {
      await cancelOrder(order.id);
      loadOrders();
      showToast("Order cancelled");
    } catch (err) {
      alert("Failed to cancel: " + err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRefund(order) {
    if (!confirm(`Mark order ${order.id.slice(0, 6)} as refunded?`)) return;
    setBusyId(order.id);
    try {
      await updatePayment(order.id, { payment_status: "refunded" });
      loadOrders();
      showToast("Order marked refunded");
    } catch (err) {
      alert("Failed to refund: " + err.message);
    } finally {
      setBusyId(null);
    }
  }

  const visibleOrders = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (typeFilter !== "all" && o.order_type !== typeFilter) return false;
    return true;
  });

  const allStatuses = ["placed", "confirmed", "preparing", "ready", "served", "picked_up", "out_for_delivery", "delivered", "completed", "cancelled"];
  const inputStyle = { color: "var(--text-primary)", backgroundColor: "var(--bg-app)" };

  return (
    <div>
      <h1 className="text-3xl mb-6" style={{ fontWeight: 500, color: "var(--text-primary)" }}>All Orders</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="liquid-glass rounded-full px-4 py-2 text-sm outline-none" style={inputStyle}>
          <option value="all">All order types</option>
          <option value="dine_in">Dine-in</option>
          <option value="takeaway">Takeaway</option>
          <option value="online">Online / Delivery</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="liquid-glass rounded-full px-4 py-2 text-sm outline-none" style={inputStyle}>
          <option value="all">All statuses</option>
          {allStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={loadOrders} className="text-sm underline" style={{ color: "var(--text-muted)" }}>Refresh</button>
      </div>

      {loading && <p style={{ color: "var(--text-muted)" }}>Loading orders...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && !error && (
        <div className="liquid-glass rounded-2xl overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead style={{ color: "var(--text-muted)" }}>
              <tr>
                <th className="p-4">Order</th><th className="p-4">Type</th><th className="p-4">Items</th>
                <th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4">Payment</th><th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order) => (
                <tr key={order.id} className="border-t align-top" style={{ borderColor: "var(--glass-border-soft)" }}>
                  <td className="p-4" style={{ color: "var(--text-muted)" }}>
                    {order.id.slice(0, 8)}<br />
                    <span className="text-xs" style={{ color: "var(--text-faint)" }}>{new Date(order.created_at).toLocaleString()}</span>
                  </td>
                  <td className="p-4 capitalize" style={{ color: "var(--text-primary)" }}>{order.order_type.replace("_", "-")}</td>
                  <td className="p-4" style={{ color: "var(--text-secondary)" }}>
                    {order.items.map((item, idx) => <div key={idx}>{item.name} × {item.quantity}</div>)}
                  </td>
                  <td className="p-4 font-medium" style={{ color: "var(--text-primary)" }}>{formatTk(order.total_amount)}</td>
                  <td className="p-4"><span className="text-xs" style={{ color: STATUS_COLOR[order.status] }}>{order.status}</span></td>
                  <td className="p-4">
                    <span className="text-xs" style={{ color: PAYMENT_COLOR[order.payment_status] }}>{order.payment_status}</span>
                    {order.payment_method && <div className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>{order.payment_method.replace(/_/g, " ")}</div>}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => openChat(order.id)} className="text-xs underline text-left" style={{ color: "var(--text-muted)" }}>Messages</button>
                      {order.status !== "cancelled" && order.status !== "completed" && (
                        <button onClick={() => handleCancel(order)} disabled={busyId === order.id} className="text-xs text-red-400 hover:text-red-300 underline text-left disabled:opacity-50">
                          Cancel Order
                        </button>
                      )}
                      {order.payment_status === "paid" && (
                        <button onClick={() => handleRefund(order)} disabled={busyId === order.id} className="text-xs underline text-left disabled:opacity-50" style={{ color: "#f59e0b" }}>
                          Mark Refunded
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {visibleOrders.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center" style={{ color: "var(--text-muted)" }}>No orders match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {chatOrderId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="liquid-glass-dropdown rounded-3xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg" style={{ color: "var(--text-primary)" }}>Order Messages</h3>
              <button onClick={() => setChatOrderId(null)} style={{ color: "var(--text-muted)" }}>✕</button>
            </div>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-4">
              {chatMessages.length === 0 && <p className="text-xs" style={{ color: "var(--text-faint)" }}>No messages yet.</p>}
              {chatMessages.map((msg) => (
                <div key={msg.id} className="liquid-glass text-xs rounded-xl p-3" style={{ color: "var(--text-secondary)" }}>
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>{msg.sender_name} ({msg.sender_role})</span>: {msg.message}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendReply} className="flex gap-2">
              <input type="text" value={newReply} onChange={(e) => setNewReply(e.target.value)} placeholder="Reply with an ETA update..."
                className="flex-1 bg-transparent border rounded-full px-4 py-2.5 text-sm outline-none" style={{ borderColor: "var(--text-faint)", color: "var(--text-primary)" }} />
              <button type="submit" className="liquid-glass-strong px-4 py-2.5 rounded-full text-sm hover:scale-105 transition-transform" style={{ color: "var(--text-primary)" }}>Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;