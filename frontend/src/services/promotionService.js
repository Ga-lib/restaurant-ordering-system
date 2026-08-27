import apiFetch from "./api";

export function validatePromoCode(code, orderTotal) {
  return apiFetch("/promotions/validate/", {
    method: "POST",
    body: { code, order_total: orderTotal },
    requireAuth: false,
  });
}

export function listPromotions() {
  return apiFetch("/promotions/");
}

export function createPromotion(promoData) {
  return apiFetch("/promotions/create/", { method: "POST", body: promoData });
}

export function updatePromotion(promoId, promoData) {
  return apiFetch(`/promotions/${promoId}/update/`, { method: "PUT", body: promoData });
}

export function deletePromotion(promoId) {
  return apiFetch(`/promotions/${promoId}/delete/`, { method: "DELETE" });
}