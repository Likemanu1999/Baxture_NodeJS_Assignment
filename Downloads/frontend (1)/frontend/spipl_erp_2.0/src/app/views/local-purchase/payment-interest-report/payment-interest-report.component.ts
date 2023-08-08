import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DatePipe, JsonPipe } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { Payables} from '../../../shared/apis-path/apis-path';


@Component({
  selector: 'app-payment-interest-report',
  templateUrl: './payment-interest-report.component.html',
  styleUrls: ['./payment-interest-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
	providers: [
		DatePipe,
		ExportService,
		CrudServices
	]

})
export class PaymentInterestReportComponent implements OnInit {
  cols: { field: string; header: string; style: string; type: string; total: any; }[];
  data = [];
  totalAmount = 0;
  totalInterest = 0;
  isLoading: boolean;
  filteredValuess = [];

  constructor(
  
		public datepipe: DatePipe,
		private exportService: ExportService,
		private crudServices: CrudServices,
	) {
    this.cols = [
			{ field: 'purchase_invoice_date', header: 'Purchase Invoice Date', style: '100px', type:"date"  , total :  "" },
			{ field: 'purchase_invoice_no', header: 'Purchase Invoice No', style: '100px', type:""  , total :  "" },
			{ field: 'sub_org_name', header: 'Organization Name', style: '100px', type:""  , total :  "" },
			{ field: 'due_date', header: 'Invoice Due Date', style: '100px', type:"date" , total :  "" },
			{ field: 'amount', header: 'Amount', style: '100px', type:"amount" , total : 'totalAmount'},
			{ field: 'payment_date', header: 'Payment Date', style: '100px', type:"date" , total :  ""  },
			{ field: 'utr_no', header: 'UTR No', style: '100px', type:"" , total :  ""  },
			{ field: 'amount_interest', header: 'Interest', style: '100px', type:"amount",   total : 'totalInterest'},
		
		];

   }

  ngOnInit() {
    this.getData();
    
  }

  getData() {
    this.isLoading = true;
    this.crudServices.getAll<any>(Payables.getInvoiceWisePaymentReport).subscribe(response => {
      this.isLoading = false;
      this.data = response
      this.totalAmount = response.reduce((sum, item) => sum+Number(item.amount) , 0)
      this.totalInterest = response.reduce((sum, item) => sum+Number(item.amount_interest) , 0)
    
      this.filteredValuess = response;
      
    })
  }

  	// on your component class declare
	onFilter(event, dt) {
		this.filteredValuess = [];
	
		this.filteredValuess = event.filteredValue;
    this.totalAmount = 	this.filteredValuess.reduce((sum, item) => sum+Number(item.amount) , 0)
    this.totalInterest = 	this.filteredValuess.reduce((sum, item) => sum+Number(item.amount_interest) , 0)
	

	}

}
