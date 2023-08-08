/**
* Blue print of payment request lists.
*/
export interface PaymentRequestRes {
  id: number;
  sub_org_emp_id: number;
  type_sub_org_emp: number;
  req_date: string;
  req_amount: number;
  req_flag: number;
  record_id: number;
  advanced_agnst_bill: number;
  normal_priority: number;
  remark: string;
  added_by: number;
  added_date: string;
  request_status: number;
  approved_by: number;
  approved_date: string;
  spipl_bank_id: number;
  paid_date: string;
  paid_amount: number;
  ref_no: string;
  neft_rtgs: number;
  account_type: number;
  cheque_no: string;
  beneficiary_bank_name: string;
  beneficiary_account_no: string;
  beneficiary_bank_ifsc: string;
  beneficiary_branch_name: string;
  beneficiary_account_name: string;
  utr_no: string;
  invoice_no: string;
  spiplbank: string;
  org_emp_name: string;
  added_by_name: string;
  approved_by_name: string;
  category: string;
  application_status : number;
  fcm_web_token : string;
  addby_id : number;
}
