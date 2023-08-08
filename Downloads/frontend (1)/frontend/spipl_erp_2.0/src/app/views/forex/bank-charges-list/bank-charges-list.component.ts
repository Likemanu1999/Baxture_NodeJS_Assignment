import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { Table } from 'primeng/table';
import { bankChargesList, StaffMemberMaster, ValueStore } from '../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ExportService } from '../../../shared/export-service/export-service';
import { ModalDirective } from 'ngx-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { searchInArray, insertToArray } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { map } from 'rxjs/operators';
import * as moment from 'moment';

pdfMake.vfs = pdfFonts.pdfMake.vfs;



@Component({
	selector: 'app-bank-charges-list',
	templateUrl: './bank-charges-list.component.html',
	styleUrls: ['./bank-charges-list.component.scss'],
	providers: [CrudServices, PermissionService, LoginService, DatePipe, ToasterService, ExportService],
	encapsulation: ViewEncapsulation.None,
})
export class BankChargesListComponent implements OnInit {
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	@ViewChild('portModal', { static: false }) public portModal: ModalDirective;
	@ViewChild('dt', { static: false }) table: Table;

	cols: { field: string; header: string; }[];
	isLoading: boolean = true;
	ChargesList: any = [];
	_selectedColumns: any[];
	banks = [];
	lookup_bank = {};
	editChargesDetails: any;
	updateChargesForm: FormGroup;
	charge_id: any;

