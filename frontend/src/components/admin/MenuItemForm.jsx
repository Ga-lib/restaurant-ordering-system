import { useState } from "react";
import { uploadMenuImage } from "../../services/menuService";

const CATEGORIES = ["Main Course", "Starter", "Dessert", "Drinks", "Sides"];

function MenuItemForm({ initialData, onSubmit, onCancel }) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price || "");
  const [category, setCategory] = useState(initialData?.category || CATEGORIES[0]);
  const [ingredientsText, setIngredientsText] = useState((initialData?.ingredients || []).join(", "));
  const [isAvailable, setIsAvailable] = useState(initialData?.is_available ?? true);
  const [weatherTags, setWeatherTags] = useState(initialData?.weather_tags || []);
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadMenuImage(file);
      setImageUrl(url);
    } catch (err) {
      setError("Image upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      name,
      description,
      price: Number(price),
      category,
      ingredients: ingredientsText.split(",").map((i) => i.trim()).filter(Boolean),
      is_available: isAvailable,
      image_url: imageUrl,
      weather_tags: weatherTags,
    };
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = { borderColor: "var(--text-faint)", color: "var(--text-primary)" };

  return (
    <form onSubmit={handleSubmit} className="liquid-glass-strong rounded-3xl p-6 flex flex-col gap-4">
      <h2 className="text-xl" style={{ fontWeight: 500, color: "var(--text-primary)" }}>
        {initialData ? "Edit Menu Item" : "Add New Menu Item"}
      </h2>

      {error && <div className="liquid-glass rounded-xl p-3 text-red-400 text-sm">{error}</div>}

      <div>
        <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
          className="w-full bg-transparent border rounded-full px-4 py-2.5 outline-none" style={inputStyle} />
      </div>

      <div>
        <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
          className="w-full bg-transparent border rounded-2xl px-4 py-2.5 outline-none" style={inputStyle} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Price (৳ Tk)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0"
            className="w-full bg-transparent border rounded-full px-4 py-2.5 outline-none" style={inputStyle} />
        </div>
        <div>
          <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-full px-4 py-2.5 outline-none"
            style={{ ...inputStyle, backgroundColor: "var(--bg-app)" }}>
            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Ingredients (comma-separated)</label>
        <input type="text" value={ingredientsText} onChange={(e) => setIngredientsText(e.target.value)}
          placeholder="e.g. chicken, cream, garlic"
          className="w-full bg-transparent border rounded-full px-4 py-2.5 outline-none" style={inputStyle} />
      </div>

      <div>
        <label className="block text-sm mb-2" style={{ color: "var(--text-muted)" }}>Recommend this dish when weather is:</label>
        <div className="flex flex-wrap gap-2">
          {["sunny", "cloudy", "rainy", "stormy", "snowy", "cold", "hot"].map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => setWeatherTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])}
              className="px-4 py-1.5 rounded-full text-xs capitalize transition-transform hover:scale-105 liquid-glass"
              style={{ color: weatherTags.includes(tag) ? "var(--text-primary)" : "var(--text-muted)" }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Image</label>
        <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm" style={{ color: "var(--text-secondary)" }} />
        {uploading && <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Uploading...</p>}
        {imageUrl && !uploading && <img src={imageUrl} alt="Preview" className="mt-2 h-24 rounded-xl object-cover" />}
      </div>

      <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
        <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
        Available to customers
      </label>

      <div className="flex gap-3 mt-2">
        <button type="submit" disabled={saving || uploading}
          className="liquid-glass-strong px-5 py-2.5 rounded-full font-medium disabled:opacity-50 hover:scale-105 transition-transform"
          style={{ color: "var(--text-primary)" }}>
          {saving ? "Saving..." : initialData ? "Save Changes" : "Add Item"}
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

export default MenuItemForm;