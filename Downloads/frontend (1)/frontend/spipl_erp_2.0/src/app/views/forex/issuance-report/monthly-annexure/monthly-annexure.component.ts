import { DatePipe } from '@angular/common';
import { Component, OnInit, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap';
import { forexReports, MouMaster, SpiplBankMaster } from '../../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../../shared/crud-services/crud-services';
import { ExportService } from '../../../../shared/export-service/export-service';
import { PermissionService } from '../../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../../login/login.service_back';
import { TemplateService } from '../../../masters/template-editor/template-service';

@Component({
	selector: 'app-monthly-annexure',
	templateUrl: './monthly-annexure.component.html',
	styleUrls: ['./n.scss', './monthly-annexure.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		DatePipe,
		CrudServices,
		ExportService,
		TemplateService]
})
export class MonthlyAnnexureComponent implements OnInit {

	@ViewChild('myModalPending', { static: false }) public myModalPending: ModalDirective;
	@ViewChild('myModalForexSummary', { static: false }) public myModalForexSummary: ModalDirective;


	isLoading = false;
	annexure_list = [];
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	cols: { field: string; header: string; }[];
	_selectedColumns: any[];

	fromDate: any;
	toDate: any;
	bsRangeValue: Date[];
	currentYear: number;
	date = new Date();
	filteredValuess: any;
	export_annexure_list = [];

	forex_summary_list = [];
	spipl_banks = [];


	sum_non_fund_base_limit = 0;
	sum_flc_usd = 0;
	sum_flc_inr = 0;
	sum_total_doc_roll_usd = 0;
	sum_total_doc_roll_inr = 0;
	sum_foreign_curr_expo_usd = 0;
	sum_foreign_curr_expo_inr = 0;
	sum_total_doc_acceptance_usd = 0;
	sum_total_doc_acceptance_inr = 0;
	sum_total_lc_utilise_usd = 0;
	sum_total_lc_utilise_inr = 0;
	sum_total_hedge_usd = 0;
	sum_total_hedge_inr = 0;
	sum_total_unhedge_usd = 0;
	sum_total_unhedge_inr = 0;
	sum_bg_utilisation = 0;
	sum_sblc_utilisation = 0;
	sum_ilc_util = 0;
	sum_total_nfb = 0;
	sum_avg = 0;
	sum_nonlc_forward_utilise_usd = 0;
	sum_nonlc_forward_utilise_inr = 0;

	final_tot_utilisation = 0;
	final_remain_utilisation = 0;

	fd_row1 = 0;
	fd_row2 = 0;
	fd_row3 = 0;
	fd_row4 = 0;


	totOpenPosition = 0;
	totHedgePosition = 0;
	totUnHedgePosition = 0;








	constructor(private toasterService: ToasterService,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		private CrudServices: CrudServices,
		private exportService: ExportService,
		private templateService: TemplateService,
		private route: ActivatedRoute,
		private router: Router) {

		this.cols = [

			{ field: 'bank_name', header: 'Bank Name' },
			{ field: 'non_fund_base_limit', header: 'Non-Fund Base Limit Sanctioned' },
			{ field: 'flc_usd', header: 'FLC USD' },
			{ field: 'flc_inr', header: 'FLC Limit Utilisation ( INR )' },
			{ field: 'total_doc_roll_usd', header: 'BC/SBLC USD' },
			{ field: 'total_doc_roll_inr', header: 'BC/SBLC Limit Utilisation ( INR )' },
			{ field: 'foreign_curr_expo_usd', header: 'Total Foreign Currency Exposure related to LC Limits (USD )' },
			{ field: 'foreign_curr_expo_inr', header: 'Total Foreign Currency Exposure related to LC Limits (INR )' },
			{ field: 'total_doc_acceptance_usd', header: '( DOC) LC given & Liabi created in Bank - USD' },
			{ field: 'total_doc_acceptance_inr', header: 'LC given & Liabi created in Bank - INR' },
			{ field: 'total_lc_utilise_usd', header: 'FLC given & Liabi not yet created - ( USD )' },
			{ field: 'total_lc_utilise_inr', header: 'FLC given & Liabi not yet created - ( INR )' },
			{ field: 'total_hedge_usd', header: 'Hedged Forward Curr (USD)' },
			{ field: 'total_hedge_inr', header: 'Hedged Forward Curr (INR) ' },
			{ field: 'total_unhedge_usd', header: 'Unhedged Foreign Curr USD' },
			{ field: 'total_unhedge_inr', header: 'Unhedged Foreign Curr INR' },
			{ field: 'bg_utilisation', header: 'BG Utilization ( INR )' },
			{ field: 'sblc_utilisation', header: 'SBLC Utilization ( INR )' },
			{ field: 'ilc_util', header: 'ILC Utilisation (INR)' },
			{ field: 'total_nfb', header: 'Total Limit NFB Utilisation ( INR )' },
			{ field: 'avg', header: '' },
			{ field: 'nonlc_forward_utilise_usd', header: 'NON-LC ( TT 90 days from BL Date (USD) )' },
			{ field: 'nonlc_forward_utilise_inr', header: 'NON-LC ( TT 90 days from BL Date (INR )' },

		];

		this._selectedColumns = this.cols;

		this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
		// this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

		if (this.datepipe.transform(this.date, 'MM') > '03') {

			this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

		} else {

			this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];

		}

		this.fromDate = this.bsRangeValue[0];
		this.toDate = this.bsRangeValue[1];

	}

	ngOnInit() {
		//this.getData();
		//this.unsold();
		// this.CrudServices.postRequest<any>(forexReports.getMonthlyAnnexure, { flag: 1 }).subscribe((response) => {
		// 	console.log(response, "forexsumm")
		// });

		//this.unsold();

	}

	// unsold(){

	// 	this.CrudServices.getRequest<any>(forexReports.getUnsoldSummary).subscribe((response) => {
	// 		console.log(response,"unsold");
	// 	});

	// }
	getData() {


		this.CrudServices.postRequest<any>(forexReports.getMonthlyAnnexure,
			{ from_dt: this.fromDate, to_dt: this.toDate }).subscribe((response) => {
				console.log(response, "annexure")
				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);

				} else {
					this.annexure_list = [];
					this.sum_non_fund_base_limit = 0;
					this.sum_flc_usd = 0;
					this.sum_flc_inr = 0;
					this.sum_total_doc_roll_usd = 0;
					this.sum_total_doc_roll_inr = 0;
					this.sum_foreign_curr_expo_usd = 0;
					this.sum_foreign_curr_expo_inr = 0;
					this.sum_total_doc_acceptance_usd = 0;
					this.sum_total_doc_acceptance_inr = 0;
					this.sum_total_lc_utilise_usd = 0;
					this.sum_total_lc_utilise_inr = 0;
					this.sum_total_hedge_usd = 0;
					this.sum_total_hedge_inr = 0;
					this.sum_total_unhedge_usd = 0;
					this.sum_total_unhedge_inr = 0;
					this.sum_bg_utilisation = 0;
					this.sum_sblc_utilisation = 0;
					this.sum_ilc_util = 0;
					this.sum_total_nfb = 0;
					this.sum_avg = 0;
					this.sum_nonlc_forward_utilise_usd = 0;
					this.sum_nonlc_forward_utilise_inr = 0;

					console.log(response, "annexure_list")
					this.annexure_list = response
					for (let item, i = 0; item = this.annexure_list[i++];) {
						item.flc_usd = item.total_lc_utilise_usd + item.total_doc_acceptance_usd;
						item.flc_inr = item.total_lc_utilise_inr
							+ item.total_doc_acceptance_inr;

						item.foreign_curr_expo_usd = item.total_lc_utilise_usd
							+ item.total_doc_acceptance_usd + item.total_doc_roll_usd;

						item.foreign_curr_expo_inr = item.total_lc_utilise_inr
							+ item.total_doc_acceptance_inr + item.total_doc_roll_inr;

						item.ilc_util = item.ilc_utilisation + item.bex_pending;
						item.total_nfb = item.total_lc_utilise_inr
							+ item.total_doc_acceptance_inr + item.total_doc_roll_inr + item.bg_utilisation + item.ilc_utilisation + item.bex_pending;

						item.avg = ((item.total_lc_utilise_inr
							+ item.total_doc_acceptance_inr + item.total_doc_roll_inr + item.bg_utilisation + item.ilc_utilisation + item.bex_pending) / 10000000);

						this.sum_non_fund_base_limit = this.sum_non_fund_base_limit + item.non_fund_base_limit;
						this.sum_flc_usd = this.sum_flc_usd + item.flc_usd;
						this.sum_flc_inr = this.sum_flc_inr + item.flc_inr;
						this.sum_total_doc_roll_usd = this.sum_total_doc_roll_usd + item.total_doc_roll_usd;
						this.sum_total_doc_roll_inr = this.sum_total_doc_roll_inr + item.total_doc_roll_inr;
						this.sum_foreign_curr_expo_usd = this.sum_foreign_curr_expo_usd + item.foreign_curr_expo_usd;
						this.sum_foreign_curr_expo_inr = this.sum_foreign_curr_expo_inr + item.foreign_curr_expo_inr;
						this.sum_total_doc_acceptance_usd = this.sum_total_doc_acceptance_usd + item.total_doc_acceptance_usd;
						this.sum_total_doc_acceptance_inr = this.sum_total_doc_acceptance_inr + item.total_doc_acceptance_inr;
						this.sum_total_lc_utilise_usd = this.sum_total_lc_utilise_usd + item.total_lc_utilise_usd;
						this.sum_total_lc_utilise_inr = this.sum_total_lc_utilise_inr + item.total_lc_utilise_inr;
						this.sum_total_hedge_usd = this.sum_total_hedge_usd + item.total_hedge_usd;
						this.sum_total_hedge_inr = this.sum_total_hedge_inr + item.total_hedge_inr;
						this.sum_total_unhedge_usd = this.sum_total_unhedge_usd + item.total_unhedge_usd;
						this.sum_total_unhedge_inr = this.sum_total_unhedge_inr + item.total_unhedge_inr;
						this.sum_bg_utilisation = this.sum_bg_utilisation + item.bg_utilisation;
						this.sum_sblc_utilisation = this.sum_sblc_utilisation + item.sblc_utilisation;
						this.sum_ilc_util = this.sum_ilc_util + item.ilc_util;
						this.sum_total_nfb = this.sum_total_nfb + item.total_nfb;
						this.sum_avg = this.sum_avg + item.avg;
						this.sum_nonlc_forward_utilise_usd = this.sum_nonlc_forward_utilise_usd + item.nonlc_forward_utilise_usd;
						this.sum_nonlc_forward_utilise_inr = this.sum_nonlc_forward_utilise_inr + item.nonlc_forward_utilise_inr;


					}
				}
			});
	}

	@Input() get selectedColumns(): any[] {
		//localStorage.setItem('selected_col_non', JSON.stringify(this._selectedColumns));
		return this._selectedColumns;
	}

	set selectedColumns(val: any[]) {
		this._selectedColumns = this.cols.filter(col => val.includes(col));
	}


	onSelect($e, state) {

		if ($e) {
			this.fromDate = $e[0];
			this.toDate = $e[1];
		}
		this.getData();

	}


	exportExcel() {
		this.export_annexure_list = [];
		this.exportData();
		this.exportService.exportExcel(this.export_annexure_list, 'Annexure List');
	}

	exportData() {

		let arr = [];
		const foot = {};
		let foot_non_fund_base_limit = 0;
		let foot_flc_usd = 0;
		let foot_flc_inr = 0;
		let foot_total_doc_roll_usd = 0;
		let foot_total_doc_roll_inr = 0;
		let foot_foreign_curr_expo_usd = 0;
		let foot_foreign_curr_expo_inr = 0;
		let foot_total_doc_acceptance_usd = 0;
		let foot_total_doc_acceptance_inr = 0;
		let foot_total_lc_utilise_usd = 0;
		let foot_total_lc_utilise_inr = 0;
		let foot_total_hedge_usd = 0;
		let foot_total_hedge_inr = 0;
		let foot_total_unhedge_usd = 0;
		let foot_total_unhedge_inr = 0;
		let foot_bg_utilisation = 0;
		let foot_sblc_utilisation = 0;
		let foot_ilc_util = 0;
		let foot_total_nfb = 0;
		let foot_avg = 0;
		let foot_nonlc_forward_utilise_usd = 0;
		let foot_nonlc_forward_utilise_inr = 0;
		if (this.filteredValuess === undefined) {
			arr = this.annexure_list;
		} else {
			arr = this.filteredValuess;
		}
		for (let i = 0; i < arr.length; i++) {
			const export_issuance = {};
			for (let j = 0; j < this._selectedColumns.length; j++) {
				export_issuance[this._selectedColumns[j]['header']] = arr[i][this._selectedColumns[j]['field']];

			}
			this.export_annexure_list.push(export_issuance);

			foot_non_fund_base_limit = foot_non_fund_base_limit + Number(arr[i]['non_fund_base_limit']);
			foot_flc_usd = foot_flc_usd + Number(arr[i]['flc_usd']);
			foot_flc_inr = foot_flc_inr + Number(arr[i]['flc_inr']);
			foot_total_doc_roll_usd = foot_total_doc_roll_usd + Number(arr[i]['total_doc_roll_usd']);
			foot_total_doc_roll_inr = foot_total_doc_roll_inr + Number(arr[i]['total_doc_roll_inr']);
			foot_foreign_curr_expo_usd = foot_foreign_curr_expo_usd + Number(arr[i]['foreign_curr_expo_usd']);
			foot_foreign_curr_expo_inr = foot_foreign_curr_expo_inr + Number(arr[i]['foreign_curr_expo_inr']);
			foot_total_doc_acceptance_usd = foot_total_doc_acceptance_usd + Number(arr[i]['total_doc_acceptance_usd']);
			foot_total_doc_acceptance_inr = foot_total_doc_acceptance_inr + Number(arr[i]['total_doc_acceptance_inr']);
			foot_total_lc_utilise_usd = foot_total_lc_utilise_usd + Number(arr[i]['total_lc_utilise_usd']);
			foot_total_lc_utilise_inr = foot_total_lc_utilise_inr + Number(arr[i]['total_lc_utilise_inr']);
			foot_total_hedge_usd = foot_total_hedge_usd + Number(arr[i]['total_hedge_usd']);
			foot_total_hedge_inr = foot_total_hedge_inr + Number(arr[i]['total_hedge_inr']);
			foot_total_unhedge_usd = foot_total_unhedge_usd + Number(arr[i]['total_unhedge_usd']);
			foot_total_unhedge_inr = foot_total_unhedge_inr + Number(arr[i]['total_unhedge_inr']);
			foot_bg_utilisation = foot_bg_utilisation + Number(arr[i]['bg_utilisation']);
			foot_sblc_utilisation = foot_sblc_utilisation + Number(arr[i]['sblc_utilisation']);
			foot_ilc_util = foot_ilc_util + Number(arr[i]['ilc_util']);
			foot_total_nfb = foot_total_nfb + Number(arr[i]['total_nfb']);
			foot_avg = foot_avg + Number(arr[i]['avg']);
			foot_nonlc_forward_utilise_usd = foot_nonlc_forward_utilise_usd + Number(arr[i]['nonlc_forward_utilise_usd']);
			foot_nonlc_forward_utilise_inr = foot_nonlc_forward_utilise_inr + Number(arr[i]['nonlc_forward_utilise_inr']);


		}



		for (let j = 0; j < this._selectedColumns.length; j++) {
			if (this._selectedColumns[j]['field'] === 'non_fund_base_limit') {
				foot[this._selectedColumns[j]['header']] = foot_non_fund_base_limit;

			} else if (this._selectedColumns[j]['field'] === 'flc_usd') {
				foot[this._selectedColumns[j]['header']] = foot_flc_usd;

			} else if (this._selectedColumns[j]['field'] === 'flc_inr') {
				foot[this._selectedColumns[j]['header']] = foot_flc_inr;

			} else if (this._selectedColumns[j]['field'] === 'total_doc_roll_usd') {
				foot[this._selectedColumns[j]['header']] = foot_total_doc_roll_usd;

			} else if (this._selectedColumns[j]['field'] === 'total_doc_roll_inr') {
				foot[this._selectedColumns[j]['header']] = foot_total_doc_roll_inr;

			} else if (this._selectedColumns[j]['field'] === 'foreign_curr_expo_usd') {
				foot[this._selectedColumns[j]['header']] = foot_foreign_curr_expo_usd;

			} else if (this._selectedColumns[j]['field'] === 'foreign_curr_expo_inr') {
				foot[this._selectedColumns[j]['header']] = foot_foreign_curr_expo_inr;

			} else if (this._selectedColumns[j]['field'] === 'total_doc_acceptance_usd') {
				foot[this._selectedColumns[j]['header']] = foot_total_doc_acceptance_usd;

			} else if (this._selectedColumns[j]['field'] === 'total_doc_acceptance_inr') {
				foot[this._selectedColumns[j]['header']] = foot_total_doc_acceptance_inr;

			} else if (this._selectedColumns[j]['field'] === 'total_lc_utilise_usd') {
				foot[this._selectedColumns[j]['header']] = foot_total_lc_utilise_usd;

			} else if (this._selectedColumns[j]['field'] === 'total_lc_utilise_inr') {
				foot[this._selectedColumns[j]['header']] = foot_total_lc_utilise_inr;

			} else if (this._selectedColumns[j]['field'] === 'total_hedge_usd') {
				foot[this._selectedColumns[j]['header']] = foot_total_hedge_usd;

			} else if (this._selectedColumns[j]['field'] === 'total_hedge_inr') {
				foot[this._selectedColumns[j]['header']] = foot_total_hedge_inr;

			} else if (this._selectedColumns[j]['field'] === 'total_unhedge_usd') {
				foot[this._selectedColumns[j]['header']] = foot_total_unhedge_usd;

			} else if (this._selectedColumns[j]['field'] === 'total_unhedge_inr') {
				foot[this._selectedColumns[j]['header']] = foot_total_unhedge_inr;

			} else if (this._selectedColumns[j]['field'] === 'bg_utilisation') {
				foot[this._selectedColumns[j]['header']] = foot_bg_utilisation;

			} else if (this._selectedColumns[j]['field'] === 'sblc_utilisation') {
				foot[this._selectedColumns[j]['header']] = foot_sblc_utilisation;

			} else if (this._selectedColumns[j]['field'] === 'ilc_util') {
				foot[this._selectedColumns[j]['header']] = foot_ilc_util;

			} else if (this._selectedColumns[j]['field'] === 'total_nfb') {
				foot[this._selectedColumns[j]['header']] = foot_total_nfb;

			} else if (this._selectedColumns[j]['field'] === 'avg') {
				foot[this._selectedColumns[j]['header']] = foot_avg;

			} else if (this._selectedColumns[j]['field'] === 'nonlc_forward_utilise_usd') {
				foot[this._selectedColumns[j]['header']] = foot_nonlc_forward_utilise_usd;

			} else if (this._selectedColumns[j]['field'] === 'nonlc_forward_utilise_inr') {
				foot[this._selectedColumns[j]['header']] = foot_nonlc_forward_utilise_inr;

			} else {
				foot[this._selectedColumns[j]['header']] = '';
			}
		}

		this.export_annexure_list.push(foot);



	}


	get_ufc_report() {
		this.myModalPending.show();
	}

	get_forex_summary() {

		this.CrudServices.getRequest(SpiplBankMaster.getAll).subscribe((response) => {
			console.log(JSON.stringify(this.annexure_list), "this.annexure_list")
			this.spipl_banks = JSON.parse(JSON.stringify(response));
			console.log(this.spipl_banks, "this.spipl_banks")
			this.final_tot_utilisation = 0;
			this.final_remain_utilisation = 0;

			this.fd_row1 = 0;
			this.fd_row2 = 0;
			this.fd_row3 = 0;
			this.fd_row4 = 0;

			this.totOpenPosition = 0;
			this.totHedgePosition = 0;
			this.totUnHedgePosition = 0;


			for (let banks of JSON.parse(JSON.stringify(response))) {

				console.log(banks.bank_name)

				for (let elem of this.annexure_list) {

					let lc_utilisation = 0;
					let doc_accepatance = 0;
					let roll_over = 0;
					let bg_utilisation = 0;
					let sblc_utilisation = 0;
					let inland_utilisation = 0;
					let sanction_limit = 0;
					let remain_utilisation = 0;
					let fd_payment = 0;
					let fd_margin = 0;
					let fd_agn_lc_margin_15_park_agn_sanction_limit = 0;
					let fd_park_agsint_lc_tot_sanc_limit = 0;
					let fd_parked_agnst_lc = 0;

					let total_utilisation = 0;
					if (elem.bank_id == banks.id) {
						lc_utilisation = elem.total_lc_utilise_inr;
						doc_accepatance = elem.total_doc_acceptance_inr;
						roll_over = elem.total_doc_roll_inr;
						bg_utilisation = elem.bg_utilisation;
						sblc_utilisation = elem.sblc_utilisation;
						inland_utilisation = elem.ilc_utilisation;

						total_utilisation = elem.total_lc_utilise_inr + elem.total_doc_acceptance_inr + elem.total_doc_roll_inr + elem.bg_utilisation + elem.sblc_utilisation + elem.ilc_utilisation;



						this.final_tot_utilisation = this.final_tot_utilisation + total_utilisation;
						sanction_limit = elem.non_fund_base_limit;

						remain_utilisation = (sanction_limit - total_utilisation);

						this.final_remain_utilisation = this.final_remain_utilisation + remain_utilisation;


						let parked_percentage = 0;
						if (elem.bank_id == 2) {
							parked_percentage = 0.20;
						} else {
							parked_percentage = 0.15;
						}
						fd_agn_lc_margin_15_park_agn_sanction_limit = sanction_limit * parked_percentage;

						fd_park_agsint_lc_tot_sanc_limit = elem.fd_margin;
						fd_parked_agnst_lc = elem.fd_payment;
						let fdPark = elem.fd_margin - (total_utilisation * parked_percentage)
						if (total_utilisation > sanction_limit) {
							fdPark = 0;
						} else {
							if (fdPark < 0) {
								fdPark = 0;
							} else {
								fdPark = fdPark;
							}
						}


						this.fd_row1 = this.fd_row1 + fd_agn_lc_margin_15_park_agn_sanction_limit;
						this.fd_row2 = this.fd_row2 + fd_park_agsint_lc_tot_sanc_limit;
						this.fd_row3 = this.fd_row3 + fd_parked_agnst_lc;
						this.fd_row4 = this.fd_row4 + fdPark;



						this.forex_summary_list.push({ bank_id: elem.bank_id, total_utilisation: total_utilisation, sanction_limit: sanction_limit, remain_utilisation: remain_utilisation, fd_agn_lc_margin_15_park_agn_sanction_limit: fd_agn_lc_margin_15_park_agn_sanction_limit, fd_park_agsint_lc_tot_sanc_limit: fd_park_agsint_lc_tot_sanc_limit, fd_parked_agnst_lc: fd_parked_agnst_lc, fdPark: fdPark });

						this.totOpenPosition = this.totOpenPosition + elem.open_position;
						this.totHedgePosition = this.totHedgePosition + elem.hedge_position;
						this.totUnHedgePosition = this.totUnHedgePosition + elem.unhedge_position;


					}


				}



			}
			console.log(this.forex_summary_list, "this.forex_summary_list")

		});

		// for(let elem of this.annexure_list)
		// {


		//   //this.forex_summary_list.push();
		// }
		this.myModalForexSummary.show();
	}


	closeModal() {
		this.myModalPending.hide();
		this.myModalForexSummary.hide();
	}


}
