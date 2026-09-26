import { defineStore } from "pinia";
import { listPolicySection, savePolicySection } from "../api/PolicySection";
import type { PolicySection } from "../types/PolicySection";
export const usePolicySectionStore = defineStore("policySection", {
  state: () => ({ rows: [] as Awaited<ReturnType<typeof listPolicySection>>, loading: false }),
  actions: {
    async load() { this.loading = true; this.rows = await listPolicySection(); this.loading = false; },
    async save(section: PolicySection) {
      const saved = await savePolicySection(section);
      const index = this.rows.findIndex((row) => row.id === saved.id);
      if (index >= 0) this.rows[index] = saved;
      else this.rows.push(saved);
    }
  }
});
