import { Component, OnInit, ViewEncapsulation, ViewChild, Input, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { environment } from '../../../../environments/environment';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { SpiplBankService } from '../../masters/spipl-bank-master/spipl-bank-service';
import { MainSubOrgService } from '../../masters/sub-org-master/main-sub-org-service';
import { ProformaInvoiceService, ProformaInvoiceList } from '../proforma-invoice/proforma-invoice-service';
import { PaymentTermService } from '../../masters/payment-term-master/payment-term-service';
import { OrgBankService } from '../../masters/sub-org-master/sub-org-detail/org-bank-service';
import { Table } from 'primeng/table';
import { TemplateService } from '../../masters/template-editor/template-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import {
	FileUpload, foreignSupplier, PaymentTermMaster, SpiplBankMaster, flcProformaInvoice, subOrgRespectiveBank, lcCreation, EmailTemplateMaster, indentPi, nonLcPaymentList, ProformaInvoice, PortMaster,
	Notifications, NotificationsUserRel, UsersNotification
} from '../../../shared/apis-path/apis-path';
import { MessagingService } from '../../../service/messaging.service';
import { HelperService } from '../../../_helpers/helper_service';
import { staticValues } from '../../../shared/common-service/common-service';
import { UtilizationService } from '../utilisation-chart/utilization-service';
import { element } from 'protractor';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { NonService } from '../lc-in-operation/non-service';
@Component({
	selector: 'app-forex-dashboard',
	templateUrl: './forex-dashboard.component.html',
	styleUrls: ['./forex-dashboard.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		DatePipe,
		SpiplBankService,
		MainSubOrgService,
		ProformaInvoiceService,
		PaymentTermService,
		OrgBankService,
		TemplateService,
		ExportService,
		CrudServices,
		MessagingService,
		HelperService,
		UtilizationService,
		NonService
	]
})
export class ForexDashboardComponent implements OnInit {
	pi_list: any[];
	due_date_cols: any[];
	lc_issued: any[];
	spipl_bank_id: Number;
	spipl_bank = [];
	isLoading = false;
	lc_data = [];
	lc_issue_data: any = [];
	original_pending: any = [];
	supplier_list = [];
	buyer_list = [];
	lookup = {};
	lookup_bank = {};
	lookup_buyer = {};
	globalLcData = [];
	checkData: any[];
	payment_list = [];
	filteredValuess: any[];
	supp_charge: number;
	conf_charge: number;
	total_amount: number;
	amount: number;
	bsRangeValue: Date[];
	toPaymentDueDate: any;
	fromPaymentDueDate: any;
	lookup_supplier = {};
	bank_list = [];
	lookup_currency = {};
	global_payment_list = [];
	original_pending_list= [];
	currency = [];
	
	fromNonReceivedDate: any;
	toNonReceivedDate: any;
	
	subscription: Subscription;
	payment_status = [];

	ilc_amount = 0;
	ilc_total_amount = 0;
	total_hedge_amt = 0;
	total_unhedge_amt = 0;
	tot_amt: number;

	bsRangeValue2: any = [];
	bsRangeValue3: any = [];
	piFromDate: string;
	piToDate: string;
	currentYear: number;
	supplier = 0;
	bank = 0;

	totamount = 0;
	totquantity = 0;
	expiry = 0;
	latest_date = '';
	exp_date = '';
	total_qty = 0;
	tot_rate = 0;
	commision_amt = 0;
	commision_received = 0;
	pi_flag_hold_release: boolean = false;
	user: UserDetails;
	company_flag = 0;

	currdate = new Date();
	non_pending_check = 1;
	pi_flag_status: number;
	availability: number;
	data: any[];
	records: any[];
	arrayList: any;
	totalAmount: any;
	totalQuantity: any;
	totalQuantityLC: any;
	totalusd: any;
	totalInrAmount: any;
	

