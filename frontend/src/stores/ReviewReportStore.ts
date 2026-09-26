import { defineStore } from "pinia";
import { listReviewReport, saveReviewReport } from "../api/ReviewReport";
import type { ReviewReport } from "../types/ReviewReport";
export const useReviewReportStore = defineStore("reviewReport", {
  state: () => ({ rows: [] as ReviewReport[], loading: false }),
  actions: {
    async load() { this.loading = true; this.rows = await listReviewReport(); this.loading = false; },
    async exportSnapshot(report: ReviewReport) { await saveReviewReport(report); this.rows = [...this.rows, report]; }
  }
});
