import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';

import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from 'ngx-bootstrap';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { staticValues } from '../../../shared/common-service/common-service';
import { CommonApis, FileUpload, GradeMaster, MainGrade, ProductMaster, SubOrg } from '../../../shared/apis-path/apis-path';

@Component({
	selector: 'app-grade-master',
	templateUrl: './grade-master.component.html',
	styleUrls: ['./grade-master.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [ToasterService, PermissionService, CrudServices],
})
export class GradeMasterComponent implements OnInit, OnDestroy {
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	gradeMasterForm: FormGroup;
	updateGradeMasterForm: FormGroup;

	submitted = false;
	updated = false;
	// unit_type

	private toasterService: ToasterService;
	subscription: Subscription;
	isLoading = false;
	error: any;
	filesToUpload: Array<File> = [];
	filesToUploadUpdate: Array<File> = [];

	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;

	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	data: any = [];
	main_grade_data: any = [];
	polymerManufacturer: any = [];
	grade_category_arr: any = [];
	unit_data: any = [];
	prime_non_prime_data = staticValues.prime_non_prime;
	grade_id: number;
	size: string;

	constructor(
		toasterService: ToasterService,
		private crudServices: CrudServices,
		private permissionService: PermissionService,
	) {
		this.size = "col-md-8"
		this.toasterService = toasterService;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.initForm();
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	ngOnInit() {
		this.getGrade();
		this.crudServices.getAll<any>(MainGrade.getAll).subscribe(response => {
			this.main_grade_data = response;
		});
		this.crudServices.getAll<any>(CommonApis.getAllUnitDrumMt).subscribe(response => {
			this.unit_data = response;
		});

		this.crudServices.getRequest<any>(SubOrg.getPetrochemicalManufacture).subscribe(response => {
			console.log(response, "SubOrgresponse")
			this.polymerManufacturer = response;
		});

		this.crudServices.getAll<any>(GradeMaster.gradeCategory).subscribe(response => {
			console.log(response, "Graderesponse")
			this.grade_category_arr = response.data;
		});


	}

	initForm() {
		this.gradeMasterForm = new FormGroup({
			'grade_name': new FormControl(null, Validators.required),
			'main_grade_id': new FormControl(null, Validators.required),
			'prime_non_prime': new FormControl(null),
			'unit_id': new FormControl(null, Validators.required),
			'grade_rate': new FormControl(null),
			'lowest_cap': new FormControl(null),
			'petro_manu_org_id': new FormControl(null),
			'grade_category_id': new FormControl(null),
			'mfi': new FormControl(null),
			'grade_application': new FormControl(null),
			'grade_test_cert': new FormControl(null),
			'hsn_code': new FormControl(null,[Validators.minLength(6),Validators.maxLength(10)]),
		});
		this.updateGradeMasterForm = new FormGroup({
			'update_grade_name': new FormControl(null, Validators.required),
			'update_main_grade_id': new FormControl(null, Validators.required),
			'update_prime_non_prime': new FormControl(null),
			'update_unit_id': new FormControl(null, Validators.required),
			'update_grade_rate': new FormControl(null),
			'update_lowest_cap': new FormControl(null),
			'update_petro_manu_org_id': new FormControl(null),
			'update_grade_category_id': new FormControl(null),
			'update_mfi': new FormControl(null),
			'update_grade_application': new FormControl(null),
			'update_grade_test_cert': new FormControl(null),
			'update_hsn_code': new FormControl(null ,[Validators.maxLength(10),Validators.minLength(6)]),
		});
	}

	getGrade() {
		this.isLoading = true;
		this.subscription = this.crudServices.getAll<any>(GradeMaster.getAll).subscribe((res) => {
			this.isLoading = false;

			for (let elem_grd of res) {
				elem_grd.grade_cert = JSON.parse(elem_grd.grade_test_cert);
			}
			this.data = res;
		});
	}

	// convenience getter for easy access to form fields
	get f() { return this.gradeMasterForm.controls; }
	get g() { return this.updateGradeMasterForm.controls; }

	onReset() {
		this.submitted = false;
		this.gradeMasterForm.reset();
	}

	onEdit(grade_id) {
		if (grade_id != null) {
			this.grade_id = grade_id;
			this.crudServices.getOne<any>(GradeMaster.getOne, {
				grade_id: this.grade_id
			}).subscribe((response) => {
				if (response === null) {
					this.error = response;
					this.toasterService.pop('error', 'Error', 'Something Went Wrong');
				} else {
					this.updateGradeMasterForm.setValue({
						update_grade_name: response[0].grade_name,
						update_main_grade_id: response[0].main_grade_id,
						update_prime_non_prime: response[0].prime_non_prime,
						update_unit_id: response[0].unit_id,
						update_grade_rate: response[0].rate,
						update_lowest_cap: response[0].lowest_cap,
						update_petro_manu_org_id: response[0].petro_manu_org_id,
						update_grade_category_id: response[0].grade_category_id,
						update_mfi: response[0].mfi,
						update_grade_application: response[0].grade_application,
						update_grade_test_cert: response[0].grade_test_cert,
						update_hsn_code: response[0].hsn_code
					})
				}
			}, errorMessage => {
				this.error = errorMessage.message;
			});
			this.myModal.show();
		}
	}

	onUpdate() {
		this.updated = true;
		if (this.updateGradeMasterForm.invalid) {
			return;
		} else {
			let body = {
				data: {
					grade_name: this.updateGradeMasterForm.value.update_grade_name,
					main_grade_id: this.updateGradeMasterForm.value.update_main_grade_id,
					prime_non_prime: this.updateGradeMasterForm.value.update_prime_non_prime,
					unit_id: this.updateGradeMasterForm.value.update_unit_id,
					rate: this.updateGradeMasterForm.value.update_grade_rate,
					lowest_cap: this.updateGradeMasterForm.value.update_lowest_cap,
					petro_manu_org_id: this.updateGradeMasterForm.value.update_petro_manu_org_id,
					grade_category_id: this.updateGradeMasterForm.value.update_grade_category_id,
					mfi: this.updateGradeMasterForm.value.update_mfi,
					grade_application: this.updateGradeMasterForm.value.update_grade_application,
					hsn_code: this.updateGradeMasterForm.value.update_hsn_code
				},
				where: {
					grade_id: this.grade_id
				}
			}


			const fileData: any = new FormData();
			const files: Array<File> = this.filesToUploadUpdate;
			if (files.length > 0) {
				if (files.length > 0) {
					for (let i = 0; i < files.length; i++) {
						fileData.append('grade_test_cert', files[i], files[i]['name']);
					}
				}

				this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
					let files = [];
					let filesList = res.uploads.grade_test_cert;
					if (filesList.length > 0) {
						for (let i = 0; i < filesList.length; i++) {
							files.push(filesList[i].location);
						}
						body.data['grade_test_cert'] = JSON.stringify(files);
					}
					this.updateData(body);
				});

			} else {
				this.updateData(body);
			}
		}


	}

	updateData(body) {
		this.crudServices.updateData<any>(GradeMaster.update, body).subscribe((response) => {
			this.getGrade();
			this.toasterService.pop(response.message, 'Success', response.data);
			this.myModal.hide();
			this.updated = false;
			this.updateGradeMasterForm.reset();
		});

	}

	onSubmit() {




		this.submitted = true;
		if (this.gradeMasterForm.invalid) {
			return;
		} else {
			let body = {
				data: {
					grade_name: this.gradeMasterForm.value.grade_name,
					main_grade_id: this.gradeMasterForm.value.main_grade_id,
					prime_non_prime: this.gradeMasterForm.value.prime_non_prime,
					unit_id: this.gradeMasterForm.value.unit_id,
					rate: this.gradeMasterForm.value.grade_rate,
					lowest_cap: this.gradeMasterForm.value.lowest_cap,
					petro_manu_org_id: this.gradeMasterForm.value.petro_manu_org_id,
					grade_category_id: this.gradeMasterForm.value.grade_category_id,
					mfi: this.gradeMasterForm.value.mfi,
					grade_application: this.gradeMasterForm.value.grade_application,
					hsn_code: this.gradeMasterForm.value.hsn_code
				}
			}


			const fileData: any = new FormData();
			const files: Array<File> = this.filesToUpload;
			if (files.length > 0) {
				if (files.length > 0) {
					for (let i = 0; i < files.length; i++) {
						fileData.append('grade_test_cert', files[i], files[i]['name']);
					}
				}

				this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
					let files = [];
					let filesList = res.uploads.grade_test_cert;
					if (filesList.length > 0) {
						for (let i = 0; i < filesList.length; i++) {
							files.push(filesList[i].location);
						}
						body.data['grade_test_cert'] = JSON.stringify(files);
					}
					this.saveData(body.data);
				});

			} else {
				this.saveData(body.data);
			}




		}
	}

	saveData(body) {
		this.crudServices.addData<any>(GradeMaster.add, body).subscribe((response) => {
			this.onReset();
			this.getGrade();
			this.toasterService.pop(response.message, 'Success', response.data);
		});
	}

	onDelete(grade_id: number) {
		if (grade_id) {
			this.crudServices.deleteData<any>(GradeMaster.delete, {
				grade_id: grade_id
			}).subscribe((response) => {
				this.getGrade();
				this.toasterService.pop(response.message, 'Success', response.data);
			});
		}
	}

	get_prime_non_prime(prime_non_prime) {
		if (prime_non_prime === 1) {
			return 'Prime';
		} else if (prime_non_prime === 2) {
			return 'Non-Prime';
		} else if (prime_non_prime === 3) {
			return 'Utility';
		}
	}


	fileChangeEvent(fileInput: any) {
		this.filesToUpload = <Array<File>>fileInput.target.files;
	}


	fileUpdateChangeEvent(fileInput: any) {
		this.filesToUploadUpdate = <Array<File>>fileInput.target.files;
	}

	viewfullscreen() {

		this.add_opt = !this.add_opt;
		this.size = (this.add_opt == true) ? 'col-md-8' : 'col-md-12';
	}


}
