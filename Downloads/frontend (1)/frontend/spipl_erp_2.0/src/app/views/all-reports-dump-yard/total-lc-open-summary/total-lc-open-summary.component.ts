import { Component, OnInit } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExportService } from '../../../shared/export-service/export-service';
import { dumpYardReports } from '../../../shared/apis-path/apis-path';
import { DatePipe } from '@angular/common';
import { staticValues } from '../../../shared/common-service/common-service';

@Component({
  selector: 'app-total-lc-open-summary',
  templateUrl: './total-lc-open-summary.component.html',
  styleUrls: ['./total-lc-open-summary.component.scss'],
  providers: [
    ExportService,
    ToasterService,
    CrudServices
  ]
})
export class TotalLcOpenSummaryComponent implements OnInit {

  currentYear: number;
  date = new Date();
  selected_date_range: Date[];
  bankWiseData = [];
  totalAmountBank = 0;
  totalLcCountBank = 0;

  supplierWiseData = [];
  totalAmountSupplier = 0;
  totalLcCountSupplier = 0;

  checkSupplierData = [];
  checkBankData = [];
  mergerData: [];
  export_data: any;
  exportColumns: any;

  datePickerConfig: any = staticValues.datePickerConfigNew;

  public toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
  });

  constructor(private CrudServices: CrudServices, private datepipe: DatePipe, private exportService: ExportService) { }

  ngOnInit() {
    this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
    this.selected_date_range = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
    this.getReportData();
  }

  totalCalculation() {
    this.totalAmountBank = 0;
    this.totalLcCountBank = 0;
    this.totalAmountSupplier = 0;
    this.totalLcCountSupplier = 0;
    for (const val of this.checkBankData) {
      this.totalAmountBank = this.totalAmountBank + Number(val.total_lc_amount);
      this.totalLcCountBank = this.totalLcCountBank + Number(val.total_lc_count);
    }

    for (const val of this.checkSupplierData) {
      this.totalAmountSupplier = this.totalAmountSupplier + Number(val.total_lc_amount);
      this.totalLcCountSupplier = this.totalLcCountSupplier + Number(val.total_lc_count);
    }

  }

  getReportData() {
    this.CrudServices.postRequest<any>(dumpYardReports.getLcOpenSummaryData, {
      startDate: this.convert(this.selected_date_range[0]),
      endDate: this.convert(this.selected_date_range[1]),
    }).subscribe((response) => {
      this.bankWiseData = response.data[0];
      this.checkBankData = response.data[0];
      this.supplierWiseData = response.data[1];
      this.checkSupplierData = response.data[1];
      this.totalCalculation();
    })
  }

  convert(str) {
    if (str) {
      const date = new Date(str),
        mnth = ('0' + (date.getMonth() + 1)).slice(-2),
        day = ('0' + date.getDate()).slice(-2);
      return [date.getFullYear(), mnth, day].join('-');
    } else {
      return '';
    }
  }

  // Bank Data Export
  exportBankData() {
    let data = {};
    this.export_data = [];
    let qty = 0;
    let rate = 0;
    let amount = 0;

    for (const val of this.checkBankData) {
      data = {
        'Bank Name': val.bank_name,
        'Total LC Amount': val.total_lc_amount,
        'Total LC Count': val.total_lc_count,
      };
      this.export_data.push(data);
      qty = qty + Number(val.total_lc_amount);
      amount = amount + Number(val.total_lc_count);
    }

    const foot = {
      'Bank Name': '',
      'Total LC Amount': qty,
      'Total LC Count': amount,
    };
    this.export_data.push(foot);
  }

  // Bank Export Excel
  exportBankExcel() {
    this.export_data = [];
    this.exportBankData();
    this.exportService.exportExcel(this.export_data, 'LC Open Summary List Bank Wise');
  }

  // Bank Export PDF
  exportBankPdf() {
    this.export_data = [];
    this.exportBankData();
    this.exportColumns = [
      { title: 'Bank Name', dataKey: 'Bank Name' },
      { title: 'Total LC Amount', dataKey: 'Total LC Amount' },
      { title: 'Total LC Count', dataKey: 'Total LC Count' },
    ];
    this.exportService.exportPdf(this.exportColumns, this.export_data, 'LC Open Summary List Bank Wise');
  }

  // Bank Filter
  onBankFilter(event, dt) {
    this.checkBankData = event.filteredValue;
    this.totalCalculation();
  }


  // Supplier Data Export
  exportSupplierData() {
    let data = {};
    this.export_data = [];
    let qty = 0;
    let rate = 0;
    let amount = 0;

    for (const val of this.checkSupplierData) {
      data = {
        'Supplier Name': val.sub_org_name,
        'Total LC Amount': val.total_lc_amount,
        'Total LC Count': val.total_lc_count,
      };
      this.export_data.push(data);
      qty = qty + Number(val.total_lc_amount);
      amount = amount + Number(val.total_lc_count);
    }

    const foot = {
      'Supplier Name': '',
      'Total LC Amount': qty,
      'Total LC Count': amount,
    };
    this.export_data.push(foot);
  }

  // Supplier Export Excel
  exportSupplierExcel() {
    this.export_data = [];
    this.exportSupplierData();
    this.exportService.exportExcel(this.export_data, 'LC Open Summary List Supplier Wise');
  }

  // Supplier Export PDF
  exportSupplierPdf() {
    this.export_data = [];
    this.exportSupplierData();
    this.exportColumns = [
      { title: 'Supplier Name', dataKey: 'Supplier Name' },
      { title: 'Total LC Amount', dataKey: 'Total LC Amount' },
      { title: 'Total LC Count', dataKey: 'Total LC Count' },
    ];
    this.exportService.exportPdf(this.exportColumns, this.export_data, 'LC Open Summary List Supplier Wise');
  }

  // Supplier Filter
  onSupplierFilter(event, dt) {
    this.checkSupplierData = event.filteredValue;
    this.totalCalculation();
  }

  getData() {
    this.getReportData();
  }

}
