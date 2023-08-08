import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter } from '@angular/core';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { SalesReportsNew } from '../../../shared/apis-path/apis-path';
import { staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import * as moment from "moment";
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { ToasterConfig, ToasterService } from 'angular2-toaster';

@Component({
	selector: 'app-middleware-payments',
	templateUrl: './middleware-payments.component.html',
	styleUrls: ['./middleware-payments.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, PermissionService, ExportService, DatePipe, ToasterService]
})

export class MiddlewarePaymentsComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;
	@ViewChild('mySplitModal', { static: false }) public mySplitModal: ModalDirective;
	@ViewChild('changeSubOrgModal', { static: false }) public changeSubOrgModal: ModalDirective;

	page_title: any = "Middleware Payment Details";
	user: UserDetails;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to Move?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	addsplitForm: FormGroup;
	cols: any = [];
	data: any = [];
	filter: any = [];
	role_id: any = null;
	company_id: any = null;
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	isRange: any;
	datePickerConfig = staticValues.datePickerConfigNew;
	maxDate: Date = new Date();
	productTypes: any = [{ name: 'All', value: 0 }, { name: 'PVC', value: 1 }, { name: 'PE&PP', value: 2 }];

	selected_product: any = 0;
	companyFilterDisabled: boolean = false;
	selected_record: any;
	move: boolean;
	split: boolean;
	changeSubOrgForm: any;
	subOrgList: any;
	selected_sub_org: any;
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	changeSubOrg: boolean;

	constructor(
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private datePipe: DatePipe,
		private toasterService: ToasterService,
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;
		//Permission to move/split amount
		this.move = (this.links.indexOf('move amount') > -1);
		this.split = (this.links.indexOf('split amount') > -1);
		this.changeSubOrg = (this.links.indexOf('Change Sub Org') > -1);
		this.selected_product = (this.role_id == 1 || this.role_id == 19 || this.role_id == 2) ? 0 : this.company_id;
		this.companyFilterDisabled = (this.role_id == 1 || this.role_id == 19 || this.role_id == 2) ? false : true;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];

	}

	ngOnInit() {
		this.changeSubOrgForm = new FormGroup({
			'suborg': new FormControl(null, Validators.required)
		});

		this.addsplitForm = new FormGroup({
			'amount': new FormControl(null, Validators.required)
		});
		this.getCols();
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;

	}

	clearDropdown() {
		if (JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
			this.uploadSuccess.emit(false);
	}

	oncloseModal() {
		this.addsplitForm.reset();
		this.mySplitModal.hide();
		this.changeSubOrgForm.reset();
		this.changeSubOrgModal.hide();
	}

	getData() {
		this.getCols();
		this.data = [];
		this.isLoading = true;

		let condition = {
			from_date: this.datePipe.transform(this.selected_date_range[0], 'yyyy-MM-dd'),
			to_date: this.datePipe.transform(this.selected_date_range[1], 'yyyy-MM-dd'),
			company_id: (this.role_id == 1 || this.role_id == 19 || this.role_id == 2) ? null : this.company_id
		}

		if (this.selected_product.value != 0 && this.selected_product.value != undefined) {
			condition['company_id'] = this.selected_product.value;
		}

		this.crudServices.getOne<any>(SalesReportsNew.getMiddlewarePaymentDetails, condition).pipe(map((value) => {
			if (value.data) {
				value.data.map((element) => {
					if (element.type == 1) {
						element.payment_type = 'RECIEVED';
					}
					else if (element.type == 3) {
						element.payment_type = 'DEBIT NOTE';
					}
					else if (element.type == 4) {
						element.payment_type = 'CREDIT NOTE'
					}
					if (element.import_local_flag == 1) {
						element.import_local_flag_cat = 'Import'
					}
					else if (element.import_local_flag == 2) {
						element.import_local_flag_cat = 'Local'
					}
					else if (element.import_local_flag == 0) {
						element.import_local_flag_cat = 'Suspense / Advance'
					}
					return element;
				})
			}
			return value;

		})).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
					this.pushDropdown();
					this.footerTotal();
				}
			}
			this.isLoading = false;
			this.table.reset();
		});
	}

	getCols() {
		this.cols = [
			{ field: "id", header: "ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "virtual_id", header: "Virtual Account No.", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "actual_amount", header: "Received Amount", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
			{ field: "utilised_amount", header: "Utilised Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "remark", header: "Remark", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "invoice_number", header: "Invoice No", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "import_local_flag_cat", header: "Category", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: 'Badge' },
			{ field: "payment_type", header: "Payment Type", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: 'Badge' },
			{ field: "added_at", header: "Payment Received Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date_Time" },
			{ field: "utr_no", header: "UTR No.", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
		];
		if (this.move || this.split || this.changeSubOrg) {
			this.cols = [
				{ field: "id", header: "ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "virtual_id", header: "Virtual Account No.", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "actual_amount", header: "Received Amount", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
				{ field: "utilised_amount", header: "Utilised Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
				{ field: "remark", header: "Remark", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "invoice_number", header: "Invoice No", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "import_local_flag_cat", header: "Category", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: 'Badge' },
				{ field: "payment_type", header: "Payment Type", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: 'Badge' },
				{ field: "added_at", header: "Payment Received Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date_Time" },
				{ field: "utr_no", header: "UTR No.", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			];
		}

		this.filter = ['customer', 'virtual_id', 'invoice_number', 'remark', 'payment_type', 'import_local_flag_cat', 'actual_amount', 'utilised_amount', 'company_name', 'utr_no', 'id'];
	}

	pushDropdown() {
		let filter_cols = this.cols.filter(col => col.filter == true);
		filter_cols.forEach(element => {
			let unique = this.data.map(item =>
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

	footerTotal() {
		let filter_cols = this.cols.filter(col => col.footer == true);
		filter_cols.forEach(element => {
			let total = this.data.map(item =>
				item[element.field]
			).reduce((sum, item) => sum + item);
			element.total = Number(total);
			return element;
		});
	}

	splitQty() {
		let record = this.selected_record;
		record.split_amount = this.addsplitForm.value.amount;
		record.vanumber = (record.import_local_flag == 1) ? record.vanumber.replace('IM', 'LC') : record.vanumber.replace('LC', 'IM')
		const payload = {
			id: record.id,
			data: record,
			invoice_number: record.invoice_number,
			utilised_amount: record.utilised_amount,
			split_import_local_flag: record.import_local_flag == 1 ? 2 : 1,
		}
		this.crudServices.postRequest<any>(SalesReportsNew.splitMPUAmount, payload).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.addsplitForm.reset();
					this.getData();
					this.mySplitModal.hide();
				}
			}
			this.isLoading = false;
			this.table.reset();
		});
	}

	onAction(record, type) {
		if (type == 'Move') {
			const data = {
				import_local_flag: record.import_local_flag == 1 ? 2 : 1,
				vanumber: (record.import_local_flag == 1) ? record.vanumber.replace('IM', 'LC') : record.vanumber.replace('LC', 'IM')
			}
			const payload = {
				id: record.id,
				data: data,
				invoice_number: record.invoice_number,
				utilised_amount: record.utilised_amount,
				payload: record
			}
			this.crudServices.postRequest<any>(SalesReportsNew.moveAmountImportLocal, payload).subscribe(res => {
				if (res.code == '100') {
					if (res.data.length > 0) {
						this.data = res.data;
						this.getData();
					}
				}
				this.isLoading = false;
				this.table.reset();
			});
		} if (type == 'Split') {
			this.addsplitForm.get('amount').setValidators([Validators.required, Validators.min(1), Validators.max(Number(record.utilised_amount))]);
			this.addsplitForm.get('amount').updateValueAndValidity();
			this.selected_record = record;
			this.mySplitModal.show()
		}
		if (type == 'changeSubOrg') {
			this.selected_record = record;
			let payload = {
				sub_org: record.sub_org_id,
				org_id: record.main_org
			}
			this.crudServices.getOne<any>(SalesReportsNew.getSubOrgsByMainOrg, payload).subscribe(res => {
				if (res.code == '100') {
					if (res.data.length > 0) {
						this.subOrgList = res.data;
						this.changeSubOrgModal.show()
					} else {
						this.toasterService.pop('warning', 'warning', 'Sub organization not found!');
					}
				}
			});

		}
	}

	customFilter(value, col, data) {
		this.table.filter(value, col, data);
		this.footerTotal();
	}

	convertSubOrg() {
		let payload = {
			data: {
				sub_org_id: this.selected_sub_org.sub_org_id,
				virtual_id: this.selected_sub_org.virtual_acc_no,
			},
			id: this.selected_record.id
		}
		this.crudServices.getOne<any>(SalesReportsNew.updateSubOrgInMPU, payload).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.oncloseModal();
				}
			}
		});
	}

	onChangeValue(e) {
		this.selected_sub_org = e;
	}

	getAmountSum(category) {
		if (this.table && this.table.hasFilter()) {
			let filterData = this.table.filteredValue.filter(item => item.import_local_flag == category);
			return filterData.reduce(function (result, item) {
				return result + Number(item.utilised_amount);
			}, 0);
		}
		else {
			let filterData = this.data.filter(item => item.import_local_flag == category);
			return filterData.reduce(function (result, item) {
				return result + Number(item.utilised_amount);
			}, 0);
		}

	}


	onFilter(event, dt) {
		let filter_cols = this.cols.filter(col => col.footer == true);
		filter_cols.forEach(element => {
			if (event.filteredValue.length > 0) {
				let total = event.filteredValue.map(item =>
					item[element.field]
				).reduce((sum, item) => sum + item);
				element.total = Number(total);
			}
			return element;
		});
	}





	exportData(type) {
		let final_data = null;
		if (this.table.filteredValue == null) {
			final_data = this.data;
		} else {
			final_data = this.table.filteredValue;
		}
		let fileName = 'Middleware Payment' + ' - ' + this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
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
