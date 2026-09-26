import type { ReviewReport, ReviewReportItem } from "../types/ReviewReport";

export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
export const formatNoteStatus = (value: string) => (value ? formatStatus(value) : "未填写备注");

const escapeCell = (value: string) => value.replace(/\|/g, "\\|").replace(/\n/g, " ");

const renderItemRows = (items: ReviewReportItem[]) =>
  items
    .map((item) =>
      [
        item.section_no || "-",
        item.heading || "-",
        formatStatus(item.diff_type),
        formatRisk(item.risk_level),
        formatNoteStatus(item.note_status),
        escapeCell(item.note_comment) || "-",
        item.note_reviewer || "-"
      ].join(" | ")
    )
    .map((cells) => `| ${cells} |`)
    .join("\n");

const TABLE_HEAD = "| 条款编号 | 条款 | 差异类型 | 风险等级 | 处理状态 | 备注 | 审阅人 |\n|---|---|---|---|---|---|---|";

// 由归档快照渲染 Markdown:重新下载历史报告时内容与导出当时逐字一致
export const renderReviewReportMarkdown = (report: ReviewReport): string => {
  const pendingItems = report.items.filter((item) => item.pending);
  const resolvedItems = report.items.filter((item) => !item.pending);
  const lines = [
    `# ${report.title}`,
    "",
    `- 导出时间:${formatDate(report.created_at)}`,
    `- 政策版本:${report.old_version_label} → ${report.new_version_label}`,
    `- 差异条目:共 ${report.items.length} 项,已处理 ${report.resolved_count} 项,待处理 ${report.pending_count} 项`,
    "",
    "## 未完成区(待处理)",
    ""
  ];
  if (pendingItems.length > 0) {
    lines.push("> 以下条目在导出时仍未处理完成,不计入已通过。", "", TABLE_HEAD, renderItemRows(pendingItems));
  } else {
    lines.push("导出时没有待处理条目。");
  }
  lines.push("", "## 已处理条目", "");
  if (resolvedItems.length > 0) {
    lines.push(TABLE_HEAD, renderItemRows(resolvedItems));
  } else {
    lines.push("导出时尚无已处理条目。");
  }
  lines.push("");
  return lines.join("\n");
};
