import { computed, ref, toValue, type MaybeRefOrGetter } from "vue";
import { PrivacyRiskLevelText } from "../constants/PrivacyRiskLevel";
import { ReviewStatusText } from "../constants/ReviewStatus";
import type { DiffType } from "../types/DiffType";
import type { ReviewReport, ReviewReportItem } from "../types/ReviewReport";

export interface ReportCompareEntry {
  note_id: number;
  heading: string;
  diff_type: DiffType;
  before: ReviewReportItem | null;
  after: ReviewReportItem | null;
  changes: string[];
}

const riskText = (value: string) => (PrivacyRiskLevelText as Record<string, string>)[value] ?? value;
const statusText = (value: string) => (ReviewStatusText as Record<string, string>)[value] ?? value;

const allItems = (report: ReviewReport) => [...report.completed_items, ...report.pending_items];

export function compareReviewReports(base: ReviewReport, target: ReviewReport): ReportCompareEntry[] {
  const beforeMap = new Map(allItems(base).map((item) => [item.note_id, item]));
  const afterMap = new Map(allItems(target).map((item) => [item.note_id, item]));
  const noteIds = [...new Set([...beforeMap.keys(), ...afterMap.keys()])].sort((a, b) => a - b);
  return noteIds.map((noteId) => {
    const before = beforeMap.get(noteId) ?? null;
    const after = afterMap.get(noteId) ?? null;
    const changes: string[] = [];
    if (before && after) {
      if (before.risk_level !== after.risk_level) {
        changes.push(`风险等级 ${riskText(before.risk_level)} → ${riskText(after.risk_level)}`);
      }
      if (before.status !== after.status) {
        changes.push(`状态 ${statusText(before.status)} → ${statusText(after.status)}`);
      }
      if (before.comment !== after.comment) {
        changes.push("备注内容已修改");
      }
    }
    const diffType: DiffType = !before ? "ADDED" : !after ? "REMOVED" : changes.length > 0 ? "MODIFIED" : "UNCHANGED";
    return { note_id: noteId, heading: (after ?? before)?.heading ?? "", diff_type: diffType, before, after, changes };
  });
}

export function useReportCompare(source: MaybeRefOrGetter<ReviewReport[]>) {
  const baseId = ref<number | null>(null);
  const targetId = ref<number | null>(null);
  const base = computed(() => toValue(source).find((row) => row.id === baseId.value) ?? null);
  const target = computed(() => toValue(source).find((row) => row.id === targetId.value) ?? null);
  const entries = computed(() => (base.value && target.value ? compareReviewReports(base.value, target.value) : []));
  return { baseId, targetId, base, target, entries };
}