	constructor(private loginService: LoginService,
		public datepipe: DatePipe,
		private CrudServices: CrudServices,
		private utilizationService: UtilizationService,
		private nonService: NonService,
		private toasterService: ToasterService) {
		this.pi_list = [
			{ field: 'suppierOrgName', header: 'Supplier', sort: true, total: 0, style: '90px', footer: false, type: null },
			{ field: 'bank_lc_no', header: 'LC Number', sort: true, total: 0, style: '90px', footer: false, type: null },
			{ field: 'pi_quantity', header: 'Quantity', sort: true, total: 0, style: '90px', footer: true, type: 'Quantity' },
		];

		this.due_date_cols = [
			{ field: 'PaymentDueDate', header: 'Payment Due Date', sort: true, total: 0, style: '90px', type: 'Date' },
			{ field: 'SupplierName', header: 'Supplier Name', sort: true, total: 0, style: '90px', footer: false, type: null },
			{ field: 'BankName', header: 'Bank Name', sort: true, total: 0, style: '90px', footer: false, type: null },
			{ field: 'Amount', header: 'Amount', sort: true, total: 0, style: '90px', footer: true, type: 'Amount' },
			{ field: 'CurrencyName', header: 'Currency', sort: true, total: 0, style: '90px', footer: false, type: null }
		];
		this.lc_issued = [
			{ field: 'suppierOrgName', header: 'Supplier', sort: true, total: 0, style: '90px', footer: false, type: null },
			{ field: 'pi_quantity', header: 'Quantity', sort: true, total: 0, style: '90px', footer: true, type: 'Quantity' },
			{ field: 'total_pi_amount', header: 'Amount', sort: true, total: 0, style: '90px', footer: true, type: 'Amount' }
		];

		this.original_pending = [
			{ field: 'sub_org_master', header: 'Supplier Name', sort: true, total: 0, style: '90px', footer: false, type: 'sn' },
			{ field: 'spipl_bank', header: 'Bank Name', sort: true, total: 0, style: '90px', footer: false, type: 'bn' },
			{ field: 'invoice_no', header: 'Invoice No.', sort: true, total: 0, style: '90px', footer: false, type: null },
			{ field: 'date_of_shipment', header: 'Shipping Date', sort: true, total: 0, style: '90px', footer: false, type: 'Date' },
			{ field: 'arrival_date', header: 'Arrival Date', sort: true, total: 0, style: '90px', footer: false, type: 'Date' },

		];

		const today = new Date();
		this.fromPaymentDueDate = this.datepipe.transform(today, 'yyyy-MM-dd');
		today.setDate(today.getDate() + 7);
		this.toPaymentDueDate = this.datepipe.transform(today, 'yyyy-MM-dd');
		this.CrudServices.getOne<any>(SpiplBankMaster.bankType, {
			bank_type: 1
		}).subscribe((response) => {
			this.spipl_bank = response;
		});

		this.currentYear = Number(this.datepipe.transform(this.currdate, 'yyyy'));
		if (this.datepipe.transform(this.currdate, 'MM') > '03') {
			this.bsRangeValue2 = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
		} else {
			this.bsRangeValue2 = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
		}
		this.bsRangeValue = [
			new Date(moment().startOf('month').format("YYYY-MM-DD")),
			new Date(moment().format("YYYY-MM-DD"))
		];

		if (this.datepipe.transform(this.currdate, 'MM') > '03') {
			this.bsRangeValue3 = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
		} else {
			this.bsRangeValue3 = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
		}
		
	}

	ngOnInit() {
		this.getPiList();
		this.getPaymentList();
		this.lcToBeIssued();
		this.originalPending();
	}



	footerTotal(arg, cols) {
		let data = arg;
		if (data.length > 0) {
			let filter_cols = cols.filter(col => col.footer == true);
			filter_cols.forEach(element => {
				let total = data.map(item =>
					item[element.field]
				).reduce((sum, item) => sum + item);
				element.total = total;
			});
		}
	}

	getTotalAmount(item): void {
		const totalAmount = item.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
		this.totalAmount = totalAmount;
	}
	getTotalInrAmount(item): void {
		const totalAmount = item.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
		this.totalInrAmount = totalAmount;
	}
	getTotalQuantity(item): void {
		const totalQuantity = item.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
		this.totalQuantity = totalQuantity
	}

