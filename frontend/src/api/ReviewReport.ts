import { mockData } from "../mocks/seedData";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { REVIEW_REPORT_STORAGE_KEY } from "../constants/ReviewReport";
import type { ReviewReport } from "../types/ReviewReport";

const readRows = (): ReviewReport[] => {
  if (typeof localStorage !== "undefined") {
    const cached = localStorage.getItem(REVIEW_REPORT_STORAGE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached) as ReviewReport[];
      } catch {
        // 本地缓存损坏时回退到种子数据
      }
    }
  }
  return [...(mockData.reviewReport as unknown as ReviewReport[])];
};

const writeRows = (rows: ReviewReport[]) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(REVIEW_REPORT_STORAGE_KEY, JSON.stringify(rows));
  }
};

export async function listReviewReport(): Promise<ReviewReport[]> {
  return readRows();
}

export async function saveReviewReport(payload: ReviewReport): Promise<ReviewReport> {
  const rows = readRows();
  if (rows.some((row) => row.id === payload.id || row.report_no === payload.report_no)) {
    // 历史快照已冻结，禁止覆盖写入
    console.warn(LOG_TEMPLATES.ReviewReport[3], payload.report_no);
    throw new Error(ERROR_MESSAGES.REPORT_FROZEN);
  }
  writeRows([...rows, payload]);
  console.info(LOG_TEMPLATES.ReviewReport[0], payload.report_no);
  return payload;
}

// 快照只增不改：故意不提供 update/delete，保证旧报告内容不再变化
