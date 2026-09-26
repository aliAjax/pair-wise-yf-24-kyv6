<script setup lang="ts">
import type { ReviewReportItem } from "../../types/ReviewReport";
import EmptyState from "./EmptyState.vue";
import RiskTag from "./RiskTag.vue";
import StatusBadge from "./StatusBadge.vue";

defineProps<{ items: ReviewReportItem[] }>();
</script>

<template>
  <table v-if="items.length" class="data-table">
    <thead>
      <tr><th>条款</th><th>差异类型</th><th>风险等级</th><th>标签</th><th>备注</th><th>状态</th><th>审阅人</th></tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.note_id">
        <td><strong>{{ item.heading }}</strong><br /><span class="muted">{{ item.section_no }}</span></td>
        <td><StatusBadge :value="item.diff_type" /></td>
        <td><RiskTag :level="item.risk_level" /></td>
        <td>{{ item.tag }}</td>
        <td>{{ item.comment }}</td>
        <td><StatusBadge :value="item.status" /></td>
        <td>{{ item.reviewer }}</td>
      </tr>
    </tbody>
  </table>
  <EmptyState v-else />
</template>
