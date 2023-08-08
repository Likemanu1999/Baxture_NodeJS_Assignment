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
import { ShortDamage } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";
@Component({
	selector: 'app-short-damage',
	templateUrl: './short-damage.component.html',
	styleUrls: ['./short-damage.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})

export class ShortDamageComponent implements OnInit {

	@ViewChild("invoiceModal", { static: false }) public invoiceModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Short & Damage";
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to delete?';
	popoverMessage2: string = 'Are you sure, you want to change Status?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'left';
	cancelClicked: boolean = false;

	user: UserDetails;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	max_date: any = new Date();
	add_edit: any = null;

	datePickerConfig: any = staticValues.datePickerConfig;
	statusList: any = staticValues.billing_status;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	isRange: any;

	selected_status: any = this.statusList[0];
	cols: any = [];
	data: any = [];
	filter: any = [];
	invoiceForm: FormGroup;
	fileData = new FormData();

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
		this.initForm();
	}

	initForm() {
		this.invoiceForm = new FormGroup({
			invoice_id: new FormControl(null, Validators.required),
			dispatch_id: new FormControl(null, Validators.required),
			invoice_no: new FormControl(null, Validators.required),
			invoice_date: new FormControl(null, Validators.required),
			invoice_copy: new FormControl(null, Validators.required)
		});
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(ShortDamage.getShortDamageListNew, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			status: this.selected_status.id
		}).subscribe(res => {
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
			{ field: "id", header: "ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "zone", header: "Zone", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "invoice_date", header: "Invoice Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "invoice_no", header: "Invoice No", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "final_rate", header: "Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "short_quantity", header: "Short Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "damage_quantity", header: "Damage Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "wet_quantity", header: "Wet Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "remark", header: "Remark", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "transporter", header: "Transporter", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "truck_no", header: "Truck No", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "lr_no", header: "LR No", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "credit_note_no", header: "Credit Note No", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Input" },
			{ field: "debit_note_no", header: "Debit Note No", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Input" },
			{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null }
		];
		this.filter = ['customer', 'zone', 'grade_name', 'transporter', 'truck_no', 'lr_no', 'invoice_no', 'credit_note_no', 'debit_note_no'];
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
		}
	}

	onChangeValue(value, item, type) {
		if (type == 'Credit_Note_No') {
			if (value != null && value != undefined) {
				let body = {
					data: {
						credit_note_no: value,
						status: 1
					},
					id: item.id
				}
				this.crudServices.updateData<any>(ShortDamage.update, body).subscribe((res) => {
					this.toasterService.pop('success', 'Success', 'Credit Note Updated Successfully');
					this.getCols();
				});
			}
		}
		if (type == 'Debit_Note_No') {
			if (value != null && value != undefined) {
				let body = {
					data: {
						debit_note_no: value,
						status: 1
					},
					id: item.id
				}
				this.crudServices.updateData<any>(ShortDamage.update, body).subscribe((res) => {
					this.toasterService.pop('success', 'Success', 'Debit Note Updated Successfully');
					this.getCols();
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
				} else if (this.cols[j]["field"] == "final_rate") {
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
