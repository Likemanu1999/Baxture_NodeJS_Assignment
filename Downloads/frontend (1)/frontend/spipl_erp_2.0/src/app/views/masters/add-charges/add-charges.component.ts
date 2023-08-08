import { ChargesHeads, ChargesMasters, SpiplBankMaster } from "../../../shared/apis-path/apis-path";
import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterConfig, ToasterService } from "angular2-toaster";

import { Calculations } from "../../../shared/calculations/calculations";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { DatePipe } from "@angular/common";
import { LoginService } from "../../login/login.service";
import { Router } from "@angular/router";
import { staticValues } from "../../../shared/common-service/common-service";

@Component({
	selector: 'app-add-charges',
	templateUrl: './add-charges.component.html',
	styleUrls: ['./add-charges.component.scss'],
	providers: [CrudServices, Calculations, ToasterService, DatePipe, LoginService]
})

export class AddChargesComponent implements OnInit {

	user: any;
	bankType: number = 1;
	isLoading: boolean = false;
	chargesForm: FormGroup;
	chargesTypesList = staticValues.charges_types;
	datePickerConfig = staticValues.datePickerConfig;
	banksList: any = [];

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	constructor(private fb: FormBuilder,
		private toasterService: ToasterService,
		private router: Router,
		private crudServices: CrudServices
	) {
		// 
	}

	ngOnInit() {
		this.loadData();
		this.initForms();
	}

	initForms() {
		this.chargesForm = this.fb.group({
			bank_id: new FormControl(null, Validators.required),
			from_date: new FormControl(null, Validators.required),
			to_date: new FormControl(null, Validators.required),
			chargesArr: new FormArray([])
		});
	}

	get f() { return this.chargesForm.controls; }
	get c() { return this.f.chargesArr as FormArray; }

	loadData() {
		this.getBanks();
		this.getChargesHeads();
	}

	getBanks() {
		this.crudServices.getOne<any>(SpiplBankMaster.getOne, {
			bank_type: this.bankType
		}).subscribe(res => {
			this.banksList = res;
		});
	}

	getChargesHeads() {
		this.crudServices.getAll<any>(ChargesHeads.getAll).subscribe(res => {
			for (let i = 0; i < res.data.length; i++) {
				this.c.push(this.fb.group({
					head_id: res.data[i].id,
					stage_name: res.data[i].charges_stage_master.name,
					head_name: res.data[i].name,
					charges: [null],
					charges_type: [null]
				}));
			}
		});
	}

	onChangeBank(value) {
		// 
	}

	onSubmit() {
		let bank_id = this.chargesForm.value.bank_id;
		let from_date = this.chargesForm.value.from_date;
		let to_date = this.chargesForm.value.to_date;
		let chargesArr = this.chargesForm.value.chargesArr;
		let data = [];
		chargesArr.forEach(element => {
			if (element.charges != null && element.charges > 0) {
				data.push({
					bank_id: bank_id,
					head_id: element.head_id,
					from_date: from_date,
					to_date: to_date,
					charges: element.charges,
					charges_type: element.charges_type
				});
			}
		});
		if (bank_id != null && from_date != null && to_date != null && data.length > 0) {
			this.saveData(data);
		} else {
			this.toasterService.pop("error", "Alert", "Failed to add New Charges");
		}
	}

	saveData(data) {
		let body = {
			data: data,
			type: "Bulk"
		};
		this.crudServices.addData<any>(ChargesMasters.add, body).subscribe(res => {
			if (res.code == "100") {
				this.toasterService.pop("success", "Success", "New Charges Added");
				this.goBack();
			} else {
				this.toasterService.pop("error", "Alert", "Failed to add New Charges");
			}
		});
	}

	goBack() {
		this.router.navigate(["masters/charges"]);
	}

}
