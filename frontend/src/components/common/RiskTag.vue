<script setup lang="ts">
import { computed } from "vue";
import { PrivacyRiskLevelText } from "../../constants/PrivacyRiskLevel";

const props = defineProps<{ level?: string; title?: string }>();
const label = computed(() => {
  if (props.level) return (PrivacyRiskLevelText as Record<string, string>)[props.level] ?? props.level;
  return props.title ?? "RiskTag";
});
</script>

<template>
  <span class="risk-tag" :data-level="level">{{ label }}</span>
</template>
