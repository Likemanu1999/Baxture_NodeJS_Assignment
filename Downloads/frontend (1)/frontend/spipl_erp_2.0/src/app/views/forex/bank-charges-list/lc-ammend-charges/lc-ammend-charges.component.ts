import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { bankChargesList, lcAmmendmentCharges, ValueStore } from '../../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../../shared/crud-services/crud-services';
import { ExportService } from '../../../../shared/export-service/export-service';
import { PermissionService } from '../../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../../login/login.service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { insertToArray, searchInArray } from '../../../../shared/common-service/common-service';
import { UserDetails } from '../../../login/UserDetails.model';
import * as moment from 'moment';

pdfMake.vfs = pdfFonts.pdfMake.vfs;


@Component({
	selector: 'app-lc-ammend-charges',
	templateUrl: './lc-ammend-charges.component.html',
	styleUrls: ['./lc-ammend-charges.component.scss'],
	providers: [CrudServices, PermissionService, LoginService, DatePipe, ToasterService, ExportService],
	encapsulation: ViewEncapsulation.None,
})
export class LcAmmendChargesComponent implements OnInit {
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
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

	sgstDbValue: any;
	cgstDbValue: any;

	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	user: UserDetails;
	links: string[] = [];

	lc_ammend_recalculate = false;
	lc_ammend_update_charges = false;
	lc_ammend_portwise_charges = false;
	lc_ammend_checked_by = false;
	lc_ammend_entered_by = false;
	lc_ammend_entered_by_status = false;
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

		this.lc_ammend_recalculate = (this.links.indexOf('lc_ammend_recalculate') > -1);
		this.lc_ammend_update_charges = (this.links.indexOf('lc_ammend_update_charges') > -1);
		this.lc_ammend_portwise_charges = (this.links.indexOf('lc_ammend_portwise_charges') > -1);
		this.lc_ammend_checked_by = (this.links.indexOf('lc_ammend_checked_by') > -1);
		this.lc_ammend_entered_by = (this.links.indexOf('lc_ammend_entered_by') > -1);
		this.lc_ammend_entered_by_status = (this.links.indexOf('lc_ammend_entered_by_status') > -1);

		this.cols = [
			// { field: 'id', header: 'id' },
			{ field: 'bank_name', header: 'Bank Name' },
			{ field: 'lc_no', header: 'LC NO' },
			{ field: 'claimed_by_system', header: 'Claimed By System' },
			{ field: 'system_charges', header: 'System Charges' },
			{ field: 'claimed_by_bank', header: 'Claimed By Bank' },
			{ field: 'bank_charges', header: 'Bank Charges' },
			{ field: 'port_wise_charges', header: 'Port Wise Charges' },
			{ field: 'cheecked', header: 'Checked' },
			{ field: 'entered', header: 'Entered' },
			{ field: 'created_by', header: 'Created by' },
			{ field: 'created_date', header: 'Created Date' }
		];

		this._selectedColumns = this.cols;

