import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { LinkList } from './link.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MenuList } from '../menu-master/menu.model';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { LinkMaster, MenuMaster, Permission } from '../../../shared/apis-path/apis-path';

@Component({
	selector: 'app-link-master',
	templateUrl: './link-master.component.html',
	styleUrls: ['./link-master.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, PermissionService, ToasterService]
})
export class LinkMasterComponent implements OnInit {
	id: number;
	editMode: boolean = false;
	isLoading = false;
	public filterQuery = '';
	filterArray = ['link_name'];
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
	public data: Array<LinkList>;
	public parentData: Array<MenuList>;
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	linkForm: FormGroup;
	constructor(private permissionService: PermissionService,
		private toasterService: ToasterService,
		private crudServices: CrudServices) {
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.linkForm = new FormGroup({
			'p_id': new FormControl(null, Validators.required),
			'link_name': new FormControl(null, Validators.required),
		});
	}

	ngOnInit() {
		this.crudServices.getAll<any>(MenuMaster.getAll).subscribe((response) => {
			this.parentData = response.data;
		});
		this.getAllLink();
	}
	getAllLink() {
		this.isLoading = true;
		this.crudServices.getAll<any>(LinkMaster.getAll).subscribe(res => {
			this.data = res.data;
			this.isLoading = false;
		});

	}
	onSubmit() {

		let data = {
			link_name: this.g.link_name.value,
			p_id: this.g.p_id.value
		}

		if (this.editMode) {
			data['id'] = this.id;
			this.crudServices.updateData<any>(LinkMaster.update, data).subscribe((response) => {
				this.toasterService.pop(response.message, response.message, response.data);
				if (response.code === '100') {
					this.getAllLink();
					this.onReset();
					this.editMode = false;
				}
			});
		} else {
			this.crudServices.addData<any>(LinkMaster.add, data).subscribe((response) => {
				this.toasterService.pop(response.message, response.message, "New Link Added");
				if (response.code === '100') {
					this.adminPermission(response.data);
					this.getAllLink();
					this.onReset();
				}
			});
		}

	}
	get g() { return this.linkForm.controls; }
	onReset() {
		this.linkForm.reset();
	}
	onEdit(id) {
		if (id != null) {
			this.id = id;
			this.editMode = true;
			this.crudServices.getOne<any>(LinkMaster.getOne, {
				id: this.id
			}).subscribe((response) => {
				const responseArr = response.data[0];
				this.linkForm.patchValue({
					p_id: ((responseArr['p_id'] === 0) ? null : responseArr['p_id']),
					link_name: responseArr['link_name']
				});
			});
		}
	}
	onDelete(p_id) {
		if (p_id) {
			this.crudServices.deleteData<any>(LinkMaster.delete, {
				id: p_id
			}).subscribe((response) => {
				this.toasterService.pop(response.message, response.message, response.data);
				if (response.code === '100') {
					this.getAllLink();
				}
			});
		}
	}
	adminPermission(id) {
		let data = [
			{
				link_id: id,
				role_id: 1,
				access: 1,
			},
			{
				link_id: id,
				role_id: 2,
				access: 1,
			}
		];
		let body = {
			data: data
		}
		this.crudServices.updateData<any>(Permission.superadminDeveloperLinkPermission, body).subscribe((response) => {
			this.toasterService.pop(response.message, 'Success', response.data);
		});
	}
}
