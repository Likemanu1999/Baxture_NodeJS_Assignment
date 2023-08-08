import * as moment from "moment";

import { CommonApis, Consignments, Dispatch, Notifications, NotificationsUserRel, SubOrg, UsersNotification, financePlanning } from "../../../shared/apis-path/apis-path";
import { Component, ElementRef, Input, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from "@angular/core";
import { ToasterConfig, ToasterService } from "angular2-toaster";

import { CrudServices } from "../../../shared/crud-services/crud-services";
import { ExportService } from "../../../shared/export-service/export-service";
import { LoginService } from "../../login/login.service";
import { MessagingService } from "../../../service/messaging.service";
import { PermissionService } from "../../../shared/pemission-services/pemission-service";
import { Router } from "@angular/router";
import { Table } from "primeng/table";
import { UserDetails } from "../../login/UserDetails.model";
import { map } from "rxjs/operators";

@Component({
	selector: 'app-blacklist-user',
	templateUrl: './blacklist-user.component.html',
	styleUrls: ['./blacklist-user.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [ExportService, ToasterService, PermissionService, LoginService, CrudServices, MessagingService],

})
export class BlacklistUserComponent implements OnInit {
	@ViewChild("dt", { static: false }) table: Table;
	public popoverTitle: string = "Warning";
	public popoverMessage: string = "Are you sure, you want to Change?";
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = "Yes";
	public cancelText: string = "No";
	public placement: string = "right";
	public closeOnOutsideClick: boolean = true;

	private toasterService: ToasterService; // Toast Service Object and config
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});
	user: UserDetails;
	links: any;

	isLoading: boolean = false;
	public selectedColumns: any = [];
	cols: any = [];
	consignmentsList: any;
	notification_users: any = [];
	notification_id_users: any = [];
	notification_tokens: any = []
	notification_details: any;
	message: any;

	constructor(
		toasterService: ToasterService,
		private router: Router,
		private permissionService: PermissionService,
		private loginService: LoginService,
		private exportService: ExportService,
		public crudServices: CrudServices, private messagingService: MessagingService) {
		this.toasterService = toasterService;
		// const perms = this.permissionService.getPermission();
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
	}

	ngOnInit() {
		this.getConsignments();
		this.generateTableHeader();
		this.getNotifications('	SALES_MANUALLY_BLOCK_UNBLOCK_PARTY')
	}


	generateTableHeader() {
		this.cols = [
			{ field: "sub_org_name", header: "Customer", permission: true },
			{ field: "auto_cancel_count", header: "Count", permission: true },
			{ field: "black_list_count", header: "No. Time Black List", permission: true },
			{ field: "blacklist_renewed_date", header: "Last Renew Date", permission: true },


		];

		this.selectedColumns = [
			{ field: "sub_org_name", header: "Customer", permission: true },
			{ field: "auto_cancel_count", header: "Count", permission: true },
			{ field: "black_list_count", header: "No. Time Black List", permission: true },
			{ field: "blacklist_renewed_date", header: "Last Renew Date", permission: true },

		];
	}
	getConsignments() {
		this.crudServices.getAll(SubOrg.getCancelOrderCount).pipe(map((response) => {
			return response['data'].map(ele => { ele.auto_cancel_count = ele.number; return ele; })
		}))
			.subscribe(data => {
				this.consignmentsList = data;
			})

	}

	blacklist(data) {
		let body = {
			sub_org_Data: { blacklist: data.blacklist ? 0 : 1 },
			sub_org_id: data.sub_org_id,
		}
		let notification_body;

		if (data.fcm_web_token) {
			this.notification_tokens.push(data.fcm_web_token);
			this.notification_id_users.push(data.sales_acc_holder)
		}
		if (data.blacklist == 1) {
			notification_body = {
				"title": `${data.sub_org_name}  Unblocked  !`,
				"body": `${this.user.userDet[0].first_name} ${this.user.userDet[0].last_name} Unblocked Customer.  Now ${data.sub_org_name} Active For Sales  Deals.`,
				"click_action": "#"
			}
		} else {
			notification_body = {
				"title": `${data.sub_org_name}  blocked  !`,
				"body": `${this.user.userDet[0].first_name} ${this.user.userDet[0].last_name} blocked Customer.  Now ${data.sub_org_name} Inactive for Sales Deals.`,
				"click_action": "#"
			}
		}


		if (data.blacklist == 1) {
			body.sub_org_Data['black_list_count'] = data.black_list_count + 1;
			body.sub_org_Data['blacklist_renewed_date'] = this.dateFormating(new Date())
		}
		this.crudServices.updateData(SubOrg.update_sub_org, body)
			.subscribe(data => {
				this.generateNotification(notification_body)
				this.getConsignments()
			})

	}

	dateFormating(date) {
		if (date != null) {
			return moment(date).format("YYYY-MM-DD");
		}
	}

	onFilter(event, dt) {

	}



	exportExcel() {
		this.exportService.exportExcel(
			this.consignmentsList,
			"AUTO CANCEL COUNT OF EACH PARTY"
		);
	}



	getNotifications(name: any) {
		this.notification_tokens = []
		this.notification_id_users = []
		this.crudServices.getOne(Notifications.getNotificationDetailsByName, { notification_name: name }).subscribe((notification: any) => {
			if (notification.code == '100' && notification.data.length > 0) {
				this.notification_details = notification.data[0];
				this.crudServices.getOne(NotificationsUserRel.getOne, { notification_id: notification.data[0].id }).subscribe((notificationUser: any) => {
					if (notificationUser.code == '100' && notificationUser.data.length > 0) {
						notificationUser['data'].forEach((element) => {
							if (element.fcm_web_token) {
								this.notification_tokens.push(element.fcm_web_token);
								this.notification_id_users.push(element.id);
							}
						});
					}
				});
			}
		})
	}


	async generateNotification(deal_details) {
		let body = {
			notification: deal_details,
			registration_ids: this.notification_tokens
		};
		this.messagingService.sendNotification(body).then((response) => {
			if (response) {
				this.saveNotifications(body['notification'])
			}
			this.messagingService.receiveMessage();
			this.message = this.messagingService.currentMessage;
		})

	}




	saveNotifications(notification_body) {
		this.notification_users = [];
		for (const element of this.notification_id_users) {

			this.notification_users.push({
				notification_id: this.notification_details.id,
				reciever_user_id: element,
				department_id: 1,
				heading: notification_body.title,
				message_body: notification_body.body,
				url: notification_body.click_action,
				record_id: 1,
				table_name: 'sales_consignment',
			})
		}
		this.crudServices.addData(UsersNotification.add, { data: this.notification_users }).subscribe((data) => {
			this.getNotifications('SALES_MANUALLY_BLOCK_UNBLOCK_PARTY');
		}, (error) => console.error(error));
	}
}
