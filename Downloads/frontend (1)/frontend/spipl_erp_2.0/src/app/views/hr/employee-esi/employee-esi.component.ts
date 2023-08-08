import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { DepartmentMaster, FileUpload, JobReferences, QualificationMaster, StaffMemberMaster, MonthlySalaryNew } from '../../../shared/apis-path/apis-path';
import { staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { MessagingService } from '../../../service/messaging.service';
import * as moment from "moment";
@Component({
  selector: 'app-employee-esi',
  templateUrl: './employee-esi.component.html',
  styleUrls: ['./employee-esi.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CrudServices, ToasterService, PermissionService, ExportService]
})
export class EmployeeEsiComponent implements OnInit {
  @ViewChild("dt", { static: false }) table: Table;
  toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000,
  });
  page_title: any = "Employee ESI";
  user: UserDetails;
  links: string[] = [];
  company_id: any = null;
  role_id: any = null;
  view_opt: boolean = false;
  isLoading: boolean = false;
  loadingBtn: boolean = false;
  maxDate: any = new Date();
  datePickerConfig: any = staticValues.datePickerConfigNew;
  selected_date_range: any = [
    new Date(moment().subtract(2, 'months').format("YYYY-MM-DD")),
    new Date(moment().format("YYYY-MM-DD"))
  ];
  uploadSuccess: EventEmitter<boolean> = new EventEmitter();
  statusList: any = staticValues.active_status;
  selected_status: any = this.statusList[0];
  cols: any = [];
  data: any = [];
  filter: any = [];
  id: any = null;
  selected_row: any = null;
  isRange: any;
  constructor(private toasterService: ToasterService,
    private loginService: LoginService,
    private permissionService: PermissionService,
    private crudServices: CrudServices,
    private exportService: ExportService) {
    this.user = this.loginService.getUserDetails();
    this.company_id = this.user.userDet[0].company_id;
    this.role_id = this.user.userDet[0].role_id;
    this.links = this.user.links;
    const perms = this.permissionService.getPermission();
    this.view_opt = perms[1];
    this.getGrossSalary()
  }

  ngOnInit() {
  }
  getCols() {
    this.cols = [
      { field: 'uan_no', header: 'UAN Number', sort: true, type: null },
      { field: 'first_name', header: 'First Name', sort: true, filter: false, total: 0, type: null },
      { field: 'last_name', header: 'Last Name', sort: true, filter: false, total: 0, type: null },
      { field: 'middle_name', header: 'Middle Name', sort: true, filter: false, total: 0, type: null },
      { field: 'gender', header: 'Gender', sort: false, type: 'gs' },
      { field: 'appointment_date', header: 'Joining Date', sort: true, type: 'Date' },
      { field: 'pan_no', header: 'Pan Number', sort: false, type: null },
      { field: 'mobile', header: 'Contact', sort: false, type: null },
      { field: 'permanant_address', header: 'Address', sort: false, type: null },
      { field: 'marital_status', header: 'Marital Status', sort: false, type: 'ms' },
      { field: 'bank_account_no', header: 'Account Number', sort: false, type: null },
      { field: 'ifsc_code', header: 'IFSC Code', sort: false, type: null },
      { field: 'bank_name', header: 'Bank Name', sort: true, type: null },
      { field: 'bank_branch_name', header: 'Bank Address', sort: false, type: null },
      { field: 'dob', header: 'Date Of Birth', sort: true, type: 'Date' },
    ];
  }
  receiveDate(dateValue: any) {
    this.isRange = dateValue.range
    this.selected_date_range = dateValue.range;

  }
  clearDropdown() {
    if (JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
      this.uploadSuccess.emit(false);
  }



  getGrossSalary() {
    this.getCols();
    this.data = [];
    this.isLoading = true;
    let condition = {

    }
    this.crudServices.getOne<any>(MonthlySalaryNew.getMonthlySalaryNewEsi,
      condition).subscribe(res_sal => {
        if (res_sal.code == '100') {
          this.data = res_sal.data;
          this.isLoading = false;
        } else {
          this.data = [];
          this.toasterService.pop('error', 'Error', 'Something Went Wrong');
        }
        this.table.reset();
      });
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
        array.push({
          value: item,
          label: item
        });
      });
      element.dropdown = array;
    });
  }


  customFilter(value, col, data) {
    let res = this.table.filter(value, col, data);
  }

  exportData(type) {
    let fileName = 'Employee ESI List';
    let exportData = [];
    for (let i = 0; i < this.data.length; i++) {
      let obj = {};
      for (let j = 0; j < this.cols.length; j++) {
        if (this.cols[j]["field"] != "action") {
          if (this.cols[j]["field"] == "quantity") {
            obj[this.cols[j]["header"]] = this.data[i][this.cols[j]["field"]] + " MT";
          } else {
            obj[this.cols[j]["header"]] = this.data[i][this.cols[j]["field"]];
          }
        }
      }
      exportData.push(obj);
    }
    let foot = {};
    for (let j = 0; j < this.cols.length; j++) {
      if (this.cols[j]["field"] != "action") {
        if (this.cols[j]["field"] == "quantity") {
          foot[this.cols[j]["header"]] = this.cols[j]["total"] + " MT";
        } else if (this.cols[j]["field"] == "final_rate" ||
          this.cols[j]["field"] == "freight_rate") {
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
