import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
// import { ProductMasterService, ProductMasterData, ProductMasterDataList } from './product-master-service';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from 'ngx-bootstrap';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { OrgUnitMaster, ProductMaster } from "../../../shared/apis-path/apis-path";
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';

@Component({
	selector: 'app-product-master',
	templateUrl: './product-master.component.html',
	styleUrls: ['./product-master.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService,LoginService],
})
export class ProductMasterComponent implements OnInit, OnDestroy {
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	productMasterForm: FormGroup;
	updateProductMasterForm: FormGroup;
	user: UserDetails;
	company_id: any = null;
	submitted = false;
	updated = false;
	update_product_name: string;
	update_abbr: string;
	update_desc_goods: string;
	update_hsn_code: number;
	error: any;
	public data: any = [];
	public filterQuery = '';
	filterArray = ['pay_term', 'pay_val'];
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


	constructor(
		private fb: FormBuilder,
		private crudServices: CrudServices,
		toasterService: ToasterService,
		private route: ActivatedRoute,
		private router: Router,
		private permissionService: PermissionService,
		private loginService: LoginService,
	) {
		this.toasterService = toasterService;
		this.initForm();
		const perms = this.permissionService.getPermission();
		this.user = this.loginService.getUserDetails();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.getProduct();
		this.company_id = this.user.userDet[0].company_id;
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	getProduct() {
		this.isLoading = true;
		this.subscription = this.crudServices.getAll<any>(ProductMaster.getAll).subscribe(res => {
			this.data = res;
			this.isLoading = false;
		}, // success path
			error => this.error = error // error path
		);
	}

	ngOnInit(): void {

	}


	initForm() {
		this.productMasterForm = this.fb.group({
			name: ['', [Validators.required]],
			abbr: ['', [Validators.required]],
			desc_goods: ['', [Validators.required]],
			hsn_code: ['', [Validators.required]],

		});
		this.updateProductMasterForm = new FormGroup({
			'update_product_name': new FormControl(null, Validators.required),
			'update_abbr': new FormControl(null, Validators.required),
			'update_desc_goods': new FormControl(null, Validators.required),
			'update_hsn_code': new FormControl(null, Validators.required),
		});
	}

	// convenience getter for easy access to form fields
	get f() { return this.productMasterForm.controls; }
	get g() { return this.updateProductMasterForm.controls; }
	onReset() {
		this.submitted = false;
		this.productMasterForm.reset();
	}

	onSubmit() {
		this.submitted = true;
		// stop here if form is invalid
		if (this.productMasterForm.invalid) {
			return;
		}
		this.subscription = this.crudServices.addData<any>(ProductMaster.add, {
			name: this.productMasterForm.value.name,
			abbr: this.productMasterForm.value.abbr,
			desc_goods: this.productMasterForm.value.desc_goods,
			hsn_code: this.productMasterForm.value.hsn_code,
			company_id:this.company_id
		}).subscribe((response) => {
			this.onReset();
			this.getProduct();
			this.toasterService.pop(response.message, 'Success', response.data);
		});
	}


	onEdit(id: number) {
		if (id != null) {
			this.id = id;
			let name = '';
			let abbr = '';
			let desc_goods = '';
			let hsn_code = '';
			this.crudServices.getOne<any>(ProductMaster.getOne, {
				id: this.id
			}).subscribe((response) => {
				if (response === null) {
					this.error = response;
					this.toasterService.pop('error', 'Error', 'Something Went Wrong');
				} else {
					id = response['id'];
					name = response[0]['name'];
					abbr = response[0]['abbr'];
					desc_goods = response[0]['desc_goods'];
					hsn_code = response[0]['hsn_code'];
					this.updateProductMasterForm = new FormGroup({
						'update_product_name': new FormControl(name, Validators.required),
						'update_abbr': new FormControl(abbr, Validators.required),
						'update_desc_goods': new FormControl(desc_goods, Validators.required),
						'update_hsn_code': new FormControl(hsn_code, Validators.required),

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
		if (this.updateProductMasterForm.invalid) {
			return;
		}
		if (this.updateProductMasterForm.dirty) {
			this.crudServices.updateData<any>(ProductMaster.update, {
				id: this.id,
				name: this.updateProductMasterForm.value.update_product_name,
				abbr: this.updateProductMasterForm.value.update_abbr,
				desc_goods: this.updateProductMasterForm.value.update_desc_goods,
				hsn_code: this.updateProductMasterForm.value.update_hsn_code
			}).subscribe((response) => {
				this.getProduct();
				this.toasterService.pop(response.message, 'Success', response.data);
				this.myModal.hide();
			});
		} else {
			this.myModal.hide();
		}
	}

	onDelete(id: number) {
		if (id) {
			this.crudServices.deleteData<any>(ProductMaster.delete, {
				id: id
			}).subscribe((response) => {
				this.getProduct();
				this.toasterService.pop(response.message, 'Success', response.data);
			});
		}
	}


}
