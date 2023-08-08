import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { DepartmentMaster, FileUpload, JobReferences, QualificationMaster, StaffMemberMaster } from '../../../shared/apis-path/apis-path';
import { staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { MessagingService } from '../../../service/messaging.service';
import * as moment from "moment";

@Component({
	selector: 'app-job-references',
	templateUrl: './job-references.component.html',
	styleUrls: ['./job-references.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})

export class JobReferencesComponent implements OnInit {

	@ViewChild('jobReferenceModal', { static: false }) public jobReferenceModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});

	page_title: any = "Job Reference List";
	public popoverTitle: string = 'Warning';
	public popoverTitle1: string = 'Warning';
	public popoverMessage1: string = 'Are you sure, you want to update?';
	public popoverMessage2: string = 'Are you sure, you want to delete?';
	public popoverMessage3: string = 'you want to Change Status?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public confirmText1: string = 'confirm';
	public cancelText2: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;

	user: UserDetails;
	links: string[] = [];
	company_id: any = null;
	role_id: any = null;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	loadingBtn: boolean = false;
	maxDate: any = new Date();
	datePickerConfig: any = staticValues.datePickerConfigNew;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	cols: any = [];
	data: any = [];
	filter: any = [];
	jobReferenceForm: FormGroup;
	jobInterviewForm: FormGroup;
	fileData: FormData = new FormData();
	gender_list = staticValues.gender;
	job_reference_status_list = staticValues.job_reference_status;
	qualification_list: any = [];
	department_list: [];
	staff_list: [];
	experience_list = ['0-1', '1-2', '2-3', '4-5', '5-7', '7-9', '10+'];
	id: any = null;
	selected_row: any = null;
	isRange: any;
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();

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
		this.initForm();
		this.getQualifications();
		this.getDepartments();
		this.getStaffMemberMaster();
		this.getData();
	}

	initForm() {
		this.jobReferenceForm = new FormGroup({
			first_name: new FormControl(null, [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
			last_name: new FormControl(null, [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
			mobile: new FormControl(null, Validators.pattern('^[6789][0-9]{9}$')),
			alter_mobile: new FormControl(null, Validators.pattern('^[6789][0-9]{9}$')),
			email: new FormControl(null),
			gender: new FormControl(null),
			qualification_id: new FormControl(null, Validators.required),
			experience: new FormControl(null, Validators.required),
			department_id: new FormControl(null),
			cv_copy: new FormControl(null, Validators.required),
			referred_by: new FormControl(null, Validators.required)
		});
		this.jobInterviewForm = new FormGroup({
			interview_date: new FormControl(null, Validators.required),
			interview_time: new FormControl(null),
			interview_by: new FormControl(null, Validators.required)
		});
	}


	getQualifications() {
		this.crudServices.getAll<any>(QualificationMaster.getAll).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.qualification_list = res.data;
				}
			}
		});
	}

	getDepartments() {
		this.crudServices.getAll<any>(DepartmentMaster.getAll).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.department_list = res.data;
				}
			}
		});
	}
	getStaffMemberMaster() {
		this.crudServices.getAll<any>(StaffMemberMaster.getAll).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						element.full_name = (element.first_name + ' ' + element.last_name);
					});
					this.staff_list = res.data;
				}
			}
		});
	}


	getCols() {
		this.cols = [
			{ field: 'id', header: 'ID', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'name', header: 'Name', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'mobile', header: 'Mobile', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'email', header: 'Email', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'gender_name', header: 'Gender', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'qualification', header: 'Qualification', sort: false, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'experience', header: 'Experience', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'department', header: 'Department', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'referred_by_name', header: 'Reference_By', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'status_name', header: 'Status', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'action', header: 'Action', sort: false, filter: false, footer: false, total: 0, type: null, oprations: null },
		];
		this.filter = ['name', 'mobile', 'email', 'gender_name', 'qualification', 'department', 'reference_by', 'status_name'];
	}
	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
	}

	clearDropdown() {
		if (JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
			this.uploadSuccess.emit(false);
	}

	getData() {
		this.getCols();
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(JobReferences.getJobReferencesList, {
			from_date: this.selected_date_range[0],
			to_date: this.selected_date_range[1]
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach((item) => {
						item.name = item.first_name + ' ' + item.last_name;
						if (item.gender != null) {
							let gender = this.gender_list.find(x => x.id == Number(item.gender));
							item.gender_name = gender.name;
						}
						if (item.department_id != null) {
							item.department = item.department_master.dept_name;
						}
						item.qualification = item.qualification_master.name;
						item.referred_by_name = item.referredBy.first_name + ' ' + item.referredBy.middle_name + ' ' + item.referredBy.last_name;
						let status = this.job_reference_status_list.find(x => x.id == Number(item.status));
						item.status_name = status.name;
						item.status_text_color = status.text_color;
						item.my_btn = `btn btn-sm ${status.btn} action-btn mx-2 mb-2`
					});
					this.data = res.data;
					this.pushDropdown(this.data);
				} else {
					this.toasterService.pop('error', 'Alert', 'No Data Found..!');
				}
			}
			this.table.reset();
		});
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

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		// this.pushDropdown(dt.filteredValue);
	}

	onFilter(e, dt) {
	}

	onAction(item, type) {
		if (type == 'Add_New') {
			this.jobReferenceForm.reset();
			this.jobReferenceForm.get('cv_copy').setValidators([Validators.required]);
			this.jobReferenceForm.get('cv_copy').updateValueAndValidity();
			this.jobReferenceModal.show();
		}
		if (type == 'Edit') {
			this.selected_row = item;
			this.id = Number(item.id);
			this.jobReferenceForm.reset();
			this.jobReferenceForm.patchValue({
				first_name: item.first_name,
				last_name: item.last_name,
				mobile: item.mobile,
				alter_mobile: item.alter_mobile,
				email: item.email,
				gender: item.gender,
				qualification_id: item.qualification_id,
				experience: item.experience,
				department_id: item.department_id,
				referred_by: item.referred_by
			});
			this.jobReferenceForm.get('cv_copy').clearValidators();
			this.jobReferenceForm.get('cv_copy').updateValueAndValidity();
			this.jobReferenceModal.show();
		}
		if (type == 'Delete') {
			this.crudServices.postRequest<any>(JobReferences.delete, {
				id: Number(item.id)
			}).subscribe((res) => {
				if (res.code == 100) {
					this.toasterService.pop(res.message, res.data, res.data);
					this.getData();
				} else {
					this.toasterService.pop(res.message, res.data, res.data);
				}
			});
		}
		if (type == 'Update_Status') {
			this.id = Number(item.id);
			let num = 0;
			if (Number(item.status) == 0) {
				num = 1;
			} else if (Number(item.status) == 1) {
				num = 2;
			} else if (Number(item.status) == 2 || Number(item.status) == 3) {
				num = 3;
			}
			let body = {
				id: this.id,
				data: {
					status: num
				}
			};
			this.crudServices.postRequest<any>(JobReferences.update, body).subscribe((res) => {
				if (res.code == 100) {
					this.toasterService.pop(res.message, res.data, res.data);
					this.getData();
				} else {
					this.toasterService.pop(res.message, res.data, res.data);
				}
			});
		}
		if (type == 'Rejected') {
			this.id = Number(item.id);
			let body = {
				id: this.id,
				data: {
					status: 4
				}
			};
			this.crudServices.postRequest<any>(JobReferences.update, body).subscribe((res) => {
				if (res.code == 100) {
					this.toasterService.pop(res.message, res.data, res.data);
					this.getData();
				} else {
					this.toasterService.pop(res.message, res.data, res.data);
				}
			});
		}

	}

	onFileChange(e) {
		let files = <Array<File>>e.target.files;
		for (let i = 0; i < files.length; i++) {
			this.fileData.append("job_reference_cv", files[i], files[i]['name']);
		}
	}
	// 
	onSubmit() {
		this.loadingBtn = true;
		let data = {
			first_name: this.jobReferenceForm.value.first_name,
			last_name: this.jobReferenceForm.value.last_name,
			mobile: this.jobReferenceForm.value.mobile,
			alter_mobile: this.jobReferenceForm.value.alter_mobile,
			email: this.jobReferenceForm.value.email,
			gender: this.jobReferenceForm.value.gender,
			qualification_id: this.jobReferenceForm.value.qualification_id,
			experience: this.jobReferenceForm.value.experience,
			department_id: this.jobReferenceForm.value.department_id,
			referred_by: this.user.userDet[0].id
		};
		let body = {
			data: data
		};
		// update 
		if (this.fileData.get('job_reference_cv') == null) {
			body.data['cv_copy'] = this.selected_row.cv_copy;
			body['id'] = this.id;
			this.addUpdateData("Update", body);
		} else {
			this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res_aws => {
				if (res_aws != null) {
					let file_path = res_aws.uploads["job_reference_cv"][0].location;
					body.data['cv_copy'] = file_path;
				}
				if (this.id == null) {
					this.addUpdateData("Add", body);
				} else {
					body['id'] = this.id;
					this.addUpdateData("Update", body);
				}
			});
		}
	}

	addUpdateData(type, body) {
		if (type == "Add") {
			this.crudServices.addData<any>(JobReferences.add, body).subscribe((res) => {
				this.loadingBtn = false;
				if (res.code == 100) {
					this.toasterService.pop(res.message, res.data, res.data);
					this.onCloseModal();
					this.getData();
				} else {
					this.toasterService.pop(res.message, res.data, res.data);
				}
			});
		} else {
			this.crudServices.updateData<any>(JobReferences.update, body).subscribe((res) => {
				this.loadingBtn = false;
				if (res.code == 100) {
					this.toasterService.pop(res.message, res.data, res.data);
					this.onCloseModal();
					this.getData();
				} else {
					this.toasterService.pop(res.message, res.data, res.data);
				}
			});
		}
	}

	onCloseModal() {
		this.id = null;
		this.fileData = new FormData();
		this.jobReferenceForm.reset();
		this.jobReferenceModal.hide();
	}

	exportData(type) {
		let fileName = this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
		let exportData = [];
		for (let i = 0; i < this.data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					obj[this.cols[j]["header"]] = this.data[i][this.cols[j]["field"]];
				}
			}
			exportData.push(obj);
		} if (type == 'Excel') {
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


