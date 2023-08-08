import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { DepartmentMaster } from '../../../shared/apis-path/apis-path';

@Component({
	selector: 'app-role-master',
	templateUrl: './department-master.component.html',
	styleUrls: ['./department-master.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService],
})

export class DepartmentMasterComponent implements OnInit, OnDestroy {
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	departmentForm: FormGroup;
	departmentUpdateForm: FormGroup;
	submitted = false;
	updated = false;
	update_dept_name: string;
	error: any;
	data: any = [];
	public filterQuery = '';
	filterArray = ['dept_name'];
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
		this.getDept();
	}
	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
	getDept() {
		this.isLoading = true;
		this.subscription = this.crudServices.getAll<any>(DepartmentMaster.getAll).subscribe(res => {
			this.data = res.data;
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
		this.departmentForm = this.fb.group({
			dept_name: ['', [Validators.required]],
		});
		this.departmentUpdateForm = new FormGroup({
			'update_dept_name': new FormControl(null, Validators.required),
		});
	}

	// convenience getter for easy access to form fields
	get f() { return this.departmentForm.controls; }

	get g() { return this.departmentUpdateForm.controls; }

	onReset() {
		this.submitted = false;
		this.departmentForm.reset();
	}

	onSubmit() {
		this.submitted = true;
		if (this.departmentForm.invalid) {
			return;
		}
		this.crudServices.addData<any>(DepartmentMaster.add, {
			dept_name: this.departmentForm.value.dept_name
		}).subscribe(res => {
			this.onReset();
			this.getDept();
			this.toasterService.pop(res.message, 'Success', res.data);
		});
	}

	onEdit(id: number) {
		if (id != null) {
			this.id = id;
			let dept_name = '';
			this.crudServices.getOne<any>(DepartmentMaster.getOne, {
				id: this.id
			}).subscribe(res => {
				if (res === null) {
					this.error = res;
					this.toasterService.pop('error', 'Error', 'Something Went Wrong');
				} else {
					id = res.data[0].id;
					dept_name = res.data[0].dept_name;
					this.departmentUpdateForm = new FormGroup({
						'update_dept_name': new FormControl(dept_name, Validators.required),
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
			this.crudServices.deleteData<any>(DepartmentMaster.delete, {
				id: id
			}).subscribe((res) => {
				this.getDept();
				this.toasterService.pop(res.message, 'Success', res.data);
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
		if (this.departmentUpdateForm.invalid) {
			return;
		}
		this.crudServices.updateData<any>(DepartmentMaster.update, {
			id: this.id,
			dept_name: this.departmentUpdateForm.value.update_dept_name
		}).subscribe(res => {
			this.getDept();
			this.toasterService.pop(res.message, 'Success', res.data);
			this.myModal.hide();
		});
	}
}
