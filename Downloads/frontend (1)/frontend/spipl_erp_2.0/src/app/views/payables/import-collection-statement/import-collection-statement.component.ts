

import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { ExportService } from '../../../shared/export-service/export-service';
import { Table } from 'primeng/table';
import { UserDetails } from '../../login/UserDetails.model';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { Payables } from '../../../shared/apis-path/apis-path';
import { ModalDirective } from 'ngx-bootstrap';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { forkJoin } from 'rxjs';
import { InrCurrencyPipe } from '../../../shared/currency/currency.pipe';

@Component({
  selector: 'app-import-collection-statement',
  templateUrl: './import-collection-statement.component.html',
  styleUrls: ['./import-collection-statement.component.scss'],
  providers: [DatePipe, ExportService, PermissionService, LoginService, CrudServices, ToasterService, InrCurrencyPipe],
  encapsulation: ViewEncapsulation.None
})
export class ImportCollectionStatementComponent implements OnInit {
  @ViewChild('dt2', { static: false }) table: Table;
  user: UserDetails;
  links: string[] = [];
  data = [];
  cols: { field: string; header: string; style: string; filter: boolean; dropdown: any[] }[];
  isLoading: boolean = false;
  isLoading2: boolean = false;
  totalAmt: number;
  bsRangeValue: Date[] = [new Date('2023-07-17'), new Date()];
  from_date: string;
  to_date: string;
  filteredValuess = [];
  filteredValuess2 = [];
  totalAmtImport: number;
  company_filter: boolean;
  company: { label: string; id: number; }[];
  company_id: any;
  totalDebit: number;
  totalCredit: number;
  filter: string[];
  constructor(private datePipe: DatePipe,
    private exportService: ExportService,
    private permissionService: PermissionService,
    private crudServices: CrudServices,
    private toasterService: ToasterService,
    private loginService: LoginService, private currencyInr: InrCurrencyPipe) {
    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;
    this.company_filter = (this.links.indexOf('Collection Company Filter(IM)') > -1);

    this.company = [{ label: 'PVC', id: 1 }, { label: 'PE & PP', id: 2 }, { label: 'SURISHA', id: 3 }];

    this.company_id = this.user.userDet[0].company_id;

    this.cols = [
      { field: 'date', header: 'Date', style: '100px', filter: false, dropdown: [] },
      { field: 'amount', header: 'Amount', style: '100px', filter: false, dropdown: [] },
      { field: 'type', header: 'Credit', style: '100px', filter: false, dropdown: [] },
      { field: 'type', header: 'Debit', style: '100px', filter: false, dropdown: [] },
      { field: 'opening_balance', header: 'Opening Balance', style: '100px', filter: false, dropdown: [] },
      { field: 'customer', header: 'Customer', style: '100px', filter: true, dropdown: [] },
      { field: 'virtual_id', header: 'Virtual Id', style: '100px', filter: true, dropdown: [] },
      { field: 'bank_name', header: 'Bank Name', style: '100px', filter: true, dropdown: [] },
      { field: 'utr_no', header: 'UTR No', style: '100px', filter: true, dropdown: [] },

    ];
    this.from_date = this.datePipe.transform(new Date('2023-07-17'), 'yyyy/MM/dd');
    this.to_date = this.datePipe.transform(new Date(), 'yyyy/MM/dd');

    // this.bsRangeValue = [new Date('2023-07-17'), new Date()];
    this.filter = ['customer', 'virtual_id', 'bank_name', 'utr_no'];
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



  ngOnInit() {
    // this.getImportData();
    //this.getLocalData();
  }

  onSelect(event, val) {
    if (event && event != null && val == 1) {
      this.from_date = this.datePipe.transform(event[0], 'yyyy/MM/dd');
      this.to_date = this.datePipe.transform(event[1], 'yyyy/MM/dd');
    }

    if (event == null && val == 1) {
      this.from_date = '';
      this.to_date = '';
    }

    this.getImportData();
  }




  getImportData() {
    let spipl_bank_id: any;
    if (this.company_id == 1) {
      spipl_bank_id = [4, 27]
    } else if (this.company_id == 2) {
      spipl_bank_id = 26
    }
    let creditAmt = 0;

    let res1 = this.crudServices.getOne<any>(Payables.getMiddelwarePayments, { from_date: this.from_date, to_date: this.to_date, import_local_flag: 1, company_id: this.company_id });
    let res2 = this.crudServices.getOne<any>(Payables.getCentralPayableLocal, { from_date: this.from_date, to_date: this.to_date, spipl_bank_id: spipl_bank_id, company_id: this.company_id });
    let res3 = this.crudServices.getOne<any>(Payables.getForwardSalesPayments, { from_date: this.from_date, to_date: this.to_date, spipl_bank_id: spipl_bank_id, company_id: this.company_id, import_local_flag: 1 });

    // let res3 = this.crudServices.getOne<any>(Payables.getLCPayments, { from_date: this.from_date, to_date: this.to_date, spipl_bank_id: spipl_bank_id, company_id: this.company_id, import_local_flag : 1 });

    this.isLoading2 = true;
    forkJoin([res1, res2, res3]).subscribe(([data1, data2, data3]) => {
      this.isLoading2 = false;

      if (data1.length) { data1.map(item => item.type = "Credit"); }
      if (data2.length) { data2.map(item => item.type = "Debit"); }
      // data1.map(item => item.type = "Credit")
      // data2.map(item => item.type = "Debit")
      // data3.map(item => item.utr_no = "LC Payment- "+ item.utr_no)

      if (data3.length) {
        data3.map(item => {
          if (item.advanceamount > 0 || item.balanceamount > 0) {
            item.type = "Credit";
            item.amount = item.advanceamount ? item.advanceamount : item.balanceamount
            item.utr_no = item.company + " Forward -" + (item.invoice_no ? (' Invoice- ' + item.invoice_no) : (' Order- ' + item.so_id));
          } else {
            item.type = "Credit";
            item.amount = 0
            item.utr_no = item.company + " Forward -" + (item.invoice_no ? (' Invoice- ' + item.invoice_no) : ('Sales Order- ' + item.so_id));
          }
        });
      }

      data3 = data3.filter(i => i.amount > 0)
      let result = [];
      if (data1.length) {
        result = [...result, ...data1];
      }
      if (data2.length > 0) {
        result = [...result, ...data2];
      }
      if (data3.length > 0) {
        result = [...result, ...data3];
      }

      this.data = result.sort((a, b) => a.date < b.date ? 1 : -1);
      this.data.map(result => {
        if (result.type == 'Credit' && result.amount > 0) {
          creditAmt += result.amount
        } else {
          creditAmt = (creditAmt - result.amount)
        }
        result.opening_balance = creditAmt
        return result
      })
      this.filteredValuess2 = this.data;
      this.pushDropdown(this.data);
      this.calculateAmountImport(this.data);
    });

  }


  customFilter(value, col, data) {
    let res = this.table.filter(value, col, data);
  }

  calculateAmountImport(data) {
    this.totalAmtImport = 0
    this.totalCredit = 0;
    this.totalDebit = 0;
    for (let item of data) {
      if (item.type == "Credit" && item.amount > 0) {
        this.totalAmtImport = this.totalAmtImport + item.amount
        this.totalCredit += item.amount
      } else if (item.type == "Debit" && item.amount > 0) {
        this.totalAmtImport = this.totalAmtImport - item.amount
        this.totalDebit += item.amount
      }
    }

  }


  onFilter2(event, dt) {
    console.log(event)

    this.filteredValuess2 = [];

    this.filteredValuess2 = event.filteredValue;

    // this.calculateAmountImport(this.filteredValuess2)




  }



  // download doc ,pdf , excel







  exportPdfImport() {
    let arr = [];
    const foot = {};
    let export_purchase_list = []

    if (this.filteredValuess2 !== undefined && this.filteredValuess2.length > 0) {
      arr = this.filteredValuess2;
    } else {
      arr = this.data
    }

    for (let i = 0; i < arr.length; i++) {
      const export_data = {};
      for (let j = 0; j < this.cols.length; j++) {
        if (this.cols[j]['header'] == "Date") {
          export_data[this.cols[j]['header']] = this.datePipe.transform(arr[i][this.cols[j]['field']], 'dd-MM-yyyy hh:mm:yyyy');
        } else if (this.cols[j]['header'] == "Amount") {
          export_data[this.cols[j]['header']] = this.currencyInr.transform(arr[i][this.cols[j]['field']]);
        } else if (this.cols[j]['header'] == "Credit") {
          if (arr[i][this.cols[j]['field']] == 'Credit') {
            export_data[this.cols[j]['header']] = arr[i][this.cols[j]['field']];
          }

        } else if (this.cols[j]['header'] == "Debit") {
          if (arr[i][this.cols[j]['field']] == 'Debit') {
            export_data[this.cols[j]['header']] = arr[i][this.cols[j]['field']];
          }

        }
        else {
          export_data[this.cols[j]['header']] = arr[i][this.cols[j]['field']];
        }

      }
      export_purchase_list.push(export_data);


    }


    for (let j = 0; j < this.cols.length; j++) {
      if (this.cols[j]['field'] === 'amount') {
        foot[this.cols[j]['header']] = this.currencyInr.transform(this.totalAmtImport);

      }
    }

    export_purchase_list.push(foot)




    let exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.header }));
    this.exportService.exportPdf(exportColumns, export_purchase_list, `Import-Collection-statement (${this.datePipe.transform(this.from_date, 'dd/MM/yyyy')} - ${this.datePipe.transform(this.to_date, 'dd/MM/yyyy')})`);
  }

  exportExcelImport() {
    let arr = [];
    const foot = {};
    let export_purchase_list = []

    if (this.filteredValuess2 !== undefined && this.filteredValuess2.length > 0) {
      arr = this.filteredValuess2;
    } else {
      arr = this.data
    }

    for (let i = 0; i < arr.length; i++) {
      const export_data = {};
      for (let j = 0; j < this.cols.length; j++) {

        if (this.cols[j]['header'] == "Date") {
          export_data[this.cols[j]['header']] = this.datePipe.transform(arr[i][this.cols[j]['field']], 'dd-MM-yyyy hh:mm:yyyy');
        } else if (this.cols[j]['header'] == "Amount") {
          export_data[this.cols[j]['header']] = this.currencyInr.transform(arr[i][this.cols[j]['field']]);
        } else if (this.cols[j]['header'] == "Credit") {
          if (arr[i][this.cols[j]['field']] == 'Credit') {
            export_data[this.cols[j]['header']] = arr[i][this.cols[j]['field']];
          }

        } else if (this.cols[j]['header'] == "Debit") {
          if (arr[i][this.cols[j]['field']] == 'Debit') {
            export_data[this.cols[j]['header']] = arr[i][this.cols[j]['field']];
          }

        }
        else {
          export_data[this.cols[j]['header']] = arr[i][this.cols[j]['field']];
        }

      }
      export_purchase_list.push(export_data);


    }


    for (let j = 0; j < this.cols.length; j++) {
      if (this.cols[j]['field'] === 'amount') {
        foot[this.cols[j]['header']] = this.currencyInr.transform(this.totalAmtImport);

      }
    }

    export_purchase_list.push(foot)

    this.exportService.exportExcel(export_purchase_list, `Import-Collection-statement (${this.datePipe.transform(this.from_date, 'dd/MM/yyyy')} - ${this.datePipe.transform(this.to_date, 'dd/MM/yyyy')})`);
  }

}
