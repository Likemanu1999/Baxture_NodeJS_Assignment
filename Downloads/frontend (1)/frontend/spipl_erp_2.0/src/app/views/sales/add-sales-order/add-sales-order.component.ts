import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ActivatedRoute, Params, Router, RoutesRecognized } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import { GenerateSoPvcService } from '../../../shared/generate-doc/generate-so-pvc';
import {
	MainOrg,
	SalesOrders,
	Consignments,
	PercentageDetails,
	SubOrg,
	GodownMaster,
	LiveInventory,
	GradeMaster,
	orgContactPerson,
	MainContact,
	CountryStateCityMaster,
	ValueStore,
	Notifications,
	UsersNotification,
	StaffMemberMaster,
	LocalPurchase,
	FileUpload,
	EmailTemplateMaster,
	SpiplBankMaster,
	CommonApis
} from '../../../shared/apis-path/apis-path';
import { CommonService, roundAmount, roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { AmountToWordPipe } from '../../../shared/amount-to-word/amount-to-word.pipe';
import { MessagingService } from '../../../service/messaging.service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import * as moment from "moment";
import { forkJoin } from "rxjs";
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { filter, pairwise } from 'rxjs/operators';
@Component({
	selector: 'app-add-sales-order',
	templateUrl: './add-sales-order.component.html',
	styleUrls: ['./add-sales-order.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		CrudServices,
		ToasterService,
		PermissionService,
		ExportService,
		CommonService,
		Calculations,
		CurrencyPipe,
		AmountToWordPipe,
		GenerateSoPvcService
	]
})

export class AddSalesOrderComponent implements OnInit {

	@ViewChild("addNewCustomerModal", { static: false }) public addNewCustomerModal: ModalDirective;
	@ViewChild("summaryModal", { static: false }) public summaryModal: ModalDirective;

	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 10000
	});

	datePickerConfig: any = staticValues.datePickerConfig;
	paymentTypesList: any = staticValues.payment_types;
	deliveryTermsList: any = staticValues.delivery_terms;
	currenciesList: any = staticValues.currencies;
	companyList: any = staticValues.companies;

	user: UserDetails;
	role_id: any = null;
	links: string[] = [];
	percent: any = [];
	customersList: any = [];
	zonesList: any = [];
	godownsList: any = [];
	gradesList: any = [];
	brokersList: any = [];
	commissionTypeList: any = [];
	tempEmailList: any = [];
	tempMobileList: any = [];
	citiesList: any = [];

	salesOrderForm: FormGroup;
	newEmailForm: FormGroup;
	newMobileForm: FormGroup;
	newCustomerForm: FormGroup;

	page_title: any = "Add Sales Order";
	currency: any = "INR";
	id: any = null;
	summary: any = null;
	selected_deal: any = null;
	selectedZone: any = null;
	org_payment_term: any = null;
	disableAdvancePayment: boolean = true;
	disableFreightRate: boolean = true;
	disablePaymentTerm: boolean = true;
	disableCommission: boolean = true;
	currency_change_access: boolean = false;
	edit_pe_pp: boolean = false;
	edit_godowm_pe_pp: boolean = false;
	loadingBtn: boolean = false;
	isLoading: boolean = false;
	editMode: boolean = false;
	enableCompany: any = false;
	company_bank_details: any = null;

	fileData: FormData = new FormData();
	notification_details: any;
	notification_tokens = [];
	notification_id_users = []
	notification_users = [];
	zone_fcm = [];

	company_id: any = null;
	emailSubject: any = null;
	emailFooterTemplete: any = null;
	emailBodyTemplete: any = null;
	emailFrom: any = null;
	magangementSPIPLWhatsappNumbers: any = staticValues.magangementSPIPLWhatsappNumbersSales;

	magangementSSurishaWhatsappNumbers: any = staticValues.magangementSSurishaWhatsappNumbersSales;
	magangementEmails: any = [];
	orgPendingOrders: any = 0;
	orgPendingOrdersAlert: boolean = false;
	errorMessage: any = "";
	advanceArray: number[];
	payment_term: any;
	previousRoute: any;
	expiry_date: any;
	editPayment: any = false;
	material_packs: any;

	constructor(
		toasterService: ToasterService,
		private route: ActivatedRoute,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private commonService: CommonService,
		private exportService: ExportService,
		private calculations: Calculations,
		private currencyPipe: CurrencyPipe,
		private amountToWord: AmountToWordPipe,
		private messagingService: MessagingService,
		private generateSoPvc: GenerateSoPvcService
	) {
		this.toasterService = toasterService;
		this.user = this.loginService.getUserDetails();
		this.role_id = this.user.userDet[0].role_id;
		if (this.user.userDet[0].role_id == 5 || this.user.userDet[0].role_id == 33) {
			if (this.user.userDet[0].insider_parent_id != null) {
				this.selectedZone = this.user.userDet[0].insider_parent_id;
			} else {
				this.selectedZone = this.user.userDet[0].id;
			}
		}
		this.company_id = this.user.userDet[0].company_id;
		if (this.role_id == 1) {
			this.enableCompany = true;
		} else {
			this.enableCompany = false;
		}
		this.links = this.user.links;
		let links_res = this.links.find(x => x == 'currency_change_access');
		this.currency_change_access = (links_res != null) ? true : false;
		const perms = this.permissionService.getPermission();

		this.route.params.subscribe((params: Params) => {
			if (params["id"] != null) {
				let data = JSON.parse(params["id"]);
				this.id = data.id;
				this.editPayment = data.editPayment;
				this.editMode = !data.editPayment;
				this.page_title = data.editPayment ? "Edit Payment Term " : "Edit Sales Order";
			}
		});
	}

	// , Validators.required
	ngOnInit() {
		this.getSpiplBank();
		this.getPercentValues();
		this.getBrokers();
		if (!this.editMode) {
			this.getCustomers();
		}
		this.getZones();
		this.getEmailTemplate();
		this.initForm();
		if (this.editMode || this.editPayment) {
			this.getSalesOrder();
		}
		this.getCities();
	}

	initForm() {
		this.salesOrderForm = new FormGroup({
			booking_date: new FormControl(moment().format("YYYY-MM-DD"), Validators.required),
			deal_type: new FormControl(0),
			main_org_id: new FormControl(null, Validators.required),
			sub_org_id: new FormControl(null, Validators.required),
			customer: new FormControl(null),
			zone_id: new FormControl(null, Validators.required),
			zone: new FormControl(null),
			godown_id: new FormControl(null, Validators.required),
			godown: new FormControl(null),
			grade_id: new FormControl(null, Validators.required),
			grade: new FormControl(null),
			original_bill_rate: new FormControl(null),
			bill_rate: new FormControl(null),
			deal_rate: new FormControl(null, [Validators.required, Validators.minLength(4)]),
			final_rate: new FormControl(null),
			discount_rate: new FormControl(null),
			credit_note: new FormControl(null),
			is_rate_same: new FormControl(null),
			currency: new FormControl("INR"),
			notional_rate: new FormControl(1),
			quantity: new FormControl(null, Validators.required),
			unit_type: new FormControl(null, Validators.required),
			base_amount: new FormControl(null, Validators.required),
			delivery_term_id: new FormControl(null, Validators.required),
			delivery_term: new FormControl(null),
			freight_rate: new FormControl(null, Validators.required),
			nb: new FormControl(null, Validators.required),
			payment_type: new FormControl(null, Validators.required),
			advance: new FormControl(null),
			payment_term: new FormControl(null),
			broker_id: new FormControl(null),
			broker_name: new FormControl(null),
			commission_type: new FormControl(null),
			commission_value: new FormControl(null),
			total_commission: new FormControl(null),
			remark: new FormControl(null),
			temp_email: new FormControl(null),
			temp_mobile: new FormControl(null),
			virtual_acc_no: new FormControl(null),
			tds: new FormControl(null),
			tcs: new FormControl(null),
			extra_suspense: new FormControl(null),
			extra_import: new FormControl(null),
			extra_local: new FormControl(null),
			company_id: new FormControl(this.company_id),
			import_local_flag: new FormControl(null, Validators.required),
			blacklist: new FormControl(null, Validators.required),
			is_forward: new FormControl(null),
			is_price_protection: new FormControl(false),
			eta: new FormControl(null),
			expiry_date: new FormControl(null),
			stock_type: new FormControl(null),
			packing: new FormControl(null),
			shipment_from: new FormControl(null),
			shipment_to: new FormControl(null)
		});

		if (this.company_id == 2) {
			this.salesOrderForm.get('stock_type').setValidators([Validators.required]);
			this.salesOrderForm.get('stock_type').updateValueAndValidity();
		} else {
			this.salesOrderForm.get('stock_type').clearValidators();
			this.salesOrderForm.get('stock_type').updateValueAndValidity();
		}

		this.newEmailForm = new FormGroup({
			email: new FormControl(null, Validators.required),
			sub_org_id: new FormControl(null, Validators.required),
			contact_person_id: new FormControl(null),
		});

		this.newMobileForm = new FormGroup({
			mobile_no: new FormControl(null, Validators.required),
			sub_org_id: new FormControl(null, Validators.required),
			contact_person_id: new FormControl(null),
		});

		this.newCustomerForm = new FormGroup({
			company_name: new FormControl(null, Validators.required),
			person_name: new FormControl(null, Validators.required),
			mobile_no: new FormControl(null, Validators.required),
			email: new FormControl(null, Validators.required),
			payment_term: new FormControl(null, Validators.required),
			city_id: new FormControl(null, Validators.required),
			state_id: new FormControl(null, Validators.required)
		});
	}

	getSalesOrder() {
		this.crudServices.getOne<any>(SalesOrders.getSalesOrder, {
			id: this.id
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.selected_deal = res.data[0];
					this.onChangeValue({
						id: res.data[0].company_id
					}, 'company');

					this.id = res.data[0].id;

					this.getGodowns(res.data[0].zone_id);

					let blacklist = null;

					if (res.data[0].blacklist == 0) {
						blacklist = res.data[0].blacklist;
					} else {
						this.toasterService.pop('error', 'Alert', 'Customer is Blacklisted');
					}

					this.salesOrderForm.patchValue({
						booking_date: new Date(res.data[0].booking_date),
						main_org_id: res.data[0].main_org_id,
						sub_org_id: res.data[0].sub_org_id,
						customer: res.data[0].customer,
						zone_id: res.data[0].zone_id,
						zone: res.data[0].zone,
						godown_id: res.data[0].godown_id,
						deal_type: res.data[0].deal_type,
						blacklist: blacklist,
					});

					this.onChangeValue({
						id: res.data[0].godown_id
					}, 'godown');

					let grade_id_new = res.data[0].grade_id + '-' + res.data[0].import_local_flag;

					this.payment_term = res.data[0].payment_type;
					// this.org_payment_term = res.data[0].payment_term;

					let body = {
						category_id: 11,
						org_unit: 1,
						sales_acc_holder: this.selected_deal.zone_id,
						product_type: this.selected_deal.company_id,
						sub_org_id: this.selected_deal.sub_org_id
					}

					this.crudServices.getOne<any>(SubOrg.getGroupCustomers, body).subscribe(res => {
						if (res.length > 0) {
							this.org_payment_term = res[0].payment_term;
						}
					});
					if (res.data[0].company_id == 1 && res.data[0].is_forward == 1) {
						this.advanceArray = [15, 20];
					}
					this.salesOrderForm.patchValue({
						is_forward: res.data[0].is_forward,
						godown: res.data[0].godown_name,
						grade_id: grade_id_new,
						grade: res.data[0].grade_name,
						bill_rate: res.data[0].bill_rate,
						deal_rate: res.data[0].deal_rate,
						final_rate: res.data[0].final_rate,
						currency: res.data[0].currency,
						notional_rate: res.data[0].notional_rate,
						quantity: res.data[0].quantity,
						unit_type: res.data[0].unit_type,
						base_amount: res.data[0].base_amount,
						delivery_term_id: res.data[0].delivery_term_id,
						delivery_term: res.data[0].delivery_term,
						freight_rate: res.data[0].freight_rate,
						nb: res.data[0].nb,
						payment_type: res.data[0].payment_type,
						advance: res.data[0].advance,
						payment_term: res.data[0].payment_term,
						broker_id: res.data[0].broker_id,
						commission_type: res.data[0].commission_type,
						commission_value: res.data[0].commission_value,
						total_commission: res.data[0].total_commission,
						remark: res.data[0].remark,
						temp_email: res.data[0].temp_email.split(','),
						temp_mobile: res.data[0].temp_mobile.split(','),
						import_local_flag: res.data[0].import_local_flag,
						so_link_bal_qty: res.data[0].quantity,
						stock_type: res.data[0].stock_type,
						eta: res.data[0].eta,
						expiry_date: res.data[0].expiry_date,
						virtual_acc_no: res.data[0].virtual_acc_no
					});

					this.tempEmailList = res.data[0].temp_email.split(',');
					this.tempMobileList = res.data[0].temp_mobile.split(',');

					if (res.data[0].delivery_term_id == 1) {
						this.disableFreightRate = false;
					} else {
						this.disableFreightRate = true;
					}

					if (res.data[0].commission_value > 0) {
						this.disableCommission = false;
					} else {
						this.disableCommission = true;
					}

					if (res.data[0].unit_type == 'MT') {
						this.commissionTypeList = [
							{
								id: 1,
								name: "Per MT"
							},
							{
								id: 3,
								name: "Fix Amount (Rs.)"
							}
						]
					} else {
						this.commissionTypeList = [
							{
								id: 2,
								name: "Per Drum"
							},
							{
								id: 3,
								name: "Fix Amount (Rs.)"
							}
						]
					}
				}
			}
		});
	}

	getValueStore() {
		this.crudServices.getOne<any>(ValueStore.getOne, {
			key: "notional_rate"
		}).subscribe(res => {
			this.salesOrderForm.patchValue({
				notional_rate: res.data[0].value
			})
		});
	}

	getPercentValues() {
		this.crudServices.getOne<any>(PercentageDetails.getOne, {
			detail_type: 2
		}).subscribe(res => {
			this.percent = res;
		});
	}

	getSpiplBank() {
		this.crudServices.getOne<any>(SpiplBankMaster.getCompanyBank, {
			company_id: this.company_id
		}).subscribe(res => {
			if (res.length > 0) {
				this.company_bank_details = {
					bank_name: res[0].bank_name,
					branch_name: res[0].branch_name,
					ifsc_code: res[0].ifsc_code
				};
			}
		});
	}

	getCustomers() {
		this.isLoading = true;
		let body = {
			category_id: 11,
			org_unit: 1,
			// blacklist: 0,
			product_type: (this.editMode) ? this.selected_deal.company_id : this.company_id
		}
		if (this.selectedZone) {
			body['sales_acc_holder'] = this.selectedZone;
		} else {
			body['sales_acc_holder'] = (this.editMode) ? this.selected_deal.zone_id : null;
		}
		this.crudServices.getOne<any>(SubOrg.getGroupCustomers, body).subscribe(res => {
			if (res.length > 0) {
				res.forEach(element => {
					element.customer = element.sub_org_name + ' (' + element.location_vilage + ')';
				});
				this.customersList = res;
				this.isLoading = false;
			}
		});
		this.commissionTypeList = [
			{
				id: 1,
				name: "Per MT"
			},
			{
				id: 3,
				name: "Fix Amount (Rs.)"
			}
		]
	}

	getZones() {
		this.crudServices.getOne<any>(StaffMemberMaster.getMarketingPersonsNew, {
			company_id: this.company_id
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						element.name = element.first_name + ' ' + element.last_name;
					});
					this.zonesList = res.data;
				}
			}
		});
	}

	getGodowns(zone_id) {
		if (this.company_id == 1) {
			this.crudServices.getOne<any>(GodownMaster.getAllGodownByZone, {
				zone_id: zone_id
			}).subscribe(res => {

				if (res.length > 0) {
					this.godownsList = res;
				}
			});
		} else {
			this.crudServices.getAll<any>(GodownMaster.getAllHeadGodown).subscribe(res => {
				if (res.length > 0) {
					this.godownsList = res;
				}
			});
		}
	}

	getGrades(godown_id, zone_id) {
		let condition = {
			main_godown_id: godown_id,
			zone_id: zone_id,
			company_id: (this.editMode || this.editPayment) ? this.selected_deal.company_id : this.company_id
		}
		this.crudServices.getOne(LiveInventory.getGodownWiseGradeImportLocal, condition).subscribe((res: any) => {
			if (res.data.length > 0) {
				res.data.forEach(element => {
					if (element.unit_id == 1) {
						element.unit_type = 'MT';
					} else if (element.unit_id == 2) {
						element.unit_type = 'DRUM-220';
					} else if (element.unit_id == 3) {
						element.unit_type = 'DRUM-227';
					} else {
						element.unit_type = 'MT';
					}
				});
				res.data.map(element => {
					element.grade_id_new = element.grade_id + '-' + element.import_local_flag;
					return element;
				});
				this.gradesList = res.data;
			} else {
				this.toasterService.pop('error', 'Alert', 'No Grades Found');
			}
		});
	}

	// getGrades(godown_id, zone_id) {
	// 	if (this.company_id == 1) {
	// 		this.crudServices.getOne(LiveInventory.getGodownWiseGrade, {
	// 			main_godown_id: godown_id,
	// 			zone_id: zone_id,
	// 			company_id: this.company_id
	// 		}).subscribe((res: any) => {
	// 			if (res.length > 0) {
	// 				res.forEach(element => {
	// 					if (element.grade_master.unit_id == 1) {
	// 						element.unit_type = 'MT';
	// 					} else if (element.grade_master.unit_id == 2) {
	// 						element.unit_type = 'DRUM-220';
	// 					} else if (element.grade_master.unit_id == 3) {
	// 						element.unit_type = 'DRUM-227';
	// 					} else {
	// 						element.unit_type = 'MT';
	// 					}
	// 				});
	// 				this.gradesList = res;
	// 			} else {
	// 				this.toasterService.pop('error', 'Alert', 'No Grades Found');
	// 			}
	// 		});
	// 	} else {
	// 		this.crudServices.getOne(GradeMaster.getSurishaGrades, {
	// 			company_id: this.company_id,
	// 			godown_id: godown_id
	// 		}).subscribe((res: any) => {
	// 			if (res.code == '100') {
	// 				if (res.data.length > 0) {
	// 					res.data.forEach(element => {
	// 						if (element.unit_id == 1) {
	// 							element.unit_type = 'MT';
	// 						} else if (element.unit_id == 2) {
	// 							element.unit_type = 'DRUM-220';
	// 						} else if (element.unit_id == 3) {
	// 							element.unit_type = 'DRUM-227';
	// 						}
	// 					});
	// 					this.gradesList = res.data;
	// 				}
	// 			}
	// 		});
	// 	}
	// }

	getBrokers() {
		this.brokersList = [];
		this.crudServices.getOne<any>(SubOrg.getSubOrgByCategory, {
			category_id: 112
		}).subscribe(res => {
			if (res.length > 0) {
				if (res[0].org_contact_people.length > 0) {
					res[0].org_contact_people.forEach(element => {
						this.brokersList.push(element)
					});
				}
			}
		});
	}

	getCities() {
		this.crudServices.getOne<any>(CountryStateCityMaster.getCountryCities, {
			country_id: 101
		}).subscribe(response => {
			this.citiesList = response.data;
		});
	}

	async getEmailTemplate() {
		this.emailSubject = '';
		this.emailFooterTemplete = '';
		await this.crudServices.getOne<any>(EmailTemplateMaster.getOne, {
			template_name: 'sales_order_confirmation'
		}).subscribe(response => {
			if (response.length > 0) {
				this.emailBodyTemplete = response[0].custom_html;
				this.emailSubject = response[0].subject;
				this.emailFrom = response[0].from_name;
			}
		});
		await this.crudServices.getOne<any>(EmailTemplateMaster.getOne, {
			template_name: 'Footer'
		}).subscribe(response_foot => {
			if (response_foot.code == 100) {
				this.emailFooterTemplete = response_foot[0].custom_html;
			}
		});
	}

	getFinalRate() {
		let final_rate = 0;
		if (Number(this.salesOrderForm.value.bill_rate) > Number(this.salesOrderForm.value.deal_rate)) {
			final_rate = Number(this.salesOrderForm.value.bill_rate);
		} else {
			final_rate = Number(this.salesOrderForm.value.deal_rate);
		}
		return roundAmount(final_rate);
	}

	getSubOrg() {
		this.crudServices.getOne<any>(SubOrg.getSingleSubOrg, {
			sub_org_id: this.summary.sub_org_id
		}).subscribe(res => {
			if (res.length > 0) {
				this.calculateReceivedPayment(res[0]);
			}
		});
	}

	onSubmit() {

		if (this.salesOrderForm.invalid) {
			if (this.salesOrderForm.value.is_forward == '1' && this.company_id == 1 && (moment(this.salesOrderForm.value.eta).format('YYYY-MM-DD') > moment(this.salesOrderForm.value.expiry_date).format('YYYY-MM-DD'))) {
				this.errorMessage = 'Delivery date can not be less than ETA'
			} else {
				this.errorMessage = 'Please fill all mandatory fields'
			}
			return;
		} else {
			if (this.editMode || this.editPayment) {
				this.getFCMWithNotification('SALES_CONSIGNMENT_EDIT')
			} else {
				this.getFCMWithNotification('ADD_NEW_SALES_DEAL')
			}

			let discount_rate = Number(this.salesOrderForm.value.bill_rate) - Number(this.salesOrderForm.value.deal_rate);
			let credit_note = 0;
			if (discount_rate > 0) {
				credit_note = Number(this.salesOrderForm.value.quantity) * discount_rate;
			} else {
				discount_rate = 0;
			}
			this.salesOrderForm.patchValue({
				final_rate: this.getFinalRate(),
				discount_rate: discount_rate,
				credit_note: credit_note
			});

			this.summary = this.salesOrderForm.value;

			let obj_gst = this.percent.find(o => o.percent_type == 'gst');
			let base_amount = roundAmount(Number(this.summary.final_rate) * Number(this.summary.quantity));
			let total_amount = this.calculations.getTotalAmountWithTax(base_amount, this.summary.tds, this.summary.tcs, obj_gst.percent_value, this.company_id);
			this.summary.total_amount = roundAmount(total_amount);

			if (Number(this.summary.bill_rate) == 0) {
				this.summary.bill_rate = this.summary.deal_rate;
			}

			if (this.summary.payment_type == 1 || this.summary.payment_type == 5) {
				this.summary.payment_term_label = this.summary.payment_term + " Days";
			} else if (this.summary.payment_type == 2) {
				this.summary.payment_term_label = "Advance by RTGS";
			} else if (this.summary.payment_type == 4) {
				this.summary.payment_term_label = "Advance by LC";
			} else if (this.summary.payment_type == 3) {
				this.summary.payment_term_label = this.summary.payment_term + " Days | " + this.summary.advance + "% Advance";
			}

			this.getBankForSO();
			this.summaryModal.show();
			this.getExpiryDate()
		}
	}
	getBankForSO() {
		if (this.company_id == 1 && this.salesOrderForm.controls.is_forward.value == 1) {
			this.crudServices.getOne<any>(SpiplBankMaster.getOne, { id: 2 }).subscribe((response) => {
				if (response && response.length > 0) {
					this.company_bank_details.bank_name = response[0].bank_name;
					this.company_bank_details.account_no = response[0].account_no;
					this.company_bank_details.ifsc_code = response[0].ifsc_code;
					this.company_bank_details.branch_name = response[0].branch_name;
				}
			});
		}
		else {
			this.company_bank_details['account_no'] = this.summary.virtual_acc_no;
		}
	}

	confirmSummary() {
		this.loadingBtn = true;
		if (this.editMode || this.editPayment) {
			let amount = this.selected_deal.balance_amount;
			let extra_column = this.getSubOrgExtraColumnName(this.selected_deal.import_local_flag);
			this.crudServices.updateData(SalesOrders.reverseExtraAmount, {
				sub_org_Fid: this.summary.sub_org_id,
				extra_column: extra_column,
				received_amount: amount
			}).subscribe(result => {
				this.getSubOrg();
			});
		} else {
			if (this.company_id == 1 && this.salesOrderForm.controls.is_forward.value != 1) {
				this.calculateReceivedPayment(this.summary);
			} else {
				this.submitData();
			}
		}
	}

	calculateReceivedPayment(data) {
		let received_amount = 0;
		if (this.summary.import_local_flag == 1) {
			received_amount = Number(data.extra_import);
		} else if (this.summary.import_local_flag == 2) {
			received_amount = Number(data.extra_local);
		} else {
			received_amount = 0;
		}
		this.summary.extra_column_name = this.getSubOrgExtraColumnName(this.summary.import_local_flag);
		if (received_amount > roundAmount(this.summary.total_amount)) {
			this.summary.received_amount = roundAmount(this.summary.total_amount);
		} else {
			this.summary.received_amount = received_amount;
		}
		this.summary.balance_amount = this.summary.received_amount;

		this.submitData();
	}

	getExpiryDate() {
		let daysCount = (this.company_id == 1 && this.summary.is_forward == 0) ? 10 : 8;
		this.expiry_date = moment(this.summary.booking_date).add(daysCount, 'days').format("YYYY-MM-DD");

		if (this.summary.is_forward == 1 && this.company_id == 1) {
			this.expiry_date = this.summary.expiry_date;
		} else if (this.summary.is_forward == 1 && this.company_id == 2) {
			this.expiry_date = moment(this.summary.eta).add(daysCount, 'days').format("YYYY-MM-DD");
		}
	}

	submitData() {
		let grade_id_arr = this.summary.grade_id.split('-');

		if (this.company_id == 1 && this.salesOrderForm.controls.is_forward.value == 1) {
			this.summary.advance_to_be_received = ((this.summary.advance / 100) * this.summary.total_amount).toFixed(3);
		} else {
			this.summary.advance_to_be_received = 0;
		}

		let data = {
			booking_date: this.summary.booking_date,
			main_org_id: this.summary.main_org_id,
			sub_org_id: this.summary.sub_org_id,
			zone_id: this.summary.zone_id,
			godown_id: this.summary.godown_id,
			grade_id: Number(grade_id_arr[0]),
			currency: this.summary.currency,
			notional_rate: Number(this.summary.notional_rate),
			bill_rate: Number(this.summary.bill_rate),
			deal_rate: Number(this.summary.deal_rate),
			final_rate: this.summary.final_rate,
			is_rate_same: (this.summary.is_rate_same) ? 1 : 0,
			quantity: Number(this.summary.quantity),
			unit_type: this.summary.unit_type,
			base_amount: Number(this.summary.base_amount),
			total_amount: Number(this.summary.total_amount),
			received_amount: Number(this.summary.received_amount),
			balance_amount: Number(this.summary.balance_amount),
			discount_rate: Number(this.summary.discount_rate),
			credit_note: this.summary.credit_note,
			delivery_term_id: this.summary.delivery_term_id,
			freight_rate: Number(this.summary.freight_rate),
			nb: Number(this.summary.nb),
			payment_type: this.summary.payment_type,
			payment_term: this.summary.payment_term,
			advance: this.summary.advance,
			broker_id: this.summary.broker_id,
			commission_type: this.summary.commission_type,
			commission_value: this.summary.commission_value,
			total_commission: this.summary.total_commission,
			virtual_acc_no: this.summary.virtual_acc_no,
			remark: this.summary.remark,
			deal_type: 1,
			temp_email: this.summary.temp_email.toString(),
			temp_mobile: this.summary.temp_mobile.toString(),
			company_id: this.company_id,
			import_local_flag: this.summary.import_local_flag,
			expiry_date: this.expiry_date,
			so_link_bal_qty: this.summary.quantity,
			is_forward: (this.summary.is_forward) == '1' ? 1 : 0,
			advance_to_be_received: Number(this.summary.advance_to_be_received),
			is_price_protection: (this.summary.is_price_protection) ? 1 : 0,
			eta: (this.summary.eta != null) ? moment(this.summary.eta).format("YYYY-MM-DD") : null,
			stock_type: this.summary.stock_type
		};

		if (this.editMode || this.editPayment) {
			data['virtual_acc_no'] = this.selected_deal.virtual_acc_no;
		}

		if (this.zone_fcm.length) {
			this.notification_tokens = [...this.notification_tokens, this.zone_fcm];
			this.notification_id_users = [...this.notification_id_users, this.summary.zone_id]
		}

		let notification_body = null;

		if (this.notification_details != null) {
			notification_body = {
				notification: {
					"title": `${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name}  ${this.notification_details.title}`,
					"body": `Customer :  ${this.getCustomerName(data.sub_org_id)},  Grade:${this.getGradeName(data.grade_id)},Quantity: ${data.quantity},Godown:${this.getGodownName(data.godown_id)}`,
					"click_action": "https://erp.sparmarglobal.com:8085/#/sales/add-sales-order"
				},
				registration_ids: this.notification_tokens
			}
		}

		let body = {
			data: data,
			extra_column_name: this.summary.extra_column_name,
			company_id: Number(this.company_id)
		};

		if (this.editMode || this.editPayment) {
			body['id'] = this.id;
			this.crudServices.updateData(SalesOrders.update, body).subscribe(res => {
				this.loadingBtn = false;
				if (res['code'] == '100') {
					this.summaryModal.hide();
					this.summary = null;
					this.toasterService.pop('success', 'Success', res['data']);
					if (notification_body != null) {
						this.sendInAppNotification(notification_body);
					}
					this.generateSalesOrder(this.id);
				} else {
					this.summaryModal.hide();
					this.summary = null;
					this.toasterService.pop('error', 'Failed', 'Failed');
				}
			});
		} else {
			this.crudServices.addData(SalesOrders.add, body).subscribe(result => {
				this.loadingBtn = false;
				if (result['code'] == '100') {
					this.summaryModal.hide();
					this.summary = null;
					if (notification_body != null) {
						this.sendInAppNotification(notification_body);
					}
					this.generateSalesOrder(result['data']);
				} else {
					this.summaryModal.hide();
					this.summary = null;
					this.toasterService.pop('error', 'Failed', 'Failed');
				}
			});
		}
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

	generateSalesOrder(con_id) {
		this.crudServices.getOne<any>(SalesOrders.getSalesOrder, {
			id: con_id
		}).subscribe(res_data => {
			if (res_data.code == '100') {
				if (res_data.data.length > 0) {
					this.generateSoPvc.generateSo(res_data.data[0], this.percent, this.company_bank_details).then(async (pdfObj) => {
						let pdfOBjFromData = pdfObj;
						await pdfMake.createPdf(pdfOBjFromData).getBlob(data => {
							if (data) {
								this.fileData.append('sales_order_pdf', data, 'so.pdf')
								this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res => {
									let path = res.uploads.sales_order_pdf[0].location;
									this.crudServices.updateData(SalesOrders.update, {
										id: res_data.data[0].id,
										data: {
											so_copy: path
										}
									}).subscribe(result => {
										if (result) {
											if (this.company_id == 1) {
												this.toasterService.pop('success', 'Success', 'Deal Added Successfully');
												this.sendEmail(res_data.data[0], pdfObj);
												this.sendWhatsApp(res_data.data[0], path);
												this.summary = null;
												this.goBack();
											} else {
												this.toasterService.pop('success', 'Success', 'Deal Added Successfully');
												this.summary = null;
												this.goBack();
											}
										}
									})
								})
							}
						});
					});
				}
			}
		});
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

	onSubmitContact(type) {
		if (type == 'email') {
			this.crudServices.getOne(Consignments.checkEmailExists, {
				email: this.newEmailForm.value.email,
				sub_org_id: this.newEmailForm.value.sub_org_id
			}).subscribe(res => {
				if (res['code'] == '100' && res['data'].length > 0) {
					this.isLoading = false;
					this.toasterService.pop('error', 'Alert', 'Email Already Exist');
				} else {
					let contact_person_id = this.newEmailForm.value.contact_person_id;
					if (contact_person_id != null) {
						this.crudServices.addData(MainContact.addEmailAgainstContactPerson, {
							email_id: this.newEmailForm.value.email,
							contact_id: contact_person_id,
							sub_org_id: this.newEmailForm.value.sub_org_id,
							sales: 1
						}).subscribe(res_email => {
							this.tempEmailList.push(this.newEmailForm.value.email);
							this.toasterService.pop('success', 'Success', 'New Email Added Successfully');
							this.newEmailForm.patchValue({
								email: null
							});
						});
					} else {
						this.crudServices.addData(orgContactPerson.addDefaultContact, {
							sub_org_id: this.newEmailForm.value.sub_org_id,
							person_name: 'Default Contact',
							designation_id: 1,
							email: this.newEmailForm.value.email,
							contact_number: [],
							is_default_person: 1,
							sales: 1
						}).subscribe(res_email => {
							if (res_email['code'] == 100) {
								this.tempEmailList.push(this.newEmailForm.value.email);
								this.toasterService.pop('success', 'Success', 'New Email Added Successfully');
								this.newEmailForm.patchValue({
									email: null
								});
							}
						});
					}
				}
			});
		}
		if (type == 'mobile') {
			this.crudServices.getOne(Consignments.checkMobileExists, {
				contact_no: this.newMobileForm.value.mobile_no,
				sub_org_id: this.newMobileForm.value.sub_org_id
			}).subscribe(res => {
				if (res['code'] == '100' && res['data'].length > 0) {
					this.isLoading = false;
					this.toasterService.pop('error', 'Alert', 'Mobile Number Already Exist');
				} else {
					let contact_person_id = this.newMobileForm.value.contact_person_id;
					if (contact_person_id != null) {
						this.crudServices.addData(MainContact.addContactNumberAgainstContactPerson, {
							contact_no: this.newMobileForm.value.mobile_no,
							cont_id: contact_person_id,
							sub_org_id: this.newMobileForm.value.sub_org_id,
							sales: 1
						}).subscribe(res_mobile => {
							this.tempMobileList.push(this.newMobileForm.value.mobile_no);
							this.toasterService.pop('success', 'Success', 'New Mobile Number Added Successfully');
							this.newMobileForm.patchValue({
								mobile_no: null
							});
						});
					} else {
						this.crudServices.addData(orgContactPerson.addDefaultContact, {
							sub_org_id: this.newMobileForm.value.sub_org_id,
							person_name: 'Default Contact',
							designation_id: 1,
							email: null,
							contact_number: [{
								contact_no: this.newMobileForm.value.mobile_no
							}],
							is_default_person: 1,
							sales: 1
						}).subscribe(res_mobile => {
							if (res_mobile['code'] == 100) {
								this.tempMobileList.push(this.newMobileForm.value.mobile_no);
								this.toasterService.pop('success', 'Success', 'New Mobile Number Added Successfully');
								this.newMobileForm.patchValue({
									mobile_no: null
								});
							}
						});
					}
				}
			});
		}
	}

	getMaterialPackMaster() {
		this.crudServices.getAll<any>(CommonApis.getAllMaterialPack).subscribe(res => {
			this.isLoading = false;
			if (res.length > 0) {
				this.material_packs = res;
			}
		});
	}

	onChangeValue(e, type) {
		this.errorMessage = ""
		this.zone_fcm = [];
		if (type == 'company') {
			this.salesOrderForm.reset();
			if (e != null && e != undefined) {
				this.company_id = e.id;
				if (this.company_id == 1) {
					this.salesOrderForm.get('is_forward').setValidators([Validators.required]);
					this.salesOrderForm.get('is_forward').updateValueAndValidity();
				}

				if (this.company_id == 3) {
					this.getMaterialPackMaster();
					this.salesOrderForm.get('shipment_from').setValidators([Validators.required]);
					this.salesOrderForm.get('shipment_from').updateValueAndValidity();
					this.salesOrderForm.get('shipment_to').setValidators([Validators.required]);
					this.salesOrderForm.get('shipment_to').updateValueAndValidity();
					this.salesOrderForm.get('packing').setValidators([Validators.required]);
					this.salesOrderForm.get('packing').updateValueAndValidity();
				}

				this.getSpiplBank();
				this.getCustomers();
				this.getZones();
				this.initForm();
			}
		}
		if (type == 'is_forward') {
			if (this.salesOrderForm.controls.is_forward.value == '1') {
				this.salesOrderForm.get('eta').setValidators([Validators.required]);
				this.salesOrderForm.get('eta').updateValueAndValidity();
				if (this.company_id == 1) {
					this.salesOrderForm.get('expiry_date').setValidators([Validators.required]);
					this.salesOrderForm.get('expiry_date').updateValueAndValidity();
				}
			} else {
				this.salesOrderForm.get('eta').clearValidators();
				this.salesOrderForm.get('eta').updateValueAndValidity();
				this.salesOrderForm.get('expiry_date').clearValidators();
				this.salesOrderForm.get('expiry_date').updateValueAndValidity();
			}
		}
		if (type == 'is_rate_same') {
			if (e.checked) {
				this.salesOrderForm.patchValue({
					bill_rate: this.salesOrderForm.value.deal_rate,
					final_rate: this.salesOrderForm.value.deal_rate,
					discount_rate: 0,
					credit_note: 0
				});
			} else {
				let discount_rate = 0;
				let credit_note = 0;
				if (Number(this.salesOrderForm.value.bill_rate) > Number(this.salesOrderForm.value.deal_rate)) {
					discount_rate = Number(this.salesOrderForm.value.bill_rate) - Number(this.salesOrderForm.value.deal_rate);
					credit_note = Number(this.salesOrderForm.value.quantity) * discount_rate;
				}
				this.salesOrderForm.patchValue({
					bill_rate: this.salesOrderForm.value.original_bill_rate,
					final_rate: this.getFinalRate(),
					discount_rate: discount_rate,
					credit_note: credit_note
				});
			}
			let base_amount = this.calculations.getBaseAmount({
				rate: this.getFinalRate(),
				quantity: this.salesOrderForm.value.quantity
			});
			let nb = this.calculations.getNbNew({
				rate: Number(this.salesOrderForm.value.deal_rate),
				freight_rate: Number(this.salesOrderForm.value.freight_rate)
			});
			this.salesOrderForm.patchValue({
				base_amount: base_amount,
				nb: nb
			});
		}
		if (type == 'currency') {
			if (e != null && e != undefined) {
				this.currency = e.name;
				if (e.id != 0) {
					this.getValueStore();
				}
			}
		}
		if (type == 'customer') {
			this.godownsList = [];
			this.tempEmailList = [];
			this.tempMobileList = [];
			this.salesOrderForm.patchValue({
				main_org_id: null,
				customer: null,
				zone_id: null,
				zone: null,
				godown_id: null,
				godown: null,
				grade_id: null,
				grade: null,
				payment_type: null,
				payment_term: null,
				advance: null,
				virtual_acc_no: null,
				tds: null,
				tcs: null,
				extra_suspense: null,
				extra_import: null,
				extra_local: null,
				blacklist: null
			});
			if (e != null && e != undefined) {
				this.orgPendingOrders = 0;
				this.crudServices.getOne(SalesOrders.getOrgPendingOrders, {
					sub_org_id: e.sub_org_id,
					deal_type: 1
				}).subscribe(res_org => {
					if (res_org['code'] == '100') {
						this.orgPendingOrders = Number(res_org['data']);
					}

					let proceedDeal = false;

					if (this.company_id == 2) {
						proceedDeal = true;
					} else {
						if (this.orgPendingOrders < 3) {
							proceedDeal = true;
						} else {
							proceedDeal = false;
						}
					}

					this.orgPendingOrdersAlert = true;

					if (proceedDeal) {
						// this.toasterService.pop('success', 'Success', 'Total Pending Orders : ' + this.orgPendingOrders);
						if (e.salesAccHolder != null && e.salesAccHolder.fcm_web_token != null) {
							this.zone_fcm.push(e.salesAccHolder.fcm_web_token)
						}
						if (e.blacklist == 0) {
							if (e.sales_acc_holder != null) {
								this.salesOrderForm.patchValue({
									main_org_id: e.org_id,
									customer: e.sub_org_name,
									virtual_acc_no: e.virtual_acc_no,
									zone_id: e.sales_acc_holder,
									zone: e.salesAccHolder.first_name + ' ' + e.salesAccHolder.last_name,
									tds: (e.org_tds_tcs != null && e.org_tds_tcs.length > 0) ? e.org_tds_tcs[0].tds : 0,
									tcs: (e.org_tds_tcs != null && e.org_tds_tcs.length > 0) ? e.org_tds_tcs[0].tcs : 0,
									extra_suspense: Number(e.extra_suspense),
									extra_import: Number(e.extra_import),
									extra_local: Number(e.extra_local),
									blacklist: Number(e.blacklist)
								});
								this.org_payment_term = e.payment_term;
								if (e.payment_term > 0) {
									this.salesOrderForm.patchValue({
										payment_type: 1
									});
									this.onChangeValue(1, 'payment_type');
								} else if (e.payment_term == 0) {
									this.salesOrderForm.patchValue({
										payment_type: 2
									});
									this.onChangeValue(2, 'payment_type');
								} else {
									this.onChangeValue(null, 'payment_type');
								}
								let contact_person_id = null;

								if (e.org_contact_people.length > 0) {
									let org_cont_person = e.org_contact_people.find(o => o.is_default_person == 1);
									if (org_cont_person != null && org_cont_person != undefined && org_cont_person.length > 0) {
										contact_person_id = org_cont_person[0].cont_id;
									}
									e.org_contact_people.forEach(element => {
										if (element.org_contact_emails.length > 0) {
											for (const email of element.org_contact_emails) {
												this.tempEmailList.push(email.email_id);
											}
										}
										if (element.org_contact_numbers.length > 0) {
											for (const mobile of element.org_contact_numbers) {
												this.tempMobileList.push(mobile.contact_no);
											}
										}
									});
									this.newEmailForm.patchValue({
										sub_org_id: e.sub_org_id,
										contact_person_id: contact_person_id
									});
									this.newMobileForm.patchValue({
										sub_org_id: e.sub_org_id,
										contact_person_id: contact_person_id
									});
								}
								this.getGodowns(e.sales_acc_holder);
							} else {
								this.toasterService.pop('error', 'Alert', 'Zone is not assigned');
							}
						} else {
							this.toasterService.pop('error', 'Alert', 'Customer is Blacklisted');
						}
					} else {
						this.toasterService.pop('error', 'Alert', 'Total Pending Orders : ' + this.orgPendingOrders);
					}
				});
			} else {
				this.orgPendingOrders = 0;
				this.orgPendingOrdersAlert = false;
			}
		}
		if (type == 'godown') {
			this.salesOrderForm.patchValue({
				godown: null
			});
			if (e != null && e != undefined) {
				this.salesOrderForm.patchValue({
					godown: e.godown_name
				});
				this.getGrades(e.id, this.salesOrderForm.value.zone_id);
			} else {
				this.gradesList = [];
				this.salesOrderForm.patchValue({
					grade_id: null
				});
			}
		}
		if (type == 'grade') {
			this.commissionTypeList = [];
			this.salesOrderForm.patchValue({
				grade: null,
				original_bill_rate: 0,
				import_local_flag: null,
				bill_rate: 0,
				commission_type: null,
				commission_value: null,
				total_commission: null
			});

			if (e != null && e != undefined) {
				if (!this.editMode || this.editPayment) {
					if (this.company_id == 2) {
						let grade_id_arr = e.grade_id_new.split('-');
						this.crudServices.getOne<any>(GradeMaster.getGradePrice, {
							grade_id: grade_id_arr[0],
							godown_id: this.salesOrderForm.value.godown_id
						}).subscribe(res => {
							if (res.code == '100') {
								if (res.data.length > 0) {
									this.setGradeDetails(e, res.data[0].rate);
								} else {
									this.setGradeDetails(e, 0);
								}
							} else {
								this.setGradeDetails(e, 0);
							}
						});
					} else {
						this.setGradeDetails(e, e.rate);
					}
				} else {
					if (this.selected_deal.company_id == 2) {
						let grade_id_arr = e.grade_id_new.split('-');
						this.crudServices.getOne<any>(GradeMaster.getGradePrice, {
							grade_id: grade_id_arr[0],
							godown_id: this.salesOrderForm.value.godown_id
						}).subscribe(res => {
							if (res.code == '100') {
								if (res.data.length > 0) {
									this.setGradeDetails(e, res.data[0].rate);
								} else {
									this.setGradeDetails(e, 0);
								}
							} else {
								this.setGradeDetails(e, 0);
							}
						});
					} else {
						this.setGradeDetails(e, e.rate);
					}
				}
			}
		}
		if (type == 'delivery_term') {
			this.salesOrderForm.patchValue({
				delivery_term: null
			});
			if (e != null || e != undefined) {
				this.salesOrderForm.patchValue({
					delivery_term: e.name
				});
				if (e.id == 1) {
					this.disableFreightRate = false;
					this.salesOrderForm.patchValue({
						nb: this.salesOrderForm.value.nb,
						freight_rate: 0
					});
					this.salesOrderForm.get('freight_rate').setValidators([Validators.required, Validators.min(1)]);
					this.salesOrderForm.get('freight_rate').updateValueAndValidity();
				} else {
					this.salesOrderForm.patchValue({
						freight_rate: 0,
						nb: this.salesOrderForm.value.nb,
					});
					this.disableFreightRate = true;
					this.salesOrderForm.get('freight_rate').clearValidators();
					this.salesOrderForm.get('freight_rate').updateValueAndValidity();
				}
			} else {
				this.salesOrderForm.patchValue({
					freight_rate: 0,
					nb: this.salesOrderForm.value.nb,
				});
				this.disableFreightRate = true;
				this.salesOrderForm.controls['freight_rate'].clearValidators();
				this.salesOrderForm.controls['freight_rate'].updateValueAndValidity();
			};
		}
		if (type == 'payment_type') {
			this.salesOrderForm.get('payment_term').clearValidators();
			this.salesOrderForm.get('advance').clearValidators();
			this.disableAdvancePayment = true;
			this.disablePaymentTerm = true;
			if (e != null && e != undefined) {
				this.payment_term = e;

				if (e == 1) {
					if (this.company_id == 1 && this.salesOrderForm.controls.is_forward.value == 1) {
						this.advanceArray = [15, 20];
						this.salesOrderForm.patchValue({
							payment_term: this.org_payment_term,
							advance: 15
						});
					} else {
						this.salesOrderForm.patchValue({
							payment_term: this.org_payment_term,
							advance: 0
						});
					}
					this.salesOrderForm.get('payment_term').setValidators([Validators.required, Validators.max(this.org_payment_term)]);
					this.salesOrderForm.get('payment_term').updateValueAndValidity();
					this.disableAdvancePayment = true;
					this.disablePaymentTerm = false;
				} else if (e == 5) {
					if (this.company_id == 1 && this.salesOrderForm.controls.is_forward.value == 1) {
						this.advanceArray = [15, 20];
						this.salesOrderForm.patchValue({
							payment_term: this.org_payment_term,
							advance: 15
						});
					} else {
						this.salesOrderForm.patchValue({
							payment_term: this.org_payment_term,
							advance: 0
						});
					}

					this.disableAdvancePayment = true;
					this.disablePaymentTerm = true;
				} else if (e == 2 || e == 4) {
					if (this.company_id == 1 && this.salesOrderForm.controls.is_forward.value == 1) {
						this.advanceArray = [15, 20];
						this.salesOrderForm.patchValue({
							payment_term: 0,
							advance: 15
						});
					} else {
						this.salesOrderForm.patchValue({
							payment_term: 0,
							advance: 100
						});
					}

					this.salesOrderForm.get('payment_term').updateValueAndValidity();
					this.salesOrderForm.get('advance').updateValueAndValidity();
					// this.salesOrderForm.patchValue({
					// 	payment_term: 0,
					// 	advance: 100
					// });
					this.disableAdvancePayment = true;
					this.disablePaymentTerm = true;
				} else if (e == 3) {
					if (this.company_id == 1 && this.salesOrderForm.controls.is_forward.value == 1) {
						this.salesOrderForm.patchValue({
							payment_term: this.org_payment_term,
							advance: 15
						});
					} else {
						this.salesOrderForm.patchValue({
							payment_term: this.org_payment_term,
							advance: 50
						});
					}
					this.salesOrderForm.get('payment_term').setValidators([Validators.required, Validators.max(this.org_payment_term)]);
					this.salesOrderForm.get('advance').setValidators([Validators.required]);
					this.salesOrderForm.get('payment_term').updateValueAndValidity();
					this.salesOrderForm.get('advance').updateValueAndValidity();
					// this.salesOrderForm.patchValue({
					// 	payment_term: this.org_payment_term,
					// 	advance: 50
					// });
					this.disableAdvancePayment = false;
					this.disablePaymentTerm = false;
				}
			}
		}
		if (type == 'commission_type') {
			this.salesOrderForm.patchValue({
				commission_value: null,
				total_commission: null
			});
			this.disableCommission = false;
		}
		if (type == 'commission_value') {
			this.salesOrderForm.patchValue({
				total_commission: null
			});
			if (e != null && e != undefined) {
				let totalCommission = this.calculations.getCommission({
					commission_type: this.salesOrderForm.value.commission_type,
					commission: e,
					quantity: this.salesOrderForm.value.quantity
				});
				this.salesOrderForm.patchValue({
					total_commission: totalCommission
				});
			}
		}
		if (type == 'deal_rate') {
			this.salesOrderForm.patchValue({
				base_amount: null
			});
			if (e != null && e != undefined) {
				if (this.salesOrderForm.value.is_rate_same) {
					this.salesOrderForm.patchValue({
						bill_rate: Number(e)
					});
				} else {
					this.salesOrderForm.patchValue({
						bill_rate: Number(this.salesOrderForm.value.original_bill_rate)
					});
				}
				let base_amount = this.calculations.getBaseAmount({
					rate: this.getFinalRate(),
					quantity: this.salesOrderForm.value.quantity
				});
				let nb = this.calculations.getNbNew({
					rate: Number(this.salesOrderForm.value.deal_rate),
					freight_rate: Number(this.salesOrderForm.value.freight_rate)
				});
				this.salesOrderForm.patchValue({
					base_amount: base_amount,
					nb: nb
				});
				let discount_rate = 0;
				let credit_note = 0;
				if (Number(this.salesOrderForm.value.original_bill_rate) > Number(this.salesOrderForm.value.deal_rate)) {
					discount_rate = Number(this.salesOrderForm.value.bill_rate) - Number(this.salesOrderForm.value.deal_rate);
					credit_note = discount_rate * Number(this.salesOrderForm.value.quantity);
				}
				this.salesOrderForm.patchValue({
					discount_rate: discount_rate,
					credit_note: credit_note
				});
			}
		}
		if (type == 'quantity') {
			this.salesOrderForm.patchValue({
				base_amount: null
			});
			if (e != null && e != undefined) {
				let base_amount = this.calculations.getBaseAmount({
					rate: this.getFinalRate(),
					quantity: e
				});
				let totalCommission = this.calculations.getCommission({
					commission_type: this.salesOrderForm.value.commission_type,
					commission: this.salesOrderForm.value.commission_value,
					quantity: e
				});
				this.salesOrderForm.patchValue({
					base_amount: base_amount,
					total_commission: totalCommission
				});
			}
		}
		if (type == 'freight_rate') {
			let nb = this.calculations.getNbNew({
				rate: Number(this.salesOrderForm.value.deal_rate),
				freight_rate: e
			});
			this.salesOrderForm.patchValue({
				nb: nb
			});
		}
		if (type == 'city') {
			this.newCustomerForm.patchValue({
				state_id: null
			});
			if (e != null && e != undefined) {
				this.newCustomerForm.patchValue({
					state_id: e.state_id
				});
			}
		}
		if (type == 'broker') {
			this.newCustomerForm.patchValue({
				broker_name: null
			});
			if (e != null && e != undefined) {
				this.newCustomerForm.patchValue({
					broker_name: e.person_name
				});
			}
		}
	}

	setGradeDetails(e, rate) {
		let min_rate = Number(rate) - Number(e.lowest_cap);
		let unit_type = e.unit_type;
		let import_local_flag = null;
		let nb = Number(this.salesOrderForm.value.deal_rate) - Number(this.salesOrderForm.value.freight_rate);

		if (e.import_local_flag != null && e.import_local_flag != undefined) {
			import_local_flag = e.import_local_flag;
		} else {
			this.toasterService.pop('error', 'Alert', 'Import Local Flag Not Set');
		}

		let final_deal_rate = 0;

		if (this.editMode || this.editPayment) {
			final_deal_rate = (this.selected_deal.company_id == 2) ? Number(this.selected_deal.deal_rate) : 0;
		} else {
			final_deal_rate = (this.company_id == 1) ? rate : 0
		}

		this.salesOrderForm.patchValue({
			grade: e.grade_name,
			import_local_flag: import_local_flag,
			original_bill_rate: rate,
			bill_rate: rate,
			deal_rate: final_deal_rate,
			unit_type: unit_type
		});

		this.salesOrderForm.patchValue({
			nb: nb
		});

		if (this.editMode || this.editPayment && this.selected_deal.company_id == 2) {
			let discount_rate = 0;
			let credit_note = 0;
			if (Number(this.salesOrderForm.value.bill_rate) > Number(this.salesOrderForm.value.deal_rate)) {
				discount_rate = Number(this.salesOrderForm.value.bill_rate) - Number(this.salesOrderForm.value.deal_rate);
				credit_note = Number(this.salesOrderForm.value.quantity) * discount_rate;
			}
			this.salesOrderForm.patchValue({
				final_rate: this.getFinalRate(),
				discount_rate: discount_rate,
				credit_note: credit_note
			});
		}

		if (e.allocated_inventory_concession != undefined) {
			this.toasterService.pop('success', `Available quantity: ${(Number(e.allocated_inventory_concession) > 0) ? roundQuantity(e.allocated_inventory_concession) : 0} including concession`);
			if (this.company_id == 1) {
				this.salesOrderForm.get('quantity').setValidators([Validators.required, Validators.max(roundQuantity(e.allocated_inventory_concession))]);
				this.salesOrderForm.get('quantity').updateValueAndValidity();
			}
		}

		if (this.company_id == 1) {
			this.salesOrderForm.get('deal_rate').setValidators([Validators.required, Validators.minLength(4), Validators.min(min_rate)]);
			this.salesOrderForm.get('deal_rate').updateValueAndValidity();
		}

		if (unit_type == 'MT') {
			this.commissionTypeList = [
				{
					id: 1,
					name: "Per MT"
				},
				{
					id: 3,
					name: "Fix Amount (Rs.)"
				}
			]
		} else {
			this.commissionTypeList = [
				{
					id: 2,
					name: "Per Drum"
				},
				{
					id: 3,
					name: "Fix Amount (Rs.)"
				}
			]
		}
	}

	addNewCustomer() {
		this.newCustomerForm.reset();
		this.addNewCustomerModal.show();
	}

	submitNewCustomerForm() {
		let body = {
			main_org_data: {
				org_name: this.newCustomerForm.value.company_name,
				company_id: this.salesOrderForm.value.company_id,
				deleted: 0,
				blacklist: 0
			},
			sub_org_data: {
				sub_org_name: this.newCustomerForm.value.company_name,
				country_id: 101, // India
				state_id: this.newCustomerForm.value.state_id,
				city_id: this.newCustomerForm.value.city_id,
				org_unit: 1, // HO
				payment_term: Number(this.newCustomerForm.value.payment_term),
				data_type: "New",
				sales_acc_holder: this.selectedZone,
				product_type: this.salesOrderForm.value.company_id
			},
			org_cat_data: {
				org_cat_id: 11 // Buyer
			},
			org_contact_person: {
				person_name: this.newCustomerForm.value.person_name
			},
			org_contact_number: {
				contact_no: this.newCustomerForm.value.mobile_no,
				country_code: '91',
				area_code: '0',
				contact_type: 'Mobile',
				default_no: 1,
				sales: 1
			},
			org_contact_email: {
				email_id: this.newCustomerForm.value.email,
				sales: 1
			}
		};
		this.crudServices.addData<any>(MainOrg.addNewCustomer, body).subscribe(res => {
			if (res.code == '100') {
				this.getCustomers();
				this.toasterService.pop(res.message, 'Success', res.data);
				this.addNewCustomerModal.hide();
			}
		});
	}

	goBack() {
		this.salesOrderForm.reset();
		this.summaryModal.hide();
		this.router.navigate(["sales/sales-orders"]);//
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
	sendInAppNotification(deal_details) {
		this.messagingService.sendNotification(deal_details).then((response) => {
			if (response) {
				this.saveNotifications(deal_details['notification'])
			}
			this.messagingService.receiveMessage();
		})
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
		}, (error) => console.error(error));
	}


	getGradeName(grade_id) {
		let grade_id_new = grade_id + '-' + this.summary.import_local_flag;
		let grade = this.gradesList.find(o => o.grade_id_new == grade_id_new);
		return grade ? grade.grade_name : this.summary.grade;
	}

	getCustomerName(sub_org_id) {
		let customer = this.customersList.find(o => o.sub_org_id == sub_org_id);
		return customer.sub_org_name;
	}

	getGodownName(godown_id) {
		let godown = this.godownsList.find(o => o.id == godown_id);
		return godown ? godown.godown_name : 'NA';
	}

	async sendEmail(item, pdfObj) {
		if (item.temp_email.length > 0) {
			// this.generateSoPvc.generateSo(item, this.percent, this.company_bank_details).then(async (pdfObj) => {
			await pdfMake.createPdf(pdfObj).getBase64((data) => {
				if (data) {
					let emailBody = {
						thepdf: data,
						tomail: item.temp_email,
						subject: this.emailSubject,
						bodytext: this.emailBodyTemplete + this.emailFooterTemplete,
						filename: 'Sales_order.pdf',
						company_id: Number(item.company_id)
					}
					this.crudServices.postRequest<any>(Consignments.sendReportMail, emailBody)
						.subscribe((response) => {
							this.toasterService.pop('success', 'SALES ORDER MAIL SEND SUCCESS!', 'SALES ORDER MAIL SEND SUCCESS!')
						});
				}
			});
			// });
		}
	}

	sendWhatsApp(element, path) {
		// let days = (this.company_id == 1) ? 10 : 6;
		let gradeWithRemark =  element.grade_name;
		if(element.company_id == 1) {
			gradeWithRemark = `${gradeWithRemark}. (${element.remark}).`;
		}
		let order_validity = moment(element.expiry_date).format("YYYY-MM-DD");
		let order_id = 'NA';

		if (this.editMode || this.editPayment) {
			order_id = element.id + " (REVISED)";
		}
		else {
			order_id = element.id;
		}

		if(element.is_forward) {
			order_id = `${order_id} - FORWARD`
		}
		//*CLIENT BODY WITHOUT NB RATE INCLUD
		let sendHeadsFotCustomer = [
			// element.id ? element.id : "NA",
			order_id,
			element.customer ? element.customer : 'NA',
			gradeWithRemark ? gradeWithRemark : "NA",
			`${element.quantity ? element.quantity : 'NA'} ${element.unit_type ? element.unit_type : 'NA'}`,
			element.final_rate ? element.final_rate : "NA",
			element.delivery_term ? element.delivery_term : 'NA',
			element.city_name ? element.city_name : "NA",
			element.payment_term_label ? element.payment_term_label : "NA",
			order_validity,
			(element.company_id == 1 || element.company_id == 3) ? 24 : 36
		];

		let official_numbers = [];

		if (element.company_id == 1) {
			official_numbers = this.magangementSPIPLWhatsappNumbers;
		}
		if (element.company_id == 2) {
			official_numbers = this.magangementSSurishaWhatsappNumbers;
		}


		if (element.mobile_office) {
			(element.company_id == 1) ? official_numbers.push(element.mobile_office) : (element.company_id == 2) ? official_numbers.push(element.mobile_office) : null
		}

		//*MANAGEMENT BODY FOR WHATSAPP INCLUDING NB RATE
		
		let sendHeadsForManagement = [
			// element.id ? element.id : "NA",
			order_id,
			element.customer ? element.customer : 'NA',
			gradeWithRemark ? gradeWithRemark : "NA",
			`${element.quantity ? element.quantity : 'NA'} ${element.unit_type ? element.unit_type : 'NA'}`,
			element.final_rate ? element.final_rate : "NA",
			element.delivery_term ? element.delivery_term : 'NA',
			element.city_name ? element.city_name : "NA",
			element.payment_term_label ? element.payment_term_label : "NA",
			order_validity,
			element.nb ? element.nb : "NA",
			(element.company_id == 1 || element.company_id == 3) ? 24 : 36

		];

		let main_obj_for_cust = {
			locale: "en",
			template_name: element.company_id == 3 ? "sales_confirmation_common_surisha" : "sales_confirmation_common",
			attachment: [
				{
					caption: `#${element.id}-${element.customer}`,
					filename: `#${element.id}-${element.customer}.pdf`,
					url: path
				}
			],
			company_id: element.company_id,
		}

		let main_obj_for_Mgt = {
			company_id: element.company_id,
			locale: "en",
			template_name: element.company_id == 3 ? "sales_confirmation_nb_common_surisha" : "sales_confirmation_nb_common",
			attachment: [
				{
					caption: `#${element.id}-${element.customer}`,
					filename: `#${element.id}-${element.customer}.pdf`,
					url: path
				}
			]
		}

		//!CLIENT PAYLOAD
		main_obj_for_cust['numbers'] = [...element.temp_mobile.split(',')];
		main_obj_for_cust['params'] = sendHeadsFotCustomer;

		//!MANAGEMENT PAYLOAD
		main_obj_for_Mgt['numbers'] = [...official_numbers];
		main_obj_for_Mgt['params'] = sendHeadsForManagement;

		let req1 = this.crudServices.postRequest<any>(LocalPurchase.sendSMS, [main_obj_for_Mgt]);
		let req2 = this.crudServices.postRequest<any>(LocalPurchase.sendSMS, [main_obj_for_cust]);

		return forkJoin([req1, req2]).subscribe(whatsappRes => {
			if (whatsappRes) {
				this.toasterService.pop('success', 'WhatsApp  Notification !', 'WhatsApp Notification !')
			}
		})
	}
}
