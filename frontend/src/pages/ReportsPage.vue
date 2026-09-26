<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useReviewReportStore } from "../stores/ReviewReportStore";
import { diffReviewReports } from "../utils/reportCompare";
import { renderReviewReportMarkdown, formatDate, formatRisk, formatNoteStatus } from "../utils/formatters";
import { downloadTextFile } from "../utils/download";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import EmptyState from "../components/common/EmptyState.vue";

const reportStore = useReviewReportStore();

const detailId = ref<number | null>(null);
const compareA = ref<number | null>(null);
const compareB = ref<number | null>(null);
const comparedPair = ref<[number, number] | null>(null);

const detail = computed(() => reportStore.rows.find((row) => row.id === detailId.value) ?? null);
const detailPendingItems = computed(() => detail.value?.items.filter((item) => item.pending) ?? []);
const detailResolvedItems = computed(() => detail.value?.items.filter((item) => !item.pending) ?? []);

const compareRows = computed(() => {
  if (!comparedPair.value) return [];
  const [aId, bId] = comparedPair.value;
  const a = reportStore.rows.find((row) => row.id === aId);
  const b = reportStore.rows.find((row) => row.id === bId);
  if (!a || !b) return [];
  return diffReviewReports(a, b);
});
const compareTitle = computed(() => (comparedPair.value ? `报告 #${comparedPair.value[0]} → 报告 #${comparedPair.value[1]} 的变化` : ""));

onMounted(() => reportStore.load());

function openDetail(id: number) {
  detailId.value = id;
  console.info(LOG_TEMPLATES.ReviewReport[1], id);
}

function download(reportId: number) {
  const report = reportStore.rows.find((row) => row.id === reportId);
  if (!report) return;
  console.info(LOG_TEMPLATES.ReviewReport[3], reportId);
  // 由归档快照重新渲染,内容与导出当时发出的文件逐字一致
  downloadTextFile(`审阅报告-${report.id}.md`, renderReviewReportMarkdown(report));
}

function runCompare() {
  if (compareA.value == null || compareB.value == null || compareA.value === compareB.value) return;
  comparedPair.value = [compareA.value, compareB.value];
  console.info(LOG_TEMPLATES.ReviewReport[2], { from: compareA.value, to: compareB.value });
}
</script>

<template>
  <section class="reports-page">
    <EmptyState v-if="reportStore.rows.length === 0" />
    <template v-else>
      <table class="table">
        <thead>
          <tr>
            <th>报告</th>
            <th>导出时间</th>
            <th>政策版本</th>
            <th>待处理</th>
            <th>已处理</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="report in reportStore.rows" :key="report.id">
            <td><strong>{{ report.title }}</strong></td>
            <td>{{ formatDate(report.created_at) }}</td>
            <td>{{ report.old_version_label }} → {{ report.new_version_label }}</td>
            <td><span :class="report.pending_count > 0 ? 'pending-flag' : 'muted'">{{ report.pending_count }}</span></td>
            <td>{{ report.resolved_count }}</td>
            <td class="actions">
              <button @click="openDetail(report.id)">查看</button>
              <button @click="download(report.id)">下载 Markdown</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="detail" class="panel">
        <h2>{{ detail.title }} <span class="muted">(只读快照,内容不可修改)</span></h2>
        <p class="muted">导出时间:{{ formatDate(detail.created_at) }} · 政策版本:{{ detail.old_version_label }} → {{ detail.new_version_label }}</p>

        <h3 class="zone-title">未完成区(待处理 {{ detailPendingItems.length }} 项)</h3>
        <p v-if="detailPendingItems.length === 0" class="muted">导出时没有待处理条目。</p>
        <table v-else class="table">
          <thead>
            <tr><th>条款编号</th><th>条款</th><th>差异类型</th><th>风险等级</th><th>处理状态</th><th>备注</th><th>审阅人</th></tr>
          </thead>
          <tbody>
            <tr v-for="item in detailPendingItems" :key="item.diff_result_id" class="pending-row">
              <td>{{ item.section_no || "-" }}</td>
              <td>{{ item.heading || "-" }}</td>
              <td>{{ item.diff_type }}</td>
              <td>{{ formatRisk(item.risk_level) }}</td>
              <td>{{ formatNoteStatus(item.note_status) }}</td>
              <td>{{ item.note_comment || "-" }}</td>
              <td>{{ item.note_reviewer || "-" }}</td>
            </tr>
          </tbody>
        </table>

        <h3 class="zone-title">已处理条目({{ detailResolvedItems.length }} 项)</h3>
        <p v-if="detailResolvedItems.length === 0" class="muted">导出时尚无已处理条目。</p>
        <table v-else class="table">
          <thead>
            <tr><th>条款编号</th><th>条款</th><th>差异类型</th><th>风险等级</th><th>处理状态</th><th>备注</th><th>审阅人</th></tr>
          </thead>
          <tbody>
            <tr v-for="item in detailResolvedItems" :key="item.diff_result_id">
              <td>{{ item.section_no || "-" }}</td>
              <td>{{ item.heading || "-" }}</td>
              <td>{{ item.diff_type }}</td>
              <td>{{ formatRisk(item.risk_level) }}</td>
              <td>{{ formatNoteStatus(item.note_status) }}</td>
              <td>{{ item.note_comment || "-" }}</td>
              <td>{{ item.note_reviewer || "-" }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="panel">
        <h2>比较两份报告</h2>
        <div class="toolbar">
          <select v-model="compareA">
            <option :value="null" disabled>选择较早报告</option>
            <option v-for="report in reportStore.rows" :key="report.id" :value="report.id">{{ report.title }}({{ formatDate(report.created_at) }})</option>
          </select>
          <select v-model="compareB">
            <option :value="null" disabled>选择较晚报告</option>
            <option v-for="report in reportStore.rows" :key="report.id" :value="report.id">{{ report.title }}({{ formatDate(report.created_at) }})</option>
          </select>
          <button :disabled="compareA == null || compareB == null || compareA === compareB" @click="runCompare">对比</button>
        </div>
        <template v-if="comparedPair">
          <h3 class="zone-title">{{ compareTitle }}</h3>
          <p v-if="compareRows.length === 0" class="muted">两份报告内容一致,没有变化。</p>
          <table v-else class="table">
            <thead>
              <tr><th>条款</th><th>变化项</th><th>之前</th><th>之后</th></tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in compareRows" :key="index">
                <td>{{ row.heading || `#${row.diff_result_id}` }}</td>
                <td>{{ row.field }}</td>
                <td>{{ row.before }}</td>
                <td>{{ row.after }}</td>
              </tr>
            </tbody>
          </table>
        </template>
      </div>
    </template>
  </section>
</template>
