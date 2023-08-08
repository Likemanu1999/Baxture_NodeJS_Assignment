import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { CrudServices } from '../../../../shared/crud-services/crud-services';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { taxReturnType, taxComplianceMaster } from '../../../../shared/apis-path/apis-path';
import { staticValues } from '../../../../shared/common-service/common-service';


@Component({
	selector: 'app-add-edit-tax-compliance-master',
	templateUrl: './add-edit-tax-compliance-master.component.html',
	styleUrls: ['./add-edit-tax-compliance-master.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		CrudServices,
	],
})
export class AddEditTaxComplianceMasterComponent implements OnInit {

	mode: string = "Add";
	box_title: string = "FLC Bank Charges";
	isLoading: boolean = false;
	editmode: boolean = false;
	taxComplianceMasterForm: FormGroup;
	tax_type_list: any;
	return_type_list: any;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});

	tax_compliance_master_id: any;
	public today = new Date();


	stateFlagStaticVal = staticValues.state_flag_tds;
	monthYearStaticVal = staticValues.month_year_tds;


	dateOfYear: boolean = true;
	dayOfMonth: boolean = true;

	constructor(private route: ActivatedRoute,
		private router: Router,
		private toasterService: ToasterService,
		private CrudServices: CrudServices) {

		this.taxComplianceMasterForm = new FormGroup({
			from_dt: new FormControl(null),
			to_dt: new FormControl(null),
			tax_type_id: new FormControl(0),
			return_type_id: new FormControl(0),
			state_flag: new FormControl(0),
			month_year_flag: new FormControl(0),
			date_of_year: new FormControl(null),
			day_of_month: new FormControl(0),


		});

		this.route.params.subscribe((params: Params) => {
			if (params.tax_compliance_master_id !== undefined) {
				this.editmode = true;
				this.mode = "Edit";
				this.tax_compliance_master_id = params.tax_compliance_master_id;
				this.getTaxComplianceMasterData();
			} else {
				this.editmode = false;
				this.mode = "Add";
			}
		});

		this.CrudServices.getAll<any>(taxReturnType.taxTypeAll).subscribe((response) => {
			this.tax_type_list = response;
		});
	}

	ngOnInit() {

	}

	getReturnType(event) {
		if (event && event !== undefined) {
			this.CrudServices.postRequest<any>(taxReturnType.get_return_from_tax_type, {
				tax_type_id: event.id
			}).subscribe((response) => {
				this.return_type_list = response;
			});
		} else {
			this.return_type_list = 0
		}
	}

	getReturnTypeEdit(id) {

		this.CrudServices.getOne<any>(taxReturnType.get_return_from_tax_type,
			{ tax_type_id: id }).subscribe(response => {
				this.return_type_list = response;
			});

	}
	getTaxComplianceMasterData() {

		this.CrudServices.getOne(taxComplianceMaster.get_one, {
			id: this.tax_compliance_master_id,
		}).subscribe(response => {
			if (response[0].date_of_year != null) {
				this.dateOfYear = false;
				this.dayOfMonth = true;
			} else if (response[0].day_of_month != null) {
				this.dateOfYear = true;
				this.dayOfMonth = false;
			} else {
				this.dateOfYear = true;
				this.dayOfMonth = true;
			}
			this.getReturnTypeEdit(response[0].tax_type_id);
			this.taxComplianceMasterForm.patchValue({

				from_dt: response[0].from_dt,
				to_dt: response[0].to_dt,
				tax_type_id: response[0].tax_type_id,
				return_type_id: response[0].return_type_id,
				state_flag: response[0].state_flag,
				month_year_flag: response[0].month_year_flag,
				date_of_year: response[0].date_of_year,
				day_of_month: response[0].day_of_month,


			});
		});

	}


	onSubmit() {
		if (!this.taxComplianceMasterForm.invalid) {

			const formData = {

				from_dt: this.taxComplianceMasterForm.value.from_dt,
				to_dt: this.taxComplianceMasterForm.value.to_dt,
				tax_type_id: this.taxComplianceMasterForm.value.tax_type_id,
				return_type_id: this.taxComplianceMasterForm.value.return_type_id,
				state_flag: this.taxComplianceMasterForm.value.state_flag,
				month_year_flag: this.taxComplianceMasterForm.value.month_year_flag,
				date_of_year: this.taxComplianceMasterForm.value.date_of_year,
				day_of_month: this.taxComplianceMasterForm.value.day_of_month,



			};

			let body = {
				taxComplianceMasterData: formData
			}
			if (this.editmode) {
				body["id"] = this.tax_compliance_master_id;
				this.CrudServices.updateData<any>(taxComplianceMaster.update, body).subscribe(response => {
					this.toasterService.pop(response['message'], "Success", response['data']);
					if (response.code === "100") {

						this.onBack();
					} else {
						this.toasterService.pop(response['message'], "Success", response['data']);
					}
				});
			} else {
				this.CrudServices.addData<any>(taxComplianceMaster.add, body).subscribe(response => {
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

		this.router.navigate(["/hr/tax-compliance"]);
	}

	onChangeMonthYear(event) {
		if (event.id == 1) //Month
		{

			this.dateOfYear = true;
			this.dayOfMonth = false;

		} else if (event.id == 2) //Year
		{
			this.dateOfYear = false;
			this.dayOfMonth = true;
		} else {
			this.dateOfYear = true;
			this.dayOfMonth = true;
		}
	}

}
