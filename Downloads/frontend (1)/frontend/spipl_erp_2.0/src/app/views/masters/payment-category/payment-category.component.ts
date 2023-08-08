import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { paymentCategory } from "../../../shared/apis-path/apis-path";


@Component({
	selector: 'app-payment-category',
	templateUrl: './payment-category.component.html',
	styleUrls: ['./payment-category.component.scss'],
	providers: [CrudServices, ToasterService, PermissionService, LoginService]
})

export class PaymentCategoryComponent implements OnInit {
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	paymentCategoryForm: FormGroup;
	paymentCategoryUpdateForm: FormGroup;
	data: any = [];

	isLoading: boolean = false;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	filterQuery: any = '';
	error: any;
	updated = false;


	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;

	dataID: number;

	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	constructor(private fb: FormBuilder,
		toasterService: ToasterService,
		private route: ActivatedRoute,
		private router: Router,
		private permissionService: PermissionService,
		private loginService: LoginService,
		private crudServices: CrudServices
	) {
		this.toasterService = toasterService;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
	}

	ngOnInit() {
		this.loadData();
		this.initForms();
	}

	loadData() {
		this.isLoading = true;
		this.crudServices.getAll<any>(paymentCategory.getAll).subscribe(res => {
			this.data = res;
			this.isLoading = false;
		});
	}

	initForms() {
		this.paymentCategoryForm = new FormGroup({
			payment_category_name: new FormControl(null, Validators.required),
		});

		this.paymentCategoryUpdateForm = new FormGroup({
			'update_payment_category': new FormControl(null, Validators.required),
		});
	}

	onSubmit() {
		let body = {
			data: {
				category: this.paymentCategoryForm.value.payment_category_name,
			},
			message: "New Payment Category Added"
		};
		this.crudServices.addData<any>(paymentCategory.add, body).subscribe(res => {
			this.toasterService.pop(res.message, res.message, res.data);
			this.loadData();
		});
	}

	get g() { return this.paymentCategoryUpdateForm.controls; }

	onEdit(id: number) {
		if (id != null) {
			this.crudServices.getOne<any>(paymentCategory.getOne, {
				id: id
			}).subscribe((response) => {
				if (response.code == 101 || response === null) {
					this.error = response;
					this.toasterService.pop('error', 'Error', 'Something Went Wrong');
				} else {
					this.dataID = response.data[0].id
					id = response.data[0].id;
					let category = response.data[0].category;
					this.paymentCategoryUpdateForm.reset();
					this.paymentCategoryUpdateForm.patchValue({
						update_payment_category: response.data[0].category
					})
				}
			}, errorMessage => {
				this.error = errorMessage.message;
			});
			this.myModal.show();
		}
	}

	onUpdate() {
		this.updated = true;
		if (this.paymentCategoryUpdateForm.invalid) {
			return;
		}

		if (this.paymentCategoryUpdateForm.dirty) {
			this.crudServices.updateData<any>(paymentCategory.update, {
				id: this.dataID,
				category: this.paymentCategoryUpdateForm.value.update_payment_category
			}).subscribe((response) => {
				this.loadData();
				this.toasterService.pop(response.message, 'Success', response.data);
				this.myModal.hide();
			});
		} else {
			this.myModal.hide();
		}
	}

	onDelete(id: number) {
		if (id) {
			this.crudServices.deleteData<any>(paymentCategory.delete, {
				id: id
			}).subscribe((response) => {
				this.loadData();
				this.toasterService.pop(response.message, 'Success', response.data);
			});
		}
	}

}




