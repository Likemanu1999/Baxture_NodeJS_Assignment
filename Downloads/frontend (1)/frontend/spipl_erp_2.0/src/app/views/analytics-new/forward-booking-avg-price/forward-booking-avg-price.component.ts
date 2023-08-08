import { Component, EventEmitter, OnInit } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExportService } from '../../../shared/export-service/export-service';
import { dumpYardReports } from '../../../shared/apis-path/apis-path';
import { DatePipe } from '@angular/common';
import { staticValues } from '../../../shared/common-service/common-service';

@Component({
  selector: 'app-forward-booking-avg-price',
  templateUrl: './forward-booking-avg-price.component.html',
  styleUrls: ['./forward-booking-avg-price.component.scss'],
  providers: [
    ExportService,
    ToasterService,
    CrudServices
  ]
})
export class ForwardBookingAvgPriceComponent implements OnInit {

  currentYear: number;
  date = new Date();
  selected_date_range: Date[];
  bankWiseData = [];
  totalFrwdAmountBankUsd = 0;
  totalFrwdAmountBankInr = 0;
  totalCancelAmountUsd = 0;
  totalCancelAmountInr = 0;
  totalUtilizedUsd = 0;
  totalUtilizedInr = 0;
  totalForwardCount = 0;

  supplierWiseData = [];
  totalAmountSupplier = 0;
  totalLcCountSupplier = 0;

  checkSupplierData = [];
  checkBankData = [];
  mergerData: [];
  export_data: any;
  exportColumns: any;
  uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	maxDate: any = new Date();
	isRange: any;
  datePickerConfig: any = staticValues.datePickerConfigNew;

  public toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
  });

  constructor(private CrudServices: CrudServices, private datepipe: DatePipe, private exportService: ExportService) { }

  ngOnInit() {

    // this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
    // this.selected_date_range = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

    this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
    if (this.datepipe.transform(this.date, 'MM') > '03') {
      this.selected_date_range = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
    } else {
      this.selected_date_range = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
    }

    this.getReportData();
  }

  totalCalculation() {
    this.totalFrwdAmountBankUsd = 0;
    this.totalFrwdAmountBankInr = 0;
    this.totalCancelAmountUsd = 0;
    this.totalCancelAmountInr = 0;
    this.totalUtilizedUsd = 0;
    this.totalUtilizedInr = 0;
    this.totalForwardCount = 0;
    for (const val of this.checkBankData) {
      this.totalFrwdAmountBankUsd = this.totalFrwdAmountBankUsd + Number(val.total_forward_amount_usd);
      this.totalFrwdAmountBankInr = this.totalFrwdAmountBankInr + Number(val.total_forward_amount_inr);
      this.totalCancelAmountUsd = this.totalCancelAmountUsd + Number(val.total_cancel_amount_usd);
      this.totalCancelAmountInr = this.totalCancelAmountInr + Number(val.total_cancel_amount_inr);
      this.totalUtilizedUsd = this.totalUtilizedUsd + Number(val.total_hedge_amount);
      this.totalUtilizedInr = this.totalUtilizedInr + Number(val.total_hedge_amount_inr);

      this.totalForwardCount = this.totalForwardCount + Number(val.total_forward_count);
    }

  }

  getReportData() {
    this.CrudServices.postRequest<any>(dumpYardReports.getForwardBokkingAvgPrice, {
      startDate: this.convert(this.selected_date_range[0]),
      endDate: this.convert(this.selected_date_range[1]),
    }).subscribe((response) => {
      this.bankWiseData = response.data;
      this.checkBankData = response.data;
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
    let frwd_amt_usd = 0;
    let frwd_amt_inr = 0;
    let cancel_amt_usd = 0;
    let cancel_amt_inr = 0;
    let utilized_amt_usd = 0;
    let utilized_amt_inr = 0;
    let amount = 0;

    for (const val of this.checkBankData) {
      data = {
        'Bank Name': val.bank_name,
        'Total Forward Amount USD': val.total_forward_amount_usd,
        'Total Forward Amount INR': val.total_forward_amount_inr,
        'Total Cancel Amount USD': val.total_cancel_amount_usd,
        'Total Cancel Amount INR': val.total_cancel_amount_inr,
        'Total Utilized Amount USD': val.total_hedge_amount,
        'Total Utilized Amount INR': val.total_hedge_amount_inr,
        'Total Forward Count': val.total_forward_count,
      };
      this.export_data.push(data);
      frwd_amt_usd = frwd_amt_usd + Number(val.total_forward_amount_usd);
      frwd_amt_inr = frwd_amt_inr + Number(val.total_forward_amount_inr);
      cancel_amt_usd = cancel_amt_usd + Number(val.total_cancel_amount_usd);
      cancel_amt_inr = cancel_amt_inr + Number(val.total_cancel_amount_inr);
      utilized_amt_usd = utilized_amt_usd + Number(val.total_hedge_amount);
      utilized_amt_inr = utilized_amt_inr + Number(val.total_hedge_amount_inr);
      amount = amount + Number(val.total_forward_count);
    }

    const foot = {
      'Bank Name': '',
      'Total Forward Amount USD': frwd_amt_usd,
      'Total Forward Amount INR': frwd_amt_inr,
      'Total Cancel Amount USD': cancel_amt_usd,
      'Total Cancel Amount INR': cancel_amt_inr,
      'Total Utilized Amount USD': utilized_amt_usd,
      'Total Utilized Amount INR': utilized_amt_inr,
      'Total Forward Count': amount,
    };
    this.export_data.push(foot);
  }

  // Bank Export Excel
  exportBankExcel() {
    this.export_data = [];
    this.exportBankData();
    this.exportService.exportExcel(this.export_data, 'Forward Booking Avg Price Booking Bank Wise');
  }

  // Bank Export PDF
  exportBankPdf() {
    this.export_data = [];
    this.exportBankData();
    this.exportColumns = [
      { title: 'Bank Name', dataKey: 'Bank Name' },
      { title: 'Total Forward Amount USD', dataKey: 'Total Forward Amount USD' },
      { title: 'Total Forward Amount INR', dataKey: 'Total Forward Amount INR' },
      { title: 'Total Cancel Amount USD', dataKey: 'Total Cancel Amount USD' },
      { title: 'Total Cancel Amount INR', dataKey: 'Total Cancel Amount INR' },
      { title: 'Total Utilized Amount USD', dataKey: 'Total Utilized Amount USD' },
      { title: 'Total Utilized Amount INR', dataKey: 'Total Utilized Amount INR' },
      { title: 'Total Forward Count', dataKey: 'Total Forward Count' },
    ];
    this.exportService.exportPdf(this.exportColumns, this.export_data, 'Forward Booking Avg Price Booking Bank Wise');
  }

  // Bank Filter
  onBankFilter(event, dt) {
    this.checkBankData = event.filteredValue;
    this.totalCalculation();
  }

  receiveDate(dateValue: any){
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
		
	}
	
	clearDropdown(){		
		if(JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
		this.uploadSuccess.emit(false);
	}
  
  getData() {
    this.getReportData();
  }

}
