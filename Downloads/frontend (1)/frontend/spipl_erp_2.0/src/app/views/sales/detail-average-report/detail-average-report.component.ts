import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { SalesReportsNew, Consignments } from '../../../shared/apis-path/apis-path';
import { roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { MessagingService } from '../../../service/messaging.service';
import * as moment from "moment";
@Component({
  selector: 'app-detail-average-report',
  templateUrl: './detail-average-report.component.html',
  styleUrls: ['./detail-average-report.component.scss'],
  providers: [CrudServices, ToasterService, PermissionService, ExportService]
})
export class DetailAverageReportComponent implements OnInit {
  @ViewChild("dt", { static: false }) table: Table;
  toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
  });
  page_title: any = "Customer Average Report";
  popoverTitle: string = 'Warning';
  popoverMessage: string = 'Are you sure you want to Change Discount Status?';
  confirmText: string = 'Confirm';
  cancelText: string = 'Cancel';
  placement: string = 'left';
  cancelClicked: boolean = false;
  customerAvrageTable: any = [];
  user: UserDetails;
  links: string[] = [];
  add_opt: boolean = false;
  edit_opt: boolean = false;
  view_opt: boolean = false;
  del_opt: boolean = false;
  isLoading: boolean = false;
  datePickerConfig: any = staticValues.datePickerConfig;
  selected_date_range: any = [
    new Date(moment().startOf('month').format("YYYY-MM-DD")),
    new Date(moment().format("YYYY-MM-DD"))
  ];
  cols: any = [];
  filter: any = [];
  constructor(
    private toasterService: ToasterService,
    private loginService: LoginService,
    private permissionService: PermissionService,
    private crudServices: CrudServices,
    private exportService: ExportService,
    private messagingService: MessagingService,
  ) {
    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];
  }
  ngOnInit() {
    this.getCols();
  }
  getData() {
    this.isLoading = true;
    this.crudServices.getOne<any>(Consignments.getCustomerDetailAvgWise, {
      from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
      to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
    }).subscribe(res => {
      if (res.code == '100') {
        if (res.data.length > 0) {
          let data = res.data;
          this.customerAvrageTable = [];
          let item = data.filter((v, i, a) => a.findIndex(v2 => ['sub_org_name', 'import_local_flag'].every(k => v2[k] === v[k])) === i)
          item.map((element) => {
            if (element) {
              element.quantity_import = 0;
              element.quantity_local = 0;
              element.quantity = Number(element.quantity);
              if (element.import_local_flag == 1) {
                element.quantity_import = element.quantity;
              }
              if (element.import_local_flag == 2) {
                element.quantity_local = element.quantity;
              }
              this.customerAvrageTable.push(element);
            }
            return element;
          })
          this.pushDropdown(this.customerAvrageTable);
          this.footerTotal(this.customerAvrageTable);
        }
      }
      this.isLoading = false;
      this.table.reset();
    });
  }
  getCols() {
    this.cols = [
      { field: "sub_org_name", header: "Company Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "quantity_import", header: "Import QTY", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
      { field: "quantity_local", header: "Local QTY", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
      { field: "quantity", header: "QTY", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
      { field: "average_rate", header: "Average Rate", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "state", header: "State", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "name", header: "Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "email", header: "Email", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
      { field: "number", header: "Number", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
    ];
    this.filter = ['sub_org_name', 'quantity', 'nb_average_rate'];
    this.getData();
  }
  pushDropdown(arg) {
    let data = null;
    if (arg) {
      data = arg;
    } else {
      data = this.customerAvrageTable;
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
      data = this.customerAvrageTable;
    }
    let filter_cols = this.cols.filter(col => col.footer == true);
    filter_cols.forEach(element => {
      if (data.length > 0) {
        let total = data.map(item =>
          item[element.field]
        ).reduce((sum, item) => sum + item);
        element.total = (element.type == "Quantity") ? roundQuantity(total) : total;
      }
    });
  }
  customFilter(value, col, data) {
    let res = this.table.filter(value, col, data);
    // this.pushDropdown(this.data);
    this.footerTotal(this.customerAvrageTable);
  }
  onFilter(e, dt) {
    // this.pushDropdown(dt.filteredValue);
    this.footerTotal(dt.filteredValue);
  }
  onAction(item, type) {
    if (type == 'View') {
    }
    if (type == 'Status') {
      let status = (item.discount_status == 0) ? 1 : 0;
      let body = {
        data: {
          discount_status: status
        },
        id: item.id
      };
      this.crudServices.updateData<any>(SalesReportsNew.updateDiscountStatus, body).subscribe((res) => {
        this.toasterService.pop('success', 'Success', 'Discount Status Updated Successfully');
        this.getCols();
      });
    }
  }
  closeModal() {
    this.getCols();
  }
  exportData(type) {
    let fileName = this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
    let exportData = [];
    for (let i = 0; i < this.customerAvrageTable.length; i++) {
      let obj = {};
      for (let j = 0; j < this.cols.length; j++) {
        if (this.cols[j]["field"] != "action") {
          if (this.cols[j]["field"] == "quantity") {
            obj[this.cols[j]["header"]] = this.customerAvrageTable[i][this.cols[j]["field"]] + " MT";
          } else {
            obj[this.cols[j]["header"]] = this.customerAvrageTable[i][this.cols[j]["field"]];
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
  processCustomerAvrageTable(data) {
    this.customerAvrageTable = [];
    data.map((element) => {
      if (element) {
        element.quantity_import = 0;
        element.quantity_local = 0;
        if (element.import_local_flag == 1) {
          element.quantity_import = element.quantity;
        }
        if (element.import_local_flag == 2) {
          element.quantity_local = element.quantity;
        }
        this.customerAvrageTable.push(element);
      }
      return element;
    })
  }
}