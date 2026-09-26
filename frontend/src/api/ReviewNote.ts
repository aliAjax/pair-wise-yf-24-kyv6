import { mockData } from "../mocks/seedData";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { ReviewNote } from "../types/ReviewNote";

const STORAGE_KEY = "policy-diff.workspace.review-notes";

const readRows = (): ReviewNote[] => {
  if (typeof localStorage !== "undefined") {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached) as ReviewNote[];
      } catch {
        // 本地缓存损坏时回退到种子数据
      }
    }
  }
  return [...(mockData.reviewNote as unknown as ReviewNote[])];
};

const writeRows = (rows: ReviewNote[]) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }
};

export async function listReviewNote(): Promise<ReviewNote[]> {
  return readRows();
}

export async function saveReviewNote(payload: ReviewNote) {
  const rows = readRows();
  const next = rows.some((row) => row.id === payload.id)
    ? rows.map((row) => (row.id === payload.id ? payload : row))
    : [...rows, payload];
  writeRows(next);
  console.info(LOG_TEMPLATES.ReviewNote[1], payload);
  return payload;
}
