import { Component, OnInit, ViewChild } from '@angular/core';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { LocalPurchase, salesIftPayment, StaffMemberMaster, SubOrg } from '../../../shared/apis-path/apis-path';
import { staticValues } from '../../../shared/common-service/common-service';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ExportService } from '../../../shared/export-service/export-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { TreeNode } from 'primeng/api';
@Component({
  selector: 'app-price-protection',
  templateUrl: './price-protection.component.html',
  styleUrls: ['./price-protection.component.scss'],
  providers: [CrudServices, ToasterService, ExportService, PermissionService],
})
export class PriceProtectionComponent implements OnInit {
  @ViewChild("dt", { static: false }) table: Table;
  page_title: any = "Price Protection";
  assignParent: boolean = true;
  add_opt: boolean = false;
  edit_opt: boolean = false;
  view_opt: boolean = false;
  del_opt: boolean = false;
  isLoading: boolean = false;
  user: UserDetails;
  data: any = []
  links: string[] = [];
  cols: any = [];
  filter: any = [];
  statusList: any = staticValues.active_status;
  selected_status: any = this.statusList[0];
  datePickerConfig: any = staticValues.datePickerConfig;
  private toasterService: ToasterService;
  public toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
  });
  selected_date_range: any = [
    new Date(moment().startOf('month').format("YYYY-MM-DD")),
    new Date(moment().format("YYYY-MM-DD"))
  ];
  maxDate = new Date();
  currentUser: UserDetails;
  section: TreeNode[];
  selectedNodes3: TreeNode[];
  unique: any = [];
  data2: any = [];
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
  }

  getCols() {
    this.cols = [
      { field: "name", header: "Section", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "from_date", header: "From Date", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "to_date", header: "To Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "value", header: "Value", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null }
    ];
    this.filter = ['first_name'];
    this.getCompanyList();
  }
  getCompanyList() {
    this.data = [];
    this.isLoading = true;
    this.crudServices.getAll<any>(SubOrg.getPriceProtectionOrgList).subscribe(response => {
      this.data = response.data;
      this.isLoading = false;
    });
    this.getSection()
  }
  getSection() {
    this.isLoading = true;
    this.crudServices.getAll<any>(LocalPurchase.getSections).subscribe(response => {
      this.data2 = response.data
      var resArr = [];
      response.data.filter(function (item) {
        var i = resArr.findIndex(x => (x.name == item.name));
        if (i <= -1) {
          resArr.push(item);
        }
        return null;
      });
      this.section = resArr
      this.isLoading = false;
    });



  }
  exportData(type) {
    let fileName = 'price protection';
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
  selectItemCoverages(index: number) {

  }
}