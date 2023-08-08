import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ActivatedRoute, Params, Router } from "@angular/router";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { staticValues } from '../../../shared/common-service/common-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import {
	CommonApis,
	CountryStateCityMaster,
	DepartmentMaster,
	JobProfileMaster,
	QualificationMaster,
	RoleMaster,
	StaffMemberMaster,
	TelephoneExtensions
} from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";

@Component({
	selector: 'app-add-staff-member',
	templateUrl: './add-staff-member.component.html',
	styleUrls: ['./add-staff-member.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class AddStaffMemberComponent implements OnInit {

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Add Staff Member";

	user: UserDetails;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	role_id: any = null;

	datePickerConfig: any = staticValues.datePickerConfig;
	gender_list: any = staticValues.gender;
	marital_status_list: any = staticValues.marital_status;
	blood_group_list: any = staticValues.blood_groups;
	account_type_list = staticValues.bank_account_types;

	maxDob: Date = new Date(moment().subtract(18, 'year').format("YYYY-MM-DD"));
	maxDate: Date = new Date();
	minDate: Date = new Date();

	city_list: any = [];
	qualification_list: any = [];
	department_list: any = [];
	roles_list: any = [];
	job_profile_list: any = [];
	company_list: any = [];
	employee_type_list: any = [];
	banks_list: any = [];
	employee_documents: any = [];
	emailValidation: any = null;
	machineIdValidation: any = null;
	same_address: boolean = false;
	staffMemberForm: FormGroup;
	id: any = null;

	constructor(
		private toasterService: ToasterService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private fb: FormBuilder
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.role_id = this.user.userDet[0].role_id;

		this.activatedRoute.params.subscribe((params: Params) => {
			if (params.id != null && params.id != undefined) {
				this.id = Number(params.id);
				this.page_title = "Edit Staff Member";
			}
		});
	}

	ngOnInit() {
		this.getCities();
		this.getQualifications();
		this.getDepartments();
		this.getRoles();
		this.getJobProfiles();
		this.getCompanies();
		this.getEmployeeTypes();
		this.getBanks();
		this.initForm();
		if (this.id != null) {
			this.getStaffMemberDetails();
			this.getTelephoneExtension();
		}
		if (this.id == null) {
			this.staffMemberForm.patchValue({
				role_id: 23
			});
		}
	}

	initForm() {
		this.staffMemberForm = this.fb.group({
			title: new FormControl(null),
			first_name: new FormControl(null, Validators.required),
			middle_name: new FormControl(null),
			last_name: new FormControl(null, Validators.required),
			gender: new FormControl(null, Validators.required),
			marital_status: new FormControl(null, Validators.required),
			dob: new FormControl(null, Validators.required),
			doa: new FormControl(null),
			qualification_id: new FormControl(null),
			email: new FormControl(null, Validators.required),
			password: new FormControl(null),
			mobile: new FormControl(null, Validators.required),
			alter_mobile: new FormControl(null, Validators.required),
			pan_no: new FormControl(null, Validators.required),
			uan_no: new FormControl(null),
			state_id: new FormControl(null, Validators.required),
			city_id: new FormControl(null, Validators.required),
			blood_group: new FormControl(null, Validators.required),
			emergeny_contact_number: new FormControl(null, Validators.required),
			contact_person_name: new FormControl(null, Validators.required),
			local_address: new FormControl(null, Validators.required),
			permanant_address: new FormControl(null, Validators.required),
			appointment_date: new FormControl(null, Validators.required),
			company_id: new FormControl(null, Validators.required),
			employee_type_id: new FormControl(null, Validators.required),
			department_id: new FormControl(null, Validators.required),
			role_id: new FormControl(null, Validators.required),
			job_profile_id: new FormControl(null, Validators.required),
			machine_id: new FormControl(null),
			telephone_extension: new FormControl(null),
			telephone_extension_id: new FormControl(null),
			joining_ctc: new FormControl(null, Validators.required),
			medical_coverage: new FormControl(null, Validators.required),
			notice_period: new FormControl(null, Validators.required),
			bank_id: new FormControl(null, Validators.required),
			bank_branch_name: new FormControl(null, Validators.required),
			ifsc_code: new FormControl(null, Validators.required),
			bank_account_no: new FormControl(null, Validators.required),
			acc_type_name: new FormControl(null, Validators.required),
			documents: new FormArray([])
		});
	}

	getCities() {
		this.crudServices.getOne<any>(CountryStateCityMaster.getCountryCities, {
			country_id: 101
		}).subscribe(res => {
			this.city_list = res.data;
		});
	}

	getQualifications() {
		this.crudServices.getAll<any>(QualificationMaster.getAll).subscribe(res => {
			this.qualification_list = res.data;
		});
	}

	getDepartments() {
		this.crudServices.getAll<any>(DepartmentMaster.getAll).subscribe(res => {
			this.department_list = res.data;
		});
	}

	getRoles() {
		this.crudServices.getAll<any>(RoleMaster.getAll).subscribe(res => {
			this.roles_list = res.data;
		});
	}

	getJobProfiles() {
		this.crudServices.getAll<any>(JobProfileMaster.getAll).subscribe(res => {
			this.job_profile_list = res.data;
		});
	}

	getCompanies() {
		this.crudServices.getAll<any>(CommonApis.getCompanies).subscribe(res => {
			this.company_list = res.data;
		});
	}

	getEmployeeTypes() {
		this.crudServices.getAll<any>(CommonApis.getEmployeeTypes).subscribe(res => {
			this.employee_type_list = res.data;
		});
	}

	getBanks() {
		this.crudServices.getAll<any>(StaffMemberMaster.getSalaryBank).subscribe(res => {
			this.banks_list = res;
		});
	}

	getTelephoneExtension() {
		this.crudServices.getOne<any>(TelephoneExtensions.getEmpExtension, {
			emp_id: this.id
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.staffMemberForm.patchValue({
						telephone_extension_id: res.data[0].id,
						telephone_extension: res.data[0].extension
					});
				}
			}
		});
	}

	getStaffMemberDetails() {
		this.crudServices.getOne<any>(StaffMemberMaster.getOne, {
			id: this.id
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.staffMemberForm.patchValue({
						title: res.data[0].title,
						first_name: res.data[0].first_name,
						middle_name: res.data[0].middle_name,
						last_name: res.data[0].last_name,
						gender: res.data[0].gender,
						marital_status: res.data[0].marital_status,
						dob: res.data[0].dob,
						doa: res.data[0].doa,
						qualification_id: res.data[0].qualification_id,
						email: res.data[0].email,
						password: res.data[0].password,
						mobile: res.data[0].mobile,
						alter_mobile: res.data[0].alter_mobile,
						pan_no: res.data[0].pan_no,
						uan_no: res.data[0].uan_no,
						state_id: res.data[0].state_id,
						city_id: res.data[0].city_id,
						blood_group: res.data[0].blood_group,
						emergeny_contact_number: res.data[0].emergeny_contact_number,
						contact_person_name: res.data[0].contact_person_name,
						local_address: res.data[0].local_address,
						permanant_address: res.data[0].permanant_address,
						appointment_date: res.data[0].appointment_date,
						company_id: res.data[0].company_id,
						employee_type_id: res.data[0].employee_type_id,
						department_id: res.data[0].department_id,
						role_id: res.data[0].role_id,
						job_profile_id: res.data[0].job_profile_id,
						machine_id: res.data[0].machine_id,
						telephone_extension: res.data[0].telephone_extension,
						telephone_extension_id: res.data[0].telephone_extension_id,
						joining_ctc: res.data[0].joining_ctc,
						medical_coverage: res.data[0].medical_coverage,
						notice_period: res.data[0].notice_period,
						bank_id: res.data[0].bank_id,
						bank_branch_name: res.data[0].bank_branch_name,
						ifsc_code: res.data[0].ifsc_code,
						bank_account_no: res.data[0].bank_account_no,
						acc_type_name: res.data[0].acc_type_name,
						// documents: res.data[0].documents,
					});
				}
			}
		});
	}

	onAction(rowData, type, event) {
		if (type == 'Back') {
			this.router.navigate(['hr-new/list-of-staff']);
		}
		if (type == 'City') {
			if (event != null || event != undefined) {
				this.staffMemberForm.patchValue({
					state_id: event
				});
			} else {
				this.staffMemberForm.patchValue({
					state_id: null
				});
			}
		}
		if (type == 'Same_Address') {
			this.same_address = event;
			if (event) {
				this.staffMemberForm.patchValue({
					permanant_address: this.staffMemberForm.value.local_address
				});
			} else {
				this.staffMemberForm.patchValue({
					permanant_address: null
				});
			}
		}
		if (type == 'Local_Address') {
			if (this.same_address) {
				if (event != null || event != undefined) {
					this.staffMemberForm.patchValue({
						permanant_address: event
					});
				} else {
					this.staffMemberForm.patchValue({
						permanant_address: null
					});
				}
			}
		}
		if (type == 'Email') {
			if (event.target.value) {
				this.crudServices.getOne<any>(StaffMemberMaster.checkEmailPresent, {
					email: event.target.value
				}).subscribe(response => {
					if (response) {
						this.emailValidation = '<span style="color: red;">Email Already Present</span>';
					} else {
						this.emailValidation = null;
					}
				});
			} else {
				this.emailValidation = null;
			}
		}
		if (type == 'Machine_ID') {
			if (event.target.value) {
				this.crudServices.getOne<any>(StaffMemberMaster.checkMachinIdPresent, {
					machine_id: event.target.value
				}).subscribe(response => {
					if (response) {
						this.machineIdValidation = '<span style="color: red;">Biometric ID Already Present</span>';
					} else {
						this.machineIdValidation = null;
					}
				});
			} else {
				this.machineIdValidation = null;
			}
		}
	}

	fileUpload(emp_id) {
		// 
	}

	onSubmit() {
		let gender = this.staffMemberForm.value.gender;
		let marital_status = this.staffMemberForm.value.marital_status;
		let title = null;

		if (gender == 2 && marital_status == 1) {
			title = "Miss";
		} else if (gender == 2 && marital_status != 1) {
			title = "Mrs";
		} else {
			title = "Mr";
		}
		this.staffMemberForm.patchValue({
			title: title
		});

		let data = {
			title: title,
			first_name: this.staffMemberForm.value.first_name,
			middle_name: this.staffMemberForm.value.middle_name,
			last_name: this.staffMemberForm.value.last_name,
			gender: this.staffMemberForm.value.gender,
			marital_status: this.staffMemberForm.value.marital_status,
			dob: moment(this.staffMemberForm.value.dob).format("YYYY-MM-DD"),
			doa: (this.staffMemberForm.value.doa == null) ? null : moment(this.staffMemberForm.value.doa).format("YYYY-MM-DD"),
			mobile: this.staffMemberForm.value.mobile,
			alter_mobile: this.staffMemberForm.value.alter_mobile,
			email: this.staffMemberForm.value.email,
			pan_no: this.staffMemberForm.value.pan_no,
			uan_no: this.staffMemberForm.value.uan_no,
			state_id: this.staffMemberForm.value.state_id,
			city_id: this.staffMemberForm.value.city_id,
			local_address: this.staffMemberForm.value.local_address,
			permanant_address: this.staffMemberForm.value.permanant_address,
			appointment_date: moment(this.staffMemberForm.value.appointment_date).format("YYYY-MM-DD"),
			company_id: this.staffMemberForm.value.company_id,
			employee_type_id: this.staffMemberForm.value.employee_type_id,
			department_id: this.staffMemberForm.value.department_id,
			role_id: this.staffMemberForm.value.role_id,
			job_profile_id: this.staffMemberForm.value.job_profile_id,
			qualification_id: this.staffMemberForm.value.qualification_id,
			machine_id: this.staffMemberForm.value.machine_id,
			bank_id: this.staffMemberForm.value.bank_id,
			bank_branch_name: this.staffMemberForm.value.bank_branch_name,
			ifsc_code: this.staffMemberForm.value.ifsc_code,
			bank_account_no: this.staffMemberForm.value.bank_account_no,
			acc_type_name: this.staffMemberForm.value.acc_type_name,
			joining_ctc: this.staffMemberForm.value.joining_ctc,
			medical_coverage: this.staffMemberForm.value.medical_coverage,
			notice_period: this.staffMemberForm.value.notice_period
		};
		let body = {
			data: data
		}
		console.log(body);
		if (this.id != null) {
			body['id'] = this.id;
			this.crudServices.updateData<any>(StaffMemberMaster.update, body).subscribe(res => {
				if (res.code === '100') {
					if (this.employee_documents.length > 0) {
						this.fileUpload(this.id);
					} else {
						this.updateTelephoneExtension();
					}
				}
			});
		} else {
			this.crudServices.addData<any>(StaffMemberMaster.add, body).subscribe(res => {
				if (res.code === '100') {
					if (this.employee_documents.length > 0) {
						this.fileUpload(res.data);
					} else {
						this.updateTelephoneExtension();
					}
				}
			});
		}
	}

	updateTelephoneExtension() {
		if (this.staffMemberForm.value.telephone_extension != null) {
			let telephone_extension = this.staffMemberForm.value.telephone_extension;
			let telephone_extension_id = this.staffMemberForm.value.telephone_extension_id;
			let body = {
				data: {
					extension: telephone_extension,
					emp_id: this.id,
					type: "Staff"
				},
				message: "Extension Updated Successfully"
			};
			if (telephone_extension != null) {
				body['id'] = telephone_extension_id;
				this.crudServices.updateData<any>(TelephoneExtensions.update, body).subscribe(res => {
					if (res.code == '100') {
						this.afterSubmit();
					}
				});
			} else {
				this.crudServices.addData<any>(TelephoneExtensions.add, body).subscribe(res => {
					if (res.code == '100') {
						this.afterSubmit();
					}
				});
			}
		} else {
			this.afterSubmit();
		}
	}

	afterSubmit() {
		this.toasterService.pop('success', 'Success', "Employee Details Saved Successfully");
		// this.router.navigate([`hr/my-profile/${this.id}`]);
		// this.router.navigate(['hr/list-staff']);
	}

}
