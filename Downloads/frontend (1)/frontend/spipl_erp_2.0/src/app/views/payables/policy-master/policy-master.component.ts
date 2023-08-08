import { Component, OnInit, ViewEncapsulation, ViewChild, Input, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { staticValues, CommonService } from '../../../shared/common-service/common-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { FileUpload, PolicyAttachments, PolicyMaster, PolicyTypeMaster, SubOrg } from '../../../shared/apis-path/apis-path';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
	selector: 'app-policy-master',
	templateUrl: './policy-master.component.html',
	styleUrls: ['./policy-master.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		CrudServices,
		ToasterService,
		PermissionService,
		ExportService,
		CurrencyPipe,
		CommonService
	]
})

export class PolicyMasterComponent implements OnInit {

	@ViewChild("addPolicyModal", { static: false }) public addPolicyModal: ModalDirective;
	@ViewChild("policyAttachmentsModal", { static: false }) public policyAttachmentsModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Policy Master List"
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to delete?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'bottom';
	cancelClicked: boolean = false;

	//for Active  and Deactive.
	popoverMessage2: string = "Are you sure to confirm this action?";


	user: UserDetails;
	role_id: any = null;
	company_id: any = null;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	delete_opt: boolean = false;
	isLoading: boolean = false;
	isEdit: boolean = false;
	display: boolean = false;
	datePickerConfig: any = staticValues.datePickerConfigNew;
	max_date: any = new Date();
	selected_date_range: any = [];
	selected_date_range_add: any = [
		new Date(moment().format("YYYY-MM-DD")),
		new Date(moment().add(30, 'days').format("YYYY-MM-DD"))

	];
	isRange: any;
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	fileData = new FormData();
	policyForm: FormGroup;
	policyAttachmentsForm: FormGroup;
	selected_policy: any = null;
	cols: any = [];
	data: any = [];
	filter: any = [];

	policyTypeList: any = [];
	insuranceCompanyList: any = [];
	agentList: any = [];
	policyAttachments: any = [];
	setstatus: any;

	constructor(

		private toasterService: ToasterService,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private currencyPipe: CurrencyPipe,
		private commonService: CommonService
	) {
		this.user = this.loginService.getUserDetails();
		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;
		this.links = this.user.links;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.delete_opt = perms[3];
	}

	ngOnInit() {
		this.initForm();
		this.getCols();
		this.getData();
		this.getPolicyTypes();
		this.getInsuranceCompanies();
		this.getAgents();
	}