	getPiList() {
		this.isLoading = true;
		this.lc_data = [];
		this.CrudServices.postRequest<any>(flcProformaInvoice.getAllPi, {
			supplier_id: this.supplier,
			spipl_bank_id: this.bank,
			non_pending_check: 1,
			piFromDate: this.bsRangeValue2[0],
			piToDate: this.bsRangeValue2[1]
		}).subscribe((response) => {
			this.lc_data = [];
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.isLoading = false;
				const Currdate = new Date();
				let Difference_In_Time = 0;
				let Difference_In_Days = 0;
				let lc_exp_prev = 0;
				let lc_exp_next = 0;
				let lc_exp_flag = 0;
				const quantity = response.map(record => record.pi_quantity);
				this.getTotalQuantity(quantity);
				for (const val of response) {
					if (this.pi_flag_hold_release || ((!this.pi_flag_hold_release) && (val.purchase_hold_qty_flag == 0))) {

						const lc_expiry = new Date(val.lc_expiry_date);
						const lc_expiry_nxt = new Date(val.lc_expiry_date);

						lc_exp_prev = lc_expiry.setDate(lc_expiry.getDate() - 12);
						lc_exp_next = lc_expiry_nxt.setDate(lc_expiry_nxt.getDate() + 10);

						if ((new Date(lc_exp_prev) <= Currdate) && (Currdate <= new Date(lc_exp_next))) {
							lc_exp_flag = 1; // for Blink lc expiry date
						}

						const ETD = new Date(val.tentitive_departure_date);
						if (val.tentitive_departure_date != null) {
							Difference_In_Time = Currdate.getTime() - ETD.getTime();
							Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
							val.ETD_diff = Math.floor(Difference_In_Days);

						} else {
							val.ETD_diff = 0;
						}

						val.lc_exp_flag = lc_exp_flag;
						if (val.high_seas_pi == 1) {
							val.high_seas_label = 'High Seas PI';
						} else {
							val.high_seas_label = '';
						}

						if (val.forward_sale_pi == 1) {
							val.forward_sale_label = 'Import Surisha PI';
						} else {
							val.forward_sale_label = '';
						}

						if (val.transnational_sale_pi == 1) {
							val.transnational_sale_label = 'Transnational Sale PI';
						} else {
							val.transnational_sale_label = '';
						}

						val.fsd_id = `FSD${val.foreign_deal_id}`;

						this.lc_data.push(val);

						if (!(val.suppierOrgName in this.lookup)) {
							this.lookup[val.suppierOrgName] = 1;
							this.supplier_list.push({ 'suppierOrgName': val.suppierOrgName });
						}

						if (!(val.buyerOrgName in this.lookup_buyer)) {
							this.lookup_buyer[val.buyerOrgName] = 1;
							this.buyer_list.push({ 'buyerOrgName': val.buyerOrgName });
						}
						val.shipment_month_year = this.getMonth(val.shipment_month) + " - " + (val.shipment_year)

					}
				}

				let filterdata = [];
				this.footerTotal(this.lc_data, this.pi_list,);
				filterdata = this.lc_data;
				this.lc_data = filterdata;
				this.globalLcData = this.lc_data;
				this.checkData = this.lc_data;
				this.totalCalculation(this.lc_data);
			}
		});
	}

	totalCalculation(data) {
		this.total_qty = 0;
		this.tot_rate = 0;
		this.tot_amt = 0;
		this.commision_amt = 0;
		this.commision_received = 0;
		this.total_qty = this.someFunction(data)
	}

	someFunction(data) {
		return data.reduce(function (sum, item) {
			return (item.half_pending_non == 0) ? sum + item.pi_quantity : sum + item.half_pending_non;
		}, 0);
	}

	convert(str) {
		if (str) {
			const date = new Date(str),
				mnth = ('0' + (date.getMonth() + 1)).slice(-2),
				day = ('0' + date.getDate()).slice(-2);
			return [date.getFullYear(), mnth, day].join('-');
		} else {
			return '';
		}
	}

	getMonth(month: Number) {
		switch (month) {
			case 1: {
				return 'January';
				break;
			}
			case 2: {
				return 'February';
				break;
			}
			case 3: {
				return 'March';
				break;
			}
			case 4: {
				return 'April';
				break;
			}
			case 5: {
				return 'May';
				break;
			}
			case 6: {
				return 'June';
				break;
			}
			case 7: {
				return 'July';
				break;
			}
			case 8: {
				return 'August';
				break;
			}
			case 9: {
				return 'September';
				break;
			}
			case 10: {
				return 'October';
				break;
			}
			case 11: {
				return 'November';
				break;
			}
			case 12: {
				return 'December';
				break;
			}

		}
	}

	getPaymentList() {
		this.payment_list = [];
		this.filteredValuess = [];
		this.amount = 0;
		this.ilc_amount = 0;
		this.supp_charge = 0;
		this.conf_charge = 0;
		this.total_amount = 0;
		this.total_hedge_amt = 0;
		this.total_unhedge_amt = 0;

		this.utilizationService.getPaymentList('', this.fromPaymentDueDate, this.toPaymentDueDate, '')
			.subscribe(response => {
				if (response.length > 0) {
					this.getData(response);
				} else {
					this.payment_list = [];
					this.filteredValuess = [];
					this.amount = 0;
					this.ilc_amount = 0;
					this.supp_charge = 0;
					this.conf_charge = 0;
					this.total_amount = 0;
					this.total_hedge_amt = 0;
					this.total_unhedge_amt = 0;
				}
				this.isLoading = false;
			});
	}

	getData(response) {
		this.filteredValuess = response;
		let amount = 0;
		let ilc_amount = 0;
		this.ilc_amount = 0;
		this.amount = 0;
		this.supp_charge = 0;
		this.conf_charge = 0;
		this.total_amount = 0;
		this.ilc_total_amount = 0;
		this.total_hedge_amt = 0;
		this.total_unhedge_amt = 0;
		const amounts = response.map(record => record.tag != "ILC" ? record.Amount : 0);
		this.getTotalAmount(amounts);
		const usdAmount = response.map(record => record.tag == "ILC" ? record.Amount : 0);
		this.getTotalInrAmount(usdAmount);
		for (let i = 0; i < response.length; i++) {
			let StatusPayment = response[i]['StatusPayment'];
			response[i]['payment_status_flag'] = this.getStatus(response[i]['StatusPayment'])
			if (response[i]['Amount']) {
				amount = Number(response[i]['Amount']);
				this.amount = this.amount + amount;

			}

			if (!(response[i].SupplierName in this.lookup_supplier)) {
				this.lookup_supplier[response[i].SupplierName] = 1;
				this.supplier_list.push({ 'SupplierName': response[i].SupplierName });
			}

			if (!(response[i].BankName in this.lookup_bank)) {
				this.lookup_bank[response[i].BankName] = 1;
				this.bank_list.push({ 'BankName': response[i].BankName });
			}

			if (!(response[i].CurrencyName in this.lookup_currency)) {
				this.lookup_currency[response[i].CurrencyName] = 1;
				this.currency.push({ 'CurrencyName': response[i].CurrencyName });
			}
		}

		this.global_payment_list = response;
		this.footerTotal(this.global_payment_list, this.due_date_cols,);
		this.payment_list = response;
		this.filteredValuess = response;
	}
	getStatus(status) {
		switch (Number(status)) {
			case 0: {
				return 'Pending';
				break;
			}
			case 1: {
				return 'Remitted ';
				break;
			}
			case 11: {
				return 'Roll over taken';
				break;
			}
			case 2: {
				return ' Roll Over';
				break;
			}
			case 3: {
				return 'Roll over remit';
				break;
			}
			default: {
				return '';
				break;
			}
		}
	}

	lcToBeIssued() {
		this.isLoading = true;
		this.data = [];
		this.CrudServices.postRequest<any>(flcProformaInvoice.getAllPi, {
			supplier_id: this.supplier,
			spipl_bank_id: this.bank,
			piFromDate: this.bsRangeValue2[0],
			piToDate: this.bsRangeValue2[1]
		}).subscribe((response) => {
			this.data = [];
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.isLoading = false;
				const Currdate = new Date();
				let Difference_In_Time = 0;
				let Difference_In_Days = 0;
				let lc_exp_prev = 0;
				let lc_exp_next = 0;
				let lc_exp_flag = 0;
				for (const val of response) {
					if (val.pi_flag == 1 && val.lc_expiry_date == null) {
						if (this.pi_flag_hold_release || ((!this.pi_flag_hold_release) && (val.purchase_hold_qty_flag == 0))) {
							const lc_expiry = new Date(val.lc_expiry_date);
							const lc_expiry_nxt = new Date(val.lc_expiry_date);

							lc_exp_prev = lc_expiry.setDate(lc_expiry.getDate() - 12);
							lc_exp_next = lc_expiry_nxt.setDate(lc_expiry_nxt.getDate() + 10);

							if ((new Date(lc_exp_prev) <= Currdate) && (Currdate <= new Date(lc_exp_next))) {
								lc_exp_flag = 1; // for Blink lc expiry date
							}

							const ETD = new Date(val.tentitive_departure_date);
							if (val.tentitive_departure_date != null) {
								Difference_In_Time = Currdate.getTime() - ETD.getTime();
								Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
								val.ETD_diff = Math.floor(Difference_In_Days);

							} else {
								val.ETD_diff = 0;
							}

							val.lc_exp_flag = lc_exp_flag;
							if (val.high_seas_pi == 1) {
								val.high_seas_label = 'High Seas PI';
							} else {
								val.high_seas_label = '';
							}

							if (val.forward_sale_pi == 1) {
								val.forward_sale_label = 'Import Surisha PI';
							} else {
								val.forward_sale_label = '';
							}

							if (val.transnational_sale_pi == 1) {
								val.transnational_sale_label = 'Transnational Sale PI';
							} else {
								val.transnational_sale_label = '';
							}

							val.fsd_id = `FSD${val.foreign_deal_id}`;

							this.data.push(val);

							if (!(val.suppierOrgName in this.lookup)) {
								this.lookup[val.suppierOrgName] = 1;
								this.supplier_list.push({ 'suppierOrgName': val.suppierOrgName });
							}

							if (!(val.buyerOrgName in this.lookup_buyer)) {
								this.lookup_buyer[val.buyerOrgName] = 1;
								this.buyer_list.push({ 'buyerOrgName': val.buyerOrgName });
							}
							val.shipment_month_year = this.getMonth(val.shipment_month) + " - " + (val.shipment_year)

						}
					}
				}
			}

			let filterdata = [];
			filterdata = this.data;
			this.globalLcData = this.data;
			this.footerTotal(this.globalLcData, this.lc_issued);
			this.checkData = this.data;
			this.totalCalculation1(this.data);

		});
	}
	totalCalculation1(data) {
		this.total_qty = 0;
		this.tot_rate = 0;
		this.tot_amt = 0;
		this.commision_amt = 0;
		this.commision_received = 0;
		this.total_qty = this.someFunction1(data)
		this.totalQuantityLC = this.total_qty
	}
	someFunction1(data) {
		return data.reduce(function (sum, item) {
			return (item.half_pending_non == 0) ? sum + item.pi_quantity : sum + item.half_pending_non;
		}, 0);
	}
	
	originalPending(){
		this.original_pending_list = [];
		this.fromNonReceivedDate = this.bsRangeValue3[0];
		this.toNonReceivedDate = this.bsRangeValue3[1];
			
			this.isLoading = true;
			
			let formData: any = {
				non_received_date_from: this.convert(this.fromNonReceivedDate),
				non_received_date_to: this.convert(this.toNonReceivedDate),
				ori_pen_sta: true,
			}

			this.subscription = this.nonService.getAllNonNew(formData).subscribe(res => {
				this.isLoading = false;
				if (res.length > 0) {
					this.original_pending_list = res;
				}
				
			});
			
		}
		
}
