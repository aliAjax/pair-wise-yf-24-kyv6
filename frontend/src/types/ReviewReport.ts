export interface ReviewReportItem {
  note_id: number;
  diff_result_id: number;
  section_id: number;
  section_no: string;
  heading: string;
  diff_type: string;
  risk_level: string;
  tag: string;
  comment: string;
  reviewer: string;
  status: string;
}

export interface ReviewReport {
  id: number;
  report_no: string;
  title: string;
  document_id: number;
  policy_version_label: string;
  exported_by: string;
  exported_at: string;
  frozen: boolean;
  completed_items: ReviewReportItem[];
  pending_items: ReviewReportItem[];
  completed_count: number;
  pending_count: number;
}
