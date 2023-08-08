import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SelectService } from '../../../shared/dropdown-services/select-services';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder, PatternValidator } from '@angular/forms';
import { HrServices } from '../hr-services';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import {
	StaffDocuments,
	StaffDocumentsTypes,
	CountryStateCityMaster,
	DepartmentMaster,
	JobProfileMaster,
	QualificationMaster,
	RoleMaster,
	StaffMemberMaster,
	FileUpload,
	CommonApis,
	TelephoneExtensions
} from '../../../shared/apis-path/apis-path';
import { staticValues } from '../../../shared/common-service/common-service';
import * as moment from "moment";

@Component({
	selector: 'app-add-staff-master',
	templateUrl: './add-staff-master.component.html',
	styleUrls: ['./add-staff-master.component.scss'],
	providers: [
		CrudServices,
		SelectService,
		HrServices,
		ToasterService,
		PermissionService,
		LoginService
	],
	encapsulation: ViewEncapsulation.None
})

export class AddStaffMasterComponent implements OnInit {

	datePickerConfig: any = staticValues.datePickerConfig;
	account_type_list = staticValues.bank_account_types;
	gender_list = staticValues.gender;
	marital_status_list = staticValues.marital_status;
	tax_regime_list = staticValues.tax_regime;
	qualification_list: any = [];
	department_list: any = [];
	roles_list: any = [];
	job_profile_list: any = [];
	company_list: any = [];
	employee_type_list: any = [];
	banks_list: any = [];
	staff_documents_types_list: any = [];
	city_list: any = [];
	state_list: any = [];
	employee_documents: any = [];

	user: UserDetails;
	staffForm: FormGroup;
	id: any = null;
	role_id: any = null;

	isLoading: boolean = false;
	editMode: boolean = false;
	enableEdit: boolean = false;
	same_address: boolean = false;
	setDesableOnEmail: boolean = false;
	emailValidation: any = null;

	maxDob: Date = new Date(moment().subtract(18, 'year').format("YYYY-MM-DD"));
	maxDate: Date = new Date();
	minDate: Date = new Date();
	box_title = 'Add New Member';

	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	// filesToUpload: Array<File> = [];
	// profilefilesToUpload: Array<File> = [];
	// registerfilesToUpload: Array<File> = [];
	// imageSrc: string;

