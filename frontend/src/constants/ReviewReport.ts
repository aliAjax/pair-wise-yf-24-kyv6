import type { ReviewStatus } from "./ReviewStatus";

export const REVIEW_REPORT_STORAGE_KEY = "policy-diff.review-reports";

// 导出时仍处于这些状态的条目不计入通过，单独进入未完成区
export const PENDING_REVIEW_STATUS: readonly ReviewStatus[] = ["OPEN"];

export const REPORT_SECTION_TEXT = {
  completed: "已处理项",
  pending: "未完成区（导出时仍待处理）"
} as const;

export const REPORT_PENDING_NOTICE = "以下条目在导出时仍未处理，已单独列入未完成区，不计入已通过";

export const REPORT_FROZEN_NOTICE = "快照在导出时已冻结，之后对备注或风险等级的修改只会进入下一份报告";
