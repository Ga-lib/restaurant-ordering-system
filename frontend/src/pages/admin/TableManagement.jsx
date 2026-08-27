import { useEffect, useState } from "react";
import { getTables, createTable, updateTable, deleteTable } from "../../services/tableService";
import TableForm from "../../components/admin/TableForm";
import { useToast } from "../../context/ToastContext";

const STATUS_COLOR = { available: "#22c55e", held: "#f59e0b", reserved: "#ef4444" };

function TableManagement() {
  const { showToast } = useToast();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  function loadTables() {
    setLoading(true);
    getTables().then(setTables).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTables();
  }, []);

  async function handleCreate(payload) {
    await createTable(payload);
    setShowForm(false);
    loadTables();
    showToast("Table added");
  }

  async function handleUpdate(payload) {
    await updateTable(editingTable.id, payload);
    setEditingTable(null);
    loadTables();
    showToast("Table updated");
  }

  async function handleDelete(table) {
    if (!confirm(`Delete Table ${table.table_number}? This cannot be undone.`)) return;
    try {
      await deleteTable(table.id);
      loadTables();
      showToast("Table deleted");
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  }

  async function handleForceAvailable(table) {
    if (!confirm(`Force Table ${table.table_number} back to available?`)) return;
    try {
      await updateTable(table.id, { status: "available", reserved_by: null, hold_expires_at: null });
      loadTables();
      showToast("Table freed up");
    } catch (err) {
      alert("Failed: " + err.message);
    }
  }

  const isFormOpen = showForm || editingTable !== null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl" style={{ fontWeight: 500, color: "var(--text-primary)" }}>Table Management</h1>
        {!isFormOpen && (
          <button onClick={() => setShowForm(true)}
            className="liquid-glass-strong px-5 py-2.5 rounded-full font-medium hover:scale-105 transition-transform"
            style={{ color: "var(--text-primary)" }}>
            + Add Table
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="mb-8">
          <TableForm
            initialData={editingTable}
            onSubmit={editingTable ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditingTable(null); }}
          />
        </div>
      )}

      {loading && <p style={{ color: "var(--text-muted)" }}>Loading tables...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => (
            <div key={table.id} className="liquid-glass rounded-2xl p-5">
              <p className="font-medium text-lg" style={{ color: "var(--text-primary)" }}>Table {table.table_number}</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{table.seat_capacity} seats</p>
              <p className="text-xs uppercase mt-1 font-medium" style={{ color: STATUS_COLOR[table.status] || "var(--text-muted)" }}>
                {table.status}
              </p>
              {table.needs_cleaning && <p className="text-xs mt-1" style={{ color: "#f59e0b" }}>⚠ Needs cleaning</p>}

              <div className="flex flex-col gap-1 mt-3">
                <button onClick={() => setEditingTable(table)} className="text-xs underline text-left" style={{ color: "var(--text-muted)" }}>Edit</button>
                <button onClick={() => handleDelete(table)} className="text-xs underline text-left text-red-400 hover:text-red-300">Delete</button>
                {table.status !== "available" && (
                  <button onClick={() => handleForceAvailable(table)} className="text-xs underline text-left" style={{ color: "var(--text-muted)" }}>
                    Force Available
                  </button>
                )}
              </div>
            </div>
          ))}
          {tables.length === 0 && <p style={{ color: "var(--text-muted)" }} className="col-span-4">No tables yet. Click "Add Table" to create your floor plan.</p>}
        </div>
      )}
    </div>
  );
}

export default TableManagement;