import apiFetch from "./api";

export function generateAiReport() {
  return apiFetch("/ai-reports/generate/");
}