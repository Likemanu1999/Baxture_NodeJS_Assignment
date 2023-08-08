import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { billOfEntry, billOfLading} from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';

@Component({
  selector: 'app-bill-of-entry-list',
  templateUrl: './bill-of-entry-list.component.html',
  styleUrls: ['./bill-of-entry-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
	providers: [
		PermissionService,
		LoginService,
		DatePipe,
		CrudServices
	]
})
export class BillOfEntryListComponent implements OnInit {
  cols: { field: string; header: string; style: string; }[];
  bsRangeValue: Date[];
  currentYear: number;
  date = new Date();
  fromBeDate: any;
  toBeDate: any;
  be_list = [];
  total_inr: any;
  total_qty: any;
  total_usd: any;
  total_duty: any;

  constructor(
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		private crudServices: CrudServices) {

      this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
      if (this.datepipe.transform(this.date, 'MM') > '03') {
        this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
      } else {
        this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
      }
      
		this.cols = [
			{ field: 'be_no', header: 'BE Number', style: '100' },
			{ field: 'be_dt', header: 'BE Date', style: '100' },
			{ field: 'bl_no', header: 'Duty Amount', style: '100' },
			{ field: 'bl_qty', header: 'Import Invoice No', style: '100' },
			{ field: 'covered_bl_qty', header: 'Load Charge', style: '100' }
		

		];

     }

  ngOnInit() {
  
  }

  onSelect(event) {
    if(event == null) {
      this.fromBeDate = '';
      this.toBeDate = '';
    }
    if(event) {
      this.fromBeDate = event[0];
      this.toBeDate = event[1];
    }

    this.getList();

  }

  getList() {
    this.crudServices.getOne<any>(billOfEntry.getAll , {start_date : this.fromBeDate , end_date : this.toBeDate }).subscribe(response => {
      if(response.length) {
        console.log(response);
        
      this.be_list = response;
      this.total_duty = response.reduce((sum, item) => sum + Number(item.custom_duty_amt) + Number(item.bcd_license_val), 0);
      this.total_usd = response.reduce((sum, item) => sum + Number(item.load_charge) , 0);
      this.total_inr = response.reduce((sum, item) => sum + Number(item.load_charge)  *  Number(item.exchange_rate) , 0);
      }
    })
  }

}
