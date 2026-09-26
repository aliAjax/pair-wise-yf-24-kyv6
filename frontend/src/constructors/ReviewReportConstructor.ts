import type { ReviewReport, ReviewReportItem } from "../types/ReviewReport";
import type { PolicyDocument } from "../types/PolicyDocument";
import type { PolicySection } from "../types/PolicySection";
import type { DiffResult } from "../types/DiffResult";
import type { ReviewNote } from "../types/ReviewNote";
import { PENDING_REVIEW_STATUS } from "../constants/ReviewStatus";

export const createDefaultReviewReport = (overrides: Partial<ReviewReport> = {}): ReviewReport => ({
  id: 1 as never,
  title: "审阅报告 #1" as never,
  old_version_label: "version label 1" as never,
  new_version_label: "version label 2" as never,
  created_at: "2026-06-11T09:00:00Z" as never,
  items: [] as never,
  pending_count: 0 as never,
  resolved_count: 0 as never,
  ...overrides
});

export const createReviewReportForm = createDefaultReviewReport;
export const createReviewReportResponse = createDefaultReviewReport;

// 导出即归档:把当时的政策版本、风险等级和备注深拷贝进快照,
// 之后改备注或重标风险只影响实时数据,不会回写已生成的报告。
export const buildReviewReportSnapshot = (input: {
  id: number;
  title: string;
  now: string;
  documents: PolicyDocument[];
  sections: PolicySection[];
  diffResults: DiffResult[];
  notes: ReviewNote[];
}): ReviewReport => {
  const versionLabel = (documentId: number) =>
    input.documents.find((doc) => doc.id === documentId)?.version_label ?? `#${documentId}`;
  const distinct = (values: number[]) => [...new Set(values)];

  const items: ReviewReportItem[] = input.diffResults.map((diff) => {
    const section = input.sections.find((row) => row.id === diff.section_id);
    // 同一差异可能有多条历史备注,快照取最新一条(id 最大)
    const note = input.notes
      .filter((row) => row.diff_result_id === diff.id)
      .sort((a, b) => b.id - a.id)[0];
    const pending = !note || PENDING_REVIEW_STATUS.includes(note.status as never);
    return {
      diff_result_id: diff.id,
      section_no: section?.section_no ?? "",
      heading: section?.heading ?? diff.summary,
      diff_type: diff.diff_type,
      risk_level: section?.risk_level ?? "",
      note_tag: note?.tag ?? "",
      note_comment: note?.comment ?? "",
      note_reviewer: note?.reviewer ?? "",
      note_status: note?.status ?? "",
      pending
    };
  });

  const pendingCount = items.filter((item) => item.pending).length;
  return {
    id: input.id,
    title: input.title,
    old_version_label: distinct(input.diffResults.map((diff) => diff.old_document_id)).map(versionLabel).join("、"),
    new_version_label: distinct(input.diffResults.map((diff) => diff.new_document_id)).map(versionLabel).join("、"),
    created_at: input.now,
    items,
    pending_count: pendingCount,
    resolved_count: items.length - pendingCount
  };
};
