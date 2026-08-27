import { auth } from "../firebase/firebaseConfig";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function apiFetch(endpoint, { method = "GET", body, requireAuth = true, isFormData = false } = {}) {
  const headers = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  // Note: for FormData, we deliberately do NOT set Content-Type —
  // the browser sets it automatically with the correct multipart boundary.

  if (requireAuth && auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export default apiFetch;