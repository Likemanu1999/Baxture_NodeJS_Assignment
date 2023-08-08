import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { Table } from 'primeng/table';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import * as moment from "moment";
import { ExportService } from "../../../shared/export-service/export-service";
import { logisticsReport, PortMaster } from '../../../shared/apis-path/apis-path';

@Component({
  selector: 'app-import-logistics-report',
  templateUrl: './import-logistics-report.component.html',
  styleUrls: ['./import-logistics-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ToasterService,
    PermissionService,
    LoginService,
    DatePipe,
    CrudServices,
    ExportService,

  ]
})
export class ImportLogisticsReportComponent implements OnInit {
  user: UserDetails;
  cols_pallete: { field: string; header: string; }[];
  data_pallet = []
  data_charges = [];
  cols_charges: { field: string; header: string; }[];
  bsRangeValue: Date[];
	bsRangeValue1: Date[];
	date = new Date();
	currentYear: number;
  cols_cfs: { field: string; header: string; }[];
  cols_be: { field: string; header: string; }[];
  bsRangeValue2: Date[];
  bsRangeValue3: Date[];
  cfs_data: any;
  port_list: any = [];
  port : any = []
  port_be : any 
  display: string;
  be_data: any = [];
  constructor(private toasterService: ToasterService,
    private permissionService: PermissionService,
    private loginService: LoginService,
    private exportService: ExportService,
    public datepipe: DatePipe, private crudServices: CrudServices) { 
      this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
		if (this.datepipe.transform(this.date, 'MM') > '03') {
			this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
      this.bsRangeValue1 = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
      this.bsRangeValue2 = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
      this.bsRangeValue3 = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
		} else {
			this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
			this.bsRangeValue1 = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
			this.bsRangeValue2 = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
			this.bsRangeValue3 = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
		}
    }

  ngOnInit() {
    this.getCols();
    this.getDropdown();
    this.getDataPallet();
    this.getDataCharges();
    this.cfsMomentReport();
    this.billOfEntryStatistics();
  }

  getCols(){
    this.cols_pallete = [
      { field: 'sr_no', header: 'Sr No' },
      { field: 'port_name', header: 'Port' },
      { field: 'tot_container', header: 'Total Containers' },
      { field: 'tot_pallets', header: 'Total Pallet' }
  ];

  this.cols_charges = [
    { field: 'sr_no', header: 'Sr No' },
    { field: 'port_name', header: 'Port' },
    { field: 'tot_qty', header: 'Total Quantity' },
    { field: 'tot_container', header: 'Total container' },
    { field: 'total_charges', header: 'Total Charges Paid' },
    { field: 'per_mt', header: 'Per MT' },
];

this.cols_cfs = [
  { field: 'sr_no', header: 'Sr No' },
  { field: 'sub_org_name', header: 'Supplier' },
  { field: 'tot_qty', header: 'Total Quantity' },
  { field: 'tot_container', header: 'Total container' },
 
];

this.cols_be = [
  { field: 'sr_no', header: 'Sr No' },
  { field: 'be_no', header: 'BE NO' },
  { field: 'be_dt', header: 'BE Date' },
  { field: 'accessable_val', header: 'Accessible Value' },
 
];
  }

  getDropdown() {
    this.crudServices.getAll<any>(PortMaster.getAll).subscribe(res => {
      this.port_list = res
    })
  }

  getDataPallet() {
    this.crudServices.getOne<any>(logisticsReport.palletCountReport , {from_date : moment(this.bsRangeValue[0]).format('YYYY-MM-DD') ,to_date : moment(this.bsRangeValue[1]).format('YYYY-MM-DD')}).subscribe(response => {
      if(response) {
        response.map((item , index) => item.sr_no = index + 1 )
        this.data_pallet = response
      }
    })
  }

