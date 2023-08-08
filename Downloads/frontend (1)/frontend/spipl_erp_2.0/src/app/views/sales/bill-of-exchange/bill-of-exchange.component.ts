import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { staticValues } from '../../../shared/common-service/common-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import {
	SpiplBankMaster,
	PercentageDetails,
	SalesPi,
	SalesLc,
	ValueStore,
	SalesBex,
	SubOrg,
	ChargesMasters,
	Dispatch
} from '../../../shared/apis-path/apis-path';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { PiPdfService } from '../../../shared/pi-pdf/pi-pdf.service';
import * as moment from "moment";
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
	selector: 'app-bill-of-exchange',
	templateUrl: './bill-of-exchange.component.html',
	styleUrls: ['./bill-of-exchange.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [ExportService, ToasterService, PermissionService, LoginService, CrudServices, Calculations]
})

export class BillOfExchangeComponent implements OnInit {

	@ViewChild("updateBexModal", { static: false }) public updateBexModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Bill of Exchange"
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to delete?';
	popoverMessage2: string = 'Are you sure, you want to change Status?';
	popoverMessage3: string = 'Are you sure, you want to Renew Deal?';
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

	datePickerConfig: any = staticValues.datePickerConfig;
	statusList: any = staticValues.sales_deals_status;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	isRange: any;
	selected_status: any = this.statusList[0];
	minDate: any = new Date();
	maxDate: any = new Date();

	cols: any = [];
	data: any = [];
	filter: any = [];
	checked: any = [];

	bexForm: FormGroup;

	lc_payment_terms: any = [];
	spipl_banks: any = [];
	percentValues: any = [];

	isLoading: boolean = false;
	enableCreateLCButton: boolean = false;

	sub_org_id: any = null;
	tcs: any = null;
	tds: any = null;
	con_ids: any = [];
	dispatch_ids: any = [];
	gstRate: any = 0;
	pi_ids: any = [];
	company_name: any = null;
	company_address: any = null;
	invoice_no_list: any = [];

	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private exportService: ExportService,
		public crudServices: CrudServices
	) {
		let user: UserDetails = this.loginService.getUserDetails();
		this.links = user.links;
	}

	ngOnInit() {
		this.initForm();
		this.getPercentValues();
		this.getCols();
	}

	initForm() {
		this.bexForm = new FormGroup({
			id: new FormControl(null, Validators.required),
			discounting_by_bank: new FormControl(null, Validators.required),
			discounting_date: new FormControl(null, Validators.required),
			acceptance_date: new FormControl(null, Validators.required),
			due_date: new FormControl(null, Validators.required),
			bex_amount: new FormControl(null, Validators.required),
			discounting_amount: new FormControl(null, Validators.required),
			final_rate: new FormControl(null, Validators.required),
			difference: new FormControl(null, Validators.required)
		});
	}

	getPercentValues() {
		this.crudServices.getOne<any>(PercentageDetails.getOne, {
			detail_type: 2
		}).subscribe((response) => {
			this.percentValues = response;
		});
	}

	getCols() {
		this.cols = [
			{ field: "lc_no", header: "LC No", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "sub_org_name", header: "Customer", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "sales_invoice_no", header: "Sales Invoice No", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "bex_no", header: "Bex No", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "bex_amount", header: "Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "bex_date", header: "Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "due_date", header: "Due Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "discounting_date", header: "Discounting Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "acceptance_date", header: "Acceptance Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "discounting_amount", header: "Discounting Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "difference", header: "Difference", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "discounting_by_bank", header: "Discounting By Bank", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Action" },
		];
		this.filter = ['lc_no', 'sub_org_name', 'sales_invoice_no', 'bex_no'];
		this.getData();
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(SalesBex.getOne, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			status: this.selected_status.id,
			company_id: (this.role_id == 1) ? null : this.company_id
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				this.data = res.data;
				this.pushDropdown(this.data);
				this.footerTotal(this.data);
			}
		});
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
	}

	updateBillofExchange(item) {
		this.bexForm.patchValue({
			id: item.id,
			due_date: item.due_date,
			bex_amount: item.bex_amount,
			discounting_by_bank: item.discounting_by_bank
		});
		this.updateBexModal.show();
	}

	calculateFinalRate() {
		if (this.bexForm.value.discounting_date != null) {
			this.crudServices.getOne<any>(ChargesMasters.getOne, {
				bank_id: this.bexForm.value.discounting_by_bank
			}).subscribe(res_charges => {
				if (res_charges.code == '100') {
					let due_date = moment(this.bexForm.value.due_date);
					let discounting_date = moment(this.bexForm.value.discounting_date);
					var date_diff = due_date.diff(discounting_date, 'days');
					let item = res_charges.data.find(o => o.head_id === 44);
					if (item != null && item != undefined) {
						let discounting_rate = Number(item.charges);
						let days = 365;
						if (Number(moment().format('YYYY')) % 4 == 0) {
							days += 1;
						}
						let rate_per_day = Number((discounting_rate / days).toFixed(3));
						let final_rate = Number(rate_per_day) * Number(date_diff);
						this.bexForm.patchValue({
							final_rate: final_rate
						});
					}
					else{
						this.toasterService.pop("error", "Error", "Charges Not added");
					}
				}
			});
		}
	}

	onChangeDiscountingAmount(value) {
		if (value != null || value != undefined) {
			let difference = Number(this.bexForm.value.bex_amount) - Number(this.bexForm.value.discounting_amount);
			this.bexForm.patchValue({
				difference: difference
			});
		}
	}

	submitBexForm() {
		let body = {
			data: {
				discounting_date: Number(this.bexForm.value.discounting_date),
				acceptance_date: Number(this.bexForm.value.acceptance_date),
				final_rate: Number(this.bexForm.value.final_rate),
				discounting_amount: Number(this.bexForm.value.discounting_amount),
				difference: Number(this.bexForm.value.difference),
				status: 1
			},
			id: this.bexForm.value.id
		};
		this.crudServices.updateData<any>(SalesBex.update, body).subscribe(res => {
			this.toasterService.pop("success", "Success", "Bill of Exchange Updated Successfully");
			this.bexForm.reset();
			this.updateBexModal.hide();
			this.getCols();
		});
	}

	calculateGST(value) {
		let obj_gst = this.percentValues.find(o => o.percent_type === 'gst');
		let gst_rate = Number(obj_gst.percent_value);
		let gst_value = value * (gst_rate / 100);
		return gst_value;
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
					item[element.field]
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
					if (this.cols[j]["field"] == "quantity") {
						obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]] + " MT";
					} else {
						obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]];
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
