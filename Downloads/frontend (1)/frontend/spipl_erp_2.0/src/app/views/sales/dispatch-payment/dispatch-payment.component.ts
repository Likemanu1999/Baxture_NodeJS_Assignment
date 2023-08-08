import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { staticValues, roundQuantity } from '../../../shared/common-service/common-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { DispatchPayments } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";
import { map } from 'rxjs/operators';

@Component({
	selector: 'app-dispatch-payments',
	templateUrl: './dispatch-payment.component.html',
	styleUrls: ['./dispatch-payment.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})

export class DispatchPaymentComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;

	page_title: any = "Payments";
	user: UserDetails;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;

	datePickerConfig: any = staticValues.datePickerConfig;
	statusList: any = staticValues.payment_status;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	isRange: any;
	selected_status: any = this.statusList[0];
	cols: any = [];
	data: any = [];
	filter: any = [];

	constructor(
		private toasterService: ToasterService,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService
	) {
		this.user = this.loginService.getUserDetails();
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
		this.crudServices.getOne<any>(DispatchPayments.getDispatchPayments, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			status: this.selected_status.id,
			company_id: (this.user.userDet[0].role_id == 1) ? null : this.user.userDet[0].company_id
		}).pipe(map((response) => {
			response['data'].map((ele) => {
				ele.invoice_type = (ele.payment_type === 3) ? 'DEBIT NOTE' : 'REGULAR';
				return ele;
			})
			return response;
		})).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
					this.pushDropdown(this.data);
					this.footerTotal(this.data);
				}
			}
			if (this.table != null && this.table != undefined) {
				this.table.reset();
			}
		});
	}

	getCols() {
		this.cols = [
			{ field: "invoice_no", header: "Invoice No.", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "invoice_date", header: "Invoice Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "virtual_acc_no", header: "Virtual Account No.", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "total_amount", header: "Total Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "received_amount", header: "Received Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "balance_amount", header: "Balance Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "payment_due_date", header: "Payment Due Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "payment_received_date", header: "Payment Received Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date_Time" },
			{ field: "invoice_type", header: "Invoice Type", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: 'Badge' },
			{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
		];
		this.filter = ['customer', 'virtual_acc_no', 'invoice_no', 'invoice_type'];
		this.getData();
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

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
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

	exportData(type) {
		let fileName = this.selected_status.name + ' - ' + this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
		let exportData = [];
		for (let i = 0; i < this.data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					if (this.cols[j]["field"] == "quantity") {
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
				if (this.cols[j]["field"] == "quantity") {
					foot[this.cols[j]["header"]] = this.cols[j]["total"] + " MT";
				} else if (this.cols[j]["field"] == "deal_rate" ||
					this.cols[j]["field"] == "freight_rate") {
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
