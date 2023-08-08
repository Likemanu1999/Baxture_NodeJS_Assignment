import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { QualificationMaster, RentTypeMasters } from '../../../shared/apis-path/apis-path';

@Component({
	selector: 'app-rent-type-master',
	templateUrl: './rent-type-master.component.html',
	styleUrls: ['./rent-type-master.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService],
})

export class RentTypeMasterComponent implements OnInit, OnDestroy {
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	qualificationForm: FormGroup;
	rentTypeUpdateForm: FormGroup;
	submitted = false;
	updated = false;
	update_name: string;
	error: any;
	data: any = [];
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


	dataID: number;

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
		this.getDept();
	}
	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
	getDept() {
		this.isLoading = true;
		this.subscription = this.crudServices.getAll<any>(RentTypeMasters.getAllRentTypeList).subscribe(res => {
			this.data = res;
			this.isLoading = false;
		});
	}
	public toInt(num: string) {
		return +num;
	}

	public sortByWordLength = (a: any) => {
		return a.name.length;
	}

	public getDate(regDate: string) {
		const date = new Date(regDate);
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
	}

	ngOnInit() {
	}
	initForm() {
		this.qualificationForm = this.fb.group({
			type: ['', [Validators.required]],
		});
		this.rentTypeUpdateForm = new FormGroup({
			'update_type': new FormControl(null, Validators.required),
		});
	}
	// convenience getter for easy access to form fields
	get f() { return this.qualificationForm.controls; }
	get g() { return this.rentTypeUpdateForm.controls; }
	onReset() {

		this.submitted = false;
		this.qualificationForm.reset();

	}

	onSubmit() {
		this.submitted = true;
		if (this.qualificationForm.invalid) {
			return;
		}
		this.crudServices.addData<any>(RentTypeMasters.addData, {
			type: this.qualificationForm.value.type
		}).subscribe((response) => {
			this.onReset();
			this.getDept();
			this.toasterService.pop(response.message, 'Success', response.data);
		});
	}

	onEdit(id: number) {
		if (id != null) {
			//  id = id;
			let type = '';
			this.crudServices.getOne<any>(RentTypeMasters.getOne, {
				id: id
			}).subscribe((response) => {
				if (response.code == 101 || response === null) {
					this.error = response;
					this.toasterService.pop('error', 'Error', 'Something Went Wrong');
				} else {
					this.dataID = response.data[0].id
					id = response.data[0].id;
					type = response.data[0].type;
					this.rentTypeUpdateForm = new FormGroup({
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
			this.id = id;
			this.crudServices.deleteData<any>(RentTypeMasters.deleteData, {
				id: id
			}).subscribe((response) => {
				this.getDept();
				this.toasterService.pop(response.message, 'Success', response.data);
			});
		}
	}

	// Function is used to remove row from table. [add this to tr[attr.id]="item.id"]
	deleteRow(id: number) {
		for (let i = 0; i < this.data.length; ++i) {
			if (this.data[i].id === id) {
				this.data.splice(i, 1);
			}
		}
	}

	onUpdate() {
		this.updated = true;
		if (this.rentTypeUpdateForm.invalid) {
			return;
		}
		if (this.rentTypeUpdateForm.dirty) {
			this.crudServices.updateData<any>(RentTypeMasters.updateData, {
				id: this.dataID,
				type: this.rentTypeUpdateForm.value.update_type
			}).subscribe((response) => {
				this.getDept();
				this.toasterService.pop(response.message, 'Success', response.data);
				this.myModal.hide();
			});
		} else {
			this.myModal.hide();
		}
	}
}