  getDataCharges(){
    this.crudServices.getOne<any>(logisticsReport.logisticsPortWiseCharges , {from_date : moment(this.bsRangeValue1[0]).format('YYYY-MM-DD') ,to_date : moment(this.bsRangeValue1[1]).format('YYYY-MM-DD')}).subscribe(response => {
      if(response) {
        response.map((item , index) =>{
          item.sr_no = index + 1;
          item.total_charges = (item.shipping + item.cfs+item.cha+item.terminal+item.transport+item.load_cross+item.citpl+item.bond+item.terminal+item.storage + item.fob).toFixed(3)
          item.per_mt = (item.total_charges/item.tot_qty).toFixed(3)
          return item
        }  )
        console.log(response);
        
        this.data_charges = response
      }
    })
  }

  cfsMomentReport(){
    console.log(this.port);
    
    this.crudServices.getOne<any>(logisticsReport.cfsMomentReport , {from_date : moment(this.bsRangeValue2[0]).format('YYYY-MM-DD') ,to_date : moment(this.bsRangeValue2[1]).format('YYYY-MM-DD') , port : this.port}).subscribe(response => {
      if(response) {
        response.map((item , index) =>{
          item.sr_no = index + 1;
         
          return item
        }  )
        console.log(response,'DATA');
        if(this.port.length) {
          this.display ='';
          this.port.forEach(element => {
            console.log(element);
            
           let data =  response.filter(item => item.port_id == element )
           console.log(data);
           
           if(data.length) {
            this.display += `<b>${data[0].port_name} : Total Qty:  ${data.reduce((s,i)=> s+i.tot_qty , 0)} <b><br>`
           }
          
            
            console.log(this.display );
            
          });
        }
        
        this.cfs_data = response

      


      }
    })
  }

  
  billOfEntryStatistics(){
   
    this.crudServices.getOne<any>(logisticsReport.billOfEntryStatistics , {from_date : moment(this.bsRangeValue3[0]).format('YYYY-MM-DD') ,to_date : moment(this.bsRangeValue3[1]).format('YYYY-MM-DD') , port : this.port_be}).subscribe(response => {
      if(response) {
        response.map((item , index) =>{
          item.sr_no = index + 1;
         
          return item
        }  )
        console.log(response);
        // if(this.port.length) {
        //   this.display ='';
        //   this.port.forEach(element => {
        //     console.log(element);
            
        //    let data =  response.filter(item => item.port_id == element )
        //    console.log(data);
           
        //    if(data.length) {
        //     this.display += `<b>${data[0].port_name} : Total Qty:  ${data.reduce((s,i)=> s+i.tot_qty , 0)} <b><br>`
        //    }
          
            
        //     console.log(this.display );
            
        //   });
        // }
        
        this.be_data = response

      


      }
    })
  }


  exportData(cols , arr) {
    let data = []
    for (let i = 0; i < arr.length; i++) {
      const export_data = {};
      for (let j = 0; j < cols.length; j++) {
        export_data[cols[j]['header']] = arr[i][cols[j]['field']];

      }
      data.push(export_data);


    }

    return data
  }

  exportPdf(cols , data , name) {
  
    let expData = this.exportData(cols,data)
  let col = cols.map(col => ({ title: col.field, dataKey: col.field }));
    this.exportService.exportPdf(col, expData , name);
  }

  exportExcel(cols  ,data  ,name ) {
     let expData = this.exportData(cols,data)
    this.exportService.exportExcel(expData, name);
  }

  sendMail(cols ,data ,name){
    let expData = this.exportData(cols,data )
    let header = cols.map(
      obj => {
        return {
          "header": obj.header,
          "key": obj.field,

        }
      }
    );

    let detailData = {
      expData: expData,
      header: header,
      filename : name,
      tomail: 'erp@parmarglobal.com',
      subject : 'Bill of Entry Statistics'
    
    }

    this.crudServices.postRequest<any>(logisticsReport.sendBeMail , detailData).subscribe(response => {
      this.toasterService.pop(response.message, response.message, response.data);
    })
  }


}