	constructor(
		private loginService: LoginService,
		private crudServices: CrudServices,
		private fb: FormBuilder,
		private selectService: SelectService,
		private hrServices: HrServices,
		toasterService: ToasterService,
		private route: ActivatedRoute,
		private router: Router
	) {
		this.toasterService = toasterService;
		this.staffForm = this.fb.group({
			title: new FormControl(null),
			first_name: new FormControl(null, Validators.required),
			middle_name: new FormControl(null),
			last_name: new FormControl(null, Validators.required),
			gender: new FormControl(null, Validators.required),
			marital_status: new FormControl(null, Validators.required),
			dob: new FormControl(null, Validators.required),
			doa: new FormControl(null),
			mobile: new FormControl(null, [Validators.required, Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$'),]),
			alter_mobile: new FormControl(null, [Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$'),]),
			email: new FormControl(null, Validators.required),
			password: new FormControl(null),
			adhaar_no: new FormControl(null),
			spipl_pf_no: new FormControl(null),

			// Commenting this, as users are blocked if they dont have this information
			
			// adhaar_no:new FormControl(null,[Validators.required,Validators.pattern('^[0-9]{16}$')]),
			// spipl_pf_no:new FormControl(null,[Validators.required,Validators.pattern('^[0-9]{12}$')]),
			pan_no: new FormControl(null, [Validators.required, Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')]),
			uan_no: new FormControl(null),
			state_id: new FormControl(null, Validators.required),
			city_id: new FormControl(null, Validators.required),
			local_address: new FormControl(null, Validators.required),
			permanant_address: new FormControl(null, Validators.required),
			appointment_date: new FormControl(new Date(), Validators.required),
			company_id: new FormControl(null, Validators.required),
			employee_type_id: new FormControl(null, Validators.required),
			department_id: new FormControl(null, Validators.required),
			role_id: new FormControl(null, Validators.required),
			job_profile_id: new FormControl(null, Validators.required),
			qualification_id: new FormControl(null, Validators.required),
			machine_id: new FormControl(null),
			telephone_extension: new FormControl(null),
			telephone_extension_id: new FormControl(null),
			bank_id: new FormControl(null, Validators.required),
			bank_branch_name: new FormControl(null, Validators.required),
			ifsc_code: new FormControl(null, Validators.required),
			bank_account_no: new FormControl(null, Validators.required),
			acc_type_name: new FormControl(null, Validators.required),
			joining_ctc: new FormControl(null, Validators.required),
			medical_coverage: new FormControl(null, Validators.required),
			notice_period: new FormControl(60, Validators.required),
			tax_type: new FormControl(1, Validators.required),
			documents: new FormArray([])
		});

		this.route.params.subscribe((params: Params) => {
			this.id = params['id'];
			this.editMode = (params['id'] != null) ? true : false;
		});
		this.user = this.loginService.getUserDetails();
		this.role_id = this.user.userDet[0].role_id;

		if (this.user.userDet[0].role_id == 1 || this.user.userDet[0].role_id == 2 || this.user.userDet[0].role_id == 3) {
			this.enableEdit = true;
		}
	}

	get s() { return this.staffForm.controls; }
	get d() { return this.s.documents as FormArray; }

	ngOnInit() {
		this.getCities();
		this.getStates();
		this.getQualifications();
		this.getDepartments();
		this.getRoles();
		this.getJobProfiles();
		this.getCompanies();
		this.getEmployeeTypes();
		this.getBanks();
		this.getStaffDocumentsTypes();

		if (this.editMode) {
			this.initForm();
			this.getTelephoneExtension();
		}
		if (!this.editMode) {
			this.staffForm.patchValue({
				role_id: 23
			});
		}
	}

	getTelephoneExtension() {
		this.crudServices.getOne<any>(TelephoneExtensions.getEmpExtension, {
			emp_id: this.id
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.staffForm.patchValue({
						telephone_extension_id: res.data[0].id,
						telephone_extension: res.data[0].extension
					});
				}
			}
		});
	}

	getStaffDocumentsTypes() {
		this.d.clear();
		this.crudServices.getAll<any>(StaffDocumentsTypes.getAll).subscribe(res => {
			this.staff_documents_types_list = res.data;
			for (let i = 0; i < res.data.length; i++) {
				this.d.push(
					this.fb.group({
						document_id: res.data[i].id,
						document_type: res.data[i].document_type,
						document: null
					})
				);
			}
		});
	}

	getStates() {
		this.crudServices.getOne<any>(CountryStateCityMaster.getStates, {
			country_id: 101
		}).subscribe(res => {
			this.state_list = res.data;
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

	onSelectSameAddress(e) {
		this.same_address = e;
		if (e) {
			this.staffForm.patchValue({
				permanant_address: this.staffForm.value.local_address
			});
		} else {
			this.staffForm.patchValue({
				permanant_address: null
			});
		}
	}

	onChangeCity(value) {
		if (value != null || value != undefined) {
			this.staffForm.patchValue({
				state_id: value.state_id
			});
		} else {
			this.staffForm.patchValue({
				state_id: null
			});
		}
	}

	onChangeState(value) {
		if (value != null || value != undefined) {
			this.staffForm.patchValue({
				state_id: value.state_id
			});
		} else {
			this.staffForm.patchValue({
				state_id: null
			});
		}
	}

	onChangeLocalAddress(value) {
		if (this.same_address) {
			if (value != null || value != undefined) {
				this.staffForm.patchValue({
					permanant_address: value
				});
			} else {
				this.staffForm.patchValue({
					permanant_address: null
				});
			}
		}
	}

	checkEmail(event) {
		if (event.target.value) {
			this.crudServices.getOne<any>(StaffMemberMaster.checkEmailPresent, {
				email: event.target.value
			}).subscribe(response => {
				if (response) {
					this.emailValidation = '<span style="color: red;">Email Already Present</span>';
					this.setDesableOnEmail = true;
				} else {
					this.emailValidation = null;
					this.setDesableOnEmail = false;
				}
			})
		} else {
			this.emailValidation = null;
			this.setDesableOnEmail = false;
		}
	}

	onFileChange(e, document_id, document_type, i) {
		let files = <Array<File>>e.target.files;
		for (let i = 0; i < files.length; i++) {
			let result = this.employee_documents.findIndex(o => o.id === document_id);
			if (result != -1) {
				let file = {
					id: document_id,
					document_type: document_type,
					file: files[i]
				};
				this.employee_documents[result] = file;
			} else {
				let file = {
					id: document_id,
					document_type: document_type,
					file: files[i]
				};
				this.employee_documents.push(file);
			}
		}
	}

	initForm() {
		this.box_title = 'Update Member';
		this.isLoading = false;
		this.crudServices.getOne<any>(StaffMemberMaster.getOne, {
			id: this.id
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					console.log(res.data[0]);
					this.staffForm.patchValue({
						title: res.data[0].title,
						first_name: res.data[0].first_name,
						middle_name: res.data[0].middle_name,
						last_name: res.data[0].last_name,
						gender: res.data[0].gender,
						marital_status: res.data[0].marital_status,
						dob: res.data[0].dob,
						doa: res.data[0].doa,
						mobile: res.data[0].mobile,
						alter_mobile: res.data[0].alter_mobile,
						email: res.data[0].email,
						password: res.data[0].password,
						adhaar_no: res.data[0].adhaar_no,
						spipl_pf_no: res.data[0].spipl_pf_no,
						pan_no: res.data[0].pan_no,
						uan_no: res.data[0].uan_no,
						state_id: res.data[0].state_id,
						city_id: res.data[0].city_id,
						local_address: res.data[0].local_address,
						permanant_address: res.data[0].permanant_address,
						appointment_date: res.data[0].appointment_date,
						company_id: res.data[0].company_id,
						employee_type_id: res.data[0].employee_type_id,
						department_id: res.data[0].department_id,
						role_id: res.data[0].role_id,
						job_profile_id: res.data[0].job_profile_id,
						qualification_id: res.data[0].qualification_id,
						machine_id: res.data[0].machine_id,
						bank_id: res.data[0].bank_id,
						bank_branch_name: res.data[0].bank_branch_name,
						ifsc_code: res.data[0].ifsc_code,
						bank_account_no: res.data[0].bank_account_no,
						acc_type_name: res.data[0].acc_type_name,
						joining_ctc: res.data[0].joining_ctc,
						medical_coverage: res.data[0].medical_coverage,
						notice_period: res.data[0].notice_period,
						tax_type: res.data[0].tax_type
					});
				}
			}
		});
	}

	onSubmit() {
		let gender = this.staffForm.value.gender;
		let marital_status = this.staffForm.value.marital_status;
		let title = null;

		if (gender == 2 && marital_status == 1) {
			title = "Miss";
		} else if (gender == 2 && marital_status != 1) {
			title = "Mrs";
		} else {
			title = "Mr";
		}
		this.staffForm.patchValue({
			title: title
		});

		let data = {
			title: title,
			first_name: this.staffForm.value.first_name,
			middle_name: this.staffForm.value.middle_name,
			last_name: this.staffForm.value.last_name,
			gender: this.staffForm.value.gender,
			marital_status: this.staffForm.value.marital_status,
			dob: moment(this.staffForm.value.dob).format("YYYY-MM-DD"),
			doa: (this.staffForm.value.doa == null) ? null : moment(this.staffForm.value.doa).format("YYYY-MM-DD"),
			mobile: this.staffForm.value.mobile,
			alter_mobile: this.staffForm.value.alter_mobile,
			email: this.staffForm.value.email,
			adhaar_no: this.staffForm.value.adhaar_no,
			spipl_pf_no: this.staffForm.value.spipl_pf_no,
			pan_no: this.staffForm.value.pan_no,
			uan_no: this.staffForm.value.uan_no,
			state_id: this.staffForm.value.state_id,
			city_id: this.staffForm.value.city_id,
			local_address: this.staffForm.value.local_address,
			permanant_address: this.staffForm.value.permanant_address,
			appointment_date: moment(this.staffForm.value.appointment_date).format("YYYY-MM-DD"),
			company_id: this.staffForm.value.company_id,
			employee_type_id: this.staffForm.value.employee_type_id,
			department_id: this.staffForm.value.department_id,
			role_id: this.staffForm.value.role_id,
			job_profile_id: this.staffForm.value.job_profile_id,
			qualification_id: this.staffForm.value.qualification_id,
			machine_id: this.staffForm.value.machine_id,
			bank_id: this.staffForm.value.bank_id,
			bank_branch_name: this.staffForm.value.bank_branch_name,
			ifsc_code: this.staffForm.value.ifsc_code,
			bank_account_no: this.staffForm.value.bank_account_no,
			acc_type_name: this.staffForm.value.acc_type_name,
			joining_ctc: this.staffForm.value.joining_ctc,
			medical_coverage: this.staffForm.value.medical_coverage,
			notice_period: this.staffForm.value.notice_period,
			tax_type: this.staffForm.value.tax_type
		};
		let body = {
			data: data
		}
		if (this.editMode) {
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

	fileUpload(staff_id) {
		let fileData = new FormData();
		this.employee_documents.forEach(item => {
			fileData.append("employee_document_" + item.id, item.file, item.file['name']);
		});

		let staff_documents = [];
		let document_ids = [];

		this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res_aws => {
			let keys = Object.keys(res_aws.uploads);
			keys.forEach(key => {
				let document_id = key.match(/\d+/)[0];
				document_ids.push(Number(document_id));
			});
			this.crudServices.deleteData<any>(StaffDocuments.deleteStaffDocs, {
				document_ids: document_ids,
				staff_id: staff_id
			}).subscribe(res_deleted => {
				if (res_deleted.code == '100') {
					document_ids.forEach(value => {
						let doc = {
							document_id: Number(value),
							staff_id: staff_id,
							document: res_aws.uploads["employee_document_" + Number(value)][0].location
						};
						staff_documents.push(doc);
					});
					this.crudServices.addData<any>(StaffDocuments.add, staff_documents).subscribe(res => {
						if (res.code == '100') {
							this.updateTelephoneExtension();
						}
					});
				}
			});

		});
	}

	updateTelephoneExtension() {
		if (this.staffForm.value.telephone_extension != null) {
			let telephone_extension = this.staffForm.value.telephone_extension;
			let telephone_extension_id = this.staffForm.value.telephone_extension_id;
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
		let msg = (this.editMode) ? "Updated" : "Added";
		this.toasterService.pop('success', 'Success', "Employee Details " + msg + " Successfully");
		this.router.navigate([`hr/my-profile/${this.id}`]);
	}

	onReset() {
		this.staffForm.reset();
		this.employee_documents = [];
		this.getStaffDocumentsTypes();
	}

	onBack() {
		this.router.navigate(['hr/list-staff']);
	}

}
