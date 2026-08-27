import { useState } from "react";

function TableForm({ initialData, onSubmit, onCancel }) {
  const [tableNumber, setTableNumber] = useState(initialData?.table_number || "");
  const [seatCapacity, setSeatCapacity] = useState(initialData?.seat_capacity || 4);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const inputStyle = { borderColor: "var(--text-faint)", color: "var(--text-primary)" };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit({ table_number: Number(tableNumber), seat_capacity: Number(seatCapacity) });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="liquid-glass-strong rounded-3xl p-6 flex flex-col gap-4 max-w-sm">
      <h2 className="text-lg" style={{ fontWeight: 500, color: "var(--text-primary)" }}>
        {initialData ? "Edit Table" : "Add New Table"}
      </h2>
      {error && <div className="liquid-glass rounded-xl p-3 text-red-400 text-sm">{error}</div>}
      <div>
        <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Table Number</label>
        <input type="number" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} required min="1"
          className="w-full bg-transparent border rounded-full px-4 py-2.5 outline-none" style={inputStyle} />
      </div>
      <div>
        <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Seat Capacity</label>
        <input type="number" value={seatCapacity} onChange={(e) => setSeatCapacity(e.target.value)} required min="1"
          className="w-full bg-transparent border rounded-full px-4 py-2.5 outline-none" style={inputStyle} />
      </div>
      <div className="flex gap-3 mt-2">
        <button type="submit" disabled={saving}
          className="liquid-glass-strong px-5 py-2.5 rounded-full font-medium disabled:opacity-50 hover:scale-105 transition-transform"
          style={{ color: "var(--text-primary)" }}>
          {saving ? "Saving..." : initialData ? "Save Changes" : "Add Table"}
        </button>
        <button type="button" onClick={onCancel}
          className="liquid-glass px-5 py-2.5 rounded-full font-medium hover:scale-105 transition-transform"
          style={{ color: "var(--text-muted)" }}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default TableForm;