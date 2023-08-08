import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
// import { UnitTableData, UnitService } from './unit-service';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ReturnType, TaxType } from '../../../shared/apis-path/apis-path';

@Component({
	selector: 'app-compl-return-type',
	templateUrl: './compl-return-type.component.html',
	styleUrls: ['./compl-return-type.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService],
})
export class ComplReturnTypeComponent implements OnInit {

	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	returnTypeForm: FormGroup;
	returnTypeUpdateForm: FormGroup;
	submitted = false;
	updated = false;
	update_name: string;
	error: any;
	public data: any = [];
	public filterQuery = '';
	filterArray = ['name'];
	isLoading = false;
	private toasterService: ToasterService;
	id: number;
	subscription: Subscription;
	subscriptionConfirm: Subscription;
	count = 0;
	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	taxTypeArr = [];
	constructor(private fb: FormBuilder,
		private crudServices: CrudServices,
		toasterService: ToasterService,
		private route: ActivatedRoute,
		private router: Router,
		private permissionService: PermissionService) {
		this.toasterService = toasterService;
		this.initForm();
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.getData();

		this.crudServices.getRequest<any>(TaxType.getAll).subscribe((response => {
			this.taxTypeArr = response;
		}));

	}

	ngOnInit() {
	}
	getData() {
		this.isLoading = true;
		this.subscription = this.crudServices.getAll<any>(ReturnType.getAll).subscribe(res => {
			this.data = res;
			this.isLoading = false;
		}, // success path
			error => this.error = error // error path
		);
	}

	initForm() {
		this.returnTypeForm = this.fb.group({
			name: ['', [Validators.required]],
			tax_type_id: ['', [Validators.required]],
		});
		this.returnTypeUpdateForm = new FormGroup({
			'update_name': new FormControl(null, Validators.required),
			'update_tax_type_id': new FormControl(null, Validators.required),
		});
	}

	get f() { return this.returnTypeForm.controls; }
	get g() { return this.returnTypeUpdateForm.controls; }
	onReset() {

		this.submitted = false;
		this.returnTypeForm.reset();

	}

	onSubmit() {
		this.submitted = true;
		// stop here if form is invalid
		if (this.returnTypeForm.invalid) {
			return;
		}
		this.subscription = this.crudServices.addData<any>(ReturnType.add, {
			name: this.returnTypeForm.value.name,
			tax_type_id: this.returnTypeForm.value.tax_type_id,
		}).subscribe((response) => {
			this.onReset();
			this.getData();
			this.toasterService.pop(response.message, 'Success', response.data);
		});
	}

	onEdit(id: number) {

		if (id != null) {
			this.id = id;
			let name = '';
			let tax_type_id = '';
			this.subscription = this.crudServices.getOne<any>(ReturnType.getOne, {
				id: this.id
			}).subscribe((response) => {
				if (response === null) {
					this.error = response;
					this.toasterService.pop('error', 'Error', 'Something Went Wrong');
				} else {
					id = response[0].id;
					name = response[0].name;
					tax_type_id = response[0].tax_type_id;
					this.returnTypeUpdateForm = new FormGroup({
						'update_name': new FormControl(name, Validators.required),
						'update_tax_type_id': new FormControl(tax_type_id, Validators.required),
					});
				}
			}, errorMessage => {
				this.error = errorMessage.message;
			});
			this.myModal.show();
		}
	}

	onDelete(id: number) {
		if (id) {
			this.crudServices.deleteData<any>(ReturnType.delete, {
				id: id
			}).subscribe((response) => {
				this.getData();
				this.toasterService.pop(response.message, 'Success', response.data);
			});
		}
	}

	onUpdate() {
		this.updated = true;
		if (this.returnTypeUpdateForm.invalid) {
			return;
		}
		if (this.returnTypeUpdateForm.dirty) {
			this.crudServices.updateData<any>(ReturnType.update, {
				id: this.id,
				name: this.returnTypeUpdateForm.value.update_name,
				tax_type_id: this.returnTypeUpdateForm.value.update_tax_type_id,
			}).subscribe((response) => {
				this.getData();
				this.toasterService.pop(response.message, 'Success', response.data);
				this.myModal.hide();
			});
		} else {
			this.myModal.hide();
		}
	}

}
