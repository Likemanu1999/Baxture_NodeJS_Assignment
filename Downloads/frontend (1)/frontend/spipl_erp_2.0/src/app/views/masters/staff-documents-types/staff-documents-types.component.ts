import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { staticValues } from "../../../shared/common-service/common-service";
import { StaffDocumentsTypes } from '../../../shared/apis-path/apis-path';

@Component({
	selector: 'app-staff-documents-types',
	templateUrl: './staff-documents-types.component.html',
	styleUrls: ['./staff-documents-types.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService],
})

export class StaffDocumentsTypesComponent implements OnInit {

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

	isLoading = false;
	documentTypeForm: FormGroup;
	data: any = [];
	id: any = null;
	filterQuery = null;
	filterArray = [];
	mode = 'Add';

	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	constructor(private fb: FormBuilder,
		private crudServices: CrudServices,
		toasterService: ToasterService,
		private permissionService: PermissionService) {
		this.toasterService = toasterService;

		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];

		this.documentTypeForm = this.fb.group({
			document_type: new FormControl(null, Validators.required)
		});
	}

	ngOnInit() {
		this.getStaffDocumentsTypes();
	}

	getStaffDocumentsTypes() {
		this.mode = 'Add';
		this.id = null;
		this.isLoading = true;
		this.crudServices.getAll<any>(StaffDocumentsTypes.getAll).subscribe(res => {
			this.data = res.data;
			this.isLoading = false;
		});
	}

	onEdit(item) {
		this.mode = 'Edit';
		if (item.id != null) {
			this.id = item.id;
			this.documentTypeForm.patchValue({
				document_type: item.document_type
			});
		}
	}

	onDelete(id) {
		if (id != null) {
			this.crudServices.deleteData<any>(StaffDocumentsTypes.delete, {
				id: id
			}).subscribe((res) => {
				if (res.code == '100') {
					this.toasterService.pop(res.message, 'Success', res.data);
					this.getStaffDocumentsTypes();
				}
			});
		}
	}

	onSubmit() {
		let body = {
			data: {
				document_type: this.documentTypeForm.value.document_type
			}
		};
		if (this.mode == 'Edit' && this.id != null) {
			body['id'] = this.id;
			this.crudServices.updateData<any>(StaffDocumentsTypes.update, body).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop(res.message, 'Success', res.data);
					this.documentTypeForm.reset();
					this.getStaffDocumentsTypes();
				} else {
					this.toasterService.pop('error', 'error', 'Somethimg Went wrong');
				}
			});
		} else {
			this.crudServices.addData<any>(StaffDocumentsTypes.add, body).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop(res.message, 'Success', res.data);
					this.documentTypeForm.reset();
					this.getStaffDocumentsTypes();
				} else {
					this.toasterService.pop('error', 'error', 'Somethimg Went wrong');
				}
			});
		}
	}

}
