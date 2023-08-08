import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CrudServices } from '../../shared/crud-services/crud-services';
import { ssurishaTDSChargesForm, FileUpload, tdsChargesForm } from '../../shared/apis-path/apis-path';
import { ToasterService, ToasterConfig } from 'angular2-toaster';

@Component({
	selector: 'app-tds-charges-form',
	templateUrl: './tds-charges-form.component.html',
	styleUrls: ['./tds-charges-form.component.css'],
	providers: [CrudServices, ToasterService]
})
export class SSurishaTdsChargesFormComponent implements OnInit {

	tdsChargeForm: FormGroup;
	ackprrof1819: Array<File> = [];
	ackprrof1920: Array<File> = [];
	ackprrof2021: Array<File> = [];
	//agree = false;

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});


	constructor(private CrudServices: CrudServices, private toasterService: ToasterService) {
		this.tdsChargeForm = new FormGroup({
			'org_name': new FormControl(null),
			'gst_no': new FormControl(null, [
				Validators.required,
				Validators.pattern("^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[0-9A-Za-z]{3}$"),
			]),
			'vendor_customer': new FormControl(null, Validators.required),
			'valid_pan_status': new FormControl(null),
			'pan_number': new FormControl(null),
			'turnover_20_21_status': new FormControl(null, Validators.required),
			'roi_18_19_status': new FormControl(null, Validators.required),
			'ack_number_18_19': new FormControl(null),
			'ack_proof_18_19': new FormControl(null),
			'turnover_19_20_status': new FormControl(null),
			'roi_19_20_status': new FormControl(null, Validators.required),
			'ack_number_19_20': new FormControl(null),
			'ack_proof_19_20': new FormControl(null),
			'roi_20_21_status': new FormControl(null),
			'ack_number_20_21': new FormControl(null),
			'ack_proof_20_21': new FormControl(null),
			'tds_tcs_19_20_status': new FormControl(null, Validators.required),
			'tds_tcs_20_21_status': new FormControl(null, Validators.required),
			'person_name': new FormControl(null, Validators.required),
			'designation': new FormControl(null),
			'address': new FormControl(null),
			'city': new FormControl(null),
			'state': new FormControl(null),
			'pincode': new FormControl(null),
			'email_id': new FormControl(null, Validators.required),
			'phone_number': new FormControl(null, Validators.required),
			'acknowledge': new FormControl(null, Validators.required),
			'incorporation_date': new FormControl(null, Validators.required),

		});
	}

	ngOnInit() {
	}


	get f() {
		return this.tdsChargeForm.controls;
	}
	ack1819docs(event: any) {
		this.ackprrof1819 = <Array<File>>event.target.files;
	}

	ack1920docs(event: any) {
		this.ackprrof1920 = <Array<File>>event.target.files;
	}

	ack2021docs(event: any) {
		this.ackprrof2021 = <Array<File>>event.target.files;
	}

	onSubmit() {
		if (!this.tdsChargeForm.invalid) {


			let formData = {

				org_name: this.tdsChargeForm.value.org_name,
				gst_no: this.tdsChargeForm.value.gst_no,
				vendor_customer: this.tdsChargeForm.value.vendor_customer,
				valid_pan_status: this.tdsChargeForm.value.valid_pan_status,
				pan_number: this.tdsChargeForm.value.pan_number,
				turnover_20_21_status: this.tdsChargeForm.value.turnover_20_21_status,
				roi_18_19_status: this.tdsChargeForm.value.roi_18_19_status,
				ack_number_18_19: this.tdsChargeForm.value.ack_number_18_19,
				//ack_proof_18_19 : this.tdsChargeForm.value.ack_proof_18_19,
				turnover_19_20_status: this.tdsChargeForm.value.turnover_19_20_status,
				roi_19_20_status: this.tdsChargeForm.value.roi_19_20_status,
				ack_number_19_20: this.tdsChargeForm.value.ack_number_19_20,
				// ack_proof_19_20 : this.tdsChargeForm.value.ack_proof_19_20,
				roi_20_21_status: this.tdsChargeForm.value.roi_20_21_status,
				ack_number_20_21: this.tdsChargeForm.value.ack_number_20_21,
				//ack_proof_20_21 : this.tdsChargeForm.value.ack_proof_20_21,
				tds_tcs_19_20_status: this.tdsChargeForm.value.tds_tcs_19_20_status,
				tds_tcs_20_21_status: this.tdsChargeForm.value.tds_tcs_20_21_status,
				person_name: this.tdsChargeForm.value.person_name,
				designation: this.tdsChargeForm.value.designation,
				address: this.tdsChargeForm.value.address,
				city: this.tdsChargeForm.value.city,
				state: this.tdsChargeForm.value.state,
				pincode: this.tdsChargeForm.value.pincode,
				email_id: this.tdsChargeForm.value.email_id,
				phone_number: this.tdsChargeForm.value.phone_number,
				acknowledge: this.tdsChargeForm.value.acknowledge,
				incorporation_date: this.tdsChargeForm.value.incorporation_date

			};



			const fileData = new FormData();
			const ack_docs_1819: Array<File> = this.ackprrof1819;
			const ack_docs_1920: Array<File> = this.ackprrof1920;
			const ack_docs_2021: Array<File> = this.ackprrof2021;
			if (ack_docs_1819.length > 0 || ack_docs_1920.length > 0 || ack_docs_2021.length) {
				for (let i = 0; i < ack_docs_1819.length; i++) {
					fileData.append('ack_proof_18_19', ack_docs_1819[i], ack_docs_1819[i]["name"]);
				}

				for (let i = 0; i < ack_docs_1920.length; i++) {
					fileData.append('ack_proof_19_20', ack_docs_1920[i], ack_docs_1920[i]["name"]);
				}

				for (let i = 0; i < ack_docs_2021.length; i++) {
					fileData.append('ack_proof_20_21', ack_docs_2021[i], ack_docs_2021[i]["name"]);
				}

				this.CrudServices.fileUploadTDSTCS(FileUpload.upload, fileData).subscribe(res => {
					let ackproof1819 = [];
					let ackproof1819List = res.uploads.ack_proof_18_19;
					if (ackproof1819List != null) {
						if (ackproof1819List.length > 0) {
							for (let i = 0; i < ackproof1819List.length; i++) {
								ackproof1819.push(ackproof1819List[i].location);
							}
							formData['ack_proof_18_19'] = JSON.stringify(ackproof1819);
						}
					}
					let ackproof1920 = [];
					let ackproof1920List = res.uploads.ack_proof_19_20;
					if (ackproof1920List != null) {
						if (ackproof1920List.length > 0) {
							for (let i = 0; i < ackproof1920List.length; i++) {
								ackproof1920.push(ackproof1920List[i].location);
							}
							formData['ack_proof_19_20'] = JSON.stringify(ackproof1920);
						}
					}

					let ackproof2021 = [];
					let ackproof2021List = res.uploads.ack_proof_20_21;
					if (ackproof2021List != null) {
						if (ackproof2021List.length > 0) {
							for (let i = 0; i < ackproof2021List.length; i++) {
								ackproof2021.push(ackproof2021List[i].location);
							}
							formData['ack_proof_20_21'] = JSON.stringify(ackproof2021);
						}
					}

					this.saveData(formData);
				});

			} else {
				this.CrudServices.postTDSTCSRequest<any>(ssurishaTDSChargesForm.add, {
					data: formData
				}).subscribe((response) => {
					this.toasterService.pop(response.message, response.message, response.data);
					this.onReset();
				});
			}
		}

	}


	saveData(formData) {
		this.CrudServices.postTDSTCSRequest<any>(ssurishaTDSChargesForm.add, {
			data: formData
		}).subscribe((response) => {
			this.toasterService.pop(response.message, response.message, response.data);
			this.onReset();
		});
	}

	onReset() {
		this.tdsChargeForm.reset();
	}
}