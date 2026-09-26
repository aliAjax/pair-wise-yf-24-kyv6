import { mockData } from "../mocks/seedData";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { PolicySection } from "../types/PolicySection";

const STORAGE_KEY = "policy-diff.workspace.policy-sections";

const readRows = (): PolicySection[] => {
  if (typeof localStorage !== "undefined") {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached) as PolicySection[];
      } catch {
        // 本地缓存损坏时回退到种子数据
      }
    }
  }
  return [...(mockData.policySection as unknown as PolicySection[])];
};

const writeRows = (rows: PolicySection[]) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }
};

export async function listPolicySection(): Promise<PolicySection[]> {
  return readRows();
}

export async function savePolicySection(payload: PolicySection) {
  const rows = readRows();
  const next = rows.some((row) => row.id === payload.id)
    ? rows.map((row) => (row.id === payload.id ? payload : row))
    : [...rows, payload];
  writeRows(next);
  console.info(LOG_TEMPLATES.PolicySection[1], payload);
  return payload;
}
