import { Component, OnInit, ElementRef, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { RoleTableData, RoleMasterDtService } from '../../masters/role-master/role-master-dt-service';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Permission, RoleMaster } from "../../../shared/apis-path/apis-path";

@Component({
	selector: 'app-permission',
	templateUrl: './permission.component.html',
	styleUrls: ['./permission.component.css'],
	providers: [CrudServices, PermissionService, RoleMasterDtService, ToasterService],
	encapsulation: ViewEncapsulation.None,
})
export class PermissionComponent implements OnInit {
	permissions: any;
	isLoading = false;
	isShown = false;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	roles: RoleTableData;
	role_id: number;
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	/**
	* Getting roles from the msater.
	*/
	constructor(
		private permissionService: PermissionService,
		private roleMaster: RoleMasterDtService,
		private toasterService: ToasterService,
		private elRef: ElementRef,
		private crudServices: CrudServices) {
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
	}

	ngOnInit() {
		this.crudServices.getAll<any>(RoleMaster.getAll).subscribe(res => {
			this.roles = res.data;
			this.isLoading = false;
		});
	}

	/**
	 * Binding click listener to all checkboxes.
	 */
	addClickListener() {
		this.elRef.nativeElement.querySelectorAll('input[type=checkbox]:not(.all_check)').forEach(
			function (item) {
				item.addEventListener('click', function (event) {
					this.handleClick(event);
				}.bind(this));
			}.bind(this));
	}
	/**
	* On checkbox click we need to  cck which option checkbox holding by taking class name of checkbox.
	* if it is link checkbox click then we are calling to signle_check_link_update() of service.
	* otherwise signle_check_update() gets called.
	*/
	handleClick(event) {
		const p_id = event.srcElement.value;
		const type = event.srcElement.className;
		let flag = event.srcElement.checked;
		if (flag === true) {
			flag = 1;
		} else {
			flag = 0;
		}
		let create_op: string;
		let view_op: string;
		let update_op: string;
		let del_op: string;
		let link_op: string;
		if (type === 'create_op') {
			create_op = flag;
		} else if (type === 'view_op') {
			view_op = flag;
		} else if (type === 'update_op') {
			update_op = flag;
		} else if (type === 'del_op') {
			del_op = flag;
		} else if (type === 'link_op') {
			link_op = flag;
		}
		if (type !== 'link_op') {
			this.crudServices.updateData<any>(Permission.signleCheckUpdate, {
				role_id: this.role_id,
				p_id: p_id,
				create_op: create_op,
				view_op: view_op,
				update_op: update_op,
				delete_op: del_op,
			}).subscribe((response) => {
				this.toasterService.pop(response.message, 'Success', response.data);
			});
		} else {
			this.crudServices.updateData<any>(Permission.signleCheckLinkUpdate, {
				role_id: this.role_id,
				link_id: p_id,
				access: link_op,
			}).
				subscribe((response) => {
					this.toasterService.pop(response.message, 'Success', response.data);
				});
		}
	}
	/**
	 * On Select All Permissions click  we are sending role_id & flag to the backend.
	 */
	onAllCheck(event) {
		if (confirm('Are you sure?')) {
			const type = event.srcElement.className;
			let flag = event.srcElement.checked;
			if (flag === true) {
				flag = 1;
			} else {
				flag = 0;
			}
			this.crudServices.updateData<any>(Permission.allCheckUpdate, {
				role_id: this.role_id,
				check: flag
			}).subscribe((response) => {
				this.toasterService.pop(response.message, 'Success', response.data);
				this.loadPermissions();
				event.srcElement.checked = false;
			});
		} else {
			event.srcElement.checked = false;
		}
	}
	/**
	 * On role dropdown change we are getting exisiting permission's  of role.
	 */
	// onRoleChange(event) {
	// 	if (event) {
	// 		this.role_id = event.id;
	// 		this.isLoading = true;
	// 		this.crudServices.getOne<any>(Permission.getOne, {
	// 			role_id: this.role_id
	// 		}).subscribe(res => {
	// 			this.isLoading = false;
	// 			this.isShown = true;
	// 			this.addClickListener();
	// 		});



	// 		// this.loadPermissions();
	// 	} else {
	// 		this.permissions = '';
	// 		this.isLoading = false;
	// 		this.isShown = false;
	// 	}
	// }

	// loadPermissions() {



	// 	// this.developerService.getPermission(this.role_id).subscribe((response) => {
	// 	// 	this.permissions = response['table_data'];
	// 	// 	this.isLoading = false;
	// 	// 	this.isShown = true;
	// 	// 	setTimeout(() => {
	// 	// 		this.addClickListener();
	// 	// 	}, 1000);
	// 	// });
	// }




	/**
	 * On role dropdown change we are getting exisiting permission's  of role.
	 */
	onRoleChange(event) {
		if (event) {
			this.role_id = event.id;
			this.loadPermissions();
		} else {
			this.permissions = '';
			this.isLoading = false;
			this.isShown = false;
		}
	}
	loadPermissions() {
		this.isLoading = true;
		this.crudServices.getOne<any>(Permission.getOne, {
			role_id: this.role_id
		}).subscribe((response) => {
			this.permissions = response['table_data'];
			this.isLoading = false;
			this.isShown = true;
			setTimeout(() => {
				this.addClickListener();
			}, 1000);
		});
	}


}
