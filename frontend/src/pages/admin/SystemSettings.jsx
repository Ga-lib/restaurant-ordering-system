import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../../services/settingsService";
import { useToast } from "../../context/ToastContext";
import MapEmbed from "../../components/common/MapEmbed";

function SystemSettings() {
  const { showToast } = useToast();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const inputStyle = { borderColor: "var(--text-faint)", color: "var(--text-primary)" };

  useEffect(() => {
    getSettings().then(setForm);
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSavedMessage("");
    setSaving(true);
    try {
      const updated = await updateSettings(form);
      setForm(updated);
      setSavedMessage("Settings saved.");
      showToast("Settings saved");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <p style={{ color: "var(--text-muted)" }}>Loading settings...</p>;

  return (
    <div>
      <h1 className="text-3xl mb-8" style={{ fontWeight: 500, color: "var(--text-primary)" }}>System Settings</h1>

      <form onSubmit={handleSubmit} className="liquid-glass-strong rounded-3xl p-6 flex flex-col gap-4 max-w-lg">
        {error && <div className="liquid-glass rounded-xl p-3 text-red-400 text-sm">{error}</div>}
        {savedMessage && <div className="liquid-glass rounded-xl p-3 text-sm" style={{ color: "#22c55e" }}>{savedMessage}</div>}

        <div>
          <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Restaurant Name</label>
          <input type="text" value={form.restaurant_name} onChange={(e) => updateField("restaurant_name", e.target.value)} required
            className="w-full bg-transparent border rounded-full px-4 py-2.5 outline-none" style={inputStyle} />
        </div>
        <div>
          <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Address</label>
          <input type="text" value={form.address || ""} onChange={(e) => updateField("address", e.target.value)}
            className="w-full bg-transparent border rounded-full px-4 py-2.5 outline-none" style={inputStyle} />
        </div>
        <div>
          <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Phone</label>
          <input type="text" value={form.phone || ""} onChange={(e) => updateField("phone", e.target.value)}
            className="w-full bg-transparent border rounded-full px-4 py-2.5 outline-none" style={inputStyle} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Opening Time</label>
            <input type="time" value={form.opening_time} onChange={(e) => updateField("opening_time", e.target.value)}
              className="w-full bg-transparent border rounded-full px-4 py-2.5 outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Closing Time</label>
            <input type="time" value={form.closing_time} onChange={(e) => updateField("closing_time", e.target.value)}
              className="w-full bg-transparent border rounded-full px-4 py-2.5 outline-none" style={inputStyle} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Tax (%)</label>
            <input type="number" value={form.tax_percent} onChange={(e) => updateField("tax_percent", Number(e.target.value))} min="0" max="100"
              className="w-full bg-transparent border rounded-full px-4 py-2.5 outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Service Charge (%)</label>
            <input type="number" value={form.service_charge_percent} onChange={(e) => updateField("service_charge_percent", Number(e.target.value))} min="0" max="100"
              className="w-full bg-transparent border rounded-full px-4 py-2.5 outline-none" style={inputStyle} />
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="liquid-glass-strong py-3 rounded-full font-medium disabled:opacity-50 mt-2 hover:scale-105 transition-transform" style={{ color: "var(--text-primary)" }}>
          {saving ? "Saving..." : "Save Settings"}
                  <div className="pt-2">
          <label className="block text-sm mb-2" style={{ color: "var(--text-muted)" }}>
            Restaurant Location (used for map & sharing)
          </label>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--text-faint)" }}>Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={form.latitude}
                onChange={(e) => updateField("latitude", Number(e.target.value))}
                className="w-full bg-transparent border rounded-full px-4 py-2.5 outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--text-faint)" }}>Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={form.longitude}
                onChange={(e) => updateField("longitude", Number(e.target.value))}
                className="w-full bg-transparent border rounded-full px-4 py-2.5 outline-none"
                style={inputStyle}
              />
            </div>
          </div>
          <p className="text-xs mb-3" style={{ color: "var(--text-faint)" }}>
            Tip: open Google Maps, right-click your restaurant's exact spot, and click the
            coordinates at the top of the menu to copy them — paste the two numbers above.
          </p>
          {form.latitude && form.longitude && (
            <MapEmbed latitude={form.latitude} longitude={form.longitude} height={220} />
          )}
        </div>
        </button>
      </form>
    </div>
    
  );
}

export default SystemSettings;