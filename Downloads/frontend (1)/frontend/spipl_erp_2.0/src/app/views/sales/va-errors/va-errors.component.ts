import { Component, OnInit, ViewChild } from '@angular/core';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { InsiderSales, salesIftPayment, StaffMemberMaster } from '../../../shared/apis-path/apis-path';
import { staticValues } from '../../../shared/common-service/common-service';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ExportService } from '../../../shared/export-service/export-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-va-errors',
  templateUrl: './va-errors.component.html',
  styleUrls: ['./va-errors.component.scss'],
  providers: [CrudServices, ToasterService, ExportService, PermissionService],
})
export class VaErrorsComponent implements OnInit {
  @ViewChild('vaadjustModal', { static: false }) public vaadjustModal: ModalDirective;
  @ViewChild("dt", { static: false }) table: Table;
  page_title: any = "VA ERROR";
  assignParent: boolean = true;
  add_opt: boolean = false;
  edit_opt: boolean = false;
  view_opt: boolean = false;
  del_opt: boolean = false;
  isLoading: boolean = false;
  user: UserDetails;
  links: string[] = [];
  vaErrorData: any[];
  insiderParentData: any[];
  cols: any = [];
  filter: any = [];
  statusList: any = staticValues.active_status;
  selected_status: any = this.statusList[0];
  private toasterService: ToasterService;
  public toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
  });
  currentUser: UserDetails;
  vaadjustform: FormGroup;
  data: any = [];
  adjustdata: any;
  constructor(toasterService: ToasterService, private loginService: LoginService, private permissionService: PermissionService, private crudServices: CrudServices, private exportService: ExportService) {
    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];
    this.toasterService = toasterService;
    this.currentUser = this.loginService.getUserDetails();
  }
  ngOnInit() {
    this.getCols();
    this.initForm()
  }
  initForm() {
    this.vaadjustform = new FormGroup({
      sub_org_id: new FormControl(null, Validators.required),
    });
  }
  getCols() {
    this.cols = [
      { field: "id", header: "id", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "middleware_payment_id", header: "Payment Id", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "actual_amount", header: "Amount", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "virtual_id", header: "VA Id", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "company", header: "DIVISION", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Action" },
      { field: "added_at", header: "Date", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Action" }
    ];
    this.filter = ['first_name'];
    this.geVaErrorList();
  }
  geVaErrorList() {
    this.vaErrorData = [];
    this.isLoading = true;
    this.crudServices.getOne<any>(salesIftPayment.vaErrorList, {
      "company_id": (this.currentUser.userDet[0].role_id == 1) ? '' : this.currentUser.userDet[0].company_id
    }).subscribe((res: any) => {
      this.isLoading = false;
      if (res.status == 200) {
        if (res.data.length > 0) {
          this.vaErrorData = res.data
          this.pushDropdown(this.vaErrorData);
          this.footerTotal(this.vaErrorData);
        }
      }
    })
  }
  adjust(data) {
    this.adjustdata = data
    let url = `${salesIftPayment.getVirtualAccountData}`;
    if (this.currentUser.userDet[0].role_id != 1) {
      url = `${salesIftPayment.getVirtualAccountData}/?company_id=${data.company_id}`;
    }
    this.crudServices.getAll<any>(url).subscribe((res: any) => {
      if (res.status == 200) {
        if (res.data.length > 0) {
          res.data.map(item => item.sub_org_name_va = `${item.sub_org_name} (${item.virtual_acc_no})`)
          this.data = res.data;
          this.vaadjustModal.show();
        }
        else {
          this.toasterService.pop('error', 'Alert', 'No Virtual Account Found..!');
        }
      }
    })
  }
  exportData(type) {
    let fileName = 'Insider List';
    let exportData = [];
    for (let i = 0; i < this.vaErrorData.length; i++) {
      let obj = {};
      for (let j = 0; j < this.cols.length; j++) {
        if (this.cols[j]["field"] != "action") {
          if (this.cols[j]["field"] == "quantity") {
            obj[this.cols[j]["header"]] = this.vaErrorData[i][this.cols[j]["field"]] + " MT";
          } else {
            obj[this.cols[j]["header"]] = this.vaErrorData[i][this.cols[j]["field"]];
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
  onCloseModal() {
    this.vaadjustModal.hide();
    this.vaadjustform.reset();
  }
  onSubmit() {
    let sub_org_data = this.data.filter(item => item.sub_org_id == this.vaadjustform.value.sub_org_id)
    this.crudServices.getOne<any>(salesIftPayment.vaErrorAdjust, {
      "id": this.adjustdata.id,
      "sub_org_id": this.vaadjustform.value.sub_org_id,
      "middleware_payment_id": this.adjustdata.middleware_payment_id,
      "virtual_id": sub_org_data[0].virtual_acc_no
    }).subscribe((res: any) => {
      if (res.status == 200) {
        if (res.data.length > 0) {
          this.toasterService.pop('success', 'Alert', 'success');
        }
        else {
          this.toasterService.pop('error', 'Alert', 'error');
        }
      }
    })
    this.geVaErrorList()
    this.onCloseModal();
  }
  customFilter(value, col, data) {
    let res = this.table.filter(value, col, data);
    // this.pushDropdown(this.data);
    this.footerTotal(this.data);
  }

  onFilter(e, dt) {
    // this.pushDropdown(dt.filteredValue);
    this.footerTotal(dt.filteredValue);
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
        element.total = total;
      }

    });
  }
  pushDropdown(arg) {
    let data = null;
    if (arg) {
      data = arg;
    } else {
      data = this.data;
    }
    if (data.length > 0) {
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
  }
}