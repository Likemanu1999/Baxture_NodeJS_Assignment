import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { roundAmount, roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import {
	Finance,
	DispatchNew,
	ShortDamage,
	SalesReturn,
	Notifications,
	UsersNotification
} from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";
import { MessagingService } from '../../../service/messaging.service';
@Component({
	selector: 'app-dispatch',
	templateUrl: './dispatch.component.html',
	styleUrls: ['./dispatch.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService],
})

export class DispatchComponent implements OnInit {

	@ViewChild("shortDamageModal", { static: false }) public shortDamageModal: ModalDirective;
	@ViewChild("salesReturnModal", { static: false }) public salesReturnModal: ModalDirective;
	@ViewChild("viewDealModal", { static: false }) public viewDealModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Dispatches";
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to delete?';
	popoverMessage2: string = 'Are you sure, you want to Send Grade Change Request?';
	popoverMessage3: string = 'Are you sure, you want to Cancel Grade Change Request Request?';
	popoverMessage4: string = 'Are you sure, you want to Send Category Change Request?';
	popoverMessage5: string = 'Are you sure, you want to Cancel Category Change Request Request?';
	popoverMessage6: string = 'Are you sure, Material is Loaded Successfully?';
	popoverMessage7: string = 'Are you sure, you want to Approve For Billing?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'right';
	cancelClicked: boolean = false;

	user: UserDetails;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	delete_opt: boolean = false;

	grade_request: boolean = false;
	category_request: boolean = false;
	loaded_button: boolean = false;
	sign_copy_upload: boolean = false;
	approve_for_billing: boolean = false;
	short_damage: boolean = false;
	sales_return: boolean = false;
	enableStatus: boolean = false;

	isLoading: boolean = false;
	max_date: any = new Date();
	company_id: any = null;
	role_id: any = null;

	datePickerConfig: any = staticValues.datePickerConfig;
	statusList: any = staticValues.dispatch_new_status;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	isRange: any;
	selected_status: any = this.statusList[0];
	cols: any = [];
	data: any = [];
	filter: any = [];
	shortDamageForm: FormGroup;
	salesReturnForm: FormGroup;

	notification_details: any;
	notification_tokens = [];
	notification_id_users = []
	notification_users = [];
	zone_fcm = [];
	selectedDispatch: any;

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
		this.role_id = this.user.userDet[0].role_id;
		this.company_id = this.user.userDet[0].company_id;
		this.links = this.user.links;

		this.loaded_button = (this.links.find(x => x == 'loaded_button') != null) ? true : false;
		this.sign_copy_upload = (this.links.find(x => x == 'sign_copy_upload') != null) ? true : false;
		this.grade_request = (this.links.find(x => x == 'grade_request') != null) ? true : false;
		this.category_request = (this.links.find(x => x == 'category_request') != null) ? true : false;
		this.approve_for_billing = (this.links.find(x => x == 'approve_for_billing') != null) ? true : false;
		this.short_damage = (this.links.find(x => x == 'short_damage') != null) ? true : false;
		this.sales_return = (this.links.find(x => x == 'sales_return') != null) ? true : false;

		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.delete_opt = perms[3];

		if (this.user.userDet[0].role_id == 18) {
			this.enableStatus = false;
			this.selected_status = this.statusList[1];
		} else {
			this.enableStatus = true;
			this.selected_status = this.statusList[0];
		}

	}

	ngOnInit() {
		this.initForm();
		this.getCols();
	}

	initForm() {
		this.shortDamageForm = new FormGroup({
			id: new FormControl(null),
			dispatch_id: new FormControl(null, Validators.required),
			short_quantity: new FormControl(null),
			damage_quantity: new FormControl(null),
			wet_quantity: new FormControl(null),
			remark: new FormControl(null, Validators.required)
		});
		this.salesReturnForm = new FormGroup({
			dispatch_id: new FormControl(null, Validators.required),
			quantity: new FormControl(null, Validators.required),
			transport_charges: new FormControl(null, Validators.required),
			date: new FormControl(null, Validators.required),
			remark: new FormControl(null, Validators.required)
		});
	}

	getData() {
		this.data = [];
		if (this.selected_status.id == 0) {
			let condition = {
				from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
				to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
				status: this.selected_status.id,
				company_id: (this.role_id == 1 || this.role_id == 2 || this.role_id == 11 || this.role_id == 50) ? null : this.company_id,
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
						res.data.forEach(element => {
							element.customer = element.customer + ' (' + element.location_vilage + ')';
							element.days_left = this.countDaysLeft(element.plan_date, element.validity_date);
							element.plan_quantity = roundQuantity(element.plan_quantity);
							element.balance_quantity = roundQuantity(element.balance_quantity);
						});
						this.data = res.data.filter(x => x.balance_quantity > 0);
						this.pushDropdown(this.data);
						this.footerTotal(this.data);
					}
				}
				this.table.reset();
			});
		} else if (this.selected_status.id != 0) {
			let condition = {
				from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
				to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
				status: this.selected_status.id,
				company_id: null,//(this.role_id == 1) ? null : this.company_id,
				godown_incharge_id: (this.enableStatus) ? null : this.user.userDet[0].id,
			}
			if (this.user.userDet[0].role_id == 5 || this.user.userDet[0].role_id == 33) {
				if (this.user.userDet[0].insider_parent_id != null) {
					condition["zone_id"] = this.user.userDet[0].insider_parent_id;
				} else {
					condition["zone_id"] = this.user.userDet[0].id;
				}
			}
			this.crudServices.getOne<any>(DispatchNew.getConfirmDispatches, condition).subscribe(res => {
				this.isLoading = false;
				if (res.code == '100') {
					if (res.data.length > 0) {
						res.data.forEach(element => {
							element.customer = element.customer + ' (' + element.location_vilage + ')';
							element.dispatch_quantity = roundQuantity(element.dispatch_quantity);
						});
						this.data = res.data;
						this.pushDropdown(this.data);
						this.footerTotal(this.data);
					}
				}
				this.table.reset();
			});
		}
	}

	getCols() {
		if (this.selected_status.id == 0) {
			this.cols = [
				{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "con_id", header: "Con_ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "id", header: "F_ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "days_left", header: "Days Left", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
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
				{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			];
			this.filter = ['id', 'customer', 'city', 'godown_name', 'grade_name', 'delivery_term', 'zone'];
			this.getData();
		} else {
			this.cols = [
				{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "id", header: "ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "city", header: "City", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "dispatch_quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
				{ field: "godown_name", header: "Godown", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "transporter", header: "Transporter", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "truck_no", header: "Truck No", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "dispatch_date", header: "Dispatch Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
				{ field: "final_rate", header: "Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
				{ field: "zone", header: "Zone", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "lr_no", header: "LR No", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "invoice_no", header: "Invoice No.", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "invoice_date", header: "Invoice Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			];
			this.filter = ['id', 'customer', 'city', 'grade_name', 'godown_name', 'transporter', 'truck_no', 'zone', 'lr_no', 'godown_incharge', 'invoice_no'];
			this.getData();
		}
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

	countDaysLeft(from_date, to_date) {
		let startDate = new Date(from_date);
		let endDate = new Date(to_date);
		let days = Math.floor((endDate.getTime() - startDate.getTime()) / 1000 / 60 / 60 / 24);
		if (Number(days) < 0) {
			return '*';
		} else {
			return Number(days);
		}
	}

	onAction(item, type) {
		this.selectedDispatch = item;
		if (type == 'View') {
			this.viewDealModal.show();
		} else if (type == 'Edit') {
			this.router.navigate(["sales/edit-dispatch", item.company_id, item.id]);
		} else if (type == 'Delete') {
			this.crudServices.deleteData<any>(DispatchNew.delete, {
				id: item.id,
				fp_id: item.fp_id,
				stock_type: item.stock_type
			}).subscribe(res => {
				if (res.code == '100') {
					if (res.data.length > 0) {
						this.toasterService.pop('success', 'Success', res['data']);
						this.getCols();
					}
				} else {
					this.toasterService.pop('error', 'Warning', 'You Cannot Delete This Order');
				}
			});
		} else if (type == 'Add') {
			this.router.navigate(["sales/add-dispatch", item.company_id, item.con_id, item.id]);
		} else if (type == 'Grade_Request') {
			this.getFCMWithNotification("SALES_FINANCE_GRADE_CHANGE_REQ");
			let msg = (item.grade_request_status == 0) ? 'Grade Request Send' : 'Grade Request Cancel';
			let notification_body = undefined;
			if (this.notification_details != null) {
				setTimeout(() => {
					if (item.zone_fcm_web_token) {
						this.notification_tokens = [...this.notification_tokens, item.zone_fcm_web_token];
						this.notification_id_users = [...this.notification_id_users, item.zone_id];
					}
					notification_body = {
						notification: {
							"title": `${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} ${msg}   ${this.notification_details.title}`,
							"body": `Customer : ${item.customer}, Planed Quantity : ${item.plan_quantity}, Grade name : ${item.grade_name}`,
							"click_action": "https://erp.sparmarglobal.com:8085/#/sales/logistic"
						},
						registration_ids: this.notification_tokens
					}
				}, 2000);
			}
			let body = {
				data: {
					grade_request_status: (item.grade_request_status == 0) ? 1 : 0
				},
				id: item.id
			};
			this.crudServices.updateData<any>(Finance.gradeRequestStatus, body).subscribe(res => {
				this.isLoading = false;
				if (res.code == '100') {
					if (res.data.length > 0) {
						this.toasterService.pop('success', 'Success', res['data']);
						this.getCols();
						this.sendInAppNotification(notification_body)
					}
				}
				this.table.reset();
			});
		} else if (type == 'Category_Request') {
			this.getFCMWithNotification("SALES_FINANCE_GRADE_CHANGE_REQ");
			// let msg = (item.grade_request_status == 0) ? 'Category Request Send' : 'Category Request Cancel';
			// let notification_body = undefined;
			// if (this.notification_details != null) {
			// 	setTimeout(() => {
			// 		if (item.zone_fcm_web_token) {
			// 			this.notification_tokens = [...this.notification_tokens, item.zone_fcm_web_token];
			// 			this.notification_id_users = [...this.notification_id_users, item.zone_id];
			// 		}
			// 		notification_body = {
			// 			notification: {
			// 				"title": `${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} ${msg}   ${this.notification_details.title}`,
			// 				"body": `Customer : ${item.customer}, Planed Quantity : ${item.plan_quantity}, Grade name : ${item.grade_name}`,
			// 				"click_action": "https://erp.sparmarglobal.com:8085/#/sales/logistic"
			// 			},
			// 			registration_ids: this.notification_tokens
			// 		}
			// 	}, 2000);
			// }
			let body = {
				data: {
					category_request_status: (item.category_request_status == 0) ? 1 : 0
				},
				id: item.id
			};
			this.crudServices.updateData<any>(Finance.categoryRequestStatus, body).subscribe(res => {
				this.isLoading = false;
				if (res.code == '100') {
					if (res.data.length > 0) {
						this.toasterService.pop('success', 'Success', res['data']);
						this.getCols();
						// this.sendInAppNotification(notification_body)
					}
				}
				this.table.reset();
			});
		} else if (type == 'Damage') {
			this.crudServices.getOne<any>(ShortDamage.getShortDamage, {
				dispatch_id: item.id
			}).subscribe(res => {
				if (res.code == '100') {
					this.getFCMWithNotification("SALES_DISPATCH_SHORT_DAMAGE");
					this.shortDamageForm.reset();
					if (res.data.length > 0) {
						this.shortDamageForm.patchValue({
							id: Number(res.data[0].id),
							dispatch_id: Number(res.data[0].dispatch_id),
							short_quantity: Number(res.data[0].short_quantity),
							damage_quantity: Number(res.data[0].damage_quantity),
							wet_quantity: Number(res.data[0].wet_quantity),
							remark: res.data[0].remark
						});
					} else {
						this.shortDamageForm.patchValue({
							dispatch_id: item.id
						});
					}
					this.shortDamageModal.show();
				}
			});
		} else if (type == 'Return') {
			this.getFCMWithNotification("SALES_DISPATCH_RETURN");
			this.salesReturnForm.reset();
			this.salesReturnForm.patchValue({
				dispatch_id: item.id,
				quantity: (Number(item.quantity) + Number(item.logistic_power)) * 1000,
				transport_charges: 0,
				date: new Date()
			});
			this.salesReturnModal.show();
		} else if (type == 'Loaded') {
			this.getFCMWithNotification("SALES_DISPATCH_LOAD_CONFIRMATION");
			let notification_body = undefined;
			if (this.notification_details != null) {
				setTimeout(() => {
					if (item.zone_fcm_web_token) {
						this.notification_tokens = [...this.notification_tokens, item.zone_fcm_web_token];
						this.notification_id_users = [...this.notification_id_users, item.zone_id];
					}
					notification_body = {
						notification: {
							"title": `${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name}  ${this.notification_details.title}`,
							"body": `Customer :${item.customer}, Grade : ${item.grade_name},  Quantity : ${item.quantity}  Godown : ${item.godown_name}`,
							"click_action": "#"
						},
						registration_ids: this.notification_tokens

					}
				}, 2000);
			}
			let body = {
				data: {
					status: 1
				},
				id: item.id
			};
			this.crudServices.updateData(DispatchNew.updateStatus, body).subscribe(res => {
				if (res['code'] == '100') {
					this.sendInAppNotification(notification_body)
					this.toasterService.pop('success', 'Success', res['data']);
					this.getData();
				}
			});

		} else if (type == 'Approve') {
			this.getFCMWithNotification("SALES_DISPATCH_APPROVE_FOR_BILLING");
			let notification_body = undefined;
			if (this.notification_details != null) {
				setTimeout(() => {
					if (item.zone_fcm_web_token) {
						this.notification_tokens = [...this.notification_tokens, item.zone_fcm_web_token];
						this.notification_id_users = [...this.notification_id_users, item.zone_id];
					}
					notification_body = {
						notification: {
							"title": `${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name}  ${this.notification_details.title}`,
							"body": `Customer :${item.customer}, Grade : ${item.grade_name},  Quantity : ${item.quantity}  Godown : ${item.godown_name}`,
							"click_action": "#"
						},
						registration_ids: this.notification_tokens
					}
				}, 2000)
			}
			let body = {
				data: {
					status: 2
				},
				id: item.id
			};
			this.crudServices.updateData(DispatchNew.updateStatus, body).subscribe(res => {
				if (res['code'] == '100') {
					this.sendInAppNotification(notification_body)
					this.toasterService.pop('success', 'Success', res['data']);
					this.getData();
				}
			});
		} else if (type == 'Transporter') {
			this.getFCMWithNotification('SALES_DISPATCH_TRANSPORTER_BILL');
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

	submitShortDamageForm() {
		let notification_body = undefined;

		if (this.notification_details != null) {
			if (this.selectedDispatch.zone_fcm_web_token) {
				this.notification_tokens = [...this.notification_tokens, this.selectedDispatch.zone_fcm_web_token];
				this.notification_id_users = [...this.notification_id_users, this.selectedDispatch.zone_id];
			}
			notification_body = {
				notification: {
					"title": `${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} ${this.notification_details.title}`,
					"body": `Customer : ${this.selectedDispatch.customer}, Quantity : ${this.selectedDispatch.plan_quantity}, Grade name : ${this.selectedDispatch.grade_name},	Short Quantity : ${Number(this.shortDamageForm.value.short_quantity)}, Damage Quantity : ${Number(this.shortDamageForm.value.damage_quantity)}, Wet Quantity : ${Number(this.shortDamageForm.value.wet_quantity)}, Remark :  ${this.shortDamageForm.value.remark}`,
					"click_action": "https://erp.sparmarglobal.com:8085/#/sales/logistic"
				},
				registration_ids: this.notification_tokens
			}
		}
		let data = {
			dispatch_id: this.shortDamageForm.value.dispatch_id,
			short_quantity: Number(this.shortDamageForm.value.short_quantity),
			damage_quantity: Number(this.shortDamageForm.value.damage_quantity),
			wet_quantity: Number(this.shortDamageForm.value.wet_quantity),
			remark: this.shortDamageForm.value.remark
		};
		let body = {
			data: data
		};
		let id = this.shortDamageForm.value.id;

		if (id == null) {
			this.crudServices.addData(ShortDamage.add, body).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', res['data']);
					this.closeModal();
					this.sendInAppNotification(notification_body);
				}
			});
		} else {
			body['id'] = id;
			this.crudServices.updateData(ShortDamage.update, body).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', res['data']);
					this.closeModal();
					this.sendInAppNotification(notification_body);
				}
			});
		}
	}

	submitSalesReturnForm() {
		let notification_body = undefined;
		if (this.notification_details != null) {
			if (this.selectedDispatch.zone_fcm_web_token) {
				this.notification_tokens.push(this.selectedDispatch.zone_fcm_web_token);
				this.notification_id_users.push(this.selectedDispatch.zone_id);
			}
			notification_body = {
				notification: {
					"title": `${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} ${this.notification_details.title}`,
					"body": `Customer : ${this.selectedDispatch.customer},  Quantity : ${this.selectedDispatch.plan_quantity}, Grade name : ${this.selectedDispatch.grade_name},Return Quantity: ${Number(this.salesReturnForm.value.quantity) / 1000}, sales Return Date :  ${moment(this.salesReturnForm.value.date).format('YYYY-MM-DD')}`,
					"click_action": "https://erp.sparmarglobal.com:8085/#/sales/logistic"
				},
				registration_ids: this.notification_tokens
			}
		}
		let data = {
			dispatch_id: this.salesReturnForm.value.dispatch_id,
			quantity: (Number(this.salesReturnForm.value.quantity) / 1000),
			transport_charges: Number(this.salesReturnForm.value.charges),
			date: moment(this.salesReturnForm.value.date).format('YYYY-MM-DD'),
			remark: this.salesReturnForm.value.remark
		};
		let body = {
			data: data
		};
		this.crudServices.addData(SalesReturn.add, body).subscribe(res => {
			if (res['code'] == '100') {
				this.toasterService.pop('success', 'Success', res['data']);
				this.closeModal();
				this.sendInAppNotification(notification_body);
			}
		});
	}

	closeModal() {
		this.shortDamageForm.reset();
		this.shortDamageModal.hide();
		this.salesReturnForm.reset();
		this.salesReturnModal.hide();
		this.viewDealModal.hide();
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
				} else if (this.cols[j]["field"] == "final_rate" ||
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

	//!NOTIFICATION DETAILS WITH FCM / STAFF ID / NAME MASTER
	getFCMWithNotification(name) {
		this.notification_details = undefined;
		this.notification_tokens = [];
		this.notification_id_users = [];
		let company_id = this.user.userDet[0].company_id;
		this.crudServices.getOne(Notifications.getNotificationWithFCM, { notification_name: name, company_id: company_id })
			.subscribe((notification: any) => {
				if (notification.code == '100') {
					if (notification.data.length > 0) {
						this.notification_details = notification.data[0];
						this.notification_tokens = [...this.notification_tokens, ...notification.data[0].fcm_list];
						this.notification_id_users = [...this.notification_id_users, ...notification.data[0].staff_id];
					}
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
				notification_id: this.notification_details.id,
				reciever_user_id: element,
				department_id: 1,
				heading: notification_body.title,
				message_body: notification_body.body,
				url: notification_body.click_action,
				record_id: 1,
				table_name: 'sales_orders',
			})
		}
		this.crudServices.addData(UsersNotification.add, { data: this.notification_users }).subscribe((data) => {
		},
			(error) => { console.error(error) });
	}


	//!WHATSAPP ACCKOWLKEDGE TO CUSTOMER AND



}
