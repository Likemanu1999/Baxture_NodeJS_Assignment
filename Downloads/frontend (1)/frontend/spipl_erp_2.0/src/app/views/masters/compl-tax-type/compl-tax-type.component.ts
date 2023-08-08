import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from 'ngx-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TaxType } from '../../../shared/apis-path/apis-path';


@Component({
	selector: 'app-compl-tax-type',
	templateUrl: './compl-tax-type.component.html',
	styleUrls: ['./compl-tax-type.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService],
})
export class ComplTaxTypeComponent implements OnInit {

	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	taxTypeForm: FormGroup;
	taxTypeUpdateForm: FormGroup;
	submitted = false;
	updated = false;
	update_type: string;
	error: any;
	public data: any = [];
	public filterQuery = '';
	filterArray = ['type'];
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
	}

	ngOnInit() {
	}

	getData() {
		this.isLoading = true;
		this.subscription = this.crudServices.getAll<any>(TaxType.getAll).subscribe(res => {
			this.data = res;
			this.isLoading = false;
		}, // success path
			error => this.error = error // error path
		);
	}

	initForm() {
		this.taxTypeForm = this.fb.group({
			type: ['', [Validators.required]],
		});
		this.taxTypeUpdateForm = new FormGroup({
			'update_type': new FormControl(null, Validators.required),
		});
	}

	get f() { return this.taxTypeForm.controls; }
	get g() { return this.taxTypeUpdateForm.controls; }
	onReset() {

		this.submitted = false;
		this.taxTypeForm.reset();

	}


	onSubmit() {
		this.submitted = true;
		if (this.taxTypeForm.invalid) {
			return;
		}
		this.subscription = this.crudServices.addData<any>(TaxType.add, {
			type: this.taxTypeForm.value.type
		}).subscribe((response) => {
			this.onReset();
			this.getData();
			this.toasterService.pop(response.message, 'Success', response.data);
		});
	}


	onEdit(id: number) {

		if (id != null) {
			this.id = id;
			let type = '';
			this.subscription = this.crudServices.getOne<any>(TaxType.getOne, {
				id: this.id
			}).subscribe((response) => {
				if (response === null) {
					this.error = response;
					this.toasterService.pop('error', 'Error', 'Something Went Wrong');
				} else {
					id = response[0].id;
					type = response[0].type;
					this.taxTypeUpdateForm = new FormGroup({
						'update_type': new FormControl(type, Validators.required),
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
			this.crudServices.deleteData<any>(TaxType.delete, {
				id: id
			}).subscribe((response) => {
				this.getData();
				this.toasterService.pop(response.message, 'Success', response.data);
			});
		}
	}

	onUpdate() {
		this.updated = true;
		if (this.taxTypeUpdateForm.invalid) {
			return;
		}
		if (this.taxTypeUpdateForm.dirty) {
			this.crudServices.updateData<any>(TaxType.update, {
				id: this.id,
				type: this.taxTypeUpdateForm.value.update_type
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
