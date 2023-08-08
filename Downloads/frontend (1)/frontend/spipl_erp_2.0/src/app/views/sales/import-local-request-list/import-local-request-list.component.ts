
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { staticValues, roundQuantity } from '../../../shared/common-service/common-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { Finance, DispatchNew, Notifications, UsersNotification } from '../../../shared/apis-path/apis-path';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";
import { MessagingService } from '../../../service/messaging.service';

@Component({
	selector: 'app-import-local-request-list',
	templateUrl: './import-local-request-list.component.html',
	styleUrls: ['./import-local-request-list.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		CrudServices,
		ToasterService,
		PermissionService,
		ExportService
	],
})

export class ImportLocalRequestListComponent implements OnInit {
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Import Local Request List"
	popoverTitle: string = 'Warning';
	popoverMessage: string = 'Are you sure, you want to Accept Request?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'right';
	cancelClicked: boolean = false;

	user: UserDetails;
	role_id: any = null;
	company_id: any = null;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	delete_opt: boolean = false;
	isLoading: boolean = false;

	datePickerConfig: any = staticValues.datePickerConfig;
	statusList: any = staticValues.fp_status;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	isRange: any;
	selected_status: any = this.statusList[0];
	cols: any = [];
	data: any = [];
	filter: any = [];

	notification_details: any;
	notification_tokens = [];
	notification_id_users = []
	notification_users = [];
	zone_fcm = []
	selectedZone: any;

	constructor(
		private toasterService: ToasterService,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private messagingService: MessagingService
	) {
		this.user = this.loginService.getUserDetails();
		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;
		this.links = this.user.links;
		if (this.user.userDet[0].role_id == 5 || this.user.userDet[0].role_id == 33 || this.user.userDet[0].role_id == 34) {
			this.selectedZone = this.user.userDet[0].id;
		} else {
			this.selectedZone = undefined;
		}
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.delete_opt = perms[3];
	}