	initForm() {
		this.policyForm = new FormGroup({
			policy_no: new FormControl(null, Validators.required),
			insurance_company_id: new FormControl(null, Validators.required),
			agent_id: new FormControl(null),
			policy_type_id: new FormControl(null, Validators.required),
			sum_insured: new FormControl(null, [Validators.required, Validators.min(1)]),
			premium_amount: new FormControl(null, [Validators.required, Validators.min(1)]),
			start_date: new FormControl(null, Validators.required),
			expiry_date: new FormControl(null, Validators.required),
			remark: new FormControl(null),
			is_active: new FormControl(null)
		});
		this.policyAttachmentsForm = new FormGroup({
			policy_id: new FormControl(null, Validators.required),
			policy_attachments: new FormControl(null, Validators.required),
		});
	}
	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;

	}
	clearDropdown() {
		if (JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
			this.uploadSuccess.emit(false);
	}

	changeStatus(status, id) {
		let data = {}
		if (status == 1) {
			data['status'] = 0
		} else {
			data['status'] = 1
		}

		this.crudServices.updateData<any>(PolicyMaster.update, { data: data, id: id }).subscribe(response => {
			this.toasterService.pop(response.message, response.message, response.data)
			this.getCols();
		})

	}
	getPolicyTypes() {
		this.crudServices.getAll<any>(PolicyTypeMaster.getAll).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.policyTypeList = res.data;
				}
			}
		});
	}

	getInsuranceCompanies() {
		this.crudServices.getOne<any>(SubOrg.getGroupCustomers, {
			category_id: 65
		}).subscribe(res => {
			if (res.length > 0) {
				this.insuranceCompanyList = res;
			}
		});
	}

	getAgents() {
		this.crudServices.getOne<any>(SubOrg.getGroupCustomers, {
			category_id: 65
		}).subscribe(res => {
			if (res.length > 0) {
				this.agentList = res;
			}
		});
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(PolicyMaster.getPolicyMasterList, {
			from_date: this.selected_date_range[0],
			to_date: this.selected_date_range[1]
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(item => {
						item.status_name = (item.status == 1) ? "Active" : "Inactive";

						let today = new Date();
						if (new Date(item.expiry_date) < today) {
							item.display = true;
							// item.background_color = 'red';
							item.badge = 'badge badge-danger';
							item.color = 'red';
							item.order = 1;
						} else if (moment(item.expiry_date).isBefore(moment().add(30, 'days'))) {
							item.display = true;
							// item.background_color = 'orange';
							item.badge = 'badge badge-warning';
							item.color = 'orange';
							item.order = 2;
						} else {
							item.display = true;
							item.color = '#ffffff'
							// item.background_color = '#63c763';
							item.badge = 'badge badge-success';
							item.color = '#63c763';
							item.order = 3;
						}
					});
					res.data.sort((a, b) => {
						return <any>new Date(a.order) - <any>new Date(b.order);
					});
					this.data = res.data;
					this.pushDropdown(this.data);
					this.footerTotal(this.data);
				}
			}
			this.table.reset();
			this.setstatus = ["Active"];
			this.customFilter(this.setstatus, 'status_name', 'in');
		});
	}

	getCols() {
		this.cols = [
			{ field: "id", header: "ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "policy_no", header: "Policy No", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "insurance_company", header: "Insurance Company", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "agent", header: "Agent", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "policy_type", header: "Type of Policy", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "start_date", header: "Start Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "expiry_date", header: "Expiry Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "sum_insured", header: "Sum Insured", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "premium_amount", header: "Premium Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "remark", header: "Remark", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "status_name", header: "Status", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Status" },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Action" }
		];
		// isstatus
		this.filter = ['id', 'policy_no', 'insurance_company', 'agent', 'status_name', 'policy_type', 'remark'];
		this.getData();
	}

	@Input() get selectedColumns(): any[] {
		localStorage.setItem(
			"selected_policy_col",
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
				if(item){
				array.push({
					value: item,
					label: item
				});
			}
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
		// this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		// this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}

	onAction(item, type) {
		if (type == 'Add_Policy') {
			this.policyForm.reset();
			this.addPolicyModal.show();
		}
		if (type == 'View_Policy') {
			this.router.navigate(["payables/policy-details", item.id]);
		}
		if (type == 'Edit_Policy') {
			this.isEdit = true;
			this.selected_policy = item;
			this.policyForm.reset();
			this.policyForm.patchValue({
				policy_no: item.policy_no,
				insurance_company_id: item.insurance_company_id,
				agent_id: item.agent_id,
				policy_type_id: item.policy_type_id,
				sum_insured: item.sum_insured,
				premium_amount: item.premium_amount,
				start_date: new Date(item.start_date),
				expiry_date: new Date(item.expiry_date),
				remark: item.remark,
				is_active: item.status
			});
			this.addPolicyModal.show();
		}
		if (type == 'Delete_Policy') {
			this.crudServices.deleteData(PolicyMaster.delete, {
				id: item.id
			}).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', res['data']);
					this.getCols();
					this.closeModal();
				} else {
					this.toasterService.pop('error', 'Alert', 'Policy cannot be deleted');
				}
			});
		}
		if (type == 'Policy_Attachments') {
			this.selected_policy = item;
			this.getPolicyAttachments(item.id, false);
		}
		if (type == 'Delete_Attachment') {
			this.crudServices.deleteData(PolicyAttachments.delete, {
				id: item.id
			}).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', res['data']);
					this.getPolicyAttachments(this.selected_policy.id, true);
				}
			});
		}
		if (type == 'Policy_Claims') {
			this.router.navigate(["payables/policy-claims", item.id]);
		}
	}

	getPolicyAttachments(id, is_module_open) {
		this.policyAttachments = [];
		this.crudServices.getOne(PolicyAttachments.getPolicyAttachmentsList, {
			policy_id: id
		}).subscribe(res => {
			if (res['code'] == '100') {
				if (res['data'].length > 0) {
					this.policyAttachments = res['data'];
				}


				this.policyAttachmentsForm.reset();
				this.policyAttachmentsForm.patchValue({
					policy_id: id,
					policy_attachments: null
				});
				if (!is_module_open) {
					this.policyAttachmentsModal.show();
				}
			}
		});
	}

	onSubmitPolicyForm() {
		let data = {
			policy_no: this.policyForm.value.policy_no,
			insurance_company_id: this.policyForm.value.insurance_company_id,
			agent_id: this.policyForm.value.agent_id,
			policy_type_id: this.policyForm.value.policy_type_id,
			sum_insured: this.policyForm.value.sum_insured,
			premium_amount: this.policyForm.value.premium_amount,
			start_date: this.policyForm.value.start_date,
			expiry_date: this.policyForm.value.expiry_date,
			remark: this.policyForm.value.remark,
			status: (this.policyForm.value.is_active) ? 1 : 0
		};
		let body = {
			data: data
		};
		if (this.isEdit) {
			body['id'] = this.selected_policy.id;
			this.crudServices.updateData(PolicyMaster.update, body).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', res['data']);
					this.getCols();
					this.closeModal();
				}
			});
		} else {
			this.crudServices.addData(PolicyMaster.add, body).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', res['data']);
					this.getCols();
					this.closeModal();
				}
			});
		}
	}

	onFileChange(e) {
		let files = <Array<File>>e.target.files;
		for (let i = 0; i < files.length; i++) {
			this.fileData.append("policy_attachments", files[i], files[i]['name']);
		}
	}

	onSubmitAttachmentForm() {
		this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res_aws => {
			let attachment_copy = res_aws.uploads["policy_attachments"][0].location;
			let data = {
				policy_id: this.policyAttachmentsForm.value.policy_id,
				attachment: attachment_copy
			};
			let body = {
				data: data
			};
			this.crudServices.addData(PolicyAttachments.add, body).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', res['data']);
					this.getPolicyAttachments(this.selected_policy.id, true);
				}
			});
		});
	}

	closeModal() {
		this.isEdit = false;
		this.selected_policy = null;
		this.policyForm.reset();
		this.addPolicyModal.hide();
		this.policyAttachmentsForm.reset();
		this.policyAttachmentsModal.hide();
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
