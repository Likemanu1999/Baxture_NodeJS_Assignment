import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Params, ActivatedRoute, Router } from "@angular/router";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { ChargesStages, ChargesHeads } from "../../../shared/apis-path/apis-path";

@Component({
	selector: 'app-charges-head-master',
	templateUrl: './charges-head-master.component.html',
	styleUrls: ['./charges-head-master.component.scss'],
	providers: [CrudServices, ToasterService, PermissionService, LoginService]
})

export class ChargesHeadMasterComponent implements OnInit {

	chargesHeadsForm: FormGroup;
	data: any = [];
	stageList: any = [];
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
		this.getStages();
		this.loadData();
		this.initForms();
	}

	getStages() {
		this.crudServices.getAll<any>(ChargesStages.getAll).subscribe(res => {
			this.stageList = res.data;
		});
	}

	loadData() {
		this.addMode = true;
		this.editMode = false;
		this.isLoading = true;
		this.crudServices.getAll<any>(ChargesHeads.getAll).subscribe(res => {
			this.data = res.data;
			this.isLoading = false;
		});
	}

	initForms() {
		this.chargesHeadsForm = new FormGroup({
			stage_id: new FormControl(null, Validators.required),
			name: new FormControl(null, Validators.required)
		});
	}

	onEdit(id) {
		this.id = id;
		this.crudServices.getOne<any>(ChargesHeads.getOne, {
			id: id
		}).subscribe(res => {
			this.addMode = false;
			this.editMode = true;
			this.chargesHeadsForm.patchValue({
				stage_id: res.data[0].stage_id,
				name: res.data[0].name
			});
		});
	}

	onDelete(id) {
		let body = {
			id: id,
			message: "Charges Head Deleted"
		}
		this.crudServices.deleteData<any>(ChargesHeads.delete, body).subscribe(res => {
			this.toasterService.pop(res.message, res.message, res.data);
			this.loadData();
		});
	}

	onSubmit() {
		let body = {
			data: {
				stage_id: this.chargesHeadsForm.value.stage_id,
				name: this.chargesHeadsForm.value.name
			}
		};
		if (this.editMode) {
			body['id'] = this.id;
			body['message'] = "Charges Head Updated";
			this.crudServices.updateData<any>(ChargesHeads.update, body).subscribe(res => {
				this.toasterService.pop(res.message, res.message, res.data);
				this.chargesHeadsForm.reset();
				this.loadData();
			});
		} else {
			body['message'] = "New Charges Head Added";
			this.crudServices.addData<any>(ChargesHeads.add, body).subscribe(res => {
				this.toasterService.pop(res.message, res.message, res.data);
				this.chargesHeadsForm.reset();
				this.loadData();
			});
		}



	}
}
