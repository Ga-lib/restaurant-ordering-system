import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrder } from "../../services/orderService";
import { createReview } from "../../services/reviewService";
import { formatTk } from "../../utils/formatCurrency";
import { listOrderMessages, sendOrderMessage } from "../../services/orderService";
import Navbar from "../../components/common/Navbar";
import { useToast } from "../../context/ToastContext";
import PageBackground from "../../components/common/PageBackground";

function ReviewForm({ item, orderId, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createReview({ menu_item_id: item.menu_item_id, order_id: orderId, rating, comment });
      onSubmitted(item.menu_item_id);
      showToast("Review submitted, thank you!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="liquid-glass rounded-2xl p-4 mt-2">
      <p className="text-base mb-2" style={{ color: "var(--text-primary)" }}>Rate {item.name}</p>
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => setRating(n)}
            style={{ color: n <= rating ? "var(--text-primary)" : "var(--text-faint)" }}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional comment..."
        rows={2}
        className="w-full bg-transparent border rounded-xl px-3 py-2 text-sm mb-2 outline-none"
        style={{ borderColor: "var(--text-faint)", color: "var(--text-primary)" }}
      />
      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="liquid-glass-strong text-sm px-4 py-2 rounded-full font-medium disabled:opacity-50 hover:scale-105 transition-transform"
        style={{ color: "var(--text-primary)" }}
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

function OrderChat({ orderId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();

  function loadMessages() {
    listOrderMessages(orderId).then(setMessages).catch(() => {});
  }

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  async function handleSend(e) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await sendOrderMessage(orderId, newMessage);
      setNewMessage("");
      loadMessages();
      showToast("Message sent");
    } catch (err) {
      alert("Failed to send: " + err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--text-faint)" }}>
      <p className="text-base mb-3" style={{ color: "var(--text-muted)" }}>Questions about your order?</p>

      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto mb-3">
        {messages.length === 0 && <p className="text-sm" style={{ color: "var(--text-faint)" }}>No messages yet.</p>}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`liquid-glass text-sm rounded-xl p-3 max-w-[80%] ${msg.sender_role === "customer" ? "self-end" : "self-start"}`}
            style={{ color: msg.sender_role === "customer" ? "var(--text-primary)" : "var(--text-secondary)" }}
          >
            <p className="font-medium mb-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
              {msg.sender_role === "customer" ? "You" : msg.sender_name}
            </p>
            {msg.message}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="e.g. Is my order still on the way?"
          className="flex-1 bg-transparent border rounded-full px-4 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--text-faint)", color: "var(--text-primary)" }}
        />
        <button
          type="submit"
          disabled={sending}
          className="liquid-glass-strong px-4 py-2.5 rounded-full text-sm font-medium disabled:opacity-50 hover:scale-105 transition-transform"
          style={{ color: "var(--text-primary)" }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [reviewedItems, setReviewedItems] = useState([]);
  const [reviewingItemId, setReviewingItemId] = useState(null);

  useEffect(() => {
    getOrder(orderId).then(setOrder).catch((err) => setError(err.message));
  }, [orderId]);

  function handleReviewSubmitted(menuItemId) {
    setReviewedItems((prev) => [...prev, menuItemId]);
    setReviewingItemId(null);
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--bg-app)" }}>
        <div className="p-4 lg:p-6">
          <div className="liquid-glass-strong rounded-3xl"><Navbar /></div>
        </div>
        <div className="relative z-10 flex items-center justify-center py-32">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--bg-app)" }}>
        <div className="p-4 lg:p-6">
          <div className="liquid-glass-strong rounded-3xl"><Navbar /></div>
        </div>
        <div className="flex items-center justify-center py-32">
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>Loading order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "var(--bg-app)" }}>
      <PageBackground type="image" src="/images/order-tracking-bg.jpg" />
      <div className="relative z-20 p-4 lg:p-6">
        <div className="liquid-glass-strong rounded-3xl"><Navbar /></div>
      </div>

      <div className="relative z-10 px-6 py-10 flex flex-col items-center">
        <h1 className="text-4xl mb-8" style={{ fontWeight: 500, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
          Order{" "}
          <span className="font-accent" style={{ color: "var(--text-secondary)" }}>
            {order.status === "completed" ? "Completed" : "Confirmed"}
          </span>
        </h1>

        <div className="liquid-glass-strong rounded-3xl p-8 max-w-md w-full">
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Order ID: {order.id}</p>

          {order.items.map((item, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between text-base" style={{ color: "var(--text-primary)" }}>
                <span>{item.name} × {item.quantity}</span>
                <span>{formatTk(item.subtotal)}</span>
              </div>

              {order.status === "completed" &&
                (reviewedItems.includes(item.menu_item_id) ? (
                  <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>✓ Review submitted, thank you!</p>
                ) : reviewingItemId === item.menu_item_id ? (
                  <ReviewForm item={item} orderId={order.id} onSubmitted={handleReviewSubmitted} />
                ) : (
                  <button
                    onClick={() => setReviewingItemId(item.menu_item_id)}
                    className="text-sm underline mt-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Leave a review
                  </button>
                ))}
            </div>
          ))}

          <div className="border-t mt-4 pt-4 flex justify-between text-lg" style={{ borderColor: "var(--text-faint)", color: "var(--text-primary)" }}>
            <span>Total</span>
            <span className="font-accent">{formatTk(order.final_amount || order.total_amount)}</span>
          </div>

          <p className="mt-6 text-base" style={{ color: "var(--text-muted)" }}>
            Status: <span style={{ color: "var(--text-primary)" }}>{order.status}</span>
          </p>
          <p className="text-base" style={{ color: "var(--text-muted)" }}>
            Payment: <span style={{ color: "var(--text-primary)" }}>{order.payment_status}</span>
          </p>

          <OrderChat orderId={order.id} />
        </div>
      </div>
    </div>
  );
}

export default OrderTracking;