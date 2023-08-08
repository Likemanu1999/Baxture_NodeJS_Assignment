import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { JobProfileMaster } from '../../../shared/apis-path/apis-path';

@Component({
	selector: 'app-role-master',
	templateUrl: './job-profile-master.component.html',
	styleUrls: ['./job-profile-master.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService],
})

export class JobProfileMasterComponent implements OnInit, OnDestroy {
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	jobProfileForm: FormGroup;
	roleUpdateForm: FormGroup;
	submitted = false;
	updated = false;
	update_profile_name: string;
	error: any;
	data: any = [];
	public filterQuery = '';
	filterArray = ['profile_name'];
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
		this.getRoles();
	}
	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
	getRoles() {
		this.isLoading = true;
		this.subscription = this.crudServices.getAll<any>(JobProfileMaster.getAll).subscribe(res => {
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
		this.jobProfileForm = this.fb.group({
			profile_name: ['', [Validators.required]],
		});
		this.roleUpdateForm = new FormGroup({
			'update_profile_name': new FormControl(null, Validators.required),
		});
	}
	// convenience getter for easy access to form fields
	get f() { return this.jobProfileForm.controls; }
	get g() { return this.roleUpdateForm.controls; }
	onReset() {

		this.submitted = false;
		this.jobProfileForm.reset();

	}

	onSubmit() {
		this.submitted = true;
		if (this.jobProfileForm.invalid) {
			return;
		}
		this.subscription = this.crudServices.addData<any>(JobProfileMaster.add, {
			profile_name: this.jobProfileForm.value.profile_name
		}).subscribe(res => {
			this.onReset();
			this.getRoles();
			this.toasterService.pop(res.message, 'Success', res.data);
		});
	}
	onEdit(id: number) {
		if (id != null) {
			this.id = id;
			let profile_name = '';
			this.subscription = this.crudServices.getOne<any>(JobProfileMaster.getOne, {
				id: id
			}).subscribe(res => {
				if (res === null) {
					this.error = res;
					this.toasterService.pop('error', 'Error', 'Something Went Wrong');
				} else {
					id = res.data[0].id;
					profile_name = res.data[0].profile_name;
					this.roleUpdateForm = new FormGroup({
						'update_profile_name': new FormControl(profile_name, Validators.required),
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
			this.crudServices.deleteData<any>(JobProfileMaster.delete, {
				id: id
			}).subscribe((res) => {
				this.getRoles();
				this.toasterService.pop(res.message, res.message, res.data);
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

	onUpdate() {
		this.updated = true;
		if (this.roleUpdateForm.invalid) {
			return;
		}
		if (this.roleUpdateForm.dirty) {
			this.crudServices.updateData<any>(JobProfileMaster.update, {
				id: this.id,
				profile_name: this.roleUpdateForm.value.update_profile_name
			}).subscribe(res => {
				this.getRoles();
				this.toasterService.pop(res.message, 'Success', res.data);
				this.myModal.hide();
			});
		} else {
			this.myModal.hide();
		}
	}
}