	ngOnInit() {
		this.getCols();
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		let condition = {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			company_id: (this.role_id == 1) ? null : this.company_id
		}
		if (this.user.userDet[0].role_id == 5 || this.user.userDet[0].role_id == 33) {
			if (this.user.userDet[0].insider_parent_id != null) {
				condition["zone_id"] = this.user.userDet[0].insider_parent_id;
			} else {
				condition["zone_id"] = this.user.userDet[0].id;
			}
		}
		this.crudServices.getOne<any>(DispatchNew.getPendingDispatches, condition).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.map(x => {
						if (x.category_request_status == 2) {
							x.request_status = "Accepted";
						} else if (x.category_request_status == 1) {
							x.request_status = "Pending";
						} else {
							x.request_status = null;
						}
					});
					this.data = res.data.filter(x => x.category_request_status > 0);
					this.pushDropdown(this.data);
					this.footerTotal(this.data);
				}
			}
			this.table.reset();
		});
	}

	getCols() {
		this.cols = [
			// { field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "request_status", header: "Request Status", sort: false, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "category_request_date", header: "Request Date/Time", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date_Time" },
			{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "city", header: "City", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "godown_name", header: "Godown", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "plan_quantity", header: "Plan Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "balance_quantity", header: "Balance Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "delivery_term", header: "Delivery Term", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "nb", header: "N.B.", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "validity_date", header: "Validity Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "zone", header: "Zone", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "freight_rate", header: "Freight", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null }
		];
		this.filter = ['request_status', 'customer', 'city', 'godown_name', 'grade_name', 'delivery_term', 'zone'];
		this.getData();
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
	}

	pushDropdown(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		let filter_cols = this.cols.filter(col => col.filter == true);
		filter_cols.forEach(element => {
			let unique = data.map(item =>
				item[element.field]
			).filter((value, index, self) =>
				self.indexOf(value) === index
			);
			let array = [];
			unique.forEach(item => {
				array.push({
					value: item,
					label: item
				});
			});
			element.dropdown = array;
		});
	}

	footerTotal(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		let filter_cols = this.cols.filter(col => col.footer == true);
		filter_cols.forEach(element => {
			if (data.length > 0) {
				let total = data.map(item =>
					item[element.field]
				).reduce((sum, item) => sum + item);
				element.total = (element.type == "Quantity") ? roundQuantity(total) : total;
			}

		});
	}

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		// this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		// this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}

	countDaysLeft(from_date, extend_days, company_id) {
		let dayCount = (company_id == 1) ? 10 : 8;
		dayCount += extend_days;
		let startDate = new Date(from_date);
		let endDate = new Date();
		let days = Math.floor((endDate.getTime() - startDate.getTime()) / 1000 / 60 / 60 / 24);
		let total_days = Number(days);
		if (total_days > dayCount) {
			return '*';
		} else {
			return dayCount - total_days;
		}
	}

	onAction(item, type) {
		if (type == 'Add Sales Order') {
			this.router.navigate(["sales/add-sales-order"]);
		}
		if (type == 'Grade_Request') {
			this.getFCMWithNotification('SALES_FINANCE_GRADE_CHANGE_REQ_ACCEPT_REJECT');
			let notification_body = undefined;
			setTimeout(() => {
				if (item.zone_fcm_web_token) {
					this.notification_tokens.push(item.zone_fcm_web_token);
					this.notification_id_users.push(item.zone_id);
				}
				let notification_body = null;
				if (this.notification_details != null) {
					notification_body = {
						notification: {
							"title": `${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name}  Accept  Request  ${this.notification_details.title}`,
							"body": `Customer : ${item.customer}, Planed Quantity : ${item.plan_quantity}, Grade name : ${item.grade_name}`,
							"click_action": "https://erp.sparmarglobal.com:8085/#/sales/finance-plans"
						},
						registration_ids: this.notification_tokens
					}
				}
			}, 2000);
			let body = {
				data: {
					grade_request_status: 2
				},
				id: item.id
			};
			this.crudServices.updateData<any>(Finance.gradeRequestStatus, body).subscribe(res => {
				this.isLoading = false;
				if (res.code == '100') {
					if (res.data.length > 0) {
						this.toasterService.pop('success', 'Success', res['data']);
						this.getCols();
						if (this.notification_details != null && this.notification_details != undefined) {
							this.sendInAppNotification(notification_body);
						}
					}
				}
				this.table.reset();
			});
		}
		if (type == 'Category_Request') {
			// this.getFCMWithNotification('SALES_FINANCE_GRADE_CHANGE_REQ_ACCEPT_REJECT');
			// let notification_body = undefined;
			// setTimeout(() => {
			// 	if (item.zone_fcm_web_token) {
			// 		this.notification_tokens.push(item.zone_fcm_web_token);
			// 		this.notification_id_users.push(item.zone_id);
			// 	}
			// 	let notification_body = null;
			// 	if (this.notification_details != null) {
			// 		notification_body = {
			// 			notification: {
			// 				"title": `${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name}  Accept  Request  ${this.notification_details.title}`,
			// 				"body": `Customer : ${item.customer}, Planed Quantity : ${item.plan_quantity}, Grade name : ${item.grade_name}`,
			// 				"click_action": "https://erp.sparmarglobal.com:8085/#/sales/finance-plans"
			// 			},
			// 			registration_ids: this.notification_tokens
			// 		}
			// 	}
			// }, 2000);
			let body = {
				data: {
					category_request_status: 2
				},
				id: item.id
			};
			this.crudServices.updateData<any>(Finance.categoryRequestStatus, body).subscribe(res => {
				this.isLoading = false;
				if (res.code == '100') {
					if (res.data.length > 0) {
						this.toasterService.pop('success', 'Success', res['data']);
						this.getCols();
						if (this.notification_details != null && this.notification_details != undefined) {
							// this.sendInAppNotification(notification_body);
						}
					}
				}
				this.table.reset();
			});
		}
	}

	onChangeStatus(e) {
		if (e != null && e != undefined) {
			this.selected_status = {
				id: e.value.id,
				name: e.value.name
			};
			this.getCols();
		}
	}

	exportData(type) {
		let fileName = this.selected_status.name + ' - ' + this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
		let exportData = [];
		for (let i = 0; i < this.data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					if (this.cols[j]["field"] == "quantity") {
						obj[this.cols[j]["header"]] = this.data[i][this.cols[j]["field"]] + " MT";
					} else {
						obj[this.cols[j]["header"]] = this.data[i][this.cols[j]["field"]];
					}
				}
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < this.cols.length; j++) {
			if (this.cols[j]["field"] != "action") {
				if (this.cols[j]["field"] == "quantity") {
					foot[this.cols[j]["header"]] = this.cols[j]["total"] + " MT";
				} else if (this.cols[j]["field"] == "deal_rate" ||
					this.cols[j]["field"] == "freight_rate") {
					foot[this.cols[j]["header"]] = this.cols[j]["total"];
				} else {
					foot[this.cols[j]["header"]] = "";
				}
			}
		}
		exportData.push(foot);
		if (type == 'Excel') {
			this.exportService.exportExcel(exportData, fileName);
		} else {
			let exportColumns = this.cols.map(function (col) {
				if (col.field != "action") {
					return { title: col.header, dataKey: col.header }
				}
			});
			this.exportService.exportPdf(exportColumns, exportData, fileName);
		}
	}
	// SALES_FINANCE_GRADE_CHANGE_REQ_ACCEPT_REJECT


	//!NOTIFICATION DETAILS WITH FCM / STAFF ID / NAME MASTER
	getFCMWithNotification(name) {
		this.notification_details = undefined;
		this.notification_tokens = [];
		this.notification_id_users = [];
		let company_id = this.user.userDet[0].company_id;
		this.crudServices.getOne(Notifications.getNotificationWithFCM, { notification_name: name, company_id: company_id })
			.subscribe((notification: any) => {
				if (notification) {
					this.notification_details = notification.data[0];
					this.notification_tokens = [...this.notification_tokens, ...notification.data[0].fcm_list];
					this.notification_id_users = [...this.notification_id_users, ...notification.data[0].staff_id];
				}
			});
	}


	//!SEND NOTIFICATION TO SELECTED FCM / AND ID 
	sendInAppNotification(body) {
		if (body != null && body != undefined) {
			this.messagingService.sendNotification(body).then((response) => {
				if (response) {
					this.saveNotifications(body['notification'])
				}
				this.messagingService.receiveMessage();
			})
		}
	}


	//!SAVE NOTIFICATION INSIDE DATABASE 
	saveNotifications(notification_body) {
		this.notification_users = [];
		for (const element of this.notification_id_users) {
			this.notification_users.push({
				notification_id: (this.notification_details != null && this.notification_details != undefined) ? this.notification_details.id : null,
				reciever_user_id: element,
				department_id: 1,
				heading: notification_body.title,
				message_body: notification_body.body,
				url: notification_body.click_action,
				record_id: 1,
				table_name: 'finance',
			})
		}

		this.crudServices.addData(UsersNotification.add, { data: this.notification_users }).subscribe((data) => {
		},
			(error) => { console.error(error) });
	}

}
