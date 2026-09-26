import { defineStore } from "pinia";
import { listReviewReport, saveReviewReport } from "../api/ReviewReport";
import type { ReviewReport } from "../types/ReviewReport";
import { buildReviewReportSnapshot } from "../constructors/ReviewReportConstructor";
import { usePolicyDocumentStore } from "./PolicyDocumentStore";
import { usePolicySectionStore } from "./PolicySectionStore";
import { useDiffResultStore } from "./DiffResultStore";
import { useReviewNoteStore } from "./ReviewNoteStore";

export const useReviewReportStore = defineStore("reviewReport", {
  state: () => ({ rows: [] as Awaited<ReturnType<typeof listReviewReport>>, loading: false }),
  actions: {
    async load() { this.loading = true; this.rows = await listReviewReport(); this.loading = false; },
    // 每次导出生成一份独立快照;实时数据之后的改动只进入下一份报告
    async exportReport(): Promise<ReviewReport> {
      const id = this.rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      const report = buildReviewReportSnapshot({
        id,
        title: `审阅报告 #${id}`,
        now: new Date().toISOString(),
        documents: usePolicyDocumentStore().rows,
        sections: usePolicySectionStore().rows,
        diffResults: useDiffResultStore().rows,
        notes: useReviewNoteStore().rows
      });
      await saveReviewReport(report);
      this.rows.push(report);
      return report;
    }
  }
});
