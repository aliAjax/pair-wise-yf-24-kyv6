<script setup lang="ts">
import { REPORT_FROZEN_NOTICE, REPORT_PENDING_NOTICE, REPORT_SECTION_TEXT } from "../../constants/ReviewReport";
import type { ReviewReport } from "../../types/ReviewReport";
import { formatDate } from "../../utils/formatters";
import ReportItemTable from "./ReportItemTable.vue";
import StatusBadge from "./StatusBadge.vue";

defineProps<{ report: ReviewReport }>();
</script>

<template>
  <div class="snapshot-view">
    <div class="snapshot-meta">
      <span>报告编号 {{ report.report_no }}</span>
      <span>政策版本 {{ report.policy_version_label }}</span>
      <span>导出人 {{ report.exported_by }}</span>
      <span>导出时间 {{ formatDate(report.exported_at) }}</span>
      <StatusBadge value="FROZEN" />
    </div>
    <p class="frozen-note">{{ REPORT_FROZEN_NOTICE }}</p>
    <h3>{{ REPORT_SECTION_TEXT.completed }}（{{ report.completed_items.length }}）</h3>
    <ReportItemTable :items="report.completed_items" />
    <div class="pending-zone">
      <h3>{{ REPORT_SECTION_TEXT.pending }}（{{ report.pending_items.length }}）</h3>
      <p class="pending-notice">{{ REPORT_PENDING_NOTICE }}</p>
      <ReportItemTable :items="report.pending_items" />
    </div>
  </div>
</template>
