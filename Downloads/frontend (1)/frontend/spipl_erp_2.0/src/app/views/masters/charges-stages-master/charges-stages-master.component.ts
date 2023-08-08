import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Params, ActivatedRoute, Router } from "@angular/router";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { ChargesStages, ChargesStageTypes } from "../../../shared/apis-path/apis-path";

@Component({
	selector: 'app-charges-stages-master',
	templateUrl: './charges-stages-master.component.html',
	styleUrls: ['./charges-stages-master.component.css'],
	providers: [CrudServices, ToasterService, PermissionService, LoginService]
})

export class ChargesStagesMasterComponent implements OnInit {

	chargesStagesForm: FormGroup;
	data: any = [];
	stageTypesList: any = [];
	isLoading: boolean = false;
	filterQuery: any = '';
	addMode: boolean = true;
	editMode: boolean = false;
	id: any;

	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'bottom';
	public closeOnOutsideClick: boolean = true;

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
		this.getStageTypes();
		this.loadData();
		this.initForms();
	}

	getStageTypes() {
		this.crudServices.getAll<any>(ChargesStageTypes.getAll).subscribe(res => {
			this.stageTypesList = res.data;
		});
	}

	loadData() {
		this.addMode = true;
		this.editMode = false;
		this.isLoading = true;
		this.crudServices.getAll<any>(ChargesStages.getAll).subscribe(res => {
			this.data = res.data;
			this.isLoading = false;
		});
	}

	initForms() {
		this.chargesStagesForm = new FormGroup({
			name: new FormControl(null, Validators.required),
			type: new FormControl(null, Validators.required),
		});
	}

	onEdit(id) {
		this.id = id;
		this.crudServices.getOne<any>(ChargesStages.getOne, {
			id: id
		}).subscribe(res => {
			this.addMode = false;
			this.editMode = true;
			this.chargesStagesForm.patchValue({
				name: res.data[0].name,
				type: res.data[0].type
			});
		});
	}

	onDelete(id) {
		let body = {
			id: id,
			message: "Charges Stage Deleted"
		}
		this.crudServices.deleteData<any>(ChargesStages.delete, body).subscribe(res => {
			this.toasterService.pop(res.message, res.message, res.data);
			this.loadData();
		});
	}

	onSubmit() {
		let body = {
			data: {
				name: this.chargesStagesForm.value.name,
				type: this.chargesStagesForm.value.type
			}
		};
		if (this.editMode) {
			body['id'] = this.id;
			body['message'] = "Charges Stage Updated";
			this.crudServices.updateData<any>(ChargesStages.update, body).subscribe(res => {
				this.toasterService.pop(res.message, res.message, res.data);
				this.chargesStagesForm.reset();
				this.loadData();
			});
		} else {
			body['message'] = "New Charges Stage Added";
			this.crudServices.addData<any>(ChargesStages.add, body).subscribe(res => {
				this.toasterService.pop(res.message, res.message, res.data);
				this.chargesStagesForm.reset();
				this.loadData();
			});
		}
	}

}
