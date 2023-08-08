import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { LiftingDetails, SalesReportsNew, ReportRemark } from '../../../shared/apis-path/apis-path';
import { roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { MessagingService } from '../../../service/messaging.service';
import * as moment from "moment";
import { Console } from 'console';

@Component({
  selector: 'app-purchase-register-import-report',
  templateUrl: './purchase-register-import-report.component.html',
  styleUrls: ['./purchase-register-import-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CrudServices, ToasterService, PermissionService, ExportService]
})
export class PurchaseRegisterImportReportComponent implements OnInit {

  @ViewChild("dt", { static: false }) table: Table;
  @ViewChild('remarkModel', { static: false }) public remarkModel: ModalDirective;

  toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
  });

  page_title: any = "Purchase Register Import Report";
  user: UserDetails;
  links: string[] = [];
  company_id: any = null;
  role_id: any = null;
  add_opt: boolean = false;
  edit_opt: boolean = false;
  view_opt: boolean = false;
  del_opt: boolean = false;
  isLoading: boolean = false;
  maxDate: any = new Date();
  datePickerConfig: any = staticValues.datePickerConfigNew;
  selected_date_range: any = [
    new Date(moment().startOf('month').format("YYYY-MM-DD")),
    new Date(moment().format("YYYY-MM-DD"))
  ];
  selected_report_type: any = null;
  cols: any = [];
  data: any = [];
  filter: any = [];
  reports_name: any = staticValues.reports_name;
  remarkForm: any = FormGroup;
  misData: any = [];
  uploadSuccess: EventEmitter<boolean> = new EventEmitter();
  isRange: any;


  constructor(
    private toasterService: ToasterService,
    private loginService: LoginService,
    private permissionService: PermissionService,
    private crudServices: CrudServices,
    private exportService: ExportService,
    private messagingService: MessagingService,
  ) {
    this.user = this.loginService.getUserDetails();
    this.company_id = this.user.userDet[0].company_id;
    this.role_id = this.user.userDet[0].role_id;
    this.links = this.user.links;
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];

  }

  ngOnInit() {
    this.getData();

    // Form for remarks
    this.remarkForm = new FormGroup({
      remark: new FormControl(null),
      dispatchBilling_id: new FormControl(null),
      mis_id: new FormControl(null),
    })
  }

  clearDropdown() {
    if (JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
      this.uploadSuccess.emit(false);
  }

  receiveDate(dateValue: any) {
    this.isRange = dateValue.range
    this.selected_date_range = dateValue.range;

  }

  getData() {
    this.getCols();
    this.data = [];
    this.isLoading = true;

    let condition = {
      from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
      to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
      import_local_flag: 1
    }

    this.crudServices.getOne<any>(SalesReportsNew.purchaseRegisterReport, condition).subscribe(res => {
      this.isLoading = false;
      if (res.code == '100') {
        if (res.data.length > 0) {
          this.data = [];

          console.log("test data>>", res.data);

          res.data.forEach((element) => {
            element.total_duty_paid = (element.custom_duty_amt + element.sws_val + element.anti_dumping_val);
            element.total_purchase_cost = (element.total_duty_paid + element.purchase_value);
            element.rp = (element.rbi_rate + element.premium);
            element.rate = (element.purchase_value / element.quantity);
            element.total_usd = (element.rate * element.quantity);
            element.purchaseAmt = (element.total_usd * element.rp)

            element.totalDutyPaid = (element.custom_duty_amt + element.sws_val + element.anti_dumping_val)
            element.total_purchase_cost = (element.purchaseAmt + element.totalDutyPaid)
            element.purchaseRate = (element.total_purchase_cost / element.quantity)
            element.invoice_arr = (element.non_copy != null) ? JSON.parse(element.non_copy) : null;
          });


          this.data = res.data;
          console.log("After Manipulating the data>>", this.data);

          this.pushDropdown(this.data);
          this.footerTotal(this.data);
        } else {
          this.toasterService.pop('error', 'Alert', 'No Data Found..!');
        }
      }
      this.table.reset();
    });
  }

  getCols() {
    this.cols = [
      { field: 'id', header: 'ID', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, oprations: null },
      { field: 'purchase_date', header: 'purchase date', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: "Date", oprations: null },
      { field: 'sub_org_name', header: 'Perticulars', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
      { field: 'depot', header: 'Depot', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
      { field: 'invoice_no', header: 'Purchase Invoice No', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null, oprations: "Sum" },
      { field: 'file_no', header: 'File No', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null, oprations: "Avg" },
      // { field: 'party_type', header: 'Party Type', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null, oprations: "Avg" },
      { field: 'division_name', header: 'Division Name', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null, oprations: null },
      { field: 'invoice_date', header: 'Supplier Invoice Date', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Date", oprations: "Sum" },
      { field: 'original_doc_received_date', header: 'Doc`s Received Date', style: '100px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date", oprations: null },
      // { field: 'gst_no', header: 'GSTIN/UIN Supplier', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, oprations: null },
      { field: 'lc_no', header: 'Lc No.', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null, oprations: "Avg" },
      { field: 'lc_date', header: 'Lc Date', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: "Date", oprations: "Date" },
      { field: 'bl_no', header: 'Bl No.', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null, oprations: "Avg" },
      { field: 'bl_date', header: 'Bl Date.', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: "Date", oprations: "Date" },
      { field: 'be_no', header: 'Bill of Entry No.', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null, oprations: "Avg" },
      { field: 'be_date', header: 'BE Date', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: "Date", oprations: "Avg" },
      { field: 'grade_name', header: 'Grade', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
      { field: 'category', header: 'Category', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, oprations: null },
      { field: 'quantity', header: 'Quantity', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity", oprations: null },
      { field: 'rate', header: 'Rate', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "USD", oprations: null },
      { field: 'total_usd', header: 'Total USD(Q*R)', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "USD", oprations: null },
      { field: 'rbi_rate', header: 'RBI Rate', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Avg", oprations: null },
      { field: 'premium', header: 'Premium', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Avg", oprations: null },
      { field: 'rp', header: 'RBI + Premium', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Avg", oprations: null },
      { field: 'purchaseAmt', header: 'Purchase Amount', style: '200px', sort: false, filter: false, dropdown: [], footer: true, total: 0, type: "Amount", oprations: null },
      { field: 'custom_duty_amt', header: 'Custome Duty', style: '200px', sort: false, filter: false, dropdown: [], footer: true, total: 0, type: "Amount", oprations: null },
      { field: 'sws_val', header: 'SWS Cess', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount", oprations: null },
      { field: 'anti_dumping_val', header: 'Anti Dumping Value', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount", oprations: null },
      // { field: 'total_duty_paid', header: 'Total Duty Paid1', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount", oprations: null },
      { field: 'totalDutyPaid', header: 'Total Duty Paid', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount", oprations: null },
      { field: 'igst_amt', header: 'IGST', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount", oprations: null },
      { field: 'total_purchase_cost', header: 'Total Purchase Cost', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount", oprations: null },
      { field: 'purchaseRate', header: 'Purchase Rate/ MT', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount", oprations: null },
      { field: '', header: 'Total Clearing charges', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null, oprations: null },
      { field: 'remark', header: 'Auditor Remark', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "REMARK", oprations: null },
      { field: 'added_at', header: 'Remark Time', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "created_at", oprations: null },

    ];
    this.filter = ['id', 'original_doc_received_date', 'grade_name', 'invoice_no', 'sub_org_name', 'depot', 'file_no', 'product_name', 'invoice_date', 'lc_no', 'lc_date', 'bl_no', 'bl_date', 'be_no', 'quantity', 'rate', 'total_usd', 'rbi_rate', 'premium', 'rp', 'purchase_value', 'custom_duty_amt', 'anti_dumping_val', 'total_duty_paid', 'total_purchase_cost'];
    //this.pushDropdown(this.data);
  }

  pushDropdown(arg) {
    let data = null;
    if (arg) {
      data = arg;
    } else {
      data = this.data;
    }
    let filter_cols = this.cols.filter(col => col.filter == true);
    filter_cols.forEach(element => {
      let unique = data.map(item =>
        item[element.field]
      ).filter((value, index, self) =>
        self.indexOf(value) === index
      );
      let array = [];
      unique.forEach(item => {
        if (item) {
          array.push({
            value: item,
            label: item
          });
        }
      });
      element.dropdown = array;
    });
  }

  footerTotal(arg) {
    let data = null;
    if (arg) {
      data = arg;
    } else {
      data = this.data;
    }
    let filter_cols = this.cols.filter(col => col.footer == true);
    filter_cols.forEach(element => {
      if (data.length > 0) {
        let total = data.map(item =>
          item[element.field]
        ).reduce((sum, item) => sum + item);

        if (element.type == "Avg") {
          element.total = total / (data.length)
        } else if (element.type == "Quantity") {
          element.total = roundQuantity(total);
        }
        else {
          element.total = total;
        }
      }

    });
  }

  customFilter(value, col, data) {
    let res = this.table.filter(value, col, data);
    //this.pushDropdown(this.data);
    this.footerTotal(this.data);
  }

  onFilter(e, dt) {
    this.pushDropdown(dt.filteredValue);
    this.footerTotal(dt.filteredValue);
  }

  onAction(item, type) {
    if (type == 'View') {
      console.log(item, "VIEW-DATA");
    }
    else if (type == "REMARK") {
      this.remark_add(item, "add");
    }
    else if (type == 'Edit_Remark') {
      console.log("EDIT REMARK >>", item.remark_id);
      this.getMisAuditReport(item.remark_id);
      //this.remark_add(this.misData, "update");
    }
  }

  getMisAuditReport(id) {
    this.crudServices.getOne<any>(ReportRemark.getOneReportRemark, {
      from_date: this.selected_date_range[0],
      to_date: this.selected_date_range[1],
      id: id,
    }).subscribe(res => {
      this.isLoading = false;
      if (res.code == '100') {
        if (res.data.length > 0) {
          this.misData = res.data[0];
          this.remark_add(this.misData, "update");
          console.log("MY REMARKS >>", this.misData);
        } else {
          this.toasterService.pop('error', 'Alert', 'No Data Found..!');
          // No Data Found - Toaster
        }
      }
      this.table.reset();
    });
  }

  remark_add(data, type) {
    console.log("Update Data >>", data);
    this.remarkForm.reset();
    if (type == 'add') {
      this.remarkForm.patchValue({
        remark: data.remark,
        dispatchBilling_id: data.id,
        mis_id: data.remark_id,
      });
    }
    else if (type == 'update') {
      this.remarkForm.patchValue({
        remark: data.remark,

        mis_id: data.id,
      });
    }

    // console.log("DATA >>",this.remarkForm.dispatchBilling_id);	
    this.remarkModel.show();
  }


  oncloseModal() {
    this.remarkForm.reset();
    this.remarkModel.hide();
  }

  onSubmit() {
    console.log("MY ID >>", this.remarkForm.value.mis_id);
    let id = this.remarkForm.value.mis_id;
    if (id != null) {
      let data = {
        remark: this.remarkForm.value.remark,
      };
      this.oncloseModal();
      let body = {
        data: data,
        id: id,
      };
      console.log("Update Mis >>", body);

      this.crudServices.postRequest<any>(ReportRemark.reportRemarkUpdate, body).subscribe((response) => {
        // console.log(response, "AMOL");
        if (response.code == 100) {
          this.toasterService.pop(response.message, response.data, response.data);
          this.oncloseModal();
          this.getData();
        } else {
          this.toasterService.pop(response.message, response.data, response.data);
        }
      });
    }

    else {
      let data = {
        table_name: 'dispatch_billing',
        table_primary_id: this.remarkForm.value.dispatchBilling_id,
        report_remark: 3,
        remark: this.remarkForm.value.remark
      };
      // console.log("MYDATA >>",data);
      this.oncloseModal();
      let body = {
        data: data,
        id: null,

      };
      // console.log("Amol", data);
      this.crudServices.postRequest<any>(ReportRemark.reportRemarkAdd, body).subscribe((response) => {
        // console.log(response, "AMOL");
        if (response.code == 100) {
          this.toasterService.pop(response.message, response.data, response.data);
          this.oncloseModal();
          this.getData();
        } else {
          this.toasterService.pop(response.message, response.data, response.data);
        }
      });
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
      for (let j = 0; j < this.cols.length; j++) {
        if (this.cols[j]["field"] != "action") {
          if (this.cols[j]["field"] == "quantity") {
            obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]];
          } else {
            obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]];
          }
        }
      }
      exportData.push(obj);
    }
    let foot = {};
    for (let j = 0; j < this.cols.length; j++) {
      if (this.cols[j]["field"] != "action") {
        if (this.cols[j]["field"] == "order_quantity" || this.cols[j]["field"] == "dispatch_quantity") {
          foot[this.cols[j]["header"]] = this.cols[j]["total"] + " MT";
        } else if (this.cols[j]["field"] == "final_rate") {
          foot[this.cols[j]["header"]] = this.cols[j]["total"];
        } else {
          foot[this.cols[j]["header"]] = "";
        }
      }
    }
    exportData.push(foot);
    if (type == 'Excel') {
      this.exportService.exportExcel(exportData, fileName);
    } else {
      let exportColumns = this.cols.map(function (col) {
        if (col.field != "action") {
          return { title: col.header, dataKey: col.header }
        }
      });
      this.exportService.exportPdf(exportColumns, exportData, fileName);
    }
  }

}
