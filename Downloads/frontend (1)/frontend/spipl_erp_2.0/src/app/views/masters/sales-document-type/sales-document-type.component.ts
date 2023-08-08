import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { staticValues } from "../../../shared/common-service/common-service";
import { salesDocumentsTypes } from '../../../shared/apis-path/apis-path';

@Component({
	selector: 'app-sales-document-type',
	templateUrl: './sales-document-type.component.html',
	styleUrls: ['./sales-document-type.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService],
})
export class SalesDocumentTypeComponent implements OnInit {

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
			doc_name: new FormControl(null, Validators.required)
		});
	}

	ngOnInit() {
		this.getsalesDocumentsTypes();
	}

	getsalesDocumentsTypes() {
		this.mode = 'Add';
		this.id = null;
		this.isLoading = true;
		this.crudServices.getAll<any>(salesDocumentsTypes.getAll).subscribe(res => {
			this.data = res.data;
			this.isLoading = false;
		});
	}

	onEdit(item) {
		this.mode = 'Edit';
		if (item.id != null) {
			this.id = item.id;
			this.documentTypeForm.patchValue({
				doc_name: item.doc_name
			});
		}
	}

	onDelete(id) {
		if (id != null) {
			this.crudServices.deleteData<any>(salesDocumentsTypes.delete, {
				id: id
			}).subscribe((res) => {
				if (res.code == '100') {
					this.toasterService.pop(res.message, 'Success', res.data);
					this.getsalesDocumentsTypes();
				}
			});
		}
	}

	onSubmit() {
		let body = {
			data: {
				doc_name: this.documentTypeForm.value.doc_name
			}
		};
		if (this.mode == 'Edit' && this.id != null) {
			body['id'] = this.id;
			this.crudServices.updateData<any>(salesDocumentsTypes.update, body).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop(res.message, 'Success', res.data);
					this.documentTypeForm.reset();
					this.getsalesDocumentsTypes();
				} else {
					this.toasterService.pop('error', 'error', 'Somethimg Went wrong');
				}
			});
		} else {
			this.crudServices.addData<any>(salesDocumentsTypes.add, body).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop(res.message, 'Success', res.data);
					this.documentTypeForm.reset();
					this.getsalesDocumentsTypes();
				} else {
					this.toasterService.pop('error', 'error', 'Somethimg Went wrong');
				}
			});
		}
	}
}
