import apiFetch from "./api";

export function getTables() {
  return apiFetch("/tables/", { requireAuth: false });
}

export function holdTable(tableId) {
  return apiFetch(`/tables/${tableId}/hold/`, { method: "POST", requireAuth: false });
}

export function confirmReservation(tableId, customerId) {
  return apiFetch(`/tables/${tableId}/confirm/`, {
    method: "POST",
    body: { customer_id: customerId },
    requireAuth: false,
  });
}

export function releaseTable(tableId) {
  return apiFetch(`/tables/${tableId}/release/`, { method: "POST" });
}

export function createTable(tableData) {
  return apiFetch("/tables/create/", { method: "POST", body: tableData });
}

export function updateTable(tableId, tableData) {
  return apiFetch(`/tables/${tableId}/update/`, { method: "PUT", body: tableData });
}

export function deleteTable(tableId) {
  return apiFetch(`/tables/${tableId}/delete/`, { method: "DELETE" });
}