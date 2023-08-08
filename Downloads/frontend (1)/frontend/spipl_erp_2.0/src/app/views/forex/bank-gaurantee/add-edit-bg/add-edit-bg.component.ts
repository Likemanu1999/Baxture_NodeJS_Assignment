import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { bank_gaurantee, FileUpload, SpiplBankMaster, SubOrg } from '../../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../../shared/crud-services/crud-services';
import { staticValues } from '../../../../shared/common-service/common-service';

@Component({
	selector: 'app-add-edit-bg',
	templateUrl: './add-edit-bg.component.html',
	styleUrls: ['./add-edit-bg.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		CrudServices,
	],
})
export class AddEditBgComponent implements OnInit {

	mode: string = "Add";
	box_title: string = "Bank Gaurantee";
	isLoading: boolean = false;
	editmode: boolean = false;
	bgForm: FormGroup;
	spipl_bank: any;
	company: any;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});

	bg_id: any;
	public today = new Date();



	filesToUpload: Array<File> = [];

	bg_sblc_arr = staticValues.bg_sblc_type;

	constructor(private route: ActivatedRoute,
		private router: Router,
		private toasterService: ToasterService,
		private CrudServices: CrudServices) {

		this.bgForm = new FormGroup({
			bank_id: new FormControl(null, Validators.required),
			sub_org_id: new FormControl(null, Validators.required),
			bg_date: new FormControl(null),
			bg_no: new FormControl(null),
			bg_amount: new FormControl(0),
			expiry_date: new FormControl(null),
			bg_copy: new FormControl(null),
			bg_sblc_type: new FormControl(null),

		});


		this.route.params.subscribe((params: Params) => {
			if (params.bg_id !== undefined) {
				this.editmode = true;
				this.mode = "Edit";
				this.bg_id = params.bg_id;
				this.getBgData();
			} else {
				this.editmode = false;
				this.mode = "Add";
			}
		});

		this.CrudServices.getOne<any>(SpiplBankMaster.bankType, { bank_type: 1 }).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.spipl_bank = response;
			}
		});

		this.CrudServices.getRequest<any>(SubOrg.get_sub_org).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.company = response;
			}
		});


	}

	ngOnInit() {
	}


	fileChangeEvent(fileInput: any) {
		this.filesToUpload = <Array<File>>fileInput.target.files;
	}

	getBgData() {
		this.CrudServices.getOne<any>(bank_gaurantee.get_one, {
			id: this.bg_id
		}).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.bgForm.patchValue({
					bank_id: response[0].bank_id,
					sub_org_id: response[0].sub_org_id,
					bg_date: response[0].bg_date,
					bg_no: response[0].bg_no,
					bg_amount: response[0].bg_amount,
					expiry_date: response[0].expiry_date,
					bg_sblc_type: response[0].bg_sblc_type,
				});
			}
		});
	}


	onSubmit() {
		if (!this.bgForm.invalid) {


			const formData = {
				bank_id: this.bgForm.value.bank_id,
				sub_org_id: this.bgForm.value.sub_org_id,
				bg_date: this.bgForm.value.bg_date,
				bg_no: this.bgForm.value.bg_no,
				bg_amount: this.bgForm.value.bg_amount,
				expiry_date: this.bgForm.value.expiry_date,
				bg_sblc_type: this.bgForm.value.bg_sblc_type,
			};

			let body = {
				bgData: formData
			}

			const fileData: any = new FormData();
			const files: Array<File> = this.filesToUpload;
			if (files.length > 0) {

				if (files.length > 0) {
					for (let i = 0; i < files.length; i++) {
						fileData.append('bg_copy', files[i], files[i]['name']);
					}
				}

				this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
					let files = [];
					let filesList = res.uploads.bg_copy;
					if (filesList.length > 0) {
						for (let i = 0; i < filesList.length; i++) {
							files.push(filesList[i].location);
						}
						body.bgData['bg_copy'] = JSON.stringify(files);
					}
					this.saveData(body);
				});

			} else {
				this.saveData(body);
			}
		}
	}

	saveData(body) {

		console.log(body,"bodybody")

		if (this.editmode) {
			body["id"] = this.bg_id;
			this.CrudServices.updateData<any>(bank_gaurantee.update, body).subscribe(response => {
				this.toasterService.pop(response['message'], "Success", response['data']);
				if (response.code === "100") {

					this.onBack();
				}
			});
		} else {
			this.CrudServices.addData<any>(bank_gaurantee.add, body).subscribe(response => {
				console.log(response);
				if (response.code === "100") {
					this.toasterService.pop(response.message, response.message, response.data);
					this.onBack();
				} else if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, "Something Went Wrong");
				}
			}
			);
		}

	}
	onBack() {
		this.router.navigate(["/forex/bank-gaurantee"]);
	}

}
