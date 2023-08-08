import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { DeveloperServices } from '../developer.service';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { MenuList } from './menu.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { MenuMaster, Permission } from '../../../shared/apis-path/apis-path';

@Component({
	selector: 'app-menu-master',
	templateUrl: './menu-master.component.html',
	styleUrls: ['./menu-master.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [PermissionService, DeveloperServices, ToasterService, CrudServices]
})
export class MenuMasterComponent implements OnInit {
	p_id: number;
	editMode: boolean = false;
	isLoading = false;
	public filterQuery = '';
	filterArray = ['parentName', 'menu_name', 'link'];
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
	public data: Array<MenuList>;
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	menuForm: FormGroup;
	constructor(private permissionService: PermissionService,
		private developerService: DeveloperServices,
		private toasterService: ToasterService,
		private crudServices: CrudServices) {
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.menuForm = new FormGroup({
			'parent_id': new FormControl(null),
			'menu_name': new FormControl(null, Validators.required),
			'link': new FormControl(null, Validators.required),
			'fa_fa_class': new FormControl(null, Validators.required),
			'add_opt': new FormControl(null),
			'edit_opt': new FormControl(null),
			'del_opt': new FormControl(null),
			'view_opt': new FormControl(null),
		});
	}

	ngOnInit() {
		this.getAllMenu();
	}
	getAllMenu() {

		this.isLoading = true;
		this.crudServices.getAll<any>(MenuMaster.getAll).subscribe(res => {
			this.data = res.data;
			this.isLoading = false;
		});

	}
	onSubmit() {
		let data = {
			menu_name: this.g.menu_name.value,
			parent_id: this.g.parent_id.value,
			link: this.g.link.value,
			fa_fa_class: this.g.fa_fa_class.value,
			add_opt: ((this.g.add_opt.value === true) ? '1' : '0'),
			edit_opt: ((this.g.edit_opt.value === true) ? '1' : '0'),
			view_opt: ((this.g.view_opt.value === true) ? '1' : '0'),
			del_opt: ((this.g.del_opt.value === true) ? '1' : '0')
		}
		if (this.editMode) {
			data['p_id'] = this.p_id;
			this.crudServices.updateData<any>(MenuMaster.update, data).subscribe((response) => {
				this.toasterService.pop(response.message, response.message, response.data);
				if (response.code === '100') {
					this.getAllMenu();
					this.onReset();
					this.editMode = false;
				}
			});
		} else {
			this.crudServices.addData<any>(MenuMaster.add, data).subscribe((response) => {
				this.toasterService.pop(response.message, response.message, "New Menu Added");
				if (response.code === '100') {
					this.adminPermission(response.data[0]);
					this.getAllMenu();
					this.onReset();
				}
			});
		}

	}
	get g() { return this.menuForm.controls; }
	onReset() {
		this.menuForm.reset();
	}
	onEdit(item) {

		if (item) {
			this.p_id = item.p_id;
			this.editMode = true;

			const responseArr = item;
			this.menuForm.patchValue({
				parent_id: ((responseArr['parent_id'] === 0) ? null : responseArr['parent_id']),
				menu_name: responseArr['menu_name'],
				link: responseArr['link'],
				fa_fa_class: responseArr['fa_fa_class'],
				add_opt: ((responseArr['add_opt'] === 1) ? true : false),
				edit_opt: ((responseArr['edit_opt'] === 1) ? true : false),
				view_opt: ((responseArr['view_opt'] === 1) ? true : false),
				del_opt: ((responseArr['del_opt'] === 1) ? true : false),
			});

		}

		// if (id) {
		//   this.p_id = id;
		//   this.editMode = true;
		//   this.crudServices.getOne<any>(MenuMaster.getOne, {
		// 		p_id: id}).subscribe((response) => {

		//     const responseArr = response.data[0];
		//     this.menuForm.patchValue({
		//       parent_id: ((responseArr['parent_id'] === 0) ? null : responseArr['parent_id']),
		//       menu_name: responseArr['menu_name'],
		//       link: responseArr['link'],
		//       fa_fa_class: responseArr['fa_fa_class'],
		//       add_opt: ((responseArr['add_opt'] === 1) ? true : false),
		//       edit_opt: ((responseArr['edit_opt'] === 1) ? true : false),
		//       view_opt: ((responseArr['view_opt'] === 1) ? true : false),
		//       del_opt: ((responseArr['del_opt'] === 1) ? true : false),
		//   });
		//   });
		// }
	}
	onDelete(p_id) {
		if (p_id) {
			this.crudServices.deleteData<any>(MenuMaster.delete, {
				p_id: p_id
			}).subscribe((response) => {
				this.toasterService.pop(response.message, response.message, response.data);
				if (response.code === '100') {
					this.getAllMenu();
				}
			});
		}
	}
	adminPermission(item) {
		let data = [
			{
				role_id: 1,
				p_id: Number(item.p_id),
				add_opt: Number(item.add_opt),
				edit_opt: Number(item.edit_opt),
				view_opt: Number(item.view_opt),
				del_opt: Number(item.del_opt)
			},
			{
				role_id: 2,
				p_id: Number(item.p_id),
				add_opt: Number(item.add_opt),
				edit_opt: Number(item.edit_opt),
				view_opt: Number(item.view_opt),
				del_opt: Number(item.del_opt)
			}
		];

		let body = {
			data: data
		}
		this.crudServices.updateData<any>(Permission.superadminDeveloperMenuPermission, body).subscribe((response) => {
			this.toasterService.pop(response.message, 'Success', response.data);
		});

	}
}