	company_name: any;
	company_address: any;
	totalSystemCharges = 0;
	totalBankCharges = 0;

	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});
	sgstDbValue: any;
	cgstDbValue: any;
	portWiseDetails: any;
	user: UserDetails;
	links: string[] = [];

	lc_open_recalculate = false;
	lc_open_update_charges = false;
	lc_open_portwise_charges = false;
	lc_open_checked_by = false;
	lc_open_entered_by = false;
	lc_open_entered_by_status = false;
	status = [];
	complete_pending_status = 1;
	globalList = [];
	isRange: any;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	  uploadSuccess: EventEmitter<boolean> = new EventEmitter();


	constructor(private CrudServices: CrudServices,
		private router: Router,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		private toasterService: ToasterService, private exportService: ExportService,) {

		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;

		this.lc_open_recalculate = (this.links.indexOf('lc_open_recalculate') > -1);
		this.lc_open_update_charges = (this.links.indexOf('lc_open_update_charges') > -1);
		this.lc_open_portwise_charges = (this.links.indexOf('lc_open_portwise_charges') > -1);
		this.lc_open_checked_by = (this.links.indexOf('lc_open_checked_by') > -1);
		this.lc_open_entered_by = (this.links.indexOf('lc_open_entered_by') > -1);
		this.lc_open_entered_by_status = (this.links.indexOf('lc_open_entered_by_status') > -1);



		this.cols = [
			// { field: 'id', header: 'id' },
			{ field: 'bank_name', header: 'Bank Name', },
			{ field: 'lc_no', header: 'LC NO' },
			{ field: 'claimed_by_system', header: 'Claimed By System' },
			{ field: 'system_charges', header: 'System Charges' },
			{ field: 'claimed_by_bank', header: 'Claimed By Bank' },
			{ field: 'bank_charges', header: 'Bank Charges' },
			{ field: 'port_wise_charges', header: 'Port Wise Charges' },
			{ field: 'cheecked', header: 'Checked' },
			{ field: 'entered', header: 'Entered' },
			{ field: 'created_by', header: 'Created by' },
			{ field: 'cretaed_date', header: 'Created Date' }
		];

		this._selectedColumns = this.cols;

		this.status = [{ id: 1, name: "Pending" }, { id: 2, name: "Complete" }];
		this.getBankChargesList();

	}

	onFilter(e, dt) {
		// this.pushDropdown(dt.filteredValue);
		this.pushDropdown(dt.filteredValue);
	}
	ngOnInit() {
		this.isLoading = true;

		this.getBankChargesList();

		this.CrudServices.getAll<any>(ValueStore.getAll).subscribe((response) => {
			//	console.log(response, "valuestoreneha");
			for (let elem of response) {

				if (elem.thekey == "company_name") {
					this.company_name = elem.value;
				}
				if (elem.thekey == "company_address") {
					this.company_address = elem.value;
				}
			}

			this.CrudServices.getAll<any>(bankChargesList.getGSTValue).subscribe((response) => {
				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);
				} else {
					this.sgstDbValue = response.sgst;
					this.cgstDbValue = response.cgst;
					//console.log(this.sgstDbValue, this.cgstDbValue, "GST Value");
				}

			});

		});


		this.updateChargesForm = new FormGroup({
			update_lc_open_amt_inr: new FormControl(0),
			update_lc_open_charges: new FormControl(0),
			update_lc_open_swift: new FormControl(0),
			additional_header: new FormControl(null),
			additional_charges: new FormControl(0),
			charges_date: new FormControl(null)
		});

	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
	
	  }

	  
	clearDropdown() {
		if (JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
			this.uploadSuccess.emit(false);
	}

	onStatusChange(event) {

		//	console.log(event.id, this.ChargesList, "eeeee")
		this.ChargesList = this.globalList;
		if (event.id == 1) {
			this.ChargesList = this.ChargesList.filter(item => item.entered_by == null && item.checked_by != null);
		} else if (event.id == 2) {
			this.ChargesList = this.ChargesList.filter(item => item.entered_by != null && item.checked_by != null);
		}
		this.calculateTotal();
	}
	pushDropdown(data: any) {
		throw new Error('Method not implemented.');
	}


	getBankChargesList() {
		this.ChargesList = [];
		let condition = {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD")
		  }
		this.CrudServices.getOne<any>(bankChargesList.getAllNew,condition).subscribe((response) => {
			
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
				this.isLoading = false;
			
			} else {
				this.isLoading = false;
				//this.ChargesList = response;
				for (let item, i = 0; item = response[i++];) {
					const bank = item.spipl_bank.bank_name;
					item.bank_name = bank;
					this.ChargesList.push(item);

					if (!(bank in this.lookup_bank)) {
						this.lookup_bank[bank] = 1;
						this.banks.push({ 'bank_name': bank });
					}
				}
				this.globalList = this.ChargesList;

				if (this.lc_open_entered_by_status) //Mayur Sir Pending List
				{
					this.ChargesList = this.globalList
					//this.ChargesList = this.ChargesList.filter(item => item.entered_by == null && item.checked_by != null);

				}

				this.calculateTotal();
				//	console.log(this.banks, "bankss");
			}
		});


	}
	getColumnPresent(name) {

		if (this._selectedColumns.find(ob => ob['field'] === name)) {
			return true;
		} else {
			return false;
		}
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

	calculateDiff(fromDate, toDate) {
		var date1: any = new Date(fromDate);
		var date2: any = new Date(toDate);
		var diffDays: any = Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));

		return diffDays;
	}

	async generatePdf(lcOpenChargeId, create_update_flag) {
		//console.log(lcOpenChargeId);



		//console.log(this.company_name, this.company_address, "company_address");
		//console.log(lcOpenChargeId.letter_of_credit.sub_org_master.sub_org_name, "supplierNBame");

		let bankName = lcOpenChargeId.spipl_bank.bank_name;
		let bankGstNo = lcOpenChargeId.spipl_bank.gst_no;
		let bankAccountNo = lcOpenChargeId.spipl_bank.account_no;

		let supplierName = lcOpenChargeId.letter_of_credit.sub_org_master.sub_org_name;

		let lcExpityDate = lcOpenChargeId.letter_of_credit.lc_expiry_date;
		let dateOfShipment = lcOpenChargeId.letter_of_credit.date_of_shipment;

		let lcExpityDateFormate = '';
		if (lcExpityDate != null) {
			lcExpityDateFormate = lcExpityDate.substr(8, 2) + '/' + lcExpityDate.substr(5, 2) + '/' + lcExpityDate.substr(0, 4);
		}

		let shipmentDateFormate = '';
		if (dateOfShipment != null) {
			shipmentDateFormate = dateOfShipment.substr(8, 2) + '/' + dateOfShipment.substr(5, 2) + '/' + dateOfShipment.substr(0, 4);
		}

		let lcPaymentTerm = lcOpenChargeId.letter_of_credit.lcPaymentTerm.pay_term;
		let totalUSD = lcOpenChargeId.letter_of_credit.lc_amount.toFixed(2);
		let bankLcNo = lcOpenChargeId.letter_of_credit.bank_lc_no;
		let lcOpeningDate = lcOpenChargeId.letter_of_credit.lc_opening_date;
		let lcOpenDate = lcOpeningDate.substr(8, 2) + '/' + lcOpeningDate.substr(5, 2) + '/' + lcOpeningDate.substr(0, 4);

		let usancePeriods = lcOpenChargeId.letter_of_credit.lcPaymentTerm.pay_val;
		let commitmentPeriods = this.calculateDiff(lcOpeningDate, lcExpityDate);
		let sbmcommitmentPeriods = this.calculateDiff(lcOpeningDate, dateOfShipment);
		let commitmentUsanceDetails = "";
		if (bankName == 'SBM BANK (INDIA) LIMITED') {

			commitmentUsanceDetails = '(Shipment Date : ' + shipmentDateFormate + ' ,  ' + lcPaymentTerm + ' (' + sbmcommitmentPeriods + ' + ' + usancePeriods + ') = Total Days ' + (Number(sbmcommitmentPeriods) + Number(usancePeriods)) + ')';

		} else {

			commitmentUsanceDetails = '(LC Expiry Date : ' + lcExpityDateFormate + ' ,  ' + lcPaymentTerm + ' (' + commitmentPeriods + ' + ' + usancePeriods + ') = Total Days ' + (Number(commitmentPeriods) + Number(usancePeriods)) + ')';
		}




		//console.log(commitmentPeriods, "commitmentPeriods");
		let tolerancevalue = lcOpenChargeId.letter_of_credit.tolerance;
		let tolerance = '0%';
		let tolePercent = 0;
		if (tolerancevalue === 1) {
			tolerance = '+1%';
			tolePercent = 1;
		} else if (tolerancevalue === 2) {
			tolerance = '+5%';
			tolePercent = 5;
		}
		else if (tolerancevalue === 3) {
			tolerance = '+10%';
			tolePercent = 10;
		}

		let tolrenaceAmount = (Number(totalUSD) * Number(tolePercent / 100)).toFixed(2);
		let totalUSDwithTolereance = Number(totalUSD) + Number(tolrenaceAmount);
		let lcRate = lcOpenChargeId.letter_of_credit.lc_rate.toFixed(2);

		let LC_AMOUNT_WITH_TOLERENCE_CASE = ''
		if (tolePercent == 0) {
			LC_AMOUNT_WITH_TOLERENCE_CASE = ' LC Amount USD ' + totalUSD + ' @ ' + lcRate + ' SR ';
		} else {
			LC_AMOUNT_WITH_TOLERENCE_CASE = ' LC Amount USD ' + totalUSD + '  ' + tolerance + ' Tolerance ' + tolrenaceAmount + ' USD ' + totalUSDwithTolereance + ' @ ' + lcRate + ' SR ';

		}




		let lcOpenInrAmt = lcOpenChargeId.lc_open_amt_inr.toFixed(2);
		let lcOpeningCharges = lcOpenChargeId.lc_open_charges.toFixed(4);
		let lcopeningChargesAmount = (Number(lcOpenInrAmt) * Number((lcOpenChargeId.lc_open_charges) / 100)).toFixed(2);

		let lcOpenCgst = lcOpenChargeId.lc_open_cgst.toFixed(2);
		let lcOpenSgst = lcOpenChargeId.lc_open_sgst.toFixed(2);
		let lcOpenSwift = lcOpenChargeId.lc_open_swift.toFixed(2);
		let lcSwiftCgst = lcOpenChargeId.lc_swift_cgst.toFixed(2);
		let lcSwiftSgst = lcOpenChargeId.lc_swift_sgst.toFixed(2);
		let totalChargesSystem = lcOpenChargeId.total_chrages_system.toFixed(2);
		let totalChargesBank = lcOpenChargeId.total_chrages_bank.toFixed(2);
		let chargesDate = lcOpenChargeId.charges_date ? lcOpenChargeId.charges_date.substr(8, 2) + '/' + lcOpenChargeId.charges_date.substr(5, 2) + '/' + lcOpenChargeId.charges_date.substr(0, 4) : null;

		var docDefinition = {
			content: [
				{
					style: 'tableExample',
					table: {
						body: [
							[{
								width: '*',
								text: [bankName + ' ' + bankAccountNo + ' GSTIN - ' + bankGstNo + ' (' + chargesDate + ')'],
								margin: [10, 5, 0, 0],
								bold: true,
								style: 'tableHeader',
								colSpan: 3,
								alignment: 'center'
							}, {}, {}],

							[{
								columns: [
									{
										image: await this.exportService.getBase64ImageFromURL(
											'assets/img/brand/parmar_logo.png'
										),
										margin: [38, 0, , 0],
										width: 60,
										height: 60,
										alignment: 'center'
									},
									{
										width: '*',
										text: [
											{ text: this.company_name + '\n', fontSize: 18, bold: true, },
											{ text: this.company_address, fontSize: 8 },


										],
										margin: [0, 15, 0, 0]
									},
								],
								colSpan: 3,
								alignment: 'center'
							}, {}, {}],

							[{

								text: [{ text: chargesDate, bold: true, border: [false, false, false, false] }],
								colSpan: 3,
								alignment: 'right'
							}, {}, {}],

							[{
								width: '*',

								text: [
									'Being LC Opening Charges debited by bank for ',
									{ text: supplierName, bold: true }, ' For USD ', { text: totalUSD, bold: true }, ' as per LC No. ', { text: bankLcNo, bold: true }, ' DTD ', { text: lcOpenDate, bold: true }],
								margin: [10, 5, 0, 0],
								style: 'tableHeader',
								colSpan: 3,
								alignment: 'center'
							}, {}, {}],

							[{ text: 'Sr.No.', alignment: 'center' }, { text: 'Perticular', alignment: 'center' }, { text: 'Amount', alignment: 'center' }],
							[{ text: 'A]', alignment: 'center', border: [true, false, true, false] },
							{

								text: LC_AMOUNT_WITH_TOLERENCE_CASE, border: [false, false, true, false]
							},
							{ text: lcOpenInrAmt, alignment: 'right', border: [false, false, true, false] }

							],


							[{ text: 'B]', alignment: 'center', border: [true, false, true, false] },
							{ text: 'LC Opening (Usance+Commitment) Charges @ ' + lcOpeningCharges + '% \n' + commitmentUsanceDetails + ' ', border: [false, false, true, false] },
							{ text: lcopeningChargesAmount, alignment: 'right', border: [false, false, true, false] }
							],

							[{ text: '', border: [true, false, true, false] },
							{ text: 'CGST @ ' + this.cgstDbValue + '% on LC Opening Charges', border: [false, false, true, false] },
							{ text: lcOpenCgst, alignment: 'right', border: [false, false, true, false] }
							],

							[{ text: '', border: [true, false, true, false] },
							{ text: 'SGST @ ' + this.sgstDbValue + '% on LC Opening Charges', border: [false, false, true, false] },
							{ text: lcOpenSgst, alignment: 'right', border: [false, false, true, false] }
							],

							[{ text: 'C]', alignment: 'center', border: [true, false, true, false] },
							{ text: 'Swift Charges', border: [false, false, true, false] },
							{ text: lcOpenSwift, alignment: 'right', border: [false, false, true, false] }
							],

							[{ text: '', border: [true, false, true, false] },
							{ text: 'CGST @ ' + this.cgstDbValue + '% on Swift Charges', border: [false, false, true, false] },
							{ text: lcSwiftCgst, alignment: 'right', border: [false, false, true, false] }
							],

							[{ text: '', border: [true, false, true, false] },
							{ text: 'SGST @ ' + this.sgstDbValue + '% on Swift Charges', border: [false, false, true, false] },
							{ text: lcSwiftSgst, alignment: 'right', border: [false, false, true, false] }
							],

							[{ text: '', border: [true, false, true, false] },
							{ text: 'Total Charges', border: [false, false, true, false] },
							{ text: totalChargesSystem, alignment: 'right', border: [false, false, true, false] }
							],

							[{ text: '', border: [true, true, true, true] },
							{ text: 'TOTAL CHARGES BY SYSTEM' },
							{ text: totalChargesSystem, alignment: 'right' }
							],

							[{ text: '', border: [true, true, true, true] },
							{ text: 'TOTAL CHARGES DEBITED BY BANK' },
							{ text: totalChargesBank, alignment: 'right' }
							],

							// [{
							// 	width: '*',
							// 	text: '',
							// 	margin: [10, 5, 0, 0],
							// 	style: 'tableHeader',
							// 	colSpan: 3,
							// }, {}, {}],

						],
						styles: {
							header: {
								fontSize: 18,
								bold: true,
								margin: [0, 0, 0, 10]
							},
							tableExample: {
								margin: [20, 8, 0, 20]
							},
							tableHeader: {
								bold: true,
								fontSize: 13,
								color: 'black'
							}
						}


					},

					layout: {

						paddingLeft: function (i, node) { return 10; },
						paddingRight: function (i, node) { return 10; },
						paddingTop: function (i, node) { return 10; },
						paddingBottom: function (i, node) { return 10; },
					}

				},





			]

		};

		//Updated Voucher
		if (create_update_flag == 2) {

			let additionalCharges = [];
			//if additional charges present
			if (lcOpenChargeId.additional_charges != 0) {
				additionalCharges = [{ text: '', border: [true, false, true, false] }, { text: lcOpenChargeId.additional_header, border: [false, false, true, false] }, { text: lcOpenChargeId.additional_charges.toFixed(2), alignment: 'right', border: [false, false, true, false] }];

				let arr = docDefinition.content[0].table.body;

				var additional_charges_index = searchInArray(arr, "Total Charges");
				let newArr = insertToArray(arr, additionalCharges, (additional_charges_index - 1));
				docDefinition.content[0].table.body = newArr;


			}

			let defaultData = docDefinition.content[0].table.body;

			let short_excess_lc_open_inr_amt = 0;
			let short_excess_lc_open_inr_amt_show = '';

			let setExcessShortLcOpenInrAmt = [{ text: '', border: [true, false, true, false] }, { text: '', border: [false, false, true, false] }, { text: '', alignment: 'right', border: [false, false, true, false] }];

			if (lcOpenChargeId.lc_open_amt_inr > lcOpenChargeId.update_lc_open_amt_inr) {
				//short
				short_excess_lc_open_inr_amt = Number(lcOpenChargeId.lc_open_amt_inr - lcOpenChargeId.update_lc_open_amt_inr);

				short_excess_lc_open_inr_amt_show = '-' + short_excess_lc_open_inr_amt.toFixed(2);

				setExcessShortLcOpenInrAmt = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_lc_open_inr_amt_show, alignment: 'right', border: [false, false, true, false] }];

				let arr = docDefinition.content[0].table.body;

				var lc_amount_index = searchInArray(arr, "LC Amount ");


				let newArr = insertToArray(arr, setExcessShortLcOpenInrAmt, lc_amount_index);
				docDefinition.content[0].table.body = newArr;

			} else if (lcOpenChargeId.lc_open_amt_inr < lcOpenChargeId.update_lc_open_amt_inr) {
				//excess
				short_excess_lc_open_inr_amt = Number(lcOpenChargeId.update_lc_open_amt_inr - lcOpenChargeId.lc_open_amt_inr);
				short_excess_lc_open_inr_amt_show = '+' + short_excess_lc_open_inr_amt.toFixed(2);
				setExcessShortLcOpenInrAmt = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_lc_open_inr_amt_show, alignment: 'right', border: [false, false, true, false] }];

				let arr = docDefinition.content[0].table.body;

				var lc_amount_index = searchInArray(arr, "LC Amount ");


				let newArr = insertToArray(arr, setExcessShortLcOpenInrAmt, lc_amount_index);
				docDefinition.content[0].table.body = newArr;
			}



			let short_excess_lc_open_charges = 0;
			let short_excess_lc_open_charges_show = '';
			let setExcessShortLcOpenCharges = [];

			if (lcOpenChargeId.lc_open_charges > lcOpenChargeId.update_lc_open_charges) {
				//short
				short_excess_lc_open_charges = Number(lcOpenChargeId.lc_open_charges - lcOpenChargeId.update_lc_open_charges);

				let lcopeningChargesAmount = (Number(lcOpenChargeId.lc_open_amt_inr) * Number((short_excess_lc_open_charges) / 100));


				//short_excess_lc_open_charges_show = '-' + short_excess_lc_open_charges.toFixed(2);
				short_excess_lc_open_charges_show = '-' + lcopeningChargesAmount.toFixed(2);

				setExcessShortLcOpenCharges = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_lc_open_charges_show, alignment: 'right', border: [false, false, true, false] }];

				let arr = docDefinition.content[0].table.body;

				var lc_open_index = searchInArray(arr, "LC Opening (Usance+Commitment) ");


				let newArr = insertToArray(arr, setExcessShortLcOpenCharges, lc_open_index);
				docDefinition.content[0].table.body = newArr;

			} else if (lcOpenChargeId.lc_open_charges < lcOpenChargeId.update_lc_open_charges) {
				//excess
				short_excess_lc_open_charges = Number(lcOpenChargeId.update_lc_open_charges - lcOpenChargeId.lc_open_charges);
				short_excess_lc_open_charges_show = '+' + short_excess_lc_open_charges.toFixed(2);

				let lcopeningChargesAmount = (Number(lcOpenChargeId.lc_open_amt_inr) * Number((short_excess_lc_open_charges) / 100));
				short_excess_lc_open_charges_show = '+' + lcopeningChargesAmount.toFixed(2);

				setExcessShortLcOpenCharges = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_lc_open_charges_show, alignment: 'right', border: [false, false, true, false] }];

				let arr = docDefinition.content[0].table.body;

				var lc_open_index = searchInArray(arr, "LC Opening (Usance+Commitment) ");


				let newArr = insertToArray(arr, setExcessShortLcOpenCharges, lc_open_index);
				docDefinition.content[0].table.body = newArr;
			}

			let short_excess_lc_open_swift = 0;
			let short_excess_lc_open_swift_show = '';
			let setExcessShortSwift = [];
			if (lcOpenChargeId.lc_open_swift > lcOpenChargeId.update_lc_open_swift) {
				//short
				short_excess_lc_open_swift = Number(lcOpenChargeId.lc_open_swift - lcOpenChargeId.update_lc_open_swift);
				short_excess_lc_open_swift_show = '-' + short_excess_lc_open_swift.toFixed(2);

				setExcessShortSwift = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_lc_open_swift_show, alignment: 'right', border: [false, false, true, false] }];

				let arr = docDefinition.content[0].table.body;

				var swift_charges_index = searchInArray(arr, "Swift Charges");

				let newArr = insertToArray(arr, setExcessShortSwift, swift_charges_index);
				docDefinition.content[0].table.body = newArr;

			} else if (lcOpenChargeId.lc_open_swift < lcOpenChargeId.update_lc_open_swift) {
				//excess
				short_excess_lc_open_swift = Number(lcOpenChargeId.update_lc_open_swift - lcOpenChargeId.lc_open_swift);
				short_excess_lc_open_swift_show = '+' + short_excess_lc_open_swift.toFixed(2);

				setExcessShortSwift = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_lc_open_swift_show, alignment: 'right', border: [false, false, true, false] }];

				let arr = docDefinition.content[0].table.body;

				var swift_charges_index = searchInArray(arr, "Swift Charges");


				let newArr = insertToArray(arr, setExcessShortSwift, swift_charges_index);
				docDefinition.content[0].table.body = newArr;

			}

			//let totalChargesAccordingToBank = this.lcOpenChargesCalculation();
			let totalChargesAccordingToBank = lcOpenChargeId.total_chrages_bank;


			let short_excess_bank_charges = 0;
			let short_excess_bank_charges_show = '';
			let totalBankCharges = [];
			if (lcOpenChargeId.total_chrages_system > totalChargesAccordingToBank) {

				//console.log(lcOpenChargeId.total_chrages_system, "total_chrages_system");
				//console.log(totalChargesAccordingToBank, "totalChargesAccordingToBank");
				short_excess_bank_charges = Number(lcOpenChargeId.total_chrages_system) - Number(totalChargesAccordingToBank);

				//console.log(short_excess_bank_charges, "short_excess_bank_charges");

				short_excess_bank_charges_show = '-' + short_excess_bank_charges.toFixed(2);

				totalBankCharges = [{ text: '', border: [true, false, true, false] }, { text: 'Short Charges According to Bank ', border: [false, false, true, false] }, { text: short_excess_bank_charges_show, alignment: 'right', border: [false, false, true, false] }];


				let arr = docDefinition.content[0].table.body;
				var total_bank_charges_index = searchInArray(arr, "Total Charges");
				let newArr = insertToArray(arr, totalBankCharges, total_bank_charges_index);
				docDefinition.content[0].table.body = newArr;


			} else if (lcOpenChargeId.total_chrages_system < totalChargesAccordingToBank) {
				short_excess_bank_charges = Number(totalChargesAccordingToBank - lcOpenChargeId.total_chrages_system);
				short_excess_bank_charges_show = '+' + short_excess_bank_charges.toFixed(2);

				totalBankCharges = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Charges According to Bank ', border: [false, false, true, false] }, { text: short_excess_bank_charges_show, alignment: 'right', border: [false, false, true, false] }];

				let arr = docDefinition.content[0].table.body;
				var total_bank_charges_index = searchInArray(arr, "Total Charges");
				let newArr = insertToArray(arr, totalBankCharges, total_bank_charges_index);
				docDefinition.content[0].table.body = newArr;


			}

		}



		// let arr_item = [{ text: '', border: [true, false, true, false] }, { text: 'nehapawale', border: [false, false, true, false] }, { text: totalChargesAccordingToBank, alignment: 'right', border: [false, false, true, false] }];

		// let arr_item2 = [{ text: '', border: [true, false, true, false] }, { text: 'nehapawale2', border: [false, false, true, false] }, { text: totalChargesAccordingToBank, alignment: 'right', border: [false, false, true, false] }];

		// let flag=1;
		// let flag1=0;
		// if(flag==1)
		// {
		// 	let arr = docDefinition.content[0].table.body;
		// 	let newArr = insertToArray(arr, arr_item, 6);
		// 	docDefinition.content[0].table.body = newArr;
		// }

		// if(flag1==2)
		// {
		// 	let arr = docDefinition.content[0].table.body;
		// 	let newArr = insertToArray(arr, arr_item2, 7);
		// 	docDefinition.content[0].table.body = newArr;
		// }


		pdfMake.createPdf(docDefinition).open();
	}

	updateCharges(lcOpenChargeId) {

		//console.log(lcOpenChargeId);
		this.editChargesDetails = lcOpenChargeId;
		this.charge_id = lcOpenChargeId.id;

		this.updateChargesForm.patchValue({
			update_lc_open_amt_inr: this.editChargesDetails['update_lc_open_amt_inr'],
			update_lc_open_charges: this.editChargesDetails['update_lc_open_charges'],
			update_lc_open_swift: this.editChargesDetails['update_lc_open_swift'],
			additional_header: this.editChargesDetails['additional_header'],
			additional_charges: this.editChargesDetails['additional_charges'],
			charges_date: this.editChargesDetails['charges_date']
		});


		this.myModal.show();

	}

	UpdateChargesSave() {

		let ChargesACcordingToBank = this.lcOpenChargesCalculation();
		//console.log(ChargesACcordingToBank, "ChargesACcordingToBank");
		let data = {
			update_lc_open_amt_inr: this.updateChargesForm.value.update_lc_open_amt_inr ? this.updateChargesForm.value.update_lc_open_amt_inr : 0,
			charges_date: this.updateChargesForm.value.charges_date ? this.updateChargesForm.value.charges_date : 0,
			update_lc_open_charges: this.updateChargesForm.value.update_lc_open_charges ? this.updateChargesForm.value.update_lc_open_charges : 0,
			update_lc_open_swift: this.updateChargesForm.value.update_lc_open_swift ? this.updateChargesForm.value.update_lc_open_swift : 0,
			additional_header: this.updateChargesForm.value.additional_header ? this.updateChargesForm.value.additional_header : null,
			additional_charges: this.updateChargesForm.value.additional_charges ? this.updateChargesForm.value.additional_charges : 0,
			total_chrages_bank: ChargesACcordingToBank
		}

		let body = {
			ChargesData: data,
			id: this.charge_id

		}

		this.CrudServices.updateData<any>(bankChargesList.update, body).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);

				this.myModal.hide();
				this.getBankChargesList();

			} else {
				this.toasterService.pop(response.message, response.message, response.data);
				this.myModal.hide();
				this.getBankChargesList();

			}
		});

	}

	lcOpenChargesCalculation() {
		//	console.log(this.editChargesDetails, "Previous");

		//	console.log(this.updateChargesForm.value, "Current");

		let lcOpenChargesAmount = Number(this.updateChargesForm.value.update_lc_open_amt_inr) *
			Number(Number(this.updateChargesForm.value.update_lc_open_charges) / 100);
		let lcOpenCgst = Number(lcOpenChargesAmount * (Number(this.cgstDbValue) / 100));
		let lcOpenSgst = Number(lcOpenChargesAmount * (Number(this.sgstDbValue) / 100));
		let lcOpenSwiftCgst = Number(this.updateChargesForm.value.update_lc_open_swift * (Number(this.cgstDbValue) / 100));
		let lcOpenSwiftSgst = Number(this.updateChargesForm.value.update_lc_open_swift * (Number(this.sgstDbValue) / 100));

		let totalChargesAccordingtoBank = Number(lcOpenChargesAmount) + Number(lcOpenCgst) + Number(lcOpenSgst) + Number(this.updateChargesForm.value.update_lc_open_swift) + Number(lcOpenSwiftCgst) + Number(lcOpenSwiftSgst) + Number(this.updateChargesForm.value.additional_charges);

		//	console.log(Number(lcOpenChargesAmount), Number(lcOpenCgst), Number(lcOpenSgst), Number(this.updateChargesForm.value.update_lc_open_swift), Number(lcOpenSwiftCgst), Number(lcOpenSwiftSgst), Number(this.updateChargesForm.value.additional_charges), "nnnnn");

		return totalChargesAccordingtoBank;




	}

	recalculateCharges(lc_id) {
		let body = {
			lc_id: lc_id
		};

		//	console.log(body);

		this.CrudServices.updateData<any>(bankChargesList.reCalculateCharges, body).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);

				this.myModal.hide();
				this.getBankChargesList();

			} else {
				this.toasterService.pop(response.message, response.message, response.data);
				this.myModal.hide();
				this.getBankChargesList();

			}
		});
	}

	calculateTotal() {

		//	console.log(this.ChargesList, "total_chrages_system");
		this.totalSystemCharges = 0;
		this.totalBankCharges = 0;

		for (const val of this.ChargesList) {
			//	console.log(val.total_chrages_system, "total_chrages_system");
			this.totalSystemCharges = this.totalSystemCharges + Number(val.total_chrages_system);
			this.totalBankCharges = this.totalBankCharges + Number(val.total_chrages_bank);
		}

	}

	checkVoucher(id, flag_check_enter) {
		//flag_check_enter
		//1- check 
		//2 - entered 
		let body = {
			id: id,
			flag_check_enter: flag_check_enter
		}
		this.CrudServices.getOne<any>(bankChargesList.voucher_check, body).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
				this.getBankChargesList();
			}
		});

	}

	calculatePortWiseCharges(lcOpenChargeDetails) {
		let totalBankCharges = lcOpenChargeDetails.total_chrages_bank;
		//	console.log(lcOpenChargeDetails, "lcOpenChargeDetails");

		let lcOpenSwiftSystem = lcOpenChargeDetails.lc_open_swift;
		let lcOpenSwiftBank = lcOpenChargeDetails.update_lc_open_swift;

		let finalLcSwift = 0;
		let reslcSwift = Number(lcOpenSwiftSystem) - Number(lcOpenSwiftBank);
		if (reslcSwift == 0) {
			finalLcSwift = lcOpenSwiftSystem;
		} else if (reslcSwift > 0) {
			finalLcSwift = lcOpenSwiftSystem;
		} else if (reslcSwift < 0) {
			finalLcSwift = lcOpenSwiftBank;
		}
		//	console.log(lcOpenSwiftSystem, lcOpenSwiftBank, finalLcSwift, "finalswift");

		let lcOpeningChargesSystem = Number(lcOpenChargeDetails.lc_open_amt_inr) * Number(lcOpenChargeDetails.lc_open_charges / 100);
		let lcOpeningChargesBank = Number(lcOpenChargeDetails.lc_open_amt_inr) * Number(lcOpenChargeDetails.update_lc_open_charges / 100);

		let finalLcOpeningChargesAmt = 0;

		let resLcOpeningChargesAmt = Number(lcOpeningChargesSystem) - Number(lcOpeningChargesBank);

		if (resLcOpeningChargesAmt == 0) {
			finalLcOpeningChargesAmt = lcOpeningChargesSystem;
		} else if (resLcOpeningChargesAmt > 0) {
			finalLcOpeningChargesAmt = lcOpeningChargesSystem;
		} else if (resLcOpeningChargesAmt < 0) {
			finalLcOpeningChargesAmt = lcOpeningChargesBank;
		}


		// console.log(lcOpeningChargesSystem,
		// 	finalLcOpeningChargesAmt,
		// 	lcOpeningChargesBank, "finallcopen");


		let finalAdditionalCharges = 0;

		if (lcOpenChargeDetails.additional_charges > 0) {
			finalAdditionalCharges = lcOpenChargeDetails.additional_charges;
		}






		let piArray = lcOpenChargeDetails.letter_of_credit.flc_proforma_invoices;
		//	console.log(piArray, "piArray");

		//e.g. total 110 qty - divid in two pi 40 qty n 70 qty 
		//Calculate Total  Pi Qty
		let totalPiQty = 0;
		for (let element1 of piArray) {
			let piQty = element1.pi_quantity;
			totalPiQty += piQty;
		}
		//Calculate Pecentage of total Qty for every qty store in array
		//e.g. x% of 110 is 40  = (40*100)/110 
		//e.g. x% of 110 is 70  = (70*100)/110 
		let percentageArray = [];
		for (let element2 of piArray) {
			let perOutWholePiQty = (Number(element2.pi_quantity) * 100) / Number(totalPiQty);
			percentageArray.push({
				invdPiPercent: perOutWholePiQty,
				port: element2.port_master.port_name,
				piQTy: element2.pi_quantity,
				piRate: element2.pi_rate,
				piNo: element2.proform_invoice_no
			})
		}

		// result percentageArray  loop over Total Charges Calculate By Bank To get port wise charges
		//suppose 5000 over all bank charges 
		// indvPercent of 5000 is your actual charges value againt every port
		let portWiseChargesArray = [];
		let portWiseChargesStr = '';
		for (let element3 of percentageArray) {
			let invdPiPer = element3.invdPiPercent;
			let portWiseCharges = (Number(invdPiPer) / 100) * Number(totalBankCharges);

			let portWiseSwift = (Number(invdPiPer) / 100) * Number(finalLcSwift);
			let portWiseLcOpenChargesAmt = (Number(invdPiPer) / 100) * Number(finalLcOpeningChargesAmt);
			let portWiseAdditionalCharges = (Number(invdPiPer) / 100) * Number(finalAdditionalCharges);


			portWiseChargesArray.push({
				portWiseCharges: portWiseCharges,
				port: element3.port,
				piQTy: element3.piQTy,
				piRate: element3.piRate,
				piNo: element3.piNo,
				portWiseSwift: portWiseSwift,
				portWiseLcOpenChargesAmt: portWiseLcOpenChargesAmt,
				portWiseAdditionalCharges: portWiseAdditionalCharges,

			});

			portWiseChargesStr += '<h5><i class="fa fa-ship" aria-hidden="true"></i><span class="badge badge-primary"><b>  ' + (element3.port) + '(' + (element3.piQTy).toFixed(2) + ')</span> <br> <i class="fa fa-inr" aria-hidden="true"></i> <span class="badge badge-primary">  ' + (portWiseCharges).toFixed(2) + '</span></h5> <hr>';

			// portWiseChargesStr += '<table border=1 style="width:5%" ><tr><td>PiQty</td><td>Port</td><td>Charges</td></tr><tr><td>'+(element3.piQTy).toFixed(2)+'</td><td>'+(element3.port)+'</td><td>'+(portWiseCharges).toFixed(2)+'</td></tr></table>';
		}

		//	console.log(portWiseChargesArray, "portWiseChargesArray");
		//	console.log(portWiseChargesStr);
		return portWiseChargesStr;
	}

	getPortWiseCharges(lcOpenChargeDetails) {

		let LcAmount = lcOpenChargeDetails.letter_of_credit.lc_amount;

		let totalBankCharges = lcOpenChargeDetails.total_chrages_bank;
		//	console.log(lcOpenChargeDetails, "lcOpenChargeDetails");

		let lcOpenSwiftSystem = lcOpenChargeDetails.lc_open_swift;
		let lcOpenSwiftBank = lcOpenChargeDetails.update_lc_open_swift;

		let finalLcSwift = 0;
		let reslcSwift = Number(lcOpenSwiftSystem) - Number(lcOpenSwiftBank);
		if (reslcSwift == 0) {
			finalLcSwift = lcOpenSwiftSystem;
		} else if (reslcSwift > 0) {
			finalLcSwift = lcOpenSwiftSystem;
		} else if (reslcSwift < 0) {
			finalLcSwift = lcOpenSwiftBank;
		}
		//	console.log(lcOpenSwiftSystem, lcOpenSwiftBank, finalLcSwift, "finalswift");

		let lcOpeningChargesSystem = Number(lcOpenChargeDetails.lc_open_amt_inr) * Number(lcOpenChargeDetails.lc_open_charges / 100);
		let lcOpeningChargesBank = Number(lcOpenChargeDetails.lc_open_amt_inr) * Number(lcOpenChargeDetails.update_lc_open_charges / 100);

		let finalLcOpeningChargesAmt = 0;

		let resLcOpeningChargesAmt = Number(lcOpeningChargesSystem) - Number(lcOpeningChargesBank);

		if (resLcOpeningChargesAmt == 0) {
			finalLcOpeningChargesAmt = lcOpeningChargesSystem;
		} else if (resLcOpeningChargesAmt > 0) {
			finalLcOpeningChargesAmt = lcOpeningChargesSystem;
		} else if (resLcOpeningChargesAmt < 0) {
			finalLcOpeningChargesAmt = lcOpeningChargesBank;
		}


		// console.log(lcOpeningChargesSystem,
		// 	finalLcOpeningChargesAmt,
		// 	lcOpeningChargesBank, "finallcopen");


		let finalAdditionalCharges = 0;

		if (lcOpenChargeDetails.additional_charges > 0) {
			finalAdditionalCharges = lcOpenChargeDetails.additional_charges;
		}






		let piArray = lcOpenChargeDetails.letter_of_credit.flc_proforma_invoices;
		//	console.log(piArray, "piArray");

		//e.g. total 110 qty - divid in two pi 40 qty n 70 qty 
		//Calculate Total  Pi Qty
		let totalPiQty = 0;
		for (let element1 of piArray) {
			let piQty = element1.pi_quantity;
			totalPiQty += piQty;
		}
		//Calculate Pecentage of total Qty for every qty store in array
		//e.g. x% of 110 is 40  = (40*100)/110 
		//e.g. x% of 110 is 70  = (70*100)/110 
		let percentageArray = [];
		for (let element2 of piArray) {
			let perOutWholePiQty = (Number(element2.pi_quantity) * 100) / Number(totalPiQty);
			percentageArray.push({
				invdPiPercent: perOutWholePiQty,
				port: element2.port_master.port_name,
				piQTy: element2.pi_quantity,
				piRate: element2.pi_rate,
				piNo: element2.proform_invoice_no
			})
		}

		// result percentageArray  loop over Total Charges Calculate By Bank To get port wise charges
		//suppose 5000 over all bank charges 
		// indvPercent of 5000 is your actual charges value againt every port
		let portWiseChargesArray = [];
		let portWiseChargesStr = '';
		let totalChargesWithoutGST = 0;
		for (let element3 of percentageArray) {
			let invdPiPer = element3.invdPiPercent;
			let portWiseCharges = (Number(invdPiPer) / 100) * Number(totalBankCharges);

			let portWiseSwift = (Number(invdPiPer) / 100) * Number(finalLcSwift);
			let portWiseLcOpenChargesAmt = (Number(invdPiPer) / 100) * Number(finalLcOpeningChargesAmt);
			let portWiseAdditionalCharges = (Number(invdPiPer) / 100) * Number(finalAdditionalCharges);


			portWiseChargesArray.push({
				portWiseCharges: Number(portWiseCharges.toFixed(3)),
				port: element3.port,
				piQTy: Number(element3.piQTy.toFixed(3)),
				piRate: Number(element3.piRate.toFixed(3)),
				piNo: element3.piNo,
				portWiseSwift: Number(portWiseSwift.toFixed(3)),
				portWiseLcOpenChargesAmt: Number(portWiseLcOpenChargesAmt.toFixed(3)),
				portWiseAdditionalCharges: Number(portWiseAdditionalCharges.toFixed(3)),
				totalPiValue: Number(element3.piQTy * element3.piRate)

			});

			totalChargesWithoutGST += Number(portWiseLcOpenChargesAmt) + Number(portWiseAdditionalCharges) + Number(portWiseSwift);


			// portWiseChargesStr += '<h5><i class="fa fa-ship" aria-hidden="true"></i><span class="badge badge-primary"><b>  ' + (element3.port) + '(' + (element3.piQTy).toFixed(2) + ')</span> <br> <i class="fa fa-inr" aria-hidden="true"></i> <span class="badge badge-primary">  ' + (portWiseCharges).toFixed(2) + '</span></h5> <hr>';

			// portWiseChargesStr += '<table border=1 style="width:5%" ><tr><td>PiQty</td><td>Port</td><td>Charges</td></tr><tr><td>'+(element3.piQTy).toFixed(2)+'</td><td>'+(element3.port)+'</td><td>'+(portWiseCharges).toFixed(2)+'</td></tr></table>';
		}

		//	console.log(portWiseChargesArray, "getPortWiseCharges");
		//	console.log(portWiseChargesStr);



		this.portWiseDetails = { LcAmount: LcAmount, totalChargesWithoutGST: totalChargesWithoutGST.toFixed(3), portDet: portWiseChargesArray }



		this.portModal.show();

	}


}
