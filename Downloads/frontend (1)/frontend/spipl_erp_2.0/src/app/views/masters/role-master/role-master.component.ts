import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { RoleMaster } from "../../../shared/apis-path/apis-path";

@Component({
	selector: 'app-role-master',
	templateUrl: './role-master.component.html',
	styleUrls: ['./role-master.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService],
})

export class RoleMasterComponent implements OnInit, OnDestroy {
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	data: any = [];
	roleForm: FormGroup;
	roleUpdateForm: FormGroup;
	submitted = false;
	updated = false;
	update_role_name: string;
	error: any;
	public filterQuery = '';
	filterArray = ['role_name'];
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
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
	}

	ngOnInit() {
		this.initForm();
		this.getRoles();
	}

	initForm() {
		this.roleForm = this.fb.group({
			role_name: ['', [Validators.required]],
		});
		this.roleUpdateForm = new FormGroup({
			'update_role_name': new FormControl(null, Validators.required),
		});
	}
	get f() { return this.roleForm.controls; }
	get g() { return this.roleUpdateForm.controls; }

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

	getRoles() {
		this.isLoading = true;
		this.subscription = this.crudServices.getAll<any>(RoleMaster.getAll).subscribe(res => {
			this.data = res.data;
			this.isLoading = false;
		});
	}

	onSubmit() {
		this.submitted = true;
		if (this.roleForm.invalid) {
			return;
		}
		this.crudServices.addData<any>(RoleMaster.add, {
			role_name: this.roleForm.value.role_name
		}).subscribe((response) => {
			this.onReset();
			this.getRoles();
			this.toasterService.pop(response.message, 'Success', response.data);
		});
	}

	onReset() {
		this.submitted = false;
		this.roleForm.reset();
	}

	onEdit(id: number) {
		if (id != null) {
			this.id = id;
			let role_name = '';
			this.crudServices.getOne<any>(RoleMaster.getOne, {
				role_id: id
			}).subscribe((response) => {
				if (response === null) {
					this.error = response;
					this.toasterService.pop('error', 'Error', 'Something Went Wrong');
				} else {
					id = response.data[0].id;
					role_name = response.data[0].role_name;
					this.roleUpdateForm = new FormGroup({
						'update_role_name': new FormControl(role_name, Validators.required),
					});
				}
			}, errorMessage => {
				this.error = errorMessage.message;
			});
			this.myModal.show();
		}
	}

	onUpdate() {
		this.updated = true;
		if (this.roleUpdateForm.invalid) {
			return;
		}
		if (this.roleUpdateForm.dirty) {
			this.crudServices.updateData<any>(RoleMaster.update, {
				role_id: this.id,
				role_name: this.roleUpdateForm.value.update_role_name
			}).subscribe((response) => {
				this.getRoles();
				this.toasterService.pop(response.message, 'Success', response.data);
				this.myModal.hide();
			});
		} else {
			this.myModal.hide();
		}
	}

	onDelete(id: number) {
		if (id) {
			this.crudServices.deleteData<any>(RoleMaster.delete, {
				role_id: id
			}).subscribe((response) => {
				this.getRoles();
				this.toasterService.pop(response.message, 'Success', response.data);
			});
		}
	}

	deleteRow(id: number) {
		for (let i = 0; i < this.data.length; ++i) {
			if (this.data[i].id === id) {
				this.data.splice(i, 1);
			}
		}
	}

	getPermission() {
		const data = JSON.parse(localStorage.getItem('menu'));
		let index = -1;
		const current_route = this.router.url;
		let currentPermission = '';
		const filteredObj = data.find(function (item, i) {
			if (item.url === current_route) {
				currentPermission = item.permission;
				index = i;
				return i;
			}
			if (item.hasOwnProperty('children')) {
				const total_child = item.children.length;
				for (let index2 = 0; index2 < item.children.length; index2++) {
					if (item.children[index2].url === current_route) {
						currentPermission = item.children[index2].permission;
						index = i;
						return i;
					}
				}
			}
		});
		this.add_opt = (currentPermission['add_opt'] === '1') ? true : false;
		this.view_opt = (currentPermission['view_opt'] === '1') ? true : false;
		this.edit_opt = (currentPermission['edit_opt'] === '1') ? true : false;
		this.del_opt = (currentPermission['del_opt'] === '1') ? true : false;
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
}
