export const ReviewStatus = ["OPEN","CONFIRMED","IGNORED","RESOLVED"] as const;
export type ReviewStatus = (typeof ReviewStatus)[number];
export const ReviewStatusText: Record<ReviewStatus, string> = Object.fromEntries(ReviewStatus.map((value) => [value, value.replace(/_/g, " ")])) as Record<ReviewStatus, string>;
// 导出报告时仍处于这些状态的条目视为待处理,进入"未完成区",不计入已通过
export const PENDING_REVIEW_STATUS: readonly ReviewStatus[] = ["OPEN", "CONFIRMED"];
