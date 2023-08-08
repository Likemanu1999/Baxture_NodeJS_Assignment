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
import * as moment from 'moment';
import { staticValues } from '../../../shared/common-service/common-service';

@Component({
  selector: 'app-local-collection-statement',
  templateUrl: './local-collection-statement.component.html',
  styleUrls: ['./local-collection-statement.component.scss'],
  providers: [DatePipe, ExportService, PermissionService, LoginService, CrudServices, ToasterService, InrCurrencyPipe],
  encapsulation: ViewEncapsulation.None
})
export class LocalCollectionStatementComponent implements OnInit {
  @ViewChild('dt', { static: false }) table: Table;
  user: UserDetails;
  links: string[] = [];
  data = [];
  cols: { field: string; header: string; style: string; filter: boolean; dropdown: any[] }[];
  isLoading: boolean = false;
  isLoading2: boolean = false;
  totalAmt: number;
  bsRangeValue: Date[];
  from_date: string;
  to_date: string = moment().format('YYYY-MM-DD');
  filteredValuess = [];
  data2 = [];
  filteredValuess2 = [];
  totalAmtImport: number;
  company: { label: string; id: number; }[];
  company_id: any;
  company_filter: boolean;
  totalDebit: any;
  totalCredit: any;
  filter: string[];
  pvc_local_statement_value: any = staticValues.pvc_local_statement_temp_value;
  local_statement_set_date_pvc: any = staticValues.local_statement_set_date_pvc;
  local_statement_set_date: any = staticValues.local_statement_set_date;

  constructor(private datePipe: DatePipe,
    private exportService: ExportService,
    private permissionService: PermissionService,
    private crudServices: CrudServices,
    private toasterService: ToasterService,
    private loginService: LoginService, private currencyInr: InrCurrencyPipe) {
    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;
    this.company_filter = (this.links.indexOf('Collection Company Filter') > -1);

    this.cols = [
      { field: 'date', header: 'Date', style: '100px', filter: false, dropdown: [] },
      { field: 'amount', header: 'Amount', style: '100px', filter: false, dropdown: [] },
      { field: 'type', header: 'Credit', style: '100px', filter: false, dropdown: [] },
      { field: 'type', header: 'Debit', style: '100px', filter: false, dropdown: [] },
      { field: 'closing_balance', header: 'Closing Balance', style: '100px', filter: false, dropdown: [] },
      { field: 'customer', header: 'Customer', style: '100px', filter: true, dropdown: [] },
      { field: 'virtual_id', header: 'Virtual Id', style: '100px', filter: true, dropdown: [] },
      { field: 'bank_name', header: 'Bank Name', style: '100px', filter: true, dropdown: [] },
      { field: 'utr_no', header: 'UTR No', style: '100px', filter: true, dropdown: [] }

    ];
    this.filter = ['customer', 'virtual_id', 'bank_name', 'utr_no'];

    this.company = [{ label: 'PVC', id: 1 }, { label: 'PE & PP', id: 2 }, { label: 'SURISHA', id: 3 }];
    this.company_id = this.user.userDet[0].company_id;
    if (this.company_id == 1) {
      this.from_date = moment(this.local_statement_set_date_pvc).format('YYYY-MM-DD')
      this.bsRangeValue = [new Date(this.local_statement_set_date_pvc), new Date()];
    } else {
      this.from_date = moment(this.local_statement_set_date).format('YYYY-MM-DD')
      this.bsRangeValue = [new Date(this.local_statement_set_date), new Date()];
    }
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
    // this.getLocalData();
  }

  onSelect(event, val) {
    if (event && event != null) {
      if (event && event != null) {
        if (val == 1) {
          this.from_date = this.datePipe.transform(event[0], 'yyyy/MM/dd');
          this.to_date = this.datePipe.transform(event[1], 'yyyy/MM/dd');
        } else if (val == 2) {
          this.setDateValues();
        } else {
          this.from_date = '';
          this.to_date = '';
        }
      }
    } else if (event == null && val == 1) {
      this.from_date = '';
      this.to_date = '';
    }
    this.getLocalData();
  }

  setDateValues() {
    if (this.company_id == 1) {
      this.from_date = moment(this.local_statement_set_date_pvc).format('YYYY-MM-DD')
      this.bsRangeValue = [new Date(this.local_statement_set_date_pvc), new Date()];
    } else {
      this.from_date = moment(this.local_statement_set_date).format('YYYY-MM-DD')
      this.bsRangeValue = [new Date(this.local_statement_set_date), new Date()];
    }
  }

