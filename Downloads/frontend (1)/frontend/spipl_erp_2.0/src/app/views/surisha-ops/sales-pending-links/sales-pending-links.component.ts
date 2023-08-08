import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from 'moment';
import { EmailTemplateMaster, SurishaSalePurchase } from '../../../shared/apis-path/apis-path';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { staticValues } from '../../../shared/common-service/common-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sales-pending-links',
  templateUrl: './sales-pending-links.component.html',
  styleUrls: ['./sales-pending-links.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ExportService, ToasterService, LoginService, CrudServices, DatePipe]
})
export class SalesPendingLinksComponent implements OnInit {

  @ViewChild("dt", { static: false }) table: Table;
  selected_date_range: any = [];
  selected_status = 0;
  minDate: any = new Date();
  maxDate: any = new Date();

  toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
  });

  page_title: any = "Sales Pending Links"
  date = new Date();
  currentYear: number;

  user: UserDetails;
  isRange: any;
  links: string[] = [];
  cols: any = [];
  data: any = [];
  isLoading: boolean;
  filter: string[];
  constructor(private loginService: LoginService,
    private exportService: ExportService,
    private crudServices: CrudServices,
    private toasterService: ToasterService,
    private router: Router,
    public datepipe: DatePipe) {
    this.user = this.loginService.getUserDetails();

    this.links = this.user.links;

    this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
    if (this.datepipe.transform(this.date, 'MM') > '03') {
      this.selected_date_range = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
    } else {
      this.selected_date_range = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
    }
  }

  ngOnInit() {
    this.getCols()
  }

  getCols() {
    this.cols = [
      { field: "so_no", header: "Order ID", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
      { field: "buyer", header: "Customer", sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null },
      { field: "grade_name", header: "Grade", sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null },
      { field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
      { field: "so_link_bal_qty", header: "Link Balance Qty", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
      { field: "booking_date", header: "Booking Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
      { field: "godown_name", header: "Godown", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "addedby", header: "Zone", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "received_amount", header: "Advance Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "balance_amount", header: "Balance Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
      { field: "total_amount", header: "Total Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },


    ];
    this.filter = ['buyer', 'grade_name', 'godown_name', 'so_no', 'addedby'];

    this.getData()
  }

  getData() {
    this.data = [];
    this.isLoading = true;
    this.crudServices.getOne<any>(SurishaSalePurchase.surishaSalesPendingLink, {
      from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
      to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
      status: this.selected_status

    }).subscribe(res => {
      this.isLoading = false;
      if (res.code == '100') {

        this.data = res.data;

        this.pushDropdown(this.data);
        this.footerTotal(this.data);
      }
    });
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

  footerTotal(arg) {
    let data = null;
    if (arg) {
      data = arg;
    } else {
      data = this.data;
    }
    if (data.length > 0) {
      let filter_cols = this.cols.filter(col => col.footer == true);
      filter_cols.forEach(element => {
        let total = data.map(item =>
          item[element.field]
        ).reduce((sum, item) => sum + item);
        element.total = total;
      });
    }
  }

  customFilter(value, col, data) {
    let res = this.table.filter(value, col, data);
    // this.pushDropdown(this.data);
    this.footerTotal(this.data);
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
            obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]] + " MT";
          } if (this.cols[j]["field"] == "status") {
            obj[this.cols[j]["header"]] = this.convertToPlain(final_data[i][this.cols[j]["field"]]);
          }
          else {
            obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]];
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
        } else if (this.cols[j]["field"] == "total_amount" ||
          this.cols[j]["field"] == "received_amount" || this.cols[j]["field"] == "balance_amount") {
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

  convertToPlain(html) {

    // Create a new div element
    var tempDivElement = document.createElement("div");

    // Set the HTML content with the given value
    tempDivElement.innerHTML = html;

    // Retrieve the text property of the element 
    return tempDivElement.textContent || tempDivElement.innerText || "";
  }

  link() {
    this.router.navigate(['surisha-ops/purchase-sales-linking'])
  }

  onFilter(e, dt) {
    this.footerTotal(dt.filteredValue);
  }

}
