import { defineStore } from "pinia";
import { listReviewNote, saveReviewNote } from "../api/ReviewNote";
import type { ReviewNote } from "../types/ReviewNote";
export const useReviewNoteStore = defineStore("reviewNote", {
  state: () => ({ rows: [] as ReviewNote[], loading: false }),
  actions: {
    async load() { this.loading = true; this.rows = await listReviewNote(); this.loading = false; },
    async save(row: ReviewNote) { await saveReviewNote(row); this.rows = this.rows.map((item) => (item.id === row.id ? { ...row } : item)); }
  }
});
