export interface ReviewReportItem {
  diff_result_id: number;
  section_no: string;
  heading: string;
  diff_type: string;
  risk_level: string;
  note_tag: string;
  note_comment: string;
  note_reviewer: string;
  note_status: string;
  pending: boolean;
}

export interface ReviewReport {
  id: number;
  title: string;
  old_version_label: string;
  new_version_label: string;
  created_at: string;
  items: ReviewReportItem[];
  pending_count: number;
  resolved_count: number;
}
