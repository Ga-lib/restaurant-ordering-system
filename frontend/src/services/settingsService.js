import apiFetch from "./api";

export function getSettings() {
  return apiFetch("/settings/", { requireAuth: false });
}

export function updateSettings(settingsData) {
  return apiFetch("/settings/update/", { method: "PUT", body: settingsData });
}