import { Component, OnInit, ViewEncapsulation, ViewChild, Input, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { staticValues, roundAmount, roundQuantity, CommonService } from '../../../shared/common-service/common-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { AmountToWordPipe } from '../../../shared/amount-to-word/amount-to-word.pipe';
import { GenerateSoPvcService } from '../../../shared/generate-doc/generate-so-pvc';
import {
	SalesOrders,
	PercentageDetails,
	UsersNotification,
	Notifications,
	LocalPurchase,
	Consignments,
	EmailTemplateMaster,
	FileUpload,
	SpiplBankMaster,
	SubOrg,
	SalesPi,
	SalesLc
} from '../../../shared/apis-path/apis-path';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import { MessagingService } from '../../../service/messaging.service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";
import { forkJoin } from "rxjs";
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
import { element } from 'protractor';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
	selector: 'app-sales-orders',
	templateUrl: './sales-orders.component.html',
	styleUrls: ['./sales-orders.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		CrudServices,
		ToasterService,
		PermissionService,
		ExportService,
		AmountToWordPipe,
		CurrencyPipe,
		Calculations,
		CommonService,
		GenerateSoPvcService
	]
})

export class SalesOrdersComponent implements OnInit {

	@ViewChild("extendModal", { static: false }) public extendModal: ModalDirective;
	@ViewChild("knockOffModal", { static: false }) public knockOffModal: ModalDirective;
	@ViewChild("viewDealModal", { static: false }) public viewDealModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Sales Orders List"
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to delete?';
	popoverMessage2: string = 'Are you sure, you want to Approve this Deal?';
	popoverMessage3: string = 'Are you sure, you want to Renew this Deal?';
	popoverMessage4: string = 'Are you sure, you want to Reverse Payment?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'right';
	placement1: string = 'left';
	cancelClicked: boolean = false;

	user: UserDetails;
	role_id: any = null;
	company_id: any = null;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	delete_opt: boolean = false;
	finance_opt: boolean = false;
	extend_opt: boolean = false;
	renew_opt: boolean = false;
	knock_off_opt: boolean = false;
	payment_reverse: boolean = false;
	isLoading: boolean = false;
	loadingBtn: boolean = false;
	approve_sales_order: boolean = false;
	enableApproveAll: boolean = false;
	company_bank_details: any = null;

