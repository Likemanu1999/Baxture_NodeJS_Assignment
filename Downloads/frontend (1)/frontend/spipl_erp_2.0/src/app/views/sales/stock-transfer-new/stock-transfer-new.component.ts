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
import {
	SalesOrders,
	PercentageDetails
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
	selector: 'app-stock-transfer-new',
	templateUrl: './stock-transfer-new.component.html',
	styleUrls: ['./stock-transfer-new.component.scss'],
	providers: [
		CrudServices,
		ToasterService,
		PermissionService,
		ExportService,
		AmountToWordPipe,
		CurrencyPipe,
		Calculations,
		CommonService
	]
})

export class StockTransferNewComponent implements OnInit {

	@ViewChild("addStockModal", { static: false }) public addStockModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Stock Transfer List"
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to delete?';
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

	datePickerConfig: any = staticValues.datePickerConfig;
	statusList: any = [];
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	selected_status: any = null;
	selected_deal: any = null;
	cols: any = [];
	selected_cols: any = [];
	data: any = [];
	filter: any = [];
	fileData: FormData = new FormData();

	percent: any = null;
	mode: any = "Add";
	stockForm: FormGroup;

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
		private messagingService: MessagingService
	) {
		this.user = this.loginService.getUserDetails();
		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;
		this.links = this.user.links;
		// this.approve_sales_order = (this.links.find(x => x == 'approve_sales_order') != null) ? true : false;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.delete_opt = perms[3];

		// if (this.role_id == 1) {
		// 	this.statusList = staticValues.sales_orders_status_ssurisha;
		// 	this.selected_status = this.statusList[0];
		// } else {
		// 	if (this.company_id == 1) {
		// 		this.statusList = staticValues.sales_orders_status_spipl;
		// 		this.selected_status = this.statusList[0];
		// 	} else if (this.company_id == 2) {
		// 		this.statusList = staticValues.sales_orders_status_ssurisha;
		// 		this.selected_status = this.statusList[0];
		// 	} else {
		// 		this.statusList = [];
		// 		this.selected_status = null;
		// 	}
		// }
	}

	ngOnInit() {
		this.getPercentValues();
		this.initForm();
		this.getCols();
	}

	getPercentValues() {
		this.crudServices.getOne<any>(PercentageDetails.getOne, {
			detail_type: 2
		}).subscribe(res => {
			this.percent = res;
		});
	}

	initForm() {
		this.stockForm = new FormGroup({
			quantity: new FormControl(null, Validators.required)
		});
	}

	getData() {
		this.data = [];
		// this.isLoading = true;
		// let condition = {
		// 	from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
		// 	to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
		// 	status: this.selected_status.id,
		// 	company_id: (this.role_id == 1) ? null : this.company_id
		// }
		// if (this.user.userDet[0].role_id == 5 || this.user.userDet[0].role_id == 33) {
		// 	condition["zone_id"] = this.user.userDet[0].id;
		// }
		// this.crudServices.getOne<any>(SalesOrders.getSalesOrders, condition).subscribe(res => {
		// 	this.isLoading = false;
		// 	if (res.code == '100') {
		// 		if (res.data.length > 0) {
		// 			this.data = res.data;
		// 			this.pushDropdown(this.data);
		// 			this.footerTotal(this.data);
		// 		}
		// 	}
		// 	this.table.reset();
		// });
	}

	getCols() {
		this.cols = [
			{ field: "id", header: "Con ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "days_left", header: "Days Left", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "zone", header: "Zone", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "godown_name", header: "Godown", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "main_grade", header: "Main Grade", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "cancel_quantity", header: "Knock-Off Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "plan_quantity", header: "Finance Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "d_quantity", header: "Dispatch Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "finance_balance", header: "Finance Balance", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "dispatch_balance", header: "Dispatch Balance", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "final_rate", header: "Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "freight_rate", header: "Freight", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "nb", header: "N.B.", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "booking_date", header: "Booking Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "payment_term_label", header: "Payment Term", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "company_name", header: "Company", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null }
		];
		this.selected_cols = [
			{ field: "id", header: "Con ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "days_left", header: "Days Left", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "cancel_quantity", header: "Knock-Off Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "final_rate", header: "Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "finance_balance", header: "Finance Balance", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "dispatch_balance", header: "Dispatch Balance", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null }
		];
		this.filter = ['id', 'customer', 'zone', 'godown_name', 'main_grade', 'grade_name'];
		this.getData();
	}

	@Input() get selectedColumns(): any[] {
		localStorage.setItem(
			"selected_stock_col",
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

	onAction(item, type) {
		if (type == 'Add_Stock') {
			this.stockForm.reset();
			this.addStockModal.show();
		} else if (type == 'View') {
			this.selected_deal = item;
			// this.viewDealModal.show();
		}
	}

	onChangeValue(e, type) {
		if (type == 'Advance') {
			if (e != null && e != undefined) {
				let quantity = this.calculations.getQuantityFromAmount(e, this.selected_deal, this.percent);
				this.stockForm.patchValue({
					quantity: quantity
				});
			}
		}
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

	submitStockForm() {
		// 
	}

	closeModal() {
		this.selected_deal = null;
		this.stockForm.reset();
		this.addStockModal.hide();
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
}