		this.status = [{ id: 1, name: "Pending" }, { id: 2, name: "Complete" }];
		this.getBankChargesList();



	}
	onFilter(e, dt) {
		// this.pushDropdown(dt.filteredValue);
		this.pushDropdown(dt.filteredValue);
	}
	
	pushDropdown(data: any) {
		throw new Error('Method not implemented.');
	}
	
	ngOnInit() {

		this.isLoading = true;

		this.getBankChargesList();



		this.CrudServices.getAll<any>(ValueStore.getAll).subscribe((response) => {
			for (let elem of response) {

				if (elem.thekey == "company_name") {
					this.company_name = elem.value;
				}
				if (elem.thekey == "company_address") {
					this.company_address = elem.value;
				}
			}

		});

		this.CrudServices.getAll<any>(bankChargesList.getGSTValue).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.sgstDbValue = response.sgst;
				this.cgstDbValue = response.cgst;
			}

		});


		this.updateChargesForm = new FormGroup({
			update_lc_amt_inr: new FormControl(0),
			update_amd_ch_value_change: new FormControl(0),
			update_amd_ch_date_change: new FormControl(0),
			update_ammend_clause_charges: new FormControl(0),
			update_swift_charges: new FormControl(0),
			additional_charges: new FormControl(0),
			additional_header: new FormControl(null),
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

		this.ChargesList = this.globalList;
		if (event.id == 1) {
			this.ChargesList = this.ChargesList.filter(item => item.entered_by == null && item.checked_by != null);
		} else if (event.id == 2) {
			this.ChargesList = this.ChargesList.filter(item => item.entered_by != null && item.checked_by != null);
		}
		this.calculateTotal();
	}

	getBankChargesList() {
		this.ChargesList = [];
		let condition = {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD")
		  }
		this.CrudServices.getOne<any>(lcAmmendmentCharges.getAllNew,condition).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
				this.isLoading = false;
			//	this.ChargesList = [];
			} else {
				this.isLoading = false;
				//this.ChargesList = response;
			//	this.ChargesList = [];
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

				if (this.lc_ammend_entered_by_status) //Mayur Sir Pending List
				{
					this.ChargesList = this.globalList
				//this.ChargesList = this.ChargesList.filter(item => item.entered_by == null && item.checked_by != null);

				}


				this.calculateTotal();
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

	getDateDiff(fromDt, toDt) {
		// To set two dates to two variables 
		var date1 = new Date(fromDt);
		var date2 = new Date(toDt);

		var Time = date2.getTime() - date1.getTime();
		var Days = Time / (1000 * 3600 * 24); //Diference in Days
		return Days;
	}


	async generatePdf(lcAmmendDetails, create_update_flag) {

		let bankName = lcAmmendDetails.spipl_bank.bank_name;
		let bankGstNo = lcAmmendDetails.spipl_bank.gst_no;
		let bankAccountNo = lcAmmendDetails.spipl_bank.account_no;

		let supplierName = lcAmmendDetails.letter_of_credit.sub_org_master.sub_org_name;
		let totalUSD = lcAmmendDetails.letter_of_credit.lc_amount.toFixed(2);
		let bankLcNo = lcAmmendDetails.letter_of_credit.bank_lc_no;
		let lcOpeningDate = lcAmmendDetails.letter_of_credit.lc_opening_date;
		let lcOpenDate = lcOpeningDate.substr(8, 2) + '/' + lcOpeningDate.substr(5, 2) + '/' + lcOpeningDate.substr(0, 4);


		let tolerancevalue = lcAmmendDetails.letter_of_credit.tolerance;
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
		let lcRate = lcAmmendDetails.letter_of_credit.lc_rate.toFixed(2);

		let LC_AMOUNT_WITH_TOLERENCE_CASE = ''
		if (tolePercent == 0) {
			LC_AMOUNT_WITH_TOLERENCE_CASE = ' LC Amount USD ' + totalUSD + ' @ ' + lcRate + ' SR ';
		} else {
			LC_AMOUNT_WITH_TOLERENCE_CASE = ' LC Amount USD ' + totalUSD + '  ' + tolerance + ' Tolerance ' + tolrenaceAmount + ' USD ' + totalUSDwithTolereance + ' @ ' + lcRate + ' SR ';

		}

		let lcOpenInrAmtHead = lcAmmendDetails.lc_open_amt_inr.toFixed(2);

		let chargesDate = lcAmmendDetails.charges_date ? lcAmmendDetails.charges_date.substr(8, 2) + '/' + lcAmmendDetails.charges_date.substr(5, 2) + '/' + lcAmmendDetails.charges_date.substr(0, 4) : null;


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
								width: '*',

								text: [
									'Being LC Ammendment Charges debited by bank for ',
									{ text: supplierName, bold: true }, ' For USD ', { text: totalUSD, bold: true }, ' as per LC No. ', { text: bankLcNo, bold: true }, ' DTD ', { text: lcOpenDate, bold: true }],
								margin: [10, 5, 0, 0],
								style: 'tableHeader',
								colSpan: 3,
								alignment: 'center'
							}, {}, {}],

							[{ text: 'SR.NO.', bold: true, alignment: 'center' }, { text: ' PERTICULAR', bold: true, alignment: 'center' }, { text: 'AMOUNT', bold: true, alignment: 'center' }],

							[{ text: 'A]', alignment: 'center', border: [true, false, true, false] },
							{
								text: LC_AMOUNT_WITH_TOLERENCE_CASE, border: [false, false, true, false]
							},
							{ text: lcOpenInrAmtHead, alignment: 'right', border: [false, false, true, false] }

							],



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

						paddingLeft: function (i, node) { return 8; },
						paddingRight: function (i, node) { return 8; },
						paddingTop: function (i, node) { return 8; },
						paddingBottom: function (i, node) { return 8; },
					}

				},





			]

		};





		// let ammendValue = lcAmmendDetails.letter_of_credit.ammend_value;
		// let ammendDays = lcAmmendDetails.letter_of_credit.ammend_days;
		// let ammendClause = lcAmmendDetails.letter_of_credit.ammend_clause;
		// let ammendLcValue = lcAmmendDetails.letter_of_credit.ammend_lc_value;

		let ammendValue = lcAmmendDetails.ammendment_value;
		let ammendDays = lcAmmendDetails.ammendment_days;
		let ammendClause = lcAmmendDetails.ammendment_clause;
		let ammendLcValue = lcAmmendDetails.ammend_lc_value;

		let spiplBankName = lcAmmendDetails.spipl_bank.bank_name;
		let originalLcValue = lcAmmendDetails.letter_of_credit.lc_amount;
		let diffLcAmountUSD = 0;
		let diffLcAmountINR = 0;
		let toleranceOnDiffValue = 0;
		let valueAmmendTxt = '';
		if (Number(originalLcValue) < Number(ammendLcValue)) {
			diffLcAmountUSD = (Number(ammendLcValue) - Number(originalLcValue));
			toleranceOnDiffValue = Number(diffLcAmountUSD) * (Number(tolePercent) / 100);
			diffLcAmountINR = (diffLcAmountUSD) * Number(lcRate);

			valueAmmendTxt = '( Original LC Value ' + originalLcValue + ', Ammend LC Value In USD ' + ammendLcValue + ', \n Total Diffrence ' + diffLcAmountUSD + ', Tolerance On Diffrence  ' + toleranceOnDiffValue + ', \n Total Ammendment Value IN USD ' + (Number(diffLcAmountUSD) + Number(toleranceOnDiffValue)) + ')'
		}

		let lcPaymentTermOriginal = lcAmmendDetails.letter_of_credit.lcPaymentTerm ? lcAmmendDetails.letter_of_credit.lcPaymentTerm.pay_val : 0;

		let lcPaymentTermAmmend = lcAmmendDetails.payment_term_master ? lcAmmendDetails.payment_term_master.pay_val : 0;

		let lcExpiryDateOriginal = lcAmmendDetails.letter_of_credit.lc_expiry_date;
		let shipmentDateOriginal = lcAmmendDetails.letter_of_credit.date_of_shipment;

		let lcExpiryDateOriginalformat = lcExpiryDateOriginal ? lcExpiryDateOriginal.substr(8, 2) + '/' + lcExpiryDateOriginal.substr(5, 2) + '/' + lcExpiryDateOriginal.substr(0, 4) : null;


		let shipmentDateOriginalformat = shipmentDateOriginal ? shipmentDateOriginal.substr(8, 2) + '/' + shipmentDateOriginal.substr(5, 2) + '/' + shipmentDateOriginal.substr(0, 4) : null;

		let OriginalCommitmentPeriod = this.getDateDiff(lcOpeningDate, lcExpiryDateOriginal);
		let sbmOriginalCommitmentPeriod = this.getDateDiff(lcOpeningDate, shipmentDateOriginal);
		let commanAmdTxt = "";

		let ammendDateChangesTxt = '';
		if (spiplBankName == 'SBM BANK (INDIA) LIMITED') {
			commanAmdTxt = '(Shipment Date ' + shipmentDateOriginalformat + ', Commitment Days ' + sbmOriginalCommitmentPeriod + ', Pay Term ' + lcAmmendDetails.letter_of_credit.lcPaymentTerm.pay_term + ' ,Total Commitment + Usance Period ' + (Number(sbmOriginalCommitmentPeriod) + Number(lcPaymentTermOriginal)) + ' days)';

			let shipmentDateAmmend = lcAmmendDetails.ammend_shipment_date;
			let shipmentAmmendformat = shipmentDateAmmend ? shipmentDateAmmend.substr(8, 2) + '/' + shipmentDateAmmend.substr(5, 2) + '/' + shipmentDateAmmend.substr(0, 4) : null;
			let sbmAmmendCommitmentPeriod = this.getDateDiff(lcOpeningDate, shipmentDateAmmend);

			if (lcPaymentTermAmmend > lcPaymentTermOriginal && sbmAmmendCommitmentPeriod > OriginalCommitmentPeriod) {
				let ammendDateChangesTxt1 = '(Original Pay Term ' + lcAmmendDetails.letter_of_credit.lcPaymentTerm.pay_term + ', Ammend Pay Term ' + lcAmmendDetails.payment_term_master.pay_term + ', Shipment Date ' + shipmentAmmendformat + ', Total Commitment + Usance Days ' + (Number(sbmAmmendCommitmentPeriod) + Number(lcPaymentTermAmmend)) + ')';
				ammendDateChangesTxt = ammendDateChangesTxt1;

			} else if (lcPaymentTermAmmend > lcPaymentTermOriginal) {
				//change in LC Payment term
				ammendDateChangesTxt = '(Original Pay Term ' + lcAmmendDetails.letter_of_credit.lcPaymentTerm.pay_term + ', Ammend Pay Term ' + lcAmmendDetails.payment_term_master.pay_term + ', Shipment Date ' + shipmentDateOriginalformat + ' Total Commitment + Usance Days ' + (Number(OriginalCommitmentPeriod) + Number(lcPaymentTermOriginal)) + ')';

			} else if (sbmAmmendCommitmentPeriod > OriginalCommitmentPeriod) {
				ammendDateChangesTxt = '(Original Shipment Date ' + shipmentDateOriginalformat + ', Ammend Shipment Date ' + shipmentAmmendformat + ', Pay Term ' + lcAmmendDetails.letter_of_credit.lcPaymentTerm.pay_term + ' Total Commitment + Usance Days ' + (Number(sbmAmmendCommitmentPeriod) + Number(lcPaymentTermOriginal)) + ')';

			}


		} else {
			commanAmdTxt = '(Expiry Date ' + lcExpiryDateOriginalformat + ', Commitment Days ' + OriginalCommitmentPeriod + ', Pay Term ' + lcAmmendDetails.letter_of_credit.lcPaymentTerm.pay_term + ' ,Total Commitment + Usance Period ' + (Number(OriginalCommitmentPeriod) + Number(lcPaymentTermOriginal)) + ' days)';


			let lcExpiryDateAmmend = lcAmmendDetails.ammend_lc_expiry_date;


			let lcExpiryDateAmmendformat = lcExpiryDateAmmend ? lcExpiryDateAmmend.substr(8, 2) + '/' + lcExpiryDateAmmend.substr(5, 2) + '/' + lcExpiryDateAmmend.substr(0, 4) : null;
			let AmmendCommitmentPeriod = this.getDateDiff(lcOpeningDate, lcExpiryDateAmmend);

			if (lcPaymentTermAmmend > lcPaymentTermOriginal && AmmendCommitmentPeriod > OriginalCommitmentPeriod) {
				let ammendDateChangesTxt1 = '(Original Pay Term ' + lcAmmendDetails.letter_of_credit.lcPaymentTerm.pay_term + ', Ammend Pay Term ' + lcAmmendDetails.payment_term_master.pay_term + ', LC Expiry Date ' + lcExpiryDateAmmendformat + ', Total Commitment + Usance Days ' + (Number(AmmendCommitmentPeriod) + Number(lcPaymentTermAmmend)) + ')';
				ammendDateChangesTxt = ammendDateChangesTxt1;

			} else if (lcPaymentTermAmmend > lcPaymentTermOriginal) {
				//change in LC Payment term
				ammendDateChangesTxt = '(Original Pay Term ' + lcAmmendDetails.letter_of_credit.lcPaymentTerm.pay_term + ', Ammend Pay Term ' + lcAmmendDetails.payment_term_master.pay_term + ', LC Expiry Date ' + lcExpiryDateOriginalformat + ' Total Commitment + Usance Days ' + (Number(OriginalCommitmentPeriod) + Number(lcPaymentTermOriginal)) + ')';

			} else if (AmmendCommitmentPeriod > OriginalCommitmentPeriod) {
				ammendDateChangesTxt = '(Original Expiry Dt ' + lcExpiryDateOriginalformat + ', Ammend Expiry Dt ' + lcExpiryDateAmmendformat + ', Pay Term ' + lcAmmendDetails.letter_of_credit.lcPaymentTerm.pay_term + ' Total Commitment + Usance Days ' + (Number(AmmendCommitmentPeriod) + Number(lcPaymentTermOriginal)) + ')';

			}


		}














		let lcOpenInrAmt = 0;
		let vaLcOpenAmtInr = 0;
		let vaLcOpenPer = 0;
		let vaLcOpenChargesValue = 0;
		let vaLcOpenAmtCgst = 0;
		let vaLcOpenAmtSgst = 0;
		let daLcOpenAmtInr = 0;
		let daLcOpenPer = 0;
		let daLcOpenChargesValue = 0;
		let daLcOpenAmtCgst = 0;
		let daLcOpenAmtSgst = 0;
		let ammendmentClause = 0;
		let ammendmentClauseCgst = 0;
		let ammendmentClauseSgst = 0;
		let ammendmentSwift = 0;
		let ammendmentSwiftCgst = 0;
		let ammendmentSwiftSgst = 0;
		let totalSystemCharges = 0;


		if (ammendValue == 1 && ammendDays == 1) //Both Value and days ammendment
		{
			lcOpenInrAmt = lcAmmendDetails.lc_open_amt_inr.toFixed(2);
			vaLcOpenAmtInr = lcAmmendDetails.va_lc_open_amt_inr.toFixed(2);
			vaLcOpenPer = lcAmmendDetails.va_lc_open_per.toFixed(4);
			vaLcOpenChargesValue = lcAmmendDetails.va_lc_open_charges_value.toFixed(2);
			vaLcOpenAmtCgst = lcAmmendDetails.va_lc_open_amt_cgst.toFixed(2);
			vaLcOpenAmtSgst = lcAmmendDetails.va_lc_open_amt_sgst.toFixed(2);
			daLcOpenAmtInr = lcAmmendDetails.da_lc_open_amt_inr.toFixed(2);
			daLcOpenPer = lcAmmendDetails.da_lc_open_per.toFixed(4);
			daLcOpenChargesValue = lcAmmendDetails.da_lc_open_charges_value.toFixed(2);
			daLcOpenAmtCgst = lcAmmendDetails.da_lc_open_amt_cgst.toFixed(2);
			daLcOpenAmtSgst = lcAmmendDetails.da_lc_open_amt_sgst.toFixed(2);
			ammendmentClause = lcAmmendDetails.ammend_clause.toFixed(2);
			ammendmentClauseCgst = lcAmmendDetails.ammend_clause_cgst.toFixed(2);
			ammendmentClauseSgst = lcAmmendDetails.ammend_clause_sgst.toFixed(2);
			ammendmentSwift = lcAmmendDetails.ammend_swift.toFixed(2);
			ammendmentSwiftCgst = lcAmmendDetails.ammend_swift_cgst.toFixed(2);
			ammendmentSwiftSgst = lcAmmendDetails.ammend_swift_sgst.toFixed(2);
			totalSystemCharges = lcAmmendDetails.total_charges_system.toFixed(2);





			let valueAmmendDetails1 = [{ text: 'B]', alignment: 'center', border: [true, false, true, false] },
			{ text: 'Ammendment Charges for Value Change - LC Open (Usance+Commitment) Charges @ ' + vaLcOpenPer + '% on Value ' + vaLcOpenAmtInr + ' INR \n ' + valueAmmendTxt + '\n' + commanAmdTxt, border: [false, false, true, false] },
			{ text: vaLcOpenChargesValue, alignment: 'right', border: [false, false, true, false] }
			];

			let arr1 = docDefinition.content[0].table.body;
			var lc_amount_index = searchInArray(arr1, "LC Amount ");
			let newArr1 = insertToArray(arr1, valueAmmendDetails1, lc_amount_index);
			docDefinition.content[0].table.body = newArr1;

			let valueAmmendDetails2
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'CGST @ ' + this.cgstDbValue + '% on Ammendment Charges of Value Change', border: [false, false, true, false] },
				{ text: vaLcOpenAmtCgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr2 = docDefinition.content[0].table.body;
			let newArr2 = insertToArray(arr2, valueAmmendDetails2, lc_amount_index + 1);
			docDefinition.content[0].table.body = newArr2;

			let valueAmmendDetails3
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'SGST @ ' + this.sgstDbValue + '% on Ammendment Charges of Value Change', border: [false, false, true, false] },
				{ text: vaLcOpenAmtSgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr3 = docDefinition.content[0].table.body;
			let newArr3 = insertToArray(arr3, valueAmmendDetails3, lc_amount_index + 2);
			docDefinition.content[0].table.body = newArr3;

			let valueAmmendDetails4
				= [{ text: 'C]', alignment: 'center', border: [true, false, true, false] },
				{ text: 'Ammendment Charges for Date Change - LC Open (Usance+Commitment) Charges @ ' + daLcOpenPer + '% on Value ' + daLcOpenAmtInr + ' INR \n' + ammendDateChangesTxt, border: [false, false, true, false] },
				{ text: daLcOpenChargesValue, alignment: 'right', border: [false, false, true, false] }
				];

			let arr4 = docDefinition.content[0].table.body;
			let newArr4 = insertToArray(arr4, valueAmmendDetails4, lc_amount_index + 3);
			docDefinition.content[0].table.body = newArr4;

			let valueAmmendDetails5
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'CGST @ ' + this.cgstDbValue + '% on Ammendment Charges of Date Change', border: [false, false, true, false] },
				{ text: daLcOpenAmtCgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr5 = docDefinition.content[0].table.body;
			let newArr5 = insertToArray(arr5, valueAmmendDetails5, lc_amount_index + 4);
			docDefinition.content[0].table.body = newArr5;


			let valueAmmendDetails6
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'SGST @ ' + this.sgstDbValue + '% on Ammendment Charges of Date Change', border: [false, false, true, false] },
				{ text: daLcOpenAmtSgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr6 = docDefinition.content[0].table.body;
			let newArr6 = insertToArray(arr6, valueAmmendDetails6, lc_amount_index + 5);
			docDefinition.content[0].table.body = newArr6;


			let valueAmmendDetails7
				= [{ text: 'D]', alignment: 'center', border: [true, false, true, false] },
				{ text: 'Ammendment Clause Charges', border: [false, false, true, false] },
				{ text: ammendmentClause, alignment: 'right', border: [false, false, true, false] }
				];



			let arr7 = docDefinition.content[0].table.body;
			let newArr7 = insertToArray(arr7, valueAmmendDetails7, lc_amount_index + 6);
			docDefinition.content[0].table.body = newArr7;


			let valueAmmendDetails8
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'CGST @ ' + this.cgstDbValue + '% on Ammendment Clause Charges', border: [false, false, true, false] },
				{ text: ammendmentClauseCgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr8 = docDefinition.content[0].table.body;
			let newArr8 = insertToArray(arr8, valueAmmendDetails8, lc_amount_index + 7);
			docDefinition.content[0].table.body = newArr8;

			let valueAmmendDetails9
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'SGST @ ' + this.sgstDbValue + '% on Ammendment Clause Charges', border: [false, false, true, false] },
				{ text: ammendmentClauseSgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr9 = docDefinition.content[0].table.body;
			let newArr9 = insertToArray(arr9, valueAmmendDetails9, lc_amount_index + 8);
			docDefinition.content[0].table.body = newArr9;

			let valueAmmendDetails10
				= [{ text: 'E]', alignment: 'center', border: [true, false, true, false] },
				{ text: 'Swift Charges', border: [false, false, true, false] },
				{ text: ammendmentSwift, alignment: 'right', border: [false, false, true, false] }
				];

			let arr10 = docDefinition.content[0].table.body;
			let newArr10 = insertToArray(arr10, valueAmmendDetails10, lc_amount_index + 9);
			docDefinition.content[0].table.body = newArr10;

			let valueAmmendDetails11
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'CGST @ ' + this.cgstDbValue + '% on Swift Charges', border: [false, false, true, false] },
				{ text: ammendmentSwiftCgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr11 = docDefinition.content[0].table.body;
			let newArr11 = insertToArray(arr11, valueAmmendDetails11, lc_amount_index + 10);
			docDefinition.content[0].table.body = newArr11;

			let valueAmmendDetails12
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'SGST @ ' + this.sgstDbValue + '% on Swift Charges', border: [false, false, true, false] },
				{ text: ammendmentSwiftSgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr12 = docDefinition.content[0].table.body;
			let newArr12 = insertToArray(arr12, valueAmmendDetails12, lc_amount_index + 11);
			docDefinition.content[0].table.body = newArr12;

			let valueAmmendDetails13
				= [{ text: '', border: [true, true, true, true] },
				{ text: 'TOTAL CHARGES BY SYSTEM' },
				{ text: totalSystemCharges, alignment: 'right' }
				];

			let arr13 = docDefinition.content[0].table.body;
			let newArr13 = insertToArray(arr13, valueAmmendDetails13, lc_amount_index + 12);
			docDefinition.content[0].table.body = newArr13;



			if (create_update_flag == 2) {
				if (lcAmmendDetails.additional_charges != 0) {
					let additionalCharges = [];
					additionalCharges = [{ text: '', border: [true, false, true, false] }, { text: lcAmmendDetails.additional_header, border: [false, false, true, false] }, { text: lcAmmendDetails.additional_charges, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;
					var additional_charges_index = searchInArray(arr, 'SGST @ ' + this.sgstDbValue + '% on Swift Charges');
					let newArr = insertToArray(arr, additionalCharges, (additional_charges_index));
					docDefinition.content[0].table.body = newArr;
				}


				let defaultData = docDefinition.content[0].table.body;

				let short_excess_lc_open_inr_amt = 0;
				let short_excess_lc_open_inr_amt_show = '';
				let setExcessShortLcOpenInrAmt = [{ text: '', border: [true, false, true, false] }, { text: '', border: [false, false, true, false] }, { text: '', alignment: 'right', border: [false, false, true, false] }];

				if (lcAmmendDetails.lc_open_amt_inr > lcAmmendDetails.update_lc_amt_inr) {
					//short
					short_excess_lc_open_inr_amt = Number(lcAmmendDetails.lc_open_amt_inr - lcAmmendDetails.update_lc_amt_inr);

					short_excess_lc_open_inr_amt_show = '-' + short_excess_lc_open_inr_amt.toFixed(2);

					setExcessShortLcOpenInrAmt = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_lc_open_inr_amt_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_amount_index = searchInArray(arr, "LC Amount ");

					let newArr = insertToArray(arr, setExcessShortLcOpenInrAmt, lc_amount_index);
					docDefinition.content[0].table.body = newArr;

				} else if (lcAmmendDetails.lc_open_amt_inr < lcAmmendDetails.update_lc_amt_inr) {
					//excess
					short_excess_lc_open_inr_amt = Number(lcAmmendDetails.update_lc_amt_inr - lcAmmendDetails.lc_open_amt_inr);
					short_excess_lc_open_inr_amt_show = '+' + short_excess_lc_open_inr_amt.toFixed(2);
					setExcessShortLcOpenInrAmt = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_lc_open_inr_amt_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;
					var lc_amount_index = searchInArray(arr, "LC Amount ");
					let newArr = insertToArray(arr, setExcessShortLcOpenInrAmt, lc_amount_index);
					docDefinition.content[0].table.body = newArr;
				}

				let short_excess_ammend_value_charges = 0;
				let short_excess_ammend_value_charges_show = '';
				let setExcessShortAmmendValue = [];

				if (lcAmmendDetails.va_lc_open_charges_value > lcAmmendDetails.update_amd_ch_value_change) {
					//short
					short_excess_ammend_value_charges = Number(lcAmmendDetails.va_lc_open_charges_value - lcAmmendDetails.update_amd_ch_value_change);

					short_excess_ammend_value_charges_show = '-' + short_excess_ammend_value_charges.toFixed(2);

					setExcessShortAmmendValue = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_ammend_value_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Ammendment Charges for Value Change");

					let newArr = insertToArray(arr, setExcessShortAmmendValue, lc_open_index);
					docDefinition.content[0].table.body = newArr;

				} else if (lcAmmendDetails.va_lc_open_charges_value < lcAmmendDetails.update_amd_ch_value_change) {
					//excess
					short_excess_ammend_value_charges = Number(lcAmmendDetails.update_amd_ch_value_change - lcAmmendDetails.va_lc_open_charges_value);
					short_excess_ammend_value_charges_show = '+' + short_excess_ammend_value_charges.toFixed(2);

					setExcessShortAmmendValue = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_ammend_value_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Ammendment Charges for Value Change");

					let newArr = insertToArray(arr, setExcessShortAmmendValue, lc_open_index);
					docDefinition.content[0].table.body = newArr;
				}

				let short_excess_ammend_days_charges = 0;
				let short_excess_ammend_days_charges_show = '';
				let setExcessShortAmmendDays = [];

				if (lcAmmendDetails.da_lc_open_charges_value > lcAmmendDetails.update_amd_ch_date_change) {
					//short
					short_excess_ammend_days_charges = Number(lcAmmendDetails.da_lc_open_charges_value - lcAmmendDetails.update_amd_ch_date_change);

					short_excess_ammend_days_charges_show = '-' + short_excess_ammend_days_charges.toFixed(2);

					setExcessShortAmmendDays = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_ammend_days_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Ammendment Charges for Date Change");

					let newArr = insertToArray(arr, setExcessShortAmmendDays, lc_open_index);
					docDefinition.content[0].table.body = newArr;

				} else if (lcAmmendDetails.da_lc_open_charges_value < lcAmmendDetails.update_amd_ch_date_change) {
					//excess
					short_excess_ammend_days_charges = Number(lcAmmendDetails.update_amd_ch_date_change - lcAmmendDetails.da_lc_open_charges_value);
					short_excess_ammend_days_charges_show = '+' + short_excess_ammend_days_charges.toFixed(2);

					setExcessShortAmmendDays = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_ammend_days_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Ammendment Charges for Date Change");

					let newArr = insertToArray(arr, setExcessShortAmmendDays, lc_open_index);
					docDefinition.content[0].table.body = newArr;
				}



				let short_excess_ammend_clause_charges = 0;
				let short_excess_ammend_clause_charges_show = '';
				let setExcessShortAmmendClause = [];
				if (lcAmmendDetails.ammend_clause > lcAmmendDetails.update_ammend_clause_charges) {
					//short
					short_excess_ammend_clause_charges = Number(lcAmmendDetails.ammend_clause - lcAmmendDetails.update_ammend_clause_charges);

					short_excess_ammend_clause_charges_show = '-' + short_excess_ammend_clause_charges.toFixed(2);

					setExcessShortAmmendClause = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_ammend_clause_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Ammendment Clause Charges");

					let newArr = insertToArray(arr, setExcessShortAmmendClause, lc_open_index);
					docDefinition.content[0].table.body = newArr;

				} else if (lcAmmendDetails.ammend_clause < lcAmmendDetails.update_ammend_clause_charges) {
					//excess
					short_excess_ammend_clause_charges = Number(lcAmmendDetails.update_ammend_clause_charges - lcAmmendDetails.ammend_clause);
					short_excess_ammend_clause_charges_show = '+' + short_excess_ammend_clause_charges.toFixed(2);

					setExcessShortAmmendClause = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_ammend_clause_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Ammendment Clause Charges");

					let newArr = insertToArray(arr, setExcessShortAmmendClause, lc_open_index);
					docDefinition.content[0].table.body = newArr;
				}


				let short_excess_Swift_charges = 0;
				let short_excess_swift_charges_show = '';
				let setExcessShortswift = [];

				if (lcAmmendDetails.ammend_swift > lcAmmendDetails.update_swift_charges) {
					//short
					short_excess_Swift_charges = Number(lcAmmendDetails.ammend_swift - lcAmmendDetails.update_swift_charges);

					short_excess_swift_charges_show = '-' + short_excess_Swift_charges.toFixed(2);

					setExcessShortswift = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_swift_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Swift Charges");

					let newArr = insertToArray(arr, setExcessShortswift, lc_open_index);
					docDefinition.content[0].table.body = newArr;

				} else if (lcAmmendDetails.ammend_swift < lcAmmendDetails.update_swift_charges) {
					//excess
					short_excess_Swift_charges = Number(lcAmmendDetails.update_swift_charges - lcAmmendDetails.ammend_swift);
					short_excess_swift_charges_show = '+' + short_excess_Swift_charges.toFixed(2);

					setExcessShortswift = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_swift_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Swift Charges");

					let newArr = insertToArray(arr, setExcessShortswift, lc_open_index);
					docDefinition.content[0].table.body = newArr;
				}



				let totalChargesAccordingToBank = lcAmmendDetails.total_charges_bank;


				let short_excess_bank_charges = 0;
				let short_excess_bank_charges_show = '';
				let totalBankCharges = [];
				if (lcAmmendDetails.total_charges_system > totalChargesAccordingToBank) {


					short_excess_bank_charges = Number(lcAmmendDetails.total_charges_system) - Number(totalChargesAccordingToBank);
					short_excess_bank_charges_show = '-' + short_excess_bank_charges.toFixed(2);

					totalBankCharges = [{ text: '', border: [true, false, true, false] }, { text: 'Short Charges According to Bank ', border: [false, false, true, false] }, { text: short_excess_bank_charges_show, alignment: 'right', border: [false, false, true, false] }];


					let arr = docDefinition.content[0].table.body;
					var total_bank_charges_index = searchInArray(arr, "TOTAL CHARGES BY SYSTEM");
					let newArr = insertToArray(arr, totalBankCharges, (total_bank_charges_index - 1));
					docDefinition.content[0].table.body = newArr;


				} else if (lcAmmendDetails.total_charges_system < totalChargesAccordingToBank) {
					short_excess_bank_charges = Number(totalChargesAccordingToBank - lcAmmendDetails.total_charges_system);
					short_excess_bank_charges_show = '+' + short_excess_bank_charges.toFixed(2);

					totalBankCharges = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Charges According to Bank ', border: [false, false, true, false] }, { text: short_excess_bank_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;
					var total_bank_charges_index = searchInArray(arr, "TOTAL CHARGES BY SYSTEM");
					let newArr = insertToArray(arr, totalBankCharges, (total_bank_charges_index - 1));
					docDefinition.content[0].table.body = newArr;


				}


				totalBankCharges = [{ text: '', border: [true, true, true, true] }, { text: 'TOTAL CHARGES DEBITED BY BANK', border: [true, true, true, true] }, { text: totalChargesAccordingToBank, alignment: 'right', border: [true, true, true, true] }];

				let arr = docDefinition.content[0].table.body;
				var total_bank_charges_index = searchInArray(arr, "TOTAL CHARGES BY SYSTEM");
				let newArrBank = insertToArray(arr, totalBankCharges, (total_bank_charges_index + 1));
				docDefinition.content[0].table.body = newArrBank;
			}





		} else if (ammendValue == 1) {


			lcOpenInrAmt = lcAmmendDetails.lc_open_amt_inr.toFixed(2);
			vaLcOpenAmtInr = lcAmmendDetails.va_lc_open_amt_inr.toFixed(2);
			vaLcOpenPer = lcAmmendDetails.va_lc_open_per.toFixed(4);
			vaLcOpenChargesValue = lcAmmendDetails.va_lc_open_charges_value.toFixed(2);
			vaLcOpenAmtCgst = lcAmmendDetails.va_lc_open_amt_cgst.toFixed(2);
			vaLcOpenAmtSgst = lcAmmendDetails.va_lc_open_amt_sgst.toFixed(2);
			ammendmentClause = lcAmmendDetails.ammend_clause.toFixed(2);
			ammendmentClauseCgst = lcAmmendDetails.ammend_clause_cgst.toFixed(2);
			ammendmentClauseSgst = lcAmmendDetails.ammend_clause_sgst.toFixed(2);
			ammendmentSwift = lcAmmendDetails.ammend_swift.toFixed(2);
			ammendmentSwiftCgst = lcAmmendDetails.ammend_swift_cgst.toFixed(2);
			ammendmentSwiftSgst = lcAmmendDetails.ammend_swift_sgst.toFixed(2);
			totalSystemCharges = lcAmmendDetails.total_charges_system.toFixed(2);


			//Ammendment is done only incase of ammendment amount is higher than lc amount
			// if(lcAmmendDetails.letter_of_credit.ammend_lc_value > lcAmmendDetails.letter_of_credit.lc_amount)

			let valueAmmendDetails1 = [{ text: 'B]', alignment: 'center', border: [true, false, true, false] },
			{ text: 'Ammendment Charges for Value Change - LC Open (Usance+Commitment) Charges @ ' + vaLcOpenPer + '% on Value ' + vaLcOpenAmtInr + ' INR \n' + valueAmmendTxt + '\n' + commanAmdTxt, border: [false, false, true, false] },
			{ text: vaLcOpenChargesValue, alignment: 'right', border: [false, false, true, false] }
			];

			let arr1 = docDefinition.content[0].table.body;
			var lc_amount_index = searchInArray(arr1, "LC Amount ");
			let newArr1 = insertToArray(arr1, valueAmmendDetails1, lc_amount_index);
			docDefinition.content[0].table.body = newArr1;

			let valueAmmendDetails2
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'CGST @ ' + this.cgstDbValue + '% on Ammendment Charges of Value Change', border: [false, false, true, false] },
				{ text: vaLcOpenAmtCgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr2 = docDefinition.content[0].table.body;
			let newArr2 = insertToArray(arr2, valueAmmendDetails2, lc_amount_index + 1);
			docDefinition.content[0].table.body = newArr2;

			let valueAmmendDetails3
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'SGST @ ' + this.sgstDbValue + '% on Ammendment Charges of Value Change', border: [false, false, true, false] },
				{ text: vaLcOpenAmtSgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr3 = docDefinition.content[0].table.body;
			let newArr3 = insertToArray(arr3, valueAmmendDetails3, lc_amount_index + 2);
			docDefinition.content[0].table.body = newArr3;








			let valueAmmendDetails7
				= [{ text: 'C]', alignment: 'center', border: [true, false, true, false] },
				{ text: 'Ammendment Clause Charges', border: [false, false, true, false] },
				{ text: ammendmentClause, alignment: 'right', border: [false, false, true, false] }
				];



			let arr7 = docDefinition.content[0].table.body;
			let newArr7 = insertToArray(arr7, valueAmmendDetails7, lc_amount_index + 3);
			docDefinition.content[0].table.body = newArr7;


			let valueAmmendDetails8
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'CGST @ ' + this.cgstDbValue + '% on Ammendment Clause Charges', border: [false, false, true, false] },
				{ text: ammendmentClauseCgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr8 = docDefinition.content[0].table.body;
			let newArr8 = insertToArray(arr8, valueAmmendDetails8, lc_amount_index + 4);
			docDefinition.content[0].table.body = newArr8;

			let valueAmmendDetails9
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'SGST @ ' + this.sgstDbValue + '% on Ammendment Clause Charges', border: [false, false, true, false] },
				{ text: ammendmentClauseSgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr9 = docDefinition.content[0].table.body;
			let newArr9 = insertToArray(arr9, valueAmmendDetails9, lc_amount_index + 5);
			docDefinition.content[0].table.body = newArr9;

			let valueAmmendDetails10
				= [{ text: 'D]', alignment: 'center', border: [true, false, true, false] },
				{ text: 'Swift Charges', border: [false, false, true, false] },
				{ text: ammendmentSwift, alignment: 'right', border: [false, false, true, false] }
				];

			let arr10 = docDefinition.content[0].table.body;
			let newArr10 = insertToArray(arr10, valueAmmendDetails10, lc_amount_index + 6);
			docDefinition.content[0].table.body = newArr10;

			let valueAmmendDetails11
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'CGST @ ' + this.cgstDbValue + '% on Swift Charges', border: [false, false, true, false] },
				{ text: ammendmentSwiftCgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr11 = docDefinition.content[0].table.body;
			let newArr11 = insertToArray(arr11, valueAmmendDetails11, lc_amount_index + 7);
			docDefinition.content[0].table.body = newArr11;

			let valueAmmendDetails12
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'SGST @ ' + this.sgstDbValue + '% on Swift Charges', border: [false, false, true, false] },
				{ text: ammendmentSwiftSgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr12 = docDefinition.content[0].table.body;
			let newArr12 = insertToArray(arr12, valueAmmendDetails12, lc_amount_index + 8);
			docDefinition.content[0].table.body = newArr12;

			let valueAmmendDetails13
				= [{ text: '', border: [true, true, true, true] },
				{ text: 'TOTAL CHARGES BY SYSTEM' },
				{ text: totalSystemCharges, alignment: 'right' }
				];

			let arr13 = docDefinition.content[0].table.body;
			let newArr13 = insertToArray(arr13, valueAmmendDetails13, lc_amount_index + 9);
			docDefinition.content[0].table.body = newArr13;


			if (create_update_flag == 2) {
				if (lcAmmendDetails.additional_charges != 0) {
					let additionalCharges = [];
					additionalCharges = [{ text: '', border: [true, false, true, false] }, { text: lcAmmendDetails.additional_header, border: [false, false, true, false] }, { text: lcAmmendDetails.additional_charges, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;
					var additional_charges_index = searchInArray(arr, 'SGST @ ' + this.sgstDbValue + '% on Swift Charges');
					let newArr = insertToArray(arr, additionalCharges, (additional_charges_index));
					docDefinition.content[0].table.body = newArr;
				}


				let defaultData = docDefinition.content[0].table.body;

				let short_excess_lc_open_inr_amt = 0;
				let short_excess_lc_open_inr_amt_show = '';
				let setExcessShortLcOpenInrAmt = [{ text: '', border: [true, false, true, false] }, { text: '', border: [false, false, true, false] }, { text: '', alignment: 'right', border: [false, false, true, false] }];

				if (lcAmmendDetails.lc_open_amt_inr > lcAmmendDetails.update_lc_amt_inr) {
					//short
					short_excess_lc_open_inr_amt = Number(lcAmmendDetails.lc_open_amt_inr - lcAmmendDetails.update_lc_amt_inr);

					short_excess_lc_open_inr_amt_show = '-' + short_excess_lc_open_inr_amt.toFixed(2);

					setExcessShortLcOpenInrAmt = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_lc_open_inr_amt_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_amount_index = searchInArray(arr, "LC Amount ");

					let newArr = insertToArray(arr, setExcessShortLcOpenInrAmt, lc_amount_index);
					docDefinition.content[0].table.body = newArr;

				} else if (lcAmmendDetails.lc_open_amt_inr < lcAmmendDetails.update_lc_amt_inr) {
					//excess
					short_excess_lc_open_inr_amt = Number(lcAmmendDetails.update_lc_amt_inr - lcAmmendDetails.lc_open_amt_inr);
					short_excess_lc_open_inr_amt_show = '+' + short_excess_lc_open_inr_amt.toFixed(2);
					setExcessShortLcOpenInrAmt = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_lc_open_inr_amt_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;
					var lc_amount_index = searchInArray(arr, "LC Amount ");
					let newArr = insertToArray(arr, setExcessShortLcOpenInrAmt, lc_amount_index);
					docDefinition.content[0].table.body = newArr;
				}

				let short_excess_ammend_value_charges = 0;
				let short_excess_ammend_value_charges_show = '';
				let setExcessShortAmmendValue = [];

				if (lcAmmendDetails.va_lc_open_charges_value > lcAmmendDetails.update_amd_ch_value_change) {
					//short
					short_excess_ammend_value_charges = Number(lcAmmendDetails.va_lc_open_charges_value - lcAmmendDetails.update_amd_ch_value_change);

					short_excess_ammend_value_charges_show = '-' + short_excess_ammend_value_charges.toFixed(2);

					setExcessShortAmmendValue = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_ammend_value_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Ammendment Charges for Value Change");

					let newArr = insertToArray(arr, setExcessShortAmmendValue, lc_open_index);
					docDefinition.content[0].table.body = newArr;

				} else if (lcAmmendDetails.va_lc_open_charges_value < lcAmmendDetails.update_amd_ch_value_change) {
					//excess
					short_excess_ammend_value_charges = Number(lcAmmendDetails.update_amd_ch_value_change - lcAmmendDetails.va_lc_open_charges_value);
					short_excess_ammend_value_charges_show = '+' + short_excess_ammend_value_charges.toFixed(2);

					setExcessShortAmmendValue = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_ammend_value_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Ammendment Charges for Value Change");

					let newArr = insertToArray(arr, setExcessShortAmmendValue, lc_open_index);
					docDefinition.content[0].table.body = newArr;
				}



				let short_excess_ammend_clause_charges = 0;
				let short_excess_ammend_clause_charges_show = '';
				let setExcessShortAmmendClause = [];
				if (lcAmmendDetails.ammend_clause > lcAmmendDetails.update_ammend_clause_charges) {
					//short
					short_excess_ammend_clause_charges = Number(lcAmmendDetails.ammend_clause - lcAmmendDetails.update_ammend_clause_charges);

					short_excess_ammend_clause_charges_show = '-' + short_excess_ammend_clause_charges.toFixed(2);

					setExcessShortAmmendClause = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_ammend_clause_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Ammendment Clause Charges");

					let newArr = insertToArray(arr, setExcessShortAmmendClause, lc_open_index);
					docDefinition.content[0].table.body = newArr;

				} else if (lcAmmendDetails.ammend_clause < lcAmmendDetails.update_ammend_clause_charges) {
					//excess
					short_excess_ammend_clause_charges = Number(lcAmmendDetails.update_ammend_clause_charges - lcAmmendDetails.ammend_clause);
					short_excess_ammend_clause_charges_show = '+' + short_excess_ammend_clause_charges.toFixed(2);

					setExcessShortAmmendClause = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_ammend_clause_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Ammendment Clause Charges");

					let newArr = insertToArray(arr, setExcessShortAmmendClause, lc_open_index);
					docDefinition.content[0].table.body = newArr;
				}


				let short_excess_Swift_charges = 0;
				let short_excess_swift_charges_show = '';
				let setExcessShortswift = [];

				if (lcAmmendDetails.ammend_swift > lcAmmendDetails.update_swift_charges) {
					//short
					short_excess_Swift_charges = Number(lcAmmendDetails.ammend_swift - lcAmmendDetails.update_swift_charges);

					short_excess_swift_charges_show = '-' + short_excess_Swift_charges.toFixed(2);

					setExcessShortswift = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_swift_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Swift Charges");

					let newArr = insertToArray(arr, setExcessShortswift, lc_open_index);
					docDefinition.content[0].table.body = newArr;

				} else if (lcAmmendDetails.ammend_swift < lcAmmendDetails.update_swift_charges) {
					//excess
					short_excess_Swift_charges = Number(lcAmmendDetails.update_swift_charges - lcAmmendDetails.ammend_swift);
					short_excess_swift_charges_show = '+' + short_excess_Swift_charges.toFixed(2);

					setExcessShortswift = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_swift_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Swift Charges");

					let newArr = insertToArray(arr, setExcessShortswift, lc_open_index);
					docDefinition.content[0].table.body = newArr;
				}


				let totalChargesAccordingToBank = lcAmmendDetails.total_charges_bank;


				let short_excess_bank_charges = 0;
				let short_excess_bank_charges_show = '';
				let totalBankCharges = [];
				if (lcAmmendDetails.total_charges_system > totalChargesAccordingToBank) {

					short_excess_bank_charges = Number(lcAmmendDetails.total_charges_system) - Number(totalChargesAccordingToBank);

					short_excess_bank_charges_show = '-' + short_excess_bank_charges.toFixed(2);

					totalBankCharges = [{ text: '', border: [true, false, true, false] }, { text: 'Short Charges According to Bank ', border: [false, false, true, false] }, { text: short_excess_bank_charges_show, alignment: 'right', border: [false, false, true, false] }];


					let arr = docDefinition.content[0].table.body;
					var total_bank_charges_index = searchInArray(arr, "TOTAL CHARGES BY SYSTEM");
					let newArr = insertToArray(arr, totalBankCharges, (total_bank_charges_index - 1));
					docDefinition.content[0].table.body = newArr;


				} else if (lcAmmendDetails.total_charges_system < totalChargesAccordingToBank) {
					short_excess_bank_charges = Number(totalChargesAccordingToBank - lcAmmendDetails.total_charges_system);
					short_excess_bank_charges_show = '+' + short_excess_bank_charges.toFixed(2);

					totalBankCharges = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Charges According to Bank ', border: [false, false, true, false] }, { text: short_excess_bank_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;
					var total_bank_charges_index = searchInArray(arr, "TOTAL CHARGES BY SYSTEM");
					let newArr = insertToArray(arr, totalBankCharges, (total_bank_charges_index - 1));
					docDefinition.content[0].table.body = newArr;


				}

				totalBankCharges = [{ text: '', border: [true, true, true, true] }, { text: 'TOTAL CHARGES DEBITED BY BANK', border: [true, true, true, true] }, { text: totalChargesAccordingToBank, alignment: 'right', border: [true, true, true, true] }];

				let arr = docDefinition.content[0].table.body;
				var total_bank_charges_index = searchInArray(arr, "TOTAL CHARGES BY SYSTEM");
				let newArrBank = insertToArray(arr, totalBankCharges, (total_bank_charges_index + 1));
				docDefinition.content[0].table.body = newArrBank;

			}



		} else if (ammendDays == 1) {

			lcOpenInrAmt = lcAmmendDetails.lc_open_amt_inr.toFixed(2);
			daLcOpenAmtInr = lcAmmendDetails.da_lc_open_amt_inr.toFixed(2);
			daLcOpenPer = lcAmmendDetails.da_lc_open_per.toFixed(4);
			daLcOpenChargesValue = lcAmmendDetails.da_lc_open_charges_value.toFixed(2);
			daLcOpenAmtCgst = lcAmmendDetails.da_lc_open_amt_cgst.toFixed(2);
			daLcOpenAmtSgst = lcAmmendDetails.da_lc_open_amt_sgst.toFixed(2);
			ammendmentClause = lcAmmendDetails.ammend_clause.toFixed(2);
			ammendmentClauseCgst = lcAmmendDetails.ammend_clause_cgst.toFixed(2);
			ammendmentClauseSgst = lcAmmendDetails.ammend_clause_sgst.toFixed(2);
			ammendmentSwift = lcAmmendDetails.ammend_swift.toFixed(2);
			ammendmentSwiftCgst = lcAmmendDetails.ammend_swift_cgst.toFixed(2);
			ammendmentSwiftSgst = lcAmmendDetails.ammend_swift_sgst.toFixed(2);
			totalSystemCharges = lcAmmendDetails.total_charges_system.toFixed(2);






			let valueAmmendDetails4
				= [{ text: 'B]', alignment: 'center', border: [true, false, true, false] },
				{ text: 'Ammendment Charges for Date Change - LC Open (Usance+Commitment) Charges @ ' + daLcOpenPer + '% on Value ' + daLcOpenAmtInr + ' INR \n' + ammendDateChangesTxt + '\n' + commanAmdTxt, border: [false, false, true, false] },
				{ text: daLcOpenChargesValue, alignment: 'right', border: [false, false, true, false] }
				];

			let arr4 = docDefinition.content[0].table.body;
			var lc_amount_index = searchInArray(arr4, "LC Amount ");
			let newArr4 = insertToArray(arr4, valueAmmendDetails4, lc_amount_index);
			docDefinition.content[0].table.body = newArr4;

			let valueAmmendDetails5
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'CGST @ ' + this.cgstDbValue + '% on Ammendment Charges of Date Change', border: [false, false, true, false] },
				{ text: daLcOpenAmtCgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr5 = docDefinition.content[0].table.body;
			let newArr5 = insertToArray(arr5, valueAmmendDetails5, lc_amount_index + 1);
			docDefinition.content[0].table.body = newArr5;


			let valueAmmendDetails6
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'SGST @ ' + this.sgstDbValue + '% on Ammendment Charges of Date Change', border: [false, false, true, false] },
				{ text: daLcOpenAmtSgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr6 = docDefinition.content[0].table.body;
			let newArr6 = insertToArray(arr6, valueAmmendDetails6, lc_amount_index + 2);
			docDefinition.content[0].table.body = newArr6;


			let valueAmmendDetails7
				= [{ text: 'C]', alignment: 'center', border: [true, false, true, false] },
				{ text: 'Ammendment Clause Charges', border: [false, false, true, false] },
				{ text: ammendmentClause, alignment: 'right', border: [false, false, true, false] }
				];



			let arr7 = docDefinition.content[0].table.body;
			let newArr7 = insertToArray(arr7, valueAmmendDetails7, lc_amount_index + 3);
			docDefinition.content[0].table.body = newArr7;


			let valueAmmendDetails8
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'CGST @ ' + this.cgstDbValue + '% on Ammendment Clause Charges', border: [false, false, true, false] },
				{ text: ammendmentClauseCgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr8 = docDefinition.content[0].table.body;
			let newArr8 = insertToArray(arr8, valueAmmendDetails8, lc_amount_index + 4);
			docDefinition.content[0].table.body = newArr8;

			let valueAmmendDetails9
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'SGST @ ' + this.sgstDbValue + '% on Ammendment Clause Charges', border: [false, false, true, false] },
				{ text: ammendmentClauseSgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr9 = docDefinition.content[0].table.body;
			let newArr9 = insertToArray(arr9, valueAmmendDetails9, lc_amount_index + 5);
			docDefinition.content[0].table.body = newArr9;

			let valueAmmendDetails10
				= [{ text: 'D]', alignment: 'center', border: [true, false, true, false] },
				{ text: 'Swift Charges', border: [false, false, true, false] },
				{ text: ammendmentSwift, alignment: 'right', border: [false, false, true, false] }
				];

			let arr10 = docDefinition.content[0].table.body;
			let newArr10 = insertToArray(arr10, valueAmmendDetails10, lc_amount_index + 6);
			docDefinition.content[0].table.body = newArr10;

			let valueAmmendDetails11
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'CGST @ ' + this.cgstDbValue + '% on Swift Charges', border: [false, false, true, false] },
				{ text: ammendmentSwiftCgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr11 = docDefinition.content[0].table.body;
			let newArr11 = insertToArray(arr11, valueAmmendDetails11, lc_amount_index + 7);
			docDefinition.content[0].table.body = newArr11;

			let valueAmmendDetails12
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'SGST @ ' + this.sgstDbValue + '% on Swift Charges', border: [false, false, true, false] },
				{ text: ammendmentSwiftSgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr12 = docDefinition.content[0].table.body;
			let newArr12 = insertToArray(arr12, valueAmmendDetails12, lc_amount_index + 8);
			docDefinition.content[0].table.body = newArr12;

			let valueAmmendDetails13
				= [{ text: '', border: [true, true, true, true] },
				{ text: 'TOTAL CHARGES BY SYSTEM' },
				{ text: totalSystemCharges, alignment: 'right' }
				];

			let arr13 = docDefinition.content[0].table.body;
			let newArr13 = insertToArray(arr13, valueAmmendDetails13, lc_amount_index + 9);
			docDefinition.content[0].table.body = newArr13;



			if (create_update_flag == 2) {
				if (lcAmmendDetails.additional_charges != 0) {
					let additionalCharges = [];
					additionalCharges = [{ text: '', border: [true, false, true, false] }, { text: lcAmmendDetails.additional_header, border: [false, false, true, false] }, { text: lcAmmendDetails.additional_charges, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;
					var additional_charges_index = searchInArray(arr, 'SGST @ ' + this.sgstDbValue + '% on Swift Charges');
					let newArr = insertToArray(arr, additionalCharges, (additional_charges_index));
					docDefinition.content[0].table.body = newArr;
				}


				let defaultData = docDefinition.content[0].table.body;

				let short_excess_lc_open_inr_amt = 0;
				let short_excess_lc_open_inr_amt_show = '';
				let setExcessShortLcOpenInrAmt = [{ text: '', border: [true, false, true, false] }, { text: '', border: [false, false, true, false] }, { text: '', alignment: 'right', border: [false, false, true, false] }];

				if (lcAmmendDetails.lc_open_amt_inr > lcAmmendDetails.update_lc_amt_inr) {
					//short
					short_excess_lc_open_inr_amt = Number(lcAmmendDetails.lc_open_amt_inr - lcAmmendDetails.update_lc_amt_inr);

					short_excess_lc_open_inr_amt_show = '-' + short_excess_lc_open_inr_amt.toFixed(2);

					setExcessShortLcOpenInrAmt = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_lc_open_inr_amt_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_amount_index = searchInArray(arr, "LC Amount ");

					let newArr = insertToArray(arr, setExcessShortLcOpenInrAmt, lc_amount_index);
					docDefinition.content[0].table.body = newArr;

				} else if (lcAmmendDetails.lc_open_amt_inr < lcAmmendDetails.update_lc_amt_inr) {
					//excess
					short_excess_lc_open_inr_amt = Number(lcAmmendDetails.update_lc_amt_inr - lcAmmendDetails.lc_open_amt_inr);
					short_excess_lc_open_inr_amt_show = '+' + short_excess_lc_open_inr_amt.toFixed(2);
					setExcessShortLcOpenInrAmt = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_lc_open_inr_amt_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;
					var lc_amount_index = searchInArray(arr, "LC Amount ");
					let newArr = insertToArray(arr, setExcessShortLcOpenInrAmt, lc_amount_index);
					docDefinition.content[0].table.body = newArr;
				}

				let short_excess_ammend_days_charges = 0;
				let short_excess_ammend_days_charges_show = '';
				let setExcessShortAmmendDays = [];

				if (lcAmmendDetails.da_lc_open_charges_value > lcAmmendDetails.update_amd_ch_date_change) {
					//short
					short_excess_ammend_days_charges = Number(lcAmmendDetails.da_lc_open_charges_value - lcAmmendDetails.update_amd_ch_date_change);

					short_excess_ammend_days_charges_show = '-' + short_excess_ammend_days_charges.toFixed(2);

					setExcessShortAmmendDays = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_ammend_days_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Ammendment Charges for Date Change");

					let newArr = insertToArray(arr, setExcessShortAmmendDays, lc_open_index);
					docDefinition.content[0].table.body = newArr;

				} else if (lcAmmendDetails.da_lc_open_charges_value < lcAmmendDetails.update_amd_ch_date_change) {
					//excess
					short_excess_ammend_days_charges = Number(lcAmmendDetails.update_amd_ch_date_change - lcAmmendDetails.da_lc_open_charges_value);
					short_excess_ammend_days_charges_show = '+' + short_excess_ammend_days_charges.toFixed(2);

					setExcessShortAmmendDays = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_ammend_days_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Ammendment Charges for Date Change");

					let newArr = insertToArray(arr, setExcessShortAmmendDays, lc_open_index);
					docDefinition.content[0].table.body = newArr;
				}



				let short_excess_ammend_clause_charges = 0;
				let short_excess_ammend_clause_charges_show = '';
				let setExcessShortAmmendClause = [];
				if (lcAmmendDetails.ammend_clause > lcAmmendDetails.update_ammend_clause_charges) {
					//short
					short_excess_ammend_clause_charges = Number(lcAmmendDetails.ammend_clause - lcAmmendDetails.update_ammend_clause_charges);

					short_excess_ammend_clause_charges_show = '-' + short_excess_ammend_clause_charges.toFixed(2);

					setExcessShortAmmendClause = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_ammend_clause_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Ammendment Clause Charges");

					let newArr = insertToArray(arr, setExcessShortAmmendClause, lc_open_index);
					docDefinition.content[0].table.body = newArr;

				} else if (lcAmmendDetails.ammend_clause < lcAmmendDetails.update_ammend_clause_charges) {
					//excess
					short_excess_ammend_clause_charges = Number(lcAmmendDetails.update_ammend_clause_charges - lcAmmendDetails.ammend_clause);
					short_excess_ammend_clause_charges_show = '+' + short_excess_ammend_clause_charges.toFixed(2);

					setExcessShortAmmendClause = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_ammend_clause_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Ammendment Clause Charges");

					let newArr = insertToArray(arr, setExcessShortAmmendClause, lc_open_index);
					docDefinition.content[0].table.body = newArr;
				}


				let short_excess_Swift_charges = 0;
				let short_excess_swift_charges_show = '';
				let setExcessShortswift = [];

				if (lcAmmendDetails.ammend_swift > lcAmmendDetails.update_swift_charges) {
					//short
					short_excess_Swift_charges = Number(lcAmmendDetails.ammend_swift - lcAmmendDetails.update_swift_charges);

					short_excess_swift_charges_show = '-' + short_excess_Swift_charges.toFixed(2);

					setExcessShortswift = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_swift_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Swift Charges");

					let newArr = insertToArray(arr, setExcessShortswift, lc_open_index);
					docDefinition.content[0].table.body = newArr;

				} else if (lcAmmendDetails.ammend_swift < lcAmmendDetails.update_swift_charges) {
					//excess
					short_excess_Swift_charges = Number(lcAmmendDetails.update_swift_charges - lcAmmendDetails.ammend_swift);
					short_excess_swift_charges_show = '+' + short_excess_Swift_charges.toFixed(2);

					setExcessShortswift = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_swift_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Swift Charges");

					let newArr = insertToArray(arr, setExcessShortswift, lc_open_index);
					docDefinition.content[0].table.body = newArr;
				}



				let totalChargesAccordingToBank = lcAmmendDetails.total_charges_bank;


				let short_excess_bank_charges = 0;
				let short_excess_bank_charges_show = '';
				let totalBankCharges = [];
				if (lcAmmendDetails.total_charges_system > totalChargesAccordingToBank) {
					short_excess_bank_charges = Number(lcAmmendDetails.total_charges_system) - Number(totalChargesAccordingToBank);

					short_excess_bank_charges_show = '-' + short_excess_bank_charges.toFixed(2);

					totalBankCharges = [{ text: '', border: [true, false, true, false] }, { text: 'Short Charges According to Bank ', border: [false, false, true, false] }, { text: short_excess_bank_charges_show, alignment: 'right', border: [false, false, true, false] }];


					let arr = docDefinition.content[0].table.body;
					var total_bank_charges_index = searchInArray(arr, "TOTAL CHARGES BY SYSTEM");
					let newArr = insertToArray(arr, totalBankCharges, (total_bank_charges_index - 1));
					docDefinition.content[0].table.body = newArr;


				} else if (lcAmmendDetails.total_charges_system < totalChargesAccordingToBank) {
					short_excess_bank_charges = Number(totalChargesAccordingToBank - lcAmmendDetails.total_charges_system);
					short_excess_bank_charges_show = '+' + short_excess_bank_charges.toFixed(2);

					totalBankCharges = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Charges According to Bank ', border: [false, false, true, false] }, { text: short_excess_bank_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;
					var total_bank_charges_index = searchInArray(arr, "TOTAL CHARGES BY SYSTEM");
					let newArr = insertToArray(arr, totalBankCharges, (total_bank_charges_index - 1));
					docDefinition.content[0].table.body = newArr;


				}

				totalBankCharges = [{ text: '', border: [true, true, true, true] }, { text: 'TOTAL CHARGES DEBITED BY BANK', border: [true, true, true, true] }, { text: totalChargesAccordingToBank.toFixed(2), alignment: 'right', border: [true, true, true, true] }];

				let arr = docDefinition.content[0].table.body;
				var total_bank_charges_index = searchInArray(arr, "TOTAL CHARGES BY SYSTEM");
				let newArrBank = insertToArray(arr, totalBankCharges, (total_bank_charges_index + 1));
				docDefinition.content[0].table.body = newArrBank;
			}


		} else if (ammendClause == 1) {

			lcOpenInrAmt = lcAmmendDetails.lc_open_amt_inr.toFixed(2);
			ammendmentClause = lcAmmendDetails.ammend_clause.toFixed(2);
			ammendmentClauseCgst = lcAmmendDetails.ammend_clause_cgst.toFixed(2);
			ammendmentClauseSgst = lcAmmendDetails.ammend_clause_sgst.toFixed(2);
			ammendmentSwift = lcAmmendDetails.ammend_swift.toFixed(2);
			ammendmentSwiftCgst = lcAmmendDetails.ammend_swift_cgst.toFixed(2);
			ammendmentSwiftSgst = lcAmmendDetails.ammend_swift_sgst.toFixed(2);
			totalSystemCharges = lcAmmendDetails.total_charges_system.toFixed(2);




			let valueAmmendDetails7
				= [{ text: 'B]', alignment: 'center', border: [true, false, true, false] },
				{ text: 'Ammendment Clause Charges', border: [false, false, true, false] },
				{ text: ammendmentClause, alignment: 'right', border: [false, false, true, false] }
				];

			let arr7 = docDefinition.content[0].table.body;
			var lc_amount_index = searchInArray(arr7, "LC Amount ");
			let newArr7 = insertToArray(arr7, valueAmmendDetails7, lc_amount_index);
			docDefinition.content[0].table.body = newArr7;


			let valueAmmendDetails8
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'CGST @ ' + this.cgstDbValue + '% on Ammendment Clause Charges', border: [false, false, true, false] },
				{ text: ammendmentClauseCgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr8 = docDefinition.content[0].table.body;
			let newArr8 = insertToArray(arr8, valueAmmendDetails8, lc_amount_index + 1);
			docDefinition.content[0].table.body = newArr8;

			let valueAmmendDetails9
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'SGST @ ' + this.sgstDbValue + '% on Ammendment Clause Charges', border: [false, false, true, false] },
				{ text: ammendmentClauseSgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr9 = docDefinition.content[0].table.body;
			let newArr9 = insertToArray(arr9, valueAmmendDetails9, lc_amount_index + 2);
			docDefinition.content[0].table.body = newArr9;

			let valueAmmendDetails10
				= [{ text: 'C]', alignment: 'center', border: [true, false, true, false] },
				{ text: 'Swift Charges', border: [false, false, true, false] },
				{ text: ammendmentSwift, alignment: 'right', border: [false, false, true, false] }
				];

			let arr10 = docDefinition.content[0].table.body;
			let newArr10 = insertToArray(arr10, valueAmmendDetails10, lc_amount_index + 3);
			docDefinition.content[0].table.body = newArr10;

			let valueAmmendDetails11
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'CGST @ ' + this.cgstDbValue + '% on Swift Charges', border: [false, false, true, false] },
				{ text: ammendmentSwiftCgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr11 = docDefinition.content[0].table.body;
			let newArr11 = insertToArray(arr11, valueAmmendDetails11, lc_amount_index + 4);
			docDefinition.content[0].table.body = newArr11;

			let valueAmmendDetails12
				= [{ text: '', border: [true, false, true, false] },
				{ text: 'SGST @ ' + this.sgstDbValue + '% on Swift Charges', border: [false, false, true, false] },
				{ text: ammendmentSwiftSgst, alignment: 'right', border: [false, false, true, false] }
				];

			let arr12 = docDefinition.content[0].table.body;
			let newArr12 = insertToArray(arr12, valueAmmendDetails12, lc_amount_index + 5);
			docDefinition.content[0].table.body = newArr12;

			let valueAmmendDetails13
				= [{ text: '', border: [true, true, true, true] },
				{ text: 'TOTAL CHARGES BY SYSTEM' },
				{ text: totalSystemCharges, alignment: 'right' }
				];

			let arr13 = docDefinition.content[0].table.body;
			let newArr13 = insertToArray(arr13, valueAmmendDetails13, lc_amount_index + 6);
			docDefinition.content[0].table.body = newArr13;


			if (create_update_flag == 2) {
				if (lcAmmendDetails.additional_charges != 0) {
					let additionalCharges = [];
					additionalCharges = [{ text: '', border: [true, false, true, false] }, { text: lcAmmendDetails.additional_header, border: [false, false, true, false] }, { text: lcAmmendDetails.additional_charges, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;
					var additional_charges_index = searchInArray(arr, 'SGST @ ' + this.sgstDbValue + '% on Swift Charges');
					let newArr = insertToArray(arr, additionalCharges, (additional_charges_index));
					docDefinition.content[0].table.body = newArr;
				}


				let defaultData = docDefinition.content[0].table.body;


				let short_excess_lc_open_inr_amt = 0;
				let short_excess_lc_open_inr_amt_show = '';
				let setExcessShortLcOpenInrAmt = [{ text: '', border: [true, false, true, false] }, { text: '', border: [false, false, true, false] }, { text: '', alignment: 'right', border: [false, false, true, false] }];

				if (lcAmmendDetails.lc_open_amt_inr > lcAmmendDetails.update_lc_amt_inr) {
					//short
					short_excess_lc_open_inr_amt = Number(lcAmmendDetails.lc_open_amt_inr - lcAmmendDetails.update_lc_amt_inr);

					short_excess_lc_open_inr_amt_show = '-' + short_excess_lc_open_inr_amt.toFixed(2);

					setExcessShortLcOpenInrAmt = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_lc_open_inr_amt_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_amount_index = searchInArray(arr, "LC Amount ");

					let newArr = insertToArray(arr, setExcessShortLcOpenInrAmt, lc_amount_index);
					docDefinition.content[0].table.body = newArr;

				} else if (lcAmmendDetails.lc_open_amt_inr < lcAmmendDetails.update_lc_amt_inr) {
					//excess
					short_excess_lc_open_inr_amt = Number(lcAmmendDetails.update_lc_amt_inr - lcAmmendDetails.lc_open_amt_inr);
					short_excess_lc_open_inr_amt_show = '+' + short_excess_lc_open_inr_amt.toFixed(2);
					setExcessShortLcOpenInrAmt = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_lc_open_inr_amt_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;
					var lc_amount_index = searchInArray(arr, "LC Amount ");
					let newArr = insertToArray(arr, setExcessShortLcOpenInrAmt, lc_amount_index);
					docDefinition.content[0].table.body = newArr;
				}



				let short_excess_ammend_clause_charges = 0;
				let short_excess_ammend_clause_charges_show = '';
				let setExcessShortAmmendClause = [];
				if (lcAmmendDetails.ammend_clause > lcAmmendDetails.update_ammend_clause_charges) {
					//short
					short_excess_ammend_clause_charges = Number(lcAmmendDetails.ammend_clause - lcAmmendDetails.update_ammend_clause_charges);

					short_excess_ammend_clause_charges_show = '-' + short_excess_ammend_clause_charges.toFixed(2);

					setExcessShortAmmendClause = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_ammend_clause_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Ammendment Clause Charges");

					let newArr = insertToArray(arr, setExcessShortAmmendClause, lc_open_index);
					docDefinition.content[0].table.body = newArr;

				} else if (lcAmmendDetails.ammend_clause < lcAmmendDetails.update_ammend_clause_charges) {
					//excess
					short_excess_ammend_clause_charges = Number(lcAmmendDetails.update_ammend_clause_charges - lcAmmendDetails.ammend_clause);
					short_excess_ammend_clause_charges_show = '+' + short_excess_ammend_clause_charges.toFixed(2);

					setExcessShortAmmendClause = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_ammend_clause_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Ammendment Clause Charges");

					let newArr = insertToArray(arr, setExcessShortAmmendClause, lc_open_index);
					docDefinition.content[0].table.body = newArr;
				}


				let short_excess_Swift_charges = 0;
				let short_excess_swift_charges_show = '';
				let setExcessShortswift = [];

				if (lcAmmendDetails.ammend_swift > lcAmmendDetails.update_swift_charges) {
					//short
					short_excess_Swift_charges = Number(lcAmmendDetails.ammend_swift - lcAmmendDetails.update_swift_charges);

					short_excess_swift_charges_show = '-' + short_excess_Swift_charges.toFixed(2);

					setExcessShortswift = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_swift_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Swift Charges");

					let newArr = insertToArray(arr, setExcessShortswift, lc_open_index);
					docDefinition.content[0].table.body = newArr;

				} else if (lcAmmendDetails.ammend_swift < lcAmmendDetails.update_swift_charges) {
					//excess
					short_excess_Swift_charges = Number(lcAmmendDetails.update_swift_charges - lcAmmendDetails.ammend_swift);
					short_excess_swift_charges_show = '+' + short_excess_Swift_charges.toFixed(2);

					setExcessShortswift = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_swift_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;

					var lc_open_index = searchInArray(arr, "Swift Charges");

					let newArr = insertToArray(arr, setExcessShortswift, lc_open_index);
					docDefinition.content[0].table.body = newArr;
				}


				let totalChargesAccordingToBank = lcAmmendDetails.total_charges_bank;


				let short_excess_bank_charges = 0;
				let short_excess_bank_charges_show = '';
				let totalBankCharges = [];
				if (lcAmmendDetails.total_charges_system > totalChargesAccordingToBank) {
					short_excess_bank_charges = Number(lcAmmendDetails.total_charges_system) - Number(totalChargesAccordingToBank);

					short_excess_bank_charges_show = '-' + short_excess_bank_charges.toFixed(2);

					totalBankCharges = [{ text: '', border: [true, false, true, false] }, { text: 'Short Charges According to Bank ', border: [false, false, true, false] }, { text: short_excess_bank_charges_show, alignment: 'right', border: [false, false, true, false] }];


					let arr = docDefinition.content[0].table.body;
					var total_bank_charges_index = searchInArray(arr, "TOTAL CHARGES BY SYSTEM");
					let newArr = insertToArray(arr, totalBankCharges, (total_bank_charges_index - 1));
					docDefinition.content[0].table.body = newArr;


				} else if (lcAmmendDetails.total_charges_system < totalChargesAccordingToBank) {
					short_excess_bank_charges = Number(totalChargesAccordingToBank - lcAmmendDetails.total_charges_system);
					short_excess_bank_charges_show = '+' + short_excess_bank_charges.toFixed(2);

					totalBankCharges = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Charges According to Bank ', border: [false, false, true, false] }, { text: short_excess_bank_charges_show, alignment: 'right', border: [false, false, true, false] }];

					let arr = docDefinition.content[0].table.body;
					var total_bank_charges_index = searchInArray(arr, "TOTAL CHARGES BY SYSTEM");
					let newArr = insertToArray(arr, totalBankCharges, (total_bank_charges_index - 1));
					docDefinition.content[0].table.body = newArr;


				}


				totalBankCharges = [{ text: '', border: [true, true, true, true] }, { text: 'TOTAL CHARGES DEBITED BY BANK', border: [true, true, true, true] }, { text: totalChargesAccordingToBank, alignment: 'right', border: [true, true, true, true] }];

				let arr = docDefinition.content[0].table.body;
				var total_bank_charges_index = searchInArray(arr, "TOTAL CHARGES BY SYSTEM");
				let newArrBank = insertToArray(arr, totalBankCharges, (total_bank_charges_index + 1));
				docDefinition.content[0].table.body = newArrBank;
			}



		}



		pdfMake.createPdf(docDefinition).open();
	}


	updateCharges(lcAmmendDetails) {
		this.editChargesDetails = lcAmmendDetails;
		this.charge_id = lcAmmendDetails.id;

		this.updateChargesForm.patchValue({
			update_lc_amt_inr: this.editChargesDetails['update_lc_amt_inr'],
			charges_date: this.editChargesDetails['charges_date'],
			update_amd_ch_value_change: this.editChargesDetails['update_amd_ch_value_change'],
			update_amd_ch_date_change: this.editChargesDetails['update_amd_ch_date_change'],
			update_ammend_clause_charges: this.editChargesDetails['update_ammend_clause_charges'],
			update_swift_charges: this.editChargesDetails['update_swift_charges'],
			additional_header: this.editChargesDetails['additional_header'],
			additional_charges: this.editChargesDetails['additional_charges']
		});


		this.myModal.show();

	}


	UpdateChargesSave() {

		let ChargesACcordingToBank = this.lcAmmendmentChargesCalculation();
		let data = {
			update_lc_amt_inr: this.updateChargesForm.value.update_lc_amt_inr ? this.updateChargesForm.value.update_lc_amt_inr : 0,
			charges_date: this.updateChargesForm.value.charges_date ? this.updateChargesForm.value.charges_date : null,
			update_amd_ch_value_change: this.updateChargesForm.value.update_amd_ch_value_change ? this.updateChargesForm.value.update_amd_ch_value_change : 0,
			update_amd_ch_date_change: this.updateChargesForm.value.update_amd_ch_date_change ? this.updateChargesForm.value.update_amd_ch_date_change : 0,
			update_ammend_clause_charges: this.updateChargesForm.value.update_ammend_clause_charges ? this.updateChargesForm.value.update_ammend_clause_charges : 0,
			update_swift_charges: this.updateChargesForm.value.update_swift_charges ? this.updateChargesForm.value.update_swift_charges : 0,
			additional_header: this.updateChargesForm.value.additional_header ? this.updateChargesForm.value.additional_header : null,
			additional_charges: this.updateChargesForm.value.additional_charges ? this.updateChargesForm.value.additional_charges : 0,
			total_charges_bank: ChargesACcordingToBank
		}

		let body = {
			ChargesData: data,
			id: this.charge_id

		}

		this.CrudServices.updateData<any>(lcAmmendmentCharges.update, body).subscribe((response) => {

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

	recalculateCharges(charges_details) {
		let body = {
			charges_details: charges_details
		};

		this.CrudServices.updateData<any>(lcAmmendmentCharges.reCalculateCharges, body).subscribe((response) => {

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
		this.totalSystemCharges = 0;
		this.totalBankCharges = 0;

		for (const val of this.ChargesList) {
			this.totalSystemCharges = this.totalSystemCharges + Number(val.total_charges_system);
			this.totalBankCharges = this.totalBankCharges + Number(val.total_charges_bank);
		}

	}

	lcAmmendmentChargesCalculation() {


		let totalChargesAccordingtoBank = 0;
		if (this.editChargesDetails.ammendment_days == 1 && this.editChargesDetails.ammendment_value == 1) {

			//ammendment Value Change
			let ammend_value_amount = Number(this.editChargesDetails.update_amd_ch_value_change);
			let ammendValueCgst = Number(ammend_value_amount * (Number(this.cgstDbValue) / 100));
			let ammendValueSgst = Number(ammend_value_amount * (Number(this.sgstDbValue) / 100));

			//ammendment Date Change
			let ammend_days_amount = Number(this.editChargesDetails.update_amd_ch_date_change);
			let ammendDaysCgst = Number(ammend_days_amount * (Number(this.cgstDbValue) / 100));
			let ammendDaysSgst = Number(ammend_days_amount * (Number(this.sgstDbValue) / 100));

			//ammendment Clause Change
			let ammend_Clause_amount = Number(this.editChargesDetails.update_ammend_clause_charges);
			let ammendClauseCgst = Number(ammend_Clause_amount * (Number(this.cgstDbValue) / 100));
			let ammendClauseSgst = Number(ammend_Clause_amount * (Number(this.sgstDbValue) / 100));

			//Swift Changes
			let swift_amount = Number(this.editChargesDetails.update_swift_charges);
			let swiftCgst = Number(swift_amount * (Number(this.cgstDbValue) / 100));
			let swiftSgst = Number(swift_amount * (Number(this.sgstDbValue) / 100));

			totalChargesAccordingtoBank = Number(ammend_value_amount) + Number(ammendValueCgst) + Number(ammendValueSgst) + Number(ammend_days_amount) + Number(ammendDaysCgst) + Number(ammendDaysSgst) +
				Number(ammend_Clause_amount) + Number(ammendClauseCgst) + Number(ammendClauseSgst) +
				Number(swift_amount) + Number(swiftCgst) + Number(swiftSgst) +
				Number(this.updateChargesForm.value.additional_charges);


		} else if (this.editChargesDetails.ammendment_days == 1) {


			//ammendment Date Change
			let ammend_days_amount = Number(this.editChargesDetails.update_amd_ch_date_change);
			let ammendDaysCgst = Number(ammend_days_amount * (Number(this.cgstDbValue) / 100));
			let ammendDaysSgst = Number(ammend_days_amount * (Number(this.sgstDbValue) / 100));

			//ammendment Clause Change
			let ammend_Clause_amount = Number(this.editChargesDetails.update_ammend_clause_charges);
			let ammendClauseCgst = Number(ammend_Clause_amount * (Number(this.cgstDbValue) / 100));
			let ammendClauseSgst = Number(ammend_Clause_amount * (Number(this.sgstDbValue) / 100));

			//Swift Changes
			let swift_amount = Number(this.editChargesDetails.update_swift_charges);
			let swiftCgst = Number(swift_amount * (Number(this.cgstDbValue) / 100));
			let swiftSgst = Number(swift_amount * (Number(this.sgstDbValue) / 100));

			totalChargesAccordingtoBank = Number(ammend_days_amount) + Number(ammendDaysCgst) + Number(ammendDaysSgst) +
				Number(ammend_Clause_amount) + Number(ammendClauseCgst) + Number(ammendClauseSgst) +
				Number(swift_amount) + Number(swiftCgst) + Number(swiftSgst) +
				Number(this.updateChargesForm.value.additional_charges);


		} else if (this.editChargesDetails.ammendment_value == 1) {

			//ammendment Value Change
			let ammend_value_amount = Number(this.editChargesDetails.update_amd_ch_value_change);
			let ammendValueCgst = Number(ammend_value_amount * (Number(this.cgstDbValue) / 100));
			let ammendValueSgst = Number(ammend_value_amount * (Number(this.sgstDbValue) / 100));

			//ammendment Clause Change
			let ammend_Clause_amount = Number(this.editChargesDetails.update_ammend_clause_charges);
			let ammendClauseCgst = Number(ammend_Clause_amount * (Number(this.cgstDbValue) / 100));
			let ammendClauseSgst = Number(ammend_Clause_amount * (Number(this.sgstDbValue) / 100));

			//Swift Changes
			let swift_amount = Number(this.editChargesDetails.update_swift_charges);
			let swiftCgst = Number(swift_amount * (Number(this.cgstDbValue) / 100));
			let swiftSgst = Number(swift_amount * (Number(this.sgstDbValue) / 100));

			totalChargesAccordingtoBank = Number(ammend_value_amount) + Number(ammendValueCgst) + Number(ammendValueSgst) +
				Number(ammend_Clause_amount) + Number(ammendClauseCgst) + Number(ammendClauseSgst) +
				Number(swift_amount) + Number(swiftCgst) + Number(swiftSgst) +
				Number(this.updateChargesForm.value.additional_charges);


		} else if (this.editChargesDetails.ammendment_clause == 1) {


			//ammendment Clause Change
			let ammend_Clause_amount = Number(this.editChargesDetails.update_ammend_clause_charges);
			let ammendClauseCgst = Number(ammend_Clause_amount * (Number(this.cgstDbValue) / 100));
			let ammendClauseSgst = Number(ammend_Clause_amount * (Number(this.sgstDbValue) / 100));

			//Swift Changes
			let swift_amount = Number(this.editChargesDetails.update_swift_charges);
			let swiftCgst = Number(swift_amount * (Number(this.cgstDbValue) / 100));
			let swiftSgst = Number(swift_amount * (Number(this.sgstDbValue) / 100));

			totalChargesAccordingtoBank =
				Number(ammend_Clause_amount) + Number(ammendClauseCgst) + Number(ammendClauseSgst) +
				Number(swift_amount) + Number(swiftCgst) + Number(swiftSgst) +
				Number(this.updateChargesForm.value.additional_charges);
		}

		return totalChargesAccordingtoBank;



	}


	checkVoucher(id, flag_check_enter) {
		//flag_check_enter
		//1- check 
		//2 - entered 
		let body = {
			id: id,
			flag_check_enter: flag_check_enter
		}
		this.CrudServices.getOne<any>(lcAmmendmentCharges.voucher_check, body).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
				this.getBankChargesList();
			}
		});

	}


	calculatePortWiseCharges(lcAmmendmentDetailsDetails) {
		let totalBankCharges = lcAmmendmentDetailsDetails.total_charges_bank;

		let piArray = lcAmmendmentDetailsDetails.letter_of_credit.flc_proforma_invoices;

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
				piQTy: element2.pi_quantity
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
			portWiseChargesArray.push({
				portWiseCharges: portWiseCharges,
				port: element3.port
			});

			portWiseChargesStr += '<h5><i class="fa fa-ship" aria-hidden="true"></i><span class="badge badge-primary"><b>  ' + (element3.port) + '(' + (element3.piQTy).toFixed(2) + ')</span> <br> <i class="fa fa-inr" aria-hidden="true"></i> <span class="badge badge-primary">  ' + (portWiseCharges).toFixed(2) + '</span></h5> <hr>';

			// portWiseChargesStr += '<table border=1 style="width:5%" ><tr><td>PiQty</td><td>Port</td><td>Charges</td></tr><tr><td>'+(element3.piQTy).toFixed(2)+'</td><td>'+(element3.port)+'</td><td>'+(portWiseCharges).toFixed(2)+'</td></tr></table>';
		}
		return portWiseChargesStr;
	}





}
