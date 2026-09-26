import type { DiffResult } from "../types/DiffResult";
import type { PolicyDocument } from "../types/PolicyDocument";
import type { PolicySection } from "../types/PolicySection";
import type { ReviewNote } from "../types/ReviewNote";
import type { ReviewReport, ReviewReportItem } from "../types/ReviewReport";
import { PENDING_REVIEW_STATUS } from "../constants/ReviewReport";

export const createDefaultReviewReport = (overrides: Partial<ReviewReport> = {}): ReviewReport => ({
  id: 1,
  report_no: "RPT-20260611-001",
  title: "隐私政策审阅报告",
  document_id: 1,
  policy_version_label: "version label 1",
  exported_by: "reviewer 1",
  exported_at: "2026-06-11T09:00:00Z",
  frozen: true,
  completed_items: [],
  pending_items: [],
  completed_count: 0,
  pending_count: 0,
  ...overrides
});

export interface BuildReviewReportSnapshotInput {
  document: PolicyDocument;
  sections: PolicySection[];
  diffs: DiffResult[];
  notes: ReviewNote[];
  reviewer: string;
  sequence: number;
  exportedAt?: string;
}

const pad = (value: number, length: number) => String(value).padStart(length, "0");

export const buildReviewReportSnapshot = (input: BuildReviewReportSnapshotInput): ReviewReport => {
  const exportedAt = input.exportedAt ?? new Date().toISOString();
  const reportNo = `RPT-${exportedAt.slice(0, 10).replace(/-/g, "")}-${pad(input.sequence, 3)}`;
  // 逐条深拷贝导出时刻的政策版本、风险等级、备注与状态；
  // 之后工作区里的修改不会回流到这份快照
  const items: ReviewReportItem[] = input.notes.map((note) => {
    const diff = input.diffs.find((row) => row.id === note.diff_result_id);
    const section = input.sections.find((row) => row.id === diff?.section_id);
    return {
      note_id: note.id,
      diff_result_id: note.diff_result_id,
      section_id: section?.id ?? 0,
      section_no: section?.section_no ?? "",
      heading: section?.heading ?? "",
      diff_type: diff?.diff_type ?? "",
      risk_level: section?.risk_level ?? "",
      tag: note.tag,
      comment: note.comment,
      reviewer: note.reviewer,
      status: note.status
    };
  });
  // 待处理项不计入通过，单独放入未完成区
  const pendingItems = items.filter((item) => PENDING_REVIEW_STATUS.includes(item.status as never));
  const completedItems = items.filter((item) => !PENDING_REVIEW_STATUS.includes(item.status as never));
  return createDefaultReviewReport({
    id: input.sequence,
    report_no: reportNo,
    title: `隐私政策审阅报告 ${reportNo}`,
    document_id: input.document.id,
    policy_version_label: input.document.version_label,
    exported_by: input.reviewer,
    exported_at: exportedAt,
    completed_items: completedItems,
    pending_items: pendingItems,
    completed_count: completedItems.length,
    pending_count: pendingItems.length
  });
};

export const createReviewReportForm = createDefaultReviewReport;
export const createReviewReportResponse = createDefaultReviewReport;
