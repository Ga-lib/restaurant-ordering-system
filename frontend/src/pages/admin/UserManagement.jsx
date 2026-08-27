import { useEffect, useState } from "react";
import { listUsers, updateUser } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const ROLES = ["customer", "admin", "kitchen", "waiter", "rider"];

const ROLE_COLOR = {
  admin: "#a78bfa",
  kitchen: "#f59e0b",
  waiter: "#60a5fa",
  rider: "#2dd4bf",
  customer: "var(--text-muted)",
};

function UserManagement() {
  const { profile: myProfile } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  function loadUsers() {
    setLoading(true);
    listUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleRoleChange(user, newRole) {
    if (newRole === user.role) return;
    if (!confirm(`Change ${user.name}'s role from "${user.role}" to "${newRole}"?`)) return;

    setBusyId(user.id);
    try {
      await updateUser(user.id, { role: newRole });
      loadUsers();
      showToast(`Role updated to ${newRole}`);
    } catch (err) {
      alert("Failed to update role: " + err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleActive(user) {
    const action = user.is_active ? "suspend" : "reactivate";
    if (!confirm(`Are you sure you want to ${action} ${user.name}'s account?`)) return;

    setBusyId(user.id);
    try {
      await updateUser(user.id, { is_active: !user.is_active });
      loadUsers();
      showToast(user.is_active ? "Account suspended" : "Account reactivated");
    } catch (err) {
      alert("Failed to update account: " + err.message);
    } finally {
      setBusyId(null);
    }
  }

  const inputStyle = { color: "var(--text-primary)", backgroundColor: "var(--bg-app)" };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl" style={{ fontWeight: 500, color: "var(--text-primary)" }}>
          User Management
        </h1>
        <button onClick={loadUsers} className="text-sm underline" style={{ color: "var(--text-muted)" }}>
          Refresh
        </button>
      </div>

      {loading && <p style={{ color: "var(--text-muted)" }}>Loading users...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && !error && (
        <div className="liquid-glass rounded-2xl overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead style={{ color: "var(--text-muted)" }}>
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.firebase_uid === myProfile?.firebase_uid;
                return (
                  <tr key={user.id} className="border-t" style={{ borderColor: "var(--glass-border-soft)" }}>
                    <td className="p-4 font-medium" style={{ color: "var(--text-primary)" }}>
                      {user.name} {isSelf && <span style={{ color: "var(--text-faint)" }}>(you)</span>}
                    </td>
                    <td className="p-4" style={{ color: "var(--text-secondary)" }}>{user.email}</td>
                    <td className="p-4" style={{ color: "var(--text-muted)" }}>{user.phone || "—"}</td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        disabled={isSelf || busyId === user.id}
                        onChange={(e) => handleRoleChange(user, e.target.value)}
                        className="liquid-glass rounded-full px-3 py-1.5 text-sm outline-none disabled:opacity-50"
                        style={{ ...inputStyle, color: ROLE_COLOR[user.role] }}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <span className="text-xs" style={{ color: user.is_active ? "#22c55e" : "#ef4444" }}>
                        {user.is_active ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(user)}
                        disabled={isSelf || busyId === user.id}
                        className="text-xs underline disabled:opacity-50"
                        style={{ color: user.is_active ? "#ef4444" : "#22c55e" }}
                      >
                        {busyId === user.id ? "..." : user.is_active ? "Suspend" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center" style={{ color: "var(--text-muted)" }}>
                    No users found.
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

export default UserManagement;