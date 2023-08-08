import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { Observable, Subscription, forkJoin, pipe } from 'rxjs';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import htmlDocx from 'html-docx-js/dist/html-docx';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExpenseMaster, MainOrg } from '../../../shared/apis-path/apis-path';
import { LoginService } from '../../login/login.service';
import { ModalDirective } from 'ngx-bootstrap';
import { PayableParameter } from '../../../shared/payable-request/payable-parameter.model';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { Router } from '@angular/router';
import { UserDetails } from '../../login/UserDetails.model';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import { Table } from "primeng/table";
import { staticValues, roundAmount, roundQuantity, CommonService } from '../../../shared/common-service/common-service';
import { FileNamePipe } from '../../../shared/file-name/file-name.pipe';
import { ExportService } from '../../../shared/export-service/export-service';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ToasterService,
    PermissionService,
    LoginService,
    CrudServices,
    ExportService],
})
export class ExpenseListComponent implements OnInit {
  @ViewChild('myModalRefund', { static: false }) public myModalRefund: ModalDirective;
  @ViewChild('myModalReimburse', { static: false }) public myModalReimburse: ModalDirective;
  @ViewChild('popView', { static: false }) public popView: ModalDirective;
  @ViewChild('tabGroup', { static: false }) tabGroup: MatTabGroup;
  @ViewChild("dt", { static: false }) table: Table;
  isLoading = false;
  role_id: any = null;
  error: any;
  public filterQuery = '';
  filter: any = [];
  cols: any = [];
  selected_cols: any = [];
  selected_date_range: any = [
    new Date(moment().subtract(2, 'months').format("YYYY-MM-DD")),
    new Date(moment().format("YYYY-MM-DD"))
  ];
  public popoverTitle: string = 'Warning';
  public popoverMessage: string = 'Are you sure, you want to delete?';
  public confirmClicked: boolean = false;
  public cancelClicked: boolean = false;
  public confirmText: string = 'Yes';
  public cancelText: string = 'No';
  public placement: string = 'rigth';
  public closeOnOutsideClick: boolean = true;
  popoverTitle1: string = 'Status Change';
  popoverMessage1: string = 'Are you sure, you want to change Status?';
  public confirmText1: string = 'Approve';
  public cancelText1: string = 'Reject';
  popoverMessage2: string = "Are you sure to confirm this action?";
  add_opt: boolean = false;
  edit_opt: boolean = false;
  view_opt: boolean = false;
  del_opt: boolean = false;
  id: number;
  refund_access: boolean = false;
  reimburse_access: boolean = false;
  expense_list_all: boolean = false;
  companyList: any = staticValues.company_list_new;
  statusList: any = staticValues.approval_status;
  selected_company: any = this.companyList[0];
  user: UserDetails;
  links: string[] = [];

