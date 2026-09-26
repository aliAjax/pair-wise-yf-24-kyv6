import { mockData } from "../mocks/seedData";
import type { ReviewNote } from "../types/ReviewNote";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { readRows, upsertRow } from "../utils/storage";

const endpoint = "/api/review-note";
const STORAGE_KEY = "reviewNote";

export async function listReviewNote(): Promise<ReviewNote[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return readRows<ReviewNote>(STORAGE_KEY, mockData.reviewNote as unknown as ReviewNote[]);
}

export async function saveReviewNote(payload: ReviewNote) {
  const { created } = upsertRow(STORAGE_KEY, mockData.reviewNote as unknown as ReviewNote[], payload);
  console.info(created ? LOG_TEMPLATES.ReviewNote[0] : LOG_TEMPLATES.ReviewNote[1], payload);
  return payload;
}
