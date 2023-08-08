import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import {
	ValueStore,
	PercentageDetails,
	SalesOrders,
	Finance,
	DispatchPayments,
	SubOrg,
	UsersNotification,
	Notifications
} from '../../../shared/apis-path/apis-path';
import { roundAmount, roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import * as moment from "moment";
import { MessagingService } from '../../../service/messaging.service';

@Component({
	selector: 'app-add-finance',
	templateUrl: './add-finance.component.html',
	styleUrls: ['./add-finance.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService, Calculations],
})

export class AddFinanceComponent implements OnInit {

	@ViewChild("addFinancePlanningModal", { static: false }) public addFinancePlanningModal: ModalDirective;
	@ViewChild("cancelFinancePlanningModal", { static: false }) public cancelFinancePlanningModal: ModalDirective;
	@ViewChild("viewFinancePlanningModal", { static: false }) public viewFinancePlanningModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;
	currentDate: any = new Date();
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to delete?';
	popoverMessage2: string = 'Are you sure, you want to change Status?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'left';
	cancelClicked: boolean = false;
	user: UserDetails;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	disableCustomer: boolean = true;
	disableAdvance: boolean = true;
	disablePaymentTerm: boolean = true;
	loadingBtn: boolean = false;
	isLoading = false;
	salesOrder: any = {};
	cols: any = [];
	data: any = [];
	filter: any = [];
	con_id: any = null;
	customersList: any = [];
	percentValues: any = [];
	addFinanceForm: FormGroup;
	cancelFinanceForm: FormGroup;
	paymentTypesList: any = staticValues.payment_types;
	datePickerConfig: any = staticValues.datePickerConfig;
	max_date: any = new Date();
	max_validity_date: any = new Date();
	logistic_power_value: any = 0;
	tds_tsc_obj: any = {};
	due_data: any = {};
	fp_balance_quantity: any = 0;
	balance_quantity: any = 0;

	enableAdhocPower: boolean = false;
	enableLogisticPower: boolean = false;

	is_utilized_overdue_limit: any = 0;

	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	notification_details: any;
	notification_tokens = [];
	notification_id_users = []
	notification_users = [];
	zone_fcm = [];
	dealId: any;
	available_limit_backup: any;
	extra_amount: any;
	cancelData: any;
	plan_quantity: number;

	constructor(
		toasterService: ToasterService,
		private route: ActivatedRoute,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private calculations: Calculations,
		private exportService: ExportService,
		private messagingService: MessagingService
	) {
		this.toasterService = toasterService;
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.route.params.subscribe((params: Params) => {
			this.con_id = params["con_id"];
		});
	}

	ngOnInit() {
		this.getSalesOrder();
		this.getValueStore();
		this.getPercentValues();
		this.initForm();

	}

	initForm() {
		// this.currentDate = moment(this.currentDate).format("YYYY-MM-DD");
		this.addFinanceForm = new FormGroup({
			sub_org_id: new FormControl(null, Validators.required),
			virtual_acc_no: new FormControl(null, Validators.required),
			org_chq_status: new FormControl(null),
			org_chq_no: new FormControl(null),
			org_tds: new FormControl(null),
			org_tcs: new FormControl(null),
			chq_status: new FormControl(null),
			chq_no: new FormControl(null),
			org_payment_term: new FormControl(null),
			payment_type: new FormControl(null, Validators.required),
			payment_term: new FormControl(null),
			advance: new FormControl(null),
			advance_amount: new FormControl(null),
			base_limit: new FormControl(0),
			adhoc_limit: new FormControl(0),
			overdue_limit: new FormControl(0),
			outstanding: new FormControl(0),
			payment_due: new FormControl(0),
			available_limit: new FormControl(0),
			available_limit_quantity: new FormControl(0),
			plan_quantity: new FormControl(null),
			use_adhoc_power: new FormControl(false),
			adhoc_power: new FormControl(null),
			use_logistic_power: new FormControl(false),
			logistic_power: new FormControl(null),
			plan_date: new FormControl(this.currentDate),
			validity_date: new FormControl(null),
			remark: new FormControl(null),
			use_extra_amount: new FormControl(null),
			tds_tcs_available: new FormControl(null, Validators.required),
			use_advance_amount: new FormControl(null),
		});
		this.cancelFinanceForm = new FormGroup({
			id: new FormControl(null),
			sub_org_id: new FormControl(null, Validators.required),
			cancel_quantity: new FormControl(null),
			previous_cancel_quantity: new FormControl(null),
			advance_amount: new FormControl(null)
		});
	}

	getValueStore() {
		this.crudServices.getOne<any>(ValueStore.getOne, {
			key: "special_logistic_power"
		}).subscribe((response) => {
			this.logistic_power_value = response.data[0].value
		});
	}

	getPercentValues() {
		this.crudServices.getOne<any>(PercentageDetails.getOne, {
			detail_type: 2
		}).subscribe((response) => {
			this.percentValues = response;
		});
	}

	getSalesOrder() {
		this.isLoading = true;
		this.crudServices.getOne<any>(SalesOrders.getSalesOrder, {
			id: Number(this.con_id)
		}).subscribe(res_order => {
			if (res_order.code == '100') {
				if (res_order.data.length > 0) {
					this.salesOrder = res_order.data[0];
					this.crudServices.getOne<any>(SubOrg.getGroupCustomer, {
						org_id: this.salesOrder.main_org_id
					}).subscribe(res_org => {
						if (res_org.code == '100') {
							if (res_org.data.length > 0) {
								res_org.data.forEach(element => {

									element.customer = element.sub_org_name + (element.location_vilage ? (' (' + element.location_vilage + ')') : " ");
								});
								this.customersList = res_org.data;
							}
							this.getFinancePlannings();
						}
					});
				}
			}
			this.isLoading = false;
		});
	}

	getFinancePlannings() {
		this.getCols();
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(Finance.getFinancePlannings, {
			con_id: this.con_id
		}).subscribe(res => {
			let total_fp_quantity = 0;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						total_fp_quantity += Number(element.f_plan_quantity);
					});
					this.fp_balance_quantity = (Number(this.salesOrder.quantity) - Number(this.salesOrder.cancel_quantity)) - Number(total_fp_quantity);
					this.data = res.data;
				} else {
					this.fp_balance_quantity = roundQuantity(Number(this.salesOrder.quantity) - Number(this.salesOrder.cancel_quantity));
				}
				this.pushDropdown();
				this.footerTotal(this.data);
			}
			this.isLoading = false;
			this.table.reset();
		});
	}

	pushDropdown() {
		let filter_cols = this.cols.filter(col => col.filter == true);
		filter_cols.forEach(element => {
			let unique = this.data.map(item =>
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
				let total = this.data.map(item =>
					item[element.field]
				).reduce((sum, item) => Number(sum) + Number(item));
				element.total = total;
			} else {
				element.total = 0;
			}

		});
	}

	getCols() {
		this.cols = [
			{ field: "id", header: "ID", sort: true, filter: false, dropdown: [], footer: false, total: 0 },
			{ field: "customer", header: "Customer", sort: true, filter: false, dropdown: [], footer: false, total: 0 },
			{ field: "plan_quantity", header: "Plan Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0 },
			{ field: "cancel_quantity", header: "Cancel Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0 },
			{ field: "dispatch_quantity", header: "Dispatch Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0 },
			{ field: "balance_quantity", header: "Balance Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0 },
			{ field: "payment_term", header: "Payment Term", sort: true, filter: false, dropdown: [], footer: true, total: 0 },
			{ field: "plan_date", header: "Plan Date", sort: true, filter: false, dropdown: [], footer: true, total: 0 },
			{ field: "validity_date", header: "Validity Date", sort: true, filter: false, dropdown: [], footer: true, total: 0 },
			{ field: "cancel_date", header: "Cancel Date", sort: true, filter: false, dropdown: [], footer: true, total: 0 },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0 }
		];
		this.filter = ['grade'];
	}

	getPaymentTerm(type, payment_term, advance) {
		if (type == 1) {
			return payment_term + " Days";
		} else if (type == 2) {
			return "Advance by RTGS";
		} else if (type == 3) {
			return "Advance : " + advance + "% | Payment Term : " + payment_term + " Days";
		} else if (type == 4) {
			return "Advance by LC";
		} else if (type == 5) {
			return "LC (Regular)";
		}
	}

	onAction(item, type) {
		if (type == 'View') {
			this.viewFinancePlanningModal.show();
		} else if (type == 'Add') {
			this.dealId = this.salesOrder.id
			this.getFCMWithNotification('ADD_NEW_FINANCE_PLANNING');
			
			//Issue: 920 Setting plan date as current date for all 3 divisions.
			const plan_date = moment().format("YYYY-MM-DD");

			let validity_date = moment().format("YYYY-MM-DD");
			this.max_validity_date = new Date(moment().add(10, 'd').format("YYYY-MM-DD"));
			this.disableCustomer = true;
			this.addFinanceForm.reset();
			this.addFinanceForm.patchValue({
				plan_date: plan_date,
				plan_quantity: roundQuantity(this.salesOrder.quantity),
				unit_type: this.salesOrder.unit_type,
				validity_date: validity_date,
				available_limit: 0,
				use_advance_amount: null
			});

			this.addFinanceForm.get("plan_quantity").setValidators([Validators.required, Validators.min(0.01)]);
			if (this.salesOrder.payment_type == 2 || this.salesOrder.payment_type == 4) {
				this.disableCustomer = true;
				this.disableAdvance = true;
				this.disablePaymentTerm = true;
			}
			let customer = this.customersList.find(o => o.sub_org_id == this.salesOrder.sub_org_id);
			this.onChangeValue(customer, 'customer');
			this.addFinancePlanningModal.show();
		} else if (type == 'Cancel') {
			this.cancelData = item;			
			this.getFCMWithNotification('CANCEL_FINANCE_PLANNING');
			this.cancelFinanceForm.patchValue({
				id: item.id,
				sub_org_id: item.sub_org_id,
				cancel_quantity: item.balance_quantity,
				previous_cancel_quantity: item.cancel_quantity,
				advance_amount: item.advance_amount
			});
			this.cancelFinanceForm.get('cancel_quantity').setValidators([Validators.required, Validators.min(0.01), Validators.max(item.balance_quantity)]);
			this.cancelFinanceForm.get('cancel_quantity').updateValueAndValidity();
			this.cancelFinancePlanningModal.show();
		}
	}

	onChangeValue(e, type) {
		if (type == 'customer') {
			if (e != null && e != undefined) {
				this.addFinanceForm.patchValue({
					sub_org_id: e.sub_org_id,
					virtual_acc_no: e.virtual_acc_no,
					org_payment_term: e.payment_term,
					org_chq_status: e.chq_status,
					org_chq_no: e.chq_no,
					org_tds: (e.org_tds_tcs != null && e.org_tds_tcs.length > 0) ? e.org_tds_tcs[0].tds : null,
					org_tcs: (e.org_tds_tcs != null && e.org_tds_tcs.length > 0) ? e.org_tds_tcs[0].tcs : null,
					base_limit: e.base_limit,
					adhoc_limit: e.adhoc_limit,
					overdue_limit: e.overdue_limit
				});
				this.due_data.case_type = "Regular";
				this.due_data.base_limit = e.base_limit;
				this.due_data.adhoc_limit = e.adhoc_limit;
				this.due_data.overdue_limit = e.overdue_limit;
				this.due_data.balance_adhoc_limit = 0;
				this.due_data.balance_overdue_limit = 0;
				this.due_data.total_undispatch = 0;
				this.due_data.org_extra_local = e.extra_local;
				this.due_data.org_extra_import = e.extra_import;
				this.due_data.org_extra_suspense = e.extra_suspense;
				this.tds_tsc_obj = e.org_tds_tcs;
				let fp_status = false;

				if (this.addFinanceForm.value.org_tds != null || this.addFinanceForm.value.org_tcs != null) {
					this.addFinanceForm.patchValue({
						tds_tcs_available: true
					});
				} else {
					this.addFinanceForm.patchValue({
						tds_tcs_available: null
					});
				}

				if (e.chq_status == 1 && e.chq_no == null) {
					if (this.data.length > 0) {
						fp_status = false;
					} else {
						fp_status = true;
					}
				} else {
					fp_status = true;
				}

				if (this.addFinanceForm.value.tds_tcs_available == null || !this.addFinanceForm.value.tds_tcs_available) {
					this.toasterService.pop("error", "Alert", "TDS/TCS Declaration Not Found");
				}

				let enableFinancePlanning = false;

				if (fp_status) {
					if (this.salesOrder.deal_type == 1) {
						this.addFinanceForm.get('virtual_acc_no').setValidators([Validators.required]);
						this.addFinanceForm.get('virtual_acc_no').updateValueAndValidity();
						if (e.virtual_acc_no != null) {
							enableFinancePlanning = true;
						} else {
							enableFinancePlanning = false;
							this.toasterService.pop("error", "Alert", "Virtual Account Number is not updated");
						}
					} else {
						this.toasterService.pop("error", "Alert", "Virtual Account Number is not updated");
						this.addFinanceForm.get('virtual_acc_no').clearValidators();
						this.addFinanceForm.get('virtual_acc_no').updateValueAndValidity();
						enableFinancePlanning = true;
					}
				} else {
					if (!fp_status) {
						this.toasterService.pop("error", "Alert", "Cheque details are not updated");
					}
				}

				if (enableFinancePlanning) {
					this.calculateAvailableLimit(e.sub_org_id);

					if (this.customersList.length > 1) {
						if (e.payment_term > 0) {
							this.addFinanceForm.patchValue({
								payment_type: 1
							});
							this.onChangeValue(1, 'payment_type');
						} else if (e.payment_term == 0) {
							this.addFinanceForm.patchValue({
								payment_type: 2
							});
							this.onChangeValue(2, 'payment_type');
						} else {
							this.onChangeValue(null, 'payment_type');
						}
					} else {
						this.addFinanceForm.patchValue({
							payment_term: this.salesOrder.payment_term,
							payment_type: this.salesOrder.payment_type,
							advance: this.salesOrder.advance
						});
						this.disablePaymentTerm = true;
						this.disableAdvance = true;
					}

					if (this.salesOrder.payment_type == 2 || this.salesOrder.payment_type == 4) {
						this.addFinanceForm.patchValue({
							payment_term: this.salesOrder.payment_term,
							payment_type: this.salesOrder.payment_type,
							advance: this.salesOrder.advance
						});
						this.disableCustomer = true;
						this.disableAdvance = true;
						this.disablePaymentTerm = true;
					}
				}
			}
		}
		if (type == 'payment_type') {
			this.addFinanceForm.get('payment_term').clearValidators();
			this.addFinanceForm.get('advance').clearValidators();
			this.disableAdvance = true;
			this.disablePaymentTerm = true;
			if (e != null && e != undefined) {
				if (e == 1) {
					// this.enableExtraPayment = false;
					this.addFinanceForm.patchValue({
						payment_term: this.addFinanceForm.value.org_payment_term,
						advance: 0
					});
					this.addFinanceForm.get('payment_term').setValidators([Validators.required, Validators.max(this.addFinanceForm.value.org_payment_term)]);
					this.addFinanceForm.get('payment_term').updateValueAndValidity();
					this.disableAdvance = true;
					this.disablePaymentTerm = false;
				} else if (e == 5) {
					// this.enableExtraPayment = false;
					this.addFinanceForm.patchValue({
						payment_term: 0,
						advance: 0
					});
					this.disableAdvance = true;
					this.disablePaymentTerm = true;
				} else if (e == 2 || e == 4) {
					// this.enableExtraPayment = true;
					this.addFinanceForm.get('payment_term').updateValueAndValidity();
					this.addFinanceForm.get('advance').updateValueAndValidity();
					this.addFinanceForm.patchValue({
						payment_term: 0,
						advance: 100
					});
					this.disableAdvance = true;
					this.disablePaymentTerm = true;
				} else if (e == 3) {
					// this.enableExtraPayment = true;
					this.addFinanceForm.get('payment_term').setValidators([Validators.required, Validators.max(this.addFinanceForm.value.org_payment_term)]);
					this.addFinanceForm.get('advance').setValidators([Validators.required]);
					this.addFinanceForm.get('payment_term').updateValueAndValidity();
					this.addFinanceForm.get('advance').updateValueAndValidity();
					this.addFinanceForm.patchValue({
						payment_term: this.addFinanceForm.value.org_payment_term,
						advance: 50
					});
					this.disableAdvance = false;
					this.disablePaymentTerm = false;
				}
			} else {
				this.addFinanceForm.patchValue({
					payment_term: this.salesOrder.payment_term,
					advance: this.salesOrder.advance
				});
				this.disableAdvance = true;
				this.disablePaymentTerm = true;
			}
		}
	}

	calculateAvailableLimit(sub_org_id) {
		this.crudServices.getOne<any>(Finance.getUndispatchedData, {
			sub_org_id: sub_org_id,
		}).subscribe(res_undispatch => {
			let case_type = "Regular";
			let total_amount = 0;
			let total_undispatch_amount = 0;
			let current_limit = (this.salesOrder.payment_term > 0) ? Number(this.due_data.base_limit) : 0;
			let total_outstanding = 0;
			let total_payment_due = 0;
			let utilized_overdue_limit = 0;
			let utilized_adhoc_limit = 0;
			if (this.salesOrder.payment_type == 3) {
				let result = this.data.find(o => (o.payment_type == 2) && (o.balance_quantity > 0));
				if (result) {
					// this.enableExtraPayment = false;
				} else {
					// this.enableExtraPayment = true;
				}
			} else {
				if (this.salesOrder.payment_type == 2) {
					// this.enableExtraPayment = true;
				} else {
					// this.enableExtraPayment = false;
				}
			}

			if (res_undispatch.code == '100') {
				if (res_undispatch.data.length > 0) {
					res_undispatch.data.forEach(element => {
						let final_rate = this.basicFinalsoldRate();
						let total = final_rate * Number(element.fp_quantity);
						total_amount = total_amount + Number(total);
					});
					total_undispatch_amount = total_amount;
					this.due_data.total_undispatch = total_undispatch_amount;
				}
			}

			this.crudServices.getOne<any>(Finance.getUtilizedAdhocLimit, {
				sub_org_id: sub_org_id
			}).subscribe(res_adhoc_limit => {
				if (res_adhoc_limit.code == '100') {
					if (res_adhoc_limit.data.length > 0) {
						res_adhoc_limit.data.forEach(element => {
							utilized_adhoc_limit += Number(element.utilized_adhoc_limit);
						});
					}
				}

				let payment_term_end_date = null;

				this.crudServices.getOne<any>(Finance.getDueDetails, {
					sub_org_id: sub_org_id
				}).subscribe(res_overdue => {
					if (res_overdue.code == '100') {
						if (res_overdue.data.length > 0) {
							res_overdue.data.forEach(element => {
								total_outstanding += Number(element.outstanding_amount);
								let zero_day = moment(element.payment_due_date).add(1, "days").format("YYYY-MM-DD");
								payment_term_end_date = moment(zero_day).format("YYYY-MM-DD");
								if (moment().isAfter(payment_term_end_date)) {
									total_payment_due += Number(element.outstanding_amount);
								}
							});
						}

						if (total_payment_due > 0) {
							case_type = "Overdue";
							this.is_utilized_overdue_limit = 1;
						} else {
							case_type = "Regular";
							this.is_utilized_overdue_limit = 0;
						}
					}

					this.crudServices.getOne<any>(Finance.getUtilizedOverdueLimit, {
						sub_org_id: sub_org_id,
						date: payment_term_end_date
					}).subscribe(res_overdue_limit => {
						if (res_overdue_limit.code == '100') {
							if (res_overdue_limit.data.length > 0) {
								utilized_overdue_limit = Number(res_overdue_limit.data[0].utilized_overdue_limit);
							}
						}
						if (case_type == "Regular") {
							this.is_utilized_overdue_limit = 0;
							this.enableLogisticPower = false;
							if (this.salesOrder.payment_type == 1 || this.salesOrder.payment_type == 3 || this.salesOrder.payment_type == 5) {
								this.enableAdhocPower = true;
							} else {
								this.enableAdhocPower = false;
							}

							if (this.salesOrder.payment_type == 2 || this.salesOrder.payment_type == 5) {
								this.enableLogisticPower = true;
							} else {
								this.enableLogisticPower = false;
							}

							if (this.salesOrder.payment_term > 0) {
								current_limit = Number(this.due_data.base_limit) - Number(total_undispatch_amount + total_outstanding);
							}
							this.due_data.balance_adhoc_limit = this.due_data.adhoc_limit - utilized_adhoc_limit;
							if (this.due_data.balance_adhoc_limit < 0) {
								this.due_data.balance_adhoc_limit = 0;
							}
						} else {
							this.enableAdhocPower = false;
							this.is_utilized_overdue_limit = 1;
							if (this.salesOrder.payment_type == 1 || this.salesOrder.payment_type == 2 || this.salesOrder.payment_type == 3 || this.salesOrder.payment_type == 4) {
								this.enableLogisticPower = true;
							} else {
								this.enableLogisticPower = false;
							}

							this.due_data.balance_overdue_limit = this.due_data.overdue_limit - utilized_overdue_limit; // total_payment_due
							if (this.due_data.balance_overdue_limit < 0) {
								this.due_data.balance_overdue_limit = 0;
							}
							current_limit = this.due_data.balance_overdue_limit;
						}

						if (current_limit < 0) {
							current_limit = 0;
						}
						this.due_data.case_type = case_type;
						this.due_data.total_outstanding = total_outstanding;
						this.due_data.total_payment_due = total_payment_due;
						if (this.salesOrder.company_id == 2 || this.salesOrder.company_id == 3) {
							current_limit += Number(this.salesOrder.balance_amount);
						} else if ((this.salesOrder.company_id != 1 && this.salesOrder.is_forward != 1) && ((this.salesOrder.company_id == 2) || (this.salesOrder.company_id == 3))) {
							current_limit += Number(this.salesOrder.balance_amount);
						} else if (this.salesOrder.company_id == 1 && this.salesOrder.is_forward == 0) {
							current_limit += Number(this.salesOrder.balance_amount);
						} else {
							console.log('NON CONDITIONAL BALANCE');
						}
						let total_current_limit = current_limit;

						let final_value = this.calculations.getRoundValue(current_limit);
						this.due_data.current_limit = final_value;
						this.due_data.original_current_limit = final_value;

						if (this.due_data.current_limit <= 0) {
							this.enableLogisticPower = false;
						}

						this.setQuantity(final_value);

						let last_dispatch_date = moment().format("YYYY-MM-DD");
						let last_dispatch_timestamp = moment();

						if (case_type == "Overdue") {
							this.enableAdhocPower = false;
							this.enableLogisticPower = true;
							this.is_utilized_overdue_limit = 1;
							this.crudServices.getOne<any>(Finance.getLastDispatchDate, {
								sub_org_id: sub_org_id
							}).subscribe(res_last_dispatch => {
								if (res_last_dispatch.code == '100') {
									if (res_last_dispatch.data.length > 0) {
										last_dispatch_date = moment(res_last_dispatch.data[0].last_dispatch_date).format('YYYY-MM-DD');
										last_dispatch_timestamp = res_last_dispatch.data[0].last_dispatch_date;
									}
								}
								this.crudServices.getOne<any>(DispatchPayments.getMiddlewarePayments, {
									payment_date_time: last_dispatch_timestamp,
									virtual_acc_no: this.addFinanceForm.value.virtual_acc_no
								}).subscribe(res_payment => {
									if (res_payment.code == '100') {
										if (res_payment.data.length > 0) {
											if (this.due_data.balance_overdue_limit < 0) {
												this.due_data.balance_overdue_limit = 0;
											}
											if (total_current_limit < 0) {
												total_current_limit = 0;
											}
											let new_overdue_limit = (this.due_data.balance_overdue_limit) + Number(res_payment.data[0].total_payment);

											if (new_overdue_limit > this.due_data.overdue_limit) {
												this.due_data.balance_overdue_limit = this.due_data.overdue_limit;
											} else {
												this.due_data.balance_overdue_limit = new_overdue_limit;
											}
											total_current_limit = this.due_data.balance_overdue_limit;
											// total_current_limit = current_limit + Number(res_payment.data[0].total_payment);
											this.due_data.current_limit = total_current_limit;
										}
									}
									let total_due_out = this.due_data.balance_overdue_limit + total_outstanding;
									if (total_due_out > this.due_data.base_limit) {
										total_current_limit = this.due_data.base_limit - total_outstanding;
									} else {
										if (total_current_limit > this.due_data.balance_overdue_limit) {
											total_current_limit = this.due_data.balance_overdue_limit;
										}
									}
									let final_current_limit = total_current_limit - total_undispatch_amount;
									let final_value = this.calculations.getRoundValue(final_current_limit);
									if (final_value < 0) {
										final_value = 0;
									}
									this.due_data.current_limit = final_value;

									this.plan_quantity = this.setQuantity(final_value);

								});
							});
						}
					});
				});
			});
		});
	}

	basicFinalsoldRate() {
		let org_tds = this.addFinanceForm.value.org_tds;
		let org_tcs = this.addFinanceForm.value.org_tcs;
		let obj_gst = this.percentValues.find(o => o.percent_type === 'gst');
		let rate = this.salesOrder.final_rate;
		let gst = obj_gst.percent_value;
		let gst_rate = Number(rate) * (Number(gst) / 100);
		let rate_with_gst = Number(rate) + Number(gst_rate);
		let tds_rate = (Number(org_tds) > 0) ? Number(rate) * (Number(org_tds) / 100) : 0;
		let tcs_rate = (Number(org_tcs) > 0) ? Number(rate_with_gst) * (Number(org_tcs) / 100) : 0;
		let invoice_value = rate_with_gst - tds_rate;
		invoice_value = invoice_value + tcs_rate;
		invoice_value = roundAmount(invoice_value);
		return Number(invoice_value);
	}

	calculateAvailableLimitQuantity(value) {
		let rate = this.basicFinalsoldRate();
		let availableLimitQuantity = Number(value) / Number(rate);
		let finalAvailableLimitQuantity = roundQuantity(availableLimitQuantity);
		return finalAvailableLimitQuantity;
	}

	setQuantity(available_limit) {
		let available_limit_quantity = this.calculateAvailableLimitQuantity(available_limit);
		let final_quantity = 0;
		if (available_limit_quantity >= Number(this.fp_balance_quantity)) {
			final_quantity = roundQuantity(Number(this.fp_balance_quantity));
		} else if (available_limit_quantity < Number(this.fp_balance_quantity)) {
			final_quantity = roundQuantity(available_limit_quantity);
		}
		this.balance_quantity = Number(this.fp_balance_quantity);

		this.addFinanceForm.patchValue({
			available_limit: available_limit,
			available_limit_quantity: available_limit_quantity,
			plan_quantity: final_quantity
		});

		this.enableLogisticPower = false;

		if (this.due_data.case_type == "Regular") {
			if (available_limit > 0 && this.salesOrder.payment_type == 2 || this.salesOrder.payment_type == 5) {
				this.enableLogisticPower = true;
			} else {
				this.enableLogisticPower = false;
			}
		} else {
			this.enableLogisticPower = true;
		}

		this.addFinanceForm.get("plan_quantity").setValidators([Validators.required, Validators.min(0.01), Validators.max(final_quantity)]);
		this.addFinanceForm.get('plan_quantity').updateValueAndValidity();

		return final_quantity;
	}

	onChangePlanDate(e) {
		// 
	}

	useAdhocPower(e) {
		let available_limit = Number(this.addFinanceForm.value.available_limit);
		let total_outstanding = this.due_data.total_outstanding + this.due_data.total_undispatch;
		let balance_adhoc_limit = this.due_data.adhoc_limit;
		let new_available_limit = 0;
		if (total_outstanding > 0) {
			balance_adhoc_limit = (this.due_data.base_limit + this.due_data.adhoc_limit) - total_outstanding;
			if (balance_adhoc_limit < 0) {
				balance_adhoc_limit = 0
			}
		}
		if (e) {
			new_available_limit = this.calculations.getRoundValue(available_limit + balance_adhoc_limit);
			this.addFinanceForm.patchValue({
				adhoc_power: balance_adhoc_limit
			});
		} else {
			new_available_limit = this.calculations.getRoundValue(available_limit - balance_adhoc_limit);
			this.addFinanceForm.patchValue({
				adhoc_power: null
			});
		}
		this.setQuantity(new_available_limit);
	}

	useLogisticPower(e) {
		let available_limit = Number(this.addFinanceForm.value.available_limit);
		let logistic_power = Number(this.logistic_power_value);
		let new_available_limit = 0;
		if (e) {
			new_available_limit = this.calculations.getRoundValue(available_limit + logistic_power);
			this.addFinanceForm.patchValue({
				logistic_power: logistic_power
			});
		} else {
			new_available_limit = this.calculations.getRoundValue(available_limit - logistic_power);
			this.addFinanceForm.patchValue({
				logistic_power: null
			});
		}
		this.setQuantity(new_available_limit);
	}

	useExtraAmount(e) {
		let available_limit = Number(this.addFinanceForm.value.available_limit);
		let extra_amount = 0;
		let new_available_limit = 0;
		let remaining_quantity = Number(this.fp_balance_quantity) - Number(this.plan_quantity);

		if (this.salesOrder.import_local_flag == 1) {
			extra_amount = Number(this.due_data.org_extra_import);
		} else if (this.salesOrder.import_local_flag == 2) {
			extra_amount = Number(this.due_data.org_extra_local);
		} else {
			extra_amount = 0;
		}

		let rate = this.basicFinalsoldRate();
		let availableLimitQuantity = Number(extra_amount) / Number(rate);
		let extra_to_be_used = roundQuantity(availableLimitQuantity);
		if (extra_to_be_used >= Number(remaining_quantity)) {
			extra_amount = roundQuantity(Number(remaining_quantity) * Number(rate));
		} else if (extra_to_be_used < Number(remaining_quantity)) {
			extra_amount = roundQuantity(extra_to_be_used * Number(rate));
		}
		this.extra_amount = extra_amount;
		if (e.checked) {
			new_available_limit = Number((available_limit + extra_amount).toFixed(2));
		} else {
			new_available_limit = Number((available_limit - extra_amount).toFixed(2));
		}
		this.setQuantity(new_available_limit);
	}

	useAdvanceAmount(e) {
		let available_limit = Number(this.addFinanceForm.value.available_limit);
		let extra_amount = 0;
		let new_available_limit = 0;
		// extra_amount = Number(this.salesOrder.advance_amount); //GOVINDA M. 28-07-2023: Temp Fix
		extra_amount = Number(this.salesOrder.advance_amount + this.salesOrder.balance_received); 
		// FORWARD DEALS : USER SHOULD BE ABLE TO USE ADVANCE AND BALANCE BOTH AMOUNTS
		// WHILE CREATING FINANCE PLANNING

		if (e.checked) {
			new_available_limit = Number((available_limit + extra_amount).toFixed(2));
		} else {
			new_available_limit = Number((available_limit - extra_amount).toFixed(2));
		}
		this.setQuantity(new_available_limit);
	}

	submitAddFinanceForm() {
		this.loadingBtn = true;

		let rate = this.basicFinalsoldRate();
		let quantity = Number(this.addFinanceForm.value.plan_quantity);
		let final_amount = roundAmount(rate * quantity);
		let so_advance = Number(this.salesOrder.balance_amount);

		let payment_type = null;
		let payment_term = null;
		let advance = null;

		let utilized_overdue_limit = 0;

		if (this.is_utilized_overdue_limit == 1) {
			utilized_overdue_limit = this.basicFinalsoldRate() * Number(this.addFinanceForm.value.plan_quantity);
		}

		if (so_advance > final_amount) {
			this.addFinanceForm.patchValue({
				advance_amount: final_amount
			});
			payment_type = 2;
			payment_term = 0;
			advance = 100;
		} else {
			this.addFinanceForm.patchValue({
				advance_amount: so_advance
			});
			payment_type = (so_advance > 0) ? 3 : 1;
			if (payment_type == 1) {
				payment_term = this.addFinanceForm.value.payment_term;
				advance = 0;
			} else {
				payment_term = this.addFinanceForm.value.payment_term;
				advance = this.addFinanceForm.value.advance;
			}
		}
		let data = {
			con_id: this.salesOrder.id,
			sub_org_id: this.addFinanceForm.value.sub_org_id,
			plan_quantity: Number(this.addFinanceForm.value.plan_quantity),
			unit_type: this.salesOrder.unit_type,
			plan_date: this.addFinanceForm.value.plan_date,
			validity_date: this.addFinanceForm.value.validity_date,
			payment_type: payment_type,
			payment_term: payment_term,
			advance: advance,
			adhoc_power: Number(this.addFinanceForm.value.adhoc_power),
			logistic_power: Number(this.addFinanceForm.value.logistic_power),
			overdue_limit: utilized_overdue_limit,
			advance_amount: Number(this.addFinanceForm.value.advance_amount),
			remark: this.addFinanceForm.value.remark,
			extra_amount: 0
		};

		let use_extra_amount = this.addFinanceForm.value.use_extra_amount;
		let so_data = null;
		if (use_extra_amount) {

			let utilized_extra_amount = this.basicFinalsoldRate() * Number(this.addFinanceForm.value.plan_quantity);
			let extra_column = this.getSubOrgExtraColumnName(this.salesOrder.import_local_flag);
			let received_amount = Number(this.salesOrder.received_amount) + utilized_extra_amount;
			so_data = {
				con_id: this.salesOrder.id,
				sub_org_id: this.addFinanceForm.value.sub_org_id,
				extra_column: extra_column,
				utilized_extra_amount: utilized_extra_amount,
				received_amount: received_amount
			};
			data.extra_amount = this.extra_amount;
			data.advance_amount = utilized_extra_amount;
		} else {
			so_data = null;
		}

		let body = {
			isForward: this.salesOrder.is_forward,
			company_id: this.salesOrder.company_id,
			data: data,
			so_data: so_data
		};
		this.notification_tokens = [...this.notification_tokens, this.salesOrder.zone_fcm_web_token];
		this.notification_id_users = [...this.notification_id_users, this.salesOrder.zone_id];

		let notification_body = null;

		if (this.notification_details != null) {
			notification_body = {
				notification: {
					"title": `${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} : ${this.notification_details.title}`,
					"body": `Cutstomer: ${this.salesOrder.customer}, Grade: ${this.salesOrder.grade_name} Quantity ${Number(this.addFinanceForm.value.plan_quantity)}`,
					"click_action": `https://erp.sparmarglobal.com:8085/#/sales/finance/${this.con_id}`
				},
				registration_ids: this.notification_tokens
			}
		}

		this.crudServices.addData(Finance.add, body).subscribe(res => {
			this.loadingBtn = false;
			if (res['code'] == '100') {
				this.sendInAppNotification(notification_body)
				this.toasterService.pop('success', 'Success', res['data']);
				this.getSalesOrder();
				this.addFinancePlanningModal.hide();
			}
		});
	}

	getSubOrgExtraColumnName(flag) {
		if (flag == 1) {
			return "extra_import";
		} else if (flag == 2) {
			return "extra_local";
		} else {
			return "extra_suspense";
		}
	}

	submitCancelFinanceForm() {
		this.loadingBtn = true;
		let fp_advance_amount = Number(this.cancelFinanceForm.value.advance_amount);
		let total_cancel_quantity = Number(this.cancelFinanceForm.value.cancel_quantity) + Number(this.cancelFinanceForm.value.previous_cancel_quantity);
		let data = {
			cancel_quantity: total_cancel_quantity,
			advance_amount: 0
		};
		let so_data = null;
		if (this.cancelData.extra_amount > 0) {
			let utilized_extra_amount = this.cancelData.extra_amount;
			let extra_column = this.getSubOrgExtraColumnName(this.salesOrder.import_local_flag);
			so_data = {
				sub_org_id: this.addFinanceForm.value.sub_org_id,
				extra_column: extra_column,
				utilized_extra_amount: utilized_extra_amount,
			};
		} else {
			so_data = null;
		}
		let body = {
			data: data,
			isForward: this.salesOrder.is_forward,
			company_id: this.salesOrder.company_id,
			fp_advance_amount: fp_advance_amount,
			id: this.cancelFinanceForm.value.id,
			con_id: this.salesOrder.id,
			so_data: so_data,
			balance_amount: this.salesOrder.balance_amount
		};
		this.notification_tokens = [...this.notification_tokens, this.salesOrder.zone_fcm_web_token];
		this.notification_id_users = [...this.notification_id_users, this.salesOrder.zone_id];
		let notification_body = null;
		if (this.notification_details != null) {
			notification_body = {
				notification: {
					"title": `${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} : ${this.notification_details.title}`,
					"body": `Cutstomer: ${this.salesOrder.customer},Total Cancel  Quantity ${total_cancel_quantity}`,
					"click_action": `https://erp.sparmarglobal.com:8085/#/sales/finance/${this.con_id}`
				},
				registration_ids: this.notification_tokens
			};
		}
		this.crudServices.updateData(Finance.cancel, body).subscribe(res => {
			if (res['code'] == '100') {
				this.loadingBtn = false;
				this.sendInAppNotification(notification_body);
				this.toasterService.pop('success', 'Success', res['data']);
				this.getSalesOrder();
				this.cancelFinancePlanningModal.hide();
			}
		});

	}

	exportExcel() {
		// 
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
			});
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
				table_name: 'sales_consignment',
			})
		}
		this.crudServices.addData(UsersNotification.add, { data: this.notification_users }).subscribe((data) => {
		}, (error) => console.error(error));
	}

}
