import apiFetch from "./api";

export function listUsers() {
  return apiFetch("/users/");
}

export function updateUser(userId, data) {
  return apiFetch(`/users/${userId}/update/`, { method: "PUT", body: data });
}