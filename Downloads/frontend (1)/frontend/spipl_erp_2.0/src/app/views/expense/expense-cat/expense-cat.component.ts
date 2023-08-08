import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
// import { ExpenseCatService, ExpenseCatListData } from './expense_cat-service';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from 'ngx-bootstrap';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { ExpenseCategoryMaster } from '../../../shared/apis-path/apis-path';

@Component({
	selector: 'app-expense-cat',
	templateUrl: './expense-cat.component.html',
	styleUrls: ['./expense-cat.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService],
})
export class ExpenseCatComponent implements OnInit {

	// @ViewChild('myModal') public myModal: ModalDirective;
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	expenseCatForm: FormGroup;
	expenseCatUpdateForm: FormGroup;
	submitted = false;
	updated = false;
	up_category: string;
	error: any;
	public data: any = [];
	public filterQuery = '';
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
		private permissionService: PermissionService) {


		this.toasterService = toasterService;
		this.initForm();
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.getexpenseCat();
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
	getexpenseCat() {
		this.isLoading = true;
		this.subscription = this.crudServices.getAll<any>(ExpenseCategoryMaster.getAll).subscribe(res => {
			this.data = res.data;
			this.isLoading = false;
		});
	}

	ngOnInit(): void {
	}

	initForm() {
		this.expenseCatForm = this.fb.group({
			category: ['', [Validators.required]],
		});
		this.expenseCatUpdateForm = new FormGroup({
			'up_category': new FormControl(null, Validators.required),
		});
	}
	// convenience getter for easy access to form fields
	get f() { return this.expenseCatForm.controls; }
	get g() { return this.expenseCatUpdateForm.controls; }
	onReset() {

		this.submitted = false;
		this.expenseCatForm.reset();

	}

	public getDate(regDate: string) {
		const date = new Date(regDate);
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
	}

	onSubmit() {
		this.submitted = true;
		// stop here if form is invalid
		if (this.expenseCatForm.invalid) {
			return;
		}
		this.crudServices.addData<any>(ExpenseCategoryMaster.add, {
			category: this.expenseCatForm.value.category
		}).subscribe((response) => {
			this.onReset();
			this.getexpenseCat();
			this.toasterService.pop(response.message, 'Success', response.data);
		});

	}
	onDelete(id: number) {
		if (id) {
			this.crudServices.deleteData<any>(ExpenseCategoryMaster.delete, {
				id: id
			}).subscribe((response) => {
				this.getexpenseCat();
				this.toasterService.pop(response.message, 'Success', response.data);
			});
		}
	}

	onEdit(id: number) {
		if (id != null) {
			this.id = id;
			let category = '';
			this.crudServices.getOne<any>(ExpenseCategoryMaster.getOne, {
				id: this.id
			}).subscribe((response) => {
				if (response === null) {
					this.error = response;
					this.toasterService.pop('error', 'Error', 'Something Went Wrong');
				} else {
					id = response.data[0].id;
					category = response.data[0].category;
					this.expenseCatUpdateForm = new FormGroup({
						'up_category': new FormControl(category, Validators.required),
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
		if (this.expenseCatUpdateForm.invalid) {
			return;
		}
		if (this.expenseCatUpdateForm.dirty) {
			this.crudServices.updateData<any>(ExpenseCategoryMaster.update, {
				id: this.id,
				category: this.expenseCatUpdateForm.value.up_category
			}).subscribe((response) => {
				this.getexpenseCat();
				this.toasterService.pop(response.message, 'Success', response.data);
				this.myModal.hide();
			});
		} else {
			this.myModal.hide();
		}
	}

}
