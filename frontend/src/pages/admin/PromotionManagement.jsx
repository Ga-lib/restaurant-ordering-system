import { useEffect, useState } from "react";
import { listPromotions, createPromotion, updatePromotion, deletePromotion } from "../../services/promotionService";
import { useToast } from "../../context/ToastContext";

function PromoForm({ onSubmit, onCancel }) {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputStyle = { borderColor: "var(--text-faint)", color: "var(--text-primary)" };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit({ code, discount_type: discountType, discount_value: Number(discountValue), min_order_amount: Number(minOrderAmount) });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="liquid-glass-strong rounded-3xl p-6 flex flex-col gap-4 max-w-sm">
      <h2 className="text-lg" style={{ fontWeight: 500, color: "var(--text-primary)" }}>New Promo Code</h2>
      {error && <div className="liquid-glass rounded-xl p-3 text-red-400 text-sm">{error}</div>}
      <div>
        <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Code</label>
        <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required
          className="w-full bg-transparent border rounded-full px-4 py-2.5 uppercase outline-none" style={inputStyle} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Type</label>
          <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}
            className="w-full border rounded-full px-4 py-2.5 outline-none" style={{ ...inputStyle, backgroundColor: "var(--bg-app)" }}>
            <option value="percent">Percent %</option>
            <option value="fixed">Fixed Tk</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Value</label>
          <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} required
            className="w-full bg-transparent border rounded-full px-4 py-2.5 outline-none" style={inputStyle} />
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Minimum order (Tk)</label>
        <input type="number" value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)}
          className="w-full bg-transparent border rounded-full px-4 py-2.5 outline-none" style={inputStyle} />
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="liquid-glass-strong px-5 py-2.5 rounded-full font-medium disabled:opacity-50 hover:scale-105 transition-transform" style={{ color: "var(--text-primary)" }}>
          {saving ? "Saving..." : "Create"}
        </button>
        <button type="button" onClick={onCancel}
          className="liquid-glass px-5 py-2.5 rounded-full font-medium hover:scale-105 transition-transform" style={{ color: "var(--text-muted)" }}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function PromotionManagement() {
  const { showToast } = useToast();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function loadPromos() {
    setLoading(true);
    listPromotions().then(setPromos).finally(() => setLoading(false));
  }

  useEffect(() => {
    loadPromos();
  }, []);

  async function handleCreate(data) {
    await createPromotion(data);
    setShowForm(false);
    loadPromos();
    showToast("Promo code created");
  }

  async function handleToggleActive(promo) {
    await updatePromotion(promo.id, { is_active: !promo.is_active });
    loadPromos();
    showToast("Promo status updated");
  }

  async function handleDelete(promo) {
    if (!confirm(`Delete promo code ${promo.code}?`)) return;
    await deletePromotion(promo.id);
    loadPromos();
    showToast("Promo code deleted");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl" style={{ fontWeight: 500, color: "var(--text-primary)" }}>Promotions</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="liquid-glass-strong px-5 py-2.5 rounded-full font-medium hover:scale-105 transition-transform" style={{ color: "var(--text-primary)" }}>
            + New Code
          </button>
        )}
      </div>

      {showForm && <div className="mb-8"><PromoForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} /></div>}

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      ) : (
        <div className="liquid-glass rounded-2xl divide-y" style={{ borderColor: "var(--glass-border-soft)" }}>
          {promos.map((promo) => (
            <div key={promo.id} className="p-4 flex items-center justify-between" style={{ borderColor: "var(--glass-border-soft)" }}>
              <div>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>{promo.code}</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {promo.discount_type === "percent" ? `${promo.discount_value}% off` : `৳${promo.discount_value} off`}
                  {promo.min_order_amount > 0 && ` · min ৳${promo.min_order_amount}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: promo.is_active ? "#22c55e" : "var(--text-faint)" }}>
                  {promo.is_active ? "Active" : "Inactive"}
                </span>
                <button onClick={() => handleToggleActive(promo)} className="text-xs underline" style={{ color: "var(--text-muted)" }}>
                  {promo.is_active ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => handleDelete(promo)} className="text-xs text-red-400 hover:text-red-300 underline">Delete</button>
              </div>
            </div>
          ))}
          {promos.length === 0 && <p className="p-4 text-sm" style={{ color: "var(--text-muted)" }}>No promo codes yet.</p>}
        </div>
      )}
    </div>
  );
}

export default PromotionManagement;