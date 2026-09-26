<script setup lang="ts">
import type { ReportCompareEntry } from "../../hooks/useReportCompare";
import type { ReviewReport } from "../../types/ReviewReport";
import { formatDate } from "../../utils/formatters";
import EmptyState from "./EmptyState.vue";
import RiskTag from "./RiskTag.vue";
import StatusBadge from "./StatusBadge.vue";

defineProps<{ base: ReviewReport; target: ReviewReport; entries: ReportCompareEntry[] }>();
</script>

<template>
  <div class="snapshot-view">
    <div class="snapshot-meta">
      <span>基准 {{ base.report_no }}（{{ formatDate(base.exported_at) }} · 政策版本 {{ base.policy_version_label }} · 未完成 {{ base.pending_count }} 项）</span>
      <span>→</span>
      <span>对比 {{ target.report_no }}（{{ formatDate(target.exported_at) }} · 政策版本 {{ target.policy_version_label }} · 未完成 {{ target.pending_count }} 项）</span>
    </div>
    <table v-if="entries.length" class="data-table">
      <thead>
        <tr><th>条款</th><th>变化</th><th>基准快照</th><th>对比快照</th><th>明细</th></tr>
      </thead>
      <tbody>
        <tr v-for="entry in entries" :key="entry.note_id">
          <td><strong>{{ entry.heading }}</strong></td>
          <td><StatusBadge :value="entry.diff_type" /></td>
          <td>
            <template v-if="entry.before">
              <RiskTag :level="entry.before.risk_level" /> <StatusBadge :value="entry.before.status" />
            </template>
            <span v-else class="muted">—</span>
          </td>
          <td>
            <template v-if="entry.after">
              <RiskTag :level="entry.after.risk_level" /> <StatusBadge :value="entry.after.status" />
            </template>
            <span v-else class="muted">—</span>
          </td>
          <td>
            <ul v-if="entry.changes.length" class="change-list">
              <li v-for="change in entry.changes" :key="change" class="diff-change">{{ change }}</li>
            </ul>
            <span v-else class="muted">无变化</span>
          </td>
        </tr>
      </tbody>
    </table>
    <EmptyState v-else />
  </div>
</template>
