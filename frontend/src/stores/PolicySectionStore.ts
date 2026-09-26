import { defineStore } from "pinia";
import { listPolicySection, savePolicySection } from "../api/PolicySection";
import type { PolicySection } from "../types/PolicySection";
export const usePolicySectionStore = defineStore("policySection", {
  state: () => ({ rows: [] as PolicySection[], loading: false }),
  actions: {
    async load() { this.loading = true; this.rows = await listPolicySection(); this.loading = false; },
    async save(row: PolicySection) { await savePolicySection(row); this.rows = this.rows.map((item) => (item.id === row.id ? { ...row } : item)); }
  }
});
