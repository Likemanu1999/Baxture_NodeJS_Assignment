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
  selector: 'app-customer-sales-report',
  templateUrl: './customer-sales-report.component.html',
  styleUrls: ['./customer-sales-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ExportService, ToasterService, LoginService, CrudServices, DatePipe
  ],
})
export class CustomerSalesReportComponent implements OnInit {
  @ViewChild("dt", { static: false }) table: Table;
  @ViewChild('sendEmailModal', { static: false }) public sendEmailModal: ModalDirective;
  toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
  });

  date = new Date();
  isRange: any;
  currentYear: number;
  selected_date_range: any = [];
  page_title: any = "Customer Sales Report"
  user: UserDetails;
  links: string[] = [];
  cols: any = [];
  cols2: any = [];
  data: any = [];
  data2: any = [];
  isLoading: boolean;
  filter: string[];
  showDeails: boolean;
  toEmailArr = []
  emailSubject: any;
  emailFooterTemplete: any;
  emailBodyTemplete: any;
  isLoadingmsg: boolean;
  htmlText: any;
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

      { field: "buyer", header: "Customer", sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null },
      { field: "total_deals", header: "Total Orders", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
      { field: "quantity", header: "Total Quantity (MT)", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
      { field: "dispatch_pending_qty", header: "Total Dispatch Pending Qty (MT)", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
      { field: "total_amount", header: "Total Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "received_amount", header: "Total Amount Received", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "balance_amount", header: "Toatl Amount Balance", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },




    ];



    this.cols2 = [

      { field: "buyer", header: "Customer Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "so_no", header: "SO NO", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "grade_name", header: "Grade", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },

      { field: "port_name", header: "Port", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "quantity", header: "Order Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
      { field: "pending_dispatch_qty", header: "Dispatch Pending Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
      { field: "total_amount", header: "Total Amount ", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "received_amount", header: "Total Amount Received", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "balance_amount", header: "Total Amount Balance", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "eta", header: "ETA", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Date" },




    ];
    this.filter = ['buyer'];

    this.getData()
  }

  getData() {
    this.data = [];
    this.isLoading = true;
    this.crudServices.getOne<any>(SurishaSalePurchase.surishaCustomerSales, {
      from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
      to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),


    }).subscribe(res => {
      this.isLoading = false;
      if (res.code == '100') {

        this.data = res.data;

        this.pushDropdown(this.data);
        this.footerTotal(this.data, this.cols);
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
  receiveDate(dateValue: any) {
    this.isRange = dateValue.range
    this.selected_date_range = dateValue.range;

  }

  footerTotal(arg, cols) {
    let data = arg;
    // if (arg) {
    //   data = arg;
    // } else {
    //   data = this.data;
    // }


    if (data.length > 0) {
      let filter_cols = cols.filter(col => col.footer == true);
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
    this.footerTotal(this.data, this.cols);
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

  onFilter(e, dt) {
    if (dt.filteredValue != null) {
      this.footerTotal(dt.filteredValue, this.cols);
    } else {
      this.footerTotal(this.data, this.cols);
    }

  }

  getDeals(item) {
    this.showDeails = true
    let id = item.deal_id.toString();
    this.data2 = [];

    this.crudServices.getOne<any>(SurishaSalePurchase.surishaCustomerSalesOrder, {
      deal_id: id
    }).subscribe(res => {
      if (res.code == '100') {
        this.data2 = res.data;
        this.footerTotal(this.data2, this.cols2);


      }
    });
  }

  onBack() {
    this.showDeails = false;
  }



  sendModal(item) {

    let id = item.deal_id.toString();

    this.crudServices.getOne<any>(SurishaSalePurchase.surishaCustomerSalesOrder, {
      deal_id: id
    }).subscribe(res => {
      if (res.data.length) {
        this.toEmailArr = res.data[0].temp_email.split(',')
        let html = '<table id="table"><tr><th>Sr.No</th><th>Customer Name</th><th>SO No.</th><th>Grade</th><th>Port</th><th>Order Quantity</th><th>Dispatch Pending Qty</th><th>Total Amount</th><th>Total Amount Received</th><th> Total Amount Balance</th><th> ETA</th><th> So Copy</th></tr>';
        for (let i = 0; i < res.data.length; i++) {


          html = html + '<tr>';
          html += `
             <td>${i + 1}</td>
             <td>${res.data[i].buyer}</td>
             <td>${res.data[i].so_no}</td>
             <td>${res.data[i].grade_name}</td>
             <td>${res.data[i].port_name}</td>
             <td>${res.data[i].quantity}</td>
             <td>${res.data[i].pending_dispatch_qty}</td>
             <td>${res.data[i].total_amount}</td>
             <td>${res.data[i].received_amount}</td>
             <td>${res.data[i].balance_amount}</td>
             <td>${res.data[i].eta != null ? moment(res.data[i].eta).format('DD-MM-YYYY') : 'NA'}</td>
             <td><a href = '${res.data[i].so_copy}' target='_blank'><img src='https://spipl-release.s3.amazonaws.com/employee_document_2/1679918377924-download.png' height='15' width='15' style='color:blue'></a></td>
             
             `;
          html = html + '</tr>';
        }

        html = html + '</table>';


        let obj = {
          TABLE: html
        }
        this.getEmailTemplate('Surisha All Order Status', obj)
        this.sendEmailModal.show();


      }

    });

  }

  async getEmailTemplate(name, obj) {
    this.emailSubject = undefined;
    this.emailFooterTemplete = undefined;
    this.emailBodyTemplete = undefined;
    let headerRed = this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: name });
    let footer_req = this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Surisha Footer' });
    await forkJoin([headerRed, footer_req]).subscribe(response => {
      if (response[0].length > 0) {
        this.emailBodyTemplete = response[0][0].custom_html;
        this.emailSubject = response[0][0].subject;

        const DATE = /{DATE}/gi;
        this.emailSubject = this.emailSubject.replace(DATE, moment().format('DD-MM-YYYY'));

        for (const key in obj) {
          this.emailBodyTemplete = this.emailBodyTemplete.replace(new RegExp('{' + key + '}', 'g'), obj[key]);
        }
        this.htmlText = this.emailBodyTemplete
      }


      if (response[1].length > 0) {
        this.emailFooterTemplete = response[1][0].custom_html;

        this.emailBodyTemplete = this.emailBodyTemplete + this.emailFooterTemplete

      }
    })
  }

  sendMail() {
    let emailBody = {

      tomail: this.toEmailArr,
      subject: this.emailSubject,
      bodytext: this.emailBodyTemplete,

    }

    this.isLoadingmsg = true;
    this.crudServices.postRequest<any>(SurishaSalePurchase.sendAllOrderMail, emailBody).subscribe((response) => {
      this.isLoadingmsg = false;
      this.onClose();
      this.toasterService.pop('success', 'Mail Sent', ' MAIL SEND SUCCESS!')


    });
  }

  onClose() {
    this.toEmailArr = [];
    this.sendEmailModal.hide();
  }

}
