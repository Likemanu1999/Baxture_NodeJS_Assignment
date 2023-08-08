export interface LeavesModel {
  id: number;
  leave_type: number;
  from_date: string;
  to_date: string;
  total_hours: string;
  total_days: number;
  reason: string;
  status: string;
  created_at: string;
  created_by: string;
  checked_at: string;
  checked_by: string;
  active_status: number;
  createdby: string;
  checkedby: string;
}
export interface LeavesList extends Array<LeavesModel> {}
