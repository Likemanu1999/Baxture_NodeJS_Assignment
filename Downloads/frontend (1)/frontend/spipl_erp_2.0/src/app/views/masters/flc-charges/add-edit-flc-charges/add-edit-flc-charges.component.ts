import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { flcCharges, SpiplBankMaster } from '../../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../../shared/crud-services/crud-services';

@Component({
	selector: 'app-add-edit-flc-charges',
	templateUrl: './add-edit-flc-charges.component.html',
	styleUrls: ['./add-edit-flc-charges.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		CrudServices,
	],
})
export class AddEditFlcChargesComponent implements OnInit {
	mode: string = "Add";
	box_title: string = "FLC Bank Charges";
	isLoading: boolean = false;
	editmode: boolean = false;
	flcChargesForm: FormGroup;
	spipl_bank: any;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});

	flc_charges_id: any;
	public today = new Date();


	constructor(private route: ActivatedRoute,
		private router: Router,
		private toasterService: ToasterService,
		private CrudServices: CrudServices) {

		this.flcChargesForm = new FormGroup({
			bank_id: new FormControl(null, Validators.required),
			from_date: new FormControl(null, Validators.required),
			to_date: new FormControl(null),
			lc_ammend_clause: new FormControl(null),
			lc_ammend_swift: new FormControl(null),
			lc_open_first_qtr: new FormControl(null),
			lc_open_after_qtr_per_month: new FormControl(null),
			lc_open_per_annum: new FormControl(null),
			lc_open_concession: new FormControl(null),
			lc_open_concession_exceed: new FormControl(null),
			lc_open_at_sight_bob_first_qtr: new FormControl(null),
			lc_open_at_sight_bob_after_qtr_per_month: new FormControl(null),
			lc_open_swift: new FormControl(null),
			nonlc_remittance: new FormControl(null),
			nonlc_remittance_min_value: new FormControl(null),
			nonlc_remittance_max_value: new FormControl(null),
			nonlc_remittance_swift: new FormControl(null),
			remitance: new FormControl(null),
			remittance_swift: new FormControl(null),
			supplier_remit_percentage: new FormControl(null),
			supplier_remit_min: new FormControl(null),
			supplier_remit_max: new FormControl(null),
			supplier_usance_swift: new FormControl(null),
			confirmation_swift: new FormControl(null),
			roll_over_interest_swift: new FormControl(null),
			roll_over_remittance_swift: new FormControl(null),
			discrepancy: new FormControl(null),
			lou: new FormControl(null),
			sblc: new FormControl(null),
			forward_booking: new FormControl(null)
		});

		this.route.params.subscribe((params: Params) => {
			if (params.flc_charges_id !== undefined) {
				this.editmode = true;
				this.mode = "Edit";
				this.flc_charges_id = params.flc_charges_id;
				this.getFlcData();
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

	getFlcData() {
		this.CrudServices.getOne(flcCharges.getOne, {
			id: this.flc_charges_id,
		}).subscribe(response => {

			this.flcChargesForm.patchValue({

				bank_id: response[0].bank_id,
				from_date: response[0].from_date,
				to_date: response[0].to_date,
				lc_ammend_clause: response[0].lc_ammend_clause,
				lc_ammend_swift: response[0].lc_ammend_swift,
				lc_open_first_qtr: response[0].lc_open_first_qtr,
				lc_open_after_qtr_per_month: response[0].lc_open_after_qtr_per_month,
				lc_open_per_annum: response[0].lc_open_per_annum,
				lc_open_concession: response[0].lc_open_concession,
				lc_open_concession_exceed: response[0].lc_open_concession_exceed,
				lc_open_at_sight_bob_first_qtr: response[0].lc_open_at_sight_bob_first_qtr,
				lc_open_at_sight_bob_after_qtr_per_month: response[0].lc_open_at_sight_bob_after_qtr_per_month,
				lc_open_swift: response[0].lc_open_swift,
				nonlc_remittance: response[0].nonlc_remittance,
				nonlc_remittance_min_value: response[0].nonlc_remittance_min_value,
				nonlc_remittance_max_value: response[0].nonlc_remittance_max_value,
				nonlc_remittance_swift: response[0].nonlc_remittance_swift,
				remitance: response[0].remitance,
				remittance_swift: response[0].remittance_swift,
				supplier_remit_percentage: response[0].supplier_remit_percentage,
				supplier_remit_min: response[0].supplier_remit_min,
				supplier_remit_max: response[0].supplier_remit_max,
				supplier_usance_swift: response[0].supplier_usance_swift,
				confirmation_swift: response[0].confirmation_swift,
				roll_over_interest_swift: response[0].roll_over_interest_swift,
				roll_over_remittance_swift: response[0].roll_over_remittance_swift,
				discrepancy: response[0].discrepancy,
				lou: response[0].lou,
				sblc: response[0].sblc,
				forward_booking: response[0].forward_booking,
			});
		});
	}

	onSubmit() {
		if (!this.flcChargesForm.invalid) {

			const formData = {

				bank_id: this.flcChargesForm.value.bank_id,
				from_date: this.flcChargesForm.value.from_date,
				to_date: this.flcChargesForm.value.to_date,
				lc_ammend_clause: this.flcChargesForm.value.lc_ammend_clause,
				lc_ammend_swift: this.flcChargesForm.value.lc_ammend_swift,
				lc_open_first_qtr: this.flcChargesForm.value.lc_open_first_qtr,
				lc_open_after_qtr_per_month: this.flcChargesForm.value.lc_open_after_qtr_per_month,
				lc_open_per_annum: this.flcChargesForm.value.lc_open_per_annum,
				lc_open_concession: this.flcChargesForm.value.lc_open_concession,
				lc_open_concession_exceed: this.flcChargesForm.value.lc_open_concession_exceed,
				lc_open_at_sight_bob_first_qtr: this.flcChargesForm.value.lc_open_at_sight_bob_first_qtr,
				lc_open_at_sight_bob_after_qtr_per_month: this.flcChargesForm.value.lc_open_at_sight_bob_after_qtr_per_month,
				lc_open_swift: this.flcChargesForm.value.lc_open_swift,
				nonlc_remittance: this.flcChargesForm.value.nonlc_remittance,
				nonlc_remittance_min_value: this.flcChargesForm.value.nonlc_remittance_min_value,
				nonlc_remittance_max_value: this.flcChargesForm.value.nonlc_remittance_max_value,
				nonlc_remittance_swift: this.flcChargesForm.value.nonlc_remittance_swift,
				remitance: this.flcChargesForm.value.remitance,
				remittance_swift: this.flcChargesForm.value.remittance_swift,
				supplier_remit_percentage: this.flcChargesForm.value.supplier_remit_percentage,
				supplier_remit_min: this.flcChargesForm.value.supplier_remit_min,
				supplier_remit_max: this.flcChargesForm.value.supplier_remit_max,
				supplier_usance_swift: this.flcChargesForm.value.supplier_usance_swift,
				confirmation_swift: this.flcChargesForm.value.confirmation_swift,
				roll_over_interest_swift: this.flcChargesForm.value.roll_over_interest_swift,
				roll_over_remittance_swift: this.flcChargesForm.value.roll_over_remittance_swift,
				discrepancy: this.flcChargesForm.value.discrepancy,
				lou: this.flcChargesForm.value.lou,
				sblc: this.flcChargesForm.value.sblc,
				forward_booking: this.flcChargesForm.value.forward_booking,

			};

			let body = {
				flcChargesData: formData
			}
			if (this.editmode) {
				body["id"] = this.flc_charges_id;
				this.CrudServices.updateData<any>(flcCharges.update, body).subscribe(response => {
					this.toasterService.pop(response['message'], "Success", response['data']);
					if (response.code === "100") {

						this.onBack();
					}
				});
			} else {
				this.CrudServices.addData<any>(flcCharges.add, body).subscribe(response => {
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

		this.router.navigate(["/masters/flc-charges"]);
	}


}
