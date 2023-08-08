import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { ValueStore, nonLcRemittanceCharges, bankChargesList } from '../../../../shared/apis-path/apis-path';
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
	selector: 'app-nonlc-remittance-charges',
	templateUrl: './nonlc-remittance-charges.component.html',
	styleUrls: ['./nonlc-remittance-charges.component.scss'],
	providers: [CrudServices, PermissionService, LoginService, DatePipe, ToasterService, ExportService],
	encapsulation: ViewEncapsulation.None,
})
export class NonlcRemittanceChargesComponent implements OnInit {

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
	})

	user: UserDetails;
	links: string[] = [];

	lc_nonlc_rem_recalculate = false;
	lc_nonlc_rem_update_charges = false;
	lc_nonlc_rem_portwise_charges = false;
	lc_nonlc_rem_checked_by = false;
	lc_nonlc_rem_entered_by = false;
	lc_nonlc_entered_by_status = false;
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

		this.lc_nonlc_rem_recalculate = (this.links.indexOf('lc_nonlc_rem_recalculate') > -1);
		this.lc_nonlc_rem_update_charges = (this.links.indexOf('lc_nonlc_rem_update_charges') > -1);
		this.lc_nonlc_rem_portwise_charges = (this.links.indexOf('lc_nonlc_rem_portwise_charges') > -1);
		this.lc_nonlc_rem_checked_by = (this.links.indexOf('lc_nonlc_rem_checked_by') > -1);
		this.lc_nonlc_rem_entered_by = (this.links.indexOf('lc_nonlc_rem_entered_by') > -1);
		this.lc_nonlc_entered_by_status = (this.links.indexOf('lc_nonlc_entered_by_status') > -1);

		this.cols = [
			// { field: 'id', header: 'id' },
			{ field: 'bank_name', header: 'Bank Name' },
			{ field: 'proform_invoice_no', header: 'Proform Invc No.' },
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

		this.status = [{ id: 1, name: "Pending" }, { id: 2, name: "Complete" }]

		this.getBankChargesList();
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
			update_nonlc_amt_inr: new FormControl(0),
			update_nonlc_remit_charges_amt_inr: new FormControl(0),
			update_currency_convert_cgst: new FormControl(0),
			update_currency_convert_sgst: new FormControl(0),
			update_swift_charges: new FormControl(0),
			additional_header: new FormControl(null),
			additional_charges: new FormControl(0),
			charges_date: new FormControl(null),
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
		this.CrudServices.getOne<any>(nonLcRemittanceCharges.getAllNew,condition).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
				this.isLoading = false;
			//	this.ChargesList = [];
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

				if (this.lc_nonlc_entered_by_status) //Mayur Sir Pending List
				{
					this.ChargesList = this.globalList
					this.ChargesList = this.ChargesList.filter(item => item.entered_by == null && item.checked_by != null);
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

	async generatePdf(nonlcswiftdetails, create_update_flag) {

		let bankName = nonlcswiftdetails.spipl_bank.bank_name;
		let bankGstNo = nonlcswiftdetails.spipl_bank.gst_no;
		let bankAccountNo = nonlcswiftdetails.spipl_bank.account_no;

		let supplierName = nonlcswiftdetails.non_lc_swift_detail.flc_proforma_invoice.supp_org.sub_org_name;
		let proformInvoiceNo = nonlcswiftdetails.non_lc_swift_detail.flc_proforma_invoice.proform_invoice_no;
		let nonlcPaymentDate = nonlcswiftdetails.non_lc_swift_detail.payment_date;
		let paymentDate = nonlcPaymentDate.substr(8, 2) + '/' + nonlcPaymentDate.substr(5, 2) + '/' + nonlcPaymentDate.substr(0, 4);

		let nonlcPaymentTerm = nonlcswiftdetails.non_lc_swift_detail.payment_term_master.pay_term;
		let nonlcUSDAmt = nonlcswiftdetails.non_lc_swift_detail.amount.toFixed(2);
		let nocLcRate = nonlcswiftdetails.non_lc_swift_detail.nonlc_rate.toFixed(2);
		let nocLcInrAmt = nonlcswiftdetails.nonlc_amt_inr.toFixed(2);

		let nonlcRemittaneAmt = nonlcswiftdetails.nonlc_remit_charges_amt_inr.toFixed(2);
		let nonlcRemittaneAmtCgst = nonlcswiftdetails.nonlc_remit_cgst.toFixed(2);
		let nonlcRemittaneAmtSgst = nonlcswiftdetails.nonlc_remit_sgst.toFixed(2);

		let currencyConvertCgst = nonlcswiftdetails.currency_convert_cgst.toFixed(2);
		let currencyConvertSgst = nonlcswiftdetails.currency_convert_sgst.toFixed(2);

		let swiftCharges = nonlcswiftdetails.swift_charges.toFixed(2);
		let swiftCgst = nonlcswiftdetails.swift_cgst.toFixed(2);
		let swiftSgst = nonlcswiftdetails.swift_sgst.toFixed(2);

		let totalChargesSystem = nonlcswiftdetails.total_charges_system.toFixed(2);
		let totalChargesBank = nonlcswiftdetails.total_charges_bank.toFixed(2);


		let nonlcUSDAmttxt = 'Proforma Invoice ' + proformInvoiceNo + ' USD ' + nonlcUSDAmt + ' @ ' + nocLcRate + ' SR';

		let ccVariableCharges = nonlcswiftdetails.variableCharges;
		let ccFlatValue = nonlcswiftdetails.chargesFlatValue;

		let currencyConvertCgstTxt = 'CGST On Currency Conversion Charges @ ( ' + ccVariableCharges + ' % + Rs. ' + ccFlatValue + ')';


		let currencyConvertSgstTxt = 'SGST On Currency Conversion Charges @ ( ' + ccVariableCharges + ' % + Rs. ' + ccFlatValue + ')';


		let remittancePercentOrFlatValue = nonlcswiftdetails.nonlc_remit_percent_flat_val;

		let remittanceChargesTxt = '';
		if (remittancePercentOrFlatValue == nonlcRemittaneAmt) //Flat Value
		{
			remittanceChargesTxt = 'Payment Remittance Charges ' + remittancePercentOrFlatValue;
		} else //Percent
		{
			remittanceChargesTxt = 'Payment Remittance Charges @ ' + remittancePercentOrFlatValue + ' %';
		}

		let chargesDate = nonlcswiftdetails.charges_date ? nonlcswiftdetails.charges_date.substr(8, 2) + '/' + nonlcswiftdetails.charges_date.substr(5, 2) + '/' + nonlcswiftdetails.charges_date.substr(0, 4) : null;

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
									'Being ', { text: nonlcPaymentTerm }, ' Charges debited by bank for ',
									{ text: supplierName, bold: true }, ' of USD ', { text: nonlcUSDAmt, bold: true }, ' Against Proforma Invoice No. ', { text: proformInvoiceNo, bold: true }, ' DTD ', { text: paymentDate, bold: true }],
								margin: [10, 5, 0, 0],
								style: 'tableHeader',
								colSpan: 3,
								alignment: 'center'
							}, {}, {}],

							[{ text: 'Sr.No.', alignment: 'center' }, { text: 'Perticular', alignment: 'center' }, { text: 'Amount', alignment: 'center' }],

							[{ text: 'A]', alignment: 'center', border: [true, false, true, false] },
							{
								text: nonlcUSDAmttxt, border: [false, false, true, false]
							},
							{ text: nocLcInrAmt, alignment: 'right', border: [false, false, true, false] }

							],



							[{ text: 'B]', alignment: 'center', border: [true, false, true, false] },
							{
								text: remittanceChargesTxt, border: [false, false, true, false]
							},
							{ text: nonlcRemittaneAmt, alignment: 'right', border: [false, false, true, false] }

							],

							[{ text: '', alignment: 'center', border: [true, false, true, false] },
							{
								text: 'CGST @ ' + this.cgstDbValue + '% on Payment Remittance Charges', border: [false, false, true, false]
							},
							{ text: nonlcRemittaneAmtCgst, alignment: 'right', border: [false, false, true, false] }

							],

							[{ text: '', alignment: 'center', border: [true, false, true, false] },
							{
								text: 'SGST @ ' + this.sgstDbValue + '% on Payment Remittance Charges', border: [false, false, true, false]
							},
							{ text: nonlcRemittaneAmtSgst, alignment: 'right', border: [false, false, true, false] }

							],




							[{ text: 'C]', alignment: 'center', border: [true, false, true, false] },
							{
								text: currencyConvertCgstTxt, border: [false, false, true, false]
							},
							{ text: currencyConvertCgst, alignment: 'right', border: [false, false, true, false] }

							],

							[{ text: '', alignment: 'center', border: [true, false, true, false] },
							{
								text: currencyConvertSgstTxt, border: [false, false, true, false]
							},
							{ text: currencyConvertSgst, alignment: 'right', border: [false, false, true, false] }

							],




							[{ text: 'D]', alignment: 'center', border: [true, false, true, false] },
							{
								text: 'Swift Charges ', border: [false, false, true, false]
							},
							{ text: swiftCharges, alignment: 'right', border: [false, false, true, false] }

							],


							[{ text: '', alignment: 'center', border: [true, false, true, false] },
							{
								text: 'CGST @ ' + this.cgstDbValue + '% On Swift Charges ', border: [false, false, true, false]
							},
							{ text: swiftCgst, alignment: 'right', border: [false, false, true, false] }

							],

							[{ text: '', alignment: 'center', border: [true, false, true, false] },
							{
								text: 'SGST @ ' + this.sgstDbValue + '% On Swift Charges ', border: [false, false, true, false]
							},
							{ text: swiftSgst, alignment: 'right', border: [false, false, true, false] }

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

						paddingLeft: function (i, node) { return 7; },
						paddingRight: function (i, node) { return 7; },
						paddingTop: function (i, node) { return 7; },
						paddingBottom: function (i, node) { return 7; },
					}

				},

			]

		};

		if (create_update_flag == 2) {

			let additionalCharges = [];
			//if additional charges present
			if (nonlcswiftdetails.additional_charges != 0) {
				additionalCharges = [{ text: '', border: [true, false, true, false] }, { text: nonlcswiftdetails.additional_header, border: [false, false, true, false] }, { text: nonlcswiftdetails.additional_charges.toFixed(2), alignment: 'right', border: [false, false, true, false] }];
				let arr = docDefinition.content[0].table.body;
				var additional_charges_index = searchInArray(arr, "Total Charges");
				let newArr = insertToArray(arr, additionalCharges, (additional_charges_index - 1));
				docDefinition.content[0].table.body = newArr;
			}

			let short_excess_nonlc_remit_inr_amt = 0;
			let short_excess_nonlc_remit_inr_amt_show = '';

			let setExcessShortNonLcRemitInrAmt = [{ text: '', border: [true, false, true, false] }, { text: '', border: [false, false, true, false] }, { text: '', alignment: 'right', border: [false, false, true, false] }];

			if (nonlcswiftdetails.nonlc_remit_charges_amt_inr > nonlcswiftdetails.update_nonlc_remit_charges_amt_inr) {
				//short
				short_excess_nonlc_remit_inr_amt = Number(nonlcswiftdetails.nonlc_remit_charges_amt_inr - nonlcswiftdetails.update_nonlc_remit_charges_amt_inr);

				short_excess_nonlc_remit_inr_amt_show = '-' + short_excess_nonlc_remit_inr_amt.toFixed(2);

				setExcessShortNonLcRemitInrAmt = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_nonlc_remit_inr_amt_show, alignment: 'right', border: [false, false, true, false] }];

				let arr = docDefinition.content[0].table.body;

				var index = searchInArray(arr, "Payment Remittance Charges");

				let newArr = insertToArray(arr, setExcessShortNonLcRemitInrAmt, index);
				docDefinition.content[0].table.body = newArr;

			} else if (nonlcswiftdetails.nonlc_remit_charges_amt_inr < nonlcswiftdetails.update_nonlc_remit_charges_amt_inr) {
				//excess
				short_excess_nonlc_remit_inr_amt = Number(nonlcswiftdetails.update_nonlc_remit_charges_amt_inr - nonlcswiftdetails.nonlc_remit_charges_amt_inr);
				short_excess_nonlc_remit_inr_amt_show = '+' + short_excess_nonlc_remit_inr_amt.toFixed(2);
				setExcessShortNonLcRemitInrAmt = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_nonlc_remit_inr_amt_show, alignment: 'right', border: [false, false, true, false] }];

				let arr = docDefinition.content[0].table.body;

				var index = searchInArray(arr, "Payment Remittance Charges");

				let newArr = insertToArray(arr, setExcessShortNonLcRemitInrAmt, index);
				docDefinition.content[0].table.body = newArr;
			}



			let short_excess_currency_conversion_cgst_amt = 0;
			let short_excess_currency_conversion_cgst_amt_show = '';

			let setExcessShortCurrencyConvertCgstAmt = [{ text: '', border: [true, false, true, false] }, { text: '', border: [false, false, true, false] }, { text: '', alignment: 'right', border: [false, false, true, false] }];

			if (nonlcswiftdetails.currency_convert_cgst > nonlcswiftdetails.update_currency_convert_cgst) {
				//short
				short_excess_currency_conversion_cgst_amt = Number(nonlcswiftdetails.currency_convert_cgst - nonlcswiftdetails.update_currency_convert_cgst);

				short_excess_currency_conversion_cgst_amt_show = '-' + short_excess_currency_conversion_cgst_amt.toFixed(2);

				setExcessShortCurrencyConvertCgstAmt = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_currency_conversion_cgst_amt_show, alignment: 'right', border: [false, false, true, false] }];

				let arr = docDefinition.content[0].table.body;

				var index = searchInArray(arr, "CGST On Currency Conversion");

				let newArr = insertToArray(arr, setExcessShortCurrencyConvertCgstAmt, index);
				docDefinition.content[0].table.body = newArr;

			} else if (nonlcswiftdetails.currency_convert_cgst < nonlcswiftdetails.update_currency_convert_cgst) {
				//excess
				short_excess_currency_conversion_cgst_amt = Number(nonlcswiftdetails.update_currency_convert_cgst - nonlcswiftdetails.currency_convert_cgst);
				short_excess_currency_conversion_cgst_amt_show = '+' + short_excess_currency_conversion_cgst_amt.toFixed(2);
				setExcessShortCurrencyConvertCgstAmt = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_currency_conversion_cgst_amt_show, alignment: 'right', border: [false, false, true, false] }];

				let arr = docDefinition.content[0].table.body;

				var index = searchInArray(arr, "CGST On Currency Conversion");

				let newArr = insertToArray(arr, setExcessShortCurrencyConvertCgstAmt, index);
				docDefinition.content[0].table.body = newArr;
			}


			let short_excess_currency_conversion_sgst_amt = 0;
			let short_excess_currency_conversion_sgst_amt_show = '';

			let setExcessShortCurrencyConvertsgstAmt = [{ text: '', border: [true, false, true, false] }, { text: '', border: [false, false, true, false] }, { text: '', alignment: 'right', border: [false, false, true, false] }];

			if (nonlcswiftdetails.currency_convert_sgst > nonlcswiftdetails.update_currency_convert_sgst) {
				//short
				short_excess_currency_conversion_sgst_amt = Number(nonlcswiftdetails.currency_convert_sgst - nonlcswiftdetails.update_currency_convert_sgst);

				short_excess_currency_conversion_sgst_amt_show = '-' + short_excess_currency_conversion_sgst_amt.toFixed(2);

				setExcessShortCurrencyConvertsgstAmt = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_currency_conversion_sgst_amt_show, alignment: 'right', border: [false, false, true, false] }];

				let arr = docDefinition.content[0].table.body;

				var index = searchInArray(arr, "SGST On Currency Conversion");

				let newArr = insertToArray(arr, setExcessShortCurrencyConvertsgstAmt, index);
				docDefinition.content[0].table.body = newArr;

			} else if (nonlcswiftdetails.currency_convert_sgst < nonlcswiftdetails.update_currency_convert_sgst) {
				//excess
				short_excess_currency_conversion_sgst_amt = Number(nonlcswiftdetails.update_currency_convert_sgst - nonlcswiftdetails.currency_convert_sgst);
				short_excess_currency_conversion_sgst_amt_show = '+' + short_excess_currency_conversion_sgst_amt.toFixed(2);
				setExcessShortCurrencyConvertsgstAmt = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_currency_conversion_sgst_amt_show, alignment: 'right', border: [false, false, true, false] }];

				let arr = docDefinition.content[0].table.body;

				var index = searchInArray(arr, "SGST On Currency Conversion");

				let newArr = insertToArray(arr, setExcessShortCurrencyConvertsgstAmt, index);
				docDefinition.content[0].table.body = newArr;
			}


			let short_excess_swift_amt = 0;
			let short_excess_swift_amt_show = '';

			let setExcessShortSwiftAmt = [{ text: '', border: [true, false, true, false] }, { text: '', border: [false, false, true, false] }, { text: '', alignment: 'right', border: [false, false, true, false] }];

			if (nonlcswiftdetails.swift_charges > nonlcswiftdetails.update_swift_charges) {
				//short
				short_excess_swift_amt = Number(nonlcswiftdetails.swift_charges - nonlcswiftdetails.update_swift_charges);

				short_excess_swift_amt_show = '-' + short_excess_swift_amt.toFixed(2);

				setExcessShortSwiftAmt = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_swift_amt_show, alignment: 'right', border: [false, false, true, false] }];

				let arr = docDefinition.content[0].table.body;

				var index = searchInArray(arr, "Swift Charges");

				let newArr = insertToArray(arr, setExcessShortSwiftAmt, index);
				docDefinition.content[0].table.body = newArr;

			} else if (nonlcswiftdetails.swift_charges < nonlcswiftdetails.update_swift_charges) {
				//excess
				short_excess_swift_amt = Number(nonlcswiftdetails.update_swift_charges - nonlcswiftdetails.swift_charges);
				short_excess_swift_amt_show = '+' + short_excess_swift_amt.toFixed(2);
				setExcessShortSwiftAmt = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_swift_amt_show, alignment: 'right', border: [false, false, true, false] }];

				let arr = docDefinition.content[0].table.body;

				var index = searchInArray(arr, "Swift Charges");

				let newArr = insertToArray(arr, setExcessShortSwiftAmt, index);
				docDefinition.content[0].table.body = newArr;
			}


			let totalChargesAccordingToBank = nonlcswiftdetails.total_charges_bank;


			let short_excess_bank_charges = 0;
			let short_excess_bank_charges_show = '';
			let totalBankCharges = [];
			if (nonlcswiftdetails.total_charges_system > totalChargesAccordingToBank) {
				short_excess_bank_charges = Number(nonlcswiftdetails.total_charges_system) - Number(totalChargesAccordingToBank);

				short_excess_bank_charges_show = '-' + short_excess_bank_charges.toFixed(2);

				totalBankCharges = [{ text: '', border: [true, false, true, false] }, { text: 'Short Charges According to Bank ', border: [false, false, true, false] }, { text: short_excess_bank_charges_show, alignment: 'right', border: [false, false, true, false] }];


				let arr = docDefinition.content[0].table.body;
				var total_bank_charges_index = searchInArray(arr, "Total Charges");
				let newArr = insertToArray(arr, totalBankCharges, total_bank_charges_index);
				docDefinition.content[0].table.body = newArr;


			} else if (nonlcswiftdetails.total_charges_system < totalChargesAccordingToBank) {
				short_excess_bank_charges = Number(totalChargesAccordingToBank - nonlcswiftdetails.total_charges_system);
				short_excess_bank_charges_show = '+' + short_excess_bank_charges.toFixed(2);

				totalBankCharges = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Charges According to Bank ', border: [false, false, true, false] }, { text: short_excess_bank_charges_show, alignment: 'right', border: [false, false, true, false] }];

				let arr = docDefinition.content[0].table.body;
				var total_bank_charges_index = searchInArray(arr, "Total Charges");
				let newArr = insertToArray(arr, totalBankCharges, total_bank_charges_index);
				docDefinition.content[0].table.body = newArr;
			}
		}
		pdfMake.createPdf(docDefinition).open();
	};


	updateCharges(nonlcswiftdetails) {
		this.editChargesDetails = nonlcswiftdetails;
		this.charge_id = nonlcswiftdetails.id;

		this.updateChargesForm.patchValue({
			update_nonlc_amt_inr: this.editChargesDetails['update_nonlc_amt_inr'],
			update_nonlc_remit_charges_amt_inr: this.editChargesDetails['update_nonlc_remit_charges_amt_inr'],
			charges_date: this.editChargesDetails['charges_date'],
			update_currency_convert_cgst: this.editChargesDetails['update_currency_convert_cgst'],
			update_currency_convert_sgst: this.editChargesDetails['update_currency_convert_sgst'],
			update_swift_charges: this.editChargesDetails['update_swift_charges'],
			additional_header: this.editChargesDetails['additional_header'],
			additional_charges: this.editChargesDetails['additional_charges'],
		});
		this.myModal.show();
	}

	UpdateChargesSave() {

		let ChargesACcordingToBank = this.nonLcRemittanceChargesCalculation();
		let data = {
			update_nonlc_amt_inr: this.updateChargesForm.value.update_nonlc_amt_inr ? this.updateChargesForm.value.update_nonlc_amt_inr : 0,
			update_nonlc_remit_charges_amt_inr: this.updateChargesForm.value.update_nonlc_remit_charges_amt_inr ? this.updateChargesForm.value.update_nonlc_remit_charges_amt_inr : 0,
			charges_date: this.updateChargesForm.value.charges_date ? this.updateChargesForm.value.charges_date : null,
			update_currency_convert_cgst: this.updateChargesForm.value.update_currency_convert_cgst ? this.updateChargesForm.value.update_currency_convert_cgst : 0,
			update_currency_convert_sgst: this.updateChargesForm.value.update_currency_convert_sgst ? this.updateChargesForm.value.update_currency_convert_sgst : 0,
			update_swift_charges: this.updateChargesForm.value.update_swift_charges ? this.updateChargesForm.value.update_swift_charges : 0,
			additional_header: this.updateChargesForm.value.additional_header ? this.updateChargesForm.value.additional_header : null,
			additional_charges: this.updateChargesForm.value.additional_charges ? this.updateChargesForm.value.additional_charges : 0,
			total_charges_bank: ChargesACcordingToBank
		}

		let body = {
			ChargesData: data,
			id: this.charge_id

		}

		this.CrudServices.updateData<any>(nonLcRemittanceCharges.update, body).subscribe((response) => {

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

	nonLcRemittanceChargesCalculation() {


		let upadteNonLcInrAmt = Number(this.editChargesDetails.update_nonlc_amt_inr);


		//NonLcRemittance 
		let updateNonLcRemitInrAmt = Number(this.editChargesDetails.update_nonlc_remit_charges_amt_inr);
		let nonLcRemitAmtCgst = Number(updateNonLcRemitInrAmt * (Number(this.cgstDbValue) / 100));
		let nonLcRemitAmtSgst = Number(updateNonLcRemitInrAmt * (Number(this.sgstDbValue) / 100));

		//Currency Conversion 
		let UpdateCurrencyConvertCgst = Number(this.editChargesDetails.update_currency_convert_cgst);
		let UpdateCurrencyConvertSgst = Number(this.editChargesDetails.update_currency_convert_sgst);


		//Swift Changes
		let swift_amount = Number(this.editChargesDetails.update_swift_charges);
		let swiftCgst = Number(swift_amount * (Number(this.cgstDbValue) / 100));
		let swiftSgst = Number(swift_amount * (Number(this.sgstDbValue) / 100));

		let totalChargesAccordingtoBank = Number(updateNonLcRemitInrAmt) + Number(nonLcRemitAmtCgst) + Number(nonLcRemitAmtSgst) + Number(UpdateCurrencyConvertCgst) + Number(UpdateCurrencyConvertSgst) +
			Number(swift_amount) + Number(swiftCgst) + Number(swiftSgst) +
			Number(this.updateChargesForm.value.additional_charges);

		return totalChargesAccordingtoBank;
	}

	recalculateCharges(nonlcswiftdetailsid) {
		let body = {
			nonlcswiftdetailsid: nonlcswiftdetailsid
		};

		this.CrudServices.updateData<any>(nonLcRemittanceCharges.reCalculateCharges, body).subscribe((response) => {

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


	calculatePortWiseCharges(nonLcChargeDetails) {
		let totalBankCharges = nonLcChargeDetails.total_charges_bank;

		let portWiseChargesStr = '<h5><i class="fa fa-ship" aria-hidden="true"></i><span class="badge badge-primary"><b>  ' + (nonLcChargeDetails.non_lc_swift_detail.flc_proforma_invoice.port_master.port_name) + '</span> <br> <i class="fa fa-inr" aria-hidden="true"></i> <span class="badge badge-primary">  ' + (totalBankCharges).toFixed(2) + '</span></h5> <hr>';

		return portWiseChargesStr;
	}

	checkVoucher(id, flag_check_enter) {
		//flag_check_enter
		//1- check 
		//2 - entered 
		let body = {
			id: id,
			flag_check_enter: flag_check_enter
		}
		this.CrudServices.getOne<any>(nonLcRemittanceCharges.voucher_check, body).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
				this.getBankChargesList();
			}
		});

	}
}
