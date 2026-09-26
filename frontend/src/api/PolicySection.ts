import { mockData } from "../mocks/seedData";
import type { PolicySection } from "../types/PolicySection";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { readRows, upsertRow } from "../utils/storage";

const endpoint = "/api/policy-section";
const STORAGE_KEY = "policySection";

export async function listPolicySection(): Promise<PolicySection[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return readRows<PolicySection>(STORAGE_KEY, mockData.policySection as unknown as PolicySection[]);
}

export async function savePolicySection(payload: PolicySection) {
  const { created } = upsertRow(STORAGE_KEY, mockData.policySection as unknown as PolicySection[], payload);
  console.info(created ? LOG_TEMPLATES.PolicySection[0] : LOG_TEMPLATES.PolicySection[2], payload);
  return payload;
}
