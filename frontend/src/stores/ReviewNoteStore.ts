import { defineStore } from "pinia";
import { listReviewNote, saveReviewNote } from "../api/ReviewNote";
import type { ReviewNote } from "../types/ReviewNote";
export const useReviewNoteStore = defineStore("reviewNote", {
  state: () => ({ rows: [] as Awaited<ReturnType<typeof listReviewNote>>, loading: false }),
  actions: {
    async load() { this.loading = true; this.rows = await listReviewNote(); this.loading = false; },
    async save(note: ReviewNote) {
      const saved = await saveReviewNote(note);
      const index = this.rows.findIndex((row) => row.id === saved.id);
      if (index >= 0) this.rows[index] = saved;
      else this.rows.push(saved);
    }
  }
});
