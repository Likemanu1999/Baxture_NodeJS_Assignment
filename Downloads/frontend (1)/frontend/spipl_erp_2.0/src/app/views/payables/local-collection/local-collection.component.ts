import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { Table } from "primeng/table";
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { SalesReportsNew } from '../../../shared/apis-path/apis-path';
import { staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import * as moment from "moment";
import { map } from 'rxjs/operators';
import { forkJoin, merge } from 'rxjs';

import { ModalDirective } from "ngx-bootstrap";
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-local-collection',
  templateUrl: './local-collection.component.html',
  styleUrls: ['./local-collection.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CrudServices, DatePipe, ToasterService, PermissionService, ExportService]
})
export class LocalCollectionComponent implements OnInit {

  @ViewChild("dt", { static: false }) table: Table;
  @ViewChild("mf", { static: false }) table1: ElementRef;
  @ViewChild("viewPaymentTransferModal", { static: false }) public viewPaymentTransferModal: ModalDirective;
  page_title: any = "Middleware Payment Details";
  user: UserDetails;
  links: string[] = [];
  add_opt: boolean = false;
  edit_opt: boolean = false;
  view_opt: boolean = false;
  del_opt: boolean = false;
  isLoading: boolean = false;
  datePickerConfig: any = staticValues.datePickerConfig;
  selected_date_range: any = [
    new Date(moment().format("YYYY-MM-DD")),
    new Date(moment().format("YYYY-MM-DD"))
  ];
  isRange: any;
  uploadSuccess: EventEmitter<boolean> = new EventEmitter();
  cols: any = [];
  data: any = [];
  filter: any = [];
  paymentTableData: any = [];


