import type { ReviewReport } from "../types/ReviewReport";

export interface ReviewReportDiffRow {
  diff_result_id: number;
  heading: string;
  field: string;
  before: string;
  after: string;
}

const FIELD_LABELS: Record<string, string> = {
  risk_level: "风险等级",
  note_status: "处理状态",
  note_comment: "备注内容",
  note_reviewer: "审阅人",
  pending: "是否待处理"
};

// 对齐两份快照的同一差异条目,逐字段列出变化;只进不出、只出不进的条目单独标注
export function diffReviewReports(before: ReviewReport, after: ReviewReport): ReviewReportDiffRow[] {
  const rows: ReviewReportDiffRow[] = [];
  const beforeItems = new Map(before.items.map((item) => [item.diff_result_id, item]));
  const afterItems = new Map(after.items.map((item) => [item.diff_result_id, item]));

  for (const [id, afterItem] of afterItems) {
    const beforeItem = beforeItems.get(id);
    if (!beforeItem) {
      rows.push({ diff_result_id: id, heading: afterItem.heading, field: "条目", before: "(不存在)", after: "新增" });
      continue;
    }
    for (const [key, label] of Object.entries(FIELD_LABELS)) {
      const beforeValue = String(beforeItem[key as keyof typeof beforeItem]);
      const afterValue = String(afterItem[key as keyof typeof afterItem]);
      if (beforeValue !== afterValue) {
        rows.push({ diff_result_id: id, heading: afterItem.heading, field: label, before: beforeValue || "(空)", after: afterValue || "(空)" });
      }
    }
  }
  for (const [id, beforeItem] of beforeItems) {
    if (!afterItems.has(id)) {
      rows.push({ diff_result_id: id, heading: beforeItem.heading, field: "条目", before: "存在", after: "(已移除)" });
    }
  }
  return rows;
}
