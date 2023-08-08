import { Component, OnInit, ViewEncapsulation, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../../shared/pemission-services/pemission-service';

import { LoginService } from '../../../login/login.service';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SpiplBankService } from '../../../masters/spipl-bank-master/spipl-bank-service';
import { IlcService } from '../ilc-service';
import { CrudServices } from '../../../../shared/crud-services/crud-services';
import { Ilc_Loc, SpiplBankMaster } from '../../../../shared/apis-path/apis-path';
import { UserDetails } from '../../../login/UserDetails.model';


@Component({
	selector: 'app-ilc-creation',
	templateUrl: './ilc-creation.component.html',
	styleUrls: ['./ilc-creation.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		PermissionService,
		LoginService,
		DatePipe,
		ToasterService,
		SpiplBankService,
		IlcService,
		CrudServices

	]
})
export class ILcCreationComponent implements OnInit {

	@Input() mode: string;
	@Input() pi_arr: any[];
	@Output() ilc_loc_back: EventEmitter<any> = new EventEmitter<any>();
	createLcForm: FormGroup;

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	ilc_date: string;
	spipl_bank_id: number;
	latest_date_of_shipment: string;
	ilc_expiry_date: string;
	advising_bank_id: number;
	negotiating_bank_id: number;
	transhipment: number;
	partial_shipment: number;
	supplierName: string;
	totalAmount: number;
	totalQuantity: number;
	ilc_id: number;
	transship = [];
	banks = [];
	pi_id_list = [];
	ourBank = [];
	advisingBank = [];
	negotiatingBank = [];

	lc_editor: boolean = false;
	ilc_arr: any[];
	pi_arr_details: any[];
  toleranceValue: any;
	company_id: any;
	role_id: any;
	user: UserDetails;



	constructor(private permissionService: PermissionService,
		private datePipe: DatePipe,
		private toasterService: ToasterService,
		private fb: FormBuilder,
		private crudServices: CrudServices,
		private loginService: LoginService,

	) {

		this.user = this.loginService.getUserDetails();
		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;


		this.createLcForm = this.fb.group({
			ilc_date: new FormControl(null, Validators.required),
			spipl_bank_id: new FormControl(null, Validators.required),
			latest_date_of_shipment: new FormControl(null, Validators.required),
			ilc_expiry_date: new FormControl(null, Validators.required),
			advising_bank_id: new FormControl(null, Validators.required),
			negotiating_bank_id: new FormControl(null, Validators.required),
			transhipment: new FormControl(null, Validators.required),
			partial_shipment: new FormControl(null, Validators.required),
			tolerance: new FormControl(null, Validators.required),
		});

		this.transship = [{ 'id': 1, 'name': 'ALLOWED' }, { 'id': 2, 'name': 'NOT ALLOWED' }];

		this.crudServices.getAll<any>(SpiplBankMaster.getAll).subscribe(result => {
			result.forEach(element => {
				if (element['bank_type'] === 1) {
					this.ourBank.push(element);
				} else if (element['bank_type'] === 2) {
					this.advisingBank.push(element);
				} else if (element['bank_type'] === 3) {
					this.negotiatingBank.push(element);
				}
			});
		});
	}

	ngOnInit() {
		if (this.mode === 'Create') {
			this.supplierName = this.pi_arr[0].sub_org_name;
			this.totalAmount = this.pi_arr.reduce((sum, item) => sum + Number(item.amount_utilized_lc), 0);
			this.totalQuantity = this.pi_arr.reduce((sum, item) => sum + Number(item.quantity_utilized_lc), 0);

			this.pi_arr.forEach(element => {
				this.pi_id_list.push({ pi_id: element.id, pi_quantity: element.quantity_utilized_lc });
			});
			this.pi_arr_details = this.pi_arr;
		}

		if (this.mode === 'Edit') {
			this.supplierName = this.pi_arr[0].Supplier_Name;
			this.totalAmount = this.pi_arr[0].lcAmount;
			this.totalQuantity = this.pi_arr[0].lcQuantity;
			this.pi_arr_details = this.pi_arr[0].pi_details;

			this.ilc_date = this.pi_arr[0].ilc_date;
			this.spipl_bank_id = this.pi_arr[0].spipl_bank_id;
			this.latest_date_of_shipment = this.pi_arr[0].latest_date_of_shipment;
			this.advising_bank_id = this.pi_arr[0].advising_bank_id;
			this.negotiating_bank_id = this.pi_arr[0].negotiating_bank_id;
			this.transhipment = this.pi_arr[0].transhipment;
			this.partial_shipment = this.pi_arr[0].partial_shipment;
			this.ilc_expiry_date = this.pi_arr[0].ilc_expiry_date;
			this.ilc_id = this.pi_arr[0].id;
			this.toleranceValue = this.pi_arr[0].tolerance;




		}

	}


	onSubmit() {
		var data = {
			ilc_date: this.convert(this.createLcForm.value.ilc_date),
			spipl_bank_id: this.createLcForm.value.spipl_bank_id,
			latest_date_of_shipment: this.convert(this.createLcForm.value.latest_date_of_shipment),
			ilc_expiry_date: this.convert(this.createLcForm.value.ilc_expiry_date),
			advising_bank_id: this.createLcForm.value.advising_bank_id,
			negotiating_bank_id: this.createLcForm.value.negotiating_bank_id,
			transhipment: this.createLcForm.value.transhipment,
			partial_shipment: this.createLcForm.value.partial_shipment,
			tolerance: this.createLcForm.value.tolerance,
			company_id : this.company_id,
			pi_arr: JSON.stringify(this.pi_id_list),
			ilc_id: this.ilc_id,

		}


		if (this.mode === 'Create') {
			this.crudServices.addData<any>(Ilc_Loc.add, data).subscribe(response => {
				this.toasterService.pop(response.message, response.message, response.data);
				if (response.ilc_id) {
					this.getList(response.ilc_id);

				}

			});

		} else if (this.mode === 'Edit') {
			this.crudServices.updateData<any>(Ilc_Loc.update, data).subscribe(response => {
				this.toasterService.pop(response.message, response.message, response.data);
				if (response.ilc_id) {
					this.getList(response.ilc_id);
				}

			});

		}

	}



	getList(id) {
		this.crudServices.getOne<any>(Ilc_Loc.getAll, {
			ilc_id: id
		}).subscribe(ilc_array => {

			this.ilc_arr = ilc_array;
      console.log(this.ilc_arr);

			this.lc_editor = true;
		});
	}

	convert(date) {
		return this.datePipe.transform(date, 'yyyy-MM-dd');
	}

	onBack() {
		this.ilc_loc_back.emit(false);
	}

	lastDateCalculate(val, date) {
		if (date) {
			const latest_date = this.convert(date);
			const someDate = new Date(latest_date);
			const days = val.target.value;

			someDate.setDate(someDate.getDate() + Number(days)); // number  of days to add, e.x. 15 days
			const dateFormated = someDate.toISOString().substr(0, 10);
			this.createLcForm.controls['ilc_expiry_date'].setValue(dateFormated);
			// this.ilc_expiry_date = dateFormated;

		}
	}

}
