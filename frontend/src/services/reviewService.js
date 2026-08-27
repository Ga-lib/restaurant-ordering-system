import apiFetch from "./api";

export function getReviewsForItem(menuItemId) {
  return apiFetch(`/reviews/menu-item/${menuItemId}/`, { requireAuth: false });
}

export function createReview(reviewData) {
  return apiFetch("/reviews/create/", { method: "POST", body: reviewData });
}