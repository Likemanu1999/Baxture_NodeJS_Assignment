
import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import {
	Consignments,
	Dispatch,
	DispatchBilling,
	DispatchPayments,
	EmailTemplateMaster,
	FileUpload,
	GodownMaster,
	LocalPurchase,
	Notifications,
	UsersNotification,
	PercentageDetails,
	SalesOrders,
	ImportSales
} from '../../../shared/apis-path/apis-path';
import { roundAmount, roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";
import { MessagingService } from '../../../service/messaging.service';
import { FileNamePipe } from '../../../shared/file-name/file-name.pipe';
import { forkJoin, Observable } from 'rxjs';
import { tap } from "rxjs/operators";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
@Component({
	selector: 'app-dispatch-billing',
	templateUrl: './dispatch-billing.component.html',
	styleUrls: ['./dispatch-billing.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService, FileNamePipe, Calculations]
})

export class DispatchBillingComponent implements OnInit {

	@ViewChild("invoiceModal", { static: false }) public invoiceModal: ModalDirective;
	@ViewChild("mailToCustomerModal", { static: false }) public mailToCustomerModal: ModalDirective;
	@ViewChild("mailToGodownModal", { static: false }) public mailToGodownModal: ModalDirective;
	@ViewChild("viewDealModal", { static: false }) public viewDealModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Billing";
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to delete?';
	popoverMessage2: string = 'Are you sure, you want to change Status?';
	popoverMessage3: string = 'Are you sure, you want to proceed for Payment?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'right';
	cancelClicked: boolean = false;

	user: UserDetails;
	links: string[] = [];
	role_id: any = null;
	company_id: any = null;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	customer_email_billing: boolean = false;
	company_wise_billing: boolean = false;
	proceed_for_payment: boolean = false;
	max_date: any = new Date();
	add_edit: any = null;
	html3: any
	footer1: any
	isRange: any
	tomailtext: any = ['parmar@parmarglobal.com']

	datePickerConfig: any = staticValues.datePickerConfig;
	statusList: any = staticValues.billing_status;
	companyList: any = staticValues.company_list;
	selected_date_range: any = [
		new Date(moment().format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	selected_status: any = this.statusList[2];
	selected_company: any = null;
	cols: any = [];
	data: any = [];
	filter: any = [];
	invoiceForm: FormGroup;
	fileData = new FormData();
	filesArr: Array<File> = [];

	notification_details: any;
	notification_tokens = [];
	notification_id_users = []
	notification_users = [];
	zone_fcm = [];
	selectedDispatch: any;
	selected_deal: any;
	percent: any;

	EmailData: any[];
	MobileData: any[];
	selectedEmails: any = [];
	selectedMobileNo: any = [];
	formEmailToCustomer: FormGroup;
	formEmailToGodown: FormGroup;

	emailTempleteDetails: any; //selected email templet  in this case stock transfer templets
	emailFooterTemplete: any; // common footer template
	emailBodyTemplete: any; //body html custome
	emailSubject: any;
	emailFrom: any;
	selectedEmailscc: any = [];
	selectedZone: any;

	constructor(
		private toasterService: ToasterService,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private messagingService: MessagingService,
		private FileNamePipe: FileNamePipe,
		private calculations: Calculations,
		private http: HttpClient
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.role_id = this.user.userDet[0].role_id;
		this.company_id = this.user.userDet[0].company_id;
		if (this.user.userDet[0].role_id == 5 || this.user.userDet[0].role_id == 33 || this.user.userDet[0].role_id == 34) {
			if (this.user.userDet[0].insider_parent_id != null) {
				this.selectedZone = this.user.userDet[0].insider_parent_id;
			} else {
				this.selectedZone = this.user.userDet[0].id;
			}
		}
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.del_opt = perms[3];
		this.customer_email_billing = (this.links.find(x => x == 'customer_email_billing') != null) ? true : false;
		this.company_wise_billing = (this.links.find(x => x == 'company_wise_billing') != null) ? true : false;
		this.proceed_for_payment = (this.links.find(x => x == 'proceed_for_payment') != null) ? true : false;

		if (this.role_id == 1) {
			this.selected_company = this.companyList[0];
		} else {
			if (this.company_id == 3) {
				this.selected_company = this.companyList[3];
			} else if (this.company_id == 2) {
				this.selected_company = this.companyList[2];
			} else {
				this.selected_company = this.companyList[1];
			}
		}
	}

	ngOnInit() {
		this.getPercentValues();
		this.getCols();
		this.initForm();
	}

	getPercentValues() {
		this.crudServices.getOne<any>(PercentageDetails.getOne, {
			detail_type: 2
		}).subscribe(res => {
			this.percent = res;
		});
	}

	initForm() {
		this.invoiceForm = new FormGroup({
			invoice_id: new FormControl(null, Validators.required),
			dispatch_id: new FormControl(null, Validators.required),
			invoice_no: new FormControl(null, Validators.required),
			invoice_date: new FormControl(null, Validators.required),
			invoice_copy: new FormControl(null, Validators.required),
			import_local_flag: new FormControl(null),
			payment_reverse: new FormControl(null)
		});
		this.formEmailToCustomer = new FormGroup({
			emailMult: new FormControl(null, Validators.required),
			mobileMult: new FormControl(null),
		});
		this.formEmailToGodown = new FormGroup({
			emailMult: new FormControl(null, Validators.required),
			emailMultcc: new FormControl(null),
		});
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		let company_id_new = null;

		if (this.company_wise_billing) {
			if (this.selected_company.id != 0) {
				company_id_new = this.selected_company.id;
			} else {
				company_id_new = null;
			}
		} else if (this.user.userDet[0].role_id == 46) {
			company_id_new = this.selected_company.id;
		} else {
			company_id_new = null;
		}

		this.crudServices.getOne<any>(DispatchBilling.getUnbilledDispatches, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			status: this.selected_status.id,
			company_id: company_id_new,
			zone_id: this.selectedZone
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						element.customer = element.customer + ' (' + element.location_vilage + ')';
						element.is_payment_pending = false;
						if (moment(element.modified_date).isBefore(moment()) && element.d_status == 3) {
							element.is_payment_pending = true;
						}
					});
					this.data = res.data;
					this.pushDropdown(this.data);
					this.footerTotal(this.data);
				}
			}
			if (this.table != null && this.table != undefined) {
				this.table.reset();
			}
		});
	}

	getCols() {
		this.cols = [
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "invoice_no", header: "Invoice No", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "city", header: "City", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "godown_name", header: "Godown", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "dispatch_quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "e_way_status", header: "E-Way Bill", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "delivery_term", header: "Delivery Term", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "dispatch_date", header: "Dispatch Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "zone", header: "Zone", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "transition_type_label", header: "Transition Type", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "modified_by_name", header: "Approved By", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "modified_date", header: "Approved On", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date_Time" },
			{ field: "billing_done_on", header: "Billing Done On", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date_Time" },
		];
		this.filter = ['customer', 'zone', 'godown_name', 'grade_name', 'invoice_no'];
		this.getData();
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

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
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

	closeModal() {
		this.viewDealModal.hide();
	}

	onAction(item, type) {
		this.selectedDispatch = item;
		if (type == 'View') {
			this.crudServices.getOne<any>(DispatchBilling.getDispatchDetails, {
				id: item.id
			}).subscribe(res => {
				if (res.code == '100') {
					if (res.data.length > 0) {
						let data = res.data[0];
						let base_amount = Number(data.final_rate) * (Number(data.quantity) + Number(data.logistic_power));
						data.total_freight_with_load_cross = roundAmount(Number(data.total_freight)) + roundAmount(Number(data.total_load_cross));
						let total_freight_with_load_cross = (data.delivery_term_id == 3) ? Number(data.total_freight_with_load_cross) : 0;
						let total_base = base_amount + total_freight_with_load_cross;
						let obj_gst = this.percent.find(o => o.percent_type === 'gst');
						let gst = obj_gst.percent_value;
						let gst_rate = Number(total_base) * (Number(gst) / 100);
						let base_with_gst = Number(total_base) + Number(gst_rate);
						let tds_rate = (Number(data.tds) > 0) ? Number(total_base) * (Number(data.tds) / 100) : 0;
						let tcs_rate = (Number(data.tcs) > 0) ? Number(base_with_gst) * (Number(data.tcs) / 100) : 0;
						let final_tds_tcs_rate = 0;
						if (tds_rate > 0) {
							final_tds_tcs_rate = roundAmount(tds_rate);
							data.tds_tcs_label = "TDS";
						} else if (tcs_rate > 0) {
							final_tds_tcs_rate = roundAmount(tcs_rate);
							data.tds_tcs_label = "TCS";
						} else {
							final_tds_tcs_rate = 0;
							data.tds_tcs_label = "TDS/TCS";
						}
						let invoice_value = base_with_gst - tds_rate;
						invoice_value = invoice_value + tcs_rate;
						data.gst_amount = roundAmount(gst_rate);
						data.tds_tcs_amount = roundAmount(final_tds_tcs_rate);
						data.total_amount_without_tds = roundAmount(base_with_gst);
						data.e_way_status = (data.is_eway_bill == 1) ? "Yes" : "No";
						data.supplier = (data.company_id == 3) ? "SURISHA (A DIVISION OF SUSHILA PARMAR INTERNATIONAL PVT LTD)" : "Sushila Parmar International Private Limited";
						data.status_name = (data.status == 1) ? "Complete" : "Pending";
						data.total_quantity = roundQuantity(Number(data.quantity) + Number(data.logistic_power));

						if (data.transporter == "Other" || data.transporter == null) {
							data.transporter_gst_no = data.temp_gst_no;
						}

						this.selected_deal = data;
						this.viewDealModal.show();
					}
				}
			});
		} else if (type == 'Add') {
			this.add_edit = "Add";
			this.invoiceForm.reset();
			this.getFCMWithNotification('SALES_DEAL_INVOICE_ADD')
			this.invoiceForm.patchValue({
				invoice_id: Number(item.invoice_id),
				dispatch_id: Number(item.id),
				invoice_no: null,
				invoice_date: new Date(item.dispatch_date),
				invoice_copy: null,
				import_local_flag: Number(item.import_local_flag),
				payment_reverse: Number(item.payment_reverse)
			});
			this.invoiceModal.show();
		} else if (type == 'Edit') {
			this.add_edit = "Edit";
			this.getFCMWithNotification('SALES_DEAL_INVOICE_ADD')
			this.invoiceForm.patchValue({
				invoice_id: Number(item.invoice_id),
				dispatch_id: Number(item.id),
				invoice_no: item.invoice_no,
				invoice_date: new Date(item.invoice_date),
				invoice_copy: null,
				import_local_flag: Number(item.import_local_flag),
				payment_reverse: Number(item.payment_reverse),
			});
			this.invoiceModal.show();
		} else if (type == 'Delete') {
			this.crudServices.updateData<any>(DispatchBilling.delete, {
				id: item.invoice_id,
				dispatch_id: item.id
			}).subscribe(res => {
				if (res.code === '100') {
					this.getCols();
				}
			});
		} else if (type == 'Customer_Email') {
			this.communicateWithCustomer(item)
		} else if (type == 'Godown_Email') {
			this.openGodownEmailModal(item)
		} else if (type == 'Payment') {
			let payment_due_date = moment(item.dispatch_date).add(item.payment_term, "days").format("YYYY-MM-DD");
			let payment_received_date = null;
			let status = 0;
			let received_amount = 0;
			if (item.company_id == 2 || item.company_id == 3 || (item.company_id == 1 && item.is_forward == 0)) {
				if (Number(item.advance_amount) >= Number(item.total_amount)) {
					received_amount = Number(item.total_amount);
					status = 1;
				} else {
					received_amount = Number(item.advance_amount);
					status = 0;
				} 
				if (status == 1) {
					payment_received_date = new Date();
				}
			}

			let data = {
				dispatch_id: item.id,
				sub_org_id: item.sub_org_id,
				invoice_no: item.invoice_no.toUpperCase(),
				invoice_date: item.invoice_date,
				virtual_acc_no: item.virtual_acc_no,
				total_amount: Number(item.total_amount),
				payment_type: 1,
				payment_due_date: payment_due_date,
				received_amount: received_amount,
				payment_received_date: payment_received_date,
				status: status,
				import_local_flag: item.import_local_flag,
				payment_reverse: item.payment_reverse,
				is_suspense_amount: item.is_suspense_amount,
				deal_type: 1
			};
			let commission_data = null;
			if (Number(item.commission_value) > 0) {
				commission_data = {
					con_id: item.con_id,
					invoice_no: item.invoice_no,
					commission_value: Number(item.commission_value) * Number(item.dispatch_quantity),
					status: 0
				};
			}
			let body = {
				data: data,
				fp_id: item.fp_id,
				con_id: item.con_id,
				commission_data: commission_data
			};
			this.crudServices.addData<any>(DispatchPayments.add, body).subscribe(res => {
				if (res.code === '100') {
					this.crudServices.addData<any>(DispatchPayments.getOneDispatchPayment, {
						invoice_no: item.invoice_no
					}).subscribe(res_one => {
						if (res_one.code == '100') {
							if (res_one.data.length > 0) {
								this.crudServices.getOne<any>(SalesOrders.adjustSuspenseAmountFromInvoice, {
									data: res_one.data[0]
								}).subscribe(res_invoice => {
									if (res_invoice.code == '100') {
										this.crudServices.getOne<any>(SalesOrders.updateSuspenseInvoiceStatus, {
											invoice_no: res_one.data[0].invoice_no
										}).subscribe(res => {
											this.toasterService.pop('success', 'Success', "Proceed for Payment");
											this.getCols();
										});
									}
								});
							} else {
								this.toasterService.pop('success', 'Success', "Proceed for Payment");
								this.getCols();
							}
						}
					});
				}
			});
		} else if (type == 'Download_Invoice') {
			let invoice_arr = JSON.parse(item);
			this.crudServices.downloadMultipleFiles(invoice_arr);
		}
	}
	composeMail(item) {
		const PI_NO = /{PI_NO}/;
		const PI_DATE = /{PI_DATE}/;
		const PI_QTY = /{PI_QTY}/;
		const PI_GRADE = /{PI_GRADE}/;
		const DAYS = /{DAYS}/;
		let template = '';
		let subject = '';
		this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Final Closure' }).subscribe(response => {
			template = response[0].custom_html;
			subject = response[0].subject;
			let ab = template.replace(PI_NO, item.so_no);
			let abc = ab.replace(PI_DATE, moment(item.booking_date).format('DD-MM-YYYY'));
			let abcd = abc.replace(PI_QTY, item.so_quantity);
			let abcde = abcd.replace(PI_GRADE, item.grade_name);
			this.html3 = abcde.replace(DAYS, moment(item.added_date).format('DD-MM-YYYY'));
			this.sendmail()
		})
		this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Footer' }).subscribe(response => {
			this.footer1 = response[0].custom_html;
		})
	}
	sendmail() {
		let arr = {};
		let html4 = this.html3 + this.footer1;
		arr = { 'to': this.tomailtext, 'html': html4 };
		this.crudServices.postRequest<any>(ImportSales.dealCompletionMail, { mail_object: arr }).subscribe(response => {
			this.toasterService.pop(response.message, response.message, response.data);
		})
	}

	onFileChange(e) {
		this.filesArr = <Array<File>>e.target.files;
		// let files = <Array<File>>e.target.files;
		// for (let i = 0; i < files.length; i++) {
		// 	this.fileData.append("sales_invoice", files[i], files[i]['name']);
		// }
	}

	submitInvoiceForm() {
		this.isLoading = true;
		let fileData: any = new FormData();
		const files: Array<File> = this.filesArr;
		for (let i = 0; i < files.length; i++) {
			fileData.append('sales_invoice', files[i], files[i]['name']);
		}
		this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res_aws => {
			if (res_aws != null) {
				let invoice_copies = [];
				res_aws.uploads["sales_invoice"].forEach(element => {
					invoice_copies.push(element.location);
				});
				let data = {
					dispatch_id: this.invoiceForm.value.dispatch_id,
					invoice_no: this.invoiceForm.value.invoice_no,
					invoice_date: moment(this.invoiceForm.value.invoice_date).format("YYYY-MM-DD"),
					invoice_copy: JSON.stringify(invoice_copies),
					import_local_flag: this.invoiceForm.value.import_local_flag,
					payment_reverse: this.invoiceForm.value.payment_reverse
				};
				let body = {
					data: data
				};
				let notification_body = undefined;

				if (this.notification_details != null) {
					if (this.selectedDispatch.zone_fcm_web_token) {
						this.notification_tokens = [...this.notification_tokens, this.selectedDispatch.zone_fcm_web_token];
						this.notification_id_users = [...this.notification_id_users, this.selectedDispatch.zone_id];
					}

					notification_body = {
						notification: {
							"title": `${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name}    ${this.notification_details.title}`,
							"body": `Customer : ${this.selectedDispatch.customer},  Quantity : ${this.selectedDispatch.quantity}, Grade name : ${this.selectedDispatch.grade_name} Invoice No.: ${this.invoiceForm.value.invoice_no}, Invoice Date :  ${moment(this.invoiceForm.value.invoice_date).format("YYYY-MM-DD")}`,
							"click_action": "https://erp.sparmarglobal.com:8085/#/sales/billing"
						},
						registration_ids: this.notification_tokens
					}
				}
				if (this.add_edit == "Add") {
					this.crudServices.addData<any>(DispatchBilling.add, body).subscribe(res => {
						if (res.code === '100') {
							this.toasterService.pop('success', 'Success', "Invoice Uploaded Successfully");
							this.invoiceForm.reset();
							this.invoiceModal.hide();
							this.getCols();
							this.sendInAppNotification(notification_body)
							this.isLoading = false;
						} else {
							this.toasterService.pop('error', 'Alert', "Invoice Already Exist");
							this.invoiceForm.reset();
							this.invoiceModal.hide();
							this.isLoading = false;
						}
					});
				} else {
					body["id"] = this.invoiceForm.value.invoice_id;
					this.crudServices.updateData<any>(DispatchBilling.update, body).subscribe(res => {
						if (res.code === '100') {
							this.toasterService.pop('success', 'Success', "Invoice Updated Successfully");
							this.invoiceForm.reset();
							this.invoiceModal.hide();
							this.getCols();
							this.sendInAppNotification(notification_body)
							this.isLoading = false;
						} else {
							this.toasterService.pop('error', 'Alert', "Invoice Already Exist");
							this.invoiceForm.reset();
							this.invoiceModal.hide();
							this.isLoading = false;
						}
					});
				}
			} else {
				this.toasterService.pop('error', 'Error', "Invoice Uploading Failed");
			}
		});
	}

	exportData(type) {
		let fileName = this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
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
		this.crudServices.getOne(Notifications.getNotificationWithFCM, { notification_name: name })
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


	getAllEmails(suborgId) {
		this.EmailData = []
		this.MobileData = []
		this.selectedEmails = []
		this.selectedMobileNo = []
		this.crudServices.getOne(Consignments.getAllContactsEmailBySubOrg, { sub_org_id: suborgId, logistics: 1 }).subscribe(result => {
			if (result['data'].length > 0) {
				result['data'].map(result => {
					if (result.email_id) {
						const found = this.EmailData.some(el => el.email_id == result.email_id);
						if (!found) {
							this.EmailData.push({ email_id: result.email_id, name: result.person_name });
							this.selectedEmails.push(result.email_id);
						}
					}
				});
			}
		});
		this.crudServices.getOne(Consignments.getAllContactsNumberBySubOrg, { sub_org_id: suborgId, logistics: 1 }).subscribe(result => {

			if (result['data'].length > 0) {
				result['data'].map(result => {
					if (result.contact_no) {
						let mobile_no = result.contact_no.trim();
						const found2 = this.MobileData.some(el => el.contact_no.trim() == mobile_no);
						if (!found2) {
							if (/^\d{10}$/.test(mobile_no)) {
								this.MobileData.push({ contact_no: mobile_no, name: result.person_name });
								this.selectedMobileNo.push(mobile_no);

							}
						}
					}
				});
			}
		});
	}



	async sendWhatsAppMsg(dispatchDetails) {
		if (dispatchDetails.mobile_office != null) {
			this.selectedMobileNo.push(dispatchDetails.mobile_office)
		}
		let fileLocation = JSON.parse(dispatchDetails.invoice_copy);
		let sendHeads = [
			`${dispatchDetails.customer}`,
			`${dispatchDetails.grade_name}`,
			`${dispatchDetails.dispatch_quantity} ${dispatchDetails.unit_type}`,
			`${dispatchDetails.invoice_no} - (${dispatchDetails.invoice_date})`,
			`${dispatchDetails.truck_no}`,
			`${dispatchDetails.driver_mobile_no ? dispatchDetails.driver_mobile_no : ''}`,
			dispatchDetails.city ? dispatchDetails.city : ''
		];

		let wts_body = [{
			company_id: dispatchDetails.company_id,
			template_name: (dispatchDetails.company_id == 3) ? "dispatch_alert_surisha_v1" : "dispatch_alert",
			locale: "en",
			numbers: this.selectedMobileNo,
			params: sendHeads,
			attachment: [
				{
					caption: `${dispatchDetails.customer}`,
					filename: `${this.FileNamePipe.transform(fileLocation[0])}`,
					url: fileLocation[0]
				}
			]
		}];
		if (this.selectedMobileNo.length > 0) {
			return await this.crudServices.postRequest<any>(LocalPurchase.sendSMS, wts_body).subscribe(res => {
				this.toasterService.pop('success', 'WhatsApp  Notification !', 'WhatsApp Notification !')
			})
		}
		else {
			return this.toasterService.pop('warning', 'WhatsApp  Notification Not Send', 'WhatsApp Number Not Found !');
		}
	}

	communicateWithCustomer(data: any) {
		this.selectedDispatch = data;
		this.getAllEmails(data.sub_org_id);
		this.getTemplate('dispatch_customer_invoice');
		this.mailToCustomerModal.show();
	}

	openGodownEmailModal(item) {
		this.selectedDispatch = item;
		this.getGodownEmails(item.godown_id);
		this.getTemplate('dispatch_godown_email')
		this.mailToGodownModal.show();
	}



	getGodownEmails(id: any) {
		this.selectedEmails = [];
		this.selectedEmailscc = [];
		this.crudServices.getOne(GodownMaster.getOne, { id: id }).subscribe((result: any) => {
			result.map((element) => {
				this.selectedEmails.push(element.godown_email);
				// this.selectedEmailscc.push(element.godown_email);
			})
		})
	}

	async getTemplate(template_name) {
		this.emailSubject = '';
		this.emailFooterTemplete = '';
		forkJoin([this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: template_name }), this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Footer' })])
			.subscribe((response) => {
				this.emailBodyTemplete = response[0][0].custom_html;
				this.emailSubject = response[0][0].subject;
				this.emailFrom = response[0][0].from_name;
				this.emailFooterTemplete = response[1][0].custom_html;
			});
	}

	sendEmailAndWhatsApp() {
		this.isLoading = true;
		this.sendWhatsAppMsg(this.selectedDispatch).then(() => {
			this.isLoading = false;
			this.mailToCustomerModal.hide();
		});
		this.sendEmailOfInvoice(this.selectedDispatch).then(() => {
			this.mailToCustomerModal.hide();

			this.crudServices.updateData(DispatchBilling.updateBilligFlag, { data: { send_mail_to_customer: 1 }, dispatch_id: this.selectedDispatch.id })
				.subscribe((res) => {
				})
			this.isLoading = false;
		});
	}

	async sendEmailOfInvoice(dispatchDetails) {
		let files = JSON.parse(dispatchDetails.invoice_copy);
		// let fileLocation = dispatchDetails.invoice_copy;
		let template_html = '';
		const attachments = [];
		let arr = {};
		let html2 = '';
		let table = `<table id="table" ><tr><th>Buyer Name</th><th>Invoice No</th><th>Invoice Date</th><th>Sale Quantity</th><th>Unit</th><th>Rate</th><th>Grade</th><th>Truck No.</th><th>LR NO</th></tr>
		
		<tr>
				<td>${dispatchDetails.customer}</td>
				<td>${dispatchDetails.invoice_no}</td>
				<td>${dispatchDetails.invoice_date}</td>
				<td>${dispatchDetails.dispatch_quantity}</td>
				<td>${dispatchDetails.unit_type}</td>
				<td>${dispatchDetails.final_rate}</td>
				<td>${dispatchDetails.grade_name}</td>
				<td>${dispatchDetails.truck_no}</td>
				<td>${dispatchDetails.lr_no}</td>
		</tr>`;

		const re2 = "{TABLE}";
		template_html = this.emailBodyTemplete;
		html2 = template_html.replace(re2, table);
		html2 = html2 + this.emailFooterTemplete;


		files.forEach(element => {
			attachments.push({
				'filename': this.FileNamePipe.transform(element),
				'path': element
			});
		});

		let email_from = null;

		if (dispatchDetails.company_id == 1) {
			email_from = '"SPIPL" <parmar@parmarglobal.com>';
		} else if (dispatchDetails.company_id == 2) {
			email_from = '"SPIPL" <spipl@parmarglobal.com>';
		} else if (dispatchDetails.company_id == 3) {
			email_from = '"SURISHA" <surisha@parmarglobal.com>';
		} else {
			email_from = '"SPIPL" <parmar@parmarglobal.com>';
		}

		let emailBody = {
			from: email_from,
			to: this.selectedEmails,
			// cc: this.emailForm.value.emailMultcc,
			subject: this.emailSubject,
			html: html2,
			attachments: attachments
		};
		let body = {
			mail_object: emailBody,
			company_id: dispatchDetails.company_id,
		};
		if (this.selectedEmails.length > 0) {
			this.crudServices
				.postRequest<any>(Dispatch.sendInvoiceMail, body)
				.subscribe(async (response) => {
					if (response) {
						// this.updateEmailStatus({ is_invoice_mail: 1 }, this.selectedDispatch.id)
						this.toasterService.pop(
							response.message,
							response.message,
							response.data
						);
					}

				}, (err) => {
					this.toasterService.pop(
						'warning',
						'Something went wrong',
						'Something went wrong'
					);
				});
		} else {
			this.toasterService.pop('warning', 'Mail  Notification Not Send', 'Mail Id  Not Found !');
			return
		}
	}

	//GODOWN EMAIL
	async sendMailToGodown() {
		this.isLoading = true;
		let template_html = '';
		const attachments = [];
		let arr = {};
		let html2 = '';
		const re2 = "{INVOICE}";
		template_html = this.emailBodyTemplete;
		html2 = template_html.replace(re2, this.selectedDispatch.invoice_no);
		html2 = html2 + this.emailFooterTemplete;

		let files = JSON.parse(this.selectedDispatch['invoice_copy']);
		files.forEach(element => {
			attachments.push({
				'filename': this.FileNamePipe.transform(element),
				'path': element
			});
		});

		// if (this.selectedDispatch['invoice_copy']) {
		// 	const files = this.selectedDispatch['invoice_copy'];
		// 	for (let j = 0; j < files.length; j++) {
		// 		const test = files[j].split('/');
		// 		attachment.push({ 'filename': `${test[3]}${j}.${this.getFileExtension(files[j])}`, 'path': files[j] });
		// 	}
		// }

		let emailBody = {
			from: this.emailFrom,
			to: this.formEmailToGodown.value.emailMult,
			cc: this.formEmailToGodown.value.emailMultcc,
			subject: `${this.emailSubject} :${this.selectedDispatch.invoice_no} `,
			html: html2,
			attachments: attachments
		};
		let body = {
			mail_object: emailBody,
			company_id: this.company_id,
		};

		await this.crudServices
			.postRequest<any>(Dispatch.sendGodownMail, body)
			.subscribe((response) => {
				if (response) {
					this.toasterService.pop(
						response.message,
						response.message,
						response.data
					);
					this.crudServices.updateData(DispatchBilling.updateBilligFlag, { data: { send_mail_to_godown: 1 }, dispatch_id: this.selectedDispatch.id })
						.subscribe((res) => {
						})
					this.formEmailToGodown.reset();
					this.mailToGodownModal.hide();
					this.isLoading = false;
				}
			}, error => {
				this.isLoading = false;
			});
	}

	//*on Check Box  checked / unchecked  Add Or Remove Email from  To email List
	onCheckboxChange(e) {
		if (e.target.checked) {
			this.selectedEmails.push(e.target.value);
		} else {
			this.selectedEmails = this.selectedEmails.filter((email) => {
				if (email === e.target.value) {
					return email !== e.target.value;
				} else {
					return email;
				}
			});
		}
	}


	//*on Check Box  checked / unchecked  Add Or Remove Email from  To email List
	onCheckboxChangeCC(e) {
		if (e.target.checked) {
			this.selectedEmailscc.push(e.target.value);
		} else {
			this.selectedEmailscc = this.selectedEmailscc.filter((email) => {
				if (email === e.target.value) {
					return email !== e.target.value;
				} else {
					return email;
				}
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

	onChangeCompany(e) {
		if (e != null && e != undefined) {
			let selected_company_data = this.companyList.filter(item => item.id == e.value.id)
			this.selected_company = {
				id: selected_company_data[0].id,
				name: selected_company_data[0].name
			};
			this.getCols();
		}
	}

}
