import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { CurrencyPipe } from '@angular/common';
import { Table } from "primeng/table";
import { PolicyClaims, PolicyMaster } from '../../../shared/apis-path/apis-path';
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
	selector: 'app-policy-claims',
	templateUrl: './policy-claims.component.html',
	styleUrls: ['./policy-claims.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		CrudServices,
		ToasterService,
		ExportService,
		CurrencyPipe,
		CommonService
	]
})
export class PolicyClaimsComponent implements OnInit {

	@ViewChild("addClaimModal", { static: false }) public addClaimModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Policy Claim History"
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
	claimForm: FormGroup;
	selected_claim: any = null;
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
		this.claimForm = new FormGroup({
			policy_id: new FormControl(null, Validators.required),
			claim_date: new FormControl(null, Validators.required),
			claim_lodged_amount: new FormControl(null, [Validators.required, Validators.min(1)]),
			claim_received_amount: new FormControl(null),
			claim_received_date: new FormControl(null),
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
		this.crudServices.getOne<any>(PolicyClaims.getPolicyClaimsList, {
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
				this.toasterService.pop('error', 'Alert', 'No Claim History Found');
			}
			this.table.reset();
		});
	}

	getCols() {
		this.cols = [
			{ field: "id", header: "ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "claim_date", header: "Claim Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "claim_lodged_amount", header: "Claim Lodged Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "claim_received_amount", header: "Claim Received Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "claim_received_date", header: "Claim Received Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "remark", header: "Remark", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null }
		];
		this.filter = ['id', 'policy_no', 'insurance_company', 'agent_broker', 'type_of_policy', 'remark'];
		this.getData();
	}

	@Input() get selectedColumns(): any[] {
		localStorage.setItem(
			"selected_claim",
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
		if (type == 'Add_Claim') {
			this.claimForm.reset();
			this.claimForm.patchValue({
				policy_id: this.id,
				claim_date: new Date()
			});
			this.addClaimModal.show();
		}
		if (type == 'Edit_Claim') {
			this.isEdit = true;
			this.selected_claim = item;
			this.claimForm.reset();
			this.claimForm.patchValue({
				policy_id: item.policy_id,
				claim_date: new Date(item.claim_date),
				claim_lodged_amount: item.claim_lodged_amount,
				claim_received_amount: item.claim_received_amount,
				claim_received_date: (item.claim_received_date != null) ? new Date(item.claim_received_date) : null,
				remark: item.remark
			});
			this.addClaimModal.show();
		}
		if (type == 'Delete_Claim') {
			this.crudServices.deleteData(PolicyClaims.delete, {
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
			policy_id: this.claimForm.value.policy_id,
			claim_date: this.claimForm.value.claim_date,
			claim_lodged_amount: this.claimForm.value.claim_lodged_amount,
			claim_received_amount: this.claimForm.value.claim_received_amount,
			claim_received_date: this.claimForm.value.claim_received_date,
			remark: this.claimForm.value.remark
		};
		let body = {
			data: data
		};
		if (this.isEdit) {
			body['id'] = this.selected_claim.id;
			this.crudServices.updateData(PolicyClaims.update, body).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', res['data']);
					this.getCols();
					this.closeModal();
				}
			});
		} else {
			this.crudServices.addData(PolicyClaims.add, body).subscribe(res => {
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
		this.selected_claim = null;
		this.claimForm.reset();
		this.addClaimModal.hide();
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
