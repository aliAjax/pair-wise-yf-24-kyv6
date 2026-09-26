import type { DiffResult } from "./DiffResult";
import type { PolicySection } from "./PolicySection";
import type { ReviewNote } from "./ReviewNote";

export interface ReviewChecklistRow {
  note: ReviewNote;
  diff?: DiffResult;
  section?: PolicySection;
}
