import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { bankOtherCharges, ChargesStages, otherCharges, SpiplBankMaster } from '../../../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../../../shared/crud-services/crud-services';

@Component({
	selector: 'app-add-edit-bank-other-charges',
	templateUrl: './add-edit-bank-other-charges.component.html',
	styleUrls: ['./add-edit-bank-other-charges.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		CrudServices,
	],
})
export class AddEditBankOtherChargesComponent implements OnInit {

	mode: string = "Add";
	box_title: string = "FLC Bank Charges";
	isLoading: boolean = false;
	editmode: boolean = false;
	OtherChargesForm: FormGroup;
	spipl_bank: any;
	charges_category: any;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});

	other_charges_id: any;
	public today = new Date();
	gstFlag: boolean;


	constructor(private route: ActivatedRoute,
		private router: Router,
		private toasterService: ToasterService,
		private CrudServices: CrudServices) {

		this.OtherChargesForm = new FormGroup({
			bank_id: new FormControl(null, Validators.required),
			charges_stage_id: new FormControl(null, Validators.required),
			charges_date: new FormControl(null),
			header: new FormControl(null),
			charges_description: new FormControl(null),
			charges_value: new FormControl(0),
			gst_flag: new FormControl(0)
		});

		this.route.params.subscribe((params: Params) => {
			if (params.other_charges_id !== undefined) {
				this.editmode = true;
				this.mode = "Edit";
				this.other_charges_id = params.other_charges_id;
				this.getOtherChargesData();
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

		//4 for other Charges
		this.CrudServices.getOne<any>(ChargesStages.getCategoryWiseCharges, {
			category_type: 4
		}).subscribe((response) => {
			console.log(response, "response")
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.charges_category = response;
				console.log(this.charges_category, "category");
			}
		});



	}

	ngOnInit() {
	}


	getOtherChargesData() {
		this.CrudServices.getOne<any>(bankOtherCharges.getOne, {
			id: this.other_charges_id
		}).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				if (response[0].gst_flag == 1) {
					this.gstFlag = true;
				} else {
					this.gstFlag = false;
				}
				console.log(this.gstFlag, response[0].gst_flag, "gstglag");
				this.OtherChargesForm.patchValue({
					bank_id: response[0].bank_id,
					charges_stage_id: response[0].charges_stage_id,
					charges_date: response[0].charges_date,
					header: response[0].header,
					charges_description: response[0].charges_description,
					charges_value: response[0].charges_value,
					gst_flag: this.gstFlag,

				});
			}
		});
	}

	onSubmit() {
		if (!this.OtherChargesForm.invalid) {

			let cgstValue = 0;
			let sgstValue = 0;
			let gstFlagValue = 0;

			console.log(this.OtherChargesForm.value.gst_flag, "gstglag");
			if (this.OtherChargesForm.value.gst_flag) {
				cgstValue = Number(this.OtherChargesForm.value.charges_value) * (9 / 100);
				sgstValue = Number(this.OtherChargesForm.value.charges_value) * (9 / 100);
				gstFlagValue = 1;
			} else {
				cgstValue = 0;
				sgstValue = 0;
				gstFlagValue = 0;

			}

			let totalCharges = Number(this.OtherChargesForm.value.charges_value) + Number(cgstValue) + Number(sgstValue);
			const formData = {
				bank_id: this.OtherChargesForm.value.bank_id,
				charges_stage_id: this.OtherChargesForm.value.charges_stage_id,
				header: this.OtherChargesForm.value.header,
				charges_description: this.OtherChargesForm.value.charges_description,
				charges_value: this.OtherChargesForm.value.charges_value,
				charges_date: this.OtherChargesForm.value.charges_date,
				gst_flag: gstFlagValue,
				cgst: cgstValue,
				sgst: sgstValue,
				total_charges: totalCharges
			};
			console.log(formData, "formData");

			let body = {
				otherChargesData: formData
			}
			if (this.editmode) {
				body["id"] = this.other_charges_id;
				this.CrudServices.updateData<any>(bankOtherCharges.update, body).subscribe(response => {
					this.toasterService.pop(response['message'], "Success", response['data']);
					if (response.code === "100") {

						this.onBack();
					}
				});
			} else {
				this.CrudServices.addData<any>(bankOtherCharges.add, body).subscribe(response => {
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
	}


	onBack() {

		this.router.navigate(["/forex/bank-other-charges"]);
	}

}