	datePickerConfig: any = staticValues.datePickerConfigNew;
	statusList: any = [];
	selected_date_range: any = [
		new Date(moment().subtract(60, 'days').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];

	extendForm: FormGroup;
	knockOffForm: FormGroup;
	percent: any = null;
	selected_deal: any = null;
	selected_deal_dispatch: any = [];
	selected_status: any = null;
	cols: any = [];
	selected_cols: any = [];
	data: any = [];
	filter: any = [];
	checked: any = [];

	emailSubject: any = null;
	emailFooterTemplete: any = null;
	emailBodyTemplete: any = null;
	emailFrom: any = null;
	magangementSPIPLWhatsappNumbers: any = staticValues.magangementSPIPLWhatsappNumbersSales;
	magangementSSurishaWhatsappNumbers: any = staticValues.magangementSSurishaWhatsappNumbersSales;
	magangementEmails: any = [];

	notification_details: any;
	notification_tokens = [];
	notification_id_users = []
	notification_users = [];
	zone_fcm = [];

	fileData: FormData = new FormData();
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	isRange: any;
	maxDate: Date = new Date();
	financeData: any = [];
	isFinanceToaster: boolean = false;

	constructor(
		private toasterService: ToasterService,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private amountToWord: AmountToWordPipe,
		private currencyPipe: CurrencyPipe,
		private calculations: Calculations,
		private commonService: CommonService,
		private messagingService: MessagingService,
		private generateSoPvc: GenerateSoPvcService
	) {
		this.user = this.loginService.getUserDetails();
		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;
		this.links = this.user.links;
		this.approve_sales_order = (this.links.find(x => x == 'approve_sales_order') != null) ? true : false;
		this.finance_opt = (this.links.find(x => x == 'finance_opt') != null) ? true : false;
		this.extend_opt = (this.links.find(x => x == 'extend_opt') != null) ? true : false;
		this.renew_opt = (this.links.find(x => x == 'renew_opt') != null) ? true : false;
		this.knock_off_opt = (this.links.find(x => x == 'knock_off_opt') != null) ? true : false;
		this.payment_reverse = (this.links.find(x => x == 'payment_reverse') != null) ? true : false;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.delete_opt = perms[3];

		if (this.role_id == 1) {
			this.statusList = staticValues.sales_orders_status_ssurisha;
			this.selected_status = this.statusList[0];
		} else {
			if (this.company_id == 1) {
				this.statusList = staticValues.sales_orders_status_spipl;
				this.selected_status = this.statusList[0];
			} else if (this.company_id == 2) {
				this.statusList = staticValues.sales_orders_status_ssurisha;
				this.selected_status = this.statusList[0];
			} else {
				this.statusList = [];
				this.selected_status = null;
			}
		}
	}

	ngOnInit() {
		this.getPercentValues();
		this.initForm();
		this.getCols();
	}

	getSpiplBank(company_id) {
		this.crudServices.getOne<any>(SpiplBankMaster.getCompanyBank, {
			company_id: company_id
		}).subscribe(res => {
			if (res.length > 0) {
				this.company_bank_details = {
					bank_name: res[0].bank_name,
					branch_name: res[0].branch_name,
					ifsc_code: res[0].ifsc_code
				};
			}
		});
	}

	getPercentValues() {
		this.crudServices.getOne<any>(PercentageDetails.getOne, {
			detail_type: 2
		}).subscribe((response) => {
			this.percent = response;
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

	initForm() {
		this.extendForm = new FormGroup({
			type: new FormControl(null, Validators.required),
			con_id: new FormControl(null, Validators.required),
			extend_days: new FormControl(null, [Validators.required, Validators.min(1)])
		});
		this.knockOffForm = new FormGroup({
			quantity: new FormControl(null, Validators.required),
			knock_off_remark: new FormControl(null, Validators.required)
		});
	}

	async getEmailTemplate() {
		this.emailSubject = undefined;
		this.emailFooterTemplete = undefined;
		this.emailBodyTemplete = undefined;
		let headerRed = this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'sales_order_confirmation' });
		let footer_req = this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Footer' });
		await forkJoin([headerRed, footer_req]).subscribe(response => {
			if (response[0].length > 0) {
				this.emailBodyTemplete = response[0][0].custom_html;
				this.emailSubject = response[0][0].subject;
				this.emailFrom = response[0][0].from_name;
			}
			if (response[1].length > 0) {
				this.emailFooterTemplete = response[0][0].custom_html;
			}
		})
	}

	getData() {
		this.data = [];
		this.isLoading = true;

		let condition = {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			status: this.selected_status.id,
			company_id: (this.role_id == 1 || this.role_id == 11 || this.role_id == 50) ? null : this.company_id
		}
		if (this.user.userDet[0].role_id == 5 || this.user.userDet[0].role_id == 33) {
			if (this.user.userDet[0].insider_parent_id != null) {
				condition["added_by"] = this.user.userDet[0].id;
			} else {
				condition["zone_id"] = this.user.userDet[0].id;
			}
		} else {
			condition["added_by"] = null;
			condition["zone_id"] = null;
		}

		this.crudServices.getOne<any>(SalesOrders.getSalesOrders, condition).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						if (Number(element.dispatch_balance) < 0) {
							element.dispatch_balance = 0;
						}
						if (Number(element.finance_balance) < 0) {
							element.finance_balance = 0;
						}
						element.customer = element.customer + (element.location_vilage ? ' (' + element.location_vilage + ')' : '');
						element.so_quantity = Number(element.quantity) - Number(element.cancel_quantity);
						// element.days_left = this.countDaysLeft(element.booking_date, element.renewed_date, element.extend_days, element.company_id);
						element.days_left = this.countDaysLeft(element.expiry_date, element.status);
						element.cancel_quantity = roundQuantity(element.cancel_quantity);
						element.plan_quantity = roundQuantity(element.plan_quantity);
						element.finance_balance = roundQuantity(element.finance_balance);
						element.dispatch_balance = roundQuantity(element.dispatch_balance);
						let min_30 = moment(element.added_date).add(30, 'minutes');
						if (this.user.userDet[0].role_id == 5 || this.user.userDet[0].role_id == 33 || this.user.userDet[0].role_id == 46) {
							if (moment(min_30).isAfter(moment())) {
								element.enable_edit_option = true;
							} else {
								element.enable_edit_option = false;
							}
						} else {
							if ((element.so_quantity == element.finance_balance) && element.is_knock_off == 0) {
								element.enable_edit_option = true;
							} else {
								element.enable_edit_option = false;
							}
						}
					});
					if (this.selected_status.id == 0) {
						this.data = res.data.filter(x => x.dispatch_balance > 0);
					} else {
						this.data = res.data;
					}
					this.pushDropdown(this.data);
					this.footerTotal(this.data);
				}
			}
			this.table.reset();
		});
	}

	getCols() {
		// if (this.selected_status.id == 0) {
		this.cols = [
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "id", header: "Con ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "days_left", header: "Days Left", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "zone", header: "Zone", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "godown_name", header: "Godown", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "main_grade", header: "Main Grade", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "import_local_label", header: "Import/\nLocal", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "cancel_quantity", header: "Knock-Off Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "total_plan_quantity", header: "Finance Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "d_quantity", header: "Dispatch Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "finance_balance", header: "Finance Balance", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "dispatch_balance", header: "Dispatch Balance", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "final_rate", header: "Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "freight_rate", header: "Freight", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "nb", header: "N.B.", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "booking_date", header: "Booking Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "cancel_date", header: "Cancel Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "balance_amount", header: "Adjusted Balance", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "payment_term_label", header: "Payment Term", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "deal_type_label", header: "Deal Type", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "stock_type_label", header: "Stock Type", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "is_price_protection", header: "Is Price Protection", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: 'pp' },
			{ field: "remark", header: "Remark", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
		];
		if (this.role_id == 1) {
			this.selected_cols = [
				{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "id", header: "Con ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "days_left", header: "Days Left", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "zone", header: "Zone", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "import_local_label", header: "Import/\nLocal", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
				{ field: "cancel_quantity", header: "Knock-Off Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
				{ field: "d_quantity", header: "Dispatch Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
				{ field: "final_rate", header: "Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
				{ field: "finance_balance", header: "Finance Balance", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
				{ field: "dispatch_balance", header: "Dispatch Balance", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
				{ field: "godown_name", header: "Godown", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "payment_term_label", header: "Payment Term", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "balance_amount", header: "Adjusted Balance", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
				{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "deal_type_label", header: "Deal Type", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "is_price_protection", header: "Is Price Protection", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: 'pp' },
			];
		} else {
			this.selected_cols = [
				{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "id", header: "Con ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "days_left", header: "Days Left", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "zone", header: "Zone", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "import_local_label", header: "Import/\nLocal", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
				{ field: "cancel_quantity", header: "Knock-Off Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
				{ field: "d_quantity", header: "Dispatch Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
				{ field: "final_rate", header: "Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
				{ field: "finance_balance", header: "Finance Balance", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
				{ field: "dispatch_balance", header: "Dispatch Balance", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
				{ field: "balance_amount", header: "Adjusted Balance", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
				{ field: "godown_name", header: "Godown", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "deal_type_label", header: "Deal Type", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "is_price_protection", header: "Is Price Protection", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: 'pp' },
			];
		}
		this.filter = ['id', 'customer', 'zone', 'godown_name', 'main_grade', 'grade_name', 'import_local_label'];
		this.getData();
		// }
	}

	@Input() get selectedColumns(): any[] {
		localStorage.setItem(
			"selected_sales_order_col",
			JSON.stringify(this.selected_cols)
		);
		return this.selected_cols;
	}

	set selectedColumns(val: any[]) {
		this.selected_cols = this.cols.filter((col) => val.includes(col));
		this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	getColumnPresent(col) {
		if (this.selected_cols.find((ob) => ob.field === col)) {
			return true;
		} else {
			return false;
		}
	}

	pushDropdown(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		let filter_cols = this.selected_cols.filter(col => col.filter == true);
		filter_cols.forEach(element => {
			let unique = data.map(item =>
				item[element.field]
			).filter((value, index, self) =>
				self.indexOf(value) === index
			);
			let array = [];
			unique.forEach(item => {
				array.push({
					value: item,
					label: item
				});
			});
			element.dropdown = array;
		});
	}

	footerTotal(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		let filter_cols = this.selected_cols.filter(col => col.footer == true);
		filter_cols.forEach(element => {
			if (data.length > 0) {
				let total = data.map(item =>
					item[element.field]
				).reduce((sum, item) => sum + item);
				element.total = total;
			}

		});
	}

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		// this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		// this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}

	countDaysLeft(expiry_date, status) {
		// let daysCount = 0;
		// let days = 0;
		// let date = null;
		// if (renewed_date != null) {
		// 	date = renewed_date;
		// 	days = extend_days;
		// } else {
		// 	date = from_date;
		// 	days = (company_id == 1) ? 10 : 8;
		// 	days += extend_days;
		// }
		// let last_date = moment(date).add(days, 'days').format("YYYY-MM-DD");
		// // let startDate = new Date(extend_date);
		// // let endDate = new Date(last_date);
		// // let diff = Math.floor((endDate.getTime() - startDate.getTime()) / 1000 / 60 / 60 / 24);

		if (status > 3) {
			return '*';
		} else {
			if (moment(expiry_date).isBefore(moment())) {
				return '*';
			} else {
				let daysCount = moment(expiry_date).diff(moment(), 'days');
				return (daysCount + 1);
			}
		}
		// let total_days = Number(days);
		// if (total_days > dayCount) {
		// 	return '*';
		// } else {
		// 	return dayCount - total_days;
		// }
	}

	onCheckAll() {
		if (this.checked.length > 0) {
			this.checked = [];
			this.enableApproveAll = false;
		} else {
			this.checked = this.data.filter(o => o.status == 0 && o.company_id == 2);
			if (this.checked.length > 0) {
				this.enableApproveAll = true;
			} else {
				this.enableApproveAll = false;
			}
		}
	}

	onAction(item: any, type: string) {

		if (type == 'Add Sales Order') {
			this.router.navigate(["sales/add-sales-order"]);
		} else if (type == 'View') {
			this.selected_deal = item;
			this.getSalesOrderDispatch(item.id);
		} else if (type == 'Edit') {
			this.router.navigate(["sales/edit-sales-order", JSON.stringify({id: item.id , editPayment : false})]);
		} else if (type == 'Delete') {
			this.isLoading = true;
			let amount = item.balance_amount;
			let extra_column = "extra_suspense";//this.getSubOrgExtraColumnName(item.import_local_flag);
			this.crudServices.updateData(SalesOrders.reverseExtraAmount, {
				con_id: item.id,
				sub_org_id: item.sub_org_id,
				extra_column: extra_column,
				received_amount: amount
			}).subscribe(result => {
				this.crudServices.deleteData(SalesOrders.delete, {
					id: item.id
				}).subscribe(res => {
					if (res['code'] == '100') {
						this.isLoading = false;
						this.toasterService.pop('success', 'Success', 'Order Deleted');
						this.getData();
						this.getFCMWithNotification('SALES_CONSIGNMENT_DELETE');
						let notification_body = undefined;
						setTimeout(() => {
							if (this.notification_details) {
								if (item.zone_fcm_web_token) {
									this.notification_tokens = [...this.notification_tokens, item.zone_fcm_web_token];
									this.notification_id_users = [...this.notification_id_users, item.zone_id];
								}
								notification_body = {
									notification: {
										"title": `${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name}  ${this.notification_details ? this.notification_details.title : ''}`,
										"body": `Customer :  ${item.customer},  Grade:${item.grade_name} 0f  ${item.quantity} MT  Godown :${item.godown_name}  Booking Date: ${item.booking_date}`,
										"click_action": "https://erp.sparmarglobal.com:8085/#/sales/sales-orders"
									},
									registration_ids: this.notification_tokens
								}
							}
						}, 2000);
						this.sendInAppNotification(notification_body);
					} else {
						this.isLoading = false;
						this.toasterService.pop('error', 'Alert', 'Order Cannot Be Deleted');
					}
				});
			});

		} else if (type == 'Generate') {
			this.getSpiplBank(item.company_id);
			this.downloadSo(item);
		} else if (type == 'Download') {
			window.open(item.so_copy, "_blank");
			// this.generateSo(item).then(async (pdfObj) => {
			// 	await pdfMake.createPdf(pdfObj).open();
			// });
		} else if (type == 'Finance') {
			// this.financeData = [];
			// this.crudServices.getOne<any>(SalesPi.piApprovedData, {
			// 	con_id: item.id
			// }).subscribe(res => {
			// 	if (res['code'] == '100') {
			// 		console.log(res)
			// 		if (res.data && res.data.length > 0) {
			// 			for (let ele of res.data) {
			// 				if (ele.is_pi_approved == 0) {
			// 					this.isFinanceToaster = true;
			// 					break
			// 				}
			// 			}
			// 			if (this.isFinanceToaster == true) {
			// 				this.toasterService.pop('error', 'Alert', 'Proforma Invoice Is Not Approved');
			// 			} else {
							//right now we are not checking for lc creation
							// this.crudServices.getOne<any>(SalesLc.lcApprovedData, {
							// 	con_id: item.id
							// }).subscribe(res => {
							// 	if (res['code'] == '100') {
							// 		console.log(res)
							// 		if (res.data && res.data.length > 0) {
							// 			this.toasterService.pop('error', 'Alert', 'Letter OF Credit Is Not Approved');
							// 		} else {
							this.router.navigate(["sales/finance", item.id]);
			// 			}
			// 		}
			// 		else {
			// 			this.router.navigate(["sales/finance", item.id]);
			// 		}
			// 	}
			// });
		} else if (type == 'Extend') {
			this.selected_deal = item;
			this.extendForm.reset();
			this.extendForm.patchValue({
				type: 'Extend',
				con_id: item.id,
				extend_days: 0
			});
			this.extendModal.show();
		} else if (type == 'Renew') {
			this.selected_deal = item;
			this.extendForm.reset();
			this.extendForm.patchValue({
				type: 'Renew',
				con_id: item.id,
				extend_days: 0
			});
			this.extendModal.show();
		} else if (type == 'Cancel') {
			this.getFCMWithNotification('SALES_CONSIGNMENT_MANUAL_KNOCK_OFF');
			this.selected_deal = item;
			let final_quantity = Number(item.finance_balance);
			if (this.role_id == 5 || this.role_id == 33) {
				final_quantity = (item.finance_balance > 5) ? 5 : item.finance_balance;
			}
			this.knockOffForm.reset();
			this.knockOffForm.patchValue({
				quantity: final_quantity
			});
			this.knockOffForm.get("quantity").setValidators([Validators.required, Validators.max(final_quantity)]);
			this.knockOffForm.get('quantity').updateValueAndValidity();
			this.knockOffModal.show();
		} else if (type == 'Approve') {
			this.getEmailTemplate()
			let body = {
				data: {
					status: (item.status == 0) ? 1 : 0
				},
				id: item.id
			};
			this.crudServices.updateData(SalesOrders.update, body).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', 'Order Approved');
					this.crudServices.getOne<any>(SalesOrders.getSalesOrder, {
						id: item.id
					}).subscribe(res_data => {
						if (res_data.code == '100') {
							if (res_data.data.length > 0) {
								this.sendEmail(res_data.data[0]);
								this.sendWhatsApp(res_data.data[0], res_data.data[0].so_copy);
								this.getData();
							}
						}
					});
				}
			});
		} else if (type == 'Approve_All') {
			this.getEmailTemplate()
			let arr = this.checked.map(item => item.id).filter((value, index, self) => self.indexOf(value) === index);
			let body = {
				data: {
					status: 1
				},
				ids: arr
			}
			this.crudServices.updateData(SalesOrders.updateStatus, body).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', 'Orders Approved');
					this.getData();
					arr.forEach(async (id) => {
						await this.crudServices.getOne<any>(SalesOrders.getSalesOrder, {
							id: id
						}).subscribe(res_data => {
							if (res_data.code == '100') {
								if (res_data.data.length > 0) {
									this.sendEmail(res_data.data[0]);
									this.sendWhatsApp(res_data.data[0], res_data.data[0].so_copy);
								}
							}
						});
					});
				}
			});
		} else if (type == 'Payment_Reverse') {
			this.crudServices.getOne<any>(SalesOrders.updatePaymentReverse, {
				id: item.id,
				payment_reverse: 1
			}).subscribe(res_data => {
				this.getData();
			});
		} else if (type == 'Download_Invoice') {
			let invoice_arr = JSON.parse(item);
			this.crudServices.downloadMultipleFiles(invoice_arr);
		}
	}

	getSubOrgExtraColumnName(flag) {
		if (flag == 1) {
			return "extra_import";
		} else if (flag == 2) {
			return "extra_local";
		} else {
			return "extra_suspense";
		}
	}

	getSalesOrderDispatch(con_id) {
		this.selected_deal_dispatch = [];
		this.crudServices.getOne<any>(SalesOrders.getSalesOrderDispatch, {
			con_id: con_id
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.selected_deal_dispatch = res.data;
				}
				this.viewDealModal.show();
			}
		});
	}

	downloadSo(item) {
		this.crudServices.getOne<any>(SalesOrders.getSalesOrder, {
			id: item.id
		}).subscribe(res_data => {
			if (res_data.code == '100') {
				if (res_data.data.length > 0) {
					this.generateSoPvc.generateSo(res_data.data[0], this.percent, this.company_bank_details).then(async (pdfObj) => {
						let pdfOBjFromData = pdfObj;
						await pdfMake.createPdf(pdfOBjFromData).getBlob(data => {
							if (data) {
								this.fileData.append('sales_order_pdf', data, 'so.pdf');
								this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res => {
									let path = res.uploads.sales_order_pdf[0].location;
									let so_no_new = (item.so_no == null) ? 'SPIPL/PI/' + this.commonService.get_po_financial_year(item.booking_date) + '/' + item.id : item.so_no;
									this.crudServices.updateData(SalesOrders.update, {
										id: res_data.data[0].id,
										data: {
											so_copy: path,
											so_no: so_no_new
										}
									}).subscribe(result => {
										if (result) {
											window.open(path, "_blank");
											this.toasterService.pop('success', 'Success', 'So Generated Successfully');
											this.getData();
										}
									})
								})
							}
						});
					});
				}
			}
		});
	}

	submitExtendForm() {
		this.loadingBtn = true;
		let extend_days = Number(this.extendForm.value.extend_days);
		let extend_type = this.extendForm.value.type;

		if (extend_type == 'Renew') {
			this.crudServices.getOne(SubOrg.getTDSTCSRate, {
				sub_org_id: Number(this.selected_deal.sub_org_id)
			}).subscribe(res_org => {
				let tds = 0;
				let tcs = 0;
				if (res_org['code'] == '100') {
					if (res_org['data'].length > 0) {
						tds = Number(res_org['data'][0].tds);
						tcs = Number(res_org['data'][0].tcs);
					}
				}
				let new_quantity = Number(this.selected_deal.cancel_quantity);
				let new_base_amount = Number(this.selected_deal.final_rate) * new_quantity;
				let new_credit_note = new_quantity * Number(this.selected_deal.discount_rate);

				let obj_gst = this.percent.find(o => o.percent_type === 'gst');
				let total_amount = this.calculations.getTotalAmountWithTax(new_base_amount, tds, tcs, obj_gst.percent_value, this.selected_deal.company_id);
				let new_total_amount = roundAmount(total_amount);

				let expiry_date = moment().add(extend_days, 'days').format("YYYY-MM-DD");

				let data = {
					booking_date: this.selected_deal.booking_date,
					main_org_id: this.selected_deal.main_org_id,
					sub_org_id: this.selected_deal.sub_org_id,
					zone_id: this.selected_deal.zone_id,
					godown_id: this.selected_deal.godown_id,
					grade_id: this.selected_deal.grade_id,
					currency: this.selected_deal.currency,
					notional_rate: Number(this.selected_deal.notional_rate),
					bill_rate: Number(this.selected_deal.bill_rate),
					deal_rate: Number(this.selected_deal.deal_rate),
					final_rate: Number(this.selected_deal.final_rate),
					is_rate_same: Number(this.selected_deal.is_rate_same),
					discount_rate: Number(this.selected_deal.discount_rate),
					quantity: new_quantity,
					unit_type: this.selected_deal.unit_type,
					base_amount: new_base_amount,
					total_amount: new_total_amount,
					credit_note: new_credit_note,
					delivery_term_id: this.selected_deal.delivery_term_id,
					freight_rate: Number(this.selected_deal.freight_rate),
					nb: Number(this.selected_deal.nb),
					payment_type: Number(this.selected_deal.payment_type),
					payment_term: Number(this.selected_deal.payment_term),
					advance: Number(this.selected_deal.advance),
					broker_id: this.selected_deal.broker_id,
					commission_type: this.selected_deal.commission_type,
					commission_value: this.selected_deal.commission_value,
					total_commission: this.selected_deal.total_commission,
					remark: this.selected_deal.remark,
					so_copy: this.selected_deal.so_copy,
					deal_type: this.selected_deal.deal_type,
					temp_email: (this.selected_deal.temp_email != null) ? this.selected_deal.temp_email.toString() : null,
					temp_mobile: (this.selected_deal.temp_mobile != null) ? this.selected_deal.temp_mobile.toString() : null,
					company_id: this.selected_deal.company_id,
					renewed_con_id: this.selected_deal.id,
					extend_con_id: this.selected_deal.id,
					extend_days: extend_days,
					import_local_flag: this.selected_deal.import_local_flag,
					// is_suspense_amount: this.selected_deal.is_suspense_amount,
					received_amount: this.selected_deal.received_amount,
					balance_amount: this.selected_deal.balance_amount,
					expiry_date: expiry_date
				};
				let body = {
					data: data
				};
				this.crudServices.addData(SalesOrders.add, body).subscribe(res => {
					this.loadingBtn = false;
					if (res['code'] == '100') {
						this.toasterService.pop('success', 'Success', res['data']);
						this.getCols();
						this.closeModal();
					}
				});
			});
		} else {
			let expiry_date = moment().add(extend_days, 'days').format("YYYY-MM-DD");
			let body = {
				data: {
					extend_con_id: this.selected_deal.id,
					extend_days: extend_days,
					expiry_date: expiry_date
				},
				id: this.selected_deal.id
			};
			this.crudServices.updateData(SalesOrders.update, body).subscribe(res => {
				this.loadingBtn = false;
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', res['data']);
					this.getCols();
					this.closeModal();
				}
			});
		}
	}

	submitKnockOffForm() {
		let balance_quantity = (Number(this.selected_deal.quantity) - Number(this.selected_deal.cancel_quantity)) - Number(this.knockOffForm.value.quantity);
		let data = null;
		let extra_amount = 0;

		if (balance_quantity > 0) {
			let rate = 0;
			if (Number(this.selected_deal.balance_amount) > 0) {
				rate = Number(this.selected_deal.received_amount) / balance_quantity;
			}
			extra_amount = roundAmount(rate) * Number(this.knockOffForm.value.quantity);
			let new_balance_amount = Number(this.selected_deal.balance_amount) - extra_amount;
			data = {
				// quantity: balance_quantity,
				cancel_quantity: (Number(this.selected_deal.cancel_quantity) + Number(this.knockOffForm.value.quantity)),
				balance_amount: roundAmount(new_balance_amount)
			};
		} else {
			data = {
				// quantity: balance_quantity,
				balance_amount: 0,
				cancel_quantity: (Number(this.selected_deal.cancel_quantity) + Number(this.knockOffForm.value.quantity)),
				knock_off_remark: this.knockOffForm.value.knock_off_remark
			};
		}


		if (balance_quantity == 0) {
			data['status'] = 6;
		} else {
			if (Number(this.knockOffForm.value.quantity) == Number(this.selected_deal.dispatch_balance)) {
				data['status'] = 4;
			}
		}

		let extra_column_name = null;
		if (this.selected_deal.import_local_flag == 1) {
			extra_column_name = "extra_import";
		} else if (this.selected_deal.import_local_flag == 2) {
			extra_column_name = "extra_local";
		} else {
			extra_column_name = "extra_suspense";
		}

		let body = {
			data: data,
			id: this.selected_deal.id,
			sub_org_id: this.selected_deal.sub_org_id,
			extra_amount: roundAmount(extra_amount),
			extra_column_name: "extra_suspense" // extra_column_name
		};

		if (this.selected_deal.zone_fcm_web_token) {
			this.notification_tokens.push(this.selected_deal.zone_fcm_web_token);
			this.notification_id_users.push(this.selected_deal.zone_id)
		}


		// this.notification_tokens = [...this.notification_tokens, this.selected_deal.zone_fcm_web_token];
		// this.notification_id_users = [...this.notification_id_users, this.selected_deal.zone_id];
		let notification_body = {
			notification: {
				"title": `${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name}  ${this.notification_details ? this.notification_details.title : ''}`,
				"body": `Customer :  ${this.selected_deal.customer},  Grade:${this.selected_deal.grade_name} 0f  ${this.selected_deal.quantity} MT  Godown :${this.selected_deal.godown_name}  Booking Date: ${this.selected_deal.booking_date}, knock off quantity :${Number(this.knockOffForm.value.quantity)} `,
				"click_action": "https://erp.sparmarglobal.com:8085/#/sales/sales-orders"
			},
			registration_ids: this.notification_tokens
		}
		this.crudServices.updateData(SalesOrders.update, body).subscribe(res => {
			if (res['code'] == '100') {
				this.toasterService.pop('success', 'Success', res['data']);
				this.getCols();
				this.sendInAppNotification(notification_body)
				this.closeModal();
			}
		});
	}

	closeModal() {
		this.selected_deal = null;
		this.extendForm.reset();
		this.extendModal.hide();
		this.knockOffForm.reset();
		this.knockOffModal.hide();
		this.viewDealModal.hide();
	}

	onChangeStatus(e) {
		if (e != null && e != undefined) {
			this.selected_status = {
				id: e.value.id,
				name: e.value.name
			};
			this.getData();
		}
	}

	exportData(type) {
		let final_data = null;
		if (this.table.filteredValue == null) {
			final_data = this.data;
		} else {
			final_data = this.table.filteredValue;
		}
		let fileName = this.selected_status.name + ' - ' + this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
		let exportData = [];
		for (let i = 0; i < final_data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.selected_cols.length; j++) {
				if (this.selected_cols[j]["field"] != "action") {
					if (this.selected_cols[j]["field"] == "quantity") {
						obj[this.selected_cols[j]["header"]] = final_data[i][this.selected_cols[j]["field"]] + " MT";
					} else {
						obj[this.selected_cols[j]["header"]] = final_data[i][this.selected_cols[j]["field"]];
					}
				}
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < this.selected_cols.length; j++) {
			if (this.selected_cols[j]["field"] != "action") {
				if (this.selected_cols[j]["field"] == "quantity") {
					foot[this.selected_cols[j]["header"]] = this.selected_cols[j]["total"] + " MT";
				} else if (this.selected_cols[j]["field"] == "deal_rate" ||
					this.selected_cols[j]["field"] == "freight_rate") {
					foot[this.selected_cols[j]["header"]] = this.selected_cols[j]["total"];
				} else {
					foot[this.selected_cols[j]["header"]] = "";
				}
			}
		}
		exportData.push(foot);
		
		if (type == 'Excel') {
			this.exportService.exportExcel(exportData, fileName);
		} else {
			let exportColumns = this.selected_cols.map(function (col) {
				if (col.field != "action") {
					return { title: col.header, dataKey: col.header }
				}
			});
			this.exportService.exportPdf(exportColumns, exportData, fileName);
		}
	}

	//!NOTIFICATION DETAILS WITH FCM / STAFF ID / NAME MASTER
	getFCMWithNotification(name) {
		this.notification_details = undefined;
		this.notification_tokens = [];
		this.notification_id_users = [];
		let company_id = this.user.userDet[0].company_id;
		this.crudServices.getOne(Notifications.getNotificationWithFCM, { notification_name: name, company_id: company_id })
			.subscribe((notification: any) => {
				if (notification) {
					this.notification_details = notification.data[0];
					this.notification_tokens = [...this.notification_tokens, ...notification.data[0].fcm_list];
					this.notification_id_users = [...this.notification_id_users, ...notification.data[0].staff_id];
				}
			});
	}


	//!SEND NOTIFICATION TO SELECTED FCM / AND ID 
	sendInAppNotification(body) {
		if (body != null && body != undefined) {
			this.messagingService.sendNotification(body).then((response) => {
				if (response) {
					this.saveNotifications(body['notification'])
				}
				this.messagingService.receiveMessage();
			})
		}
	}


	//!SAVE NOTIFICATION INSIDE DATABASE 
	saveNotifications(notification_body) {
		this.notification_users = [];
		for (const element of this.notification_id_users) {
			this.notification_users.push({
				notification_id: this.notification_details.id,
				reciever_user_id: element,
				department_id: 1,
				heading: notification_body.title,
				message_body: notification_body.body,
				url: notification_body.click_action,
				record_id: 1,
				table_name: 'sales_orders',
			})
		}

		this.crudServices.addData(UsersNotification.add, { data: this.notification_users }).subscribe((data) => {
		},
			(error) => { console.error(error) });
	}

	sendEmail(item) {
		if (item.temp_email.length > 0) {
			this.generateSoPvc.generateSo(item, this.percent, this.company_bank_details).then(async (pdfObj) => {
				await pdfMake.createPdf(pdfObj).getBase64((data) => {
					if (data) {
						let emailBody = {
							thepdf: data,
							tomail: item.temp_email,
							subject: this.emailSubject,
							bodytext: this.emailBodyTemplete + this.emailFooterTemplete,
							filename: 'Sales_order.pdf',
							company_id: item.company_id
						}
						this.crudServices.postRequest<any>(Consignments.sendReportMail, emailBody).subscribe((response) => {
							this.toasterService.pop('success', 'SALES ORDER MAIL SEND SUCCESS!', 'SALES ORDER MAIL SEND SUCCESS!')
						});
					}
				})
			})
		}
	}

	sendWhatsApp(element, path) {
		// let days = (this.company_id == 1) ? 10 : 6;
		let order_validity = moment(element.expiry_date).format("YYYY-MM-DD");
		//*CLIENT BODY WITHOUT NB RATE INCLUD
		let sendHeadsFotCustomer = [
			element.id ? element.id : "NA",
			element.customer ? element.customer : 'NA',
			element.grade_name ? element.grade_name : "NA",
			`${element.quantity ? element.quantity : 'NA'} ${element.unit_type ? element.unit_type : 'NA'}`,
			element.final_rate ? element.final_rate : "NA",
			element.delivery_term ? element.delivery_term : 'NA',
			element.city_name ? element.city_name : "NA",
			element.payment_term_label ? element.payment_term_label : "NA",
			order_validity,
			(element.company_id == 1 || element.company_id == 3) ? 24 : 36
		];

		let official_numbers = [];
		if (element.company_id == 1) {
			official_numbers = this.magangementSPIPLWhatsappNumbers;
		}
		if (element.company_id == 2) {
			official_numbers = this.magangementSSurishaWhatsappNumbers;
		}


		if (element.mobile_office) {
			(element.company_id == 1) ? official_numbers.push(element.mobile_office) : (element.company_id == 2) ? official_numbers.push(element.mobile_office) : null
		}

		//*MANAGEMENT BODY FOR WHATSAPP INCLUDING NB RATE 
		let sendHeadsForManagement = [
			element.id ? element.id : "NA",
			element.customer ? element.customer : 'NA',
			element.grade_name ? element.grade_name : "NA",
			`${element.quantity ? element.quantity : 'NA'} ${element.unit_type ? element.unit_type : 'NA'}`,
			element.final_rate ? element.final_rate : "NA",
			element.delivery_term ? element.delivery_term : 'NA',
			element.city_name ? element.city_name : "NA",
			element.payment_term_label ? element.payment_term_label : "NA",
			order_validity,
			element.nb ? element.nb : "NA",
			(element.company_id == 1 || element.company_id == 3) ? 24 : 36
		];

		let main_obj_for_cust = {
			company_id: element.company_id,
			locale: "en",
			template_name: element.company_id == 3 ? "sales_confirmation_common_surisha" : "sales_confirmation_common",
			attachment: [
				{
					caption: `#${element.id}-${element.customer}`,
					filename: `#${element.id}-${element.customer}.pdf`,
					url: path
				}
			]
		}

		let main_obj_for_Mgt = {
			company_id: element.company_id,
			locale: "en",
			template_name: element.company_id == 3 ? "sales_confirmation_nb_common_surisha" : "sales_confirmation_nb_common",
			attachment: [
				{
					caption: `#${element.id}-${element.customer}`,
					filename: `#${element.id}-${element.customer}.pdf`,
					url: path
				}
			]
		}

		//!CLIENT PAYLOAD
		main_obj_for_cust['numbers'] = [...element.temp_mobile.split(',')];
		main_obj_for_cust['params'] = sendHeadsFotCustomer;

		//!MANAGEMENT PAYLOAD
		main_obj_for_Mgt['numbers'] = [...official_numbers];
		main_obj_for_Mgt['params'] = sendHeadsForManagement;

		let req1 = this.crudServices.postRequest<any>(LocalPurchase.sendSMS, [main_obj_for_Mgt]);
		let req2 = this.crudServices.postRequest<any>(LocalPurchase.sendSMS, [main_obj_for_cust]);

		return forkJoin([req1, req2]).subscribe(whatsappRes => {
			if (whatsappRes) {
				this.toasterService.pop('success', 'WhatsApp  Notification !', 'WhatsApp Notification !')
			}
		})
	}
}
