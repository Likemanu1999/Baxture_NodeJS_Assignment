import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { GodownMaster, LiveInventory, MainGrade } from '../../../shared/apis-path/apis-path';
import { DatePipe } from '@angular/common';
import html2canvas from 'html2canvas';


@Component({
  selector: 'app-sales-purchase-dispatch-stock-report',
  templateUrl: './sales-purchase-dispatch-stock-report.component.html',
  styleUrls: ['./sales-purchase-dispatch-stock-report.component.css'],
  providers: [CrudServices, DatePipe]
})
export class SalesPurchaseDispatchStockReportComponent implements OnInit {

  @ViewChild('downloadLink', { static: false }) downloadLink: ElementRef;
  @ViewChild('canvas', { static: false }) canvas: ElementRef;
  @ViewChild('screen', { static: false }) screen: ElementRef;
  main_grade = [{ id: 0, name: 'All' }];
  godown_arr = [{ id: 0, name: 'All' }];
  main_grade_ids: string[];
  godown_ids: string[];
  currentYear: number;
  curenctMonth: number;
  currdate = new Date();
  bsRangeValue: any = [];
  bsRangeValue2: any = [];
  fromDate: string;
  toDate: string;
  data_sales: [];
  data_local_purchase: [];
  data_dispatch_details: [];
  data_unsold_details: [];
  allUnsold: any;
  viewDetails :boolean = false;
  date = new Date();

  constructor(private CrudServices: CrudServices, public datepipe: DatePipe) {

    // this.currentYear = Number(this.datepipe.transform(this.currdate, 'yyyy'));
    // this.curenctMonth = Number(this.datepipe.transform(this.currdate, 'MM'));
    // // console.log(Number(this.datepipe.transform(this.currdate, 'MM')),"this.currentYear")

    // this.bsRangeValue = [new Date(this.currentYear, (this.curenctMonth - 1), 1), new Date(Number(this.currentYear + 1), 2, 31)];
    // this.bsRangeValue2 = ['', ''];

    
    this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
    if (this.datepipe.transform(this.date, 'MM') > '03') {
      this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
    } else {
      this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
    }


  }

  ngOnInit() {

    this.fromDate = this.bsRangeValue[0];
    this.toDate = this.bsRangeValue[1];

    this.CrudServices.getRequest<any>(MainGrade.getAll).subscribe((response) => {
      console.log(response, "main_grade");
      this.main_grade = [...this.main_grade, ...response];
      console.log(this.main_grade, "this.main_grade");
    });

    this.CrudServices.getRequest<any>(GodownMaster.getAllHeadGodown).subscribe((response) => {
      console.log(response, "godown_arr");
      this.godown_arr = [...this.godown_arr, ...response];
      console.log(this.godown_arr, "this.godown_arr");
    });

  }


  getDetailUnsold() {


    this.CrudServices.postRequest<any>(LiveInventory.salepuchasestockreport, {
      from_date: this.fromDate,
      to_date: this.toDate,
      main_grade_id_array: this.main_grade_ids,
      main_godown_id_array: this.godown_ids,
    }).subscribe((response) => {

      this.viewDetails=true;
      console.log(response, "response");
      this.data_sales =response.sales_booking;
      this.data_local_purchase =response.local_purchase;
      this.data_dispatch_details =response.dispatch;
      this.allUnsold =response.allUnsold;
      this.data_unsold_details =response.detailUnsold;

     
      for(let elemUn  of response.detailUnsold)
      {
        let tot_unsold = ((elemUn.tot_non_pending +
          elemUn.tot_reg_intransite +
          elemUn.tot_local_intransite + elemUn.tot_stock_transfer_intransite +
          elemUn.tot_inventory + elemUn.tot_bond_intransite)-
          (elemUn.tot_sales_pending));

          elemUn.unsold=tot_unsold;

      }

      
      // console.log( this.data_sales," this.data_sales")
      // console.log( this.data_local_purchase," data_local_purchase")
       console.log( this.data_unsold_details," data_unsold_details")
      
    });

  }

  downloadImage(){
		html2canvas(this.screen.nativeElement).then(canvas => {
		  this.canvas.nativeElement.src = canvas.toDataURL();
		  this.downloadLink.nativeElement.href = canvas.toDataURL('image/png');
		  this.downloadLink.nativeElement.download = 'InventoryReport.png';
		  this.downloadLink.nativeElement.click();
		});

	
		// this.ImgView= false;
	  }

}
