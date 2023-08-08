import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';

import { CrudServices } from '../../../shared/crud-services/crud-services';
import { NotificationsUserRel } from './../../../shared/apis-path/apis-path';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { StaffMemberMaster } from '../../../shared/apis-path/apis-path';
import { element } from 'protractor';

@Component({
	selector: 'app-notifications-masters',
	templateUrl: './notifications-masters.component.html',
	styleUrls: ['./notifications-masters.component.css'],
	providers: [CrudServices, PermissionService, ToasterService],
	encapsulation: ViewEncapsulation.None,
})
export class NotificationsMastersComponent implements OnInit {
	permissions: any;
	isLoading = false;
	isShown = false;
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	staffList: any;
	selectedStaff: any;

	notifications: any;
	pageOfItems: Array<any>;
	p_zone: number = 1;
	constructor(
		private permissionService: PermissionService,
		private toasterService: ToasterService,
		private crudServices: CrudServices) {
	}

	ngOnInit() {
		this.getAllStaffList();
	}



	getAllStaffList() {
		this.crudServices.getAll(StaffMemberMaster.getAll).subscribe(response => {
			if (response['code'] == 100 && response['data'].length > 0) {
				this.staffList = response['data'].map(element => {
					element.fullName = `${element.first_name}  ${element.last_name} `;
					return element;
				})
			}
		})
	}



	getAllNotifications(staff_id) {
		this.crudServices.getOne(NotificationsUserRel.getUserwiseNotificationAccess, { staff_id: staff_id })
			.subscribe(notifications => {
				this.notifications = notifications['data'];
			})
	}


	onStaffChange(event) {
		this.selectedStaff = event.id;
		this.getAllNotifications(event.id)
	}


	notificationUpdate(notifications, event) {
		if (event.checked) {
			let body = {
				notification_id: notifications.id,
				user_id: this.selectedStaff,
				department_id: notifications.dept_id,
				status: 1
			}
			this.crudServices.addData(NotificationsUserRel.add, { data: body }).subscribe(data => {
				// 
			})
		} else {
			this.crudServices.getOne(NotificationsUserRel.delete, { staff_id: this.selectedStaff, notification_id: notifications.id }).subscribe(result => {
				// 
			})
		}
	}

	onChangePage(pageOfItems: Array<any>) {
		this.pageOfItems = pageOfItems;
	}

}
