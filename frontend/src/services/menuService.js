import apiFetch from "./api";

export function getMenuItems() {
  return apiFetch("/menu/", { requireAuth: false });
}

export function createMenuItem(itemData) {
  return apiFetch("/menu/create/", { method: "POST", body: itemData });
}

export function updateMenuItem(itemId, itemData) {
  return apiFetch(`/menu/${itemId}/update/`, { method: "PUT", body: itemData });
}

export function deleteMenuItem(itemId) {
  return apiFetch(`/menu/${itemId}/delete/`, { method: "DELETE" });
}

export async function uploadMenuImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const result = await apiFetch("/menu/upload-image/", {
    method: "POST",
    body: formData,
    isFormData: true,
  });
  return result.image_url;
}


export function getWeatherRecommendations() {
  return apiFetch("/menu/weather-recommendations/", { requireAuth: false });
}