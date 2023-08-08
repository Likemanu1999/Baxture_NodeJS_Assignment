import { CommonApis, FdLinking } from '../../../shared/apis-path/apis-path';
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';

import { CrudServices } from '../../../shared/crud-services/crud-services';
import { DatePipe } from '@angular/common';
import { ExportService } from '../../../shared/export-service/export-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';

@Component({
	selector: 'app-link-fd',
	templateUrl: './link-fd.component.html',
	styleUrls: ['./link-fd.component.css'],
	providers: [ToasterService, PermissionService, ExportService, DatePipe, CrudServices],
	encapsulation: ViewEncapsulation.None
})
export class LinkFdComponent implements OnInit {
	newFdForm: FormGroup;
	@Input() FDarray: any;
	@Output() emitFunctionOfPi: EventEmitter<any> = new EventEmitter<any>();
	arrayType = [];
	invoiceArr: any = [];
	currency: any = [];
	type: number;
	enableField: boolean;
	invoiceTypeid: any;
	rateCurrField: boolean = true;
	fd_id: any;


	/**
	* Configuring toaster.
	*/
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	constructor(

		private datePipe: DatePipe,
		private tosterService: ToasterService,
		private crudServices: CrudServices) {

	}

	ngOnInit() {

		this.fd_id = this.FDarray.id;



		this.crudServices.getAll<any>(CommonApis.getAllCurrency).subscribe(response => {

			this.currency = response;
		})


		this.newFdForm = new FormGroup({

			amount_inr: new FormControl(0),
			type: new FormControl(1),
			typeflp: new FormControl(null),
			currency_rate: new FormControl(76),
			currency_type_amount: new FormControl(0),
			currency_id: new FormControl(0),
			invoice_id: new FormControl(null, Validators.required),



		});
		this.onTypeCheck();



	}

	onTypeCheck() {
		this.type = this.newFdForm.value.type;
		this.resetForm();
		this.newFdForm.controls.typeflp.reset();
		this.enableField = false;
		if (this.type == 1) {
			this.arrayType = [{ id: 1, value: "Lc" }, { id: 2, value: "ILC" }];
			this.enableField = false;
		} else if (this.type == 2) {
			this.arrayType = [{ id: 3, value: "Bill Of Exchange" }, { id: 4, value: "Non" }, { id: 5, value: "Non LC" }];
			this.enableField = true;
		} else {
			this.resetForm();
		}

	}

	resetForm() {
		this.newFdForm.controls.currency_id.reset();
		
		this.newFdForm.controls.currency_type_amount.reset();
		this.newFdForm.controls.amount_inr.reset();
		this.newFdForm.controls.invoice_id.reset();

		// this.newFdForm.controls.currency_rate.reset();
		this.newFdForm.patchValue({currency_rate : 76});

	}


	getAllInvoices(event) {
		this.resetForm();

		this.crudServices.getAll<any>(FdLinking.getAllInvoices).subscribe(response => {

			if (event) {
				this.invoiceTypeid = event.id;

				if (event.id == 1) {

					this.invoiceArr = response[0].lcList;

					
					this.newFdForm.get('currency_type_amount').setValidators(null);
					this.newFdForm.get('currency_id').setValidators(null);
					this.newFdForm.get('currency_rate').setValidators(null);
					this.newFdForm.get('currency_inr').setValidators(null);
				} else if (event.id == 2) {

					this.invoiceArr = response[0].ilcList;
					this.newFdForm.get('currency_type_amount').setValidators(null);
					this.newFdForm.get('currency_id').setValidators(null);
					this.newFdForm.get('currency_rate').setValidators(null);
					this.newFdForm.get('currency_inr').setValidators(null);
				} else if (event.id == 3) {
					this.rateCurrField = false;
					this.invoiceArr = response[0].bexList;
					this.newFdForm.get('currency_type_amount').setValidators(Validators.required);

					this.newFdForm.get('currency_id').setValidators(null);
					this.newFdForm.get('currency_rate').setValidators(null);
					this.newFdForm.get('currency_inr').setValidators(null);
				} else if (event.id == 4) {
					this.rateCurrField = true;
					this.invoiceArr = response[0].nonList;
					this.newFdForm.get('currency_type_amount').setValidators(Validators.required);
					this.newFdForm.get('currency_id').setValidators(Validators.required);
					this.newFdForm.get('currency_rate').setValidators(Validators.required);
					this.newFdForm.get('currency_inr').setValidators(Validators.required);
				}
				else if (event.id == 5) {
					this.rateCurrField = true;
					this.invoiceArr = response[0].nonLcList;
					this.newFdForm.get('currency_type_amount').setValidators(Validators.required);
					this.newFdForm.get('currency_id').setValidators(Validators.required);
					this.newFdForm.get('currency_rate').setValidators(Validators.required);
					this.newFdForm.get('currency_inr').setValidators(Validators.required);
				}



			}

		})
	}

