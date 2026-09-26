<script setup lang="ts">
import { PrivacyRiskLevel } from "../../constants/PrivacyRiskLevel";
import { ReviewStatus } from "../../constants/ReviewStatus";
import type { PolicySection } from "../../types/PolicySection";
import type { ReviewChecklistRow } from "../../types/ReviewChecklistRow";
import type { ReviewNote } from "../../types/ReviewNote";
import EmptyState from "./EmptyState.vue";
import RiskTag from "./RiskTag.vue";
import StatusBadge from "./StatusBadge.vue";

defineProps<{ rows: ReviewChecklistRow[] }>();

const emit = defineEmits<{
  (event: "update-note", note: ReviewNote): void;
  (event: "update-section", section: PolicySection): void;
}>();

const onStatusChange = (row: ReviewChecklistRow, event: Event) => {
  emit("update-note", { ...row.note, status: (event.target as HTMLSelectElement).value });
};

const onCommentChange = (row: ReviewChecklistRow, event: Event) => {
  emit("update-note", { ...row.note, comment: (event.target as HTMLInputElement).value });
};

const onRiskChange = (row: ReviewChecklistRow, event: Event) => {
  if (row.section) {
    emit("update-section", { ...row.section, risk_level: (event.target as HTMLSelectElement).value });
  }
};
</script>

<template>
  <table v-if="rows.length" class="data-table">
    <thead>
      <tr><th>条款</th><th>差异类型</th><th>风险等级</th><th>标签</th><th>备注</th><th>状态</th><th>审阅人</th></tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.note.id">
        <td>
          <strong>{{ row.section?.heading ?? "未匹配条款" }}</strong><br />
          <span class="muted">{{ row.section?.section_no ?? "-" }}</span>
        </td>
        <td><StatusBadge :value="row.diff?.diff_type ?? 'UNCHANGED'" /></td>
        <td>
          <template v-if="row.section">
            <RiskTag :level="row.section.risk_level" />
            <select :value="row.section.risk_level" @change="onRiskChange(row, $event)">
              <option v-for="level in PrivacyRiskLevel" :key="level" :value="level">{{ level }}</option>
            </select>
          </template>
          <span v-else class="muted">—</span>
        </td>
        <td>{{ row.note.tag }}</td>
        <td><input type="text" :value="row.note.comment" @change="onCommentChange(row, $event)" /></td>
        <td>
          <select :value="row.note.status" @change="onStatusChange(row, $event)">
            <option v-for="status in ReviewStatus" :key="status" :value="status">{{ status }}</option>
          </select>
        </td>
        <td>{{ row.note.reviewer }}</td>
      </tr>
    </tbody>
  </table>
  <EmptyState v-else />
</template>
