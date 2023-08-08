import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ToasterConfig, ToasterService } from "angular2-toaster";
import { Location } from '@angular/common';
import { LoginService } from "../../login/login.service";
import { ExportService } from '../../../shared/export-service/export-service';
import { StaffMemberMaster, TelephoneExtensions } from "../../../shared/apis-path/apis-path";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { staticValues } from "../../../shared/common-service/common-service";
import { UserDetails } from "../../login/UserDetails.model";

@Component({
	selector: 'app-telephone-extensions',
	templateUrl: './telephone-extensions.component.html',
	styleUrls: ['./telephone-extensions.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [ExportService, CrudServices, ToasterService, PermissionService, LoginService],
})

export class TelephoneExtensionsComponent implements OnInit {

	user: UserDetails;

	extensionForm: FormGroup;
	data: any = [];
	cols: any = [];
	staffList: any = [];
	links: any = [];

	extensions_types: any = staticValues.extensions_types;
	extension_type: any = null;
	isEdit: any = false;
	isLoading: boolean = false;
	filterQuery: any = '';
	id: any = null;

	add_opt: boolean = false;
	edit_opt: boolean = false;
	del_opt: boolean = false;
	view_opt: boolean = false;

	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'bottom';
	public closeOnOutsideClick: boolean = true;

	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		positionClass: 'toast-bottom-right',
		timeout: 5000
	});

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private crudServices: CrudServices,
		private location: Location,
		private exportService: ExportService,
		private fb: FormBuilder,
		private permissionService: PermissionService,
		private loginService: LoginService,
		toasterService: ToasterService
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;

		this.add_opt = (this.links.indexOf('add_tel_ext') > -1);
		this.edit_opt = (this.links.indexOf('edit_tel_ext') > -1);
		this.del_opt = (this.links.indexOf('del_tel_ext') > -1);
		this.view_opt = (this.links.indexOf('view_tel_ext') > -1);

		this.toasterService = toasterService;

		this.cols = [
			{ field: "index", header: "#", permission: true },
			{ field: "name", header: "Name", permission: true },
			{ field: "department", header: "Department", permission: true },
			{ field: "extension", header: "Extension", permission: true },
			{ field: "edit", header: "Edit", permission: true },
			{ field: "delete", header: "Delete", permission: true }
		];
		this.extensionForm = new FormGroup({
			extension_type: new FormControl(null, Validators.required),
			emp_id: new FormControl(null),
			type: new FormControl(null),
			extension: new FormControl(null)
		});
	}

	ngOnInit() {
		this.getExtensionsList();
		this.getStaffList();
	}

	onChangeExtensionType(item) {
		if (item == null || item == undefined) {
			this.extension_type = null;
			this.extensionForm.get("emp_id").setValidators(null);
			this.extensionForm.get('emp_id').updateValueAndValidity();
			this.extensionForm.get("type").setValidators(null);
			this.extensionForm.get('type').updateValueAndValidity();
		} else {
			this.extension_type = item.name;
			if (item.name == 'Staff') {
				this.extensionForm.get("emp_id").setValidators([Validators.required]);
				this.extensionForm.get('emp_id').updateValueAndValidity();
			} else {
				this.extensionForm.get("type").setValidators([Validators.required]);
				this.extensionForm.get('type').updateValueAndValidity();
			}
		}
	}

	getExtensionsList() {
		this.id = null;
		this.isEdit = false;
		this.crudServices.getAll<any>(TelephoneExtensions.getAll).subscribe((res) => {
			if (res.code == "100") {
				if (res.data.length > 0) {
					this.data = res.data;
				}
			}
		});
	}

	getStaffList() {
		this.crudServices.getAll<any>(StaffMemberMaster.getAll).subscribe((res) => {
			if (res.code == "100") {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						element.full_name = element.first_name + ' ' + element.last_name;
					});
					this.staffList = res.data;
				}
			}
		});
	}

	onSubmit() {
		let body = {
			data: {
				extension: this.extensionForm.value.extension,
				emp_id: this.extensionForm.value.emp_id,
				type: this.extensionForm.value.type
			},
			message: (this.isEdit) ? "Extension Updated Successfully" : "New Extension Added"
		};
		if (this.isEdit) {
			body['id'] = this.id;
			this.crudServices.updateData<any>(TelephoneExtensions.update, body).subscribe(res => {
				this.toasterService.pop(res.message, res.message, res.data);
				this.extensionForm.reset();
				this.getExtensionsList();
			});
		} else {
			this.crudServices.addData<any>(TelephoneExtensions.add, body).subscribe(res => {
				this.toasterService.pop(res.message, res.message, res.data);
				this.extensionForm.reset();
				this.getExtensionsList();
			});
		}
	}

	onEdit(id) {
		this.crudServices.getOne<any>(TelephoneExtensions.getOne, {
			id: id
		}).subscribe(res => {
			if (res.code == '100') {
				this.id = res.data[0].id;
				this.extensionForm.patchValue({
					extension_type: (res.data[0].type == "Staff") ? "Staff" : "Others",
					emp_id: res.data[0].emp_id,
					type: res.data[0].type,
					extension: res.data[0].extension
				});
				this.isEdit = true;
				this.onChangeExtensionType({
					id: null,
					name: (res.data[0].type == "Staff") ? "Staff" : "Others"
				});
			}
		});
	}

	onDelete(id) {
		this.crudServices.deleteData<any>(TelephoneExtensions.delete, {
			id: id,
			message: "Extension Deleted Successfully"
		}).subscribe(res => {
			this.toasterService.pop(res.message, res.message, res.data);
			this.getExtensionsList();
		});
	}

	onChangeExtension(extension) {
		// this.crudServices.getOne<any>(TelephoneExtensions.searchExtension, {
		// 	extension: extension
		// }).subscribe(res => {
		// 	if (res.data.length > 0) {
		// 		this.toasterService.pop('error', 'Extension Already Taken', "");
		// 		this.extensionForm.controls['extension'].setErrors({ 'incorrect': true });
		// 	} else {
		// 		this.extensionForm.controls['extension'].setErrors(null);
		// 	}
		// });
	}
}
