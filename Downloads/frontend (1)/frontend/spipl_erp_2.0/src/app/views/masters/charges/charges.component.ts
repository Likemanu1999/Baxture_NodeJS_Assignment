import { Component, OnInit, ViewEncapsulation, ViewChild, Input, ViewChildren, ElementRef } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Params, ActivatedRoute, Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { ChargesHeads, ChargesMasters, ChargesStages, ChargesStageTypes, SpiplBankMaster } from "../../../shared/apis-path/apis-path";
import { staticValues } from "../../../shared/common-service/common-service";

@Component({
	selector: 'app-charges',
	templateUrl: './charges.component.html',
	styleUrls: ['./charges.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, LoginService]
})

export class ChargesComponent implements OnInit {

	@ViewChild("chargesModal", { static: false }) chargesModal: ModalDirective;

	public popoverTitle: string = "Warning";
	public popoverMessage: string = "Are you sure, you want to Change?";
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = "Yes";
	public cancelText: string = "No";
	public placement: string = "left";
	public closeOnOutsideClick: boolean = true;

	chargesForm: FormGroup;
	chargesData: any = [];
	banksList: any = [];
	chargesHeadsList: any = [];
	cols: any = [];
	selectedColumns: any = [];
	charges_id: any = null;
	isLoading: boolean = false;
	filterQuery: any = '';
	filteredValuess: any[];

	chargesTypesList = staticValues.charges_types;
	datePickerConfig = staticValues.datePickerConfig;

	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	constructor(private fb: FormBuilder,
		toasterService: ToasterService,
		private route: ActivatedRoute,
		private router: Router,
		private crudServices: CrudServices
	) {
		this.toasterService = toasterService;
	}

	ngOnInit() {
		this.getBanks();
		this.getChargesHeads();
		this.loadData();
		this.initForms();

		this.cols = [
			{ field: "bank_name", header: "Bank", permission: true },
			{ field: "stage_name", header: "Stage", permission: true },
			{ field: "head_name", header: "Head", permission: true },
			{ field: "charges", header: "Charges", permission: true },
			{ field: "from_date", header: "From", permission: true },
			{ field: "to_date", header: "To", permission: true },
			{ field: "action", header: "Action", permission: true },
		];
		this.selectedColumns = this.cols;
	}

	initForms() {
		this.chargesForm = new FormGroup({
			bank_id: new FormControl(null, Validators.required),
			head_id: new FormControl(null, Validators.required),
			charges: new FormControl(null, Validators.required),
			charges_type: new FormControl(null, Validators.required),
			from_date: new FormControl(null, Validators.required),
			to_date: new FormControl(null, Validators.required)
		});
	}

	getBanks() {
		this.crudServices.getAll<any>(SpiplBankMaster.getAll).subscribe(res => {
			this.banksList = res;
		});
	}

	getChargesHeads() {
		this.crudServices.getAll<any>(ChargesHeads.getAll).subscribe(res => {
			this.chargesHeadsList = res.data;
		});
	}

	loadData() {
		this.isLoading = true;
		this.crudServices.getAll<any>(ChargesMasters.getAll).subscribe(res => {
			let data = [];
			res.data.forEach(element => {
				let charges = "";
				if (element.charges_type == 1) {
					charges = element.charges + "%"
				} else {
					charges = "Rs. " + element.charges + "/-"
				}
				data.push({
					id: element.id,
					bank_id: element.spipl_bank.id,
					bank_name: element.spipl_bank.bank_name,
					stage_type: element.charges_heads_master.charges_stage_master.charges_stage_type_ma,
					stage_name: element.charges_heads_master.charges_stage_master.name,
					head_id: element.charges_heads_master.id,
					head_name: element.charges_heads_master.name,
					charges: charges,
					charges_type: element.charges_type,
					from_date: element.from_date,
					to_date: element.to_date,
				});
			});
			this.chargesData = data;
			this.isLoading = false;
		});
	}

	addCharges() {
		this.router.navigate(["masters/add-charges"]);
	}

	openEditChargesModal(id) {
		this.crudServices.getOne<any>(ChargesMasters.getOne, {
			id: id
		}).subscribe(res => {
			this.charges_id = id;
			this.chargesForm.patchValue({
				bank_id: res.data[0].bank_id,
				head_id: res.data[0].head_id,
				charges: res.data[0].charges,
				charges_type: Number(res.data[0].charges_type),
				from_date: res.data[0].from_date,
				to_date: res.data[0].to_date,
			});
		});
		this.chargesModal.show();
	}

	viewCharges(id) {
		this.crudServices.getOne<any>(ChargesMasters.getOne, {
			id: id
		}).subscribe(res => {
			// 
		});
	}

	onDelete(id) {
		let body = {
			id: id,
			message: "Charges Deleted"
		}
		this.crudServices.deleteData<any>(ChargesMasters.delete, body).subscribe(res => {
			this.toasterService.pop(res.message, res.message, res.data);
			this.loadData();
		});
	}

	onSubmit() {
		let body = {
			data: {
				bank_id: this.chargesForm.value.bank_id,
				head_id: this.chargesForm.value.head_id,
				charges: this.chargesForm.value.charges,
				charges_type: this.chargesForm.value.charges_type,
				from_date: this.chargesForm.value.from_date,
				to_date: this.chargesForm.value.to_date
			}
		};
		body['id'] = this.charges_id;
		body['message'] = "Charges Updated";
		this.crudServices.updateData<any>(ChargesMasters.update, body).subscribe(res => {
			this.toasterService.pop(res.message, res.message, res.data);
			this.chargesModal.hide();
			this.loadData();
		});
	}

	onFilter(event, dt) {
		this.filteredValuess = event.filteredValue;
	}
}
