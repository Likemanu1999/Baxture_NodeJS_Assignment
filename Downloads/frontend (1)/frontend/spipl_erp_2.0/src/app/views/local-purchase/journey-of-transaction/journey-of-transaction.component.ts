import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Ilc_Loc, SpiplBankMaster } from '../../../shared/apis-path/apis-path';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { ExportService } from '../../../shared/export-service/export-service';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';

@Component({
	selector: 'app-journey-of-transaction',
	templateUrl: './journey-of-transaction.component.html',
	styleUrls: ['./journey-of-transaction.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ExportService,
		CrudServices,
		DatePipe,
		LoginService
	]
})
export class JourneyOfTransactionComponent implements OnInit {

	bsRangeValue: any = [];
	bsRangeValue2: any = [];
	currentYear: number;
	currdate = new Date();
	ilc_list = [];
	fromCreatedDate: any;
	toCreatedDate: any;
	fromOpeningDate: any;
	toOpeningDate: any;
	bank: any;
	spipl_bank = [];
	cols: { field: string; header: string; style: string; class: string }[];
	isLoading: boolean;
	export_list: any;
	pi_cols: { field: string; header: string; }[];
	total_qty: any;
	total_amt: any;
	filteredValuess: any[];
	date = new Date();
	user: UserDetails;
	company_id: any;
	role_id: any;


	constructor(
		private exportService: ExportService,
		private crudServices: CrudServices,
		private datepipe: DatePipe,
		private loginService: LoginService,
	) {

		this.user = this.loginService.getUserDetails();
		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;

		this.cols = [
			{ field: 'Supplier_Name', header: 'Supplier Name', style: '100px', class: 'first' },
			{ field: 'ilc_bank_no', header: 'LC Number', style: '100px', class: 'second' },
			{ field: 'ilc_opening_date', header: 'LC Opening Date', style: '100px', class: 'third' },
			{ field: 'lcQuantity', header: 'Lc Quantity', style: '150px', class: '' },
			{ field: 'lcAmount', header: 'Lc Amount', style: '200px', class: '' },
			{ field: 'pi_details', header: 'PI Details', style: '1000px', class: '' },
			{ field: 'bex_details', header: 'BE Details', style: '1000px', class: '' },


		];

		this.pi_cols = [
			{ field: 'proformarefno', header: 'Invoice Number' },
			{ field: 'pi_quantity', header: 'PI Qty' },
			{ field: 'pi_amount', header: 'PI Amount' },
			{ field: 'placeofdestination', header: 'Place of Destination' },
			{ field: 'placeofloading', header: 'Place of loading' },
		]

		this.currentYear = Number(this.datepipe.transform(this.currdate, 'yyyy'));
		if (this.datepipe.transform(this.date, 'MM') > '03') {

			this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

		} else {

			this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];

		}
		//this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
		this.bsRangeValue2 = [];

