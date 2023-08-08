import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { dumpYardReports } from '../../../shared/apis-path/apis-path';
import { staticValues } from '../../../shared/common-service/common-service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExportService } from '../../../shared/export-service/export-service';

@Component({
  selector: 'app-hedged-unhedged-summary',
  templateUrl: './hedged-unhedged-summary.component.html',
  styleUrls: ['./hedged-unhedged-summary.component.scss'],
  providers: [
    ExportService,
    ToasterService,
    CrudServices
  ]
})
export class HedgedUnhedgedSummaryComponent implements OnInit {

  isZoneTable: boolean = true;
  zoneTable: any = [];
  datePickerConfig: any = staticValues.datePickerConfigNew;

  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  currentYear: number;
  date = new Date();
  selected_date_range: Date[];
  bankWiseData = [];
  checkBankData = [];
  export_data: any;
  totalBookedAmount = 0;
  totalHedgedAmount = 0;
  totalRemaining = 0;
  exportColumns: any;

  constructor(private CrudServices: CrudServices, private datepipe: DatePipe, private exportService: ExportService) { }

  ngOnInit() {
    this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
    this.selected_date_range = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
    this.getReportData();
  }

  getReportData() {
    this.CrudServices.postRequest<any>(dumpYardReports.getHedgedUnhedgedSummary, {
      startDate: this.convert(this.selected_date_range[0]),
      endDate: this.convert(this.selected_date_range[1]),
    }).subscribe((response) => {
      this.bankWiseData = response.data;
      this.checkBankData = response.data;
      this.totalCalculation();
    })
  }

  totalCalculation() {
    this.totalBookedAmount = 0;
    this.totalHedgedAmount = 0;
    this.totalRemaining = 0;
    for (const val of this.checkBankData) {
      this.totalBookedAmount = this.totalBookedAmount + Number(val.total_booked_amount);
      this.totalHedgedAmount = this.totalHedgedAmount + Number(val.total_hedged_amount);
    }
    this.totalRemaining = this.totalBookedAmount - this.totalHedgedAmount;

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

  getSumOf(arraySource, field) {
    return arraySource.reduce(function (x, y) { return x + Number(y[field]); }, 0);
  }

  switchView(view) {
    if (view == 'ZONE') { this.isZoneTable = !this.isZoneTable; }
  }

  // Bank Filter
  onBankFilter(event, dt) {
    this.checkBankData = event.filteredValue;
    this.totalCalculation();
  }


  // Bank Data Export
  exportBankData() {
    let data = {};
    this.export_data = [];
    let total_booked_amount = 0;
    let total_hedged_amount = 0;
    let total_remaining = 0;

    for (const val of this.checkBankData) {
      data = {
        'Bank Name': val.bank_name,
        'Total Booked Amount': val.total_booked_amount,
        'Total Hedged Amount': val.total_hedged_amount,
        'Total Remaining': val.total_booked_amount - val.total_hedged_amount,
      };
      this.export_data.push(data);
      total_booked_amount = total_booked_amount + Number(val.total_booked_amount);
      total_hedged_amount = total_hedged_amount + Number(val.total_hedged_amount);
    }

    total_remaining = total_booked_amount - total_hedged_amount
    const foot = {
      'Bank Name': '',
      'Total Booked Amount': total_booked_amount,
      'Total Hedged Amount': total_hedged_amount,
      'Total Remaining': total_remaining,
    };
    this.export_data.push(foot);
  }

  // Bank Export Excel
  exportBankExcel() {
    this.export_data = [];
    this.exportBankData();
    this.exportService.exportExcel(this.export_data, 'Hedged Unhedged Summary Bank Wise');
  }

  // Bank Export PDF
  exportBankPdf() {
    this.export_data = [];
    this.exportBankData();
    this.exportColumns = [
      { title: 'Bank Name', dataKey: 'Bank Name' },
      { title: 'Total Booked Amount', dataKey: 'Total Booked Amount' },
      { title: 'Total Hedged Amount', dataKey: 'Total Hedged Amount' },
      { title: 'Total Remaining', dataKey: 'Total Remaining' },
    ];
    this.exportService.exportPdf(this.exportColumns, this.export_data, 'Hedged Unhedged Summary Bank Wise');
  }

  getData() {
    this.getReportData();
  }
}
