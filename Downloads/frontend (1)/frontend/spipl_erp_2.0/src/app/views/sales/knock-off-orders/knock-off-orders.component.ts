import { Component, OnInit, ViewChild } from '@angular/core';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { InsiderSales, salesIftPayment, SalesReportsNew, StaffMemberMaster } from '../../../shared/apis-path/apis-path';
import { staticValues } from '../../../shared/common-service/common-service';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ExportService } from '../../../shared/export-service/export-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { Table } from "primeng/table";
import * as moment from "moment";



@Component({
  selector: 'app-knock-off-orders',
  templateUrl: './knock-off-orders.component.html',
  styleUrls: ['./knock-off-orders.component.scss'],
  providers: [CrudServices, ToasterService, ExportService, PermissionService],
})
export class KnockOffOrdersComponent implements OnInit {
  @ViewChild("dt", { static: false }) table: Table;


  page_title: any = "Knock Off Orders";


  add_opt: boolean = false;
  edit_opt: boolean = false;
  view_opt: boolean = false;
  del_opt: boolean = false;
  isLoading: boolean = false;

  user: UserDetails;
  links: string[] = [];
  data: any[];
  cols: any = [];
  filter: any = [];
  statusList: any = staticValues.active_status;
  selected_status: any = this.statusList[0];
  private toasterService: ToasterService;
  public toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
  });

  datePickerConfig: any = staticValues.datePickerConfig;
  selected_date_range: any = [
    new Date(moment().startOf('month').format("YYYY-MM-DD")),
    new Date(moment().format("YYYY-MM-DD"))
  ];
  isRange: any;
  constructor(toasterService: ToasterService, private loginService: LoginService, private permissionService: PermissionService, private crudServices: CrudServices, private exportService: ExportService) {
    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];
    this.toasterService = toasterService;
  }
  ngOnInit() {
    this.getCols();
  }
  getCols() {
    this.cols = [
      { field: "id", header: "ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "sub_org_name", header: "Customer ", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "quantity", header: "Original Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Quantity' },
      { field: "cancel_quantity", header: "Knock Off Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Quantity' },
      { field: "cancel_date", header: "Cancel Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: 'Date' },
      { field: "cancel_by_name", header: "Cancel By", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "knock_off_remark", header: "Remark", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null }
    ];
    this.filter = ['id', 'Customer', 'quantity', 'cancle_by'];
    this.getData();
  }
  getData() {
    this.data = [];
    this.isLoading = true;
    let condition = {
      from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
      to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
    }
    this.crudServices.getOne<any>(SalesReportsNew.knockOffOrdersList, condition).subscribe(res => {
      this.isLoading = false;
      if (res.code == '100') {
        if (res.data.length > 0) {
          this.data = res.data;
          this.pushDropdown(this.data);
          this.footerTotal(this.data);
        }
      }
    });

  }
  exportData(type) {
    let fileName = 'Knock Off Orders';
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

  receiveDate(dateValue: any) {
    this.isRange = dateValue.range
    this.selected_date_range = dateValue.range;
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
  customFilter(value, col, data) {
    let res = this.table.filter(value, col, data);
    // this.pushDropdown(this.data);
    this.footerTotal(this.data);
  }
  onFilter(e, dt) {
    // this.pushDropdown(dt.filteredValue);
    this.footerTotal(dt.filteredValue);
  }
}