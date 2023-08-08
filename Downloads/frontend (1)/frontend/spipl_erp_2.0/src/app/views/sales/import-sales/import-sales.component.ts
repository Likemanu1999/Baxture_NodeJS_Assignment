import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { staticValues, roundAmount, roundQuantity, CommonService } from '../../../shared/common-service/common-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { AmountToWordPipe } from '../../../shared/amount-to-word/amount-to-word.pipe';
import { GenerateSoSurishaService } from '../../../shared/generate-doc/generate-so-surisha';
import {
	SalesOrders,
	ImportSales,
	PercentageDetails,
	UsersNotification,
	Notifications,
	LocalPurchase,
	Consignments,
	EmailTemplateMaster,
	FileUpload,
	SpiplBankMaster,
	SubOrg
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
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
	selector: 'app-import-sales',
	templateUrl: './import-sales.component.html',
	styleUrls: ['./import-sales.component.scss'],
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
		GenerateSoSurishaService
	]
})

export class ImportSalesComponent implements OnInit {
	@ViewChild("extendModal", { static: false }) public extendModal: ModalDirective;
	@ViewChild("knockOffModal", { static: false }) public knockOffModal: ModalDirective;
	@ViewChild("viewDealModal", { static: false }) public viewDealModal: ModalDirective;
	@ViewChild("creditAmountModal", { static: false }) public creditAmountModal: ModalDirective;
	@ViewChild("uploadSignedSOModal", { static: false }) public uploadSignedSOModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Import Sales Orders List"
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to delete?';
	popoverMessage2: string = 'Are you sure, you want to Approve this Deal?';
	popoverMessage3: string = 'Are you sure, you want to Renew this Deal?';
	popoverMessage4: string = 'Are you sure, you want to Reverse Payment?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'left';
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
	add_credit_amount: boolean = false;
	isLoading: boolean = false;
	loadingBtn: boolean = false;
	approve_sales_order: boolean = false;
	enableApproveAll: boolean = false;
	company_bank_details: any = null;