  getLocalData() {
    let spipl_bank_id: number;
    if (this.company_id == 1) {
      spipl_bank_id = 24;
    } else if (this.company_id == 2) {
      spipl_bank_id = 19;
    } else if (this.company_id == 3) {
      spipl_bank_id = 28;
    }

    let res1 = this.crudServices.getOne<any>(Payables.getTransferPayments, { from_date: this.from_date, to_date: this.to_date, import_local_flag: 2, company_id: this.company_id });

    let res2 = this.crudServices.getOne<any>(Payables.getCentralPayableLocal, { from_date: this.from_date, to_date: this.to_date, spipl_bank_id: spipl_bank_id, company_id: this.company_id, import_local_flag: 2 });

    let res3 = this.crudServices.getOne<any>(Payables.getSalesDispatchLCPayments, { from_date: this.from_date, to_date: this.to_date, spipl_bank_id: spipl_bank_id, company_id: this.company_id, import_local_flag: 2 });

    let res4 = this.crudServices.getOne<any>(Payables.getForwardSalesPayments, { from_date: this.from_date, to_date: this.to_date, spipl_bank_id: spipl_bank_id, company_id: this.company_id, import_local_flag: 2 });

    this.isLoading = true;

    forkJoin([res1, res2, res3, res4]).subscribe(([data1, data2, data3, data4]) => {
      this.isLoading = false
      if (data1.length) { data1.map(item => item.type = "Credit"); }
      if (data2.length) { data2.map(item => item.type = "Debit"); }
      if (data3.length) {
        data3.map(item => {
          item.type = "Credit", item.date = item.date || item.utility_used_date ||
            item.added_date
        });
        data3.map(item => item.utr_no = "LC Payment- " + item.utr_no)
      }

      if (data4.length) {
        data4.map(item => {
          if (item.advanceamount > 0 || item.balanceamount > 0) {
            item.type = "Credit";
            item.amount = item.advanceamount ? item.advanceamount : item.balanceamount
            item.utr_no = item.company + " Forward -" + (item.invoice_no ? (' Invoice- ' + item.invoice_no) : (' Order- ' + item.so_id));
          } else {
            item.type = "Credit";
            item.amount = 0
            item.utr_no = item.company + " Forward -" + (item.invoice_no ? (' Invoice- ' + item.invoice_no) : (' Order- ' + item.so_id));
          }
        });
      }

      data4 = data4.filter(i => i.amount > 0)
      let results = [];

      if (data1.length) {
        results = [...results, ...data1];
      }
      if (data2.length > 0) {
        results = [...results, ...data2];
      }
      if (data3.length > 0) {
        results = [...results, ...data3];
      }
      if (data4.length > 0) {
        results = [...results, ...data4];
      }

      this.data = results.sort((a, b) => a.date < b.date ? 1 : -1);
      this.filteredValuess = this.calculateClosing(this.data);
      this.pushDropdown(this.data);
      this.calculateAmount(this.data, this.company_id);
    });
  }

  calculateClosing(data) {
    let creditAmt = 0;
    let baseData = data;
    baseData.map(result => {
      if (result.type == 'Credit' && result.amount > 0) {
        creditAmt += result.amount
      } else {
        creditAmt = (creditAmt - result.amount)
      }
      result.closing_balance = creditAmt
      return result
    })
    return baseData
  }
  customFilter(value, col, data) {
    let res = this.table.filter(value, col, data);
    this.calculateAmount(this.data, this.company_id);
  }

  calculateAmount(data, division) {
    if (division == 1) {
      this.totalAmt = - this.pvc_local_statement_value;
    } else {
      this.totalAmt = 0;
    }
    this.totalCredit = 0;
    this.totalDebit = 0;
    for (let item of data) {
      if (item.type == "Credit" && item.amount > 0) {
        this.totalAmt = this.totalAmt + item.amount;
        this.totalCredit += item.amount;
      } else if (item.type == "Debit") {
        this.totalAmt = this.totalAmt - item.amount;
        this.totalDebit += item.amount;
      }
    }
  }

  onFilter(event, dt) {
    this.filteredValuess = [];
    this.filteredValuess = event.filteredValue;
    this.calculateClosing(this.filteredValuess)
  }
  // download doc ,pdf , excel
  sortColumn(event, dt) {
    this.calculateClosing(dt._value)
  }

  exportPdf() {
    let arr = [];
    const foot = {};
    let export_purchase_list = []

    if (this.filteredValuess !== undefined && this.filteredValuess.length > 0) {
      arr = this.filteredValuess;
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
        foot[this.cols[j]['header']] = this.currencyInr.transform(this.totalAmt);

      }
    }

    export_purchase_list.push(foot)




    let exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.header }));
    this.exportService.exportPdf(exportColumns, export_purchase_list, `Local-Collection-statement  (${this.datePipe.transform(this.from_date, 'dd/MM/yyyy')} - ${this.datePipe.transform(this.to_date, 'dd/MM/yyyy')})`);
  }

  exportExcel() {
    let arr = [];
    const foot = {};
    let export_purchase_list = []


    if (this.filteredValuess !== undefined && this.filteredValuess.length > 0) {
      arr = this.filteredValuess;
    } else {
      arr = this.data
    }


    for (let i = 0; i < arr.length; i++) {
      const export_data = {};
      for (let j = 0; j < this.cols.length; j++) {
        if (this.cols[j]['header'] == "Date") {
          export_data[this.cols[j]['header']] = this.datePipe.transform(arr[i]['date'], 'dd-MM-yyyy hh:mm:yyyy') || this.datePipe.transform(arr[i]['added_date'], 'dd-MM-yyyy hh:mm:yyyy') || this.datePipe.transform(arr[i]['utility_used_date'], 'dd-MM-yyyy hh:mm:yyyy');
        } else if (this.cols[j]['header'] == "Amount") {
          export_data[this.cols[j]['header']] = this.currencyInr.transform(arr[i][this.cols[j]['field']]);
        }
        else if (this.cols[j]['header'] == "Credit") {
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
        foot[this.cols[j]['header']] = this.currencyInr.transform(this.totalAmt);

      }
    }

    export_purchase_list.push(foot)

    this.exportService.exportExcel(export_purchase_list, `Local-Collection-statement  (${this.datePipe.transform(this.from_date, 'dd/MM/yyyy')} - ${this.datePipe.transform(this.to_date, 'dd/MM/yyyy')})`);
  }

}
