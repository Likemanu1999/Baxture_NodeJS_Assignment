import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { currencyConvert, SpiplBankMaster } from '../../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../../shared/crud-services/crud-services';

@Component({
	selector: 'app-add-edit-currency-convert',
	templateUrl: './add-edit-currency-convert.component.html',
	styleUrls: ['./add-edit-currency-convert.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		CrudServices,
	],
})
export class AddEditCurrencyConvertComponent implements OnInit {

	mode: string = "Add";
	box_title: string = "FLC Bank Charges";
	isLoading: boolean = false;
	editmode: boolean = false;
	currencyConvertForm: FormGroup;
	spipl_bank: any;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});

	currency_conversion_id: any;
	public today = new Date();

	constructor(private route: ActivatedRoute,
		private router: Router,
		private toasterService: ToasterService,
		private CrudServices: CrudServices) {

		this.currencyConvertForm = new FormGroup({
			bank_id: new FormControl(null, Validators.required),
			from_date: new FormControl(null, Validators.required),
			to_date: new FormControl(null),
			amt_range_from: new FormControl(null),
			amt_range_to: new FormControl(null),
			variable_charges: new FormControl(null),
			min_charges: new FormControl(null),
			max_charges: new FormControl(null),

		});

		this.route.params.subscribe((params: Params) => {
			if (params.currency_conversion_id !== undefined) {
				this.editmode = true;
				this.mode = "Edit";
				this.currency_conversion_id = params.currency_conversion_id;
				this.getCurrencyConvertData();
			} else {
				this.editmode = false;
				this.mode = "Add";
			}
		});

		this.CrudServices.getOne<any>(SpiplBankMaster.bankType, { bank_type: 1 }).subscribe((response) => {
			this.spipl_bank = response;
		});


	}

	ngOnInit() {
	}

	getCurrencyConvertData() {
		this.CrudServices.getOne(currencyConvert.getOne, {
			id: this.currency_conversion_id,
		}).subscribe(response => {

			this.currencyConvertForm.patchValue({
				bank_id: response[0].bank_id,
				from_date: response[0].from_date,
				to_date: response[0].to_date,
				amt_range_from: response[0].amt_range_from,
				amt_range_to: response[0].amt_range_to,
				variable_charges: response[0].variable_charges,
				min_charges: response[0].min_charges,
				max_charges: response[0].max_charges,

			});
		});

	}

	onSubmit() {
		if (!this.currencyConvertForm.invalid) {

			const formData = {

				bank_id: this.currencyConvertForm.value.bank_id,
				from_date: this.currencyConvertForm.value.from_date,
				to_date: this.currencyConvertForm.value.to_date,
				amt_range_from: this.currencyConvertForm.value.amt_range_from,
				amt_range_to: this.currencyConvertForm.value.amt_range_to,
				variable_charges: this.currencyConvertForm.value.variable_charges,
				min_charges: this.currencyConvertForm.value.min_charges,
				max_charges: this.currencyConvertForm.value.max_charges,


			};

			let body = {
				currencyConvertData: formData
			}
			if (this.editmode) {
				body["id"] = this.currency_conversion_id;
				this.CrudServices.updateData<any>(currencyConvert.update, body).subscribe(response => {
					this.toasterService.pop(response['message'], "Success", response['data']);
					if (response.code === "100") {

						this.onBack();
					}
				});
			} else {
				this.CrudServices.addData<any>(currencyConvert.add, body).subscribe(response => {
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

		this.router.navigate(["/masters/currency-convert"]);
	}

}