	tomailtext: any = ['aj635709@gmail.com']
	template: string;
	subject: string;
	footer: any;
	footer1: any;
	isRange: any;
	datePickerConfig: any = staticValues.datePickerConfigNew;
	statusList: any = [];
	selected_date_range: any = [
		new Date(moment().subtract(6, 'months').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];

	extendForm: FormGroup;
	knockOffForm: FormGroup;
	creditAmountForm: FormGroup;
	uploadSignedSOForm: FormGroup;
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

	emailSubject1: any = null;
	emailFooterTemplete1: any = null;
	emailBodyTemplete1: any = null;
	emailFrom: any = null;
	magangementSPIPLWhatsappNumbers: any = staticValues.magangementSPIPLWhatsappNumbersSales;

	magangementSSurishaWhatsappNumbers: any = staticValues.magangementSSurishaWhatsappNumbersSales;
	magangementSurishaEmailSales_Company_ID_3: any = staticValues.magangementSurishaEmailSales_Company_ID_3;
	magangementEmails: any = [];

	notification_details: any;
	notification_tokens = [];
	notification_id_users = []
	notification_users = [];
	zone_fcm = [];

	filesArr: Array<File> = [];
	fileData: FormData = new FormData();
	html3: any;
	emailBodyTempleteSignedSo: any = null;
	emailSubjectSignedSo: any = null;

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
		private generateSoSurisha: GenerateSoSurishaService
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
		this.add_credit_amount = (this.links.find(x => x == 'add_credit_amount') != null) ? true : false;
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
			} else if (this.company_id == 3) {
				this.statusList = staticValues.sales_orders_status_ssurisha;
				this.selected_status = this.statusList[0];
			}
		}
	}

	ngOnInit() {
		this.getSpiplBank();
		this.getPercentValues();
		this.initForm();
		this.getCols();
	}
	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;

	}
	getSpiplBank() {
		this.crudServices.getOne<any>(SpiplBankMaster.getOne, {
			// id: 33 //SURISHA INDUSIND ID
			id: 28 //SURISHA FEDERAL ID
		}).subscribe(res => {
			if (res.length > 0) {
				this.company_bank_details = {
					account_no: res[0].account_no,
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
		this.creditAmountForm = new FormGroup({
			id: new FormControl(null, Validators.required),
			total_order_amount: new FormControl(null, Validators.required),
			received_amount: new FormControl(null, Validators.required),
			balance_amount: new FormControl(null, Validators.required),
			credit_amount: new FormControl(null, Validators.required),
			remaining_amount: new FormControl(null, Validators.required)
		});

		this.uploadSignedSOForm = new FormGroup({
			so_sign_copy: new FormControl(null, Validators.required)
		});
	}

	async getEmailTemplate() {
		this.emailSubject = undefined;
		this.emailFooterTemplete = undefined;
		this.emailBodyTemplete = undefined;
		let headerRed = this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Surisha SO Release Mail' });
		let footer_req = this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Surisha Footer' });
		await forkJoin([headerRed, footer_req]).subscribe(response => {
			if (response[0].length > 0) {
				this.emailBodyTemplete = response[0][0].custom_html;
				this.emailSubject = response[0][0].subject;
				this.emailFrom = response[0][0].from_name;
			}
			if (response[1].length > 0) {
				this.emailFooterTemplete = response[1][0].custom_html;
			}
		})
	}

	async getEmailTemplateSignedSO() {
		this.emailBodyTempleteSignedSo = undefined;
		this.emailSubjectSignedSo = undefined;
		this.emailFooterTemplete = undefined;

		let headerRed = this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Surisha SO Received acknowledgement' });
		let footer_req = this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Surisha Footer' });
		await forkJoin([headerRed, footer_req]).subscribe(response => {
			if (response[0].length > 0) {
				this.emailBodyTempleteSignedSo = response[0][0].custom_html;
				this.emailSubjectSignedSo = response[0][0].subject;
				this.emailFrom = response[0][0].from_name;
			}
			if (response[1].length > 0) {
				this.emailFooterTemplete = response[1][0].custom_html;
			}
		})



	}
	async getdealCompletionEmailTemplate() {
		this.emailSubject1 = undefined;
		this.emailFooterTemplete1 = undefined;
		this.emailBodyTemplete1 = undefined;
		let headerRed1 = this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'sales_order_confirmation' });
		let footer_req1 = this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Surisha Footer' });
		await forkJoin([headerRed1, footer_req1]).subscribe(response => {
			if (response[0].length > 0) {
				this.emailBodyTemplete1 = response[0][0].custom_html;
				this.emailSubject1 = response[0][0].subject;
				this.emailFrom = response[0][0].from_name;
			}
			if (response[1].length > 0) {
				this.emailFooterTemplete1 = response[1][0].custom_html;
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
			company_id: 3
		}

		if (this.user.userDet[0].role_id == 5 || this.user.userDet[0].role_id == 33) {
			condition["zone_id"] = this.user.userDet[0].id;
		}
		this.crudServices.getOne<any>(ImportSales.getImportSalesOrders, condition).subscribe(res => {
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
						element.customer = element.customer + ' (' + element.location_vilage + ')';
						element.so_quantity = Number(element.quantity) - Number(element.cancel_quantity);
						element.cancel_quantity = roundQuantity(element.cancel_quantity);
						element.plan_quantity = roundQuantity(element.plan_quantity);
						element.finance_balance = roundQuantity(element.finance_balance);
						element.dispatch_balance = roundQuantity(element.dispatch_balance);
						element.enable_edit_option = ((element.so_quantity == element.finance_balance) && (element.status == 0 || element.status == 1));
						element.signed_so_status = (element.so_sign_copy != null ? "Yes" : "No")
						element.payment_status = (element.received_amount > 0 ? "Yes" : "No")
						element.etd_status = (element.etd ? "Yes" : "No")
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
			{ field: "id", header: "Con ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "supplier_name", header: "Supplier Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "zone", header: "Zone", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "godown_name", header: "Godown", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "main_grade", header: "Main Grade", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			// { field: "import_local_label", header: "Import/\nLocal", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "final_rate", header: "Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "cancel_quantity", header: "Knock-Off Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "total_plan_quantity", header: "Finance Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "d_quantity", header: "Dispatch Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "finance_balance", header: "Finance Balance", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "dispatch_balance", header: "Dispatch Balance", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "freight_rate", header: "Freight", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "nb", header: "N.B.", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "booking_date", header: "So Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "cancel_date", header: "Cancel Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "payment_term_label", header: "Payment Term", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "delivery_term", header: "Dispatch Term", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "company_name", header: "Company", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "remark", header: "Remark", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "", header: "Signed SO", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Upload" },
			// { field: "", header: "Signed So Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			// { field: "", header: "Signed So Copy", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			// { field: "", header: "Signed So Uploaded By", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "offer_name", header: "Offer Id", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "signed_so_status", header: "Signed SO Status", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Badge" },
			{ field: "advance_amount", header: "Received Amount", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "advance_received_date", header: "Received Date", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "payment_status", header: "Payment Status", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Badge" },
			{ field: "shipment_month", header: "Shipment Month", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },

		];
		this.selected_cols = [
			{ field: "id", header: "Con ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "booking_date", header: "So Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "supplier_name", header: "Supplier Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			// { field: "import_local_label", header: "Import/\nLocal", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "final_rate", header: "Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "cancel_quantity", header: "Knock-Off Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "finance_balance", header: "Finance Balance", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "dispatch_balance", header: "Dispatch Balance", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "payment_term_label", header: "Payment Term", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "delivery_term", header: "Dispatch Term", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "godown_name", header: "Godown", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "", header: "Signed SO", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Upload" },
			// { field: "", header: "Signed So Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			// { field: "", header: "Signed So Copy", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			// { field: "", header: "Signed So Uploaded By", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "offer_name", header: "Offer Id", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "signed_so_status", header: "Signed SO Status", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Badge" },
			{ field: "received_amount", header: "Received Amount", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "advance_received_date", header: "Received Date", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "payment_status", header: "Payment Status", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Badge" },
			{ field: "etd", header: "ETD", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "etd_status", header: "ETD Status", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Badge" },
			{ field: "shipment_month", header: "Shipment Month", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
		];
		this.filter = ['id', 'customer', 'zone', 'godown_name', 'main_grade', 'grade_name', 'import_local_label', 'offer_id'];
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

	countDaysLeft(from_date, extend_days, company_id) {
		let dayCount = (company_id == 1) ? 10 : 8;
		dayCount += extend_days;
		let startDate = new Date(from_date);
		let endDate = new Date();
		let days = Math.floor((endDate.getTime() - startDate.getTime()) / 1000 / 60 / 60 / 24);
		let total_days = Number(days);
		if (total_days > dayCount) {
			return '*';
		} else {
			return dayCount - total_days;
		}
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

	onAction(item, type) {
		if (type == 'Add_Import_Order') {
			this.router.navigate(["sales/add-import-sales-order"]);
		}
		if (type == 'View') {
			this.selected_deal = item;
			this.getSalesOrderDispatch(item.id);
		}
		if (type == 'Edit') {
			this.router.navigate(["sales/edit-import-sales-order", item.id]);
		}
		if (type == 'Delete') {
			this.isLoading = true;
			let amount = item.balance_amount;
			let extra_column = "extra_suspense";//this.getSubOrgExtraColumnName(item.import_local_flag);
			this.crudServices.updateData(SalesOrders.reverseExtraAmount, {
				con_id: item.id,
				sub_org_id: item.sub_org_id,
				extra_column: extra_column,
				received_amount: amount
			}).subscribe(result => {
				this.crudServices.deleteData(ImportSales.delete, {
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

		}
		if (type == 'Generate') {
			this.downloadSo(item);
		}
		if (type == 'Download') {
			window.open(item.so_copy, "_blank");
			// this.generateSo(item).then(async (pdfObj) => {
			// 	await pdfMake.createPdf(pdfObj).open();
			// });
		}
		if (type == 'Finance') {
			this.router.navigate(["sales/finance", item.id]);
		}
		if (type == 'Extend') {
			this.selected_deal = item;
			this.extendForm.reset();
			this.extendForm.patchValue({
				type: 'Extend',
				con_id: item.id,
				extend_days: 0
			});
			this.extendModal.show();
		}
		if (type == 'Renew') {
			this.selected_deal = item;
			this.extendForm.reset();
			this.extendForm.patchValue({
				type: 'Renew',
				con_id: item.id,
				extend_days: 0
			});
			this.extendModal.show();
		}
		if (type == 'Cancel') {
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
		}
		if (type == 'Approve') {
			this.getEmailTemplate()
			let body = {
				data: {
					status: (item.status == 0) ? 1 : 0
				},
				id: item.id
			};
			this.crudServices.updateData(ImportSales.update, body).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', 'Order Approved');
					this.crudServices.getOne<any>(ImportSales.getImportSalesOrders, {
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
		}
		if (type == 'Approve_All') {
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
						await this.crudServices.getOne<any>(ImportSales.getImportSalesOrders, {
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
		}
		// if (type == 'Payment_Reverse') {
		// 	this.crudServices.getOne<any>(SalesOrders.updatePaymentReverse, {
		// 		id: item.id,
		// 		payment_reverse: 1
		// 	}).subscribe(res_data => {
		// 		this.getData();
		// 	});
		// }
		if (type == 'Credit_Amount') {
			this.loadingBtn = false;
			this.creditAmountForm.reset();
			this.creditAmountForm.patchValue({
				id: Number(item.id),
				total_order_amount: Number(item.total_amount),
				received_amount: Number(item.received_amount),
				balance_amount: Number(item.balance_amount),
				credit_amount: 0,
				remaining_amount: Number(item.total_amount) - Number(item.received_amount),
			});
			this.creditAmountForm.get('credit_amount').setValidators([Validators.required, Validators.min(1), Validators.max(Number(item.total_amount))]);
			this.creditAmountModal.show();
		}
		if (type == 'Send_Mail_&_Whatsapp') {
			// 
		}
		if (type == 'Download_Invoice') {
			let invoice_arr = JSON.parse(item);
			this.crudServices.downloadMultipleFiles(invoice_arr);
		}
		if (type == 'Upload_Signed_SO') {
			this.getEmailTemplateSignedSO()
			this.selected_deal = item;
			this.uploadSignedSOForm.reset();
			this.uploadSignedSOModal.show();
		} else if (type == 'Download_PI') {
			if (item.so_sign_copy != null) {
				window.open(item.so_sign_copy, "_blank");
			} else {
				window.open(item.so_copy, "_blank");
			}
		}
		if (type == 'Download_SO') {
			window.open(item.so_copy, "_blank");
		}
		if (type == 'Download_SO_copy') {
			window.open(item.so_sign_copy, "_blank");
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
		this.crudServices.getOne<any>(ImportSales.getImportSalesOrders, {
			id: item.id
		}).subscribe(res_data => {
			if (res_data.code == '100') {
				if (res_data.data.length > 0) {
					this.generateSoSurisha.generateSo(res_data.data[0], this.percent, this.company_bank_details).then(async (pdfObj) => {
						let pdfOBjFromData = pdfObj;
						await pdfMake.createPdf(pdfOBjFromData).getBlob(data => {
							if (data) {
								this.fileData.append('sales_order_pdf', data, 'so.pdf');
								this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res => {
									let path = res.uploads.sales_order_pdf[0].location;
									let so_no_new = (item.so_no == null) ? 'SURISHA/PI/' + this.commonService.get_po_financial_year(item.booking_date) + '/' + item.id : item.so_no;
									this.crudServices.updateData(ImportSales.update, {
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
					is_suspense_amount: this.selected_deal.is_suspense_amount
				};
				let body = {
					data: data
				};
				this.crudServices.addData(ImportSales.add, body).subscribe(res => {
					this.loadingBtn = false;
					if (res['code'] == '100') {
						this.toasterService.pop('success', 'Success', res['data']);
						this.getCols();
						this.closeModal();
					}
				});
			});
		} else {
			let body = {
				data: {
					extend_con_id: this.selected_deal.id,
					extend_days: extend_days
				},
				id: this.selected_deal.id
			};
			this.crudServices.updateData(ImportSales.update, body).subscribe(res => {
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
		// this.composeMail(this.selected_deal);

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
				balance_amount: roundAmount(new_balance_amount),
				knock_off_remark: this.knockOffForm.value.knock_off_remark,
			};
		} else {
			data = {
				// quantity: balance_quantity,
				balance_amount: 0,
				cancel_quantity: (Number(this.selected_deal.cancel_quantity) + Number(this.knockOffForm.value.quantity)),
				knock_off_remark: this.knockOffForm.value.knock_off_remark,
				status: 6
			};
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
		let notification_body = {
			notification: {
				"title": `${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name}  ${this.notification_details ? this.notification_details.title : ''}`,
				"body": `Customer :  ${this.selected_deal.customer},  Grade:${this.selected_deal.grade_name} 0f  ${this.selected_deal.quantity} MT  Godown :${this.selected_deal.godown_name}  Booking Date: ${this.selected_deal.booking_date}, knock off quantity :${Number(this.knockOffForm.value.quantity)}, knock_off_remark:${this.knockOffForm.value.knock_off_remark} `,
				"click_action": "https://erp.sparmarglobal.com:8085/#/sales/sales-orders"
			},
			registration_ids: this.notification_tokens
		}
		this.crudServices.updateData(ImportSales.update, body).subscribe(res => {
			if (res['code'] == '100') {
				this.toasterService.pop('success', 'Success', res['data']);
				// if (this.selected_deal.deal_type == 3) {
				// 	if ((this.selected_deal.so_quantity - this.selected_deal.cancel_quantity) == this.selected_deal.d_quantity) {
				// 		this.composeMail(this.selected_deal);
				// 	}
				// }
				this.getCols();
				this.sendInAppNotification(notification_body)
				this.closeModal();
			}
		});
	}

	composeMail(item) {
		const PI_NO = /{PI_NO}/;
		const PI_DATE = /{PI_DATE}/;
		const PI_QTY = /{PI_QTY}/;
		const PI_GRADE = /{PI_GRADE}/;
		const DAYS = /{DAYS}/;
		let template = '';
		let subject = '';
		this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Final Closure' }).subscribe(response => {
			template = response[0].custom_html;
			subject = response[0].subject;
			let ab = template.replace(PI_NO, item.so_no);
			let abc = ab.replace(PI_DATE, moment(item.booking_date).format('DD-MM-YYYY'));
			let abcd = abc.replace(PI_QTY, item.so_quantity);
			let abcde = abcd.replace(PI_GRADE, item.grade_name);
			this.html3 = abcde.replace(DAYS, moment(item.added_date).format('DD-MM-YYYY'));
			this.sendmail()
		})
		this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Surisha Footer' }).subscribe(response => {
			this.footer1 = response[0].custom_html;
		})
	}
	sendmail() {
		let arr = {};
		let html4 = this.html3 + this.footer1;
		arr = { 'to': this.tomailtext, 'html': html4 };
		this.crudServices.postRequest<any>(ImportSales.dealCompletionMail, { mail_object: arr }).subscribe(response => {
			this.toasterService.pop(response.message, response.message, response.data);
		})
	}


	submitCreditAmountForm() {
		this.loadingBtn = true;

		let credit_amount = Number(this.creditAmountForm.value.credit_amount);
		let final_received_amount = Number(this.creditAmountForm.value.received_amount) + credit_amount;
		let final_balance_amount = Number(this.creditAmountForm.value.balance_amount) + credit_amount;

		let data = {
			received_amount: final_received_amount,
			balance_amount: final_balance_amount
		};
		let body = {
			data: data,
			id: Number(this.creditAmountForm.value.id)
		};

		this.crudServices.getOne<any>(SalesOrders.updateCreditAmount, body).subscribe(res => {
			if (res.code == '100') {
				this.toasterService.pop('success', 'Success', "Credit Amount Added Successfully");
				this.creditAmountModal.hide();
				this.loadingBtn = false;
				this.getCols();
			}
		});
	}

	onChangeValue(e, type) {
		if (type == 'credit_amount') {
			let total_order_amount = Number(this.creditAmountForm.value.total_order_amount);
			let received_amount = Number(this.creditAmountForm.value.received_amount);
			let old_remaining_amount = total_order_amount - received_amount;
			if (e != null && e != undefined && Number(e) > 0) {
				let new_remaining_amount = old_remaining_amount - Number(e);
				this.creditAmountForm.patchValue({
					remaining_amount: new_remaining_amount
				});
			} else {
				this.creditAmountForm.patchValue({
					remaining_amount: old_remaining_amount
				});
			}
		}
	}

	closeModal() {
		this.selected_deal = null;
		this.extendForm.reset();
		this.extendModal.hide();
		this.knockOffForm.reset();
		this.creditAmountForm.reset();
		this.knockOffModal.hide();
		this.viewDealModal.hide();
		this.creditAmountModal.hide();
		this.uploadSignedSOModal.hide();
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
		//if (item.temp_email != null) {
		this.generateSoSurisha.generateSo(item, this.percent, this.company_bank_details).then(async (pdfObj) => {
			await pdfMake.createPdf(pdfObj).getBase64((data) => {
				if (data) {
					let emails = []
					const Qty = /{QTY}/gi;
					const GRADE = /{GRADE}/gi;
					const SO_NO = /{SO_NO}/gi;
					this.emailBodyTemplete = this.emailBodyTemplete.replace(Qty, item.quantity + ' ' + item.unit_type);
					this.emailBodyTemplete = this.emailBodyTemplete.replace(GRADE, item.grade_name);
					this.emailBodyTemplete = this.emailBodyTemplete.replace(SO_NO, item.so_no);
					this.emailSubject = this.emailSubject.replace(SO_NO, item.so_no);
					// emails = this.magangementSurishaEmailSales_Company_ID_3

					// if(item.email_office && item.email_office != null) {
					// 	emails.push(item.email_office)
					// }
					if (item.temp_email != null) {
						let mails = item.temp_email.split(',')
						emails = [...this.magangementSurishaEmailSales_Company_ID_3, ...mails]

						// for(let mail of mails) {
						// 	emails.push(mail)
						// }

					}

					let emailBody = {
						thepdf: data,
						tomail: emails,
						subject: this.emailSubject,
						bodytext: this.emailBodyTemplete + this.emailFooterTemplete,
						filename: 'Sales_order.pdf',
						company_id: item.company_id
					}
					this.crudServices.postRequest<any>(Consignments.sendSurishaMail, emailBody).subscribe((response) => {
						this.toasterService.pop('success', 'SALES ORDER MAIL SEND SUCCESS!', 'SALES ORDER MAIL SEND SUCCESS!')
					});
				}
			})
		})
		//}
	}

	sendSignedEmail(item) {
		if (item.temp_email.length && item.so_sign_copy) {
			let emails = []
			const Qty = /{QTY}/gi;
			const GRADE = /{GRADE}/gi;
			const SO_NO = /{SO_NO}/gi;
			this.emailBodyTempleteSignedSo = this.emailBodyTempleteSignedSo.replace(Qty, item.quantity + ' ' + item.unit_type);
			this.emailBodyTempleteSignedSo = this.emailBodyTempleteSignedSo.replace(GRADE, item.grade_name);
			this.emailBodyTempleteSignedSo = this.emailBodyTempleteSignedSo.replace(SO_NO, item.so_no);
			this.emailSubjectSignedSo = this.emailSubjectSignedSo.replace(SO_NO, item.so_no);
			// emails = this.magangementSurishaEmailSales_Company_ID_3

			// if(item.email_office && item.email_office != null) {
			// 	emails.push(item.email_office)
			// }
			if (item.temp_email.length) {
				let mails = item.temp_email.split(',')
				emails = [...this.magangementSurishaEmailSales_Company_ID_3, ...mails]
				// for (let mail of mails) {
				// 	emails.push(mail)
				// }

			}

			let attachment = []
			attachment.push({ 'filename': item.so_no + '.pdf', 'path': item.so_sign_copy })
			let emailBody = {
				attchments: attachment,
				tomail: emails,
				subject: this.emailSubjectSignedSo,
				bodytext: this.emailBodyTempleteSignedSo + this.emailFooterTemplete,
				filename: item.so_no + '.pdf',

			}



			this.crudServices.postRequest<any>(Consignments.sendSurishaMail, emailBody).subscribe((response) => {
				this.toasterService.pop('success', ' MAIL SEND SUCCESS!', 'MAIL SEND SUCCESS!')
			});
		}
	}

	sendWhatsApp(element, path) {
		let days = (this.company_id == 1) ? 10 : 6;
		let order_validity = moment(element.booking_date).add(Number(days), 'd').format("YYYY-MM-DD");
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
			(this.company_id == 1 || this.company_id == 3) ? 24 : 36
		];

		let official_numbers = [];
		if (this.company_id == 1) {
			official_numbers = this.magangementSPIPLWhatsappNumbers;
		}
		if (this.company_id == 2) {
			official_numbers = this.magangementSSurishaWhatsappNumbers;
		}


		if (element.mobile_office) {
			(this.company_id == 1) ? official_numbers.push(element.mobile_office) : (this.company_id == 2) ? official_numbers.push(element.mobile_office) : null
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
			(this.company_id == 1 || this.company_id == 3) ? 24 : 36

		];

		let main_obj_for_cust = {
			locale: "en",
			template_name: element.company_id == 3 ? "sales_confirmation_common_surisha" : "sales_confirmation_common",
			attachment: [
				{
					caption: `#${element.id}-${element.customer}`,
					filename: `#${element.id}-${element.customer}.pdf`,
					url: path
				}
			],
			company_id: element.company_id
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

	submitSignedSOForm() {
		let fileDataNew: FormData = new FormData();
		const files: Array<File> = this.filesArr;
		for (let i = 0; i < files.length; i++) {
			fileDataNew.append('sales_order_sign_pdf', files[i], files[i]['name']);
		}
		this.crudServices.fileUpload(FileUpload.upload, fileDataNew).subscribe(res_aws => {
			let path = res_aws.uploads.sales_order_sign_pdf[0].location;
			let body = {
				id: this.selected_deal.id,
				data: {
					so_sign_copy: path,
					so_sign_copy_date: Date.now()
				}
			};
			this.crudServices.updateData(SalesOrders.update, body).subscribe(result => {
				if (result) {
					this.toasterService.pop('success', 'Success', 'Sign SO Uploaded Successfully');
					this.selected_deal['so_sign_copy'] = path;
					this.sendSignedEmail(this.selected_deal)
					this.closeModal();
					this.getCols();
				}
			})
		})
	}

	onFileChange(e) {
		this.filesArr = <Array<File>>e.target.files;
	}

}
