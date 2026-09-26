import { mockData } from "../mocks/seedData";
import type { ReviewReport } from "../types/ReviewReport";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { readRows, writeRows } from "../utils/storage";

const endpoint = "/api/review-report";
const STORAGE_KEY = "reviewReport";

export async function listReviewReport(): Promise<ReviewReport[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return readRows<ReviewReport>(STORAGE_KEY, mockData.reviewReport as unknown as ReviewReport[]);
}

export async function saveReviewReport(payload: ReviewReport) {
  const rows = readRows<ReviewReport>(STORAGE_KEY, mockData.reviewReport as unknown as ReviewReport[]);
  if (rows.some((row) => row.id === payload.id)) {
    // 快照一旦归档即冻结,拒绝覆盖,保证发出去的和归档的始终一致
    throw new Error(ERROR_MESSAGES.REPORT_IMMUTABLE);
  }
  console.info(LOG_TEMPLATES.ReviewReport[0], payload);
  writeRows(STORAGE_KEY, [...rows, payload]);
  return payload;
}