	onChangeInvoice(event) {

		if (event) {
			this.newFdForm.controls.currency_type_amount.setValue(event.amount);
			this.newFdForm.controls.currency_id.setValue(event.currency_id);
			this.newFdForm.controls.currency_rate.reset();
			this.newFdForm.controls.amount_inr.reset();

			this.newFdForm.patchValue({currency_rate : 76});

		}
	}

	// calculateAmount() {


	// 	const amount = this.newFdForm.controls.currency_type_amount.value;
	// 	const rate = this.newFdForm.controls.currency_rate.value;

	// 	if (amount != undefined && rate != undefined && amount != '' && rate != '') {
	// 		const amountInr = amount * rate;
	// 		this.newFdForm.controls.amount_inr.setValue(amountInr);
	// 	} else {
	// 		this.newFdForm.controls.amount_inr.setValue(0);
	// 	}

	// }

	calculateAmount() {

		const type = this.newFdForm.controls.typeflp.value;
		const amount = this.newFdForm.controls.currency_type_amount.value;
		const rate = this.newFdForm.controls.currency_rate.value;
		const amt_inr = this.newFdForm.controls.amount_inr.value;
	
		if(type != 3) {
			if (amt_inr != undefined && rate != undefined && amt_inr != '' && rate != '') {
				const amountInr = amt_inr / rate;
				this.newFdForm.controls.currency_type_amount.setValue(amountInr);
				
			} else {
				this.newFdForm.controls.currency_type_amount.setValue(0);
			}
		}

	}

	onSubmit() {


		let data = {};
		if (this.invoiceTypeid == 1) {
			data = {
				letter_of_credit_id: this.newFdForm.controls.invoice_id.value
			}
		}

		if (this.invoiceTypeid == 2) {
			data = {
				inland_letter_of_credit_id: this.newFdForm.controls.invoice_id.value
			}
		}

		if (this.invoiceTypeid == 3) {

			data = {
				bill_of_exchange_id: this.newFdForm.controls.invoice_id.value,
				currency_type_amount: this.newFdForm.controls.currency_type_amount.value,

			}
		}


		if (this.invoiceTypeid == 4) {
			data = {
				non_negotiable_id: this.newFdForm.controls.invoice_id.value,
				currency_id: this.newFdForm.controls.currency_id.value,
				currency_rate: this.newFdForm.controls.currency_rate.value,
				currency_type_amount: this.newFdForm.controls.currency_type_amount.value,
				amount_inr: this.newFdForm.controls.amount_inr.value,

			}
		}

		if (this.invoiceTypeid == 5) {
			data = {
				nonlc_id: this.newFdForm.controls.invoice_id.value,
				currency_id: this.newFdForm.controls.currency_id.value,
				currency_rate: this.newFdForm.controls.currency_rate.value,
				currency_type_amount: this.newFdForm.controls.currency_type_amount.value,
				amount_inr: this.newFdForm.controls.amount_inr.value,

			}
		}


		if (data) {

			data['fd_id'] = this.fd_id;
			let status = true;
			const balance = this.FDarray.fd_amt - this.FDarray.fd_linking_amt;
			if (this.invoiceTypeid != 1 && this.invoiceTypeid != 2) {

				if (this.invoiceTypeid == 3) {
					if (balance >= this.newFdForm.controls.currency_type_amount.value) {
						status = true;
					} else {
						status = false;
					}
				} else {
					if (balance >= this.newFdForm.controls.amount_inr.value) {
						status = true;
					} else {
						status = false;
					}
				}
			}
			if (status) {
				this.crudServices.addData<any>(FdLinking.add, data).subscribe(response => {
          if(response.code == '100') {
            this.tosterService.pop(response.message, response.message, response.data);

            setTimeout(() => {
              this.onBack();
            }, 2000);
          } else {
            this.tosterService.pop('error', 'error', 'Something Went Wrong');

          }

				})
			} else {
				this.tosterService.pop('error', 'error', 'amount Exceed Balance Amount');
				// this.resetForm();
			}

		}





	}

	onBack() {
		this.emitFunctionOfPi.emit(false);
	}




}
