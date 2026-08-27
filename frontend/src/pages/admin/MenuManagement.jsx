import { useEffect, useState } from "react";
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from "../../services/menuService";
import MenuItemForm from "../../components/admin/MenuItemForm";
import { formatTk } from "../../utils/formatCurrency";
import { useToast } from "../../context/ToastContext";

function MenuManagement() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  function loadItems() {
    setLoading(true);
    getMenuItems().then(setItems).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleCreate(payload) {
    await createMenuItem(payload);
    setShowForm(false);
    loadItems();
    showToast("Menu item added");
  }

  async function handleUpdate(payload) {
    await updateMenuItem(editingItem.id, payload);
    setEditingItem(null);
    loadItems();
    showToast("Menu item updated");
  }

  async function handleDelete(item) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await deleteMenuItem(item.id);
      loadItems();
      showToast("Menu item deleted");
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  }

  const isFormOpen = showForm || editingItem !== null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl" style={{ fontWeight: 500, color: "var(--text-primary)" }}>Menu Management</h1>
        {!isFormOpen && (
          <button
            onClick={() => setShowForm(true)}
            className="liquid-glass-strong px-5 py-2.5 rounded-full font-medium hover:scale-105 transition-transform"
            style={{ color: "var(--text-primary)" }}
          >
            + Add Item
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="mb-8">
          <MenuItemForm
            initialData={editingItem}
            onSubmit={editingItem ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditingItem(null); }}
          />
        </div>
      )}

      {loading && <p style={{ color: "var(--text-muted)" }}>Loading menu items...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && !error && (
        <div className="liquid-glass rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-sm" style={{ color: "var(--text-muted)" }}>
              <tr>
                <th className="p-4">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t" style={{ borderColor: "var(--glass-border-soft)" }}>
                  <td className="p-4">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-14 h-14 object-cover rounded-xl" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xs liquid-glass" style={{ color: "var(--text-faint)" }}>
                        No image
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium" style={{ color: "var(--text-primary)" }}>{item.name}</td>
                  <td className="p-4" style={{ color: "var(--text-muted)" }}>{item.category}</td>
                  <td className="p-4" style={{ color: "var(--text-secondary)" }}>{formatTk(item.price)}</td>
                  <td className="p-4">
                    <span
                      className="text-xs px-3 py-1 rounded-full liquid-glass"
                      style={{ color: item.is_available ? "#22c55e" : "var(--text-faint)" }}
                    >
                      {item.is_available ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => setEditingItem(item)} className="text-sm mr-4 underline" style={{ color: "var(--text-muted)" }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item)} className="text-sm underline text-red-400 hover:text-red-300">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center" style={{ color: "var(--text-muted)" }}>
                    No menu items yet. Click "Add Item" to create your first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MenuManagement;