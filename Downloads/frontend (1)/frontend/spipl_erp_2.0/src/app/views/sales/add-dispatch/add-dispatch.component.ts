import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import {
	DispatchNew,
	ValueStore,
	PercentageDetails,
	Finance,
	SubOrg,
	GodownMaster,
	GradeMaster,
	LocalPurchase,
	CommonApis,
	UsersNotification,
	Notifications,
	LiveInventory
} from '../../../shared/apis-path/apis-path';
import { roundAmount, roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import * as moment from "moment";
import { MessagingService } from '../../../service/messaging.service';

@Component({
	selector: 'app-add-dispatch',
	templateUrl: './add-dispatch.component.html',
	styleUrls: ['./add-dispatch.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService, Calculations],
})

export class AddDispatchComponent implements OnInit {

	@ViewChild("addFinancePlanningModal", { static: false }) public addFinancePlanningModal: ModalDirective;
	@ViewChild("dispatchAddressModal", { static: false }) public dispatchAddressModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

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

	loadingBtn: boolean = false;
	isLoading = false;
	con_id: any = null;
	fp_id: any = null;
	id: any = null;
	isEdit: any = false;
	order_company_id: any = null;
	datePickerConfig: any = staticValues.datePickerConfig;
	max_date: any = new Date();
	logistic_power_qty: any = 5;
	fp_data: any = {};
	godownList: any = [];
	subGodownList: any = [];
	gradeList: any = [];
	transportersList: any = [];
	loadCrossTypeList: any = staticValues.loading_crossing;
	deliveryTermList: any = [];
	transitionList: any = staticValues.transition_type;
	shipToList: any = [];
	dispatchFromList: any = [];
	dispatchAddressList: any = [];
	purchaseDealList: any = [];
	percentValues: any = [];
	dispatchForm: FormGroup;
	showLogisticPower: boolean = true;
	enableLogisticPower: boolean = false;
	enableTempGST: boolean = false;
	enableLoad: boolean = false;
	enableCross: boolean = false;
	enableBillTo: boolean = false;
	enableBillShip: boolean = false;
	enableBillFrom: boolean = false;
	enableBillDispatch: boolean = false;
	enableFreightRate: boolean = false;
	// enableLR: boolean = false;
	enableDriverNumber: boolean = false;

	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	notification_details: any;
	notification_tokens: any = [];
	notification_id_users: any = []
	notification_users: any = [];
	zone_fcm: any = [];
	current_data: any;
	role_id: any = null;
	company_id: any = null;

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
		this.role_id = this.user.userDet[0].role_id;
		this.company_id = this.user.userDet[0].company_id;
		this.links = this.user.links;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];

		this.route.params.subscribe((params: Params) => {
			this.order_company_id = Number(params["company_id"]);
			this.con_id = Number(params["con_id"]);
			this.fp_id = Number(params["fp_id"]);
			if (params["id"]) {
				this.id = Number(params["id"]);
				this.isEdit = true;
			}
		});
	}

	ngOnInit() {
		this.getValueStore();
		this.getPercentValues();
		this.getGodowns();
		this.getTransporters();
		this.getPurchaseDeals();
		this.getDeliveryTerms();
		this.getShipToAddress();
		this.getDispatchFromAddress();
		this.initForm();
		this.getFCMWithNotification("NEW_DISPATCH_ADD")
	}

	getGodowns() {
		this.crudServices.getAll<any>(GodownMaster.getAll).subscribe(res => {
			this.godownList = res;
		});
	}

	getSubGodowns(main_godown_id) {
		this.crudServices.getOne<any>(GodownMaster.getSubGodowns, {
			main_godown_id: main_godown_id
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.subGodownList = res.data;
				}
			}
		});
	}

	getGrades(import_local_flag, godown_id, grade_id, main_grade_id, grade_request_status, category_request_status) {
		let main_grade_id_new = main_grade_id;

		if (grade_request_status == 2 && this.fp_data.company_id == 1) {
			main_grade_id_new = null;
		}

		let import_local_flag_new = import_local_flag;

		if (category_request_status == 2 && this.fp_data.company_id == 1) {
			import_local_flag_new = (import_local_flag == 1) ? 2 : 1;
		}

		this.fp_data.import_local_flag_new = import_local_flag_new;

		this.crudServices.getOne(LiveInventory.getDispatchGrades, {
			godown_id: godown_id,
			main_grade_id: main_grade_id_new,
			import_local_flag: import_local_flag_new,
			company_id: this.fp_data.company_id
		}).subscribe((res: any) => {
			if (res.data.length > 0) {
				res.data.forEach(element => {
					if (element.unit_id == 1) {
						element.unit_type = 'MT';
					} else if (element.unit_id == 2) {
						element.unit_type = 'DRUM-220';
					} else if (element.unit_id == 3) {
						element.unit_type = 'DRUM-227';
					}
				});
				this.gradeList = res.data;
			} else {
				this.toasterService.pop('error', 'Alert', 'No Grades Found');
			}
		});
	}

	// getGrades(import_local_flag, godown_id, grade_id, main_grade_id, grade_request_status) {
	// 	let grade_cat_id = null
	// 	if (grade_request_status == 2) {
	// 		grade_cat_id = null
	// 	} else {
	// 		grade_cat_id = grade_id
	// 	}
	// 	this.crudServices.getOne<any>(GradeMaster.getCatGrade, {
	// 		main_grade_id: grade_id
	// 	}).subscribe(res => {
	// 		if (res.code == '100') {
	// 			if (res.data.length > 0) {
	// 				this.gradeList = res.data;
	// 			}
	// 		}
	// 	});
	// }

	getTransporters() {
		this.transportersList = [];
		this.crudServices.getOne<any>(SubOrg.getSubOrgByCategory, {
			category_id: 103
		}).subscribe(res => {
			if (res.length > 0) {
				this.transportersList = res.map(result => {
					result.sub_org_name = `${result.sub_org_name} - ${result.location_vilage}`;
					return result;
				});
			}
			this.transportersList.push({
				sub_org_id: 0,
				sub_org_name: "Other"
			});
		});
	}

	getPurchaseDeals() {
		this.purchaseDealList = [];
		this.crudServices.getAll<any>(LocalPurchase.localPurchaseCustomers).subscribe(res => {
			if (res.code == "100") {
				if (res.data.length > 0) {
					let arr = [];
					res.data.forEach(element => {
						let deal_id = element.id;
						let deal_date = moment(element.deal_date).format("DD-MMM-YYYY");
						let pending_qty = Number(element.quantity) - Number(element.total_lift_qty);
						let sub_org_name = element.sub_org_name;
						// let location = element.customer + (element.location_vilage ? ' (' + element.location_vilage + ')' : '');
						let location = element.location_vilage;
						let unit_type = element.unit_type;
						let obj = {
							value: element.id,
							label: `${deal_id} - ${sub_org_name} (${unit_type}) | ${location} | ${deal_date} | ${pending_qty} MT`
						};
						arr.push(obj);
					});
					this.purchaseDealList = arr;
				}
			}
		});
	}

	getDeliveryTerms() {
		this.crudServices.getAll<any>(CommonApis.get_all_delivery_term).subscribe(res => {
			this.deliveryTermList = res;
		});
	}

	getShipToAddress() {
		this.crudServices.getAll<any>(DispatchNew.getShipToAddress).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach((element, index) => {
						this.shipToList.push({
							id: (index + 1),
							name: element.ship_to,
							type: 'Ship_To'
						});
					});
				}
			}
		});
	}

	getDispatchFromAddress() {
		this.crudServices.getAll<any>(DispatchNew.getDisptachFromAddress).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach((element, index) => {
						this.dispatchFromList.push({
							id: (index + 1),
							name: element.dispatch_from,
							type: 'Dispatch_From'
						});
					});
				}
			}
		});
	}

	createNewShippingAddress = (address) => {
		this.shipToList.push({ value: address, name: address })
		return { value: address, name: address }
	};

	createNewDispatchAddress = (address) => {
		this.dispatchFromList.push({ value: address, name: address })
		return { value: address, name: address }
	};

	initForm() {
		this.dispatchForm = new FormGroup({
			dispatch_date: new FormControl(new Date(), [Validators.required]),
			godown_id: new FormControl(null, [Validators.required]),
			grade_id: new FormControl(null, [Validators.required]),
			quantity: new FormControl(null, [Validators.required]),
			use_logistic_power: new FormControl(null),
			logistic_power: new FormControl(null),
			lr_no: new FormControl(null),
			lr_date: new FormControl(new Date()),
			transporter_id: new FormControl(null, [Validators.required]),
			temp_gst_no: new FormControl(null),
			truck_no: new FormControl(null, [Validators.required]),
			purchase_deal_id: new FormControl(null),
			purchase_invoice_no: new FormControl(null),
			purchase_invoice_date: new FormControl(null),
			driver_mobile_no: new FormControl(null),
			load_cross_type: new FormControl(null, [Validators.required]),
			load_quantity: new FormControl(null),
			load_charges: new FormControl(null),
			cross_quantity: new FormControl(null),
			cross_charges: new FormControl(null),
			total_load_cross: new FormControl(null),
			delivery_term_id: new FormControl(null, [Validators.required]),
			freight_rate: new FormControl(null),
			total_freight: new FormControl(null),
			total_freight_load_cross: new FormControl(null),
			is_eway_bill: new FormControl(null),
			transition_type: new FormControl(null, [Validators.required]),
			bill_from: new FormControl(null),
			dispatch_from: new FormControl(null),
			bill_to: new FormControl(null),
			ship_to: new FormControl(null),
			remark: new FormControl(null),
			import_local_flag: new FormControl(null, Validators.required),
			stock_type: new FormControl(null)
		});

		if (!this.isEdit) {
			this.getFinancePlan();
		}

		if (this.isEdit) {
			this.getDispatch();
		}
	}

	getFinancePlan() {
		this.crudServices.getOne<any>(Finance.getFinancePlan, {
			id: this.fp_id
		}).subscribe(res => {
			let total_amount = 0;
			res.data[0].total_amount = total_amount;
			this.fp_data = res.data[0];
			this.fp_data.category_request_status_label = (this.fp_data.category_request_status == 2) ? "Import/Local Grade Change Request Is Approved" : null;
			this.getSubGodowns(this.fp_data.godown_id);
			let d_quantity = Number(this.fp_data.balance_quantity) * 1000;
			this.dispatchForm.patchValue({
				bill_to: this.fp_data.org_address,
				godown_id: this.fp_data.godown_id,
				grade_id: this.fp_data.grade_id,
				quantity: roundQuantity(d_quantity),
				load_cross_type: 1,
				delivery_term_id: this.fp_data.delivery_term_id,
				freight_rate: this.fp_data.freight_rate,
				is_eway_bill: (this.fp_data.delivery_term_id == 1 || this.fp_data.delivery_term_id == 3) ? true : false,
				transition_type: 0,
				transporter_id: 0,
				import_local_flag: this.fp_data.import_local_flag_new,
				stock_type: this.fp_data.stock_type
			});
			this.dispatchForm.get('quantity').setValidators([Validators.required, Validators.min(0.5), Validators.max(Number(this.fp_data.balance_quantity) * 1000)]);
			this.dispatchForm.get('quantity').updateValueAndValidity();
			let gpdown = this.godownList.find(o => o.id == this.fp_data.godown_id);
			this.onChangeValue({
				id: this.fp_data.delivery_term_id
			}, 'delivery_term');
			this.onChangeValue({
				sub_org_id: 0
			}, 'transporter');
			this.onChangeValue({
				sub_org_id: 0
			}, 'quantity');
			this.onChangeValue(this.fp_data.freight_rate, 'freight_rate');
			this.onChangeValue(gpdown, 'godown');
			this.dispatchForm.patchValue({
				grade_id: this.fp_data.grade_id,
				quantity: roundQuantity(d_quantity),
				load_cross_type: 1,
				delivery_term_id: this.fp_data.delivery_term_id,
				freight_rate: this.fp_data.freight_rate,
				is_eway_bill: (this.fp_data.delivery_term_id == 1 || this.fp_data.delivery_term_id == 3) ? true : false,
				transition_type: 0,
				transporter_id: 0,
				import_local_flag: this.fp_data.import_local_flag_new,
			});
			this.onChangeValue(1, 'load_cross');
			this.onChangeValue(0, 'transition');
		});
	}

	getDispatch() {
		this.crudServices.getOne<any>(DispatchNew.getOne, {
			id: this.id
		}).subscribe(res_d => {
			if (res_d.code == '100') {
				if (res_d.data.length > 0) {
					this.fp_id = res_d.data[0].fp_id;
					this.con_id = res_d.data[0].con_id;
					this.current_data = res_d.data[0];
					this.crudServices.getOne<any>(Finance.getFinancePlan, {
						id: this.fp_id
					}).subscribe(res_f => {
						let total_amount = 0;
						res_f.data[0].total_amount = total_amount;
						this.fp_data = res_f.data[0];

						this.getSubGodowns(res_f.data[0].godown_id);

						this.onChangeValue(res_d.data[0].transition_type, 'transition');

						let d_quantity = Number(res_d.data[0].quantity) * 1000;
						let d_logistic = Number(res_d.data[0].logistic_power) * 1000;

						let d_load_quantity = Number(res_d.data[0].load_quantity) * 1000;
						let d_cross_quantity = Number(res_d.data[0].cross_quantity) * 1000;

						this.dispatchForm.patchValue({
							dispatch_date: new Date(res_d.data[0].dispatch_date),
							godown_id: res_d.data[0].godown_id
						});
						let gpdown = this.godownList.find(o => o.id == res_d.data[0].godown_id);
						this.onChangeValue(gpdown, 'godown');

						this.dispatchForm.patchValue({
							dispatch_date: new Date(res_d.data[0].dispatch_date),
							godown_id: res_d.data[0].godown_id,
							grade_id: res_d.data[0].grade_id,
							quantity: roundQuantity(d_quantity),
							use_logistic_power: (Number(res_d.data[0].logistic_power) > 0) ? true : false,
							logistic_power: roundQuantity(d_logistic),
							lr_no: res_d.data[0].lr_no,
							lr_date: res_d.data[0].lr_date,
							transporter_id: (res_d.data[0].transporter_id == null) ? 0 : res_d.data[0].transporter_id,
							temp_gst_no: res_d.data[0].temp_gst_no,
							truck_no: res_d.data[0].truck_no,
							purchase_deal_id: (res_d.data[0].purchase_deal_id != null && res_d.data[0].purchase_deal_id != undefined) ? res_d.data[0].purchase_deal_id : null,
							purchase_invoice_no: (res_d.data[0].purchase_invoice_no != null && res_d.data[0].purchase_invoice_no != undefined) ? res_d.data[0].purchase_invoice_no : null,
							purchase_invoice_date: (res_d.data[0].purchase_invoice_date != null && res_d.data[0].purchase_invoice_date != undefined) ? res_d.data[0].purchase_invoice_date : null,
							driver_mobile_no: res_d.data[0].driver_mobile_no,
							load_cross_type: res_d.data[0].load_cross_type,
							load_quantity: d_load_quantity,
							load_charges: res_d.data[0].load_charges,
							cross_quantity: d_cross_quantity,
							cross_charges: res_d.data[0].cross_charges,
							total_load_cross: res_d.data[0].total_load_cross,
							delivery_term_id: res_d.data[0].delivery_term_id,
							freight_rate: res_d.data[0].freight_rate,
							total_freight: res_d.data[0].total_freight,
							total_freight_load_cross: res_d.data[0].total_freight_load_cross,
							is_eway_bill: (res_d.data[0].is_eway_bill == 0) ? false : true,
							transition_type: res_d.data[0].transition_type,
							bill_from: res_d.data[0].bill_from,
							dispatch_from: res_d.data[0].dispatch_from,
							bill_to: res_d.data[0].bill_to,
							ship_to: res_d.data[0].ship_to,
							remark: res_d.data[0].remark,
							import_local_flag: res_d.data[0].import_local_flag
						});
						this.onChangeValue({
							sub_org_id: (res_d.data[0].transporter_id == null) ? 0 : res_d.data[0].transporter_id
						}, 'transporter');
						this.onChangeValue(res_d.data[0].load_cross_type, 'load_cross');
						this.onChangeValue({
							id: res_d.data[0].delivery_term_id
						}, 'delivery_term');

						let fp_quantity = 0;
						if (Number(this.fp_data.balance_quantity) > 0) {
							fp_quantity = Number(res_d.data[0].quantity) + Number(this.fp_data.balance_quantity);
						} else {
							let d_bal_qty = Number(this.fp_data.dispatch_quantity) - Number(res_d.data[0].quantity);
							let f_qty = Number(this.fp_data.plan_quantity) - Number(this.fp_data.cancel_quantity);
							fp_quantity = f_qty - d_bal_qty;
						}
						this.dispatchForm.get('quantity').setValidators([Validators.required, Validators.min(0.5), Validators.max(fp_quantity * 1000)]);
						this.dispatchForm.get('quantity').updateValueAndValidity();
					});
				}
			}
		});
	}

	getValueStore() {
		this.crudServices.getOne<any>(ValueStore.getOne, {
			key: "logistic_power_qty"
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.logistic_power_qty = Number(res.data[0].value);
				}
			}
		});
	}

	getPercentValues() {
		this.crudServices.getOne<any>(PercentageDetails.getOne, {
			detail_type: 2
		}).subscribe(res => {
			this.percentValues = res;
		});
	}

	onChangeValue(e, type) {
		if (type == 'freight_rate') {
			if (e != null && e != undefined) {
				let total_freight = Number(e) * this.getTotalQuantity();
				let total_cross = (Number(this.dispatchForm.value.cross_quantity) / 1000) * Number(this.dispatchForm.value.cross_charges);
				let total_load = (Number(this.dispatchForm.value.load_quantity) / 1000) * Number(this.dispatchForm.value.load_charges);
				let total_freight_load_cross = (total_load + total_cross) + Number(total_freight);
				this.dispatchForm.patchValue({
					total_freight: roundAmount(total_freight),
					total_load_cross: roundAmount(total_load + total_cross),
					total_freight_load_cross: roundAmount(total_freight_load_cross),
				});
			}
		}
		if (type == 'delivery_term') {
			this.enableFreightRate = true;
			if (e != null && e != undefined) {
				if (e.id == 1 || e.id == 3) {
					this.enableDriverNumber = true;
					this.enableFreightRate = true;
					let freight_rate = Number(this.fp_data.freight_rate);
					if (this.isEdit) {
						freight_rate = Number(this.current_data.freight_rate);
					}
					// if (this.fp_data.company_id == 1) {
					// 	this.dispatchForm.get('freight_rate').setValidators([Validators.required, Validators.min(0.5)]);
					// 	this.dispatchForm.get('freight_rate').updateValueAndValidity();
					// }
					this.dispatchForm.get('freight_rate').setValidators([Validators.required, Validators.min(0.5)]);
					this.dispatchForm.get('freight_rate').updateValueAndValidity();
					this.dispatchForm.patchValue({
						freight_rate: freight_rate,
						is_eway_bill: true
					});
					this.onChangeValue(freight_rate, 'freight_rate');
				} else {
					this.enableDriverNumber = false;
					this.enableFreightRate = false;
					this.dispatchForm.get('freight_rate').clearValidators();
					this.dispatchForm.get('freight_rate').updateValueAndValidity();
					this.dispatchForm.patchValue({
						freight_rate: null,
						is_eway_bill: false
					});
					this.onChangeValue(0, 'freight_rate');
				}
			}
		}
		if (type == 'grade') {
			this.dispatchForm.patchValue({
				import_local_flag: null
			});
			if (e != null && e != undefined) {
				let import_local_flag = null;
				if (e.import_local_flag != null && e.import_local_flag != undefined) {
					import_local_flag = e.import_local_flag;
				} else {
					this.toasterService.pop('error', 'Alert', 'Import Local Flag Not Set');
				}
				this.dispatchForm.patchValue({
					import_local_flag: import_local_flag
				});
			}
		}
		if (type == 'godown') {
			if (e != null && e != undefined) {
				this.dispatchForm.patchValue({
					load_charges: e.load_charges,
					cross_charges: e.cross_charges,
					bill_from: e.godown_address
				});
				let total_cross = (Number(this.dispatchForm.value.cross_quantity) / 1000) * Number(this.dispatchForm.value.cross_charges);
				let total_load = (Number(this.dispatchForm.value.load_quantity) / 1000) * Number(this.dispatchForm.value.load_charges);
				let total_freight_load_cross = (total_load + total_cross) + Number(this.dispatchForm.value.total_freight);
				this.dispatchForm.patchValue({
					total_load_cross: roundAmount(total_load + total_cross),
					total_freight_load_cross: roundAmount(total_freight_load_cross)
				});
				this.getGrades(this.fp_data.import_local_flag, e.id, this.fp_data.grade_id, this.fp_data.main_grade_id, this.fp_data.grade_request_status, this.fp_data.category_request_status);
			}
		}
		if (type == 'transporter') {
			if (e != null && e != undefined) {
				if (e.sub_org_id == 0) {
					this.enableTempGST = true;
				} else {
					this.enableTempGST = false;
					this.enableDriverNumber = true;
				}
			} else {
				this.enableTempGST = false;
			}
			if (this.dispatchForm.value.delivery_term_id == 2) {
				this.enableDriverNumber = false;
			} else {
				this.enableDriverNumber = true;
			}
		}
		if (type == 'transition') {
			this.dispatchForm.patchValue({
				ship_to: null,
				dispatch_from: null
			});
			this.enableBillTo = true;
			this.enableBillFrom = true;
			this.enableBillShip = false;
			this.enableBillDispatch = false;
			this.dispatchForm.get('ship_to').clearValidators();
			this.dispatchForm.get('ship_to').updateValueAndValidity();
			this.dispatchForm.get('dispatch_from').clearValidators();
			this.dispatchForm.get('dispatch_from').updateValueAndValidity();
			if (e != null && e != undefined) {
				if (e == 1) {
					this.enableBillShip = true;
					this.enableBillDispatch = false;
					this.enableBillTo = true;
					this.enableBillFrom = false;
					this.dispatchForm.get('ship_to').setValidators(Validators.required);
					this.dispatchForm.get('ship_to').updateValueAndValidity();
				} else if (e == 2) {
					this.enableBillShip = false;
					this.enableBillDispatch = true;
					this.enableBillTo = false;
					this.enableBillFrom = true;
					this.dispatchForm.get('dispatch_from').setValidators(Validators.required);
					this.dispatchForm.get('dispatch_from').updateValueAndValidity();
				} else if (e == 3) {
					this.enableBillShip = true;
					this.enableBillDispatch = true;
					this.enableBillTo = true;
					this.enableBillFrom = true;
					this.dispatchForm.get('ship_to').setValidators(Validators.required);
					this.dispatchForm.get('ship_to').updateValueAndValidity();
					this.dispatchForm.get('dispatch_from').setValidators(Validators.required);
					this.dispatchForm.get('dispatch_from').updateValueAndValidity();
				}
			}
		}
		if (type == 'load_cross') {
			this.dispatchForm.patchValue({
				load_quantity: 0,
				cross_quantity: 0,
				total_load_cross: 0
			});
			this.enableLoad = false;
			this.enableCross = false;
			let total_quantity = this.getTotalQuantity();
			this.dispatchForm.get('load_quantity').clearValidators();
			this.dispatchForm.get('load_quantity').updateValueAndValidity();
			this.dispatchForm.get('cross_quantity').clearValidators();
			this.dispatchForm.get('cross_quantity').updateValueAndValidity();
			if (e != null && e != undefined) {
				if (e == 1) {
					this.enableLoad = true;
					this.enableCross = false;
					this.dispatchForm.get('load_quantity').setValidators([Validators.required, Validators.min(0.5), Validators.max(total_quantity * 1000)]);
					this.dispatchForm.get('load_quantity').updateValueAndValidity();
					let total_load = total_quantity * Number(this.dispatchForm.value.load_charges);
					this.dispatchForm.patchValue({
						load_quantity: roundQuantity(total_quantity * 1000),
						cross_quantity: 0,
						total_load_cross: roundAmount(total_load)
					});
				} else if (e == 2) {
					this.enableLoad = false;
					this.enableCross = true;
					this.dispatchForm.get('cross_quantity').setValidators([Validators.required, Validators.min(0.5), Validators.max(total_quantity * 1000)]);
					this.dispatchForm.get('cross_quantity').updateValueAndValidity();
					let total_cross = total_quantity * Number(this.dispatchForm.value.cross_charges);
					this.dispatchForm.patchValue({
						load_quantity: 0,
						cross_quantity: roundQuantity(total_quantity * 1000),
						total_load_cross: roundAmount(total_cross)
					});
				} else if (e == 3) {
					this.enableLoad = true;
					this.enableCross = true;
					this.dispatchForm.get('load_quantity').setValidators([Validators.required, Validators.min(0.5), Validators.max(total_quantity * 1000)]);
					this.dispatchForm.get('load_quantity').updateValueAndValidity();
					this.dispatchForm.get('cross_quantity').setValidators([Validators.required, Validators.min(0.5), Validators.max(total_quantity * 1000)]);
					this.dispatchForm.get('cross_quantity').updateValueAndValidity();
					this.dispatchForm.patchValue({
						load_quantity: roundQuantity(total_quantity * 1000),
						cross_quantity: 0
					});
					let total_load = total_quantity * Number(this.dispatchForm.value.load_charges);
					this.dispatchForm.patchValue({
						load_quantity: roundQuantity(total_quantity * 1000),
						cross_quantity: 0,
						total_load_cross: roundAmount(total_load)
					});
				}
				let total_freight_load_cross = Number(this.dispatchForm.value.total_load_cross) + Number(this.dispatchForm.value.total_freight);
				this.dispatchForm.patchValue({
					total_freight_load_cross: roundAmount(total_freight_load_cross)
				});
			}
		}
		if (type == 'use_logistic_power') {
			this.enableLogisticPower = e;
			if (e) {
				this.dispatchForm.get('logistic_power').setValidators([Validators.required, Validators.min(0.5), Validators.max(this.logistic_power_qty * 1000)]);
				this.dispatchForm.get('logistic_power').updateValueAndValidity();
				this.dispatchForm.patchValue({
					logistic_power: this.logistic_power_qty * 1000
				});
			} else {
				this.dispatchForm.get('logistic_power').clearValidators();
				this.dispatchForm.patchValue({
					logistic_power: null
				});
			}
			let total_quantity = this.getTotalQuantity();
			this.dispatchForm.get('load_quantity').setValidators([Validators.required, Validators.min(0.5), Validators.max(total_quantity * 1000)]);
			this.dispatchForm.get('load_quantity').updateValueAndValidity();
			this.dispatchForm.patchValue({
				load_quantity: roundQuantity(total_quantity * 1000),
				cross_quantity: 0
			});
		}
		if (type == 'quantity') {
			if (this.dispatchForm.controls[type].valid) {
				let total_quantity = this.getTotalQuantity();
				if (this.enableLoad) {
					this.dispatchForm.patchValue({
						load_quantity: roundQuantity(total_quantity * 1000),
						cross_quantity: 0
					});
				}
				let total_freight = Number(this.dispatchForm.value.freight_rate) * total_quantity;
				let total_load = (Number(this.dispatchForm.value.load_quantity) / 1000) * Number(this.dispatchForm.value.load_charges);
				let total_cross = (Number(this.dispatchForm.value.cross_quantity) / 1000) * Number(this.dispatchForm.value.cross_charges);
				let total_freight_load_cross = (total_load + total_cross) + total_freight
				this.dispatchForm.patchValue({
					total_freight: roundAmount(total_freight),
					total_load_cross: roundAmount(total_load + total_cross),
					total_freight_load_cross: roundAmount(total_freight_load_cross)
				});
			}
		}
		if (type == 'logistic_power') {
			if (this.dispatchForm.controls[type].valid) {
				let total_quantity = this.getTotalQuantity();
				if (this.enableLoad) {
					this.dispatchForm.patchValue({
						load_quantity: roundQuantity(total_quantity * 1000),
						cross_quantity: 0
					});
				}
			}
		}
		if (type == 'load_quantity') {
			if (this.dispatchForm.controls[type].valid) {
				let total_quantity = this.getTotalQuantity() * 1000;
				if (this.enableCross) {
					let cross_quantity = total_quantity - Number(e);
					this.dispatchForm.patchValue({
						cross_quantity: roundQuantity(cross_quantity)
					});
				}
				let total_load = (Number(e) / 1000) * Number(this.dispatchForm.value.load_charges);
				let total_cross = (Number(this.dispatchForm.value.cross_quantity) / 1000) * Number(this.dispatchForm.value.cross_charges);
				let total_freight_load_cross = (total_load + total_cross) + Number(this.dispatchForm.value.total_freight);
				this.dispatchForm.patchValue({
					total_load_cross: roundAmount(total_load + total_cross),
					total_freight_load_cross: roundAmount(total_freight_load_cross)
				});
			}
		}
		if (type == 'cross_quantity') {
			if (this.dispatchForm.controls[type].valid) {
				let total_quantity = this.getTotalQuantity() * 1000;
				if (this.enableLoad) {
					let load_quantity = total_quantity - Number(e);
					this.dispatchForm.patchValue({
						load_quantity: roundQuantity(load_quantity)
					});
				}
				let total_cross = (Number(e) / 1000) * Number(this.dispatchForm.value.cross_charges);
				let total_load = (Number(this.dispatchForm.value.load_quantity) / 1000) * Number(this.dispatchForm.value.load_charges);
				let total_freight_load_cross = (total_load + total_cross) + Number(this.dispatchForm.value.total_freight);
				this.dispatchForm.patchValue({
					total_load_cross: roundAmount(total_load + total_cross),
					total_freight_load_cross: roundAmount(total_freight_load_cross)
				});
			}
		}
		if (type == "purchase_deal") {
			if (e != null && e != undefined) {
				this.enableLogisticPower = false;
				this.crudServices.getOne<any>(LocalPurchase.getBalanceLiftingQuantity, {
					deal_id: e.value
				}).subscribe(res => {
					if (res.code == '100' && res.data.length > 0) {
						let lifting_quantity = Number(res.data[0].balance_lifting_qty) * 1000;
						let fp_quantity = this.fp_data.balance_quantity * 1000;
						let dispatch_quantity = this.dispatchForm.value.quantity * 1000;
						let logistic_power_qty = this.logistic_power_qty * 1000;
						let final_quantity = 0;
						let max_quantity = 0;
						if (lifting_quantity > fp_quantity) {
							max_quantity = fp_quantity;
						} else {
							max_quantity = lifting_quantity;
						}
						final_quantity = max_quantity;
						this.dispatchForm.get("quantity").setValidators([Validators.max(max_quantity)]);
						this.dispatchForm.get('quantity').updateValueAndValidity();
						this.dispatchForm.patchValue({
							quantity: roundQuantity(final_quantity),
							use_logistic_power: false,
							logistic_power: null,
							load_quantity: roundQuantity(final_quantity),
							cross_quantity: 0
						});
					} else {
						this.dispatchForm.get("quantity").setValidators([Validators.max(0)]);
						this.dispatchForm.get('quantity').updateValueAndValidity();
						this.dispatchForm.patchValue({
							quantity: 0,
							use_logistic_power: false,
							logistic_power: null,
							load_quantity: 0,
							cross_quantity: 0
						});
					}
				});
			} else {
				this.enableLogisticPower = true;
				this.dispatchForm.get("quantity").setValidators([Validators.max(this.fp_data.balance_quantity)]);
				this.dispatchForm.get('quantity').updateValueAndValidity();
				this.dispatchForm.patchValue({
					quantity: roundQuantity(this.fp_data.balance_quantity * 1000),
					use_logistic_power: false,
					logistic_power: null,
					load_quantity: roundQuantity(this.fp_data.balance_quantity * 1000),
					cross_quantity: 0
				});
			}
		}
	}

	getTotalQuantity() {
		let total_quantity = (Number(this.dispatchForm.value.quantity) + Number(this.dispatchForm.value.logistic_power)) / 1000;
		return total_quantity;
	}

	submitdispatchForm() {
		this.loadingBtn = true;
		let total_quantity = this.getTotalQuantity();
		let obj_gst = this.percentValues.find(o => o.percent_type === 'gst');
		let base_amount = Number(total_quantity) * Number(this.fp_data.final_rate);
		let total_freight_load_cross = Number(this.dispatchForm.value.total_freight_load_cross);
		let total_amount = 0;
		if (this.dispatchForm.value.delivery_term_id != 3) {
			total_amount = base_amount;
		} else {
			total_amount = base_amount + total_freight_load_cross;
		}
		let gst_rate = total_amount * (Number(obj_gst.percent_value) / 100);
		let total_with_gst = total_amount + gst_rate;
		let tcs_rate = 0;
		if (this.fp_data.tcs > 0) {
			tcs_rate = total_with_gst * (Number(this.fp_data.tcs) / 100);
		}
		let total_with_tcs = total_with_gst + roundAmount(tcs_rate);
		let tds_rate = 0;
		if (this.fp_data.tds > 0) {
			tds_rate = total_amount * (Number(this.fp_data.tds) / 100);
		}
		let final_amount = total_with_tcs - roundAmount(tds_rate);

		let d_quantity = Number(this.dispatchForm.value.quantity) / 1000;
		let d_logistic = (Number(this.dispatchForm.value.logistic_power)) > 0 ? (Number(this.dispatchForm.value.logistic_power) / 1000) : 0;
		let d_load_quantity = Number(this.dispatchForm.value.load_quantity) / 1000;
		let d_cross_quantity = Number(this.dispatchForm.value.cross_quantity) / 1000;
		let body = {
			data: {
				con_id: this.con_id,
				fp_id: this.fp_id,
				sub_org_id: this.fp_data.sub_org_id,
				dispatch_date: this.dispatchForm.value.dispatch_date,
				godown_id: this.dispatchForm.value.godown_id,
				grade_id: this.dispatchForm.value.grade_id,
				quantity: roundQuantity(d_quantity),
				logistic_power: roundQuantity(d_logistic),
				unit_type: this.fp_data.unit_type,
				lr_no: this.dispatchForm.value.lr_no,
				lr_date: this.dispatchForm.value.lr_date,
				transporter_id: (this.dispatchForm.value.transporter_id == 0) ? null : this.dispatchForm.value.transporter_id,
				temp_gst_no: (this.dispatchForm.value.temp_gst_no == null) ? null : (this.dispatchForm.value.temp_gst_no).toUpperCase(),
				truck_no: (this.dispatchForm.value.truck_no).toUpperCase(),
				driver_mobile_no: this.dispatchForm.value.driver_mobile_no,
				purchase_deal_id: this.dispatchForm.value.purchase_deal_id,
				purchase_invoice_no: this.dispatchForm.value.purchase_invoice_no,
				purchase_invoice_date: this.dispatchForm.value.purchase_invoice_date,
				load_cross_type: this.dispatchForm.value.load_cross_type,
				load_quantity: roundQuantity(d_load_quantity),
				load_charges: this.dispatchForm.value.load_charges,
				cross_quantity: roundQuantity(d_cross_quantity),
				cross_charges: this.dispatchForm.value.cross_charges,
				total_load_cross: this.dispatchForm.value.total_load_cross,
				transition_type: this.dispatchForm.value.transition_type,
				bill_to: this.dispatchForm.value.bill_to,
				ship_to: this.dispatchForm.value.ship_to,
				bill_from: this.dispatchForm.value.bill_from,
				dispatch_from: this.dispatchForm.value.dispatch_from,
				delivery_term_id: this.dispatchForm.value.delivery_term_id,
				freight_rate: Number(this.dispatchForm.value.freight_rate),
				total_freight: this.dispatchForm.value.total_freight,
				is_eway_bill: (this.dispatchForm.value.is_eway_bill) ? 1 : 0,
				total_amount: roundAmount(final_amount),
				remark: this.dispatchForm.value.remark,
				import_local_flag: this.dispatchForm.value.import_local_flag,
				payment_reverse: this.fp_data.payment_reverse,
				payment_type: this.fp_data.payment_type,
				surisha_stock_flag: (this.fp_data.company_id == 3) ? 1 : 0,
				stock_type: this.dispatchForm.value.stock_type
			}
		};
		if (body.data.purchase_deal_id != null) {
			body.data["dispatch_type"] = 1;
			body["local_deal_data"] = {
				quantity: this.getTotalQuantity(),
				grade_id: body.data.grade_id,
				godown_id: body.data.godown_id,
				purchase_invoice_no: this.dispatchForm.value.purchase_invoice_no,
				material_received_date: body.data.dispatch_date,
				purchase_invoice_date: this.dispatchForm.value.purchase_invoice_date,
				truck_no: (body.data.truck_no).toUpperCase(),
				purchase_rate: 0,
				local_purchase_id: body.data.purchase_deal_id
			};
		} else {
			body.data["dispatch_type"] = 0;
			body["local_deal_data"] = null;
		}

		let Not_body = {
			notification: {
				"title": `${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name}  Added New Dispatch Details`,
				"body": `Customer :${this.fp_data.customer}, Grade:${this.getNameOfGrade(this.dispatchForm.value.grade_id).grade_name},Quantity: ${this.getTotalQuantity()},Godown:${this.getNameOfGodown(this.dispatchForm.value.godown_id).godown_name}`,
				"click_action": "#"
			},
			registration_ids: this.notification_tokens
		};

		if (this.isEdit) {
			let delete_invoice = false;
			if (
				this.dispatchForm.value.dispatch_date != this.current_data.dispatch_date ||
				this.dispatchForm.value.godown_id != this.current_data.godown_id ||
				this.dispatchForm.value.grade_id != this.current_data.grade_id ||
				this.dispatchForm.value.quantity != this.current_data.quantity ||
				this.dispatchForm.value.lr_no != this.current_data.lr_no ||
				this.dispatchForm.value.lr_date != this.current_data.lr_date ||
				this.dispatchForm.value.transporter_id != this.current_data.transporter_id ||
				this.dispatchForm.value.temp_gst_no != this.current_data.temp_gst_no ||
				this.dispatchForm.value.truck_no != this.current_data.truck_no ||
				this.dispatchForm.value.dispatch_from != this.current_data.dispatch_from ||
				this.dispatchForm.value.bill_to != this.current_data.bill_to ||
				this.dispatchForm.value.ship_to != this.current_data.ship_to ||
				this.dispatchForm.value.delivery_term_id != this.current_data.delivery_term_id ||
				this.dispatchForm.value.freight_rate != this.current_data.freight_rate ||
				this.dispatchForm.value.total_freight_rate != this.current_data.total_freight_rate ||
				this.dispatchForm.value.transition_type != this.current_data.transition_type
			) {
				delete_invoice = true;
			}
			body["delete_invoice"] = delete_invoice;
			body["id"] = this.id;
			this.crudServices.updateData(DispatchNew.update, body).subscribe(res => {
				this.loadingBtn = false;
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', res['data']);
					this.router.navigate(["sales/logistic"]);
				}
			});
		} else {
			this.crudServices.addData(DispatchNew.add, body).subscribe(res => {
				this.loadingBtn = false;
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', res['data']);
					this.router.navigate(["sales/logistic"]);
				}
			});
		}

	}

	onAction(item, type) {
		if (type == 'View_Ship_To_Address') {
			this.dispatchAddressList = this.shipToList;
			this.dispatchAddressModal.show();
		}
		if (type == 'View_Dispatch_From_Address') {
			this.dispatchAddressList = this.dispatchFromList;
			this.dispatchAddressModal.show();
		}
		if (type == 'Select_Dispatch_Address') {
			if (item.type == 'Ship_To') {
				this.dispatchForm.patchValue({
					ship_to: item.name
				});
			}
			if (item.type == 'Dispatch_From') {
				this.dispatchForm.patchValue({
					dispatch_from: item.name
				});
			}
			this.closeModal();
		}
	}

	closeModal() {
		this.dispatchAddressList = [];
		this.dispatchAddressModal.hide();
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
						this.notification_id_users = [...this.notification_id_users, ...notification.data[0].staff_id]
					}
				}
			})
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
				table_name: 'sales_consignment',
			})
		}
		this.crudServices.addData(UsersNotification.add, { data: this.notification_users }).subscribe((data) => {
		}, (error) => console.error(error));
	}

	getNameOfGrade(grade_id) {
		return this.gradeList.filter(grade => grade.grade_id === grade_id);
	}

	getNameOfGodown(godown_id) {
		return this.godownList.filter(godown => godown.id === godown_id);
	}


}
