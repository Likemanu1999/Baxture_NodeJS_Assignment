//START FROM HERE
import { Component, OnInit } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Params, ActivatedRoute, Router } from "@angular/router";
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { DataTable } from 'angular2-datatable';
import { packaging } from "../../../shared/apis-path/apis-path";
import { map } from 'rxjs/operators';


@Component({
	selector: 'app-packaging-master',
	templateUrl: './packaging-master.component.html',
	styleUrls: ['./packaging-master.component.scss'],
	providers: [CrudServices, ToasterService, LoginService, PermissionService, DataTable]
})
export class PackagingMasterComponent implements OnInit {

	packagingMasterForm: FormGroup;
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
		this.crudServices.getAll<any>(packaging.getAll).subscribe(res => {
			this.stageList = res.data;
		});
	}

	loadData() {
		this.addMode = true;
		this.editMode = false;
		this.isLoading = true;
		this.crudServices.getAll<any>(packaging.getAll).subscribe(res => {
			this.data = res.data;
			this.isLoading = false;
		});
	}

	initForms() {
		this.packagingMasterForm = new FormGroup({
			type: new FormControl(null, Validators.required),
			value: new FormControl(null, [
				Validators.required,
				Validators.pattern("^[0-9]*$"),
				Validators.minLength(1),
				Validators.maxLength(5)
			])
		});
	}

	onEdit(id) {
		this.id = id;
		this.crudServices.getOne<any>(packaging.getOne, {
			id: id
		}).subscribe(res => {
			this.addMode = false;
			this.editMode = true;
			this.packagingMasterForm.patchValue({
				type: res.data[0].type,
				value: res.data[0].value
			});
		});
	}

	onDelete(id) {
		let body = {
			id: id,
			message: "packaging master Deleted"
		}
		this.crudServices.deleteData<any>(packaging.delete, body).subscribe(res => {
			this.toasterService.pop(res.message, res.message, res.data);
			this.loadData();
		});
	}

	onSubmit() {

		let body = {
			data: {
				type: this.packagingMasterForm.value.type,
				value: this.packagingMasterForm.value.value,

			}
		};
		//alert("ONSUBMIT=>"+this.packagingMasterForm.value.type);
		if (this.editMode) {
			body['id'] = this.id;
			body['message'] = "Packaging Master Updated";
			this.crudServices.updateData<any>(packaging.update, body).subscribe(res => {
				this.toasterService.pop(res.message, res.message, res.data);
				this.packagingMasterForm.reset();
				this.loadData();
			});
		} else {
			// alert(body);
			this.crudServices.addData<any>(packaging.add, body).subscribe(res => {
				if (res.code == '100') {
					// alert("Someone send Someting new..!")
					body['message'] = "New packaging Master Added";
					this.toasterService.pop(res.message, res.message, res.data);
					// alert(res.message);
					// alert(res.data);

					this.packagingMasterForm.reset();
					this.loadData();
				}
			});
		}



	}

}
