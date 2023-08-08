import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective, ModalOptions } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { staticValues } from '../../../shared/common-service/common-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { DispatchNew, SalesOrders } from '../../../shared/apis-path/apis-path';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
import { element } from 'protractor';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
	selector: 'app-adjust-suspense-amount',
	templateUrl: './adjust-suspense-amount.component.html',
	styleUrls: ['./adjust-suspense-amount.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [ExportService, ToasterService, PermissionService, LoginService, CrudServices]
})

export class AdjustSuspenseAmountComponent implements OnInit {

	@ViewChild("adjustSuspenseModal", { static: false }) public adjustSuspenseModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;
	companies: any = staticValues.companies;
	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	modalConfig: ModalOptions = {
		backdrop: 'static',
		keyboard: false,
		animated: true,
		ignoreBackdropClick: true
	};

	page_title: any = "Adjust Suspense Amount"
	popoverTitle: string = 'Warning';
	popoverMessage: string = 'Are you sure, you want to adjust the suspense amount against this deal?';
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
	isLoading: boolean = false;
	loadingBtn: boolean = false;
	datePickerConfig: any = staticValues.datePickerConfig;
	statusList: any = staticValues.sales_deals_status;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	selected_status: any = this.statusList[0];
	cols: any = [];
	data: any = [];
	filter: any = [];
	adjustForm: FormGroup;
	selected_row: any = null;
	sales_orders: any = [];
	invoices: any = [];

	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private exportService: ExportService,
		public crudServices: CrudServices
	) {
		let user: UserDetails = this.loginService.getUserDetails();
		this.company_id = user.userDet[0].company_id;
		this.role_id = user.userDet[0].role_id;
		this.links = user.links;
	}

	ngOnInit() {
		this.initForm();
		this.getCols();
	}

	initForm() {
		this.adjustForm = new FormGroup({
			id: new FormControl(null),
			sales_order: new FormControl(null),
			invoice: new FormControl(null),
			total_suspense_amount: new FormControl(null),
			adjust_amount: new FormControl(null),
			balance_suspense_amount: new FormControl(null),
			import_local_flag: new FormControl(null),
			sub_org_id: new FormControl(null),
			virtual_acc_no: new FormControl(null),
			state_code: new FormControl(null),
			company_id: new FormControl(null)
		});
	}

	getCols() {
		this.cols = [
			{ field: "id", header: "ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "company", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "sub_org_name", header: "Customer", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "virtual_id", header: "Virtual Account No.", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "utilised_amount", header: "Suspense Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "added_at", header: "Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Action" },
		];
		this.filter = ['id', 'sub_org_name', 'virtual_id'];
		this.getData();
	}

	getData() {
		this.data = [];
		this.isLoading = true;

		this.crudServices.getOne<any>(SalesOrders.getSuspenseAmountList, {
			company_id: (this.role_id == 1) ? null : this.company_id
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						if (element.product_type == 1) {
							element.company = 'PVC'
						} else if (element.product_type == 2) {
							element.company = 'PE & PP'
						}
						else if (element.product_type == 3) {
							element.company = 'SURISHA'
						}
					});
					this.data = res.data;
					this.pushDropdown(this.data);
					this.footerTotal(this.data);
				}
			}
		});
	}

	onAction(item, type) {
		if (type == 'Adjust_Amount') {
			this.selected_row = item;
			this.loadingBtn = false;
			this.isLoading = true;
			this.adjustForm.reset();
			this.adjustForm.patchValue({
				id: Number(item.id),
				total_suspense_amount: Number(item.utilised_amount),
				adjust_amount: Number(item.utilised_amount),
				balance_suspense_amount: 0,
				sub_org_id: Number(item.sub_org_id),
				virtual_acc_no: item.virtual_id,
				state_code: item.state_code,
				company_id: Number(item.company_id)
			});
			this.adjustForm.get('adjust_amount').setValidators([Validators.required, Validators.min(0.01), Validators.max(Number(item.utilised_amount))]);

			this.crudServices.getOne<any>(DispatchNew.getDispatchesByVirtualId, {
				virtual_id: this.selected_row.virtual_acc_no
			}).subscribe(res => {
				this.isLoading = false;
				if (res.code == '100') {
					if (res.data.length > 0) {
						this.invoices = res.data;
					} else {
						this.invoices = [];
					}
				}
			});

			this.crudServices.getOne<any>(SalesOrders.getSalesOrdersByVirtualId, {
				virtual_id: this.selected_row.virtual_acc_no
			}).subscribe(res => {
				this.isLoading = false;
				if (res.code == '100') {
					if (res.data.length > 0) {
						this.sales_orders = [];
						res.data.forEach(result => {
							result.pendingAMT = ((result.received_amount == null || result.received_amount == 0) ? result.total_amount : (result.total_amount - result.received_amount))
							result.value = result.value + result.pendingAMT;
							if (result.pendingAMT > 0) {
								this.sales_orders.push(result);
							}
						});
					} else {
						this.sales_orders = [];
					}
				}
			});

			this.adjustSuspenseModal.show();
		}
	}

	onChangeValue(e, type) {
		if (type == 'adjust_amount') {
			let total_amount = Number(this.adjustForm.value.total_suspense_amount);
			let balance_amount = total_amount - Number(e);
			this.adjustForm.patchValue({
				balance_suspense_amount: balance_amount
			});
		} else if (type == 'sales_order') {
			this.adjustForm.get('sales_order').setValidators([Validators.required]);
			this.adjustForm.get('sales_order').updateValueAndValidity();
			this.adjustForm.get('invoice').setValidators(null);
			this.adjustForm.get('invoice').updateValueAndValidity();
			this.adjustForm.patchValue({
				adjust_amount: 0,
				balance_suspense_amount: 0,
			});
		} else if (type == 'invoice') {
			this.adjustForm.get('invoice').setValidators([Validators.required]);
			this.adjustForm.get('invoice').updateValueAndValidity();
			this.adjustForm.get('sales_order').setValidators(null);
			this.adjustForm.get('sales_order').updateValueAndValidity();
			this.adjustForm.patchValue({
				adjust_amount: 0,
				balance_suspense_amount: 0,
			});
		} else if (type == 'import_local') {
			this.adjustForm.get('sales_order').setValidators(null);
			this.adjustForm.get('sales_order').updateValueAndValidity();
			this.adjustForm.get('invoice').setValidators(null);
			this.adjustForm.get('invoice').updateValueAndValidity();
			this.adjustForm.patchValue({
				adjust_amount: Number(this.selected_row.utilised_amount),
			});
			this.adjustForm.get('adjust_amount').setValidators([Validators.required, Validators.min(0.01), , Validators.max(Number(this.selected_row.utilised_amount))]);
			this.adjustForm.get('adjust_amount').updateValueAndValidity();
		} else if (type == 'selectedSaleOrder') {
			let remaining_amt = Number(e.total_amount) - Number(e.received_amount);
			this.adjustForm.patchValue({
				adjust_amount: 0,
				balance_suspense_amount: 0
			});
			this.adjustForm.get('adjust_amount').setValidators([Validators.required, Validators.min(0.01), , Validators.max(Number(remaining_amt))]);
			this.adjustForm.get('adjust_amount').updateValueAndValidity();
		} else if (type == 'selectedInvoice') {
			let remaining_amt = Number(e.total_amount) - Number(e.received_amount);
			this.adjustForm.patchValue({
				adjust_amount: 0,
				balance_suspense_amount: 0
			});
			this.adjustForm.get('adjust_amount').setValidators([Validators.required, Validators.min(0.01), , Validators.max(Number(remaining_amt))]);
			this.adjustForm.get('adjust_amount').updateValueAndValidity();
		}
	}

	submitAdjustForm() {
		this.loadingBtn = true;
		let import_local_flag_label = null;
		let extra_column_name = null;
		let vanumber = "";

		if (Number(this.adjustForm.value.import_local_flag) == 1) {
			extra_column_name = "extra_import";
			import_local_flag_label = "Import";
			vanumber = this.adjustForm.value.virtual_acc_no + '-IM' + this.adjustForm.value.state_code;
		} else if (Number(this.adjustForm.value.import_local_flag) == 2) {
			extra_column_name = "extra_local";
			import_local_flag_label = "Local";
			vanumber = this.adjustForm.value.virtual_acc_no + '-LC' + this.adjustForm.value.state_code;
		} else {
			extra_column_name = null;
			import_local_flag_label = null;
			vanumber = this.adjustForm.value.virtual_acc_no;
		}

		let data = {
			balance_suspense_amount: Number(this.adjustForm.value.balance_suspense_amount),
			import_local_flag: Number(this.adjustForm.value.import_local_flag),
			adjust_amount: Number(this.adjustForm.value.adjust_amount),
			company_id: Number(this.adjustForm.value.company_id),
			sub_org_id: Number(this.adjustForm.value.sub_org_id),
			virtual_acc_no: this.adjustForm.value.virtual_acc_no,
			import_local_flag_label: import_local_flag_label,
			id: Number(this.adjustForm.value.id),
			extra_column_name: extra_column_name,
			vanumber: vanumber,
			invoice_id: this.adjustForm.value.invoice,
			con_id: this.adjustForm.value.sales_order,
			state_code: this.adjustForm.value.state_code
		};

		if (this.adjustForm.value.import_local_flag == 3) {
			data.import_local_flag = this.selected_row.import_local_flag;
			this.crudServices.getOne<any>(SalesOrders.adjustSuspenseAmountAgainstDeal, data).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop('success', 'Success', "Amount Adjusted Successfully");
					this.afterResponse();
					this.getCols();
				}
			});

		} else if (this.adjustForm.value.import_local_flag == 4) {
			data.import_local_flag = this.selected_row.import_local_flag;
			this.crudServices.getOne<any>(SalesOrders.adjustSuspenseAmountAgainstInvoice, data).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop('success', 'Success', "Amount Adjusted Successfully");
					this.afterResponse();
					this.getCols();
				}
			});

		} else {
			this.crudServices.getOne<any>(SalesOrders.adjustSuspenseAmount, data).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop('success', 'Success', "Amount Adjusted Successfully");
					this.afterResponse();
					this.getCols();
				}
			});
		}

	}

	afterResponse() {
		this.adjustSuspenseModal.hide();
		this.loadingBtn = false;
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

	pushDropdown(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		if (data.length > 0) {
			let filter_cols = this.cols.filter(col => col.filter == true);
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
	}

	footerTotal(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		if (data.length > 0) {
			let filter_cols = this.cols.filter(col => col.footer == true);
			filter_cols.forEach(element => {
				let total = data.map(item =>
					Number(item[element.field])
				).reduce((sum, item) => sum + item);
				element.total = total;
			});
		}
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
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]];
				}
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < this.cols.length; j++) {
			if (this.cols[j]["field"] != "action") {
				if (this.cols[j]["field"] == "extra_suspense" || this.cols[j]["field"] == "total_pending_orders") {
					foot[this.cols[j]["header"]] = this.cols[j]["total"];
				} else {
					foot[this.cols[j]["header"]] = "";
				}
			}
		}
		exportData.push(foot);
		if (type == 'Excel') {
			this.exportService.exportExcel(exportData, fileName);
		} else {
			let exportColumns = this.cols.map(function (col) {
				if (col.field != "action") {
					return { title: col.header, dataKey: col.header }
				}
			});
			this.exportService.exportPdf(exportColumns, exportData, fileName);
		}
	}
}
