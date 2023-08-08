export interface PayableParameterModel {
  sub_org_id: number; // organization id
  emp_id: number; // 	employee id
  header_msg: string;
  total_amount: number;
  record_id: number;
  req_flag: number; // 1-For Local Purchase
  company_id: number; //1->spipl , 2->ssurisha
  org_or_emp_name: string;
  createRequestAccess: boolean;
  editRequestAccess: boolean;
  rate?: number;
  quantity?: number;
  ILc_amount?: number;
  Ilc_rtgs_amount?: number;
  local_debit_amount?: number;
  port_id?: number;
  payment_remaning?: number;

}
// 	0- pending, 1- approved, 2- rejected , 3- cancelled

export class PayableParameter {
  sub_org_id: number;
  emp_id: number;
  type_sub_org_emp: number;
  header_msg: string;
  total_amount: number;
  record_id: number;
  req_flag: number;
  org_or_emp_name: string;
  createRequestAccess: boolean;
  editRequestAccess: boolean;
  rate?: number;
  quantity?: number;
  ILc_amount?: number;
  Ilc_rtgs_amount?: number;
  port_id?: number;
  company_id: number;
  local_debit_amount: number;
  payment_remaning: number;
  constructor(sub_org_id: number,
    emp_id: number,
    header_msg: string,
    total_amount: number,
    record_id: number, req_flag: number, org_or_emp_name: string,
    createRequestAccess: boolean, editRequestAccess: boolean, company_id: number, rate?: number, quantity?: number, ILc_amount?: number,
    Ilc_rtgs_amount?: number, local_debit_amount?: number, port_id?: number, payment_remaning
      ?: number,) {
    this.sub_org_id = sub_org_id;
    this.emp_id = emp_id;
    this.header_msg = header_msg;
    this.total_amount = total_amount;
    this.record_id = record_id;
    this.req_flag = req_flag;
    this.org_or_emp_name = org_or_emp_name;
    this.company_id = company_id ? company_id : 0;
    this.payment_remaning = payment_remaning
      ? payment_remaning
      : 0;
    if (rate) {
      this.rate = rate;
    }

    if (quantity) {
      this.quantity = quantity;
    }



    if (ILc_amount) {


      this.ILc_amount = ILc_amount
    }

    if (local_debit_amount) {
      this.local_debit_amount = local_debit_amount
    }

    if (Ilc_rtgs_amount) {
      this.Ilc_rtgs_amount = Ilc_rtgs_amount
    }

    if (port_id) {
      this.port_id = port_id
    }
    this.createRequestAccess = createRequestAccess;
    this.editRequestAccess = editRequestAccess;
  }
}
