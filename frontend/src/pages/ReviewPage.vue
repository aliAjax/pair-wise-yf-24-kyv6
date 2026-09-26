<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { usePolicyDocumentStore } from "../stores/PolicyDocumentStore";
import { usePolicySectionStore } from "../stores/PolicySectionStore";
import { useDiffResultStore } from "../stores/DiffResultStore";
import { useReviewNoteStore } from "../stores/ReviewNoteStore";
import { useReviewReportStore } from "../stores/ReviewReportStore";
import { ReviewStatus, PENDING_REVIEW_STATUS } from "../constants/ReviewStatus";
import { PrivacyRiskLevel } from "../constants/PrivacyRiskLevel";
import { renderReviewReportMarkdown, formatRisk } from "../utils/formatters";
import { downloadTextFile } from "../utils/download";
import StatusBadge from "../components/common/StatusBadge.vue";
import EmptyState from "../components/common/EmptyState.vue";

const documentStore = usePolicyDocumentStore();
const sectionStore = usePolicySectionStore();
const diffStore = useDiffResultStore();
const noteStore = useReviewNoteStore();
const reportStore = useReviewReportStore();

interface RowDraft {
  risk_level: string;
  tag: string;
  comment: string;
  reviewer: string;
  status: string;
}

const drafts = reactive<Record<number, RowDraft>>({});
const savingId = ref<number | null>(null);
const exporting = ref(false);
const message = ref("");

const rows = computed(() =>
  diffStore.rows.map((diff) => {
    const section = sectionStore.rows.find((row) => row.id === diff.section_id);
    const note = noteStore.rows
      .filter((row) => row.diff_result_id === diff.id)
      .sort((a, b) => b.id - a.id)[0];
    return { diff, section, note };
  })
);

const isPending = (row: (typeof rows.value)[number]) =>
  !row.note || PENDING_REVIEW_STATUS.includes(row.note.status as never);

const pendingCount = computed(() => rows.value.filter(isPending).length);

onMounted(async () => {
  await Promise.all([documentStore.load(), sectionStore.load(), diffStore.load(), noteStore.load(), reportStore.load()]);
  for (const row of rows.value) {
    drafts[row.diff.id] = {
      risk_level: row.section?.risk_level ?? "LOW",
      tag: row.note?.tag ?? "",
      comment: row.note?.comment ?? "",
      reviewer: row.note?.reviewer ?? "",
      status: row.note?.status ?? "OPEN"
    };
  }
});

async function saveRow(diffId: number) {
  const row = rows.value.find((item) => item.diff.id === diffId);
  const draft = drafts[diffId];
  if (!row || !draft) return;
  savingId.value = diffId;
  try {
    if (row.section) await sectionStore.save({ ...row.section, risk_level: draft.risk_level });
    const noteId = row.note?.id ?? noteStore.rows.reduce((max, note) => Math.max(max, note.id), 0) + 1;
    await noteStore.save({
      id: noteId,
      diff_result_id: diffId,
      tag: draft.tag,
      comment: draft.comment,
      reviewer: draft.reviewer,
      status: draft.status
    });
    message.value = `已保存差异 #${diffId} 的修改,只影响下一次导出的报告,历史快照不变`;
  } finally {
    savingId.value = null;
  }
}

async function exportReport() {
  exporting.value = true;
  try {
    // 导出即归档:快照与下载的 Markdown 同源,之后改备注或重标风险不会回写这份报告
    const report = await reportStore.exportReport();
    downloadTextFile(`审阅报告-${report.id}.md`, renderReviewReportMarkdown(report));
    message.value =
      report.pending_count > 0
        ? `已归档${report.title}:共 ${report.items.length} 项,${report.pending_count} 项待处理已列入未完成区,不计入已通过`
        : `已归档${report.title}:全部 ${report.items.length} 项均已处理`;
  } finally {
    exporting.value = false;
  }
}
</script>

<template>
  <section class="review-page">
    <div class="toolbar">
      <div>
        <strong>待处理 {{ pendingCount }} 项</strong>
        <span class="muted">/ 共 {{ rows.length }} 项差异 · 已归档 {{ reportStore.rows.length }} 份报告</span>
      </div>
      <button class="primary" :disabled="exporting || rows.length === 0" @click="exportReport">
        {{ exporting ? "导出中…" : "导出审阅报告(归档快照)" }}
      </button>
    </div>
    <p v-if="pendingCount > 0" class="hint">导出时仍有 {{ pendingCount }} 项待处理,将单独列入报告"未完成区",不会写成已通过。</p>
    <p v-if="message" class="message">{{ message }}</p>

    <EmptyState v-if="rows.length === 0" />
    <table v-else class="table">
      <thead>
        <tr>
          <th>条款</th>
          <th>差异类型</th>
          <th>风险等级</th>
          <th>备注标签</th>
          <th>备注内容</th>
          <th>审阅人</th>
          <th>处理状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.diff.id" :class="{ 'pending-row': isPending(row) }">
          <td>
            <strong>{{ row.section?.section_no ?? "-" }}</strong>
            <div class="muted">{{ row.section?.heading ?? row.diff.summary }}</div>
          </td>
          <td><StatusBadge :value="row.diff.diff_type" /></td>
          <td>
            <select v-model="drafts[row.diff.id].risk_level">
              <option v-for="level in PrivacyRiskLevel" :key="level" :value="level">{{ formatRisk(level) }}</option>
            </select>
          </td>
          <td><input v-model="drafts[row.diff.id].tag" placeholder="标签" /></td>
          <td><input v-model="drafts[row.diff.id].comment" placeholder="备注内容" /></td>
          <td><input v-model="drafts[row.diff.id].reviewer" placeholder="审阅人" /></td>
          <td>
            <select v-model="drafts[row.diff.id].status">
              <option v-for="status in ReviewStatus" :key="status" :value="status">{{ status }}</option>
            </select>
            <div v-if="isPending(row)" class="pending-flag">待处理</div>
          </td>
          <td>
            <button :disabled="savingId === row.diff.id" @click="saveRow(row.diff.id)">
              {{ savingId === row.diff.id ? "保存中…" : "保存" }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
