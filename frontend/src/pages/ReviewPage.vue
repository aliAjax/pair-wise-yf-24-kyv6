<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from "vue";
import { buildReviewReportSnapshot } from "../constructors/ReviewReportConstructor";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { PENDING_REVIEW_STATUS, REPORT_FROZEN_NOTICE } from "../constants/ReviewReport";
import { useReportCompare } from "../hooks/useReportCompare";
import { useDiffResultStore } from "../stores/DiffResultStore";
import { usePolicyDocumentStore } from "../stores/PolicyDocumentStore";
import { usePolicySectionStore } from "../stores/PolicySectionStore";
import { useReviewNoteStore } from "../stores/ReviewNoteStore";
import { useReviewReportStore } from "../stores/ReviewReportStore";
import type { PolicySection } from "../types/PolicySection";
import type { ReviewChecklistRow } from "../types/ReviewChecklistRow";
import type { ReviewNote } from "../types/ReviewNote";
import { formatDate } from "../utils/formatters";
import EmptyState from "../components/common/EmptyState.vue";
import ReportCompareView from "../components/common/ReportCompareView.vue";
import ReportSnapshotView from "../components/common/ReportSnapshotView.vue";
import ReviewChecklist from "../components/common/ReviewChecklist.vue";
import StatusBadge from "../components/common/StatusBadge.vue";

const policyDocumentStore = usePolicyDocumentStore();
const policySectionStore = usePolicySectionStore();
const diffResultStore = useDiffResultStore();
const reviewNoteStore = useReviewNoteStore();
const reviewReportStore = useReviewReportStore();

onMounted(() => {
  void Promise.all([
    policyDocumentStore.load(),
    policySectionStore.load(),
    diffResultStore.load(),
    reviewNoteStore.load(),
    reviewReportStore.load()
  ]);
});

const workspaceRows = computed<ReviewChecklistRow[]>(() =>
  reviewNoteStore.rows.map((note) => {
    const diff = diffResultStore.rows.find((row) => row.id === note.diff_result_id);
    const section = policySectionStore.rows.find((row) => row.id === diff?.section_id);
    return { note, diff, section };
  })
);

const pendingCount = computed(
  () => reviewNoteStore.rows.filter((row) => PENDING_REVIEW_STATUS.includes(row.status as never)).length
);

// 工作区里的修改只持久化到当前数据，已导出的快照不受影响
const onUpdateNote = async (note: ReviewNote) => {
  await reviewNoteStore.save(note);
};
const onUpdateSection = async (section: PolicySection) => {
  await policySectionStore.save(section);
};

const exporting = ref(false);
const exportMessage = ref("");
const exportError = ref("");

const onExport = async () => {
  exportMessage.value = "";
  exportError.value = "";
  const document = [...policyDocumentStore.rows].sort((a, b) => b.imported_at.localeCompare(a.imported_at))[0];
  if (!document) {
    exportError.value = ERROR_MESSAGES.VALIDATION_FAILED;
    return;
  }
  exporting.value = true;
  try {
    const report = buildReviewReportSnapshot({
      document,
      sections: policySectionStore.rows,
      diffs: diffResultStore.rows,
      notes: reviewNoteStore.rows,
      reviewer: "legal-ops",
      sequence: reviewReportStore.rows.length + 1
    });
    await reviewReportStore.exportSnapshot(report);
    exportMessage.value = report.pending_count > 0
      ? `已生成快照 ${report.report_no}，内容已冻结；${report.pending_count} 项待处理已列入未完成区`
      : `已生成快照 ${report.report_no}，内容已冻结`;
  } catch (error) {
    exportError.value = error instanceof Error ? error.message : ERROR_MESSAGES.VALIDATION_FAILED;
  } finally {
    exporting.value = false;
  }
};

const reports = computed(() => reviewReportStore.rows);
const expandedId = ref<number | null>(null);
const toggleView = (id: number) => {
  expandedId.value = expandedId.value === id ? null : id;
  if (expandedId.value !== null) {
    const report = reports.value.find((row) => row.id === id);
    console.info(LOG_TEMPLATES.ReviewReport[1], report?.report_no);
  }
};

const { baseId, targetId, base, target, entries: compareEntries } = useReportCompare(reports);

watchEffect(() => {
  if (reports.value.length >= 2) {
    if (baseId.value === null) baseId.value = reports.value[0].id;
    if (targetId.value === null) targetId.value = reports.value[reports.value.length - 1].id;
  }
});

watch([baseId, targetId], ([nextBase, nextTarget]) => {
  if (nextBase !== null && nextTarget !== null) {
    console.info(LOG_TEMPLATES.ReviewReport[2], nextBase, nextTarget);
  }
});
</script>

<template>
  <section class="review-page">
    <div class="panel wide">
      <div class="toolbar">
        <h2>当前审阅工作区</h2>
        <span class="frozen-note">此处对备注或风险等级的修改只影响下一份导出，历史快照保持不变</span>
      </div>
      <p v-if="pendingCount > 0" class="pending-notice">
        当前有 {{ pendingCount }} 项待处理（OPEN），导出时将列入未完成区，不会写成已通过
      </p>
      <ReviewChecklist :rows="workspaceRows" @update-note="onUpdateNote" @update-section="onUpdateSection" />
      <div class="toolbar">
        <button class="primary-btn" :disabled="exporting" @click="onExport">导出审阅报告快照</button>
        <span v-if="exportMessage" class="badge">{{ exportMessage }}</span>
        <span v-if="exportError" class="pending-notice">{{ exportError }}</span>
      </div>
    </div>

    <div class="panel wide">
      <h2>历史报告快照</h2>
      <p class="frozen-note">{{ REPORT_FROZEN_NOTICE }}；旧报告可查看、可比较。</p>
      <EmptyState v-if="!reports.length" />
      <article v-for="report in reports" :key="report.id" class="snapshot-item">
        <div class="row">
          <div>
            <strong>{{ report.report_no }}</strong>
            <div class="snapshot-meta">
              <span>政策版本 {{ report.policy_version_label }}</span>
              <span>导出 {{ formatDate(report.exported_at) }}</span>
              <span>已处理 {{ report.completed_count }} 项</span>
              <span>未完成 {{ report.pending_count }} 项</span>
            </div>
          </div>
          <StatusBadge value="FROZEN" />
          <button @click="toggleView(report.id)">{{ expandedId === report.id ? "收起" : "查看" }}</button>
        </div>
        <ReportSnapshotView v-if="expandedId === report.id" :report="report" />
      </article>
    </div>

    <div v-if="reports.length >= 2" class="panel wide">
      <h2>快照比较</h2>
      <div class="toolbar">
        <label>
          基准
          <select v-model.number="baseId">
            <option v-for="report in reports" :key="report.id" :value="report.id">{{ report.report_no }}</option>
          </select>
        </label>
        <label>
          对比
          <select v-model.number="targetId">
            <option v-for="report in reports" :key="report.id" :value="report.id">{{ report.report_no }}</option>
          </select>
        </label>
      </div>
      <ReportCompareView v-if="base && target" :base="base" :target="target" :entries="compareEntries" />
    </div>
  </section>
</template>
