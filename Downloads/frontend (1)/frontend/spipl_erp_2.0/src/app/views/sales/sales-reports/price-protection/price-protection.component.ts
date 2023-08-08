import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../../shared/pemission-services/pemission-service';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { CrudServices } from "../../../../shared/crud-services/crud-services";
import {
	SalesReportsNew,
	DispatchBilling,
	Notifications,
	FileUpload,
	UsersNotification
} from '../../../../shared/apis-path/apis-path';
import { roundQuantity, staticValues } from '../../../../shared/common-service/common-service';
import { UserDetails } from '../../../login/UserDetails.model';
import { LoginService } from '../../../login/login.service';
import { ExportService } from '../../../../shared/export-service/export-service';
import { MessagingService } from '../../../../service/messaging.service';
import * as moment from "moment";

@Component({
	selector: 'app-price-protection',
	templateUrl: './price-protection.component.html',
	styleUrls: ['./price-protection.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})
export class PriceProtectionComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Price Protection";
	user: UserDetails;
	links: string[] = [];
	company_id: any = null;
	role_id: any = null;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	maxDate: any = new Date();
	datePickerConfig: any = staticValues.datePickerConfig;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	isRange: any;
	cols: any = [];
	data: any = [];
	filter: any = [];

	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private messagingService: MessagingService,
	) {
		this.user = this.loginService.getUserDetails();
		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;
		this.links = this.user.links;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];

	}

	ngOnInit() {
		this.getCols();
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		let zone_id = null;
		if (this.role_id == 5 || this.role_id == 33 || this.user.userDet[0].role_id == 34 || this.user.userDet[0].role_id == 46) {
			if (this.user.userDet[0].insider_parent_id != null) {
				zone_id = this.user.userDet[0].insider_parent_id;
			} else {
				zone_id = this.user.userDet[0].id;
			}
		} else {
			zone_id = null;
		}
		this.crudServices.getOne<any>(SalesReportsNew.getPriceProtectionReport, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			zone_id: zone_id
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
					this.pushDropdown(this.data);
					this.footerTotal(this.data);
				}
			}
			this.table.reset();
		});
	}

	getCols() {
		this.cols = [
			{ field: "con_id", header: "Con ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "order_quantity", header: "Order Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "dispatch_quantity", header: "Dispatch Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "logistic_power", header: "Logistic Power", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "final_rate", header: "Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "invoice_no", header: "Invoice No", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "invoice_date", header: "Invoice Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "zone", header: "Zone", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "remark", header: "Remark", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null }
		];
		this.filter = ['con_id', 'customer', 'grade_name', 'invoice_no', 'zone'];
		this.getData();
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
	}

	pushDropdown(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
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

	footerTotal(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		let filter_cols = this.cols.filter(col => col.footer == true);
		filter_cols.forEach(element => {
			if (data.length > 0) {
				let total = data.map(item =>
					item[element.field]
				).reduce((sum, item) => sum + item);
				element.total = (element.type == "Quantity") ? roundQuantity(total) : total;
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
		if (type == 'View') {
			// 
		} else if (type == 'Download_Invoice') {
			let invoice_arr = JSON.parse(item);
			this.crudServices.downloadMultipleFiles(invoice_arr);
		}
	}

	exportData(type) {
		let fileName = this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
		let exportData = [];
		for (let i = 0; i < this.data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					if (this.cols[j]["type"] == "Quantity") {
						obj[this.cols[j]["header"]] = this.data[i][this.cols[j]["field"]] + " MT";
					} else {
						obj[this.cols[j]["header"]] = this.data[i][this.cols[j]["field"]];
					}
				}
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < this.cols.length; j++) {
			if (this.cols[j]["field"] != "action") {
				if (this.cols[j]["type"] == "Quantity") {
					foot[this.cols[j]["header"]] = this.cols[j]["total"] + " MT";
				} else if (this.cols[j]["type"] == "Amount") {
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
