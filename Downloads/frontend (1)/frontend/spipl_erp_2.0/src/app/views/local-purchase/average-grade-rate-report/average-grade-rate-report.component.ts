

import { Component, ElementRef, Input, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';

import { CommonService } from '../../../shared/common-service/common-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { DatePipe } from '@angular/common';
import { ExportService } from '../../../shared/export-service/export-service';
import { LocalPurchase } from '../../../shared/apis-path/apis-path';
import { Table } from 'primeng/table';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';

@Component({
  selector: 'app-average-grade-rate-report',
  templateUrl: './average-grade-rate-report.component.html',
  styleUrls: ['./average-grade-rate-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ToasterService,
    ExportService,
    DatePipe,
    CommonService,
    CrudServices,
    LoginService
    
  ]
})
export class AverageGradeRateReportComponent implements OnInit {
  cols: { field: string; header: string; style: string; }[];
  @ViewChild('dt', { static: false }) table: Table;
  fromDealDate: any;
  deal_list = [];
  currentYear: number;
  date = new Date();
  bsRangeValue: Date[];
  toDealDate: any;
  filteredValuess = [];
  total_qty: any;
  isLoading: boolean;
  lookup = {};
  godown = [];
  lookup_garde_type = {};
  grade_type = [];
  main_grade = {};
  main = [];
  export_purchase_list: any;
  user: UserDetails;

  exportColumns: { title: any; dataKey: any; }[];
  company_id: any;
  role_id: any;
  company: { label: string; id: number; }[];
  dealType: { label: string; id: number; }[];
  deal: any;



  constructor(
    private toasterService: ToasterService,
    public datepipe: DatePipe,
    private exportService: ExportService,
    private commonService: CommonService,
    private crudServices: CrudServices,
    private loginService: LoginService,
   
  ) {
    this.user = this.loginService.getUserDetails();
    this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;

    this.dealType = [{ label: 'Supplier Deal', id: 0 }, { label: 'Manufacturer', id: 1 }];
    this.company = [{ label: 'PVC', id: 1 }, { label: 'PE & PP', id: 2 }];
   

    this.cols = [
      { field: 'godown_name', header: 'Godown', style: '200px' },
      { field: 'name', header: 'Main Grade', style: '200px' },
      { field: 'grade_name', header: 'Grade ', style: '200px' },
      { field: 'qty', header: 'Quantity', style: '200px' },
      { field: 'average_rate', header: 'Average Rate', style: '200px' },
      
    ];


    
    this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
    if (this.datepipe.transform(this.date, 'MM') > '03') {

      this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

  } else {

      this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];

  }
   // this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

    this.fromDealDate = this.bsRangeValue[0];
    this.toDealDate = this.bsRangeValue[1];
  
  }


  // head filter for fromdate - todate called at start
  onSelect($e) {
    this.deal_list = [];


    if ($e == null) {
      this.fromDealDate = '';
      this.toDealDate = '';
    }

    


    if ($e) {
  
        this.fromDealDate = this.datepipe.transform($e[0] , 'yyyy-MM-dd');
        this.toDealDate = this.datepipe.transform($e[1] , 'yyyy-MM-dd');

     
    }

    this.getDealList();



  }



  ngOnInit() {
   
  }





  getDealList() {

    
   this.isLoading = true;
    this.crudServices.getOne<any>(LocalPurchase.getLocalPurchase, {
      deal_date_from: this.fromDealDate,
      deal_date_to: this.toDealDate,
      company_id : this.company_id,
      deal_type : this.deal 
    
    }).subscribe((response) => {
       console.log(response);
       
      this.deal_list = response;
      this.filteredValuess = response;
      this.isLoading = false;

      for(let val of response){
        if (!(val.godown_name in this.lookup)) {
          this.lookup[val.godown_name] = 1;
          this.godown.push({ 'godown_name': val.godown_name });
        }
  
        if (!(val.grade_name in this.lookup_garde_type)) {
          this.lookup_garde_type[val.grade_name] = 1;
          this.grade_type.push({ 'grade_name': val.grade_name });
        }

        if (!(val.name in this.main_grade)) {
          this.main_grade[val.name] = 1;
          this.main.push({ 'name': val.name });
        }
      }

       this.total_qty = this.filteredValuess.reduce((previousValue, currentValue) => previousValue + (currentValue['qty']), 0);
      
      
   
    });

  }

  // on your component class declare
  onFilter(event, dt) {
    this.filteredValuess = event.filteredValue;
     this.total_qty = this.filteredValuess.reduce((previousValue, currentValue) => previousValue + (currentValue['qty']), 0);

    }

      // multiselect filter
  onchange(event, name) {
    const arr = [];
    if (event.value.length > 0) {
      for (let i = 0; i < event.value.length; i++) {
        arr.push(event.value[i][name]);
      }

      this.table.filter(arr, name, 'in');

    } else {
      this.table.filter('', name, 'in');
    }
  }

  
  // data exported for pdf excel download
  exportData() {

    let arr = [];
    const foot = {};
    if (this.filteredValuess === undefined) {
      arr = this.deal_list;
    } else {
      arr = this.filteredValuess;
    }
    //  console.log(this.non_list);
    for (let i = 0; i < arr.length; i++) {
      const export_data = {};
      for (let j = 0; j < this.cols.length; j++) {
        export_data[this.cols[j]['header']] = arr[i][this.cols[j]['field']];

      }
      this.export_purchase_list.push(export_data);


    }

    for (let j = 0; j < this.cols.length; j++) {
      if (this.cols[j]['field'] === 'qty') {
        foot[this.cols[j]['header']] = this.total_qty;

      } 
     else {
        foot[this.cols[j]['header']] = '';
      }
    }

    this.export_purchase_list.push(foot);


  }

  // download doc ,pdf , excel

  exportPdf() {
    this.export_purchase_list = [];
    this.exportData();
    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.header }));
    this.exportService.exportPdf(this.exportColumns, this.export_purchase_list, 'Godown-Grade-Avg');
  }

  exportExcel() {
    this.export_purchase_list = [];
    this.exportData();
    this.exportService.exportExcel(this.export_purchase_list, 'Godown-Grade-Avg');
  }

  getAverageOf(arraySource, field) {

    let totRate = arraySource.reduce((s,i) => s + i.rate , 0);
    let totQty = arraySource.reduce((s,i) => s + i.qty , 0);
     
      
    let average = totRate/totQty;
  //  console.log(average);
    return average


		// let total =  arraySource.reduce(function (x, y) { return x + Number(y[field]); }, 0);

		// if(arraySource.length) {
		// 	return total/arraySource.length;
		// }

	}
  







 




}

