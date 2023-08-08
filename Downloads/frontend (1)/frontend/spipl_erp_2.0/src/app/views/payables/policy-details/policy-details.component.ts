import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { CurrencyPipe } from '@angular/common';
import { Table } from "primeng/table";
import { PolicyDetails, PolicyMaster } from '../../../shared/apis-path/apis-path';
import { staticValues, CommonService } from '../../../shared/common-service/common-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
	selector: 'app-policy-details',
	templateUrl: './policy-details.component.html',
	styleUrls: ['./policy-details.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		CrudServices,
		ToasterService,
		ExportService,
		CurrencyPipe,
		CommonService
	]
})

export class PolicyDetailsComponent implements OnInit {

	@ViewChild("addDetailModal", { static: false }) public addDetailModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Policy Details"
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
	isLoading: boolean = false;
	isEdit: boolean = false;

	datePickerConfig: any = staticValues.datePickerConfig;
	max_date: any = new Date();
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	detailForm: FormGroup;
	selected_detail: any = null;
	cols: any = [];
	data: any = [];
	filter: any = [];

	id: any = null;
	policy: any = null;

	constructor(
		private toasterService: ToasterService,
		private route: ActivatedRoute,
		private router: Router,
		private loginService: LoginService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private currencyPipe: CurrencyPipe,
		private commonService: CommonService
	) {
		this.user = this.loginService.getUserDetails();
		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;
		this.links = this.user.links;

		this.route.params.subscribe((params: Params) => {
			if (params["id"] != null) {
				this.id = params["id"];
			}
		});
	}

	ngOnInit() {
		this.initForm();
		this.getPolicyDetails();
		this.getCols();
	}

	initForm() {
		this.detailForm = new FormGroup({
			policy_id: new FormControl(null, Validators.required),
			remark: new FormControl(null)
		});
	}

	getPolicyDetails() {
		this.crudServices.getOne<any>(PolicyMaster.getPolicyMasterList, {
			id: this.id
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.policy = res.data[0];
				}
			}
		});
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(PolicyDetails.getPolicyDetailsList, {
			policy_id: this.id
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
					this.pushDropdown(this.data);
					this.footerTotal(this.data);
				}
			} else {
				this.toasterService.pop('error', 'Alert', 'No Details Found');
			}
			this.table.reset();
		});
	}

	getCols() {
		this.cols = [
			{ field: "id", header: "ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "type", header: "Type", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "name", header: "Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "dob", header: "DOB", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "sum_insured", header: "Sum Insured", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "vehical_no", header: "Vehical No.", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "remark", header: "Remark", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null }
		];
		this.filter = ['id', 'type', 'name', 'vehical_no', 'remark'];
		this.getData();
	}

	@Input() get selectedColumns(): any[] {
		localStorage.setItem(
			"selected_detail",
			JSON.stringify(this.cols)
		);
		return this.cols;
	}

	set selectedColumns(val: any[]) {
		this.cols = this.cols.filter((col) => val.includes(col));
		this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	getColumnPresent(col) {
		if (this.cols.find((ob) => ob.field === col)) {
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
				element.total = total;
			}

		});
	}

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}

	onAction(item, type) {
		if (type == 'Add_Detail') {
			this.detailForm.reset();
			this.detailForm.patchValue({
				policy_id: this.id,
				remark: null
			});
			this.addDetailModal.show();
		}
		if (type == 'Edit_Detail') {
			this.isEdit = true;
			this.selected_detail = item;
			this.detailForm.reset();
			this.detailForm.patchValue({
				policy_id: item.policy_id,
				remark: item.remark
			});
			this.addDetailModal.show();
		}
		if (type == 'Delete_Detail') {
			this.crudServices.deleteData(PolicyDetails.delete, {
				id: item.id
			}).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', res['data']);
					this.getCols();
					this.closeModal();
				}
			});
		}
	}

	onSubmitForm() {
		let data = {
			policy_id: this.detailForm.value.policy_id,
			remark: this.detailForm.value.remark
		};
		let body = {
			data: data
		};
		if (this.isEdit) {
			body['id'] = this.selected_detail.id;
			this.crudServices.updateData(PolicyDetails.update, body).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', res['data']);
					this.getCols();
					this.closeModal();
				}
			});
		} else {
			this.crudServices.addData(PolicyDetails.add, body).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', res['data']);
					this.getCols();
					this.closeModal();
				}
			});
		}
	}

	closeModal() {
		this.isEdit = false;
		this.selected_detail = null;
		this.detailForm.reset();
		this.addDetailModal.hide();
	}

	exportData(type) {
		let final_data = null;
		if (this.table.filteredValue == null) {
			final_data = this.data;
		} else {
			final_data = this.table.filteredValue;
		}
		let fileName = this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
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
				if (this.cols[j]["field"] == "rate") {
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
