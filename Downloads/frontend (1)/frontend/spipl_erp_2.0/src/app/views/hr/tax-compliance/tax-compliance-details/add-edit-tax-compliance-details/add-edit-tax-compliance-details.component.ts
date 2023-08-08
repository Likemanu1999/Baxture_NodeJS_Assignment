import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { CrudServices } from '../../../../../shared/crud-services/crud-services';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { taxComplianceDetails, FileUpload, taxComplianceMaster } from '../../../../../shared/apis-path/apis-path';
import * as moment from 'moment';
import { staticValues } from '../../../../../shared/common-service/common-service';

@Component({
	selector: 'app-add-edit-tax-compliance-details',
	templateUrl: './add-edit-tax-compliance-details.component.html',
	styleUrls: ['./add-edit-tax-compliance-details.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		CrudServices,
	],
})
export class AddEditTaxComplianceDetailsComponent implements OnInit {

	mode: string = "Add";
	box_title: string = "Tax Compliance Details";
	isLoading: boolean = false;
	editmode: boolean = false;
	taxComplianceDetailsForm: FormGroup;
	state_list: any;
	employee_list: any;
	company_list: any;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});

	tax_compliance_details_id: any;
	tax_compliance_master_id: any;
	public today = new Date();
	taxComplianceMasterId: any;

	docsUpload: Array<File> = [];
	taxComplianceMasterDet: any;
	maxDate: any = new Date();
	minDate: any = new Date("2021-08-01");

	return_month: any = moment().format("MMM-YYYY");

	monthPickerConfig: any = staticValues.monthPickerConfig;

	return_from_dt: any;
	return_to_date: any;

	constructor(private route: ActivatedRoute,
		private router: Router,
		private toasterService: ToasterService,
		private CrudServices: CrudServices) {

		this.taxComplianceDetailsForm = new FormGroup({
			state_id: new FormControl(null),
			emp_id: new FormControl(null),
			sub_org_id: new FormControl(null),
			submitted_dt: new FormControl(null),
			amount: new FormControl(0),
			interest: new FormControl(0),
			remark: new FormControl(null),
			file_upload: new FormControl(null),
			return_month: new FormControl(null),
			return_from_dt: new FormControl(null),
			return_to_date: new FormControl(null),

		});

		this.route.params.subscribe((params: Params) => {
			if (params.tax_compliance_details_id !== undefined) {
				this.editmode = true;
				this.mode = "Edit";
				this.tax_compliance_details_id = params.tax_compliance_details_id;
				this.tax_compliance_master_id = params.tax_compliance_master_id;
				this.getTaxComplianceDetailsData();
			} else {
				if (params.tax_compliance_master_id !== undefined) {
					this.editmode = false;
					this.mode = "Add";
					this.tax_compliance_master_id = params.tax_compliance_master_id;
				}

			}
		});

		this.CrudServices.postRequest<any>(taxComplianceMaster.get_one, {
			id: this.tax_compliance_master_id
		}).subscribe((response) => {
			this.taxComplianceMasterDet = response[0];
		});

		this.CrudServices.getAll<any>(taxComplianceDetails.get_all_state).subscribe((response) => {
			this.state_list = response;
		});


		this.CrudServices.getAll<any>(taxComplianceDetails.get_all_emp).subscribe((response) => {
			this.employee_list = response;
		});

		this.CrudServices.postRequest<any>(taxComplianceDetails.get_all_our_company, {
			org_cat_id: 119
		}).subscribe((response) => {
			this.company_list = response;
		});
	}

	ngOnInit() {
	}

	getTaxComplianceDetailsData() {

		this.CrudServices.getOne(taxComplianceDetails.get_one, {
			id: this.tax_compliance_details_id,
		}).subscribe(response => {
			let db_return_month = (response[0].return_month).substr(0, 10);
			let dbReturnMonth = moment(db_return_month).format("MMM-YYYY");
			this.return_month = dbReturnMonth;

			this.return_from_dt = response[0].return_from_dt;
			this.return_to_date = response[0].return_to_date;

			this.taxComplianceDetailsForm.patchValue({
				state_id: response[0].state_id,
				emp_id: response[0].emp_id,
				sub_org_id: response[0].sub_org_id,
				submitted_dt: response[0].submitted_dt,
				amount: response[0].amount,
				interest: response[0].interest,
				remark: response[0].remark,

				//file_upload: response[0].file_upload,
				//return_month: new Date(dbReturnMonth),
				// return_from_dt: response[0].return_from_dt,
				// return_to_date: response[0].return_to_date
			});
		});

	}

	fileCopy(event: any) {
		this.docsUpload = <Array<File>>event.target.files;
	}

	onSubmit() {
		if (!this.taxComplianceDetailsForm.invalid) {

			const formData = {

				state_id: this.taxComplianceDetailsForm.value.state_id,
				emp_id: this.taxComplianceDetailsForm.value.emp_id,
				sub_org_id: this.taxComplianceDetailsForm.value.sub_org_id,
				submitted_dt: this.taxComplianceDetailsForm.value.submitted_dt,
				amount: this.taxComplianceDetailsForm.value.amount,
				interest: this.taxComplianceDetailsForm.value.interest,
				remark: this.taxComplianceDetailsForm.value.remark,
				return_month: this.taxComplianceDetailsForm.value.return_month,
				return_from_dt: this.taxComplianceDetailsForm.value.return_from_dt,
				return_to_date: this.taxComplianceDetailsForm.value.return_to_date,
				tax_compliance_master_id: this.tax_compliance_master_id,
			};

			let body = {
				taxComplianceMasterData: formData
			}

			const fileData = new FormData();
			const docs: Array<File> = this.docsUpload;

			if (docs.length > 0) {
				for (let i = 0; i < docs.length; i++) {
					fileData.append('compliance_det_upload', docs[i], docs[i]["name"]);
				}

				this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
					let files = [];
					let filesList = res.uploads.compliance_det_upload;
					if (filesList.length > 0) {
						for (let i = 0; i < filesList.length; i++) {
							files.push(filesList[i].location);
						}
						formData['file_upload'] = JSON.stringify(files);
						this.saveData(formData);
					}
				})
			} else {
				if (this.editmode) {
					body["id"] = this.tax_compliance_details_id;
					this.CrudServices.updateData<any>(taxComplianceDetails.update, body).subscribe(response => {
						this.toasterService.pop(response['message'], "Success", response['data']);
						if (response.code === "100") {
							this.onBack();
						} else {
							this.toasterService.pop(response['message'], "Success", response['data']);
						}
					});
				} else {
					this.CrudServices.addData<any>(taxComplianceDetails.add, body).subscribe(response => {
						if (response.code === "100") {
							this.toasterService.pop(response.message, response.message, response.data);

							this.onBack();
						} else if (response.code === "101") {
							this.toasterService.pop(response.message, response.message, "Something Went Wrong");
						}
					});
				}

			}

		}
	}

	saveData(formData) {
		let body = {
			taxComplianceMasterData: formData
		}
		if (this.editmode) {
			body["id"] = this.tax_compliance_details_id;
			this.CrudServices.updateData<any>(taxComplianceDetails.update, body).subscribe(response => {
				this.toasterService.pop(response['message'], "Success", response['data']);
				if (response.code === "100") {

					this.onBack();
				} else {
					this.toasterService.pop(response['message'], "Success", response['data']);
				}
			});
		} else {
			let body = {
				taxComplianceMasterData: formData
			}
			this.CrudServices.addData<any>(taxComplianceDetails.add, body).subscribe(response => {
				if (response.code === "100") {
					this.toasterService.pop(response.message, response.message, response.data);

					this.onBack();
				} else if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, "Something Went Wrong");
				}
			});
		}
	}
	onBack() {
		this.router.navigate(["/hr/tax-compliance-details", this.tax_compliance_master_id]);

	}


	onOpenCalendar(container) {
		container.monthSelectHandler = (event: any): void => {
			container._store.dispatch(container._actions.select(event.date));
		};
		container.setViewMode('month');
	}

}