  private toasterService: ToasterService;
  public toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 10000
  });



  constructor(
    private loginService: LoginService,
    toasterService: ToasterService,
    private permissionService: PermissionService,
    private crudServices: CrudServices,
    private exportService: ExportService,
    private datePipe: DatePipe,
  ) {
    this.toasterService = toasterService;
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
    this.getCols();
    this.data = [];
    this.isLoading = true;
    let body1 = {
      from_date: this.datePipe.transform(this.selected_date_range[0], 'yyyy/MM/dd'),
      to_date: this.datePipe.transform(this.selected_date_range[1], 'yyyy/MM/dd'),
      company_id: this.user.userDet[0].company_id,
      payment_reverse: 0,
      type: 1,
      import_local_flag: 2
    }
    let body2 = {
      from_date: this.datePipe.transform(this.selected_date_range[0], 'yyyy/MM/dd'),
      to_date: this.datePipe.transform(this.selected_date_range[1], 'yyyy/MM/dd'),
      company_id: this.user.userDet[0].company_id,
      payment_reverse: 1,
      import_local_flag: 1,
      type: 1
    }
    const local_req = this.crudServices.getOne<any>(SalesReportsNew.getMiddlewarePaymentDetails, body1);
    const reverse_payment = this.crudServices.getOne<any>(SalesReportsNew.getMiddlewarePaymentDetails, body2);

    forkJoin([local_req, reverse_payment]).subscribe(response => {
      let data = [...response[0].data, ...response[1].data].map((element) => {
        if (element.type == 1) {
          element.payment_type = 'RECIEVED';
        }
        if (element.type == 1) {
          element.payment_type = 'RECIEVED';
        }
        else if (element.type == 3) {
          element.payment_type = 'DEBIT NOTE';
        }
        else if (element.type == 4) {
          element.payment_type = 'CREDIT NOTE'
        }

        if (element.company_id == 1) {
          element.company_name = 'PVC';
        }
        else if (element.company_id == 2) {
          element.company_name = 'PE & PP';
        }
        else {
          element.company_name = '';
        }
        if (element.import_local_flag == 1) {
          element.import_local_flag_cat = 'Import'
        }
        else if (element.import_local_flag == 2) {
          element.import_local_flag_cat = 'Local'
        }
        else if (element.import_local_flag == 0) {
          element.import_local_flag_cat = 'Suspense / Advance'
        }


        if (element.is_transfered == 1) {
          element.is_transfered_label = 'Transfered';
        }
        else {
          element.is_transfered_label = 'Pending';
        }

        this.isLoading = false
        return element;
      })
      this.isLoading = false
      this.data = data;
      this.pushDropdown();
      this.footerTotal();


    })

  }
  receiveDate(dateValue: any) {
    this.isRange = dateValue.range
    this.selected_date_range = dateValue.range;

  }
  clearDropdown() {
    if (JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
      this.uploadSuccess.emit(false);
  }

  getCols() {
    this.cols = [
      { field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "virtual_acc_no", header: "Virtual Account No.", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "utilised_amount", header: "Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "remark", header: "Remark", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "invoice_number", header: "Invoice No", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "payment_type", header: "Payment Type", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: 'Badge' },
      { field: "added_at", header: "Payment Received Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date_Time" },
      { field: "company_name", header: "Company", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "is_transfered_label", header: "Transfer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "transfered_date", header: "Transfer Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date_Time" },
      { field: "utr_no", header: "UTR NO", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null }
    ];
    this.filter = ['customer', 'virtual_acc_no', 'utr_no', 'company_name', 'payment_type', 'remark', "is_transfered_label"];
  }

  pushDropdown() {
    let filter_cols = this.cols.filter(col => col.filter == true);
    filter_cols.forEach(element => {
      let unique = this.data.map(item =>
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

  footerTotal() {
    let filter_cols = this.cols.filter(col => col.footer == true);
    filter_cols.forEach(element => {
      if (this.data.length > 0) {
        let total = this.data.map(item =>
          item[element.field]
        ).reduce((sum, item) => sum + item);
        element.total = Number(total);
      }

      return element;
    });
  }

  onAction(item, type) {
    if (type == 'View') {
      // 
    }
  }

  customFilter(value, col, data) {
    this.table.filter(value, col, data);
    this.footerTotal();
  }




  getTransferAmount(category) {
    if (this.data.length > 0) {
      let filterData = this.data.filter(item => item.import_local_flag == category && item.is_transfered == 1);
      return filterData.reduce(function (result, item) {
        return result + Number(item.utilised_amount);
      }, 0);
    } else {
      return 0
    }


  }

  getAmount(category) {

    if (this.data.length > 0) {
      let filterData = this.data.filter(item => item.import_local_flag == category);
      return filterData.reduce(function (result, item) {
        return result + Number(item.utilised_amount);
      }, 0);
    }
    else {
      return 0
    }


  }

  onFilter(event, dt) {
    let filter_cols = this.cols.filter(col => col.footer == true);
    filter_cols.forEach(element => {
      if (event.filteredValue.length > 0) {
        let total = event.filteredValue.map(item =>
          item[element.field]
        ).reduce((sum, item) => sum + item);
        element.total = Number(total);
      }
      return element;
    });
  }



  getAllTransferPayment() {
    let body = {
      import_local_flag: 2,
      from_date: this.selected_date_range[0],
      to_date: this.selected_date_range[1],
      company_id: this.user.userDet[0].company_id
    }
    this.crudServices.getOne(SalesReportsNew.getPaymentTransfer, body).subscribe((response) => {
      if (response['data'].length > 0) {
        this.viewPaymentTransferModal.show()
        this.paymentTableData = response['data']
      }
      else {
        this.toasterService.pop('error', 'Data Not Found', 'Data Not Found !')
      }
    });
  }

  getSumOf(arraySource, field) {
    return arraySource.reduce(function (x, y) { return x + Number(y[field]); }, 0);
  }


  exportData(type) {
    let final_data = null;
    if (this.table.filteredValue == null) {
      final_data = this.data;
    } else {
      final_data = this.table.filteredValue;
    }
    let fileName = 'Import Collections' + ' - ' + this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
    let exportData = [];
    for (let i = 0; i < final_data.length; i++) {
      let obj = {};
      for (let j = 0; j < this.cols.length; j++) {
        if (this.cols[j]["field"] != "action") {
          if (this.cols[j]["field"] == "quantity") {
            obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]] + " MT";
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
        if (this.cols[j]["field"] == "quantity") {
          foot[this.cols[j]["header"]] = this.cols[j]["total"] + " MT";
        } else if (this.cols[j]["field"] == "deal_rate" ||
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
