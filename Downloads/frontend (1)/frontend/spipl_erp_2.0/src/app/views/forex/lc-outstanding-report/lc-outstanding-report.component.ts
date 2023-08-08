import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { EmailTemplateMaster, Ilc_Loc, NonNegotiable, nonNegotiable, percentage_master, SpiplBankMaster } from '../../../shared/apis-path/apis-path';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { ExportService } from '../../../shared/export-service/export-service';
import { Table } from 'primeng/table';
import { staticValues } from '../../../shared/common-service/common-service';

import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-lc-outstanding-report',
  templateUrl: './lc-outstanding-report.component.html',
  styleUrls: ['./lc-outstanding-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ExportService,
    CrudServices,
    DatePipe
  ]
})
export class LcOutstandingReportComponent implements OnInit {

  cols: { field: string; header: string; style: string; class?: string }[];
  @ViewChild('dt', { static: false }) table: Table;
  @ViewChildren("inputs") public inputs: ElementRef<HTMLInputElement>[];
  data = [];
  isLoading: boolean;
  premiumArr = [];
  supplier_list: any = [];
  lookupOrg: any = {};
  lookupport: any = {};
  port: any = [];
  bsRangeValue: any = [];
  bsRangeValue2: any = [];
  datePickerConfig = staticValues.datePickerConfig;
  currentYear: number;
  date = new Date();
  fromPurchaseDate: string;
  toPurchaseDate: string;
  lookupbank: any = {};
  bankList: any = [];
  tot_be_qty: any;
  tot_accessable: any;
  tot_bcd_lic: any;
  tot_bcd_cash: any;
  tot_sws: any;
  tot_anti_dumping: any;
  tot_taxable: any;
  tot_igst: any;
  amountINR: any;
  tot_non_qty: any;
  totalAmountUsd: any;
  paymentAmountNon_Lc: any;
  paymentAmountLc: any;
  TotalPayment: any;
  difference: any;
  total_clearing_charges: any;
  ckeConfig: { editable: boolean; spellcheck: boolean; height: string; };
  myContent: string;
  checkedList = [];
  filteredValuess = [];
  getLabel: boolean;


  

  constructor(private exportService: ExportService,
    private crudServices: CrudServices,
    private datepipe: DatePipe) {

    this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
    // if (this.datepipe.transform(this.date, 'MM') > '03') {
    //   this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
    // } else {
    //   this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
    // }


    this.cols = [
      { field: 'sub_org_name', header: 'Party Name', style: '150px' },
      { field: 'port_name', header: 'Port', style: '150px' },
      { field: 'proform_invoice_no', header: 'PI Invoice Number', style: '100px'},
      { field: 'proform_invoice_date', header: 'PI Date', style: '150px' },
      { field: 'pi_quantity', header: 'PI Qty', style: '100px' },
      { field: 'pi_rate', header: 'PI Rate', style: '100px' },
      { field: 'bank_name', header: 'Bank', style: '150px' },
      { field: 'lc_date', header: 'LC Opening Date ', style: '150px' },
      { field: 'bank_lc_no', header: 'LC Number', style: '150px' },
      { field: 'non_invoice_no', header: 'Non Invoice', style: '150px' },
      { field: 'non_invoice_date', header: 'Non Invoice Date', style: '150px' },
      { field: 'amount', header: 'FLC (USD)', style: '150px' },
      


    ];

  
  }

  ngOnInit() {

    this.getDetails();

  }


  clearDate() {
    this.bsRangeValue = [];
    this.getDetails()
  }

 



  getDetails() {
    this.data = [];
    this.difference = 0;
    this.fromPurchaseDate = this.datepipe.transform(this.bsRangeValue[0], 'yyyy-MM-dd');
    this.toPurchaseDate = this.datepipe.transform(this.bsRangeValue[1], 'yyyy-MM-dd');
    
    this.isLoading = true
    this.crudServices.getOne<any>(NonNegotiable.getAsmReport, { from_date: this.fromPurchaseDate, to_date: this.toPurchaseDate }).subscribe(response => {
       console.log(response);
       
      this.isLoading = false;
      this.filteredValuess = response;
      this.data = response;

      for(let val of response) {
      
        if (!(val['sub_org_name'] in this.lookupOrg)) {
          this.lookupOrg[val['sub_org_name']] = 1;
          this.supplier_list.push({ 'sub_org_name': val['sub_org_name'] });
        }
  
     
  
        if (!(val['bank_name'] in this.lookupbank)) {
          this.lookupbank[val['bank_name']] = 1;
          this.bankList.push({ 'bank_name': val['bank_name'] });
        }
      }
    })


 
  }

  calculateTotal(data) {

    this.tot_be_qty =  data.reduce((sum,item) => sum + item.tot_be_qty , 0);
    this.tot_accessable = data.reduce((sum,item) => sum + item.tot_accessable , 0);
 
   
 
  }






  // multiselect filter
  onchange(event, name) {


    const arr = [];
    if (event.value.length > 0) {
      for (let i = 0; i < event.value.length; i++) {
        arr.push(event.value[i][name]);
      }
      // console.log(arr);
      this.table.filter(arr, name, 'in');

    } else {
      this.table.filter('', name, 'in');
    }
  }

  getDocsArr(val) {
    return JSON.parse(val);
  }

  onFilter(event, dt) {
    this.difference = 0;
   
    this.filteredValuess = event.filteredValue;
    for(let val of this.filteredValuess) {
      
      if( val['differnce'] > 0) {
        this.difference += val['differnce'] 
      } else if(val['differnce'] < 0) {
        this.difference = this.difference - val['differnce']
      }
    }
    this.calculateTotal(this.filteredValuess);
    
  }

  backFromEditor() {
    this.getLabel = false;
    this.checkedList = [];
    this.myContent = '';
  }


 
}