		this.crudServices.getAll<any>(SpiplBankMaster.getAll).subscribe((response) => {
			this.spipl_bank = response;
		});

	}

	ngOnInit() {
	}

	onSubmit($e, variable, id, state) {
		this.ilc_list = [];

		if (state === 0 && $e !== undefined) {
			if (id) {
				this[variable] = $e[id];
			}
		}

		if (state === 0 && $e === undefined) {
			this[variable] = 0;
		}

		if (state === 1 && $e !== null) {
			this.fromCreatedDate = this.convert($e[0]);
			this.toCreatedDate = this.convert($e[1]);
		}
		if (state === 2 && $e !== null) {
			this.fromOpeningDate = this.convert($e[0]);
			this.toOpeningDate = this.convert($e[1]);
		}

		if (state === 1 && $e === null) {
			this.fromCreatedDate = '';
			this.toCreatedDate = '';
		}

		if (state === 2 && $e === null) {
			this.fromOpeningDate = '';
			this.toOpeningDate = '';
		}
		this.getILcList();
	}

	convert(date) {
		return this.datepipe.transform(date, 'yyyy-MM-dd');
	}

	getILcList() {

		this.isLoading = true;
		this.crudServices.getOne<any>(Ilc_Loc.getAll, {
			lc_date_from: this.fromCreatedDate,
			lc_date_to: this.toCreatedDate,
			lc_opening_dt_from: this.fromOpeningDate,
			lc_opening_dt_to: this.toOpeningDate,
			spipl_bank_id: this.bank,
			company_id : this.role_id == 1 ? null : this.company_id 

		}).subscribe(response => {

			this.isLoading = false;
			this.ilc_list = [];

			for (let val of response) {
				if (val.bex_details.length) {


					for (let i = 0; i < val.bex_details.length; i++) {
						console.log(val.bex_details);
						let amt = 0;
						amt = val.bex_details[i].bex_deals.reduce((sum, item) => sum + Number(item.amount), 0)
						console.log(amt);

						val.bex_details[i].amt_credited = amt;
					}
				}

				this.ilc_list.push(val);
			}
			this.filteredValuess = this.ilc_list

			this.calculateTotal(this.ilc_list);



		});



	}

	calculateTotal(data) {
		this.total_qty = data.reduce((sum, item) => sum + Number(item.lcQuantity), 0)
		this.total_amt = data.reduce((sum, item) => sum + Number(item.lcAmount), 0)
	}


	// data exported for pdf excel download
	exportData() {

		let arr = [];
		const foot = {};
		arr = this.ilc_list;
		// if (this.filteredValuess === undefined) {
		//   arr = this.deal_list;
		// } else {
		//   arr = this.filteredValuess;
		// }
		//  console.log(this.non_list);
		for (let i = 0; i < arr.length; i++) {
			const export_data = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]['field'] == 'pi_details') {
					for (let k = 0; k < this.pi_cols.length; i++) {
						//console.log(arr[i]['pi_details']);

						for (let val of arr[i]['pi_details']) {
							console.log(val);

							//export_data[this.pi_cols[k]['header']] = val[this.pi_cols[k]['field']];
						}

					}




				} else {
					export_data[this.cols[j]['header']] = arr[i][this.cols[j]['field']];
				}



			}
			this.export_list.push(export_data);


		}

		console.log(this.export_list);


		// for (let j = 0; j < this._selectedColumns.length; j++) {
		//   if (this._selectedColumns[j]['field'] === 'quantity') {
		// 	foot[this._selectedColumns[j]['header']] = this.tot_qty;

		//   } else if (this._selectedColumns[j]['field'] === 'rate') {
		// 	foot[this._selectedColumns[j]['header']] = this.tot_rate;

		//   } else if (this._selectedColumns[j]['field'] === 'deal_value_gst') {
		// 	foot[this._selectedColumns[j]['header']] = this.tot_deal_val;

		//   } else if (this._selectedColumns[j]['field'] === 'lifting_done') {
		// 	foot[this._selectedColumns[j]['header']] = this.tot_lifting_done;

		//   } else if (this._selectedColumns[j]['field'] === 'lifting_remaining') {
		// 	foot[this._selectedColumns[j]['header']] = this.tot_lifting_remaining;

		//   }
		//   else if (this._selectedColumns[j]['field'] === 'payment_done') {
		// 	foot[this._selectedColumns[j]['header']] = this.totalPaymentDone;

		//   }
		//   else if (this._selectedColumns[j]['field'] === 'lifting_payment_remainingremaining') {
		// 	foot[this._selectedColumns[j]['header']] = this.totalPaymentRemaining;

		//   } else {
		// 	foot[this._selectedColumns[j]['header']] = '';
		//   }
		// }

		this.export_list.push(foot);


	}

	exportExcel() {
		this.export_list = [];
		this.exportData();
		//this.exportService.exportExcel(this.export_list, 'Lifting-Details');
	}

	// on your component class declare
	onFilter(event, dt) {
		this.filteredValuess = [];
		this.total_qty = 0;
		this.total_amt = 0;


		this.filteredValuess = event.filteredValue;
		this.calculateTotal(this.filteredValuess);







	}





}
