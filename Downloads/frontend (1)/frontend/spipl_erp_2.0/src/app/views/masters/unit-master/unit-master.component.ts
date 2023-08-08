import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
// import { UnitTableData, UnitService } from './unit-service';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
// import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { OrgUnitMaster } from "../../../shared/apis-path/apis-path";

@Component({
	selector: 'app-unit-master',
	templateUrl: './unit-master.component.html',
	styleUrls: ['./unit-master.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService],
})

export class UnitMasterComponent implements OnInit, OnDestroy {
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	unitForm: FormGroup;
	unitUpdateForm: FormGroup;
	submitted = false;
	updated = false;
	update_unit_type: string;
	error: any;
	public data: any = [];
	public filterQuery = '';
	filterArray = ['unit_type'];
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
		private permissionService: PermissionService
	) {
		this.toasterService = toasterService;
		this.initForm();
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.getUnit();
	}
	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
	getUnit() {
		this.isLoading = true;
		this.subscription = this.crudServices.getAll<any>(OrgUnitMaster.getAll).subscribe(res => {
			this.data = res;
			this.isLoading = false;
		}, // success path
			error => this.error = error // error path
		);
	}
	ngOnInit() {
	}
	initForm() {
		this.unitForm = this.fb.group({
			unit_type: ['', [Validators.required]],
		});
		this.unitUpdateForm = new FormGroup({
			'update_unit_type': new FormControl(null, Validators.required),
		});
	}
	// convenience getter for easy access to form fields
	get f() { return this.unitForm.controls; }
	get g() { return this.unitUpdateForm.controls; }
	onReset() {

		this.submitted = false;
		this.unitForm.reset();

	}

	onSubmit() {
		this.submitted = true;
		// stop here if form is invalid
		if (this.unitForm.invalid) {
			return;
		}
		this.subscription = this.crudServices.addData<any>(OrgUnitMaster.add, {
			unit_type: this.unitForm.value.unit_type
		}).subscribe((response) => {
			this.onReset();
			this.getUnit();
			this.toasterService.pop(response.message, 'Success', response.data);
		});
	}
	onEdit(id: number) {

		if (id != null) {
			this.id = id;
			let unit_type = '';
			this.subscription = this.crudServices.getOne<any>(OrgUnitMaster.getOne, {
				id: this.id
			}).subscribe((response) => {
				if (response === null) {
					this.error = response;
					this.toasterService.pop('error', 'Error', 'Something Went Wrong');
				} else {
					id = response[0].ut_id;
					unit_type = response[0].unit_type;
					this.unitUpdateForm = new FormGroup({
						'update_unit_type': new FormControl(unit_type, Validators.required),
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
			this.crudServices.deleteData<any>(OrgUnitMaster.delete, {
				id: id
			}).subscribe((response) => {
				this.getUnit();
				this.toasterService.pop(response.message, 'Success', response.data);
			});
		}
	}
	onUpdate() {
		this.updated = true;
		if (this.unitUpdateForm.invalid) {
			return;
		}
		if (this.unitUpdateForm.dirty) {
			this.crudServices.updateData<any>(OrgUnitMaster.update, {
				id: this.id,
				unit_type: this.unitUpdateForm.value.update_unit_type
			}).subscribe((response) => {
				this.getUnit();
				this.toasterService.pop(response.message, 'Success', response.data);
				this.myModal.hide();
			});
		} else {
			this.myModal.hide();
		}
	}
}
