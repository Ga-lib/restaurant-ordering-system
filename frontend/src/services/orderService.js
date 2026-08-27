import apiFetch from "./api";

export function createOrder(orderData) {
  return apiFetch("/orders/create/", {
    method: "POST",
    body: orderData,
    requireAuth: false,
  });
}

export function getOrder(orderId) {
  return apiFetch(`/orders/${orderId}/`, { requireAuth: false });
}

export function listOrders(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiFetch(`/orders/${params ? `?${params}` : ""}`);
}

export function updateOrderStatus(orderId, statusUpdate) {
  return apiFetch(`/orders/${orderId}/status/`, {
    method: "PUT",
    body: statusUpdate,
  });
}

export function updatePayment(orderId, paymentData) {
  return apiFetch(`/orders/${orderId}/payment/`, {
    method: "PUT",
    body: paymentData,
  });
}

export function cancelOrder(orderId) {
  return apiFetch(`/orders/${orderId}/cancel/`, { method: "POST" });
}

export function getOrderStats() {
  return apiFetch("/orders/stats/");
}

export function listOrderMessages(orderId) {
  return apiFetch(`/orders/${orderId}/messages/`);
}

export function sendOrderMessage(orderId, message) {
  return apiFetch(`/orders/${orderId}/messages/send/`, {
    method: "POST",
    body: { message },
  });
}

export function getMyOrders() {
  return apiFetch("/orders/my-orders/");
}