  subscription: Subscription;
  private toasterService: ToasterService;
  data = [];
  public employee_expense_data: any[];
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });

  refundUpdateForm: FormGroup;
  up_refund_amount: string;
  up_refundable_status: number;
  reimburseUpdateForm: FormGroup;
  up_reimburse_amount: number;
  amount = 0;
  payablePara: PayableParameter;
  payableExit: boolean;
  payment_request: boolean;
  company_id: any;
  body = [];
  page_title: string = "Expense List";
  data1: any = [];
  isRange: any;
  expense_arr: any[];

  constructor(toasterService: ToasterService,
    private router: Router,
    private exportService: ExportService,
    private permissionService: PermissionService,
    private loginService: LoginService,
    private crudServices: CrudServices) {

    this.toasterService = toasterService;
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];
    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;

    this.company_id = this.user.userDet[0].company_id;
    this.role_id = this.user.userDet[0].role_id;

    this.refund_access = (this.links.indexOf('expense refund') > -1);
    this.reimburse_access = (this.links.indexOf('reimburse access') > -1);
    this.expense_list_all = (this.links.indexOf('All Expense List') > -1);
    this.payment_request = (this.links.indexOf('Payment Request') > -1);
    this.getData();
    this.initRefundForm();
  }

  ngOnInit(): void {
    this.getOrg();
    this.getCols();
  }

  getCols() {
    this.cols = [
      { field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null, style: '15%' },
      { field: "category", header: "Category", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null, style: '15%' },
      { field: "expense_date", header: "Expense Date", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null, style: '15%' },
      { field: "service_provider", header: "Service Provider", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null, style: '40%' },
      { field: "company", header: "Company", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, style: '15%' },
      { field: "empName", header: "Employee Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, style: '15%' },
      { field: "description", header: "Description", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, style: '50%' },
      { field: "status", header: "Approve Status", sort: true, filter: true, dropdown: [], footer: false, type: 'as', style: '15%' },
      { field: "amount", header: "Amount", sort: true, filter: true, dropdown: [], footer: true, total: 0, type: 'Amount', style: '15%' },
      { field: "expense_copy", header: "Invoice/Bill", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: 'ec', style: '15%' },
      { field: "refundable_status", header: "Status", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, style: '15%' },
      { field: "import_local_flag", header: "Import/Local", sort: true, filter: false, dropdown: [], footer: false, style: '15%' },
      { field: "refund_access", header: "Refundable Status", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: 's', style: '15%' },
      { field: "reimburse_access", header: "Reimburse Amount", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: 'ap', style: '15%' },
      { field: "payment_request", header: "Payment Request", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: 'pp', style: '15%' },
      { field: "invoice_no", header: "Invoice Number", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, style: '15%' },
    ];

    this.selected_cols = [
      { field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null, style: '15%' },
      { field: "category", header: "Category", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null, style: '15%' },
      { field: "expense_date", header: "Expense Date", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null, style: '15%' },
      { field: "service_provider", header: "Service Provider", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Date", style: '40%' },
      { field: "company", header: "Company", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, style: '15%' },
      { field: "empName", header: "Employee Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, style: '15%' },
      { field: "invoice_no", header: "Invoice Number", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, style: '15%' },
      { field: "description", header: "Description", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, style: '50%' },
      { field: "status", header: "Approve Status", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: 'as', style: '15%' },
      { field: "amount", header: "Amount", sort: true, filter: true, dropdown: [], footer: true, total: 0, type: 'Amount', style: '15%' },
      { field: "expense_copy", header: "Invoice/Bill", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: 'ec', style: '15%' },
      { field: "refundable_status", header: " Status", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: 'rs', style: '15%' },
      { field: "import_local_flag", header: "Import/Local", sort: true, filter: false, dropdown: [], footer: false, type: 'lc', style: '15%' },
      { field: "refund_access", header: "Refundable Status", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: 's', style: '15%' },
      { field: "reimburse_access", header: "Reimburse Amount", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: 'ap', style: '15%' },
      { field: "payment_request", header: "Payment Request", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: 'pp', style: '15%' },

    ];

    this.filter = ['category', 'expense_date', 'empName', 'service_provider', 'expense_date', 'sub_org_name', 'description', 'amount', 'status'];
    this.getData();

  }

  customFilter(value, col, data) {
    let res = this.table.filter(value, col, data);
    this.footerTotal(this.data);
  }
  onFilter(e, dt) {
    // this.pushDropdown(dt.filteredValue);
    this.footerTotal(dt.filteredValue);
  }

  onChangeCompany(e) {
    if (e != null && e != undefined) {
      this.selected_company = {
        id: e.value.id,
        name: e.value.name
      };
      this.getData();
    }
  }

  getOrg() {
    this.crudServices.getOne<any>(MainOrg.getCompanyOrg, {
      company_id: this.company_id
    }).subscribe(res => {
    });
  }
  getData() {
    this.data = [];
    this.isLoading = true;

    let condition = {
      from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
      to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
      division_type: this.selected_company.id
    }
    if (this.user.userDet[0].role_id == 5 || this.user.userDet[0].role_id == 33) {
      if (this.user.userDet[0].insider_parent_id == null) {
        condition["zone_id"] = this.user.userDet[0].id;
      }
    } else {
      condition["zone_id"] = null;
    }

    if (this.expense_list_all) {
      condition["added_by"] = null;
    } else {
      condition["added_by"] = this.user.userDet[0].id;
    }
    this.crudServices.getOne<any>(ExpenseMaster.getAll, condition).subscribe(res => {
      this.isLoading = false;
      if (res.code == '100') {
        for (const val of res.data) {
          this.id = val.id;
        }
        if (res.data.length > 0) {
          res.data = res.data.map(ele => {
            if (ele.expense_master_employees) {
              ele.empName = ele.expense_master_employees.reduce((prev, emp) => prev + `${emp.staff_member_master.first_name}  ${emp.staff_member_master.last_name}`, ' ')
            }
            if (ele.status == 0) {
              ele.classButton = 'btn btn-warning btn-sm action-btn mb-1'
              ele.status = 'Pending'
            }
            else if (ele.status == 1) {
              ele.classButton = 'btn btn-success btn-sm action-btn mb-1'
              ele.status = 'Approved'
            }
            else if (ele.status == 2) {
              ele.classButton = 'btn btn-danger btn-sm action-btn mb-1'
              ele.status = 'Rejected'
            }
            return ele;
          });
          this.data = res.data;
        }
        this.pushDropdown(this.data);
        this.footerTotal(this.data);
      }
      this.table.reset();
    });
  }

  footerTotal(arg) {
    let data = null;
    if (arg) {
      data = arg;
    } else {
      data = this.data;
    }

    let filter_cols = this.selected_cols.filter(col => col.footer == true);
    filter_cols.forEach(element => {
      if (data.length > 0) {
        let total = data.map(item =>
          item[element.field]
        ).reduce((sum, item) => sum + item);
        if (element.type == "Amount") {
          element.total = roundQuantity(total);
        }
        else {
          element.total = total;
        }
      } else {
        element.total = 0;
      }

    });
  }

  getColumnPresent(col) {
    if (this.selected_cols.find((ob) => ob.field === col)) {
      return true;
    } else {
      return false;
    }
  }

  initRefundForm() {
    this.refundUpdateForm = new FormGroup({
      'up_refund_amount': new FormControl(null, Validators.required),
      'up_refundable_status': new FormControl(null, Validators.required),
    });

    this.reimburseUpdateForm = new FormGroup({
      'up_reimburse_amount': new FormControl(null, Validators.required),
    });

  }

  getRefundableStatus(refund_status: number) {
    if (refund_status === 0) {
      return 'Partial Refund';
    } else if (refund_status === 1) {
      return 'Full Refund';
    } else if (refund_status === 2) {
      return 'Non Refundable';
    }
  }

  getStatus(status: number) {

    if (status === 0) {
      return 'Pending';
    } else if (status === 1) {
      return 'Approved';
    } else if (status === 2) {
      return 'Rejected';
    }

  }

  onDelete(id: number) {
    if (id) {
      this.crudServices.deleteData<any>(ExpenseMaster.delete, { id: id }).subscribe((response) => {
        this.getData();
        this.toasterService.pop(response.message, 'Success', response.data);
      });
    }
  }

  onAdd() {
    this.router.navigate(['expense/add-expense']);
  }

  onEditRefund(id: number) {

    if (id != null) {
      this.id = id;
      let refund_amount = '';
      let refundable_status = '';
      this.crudServices.getOne<any>(ExpenseMaster.getOne, { id: this.id }).subscribe((response) => {
        if (response === null) {
          this.error = response;
          this.toasterService.pop('error', 'Error', 'Something Went Wrong');
        } else {

          refund_amount = response[0]['refund_amount'];
          refundable_status = response[0]['refundable_status'];

          this.refundUpdateForm = new FormGroup({
            'up_refund_amount': new FormControl(refund_amount, Validators.required),
            'up_refundable_status': new FormControl(refundable_status, Validators.required),

          });
        }
      }, errorMessage => {
        this.error = errorMessage.message;
      });
      this.myModalRefund.show();
    }
  }

  onUpdateRefund() {

    this.crudServices.updateData<any>(ExpenseMaster.updateRefund,
      {
        id: this.id,
        refundable_status: this.refundUpdateForm.value.up_refundable_status,
        refund_amount: this.refundUpdateForm.value.up_refund_amount
      }).subscribe((response) => {
        // this.getAllExpense();
        this.getData();
        this.toasterService.pop(response.message, 'Success', response.data);
        this.myModalRefund.hide();
      });
  }

  onEditReimburse(amt, id: number) {
    if (id != null) {
      this.id = id;
      this.amount = amt;
      let reimburse_amount = '';

      this.reimburseUpdateForm = new FormGroup({
        'up_reimburse_amount': new FormControl(this.amount, Validators.required),
      });
      this.myModalReimburse.show();
    }
  }

  pushDropdown(arg) {
    let data = null;
    if (arg) {
      data = arg;
    } else {
      data = this.data;
    }
    let filter_cols = this.selected_cols.filter(col => col.filter == true);
    filter_cols.forEach(element => {
      let unique = data.map(item =>
        item[element.field]
      ).filter((value, index, self) =>
        self.indexOf(value) === index
      );
      let array = [];
      unique.forEach(item => {
        array.push({
          value: item,
          label: item
        });
      });
      element.dropdown = array;
    });
  }


  onUpdateReimburse() {

    if (this.amount >= this.reimburseUpdateForm.value.up_reimburse_amount) {

      this.crudServices.updateData<any>(ExpenseMaster.updateReimburse,
        {
          id: this.id,
          reimburse_amount: this.reimburseUpdateForm.value.up_reimburse_amount
        }).subscribe((response) => {
          this.getData();
          this.toasterService.pop(response.message, 'Success', response.data);
          this.myModalReimburse.hide();
        });
    } else {
      this.toasterService.pop('error', 'error', 'Amount Exceeds');
    }


  }


  exportData(type) {
    let final_data = null;
    if (this.table.filteredValue == null) {
      final_data = this.data;
    } else {
      final_data = this.table.filteredValue;
    }
    let fileName = this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
    let exportData = [];
    for (let i = 0; i < final_data.length; i++) {
      let obj = {};
      for (let j = 0; j < this.selected_cols.length; j++) {
        if (this.selected_cols[j]["field"] != "action") {
          if (this.selected_cols[j]["field"] == "quantity") {
            obj[this.selected_cols[j]["header"]] = final_data[i][this.selected_cols[j]["field"]] + " MT";
          } else {
            obj[this.selected_cols[j]["header"]] = final_data[i][this.selected_cols[j]["field"]];
          }
        }
      }
      exportData.push(obj);
    }
    let foot = {};
    for (let j = 0; j < this.selected_cols.length; j++) {
      if (this.selected_cols[j]["field"] != "action") {
        if (this.selected_cols[j]["field"] == "quantity") {
          foot[this.selected_cols[j]["header"]] = this.selected_cols[j]["total"] + " MT";
        } else if (this.selected_cols[j]["field"] == "deal_rate" ||
          this.selected_cols[j]["field"] == "freight_rate") {
          foot[this.selected_cols[j]["header"]] = this.selected_cols[j]["total"];
        } else {
          foot[this.selected_cols[j]["header"]] = "";
        }
      }
    }
    exportData.push(foot);
    if (type == 'Excel') {
      this.exportService.exportExcel(exportData, fileName);
    } else {
      let exportColumns = this.selected_cols.map(function (col) {
        if (col.field != "action") {
          return { title: col.header, dataKey: col.header }
        }
      });
      this.exportService.exportPdf(exportColumns, exportData, fileName);
    }
  }


  onEdit(id) {
    if (id != null) {
      this.router.navigate(['expense/add-expense', id]);
    }
  }

  onPaymentClick(item) {
    const record_id = item.id;
    const sub_org_id = item.company_id ? item.company_id : 0;
    let sub_org_name = ''
    const amount = item.amount;

    const req_flag = 3;
    let emp_id = 0;

    if (item.emp_id) {
      emp_id = item.emp_id[0].emp_id
    }

    const headerMsg = 'Payment Details for Expense Id: ' + record_id;


    const createRequestAcess = (this.links.indexOf('Create Expense Payment') > -1);
    const editRequestAcess = (this.links.indexOf('Edit Expense Payment') > -1);

    if (item.empName) {
      sub_org_name = item.empName
    }
    if (item.company_id) {
      sub_org_name = item.sub_org_master ? item.sub_org_master.sub_org_name : null;

    }
    this.payablePara = new PayableParameter(sub_org_id, emp_id, headerMsg, amount, record_id, req_flag, sub_org_name, createRequestAcess, editRequestAcess, this.company_id);
    this.payableExit = false;
  }

  backFromPayable(event) {
    this.payablePara = null;
    this.payableExit = true;
  }

  changeStatus(item, type) {
    this.body['id'] = item.id;
    if (type == 'reject') {
      this.body['status'] = 2;
    }
    else {
      this.body['status'] = (item.status == 'Pending') ? 1 : 0;
    }
    this.changeMyStatusUpdate(this.body);
  }

  changeMyStatusUpdate(updateBody) {
    this.crudServices.getOne<any>(ExpenseMaster.updateStatus, { id: updateBody['id'], status: updateBody['status'] })
      .subscribe((response) => {
        this.getData();
        this.toasterService.pop(response.message, 'Success', response.data);

      });
  }

  onAction(item) {
    this.expense_arr = [];
    this.expense_arr = JSON.parse(item);
    let images_arr = this.expense_arr;
    this.crudServices.downloadMultipleFiles(images_arr);
  }

  receiveDate(dateValue: any) {
    this.isRange = dateValue.range
    this.selected_date_range = dateValue.range;

  }
}
