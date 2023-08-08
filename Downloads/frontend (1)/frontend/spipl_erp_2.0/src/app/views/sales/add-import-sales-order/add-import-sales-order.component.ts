import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import { GenerateSoSurishaService } from '../../../shared/generate-doc/generate-so-surisha';
import {
	dealOffer,
	MainOrg,
	SalesOrders,
	ImportSales,
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

@Component({
	selector: 'app-add-import-sales-order',
	templateUrl: './add-import-sales-order.component.html',
	styleUrls: ['./add-import-sales-order.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		CrudServices,
		ToasterService,
		PermissionService,
		CommonService,
		ExportService,
		Calculations,
		CurrencyPipe,
		AmountToWordPipe,
		GenerateSoSurishaService
	]
})

export class AddImportSalesOrderComponent implements OnInit {

	@ViewChild("addNewCustomerModal", { static: false }) public addNewCustomerModal: ModalDirective;
	@ViewChild("summaryModal", { static: false }) public summaryModal: ModalDirective;

	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 10000
	});

	datePickerConfig: any = staticValues.datePickerConfig;
	paymentTypesList: any = staticValues.payment_types_import_sales;
	deliveryTermsList: any = staticValues.delivery_terms;
	currenciesList: any = staticValues.currencies;
	companyList: any = staticValues.companies;
	lcDaysList: any = staticValues.lc_days_list;

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
	material_packs: any = [];

	salesOrderForm: FormGroup;
	newEmailForm: FormGroup;
	newMobileForm: FormGroup;
	newCustomerForm: FormGroup;

	page_title: any = "Add Import Sales Order";
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
	loadingBtn: boolean = false;
	isLoading: boolean = false;
	editMode: boolean = false;
	enableCompany: any = false;
	showLcDays: boolean = false;
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
	magangementSurishaWhatsappNumbersSales_Company_ID_3: any = staticValues.magangementSurishaWhatsappNumbersSales_Company_ID_3;
	magangementSurishaEmailSales_Company_ID_3: any = staticValues.magangementSurishaEmailSales_Company_ID_3;
	magangementEmails: any = [];
	offerList: any = [];

	supplierList: any = null;

	constructor(
		toasterService: ToasterService,
		private route: ActivatedRoute,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private calculations: Calculations,
		private currencyPipe: CurrencyPipe,
		private amountToWord: AmountToWordPipe,
		private messagingService: MessagingService,
		private generateSoSurisha: GenerateSoSurishaService,
		private commonService: CommonService
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
		if (this.role_id == 1 && this.role_id == 2) {
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
				this.id = params["id"];
				this.editMode = true;
				this.page_title = "Edit Import Sales Order";
			}
		});
	}

	ngOnInit() {
		this.getSpiplBank();
		this.getPercentValues();
		this.getBrokers();
		if (!this.editMode) {
			this.getCustomers();
		}
		this.getZones();
		this.getGodowns();
		this.getOffers();
		this.getMaterialPackMaster();
		this.getEmailTemplate();
		this.initForm();
		this.getSupplier();
		if (this.editMode) {
			this.getSalesOrder();
		}
		this.getCities();
	}

	getOffers() {
		let condition = {
			from_date: new Date(moment().format("YYYY-MM-DD"))
		}

		this.crudServices.getOne<any>(dealOffer.getAll, condition).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.offerList = res.data;
				}
			}
		});
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
			quantity: new FormControl(null, [Validators.required, Validators.min(1)]),
			unit_type: new FormControl(null, Validators.required),
			base_amount: new FormControl(null, Validators.required),
			delivery_term_id: new FormControl(null, Validators.required),
			delivery_term: new FormControl(null),
			freight_rate: new FormControl(null, Validators.required),
			nb: new FormControl(null, Validators.required),
			payment_type: new FormControl(2, Validators.required),
			advance_payment_term: new FormControl(20, Validators.required),
			balance_payment_term: new FormControl(80, Validators.required),
			lc_days: new FormControl(null),
			lc_interest: new FormControl(null),
			packing: new FormControl(null, Validators.required),
			shipment_from: new FormControl(null, Validators.required),
			shipment_to: new FormControl(null, Validators.required),
			remark: new FormControl(null),
			temp_email: new FormControl(null),
			temp_mobile: new FormControl(null),
			virtual_acc_no: new FormControl(null),
			tds: new FormControl(null),
			tcs: new FormControl(null),
			extra_suspense: new FormControl(null),
			extra_import: new FormControl(null),
			extra_local: new FormControl(null),
			company_id: new FormControl(3),
			import_local_flag: new FormControl(null, Validators.required),
			offer_id: new FormControl(null),
			supplier_id: new FormControl(null),
			shipment_month: new FormControl(null),
		});

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

					if (res.data[0].company_id == 2) {
						this.edit_pe_pp = true;
					} else {
						this.edit_pe_pp = false;
					}

					this.id = res.data[0].id;

					this.salesOrderForm.patchValue({
						booking_date: new Date(res.data[0].booking_date),
						main_org_id: res.data[0].main_org_id,
						sub_org_id: res.data[0].sub_org_id,
						customer: res.data[0].customer,
						zone_id: res.data[0].zone_id,
						zone: res.data[0].zone,
						godown_id: res.data[0].godown_id,
						deal_type: res.data[0].deal_type
					});

					this.onChangeValue({
						id: res.data[0].godown_id
					}, 'godown');

					this.salesOrderForm.patchValue({
						godown: res.data[0].godown_name,
						grade_id: res.data[0].grade_id,
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
						advance_payment_term: res.data[0].advance_payment_term,
						balance_payment_term: res.data[0].balance_payment_term,
						lc_days: res.data[0].lc_days,
						lc_interest: res.data[0].lc_interest,
						packing: res.data[0].packing,
						shipment_from: res.data[0].shipment_from,
						shipment_to: res.data[0].shipment_to,
						remark: res.data[0].remark,
						temp_email: res.data[0].temp_email.split(','),
						temp_mobile: res.data[0].temp_mobile.split(','),
						import_local_flag: res.data[0].import_local_flag,
						supplier_id: res.data[0].supplier_id,
						shipment_month: res.data[0].shipment_month
					});

					if (res.data[0].payment_type == 4) {
						this.showLcDays = true;
					}
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
		this.crudServices.getOne<any>(SpiplBankMaster.getOne, {
			// id: 33 //SURISHA INDUSIND ID
			id: 28 //SURISHA FEDERAL ID
		}).subscribe(res => {
			if (res.length > 0) {
				this.company_bank_details = {
					account_no: res[0].account_no,
					bank_name: res[0].bank_name,
					branch_name: res[0].branch_name,
					ifsc_code: res[0].ifsc_code
				};
			}
		});
	}

	getCustomers() {
		let body = {
			category_id: 11,
			org_unit: 1,
			blacklist: 0,
			product_type: 3
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
			}
		});
	}


	getSupplier() {
		this.crudServices.getAll<any>(SubOrg.getSuppliers).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.supplierList = res.data;
				}
			}
		});
	}

	getZones() {
		this.crudServices.getOne<any>(StaffMemberMaster.getMarketingPersonsNew, {
			company_id: 3   // this.company_id
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

	getMaterialPackMaster() {
		this.crudServices.getAll<any>(CommonApis.getAllMaterialPack).subscribe(res => {
			this.isLoading = false;
			if (res.length > 0) {
				this.material_packs = res;
			}
		});
	}

	getGodowns() {
		this.crudServices.getAll<any>(GodownMaster.getAllHeadGodown).subscribe(res => {
			if (res.length > 0) {
				this.godownsList = res;
			}
		});
	}

	getGrades(godown_id, zone_id) {
		let condition = {
			main_godown_id: godown_id,
			zone_id: zone_id,
			import_local_flag: 1,
			company_id: (this.editMode) ? this.selected_deal.company_id : this.company_id
		}
		// this.crudServices.getOne(LiveInventory.getGodownWiseGradeImportLocal, condition).subscribe((res: any) => {
		this.crudServices.getAll(GradeMaster.getAll).subscribe((res: any) => {
			if (res.length > 0) {
				res.forEach(element => {
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
				this.gradesList = res;
			} else {
				this.toasterService.pop('error', 'Alert', 'No Grades Found');
			}
		});
	}

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
			template_name: 'Surisha SO Release Mail'
		}).subscribe(response => {
			if (response.length > 0) {
				this.emailBodyTemplete = response[0].custom_html;
				this.emailSubject = response[0].subject;
				this.emailFrom = response[0].from_name;

			}
		});
		await this.crudServices.getOne<any>(EmailTemplateMaster.getOne, {
			template_name: 'Surisha Footer'
		}).subscribe(response_foot => {
			if (response_foot.length > 0) {
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

	onSubmit() {
		if (this.editMode) {
			this.getFCMWithNotification('SALES_CONSIGNMENT_EDIT')
		} else {
			this.getFCMWithNotification('ADD_NEW_SALES_DEAL')
		}

		let discount_rate = 0;
		let credit_note = 0;
		if (Number(this.salesOrderForm.value.bill_rate) > Number(this.salesOrderForm.value.deal_rate)) {
			discount_rate = Number(this.salesOrderForm.value.bill_rate) - Number(this.salesOrderForm.value.deal_rate);
			credit_note = Number(this.salesOrderForm.value.quantity) * discount_rate;
		}
		let balance_payment_term = 100 - Number(this.salesOrderForm.value.advance_payment_term);
		this.salesOrderForm.patchValue({
			final_rate: this.getFinalRate(),
			discount_rate: discount_rate,
			credit_note: credit_note,
			balance_payment_term: balance_payment_term
		});

		this.summary = this.salesOrderForm.value;

		let obj_gst = this.percent.find(o => o.percent_type === 'gst');
		let base_amount = roundAmount(Number(this.summary.final_rate) * Number(this.summary.quantity));
		let total_amount = this.calculations.getTotalAmountWithTax(base_amount, this.summary.tds, this.summary.tcs, obj_gst.percent_value, this.company_id);
		this.summary.total_amount = roundAmount(total_amount);

		if (Number(this.summary.bill_rate) == 0) {
			this.summary.bill_rate = this.summary.deal_rate;
		}

		if (this.summary.payment_type == 2) {
			this.summary.payment_term_label = "Advance by RTGS";
		} else if (this.summary.payment_type == 4) {
			this.summary.payment_term_label = "LC";
		}

		this.summary.discount_rate = 0;
		this.summary.credit_note = 0;

		if (Number(this.summary.bill_rate) > Number(this.summary.deal_rate)) {
			this.summary.discount_rate = Number(this.summary.bill_rate) - Number(this.summary.deal_rate);
			this.summary.credit_note = Number(this.summary.quantity) * discount_rate;
		}

		// let org_data = this.customersList.find(x => x.sub_org_id == this.summary.sub_org_id);

		// // this.summary.extra_import = org_data.extra_import;
		// // this.summary.extra_local = org_data.extra_local;
		// // this.summary.extra_suspense = org_data.extra_suspense;

		this.summaryModal.show();
	}

	confirmSummary() {
		this.loadingBtn = true;

		if (this.editMode) {
			let amount = this.selected_deal.balance_amount;
			let extra_column = this.getSubOrgExtraColumnName(this.selected_deal.import_local_flag);
			this.crudServices.updateData(SalesOrders.reverseExtraAmount, {
				sub_org_id: this.summary.sub_org_id,
				extra_column: extra_column,
				received_amount: amount
			}).subscribe(result => {
				this.getSubOrg();
			});
		} else {
			this.calculateReceivedPayment(this.summary);
		}
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

	submitData() {
		let data = {
			booking_date: this.summary.booking_date,
			main_org_id: this.summary.main_org_id,
			sub_org_id: this.summary.sub_org_id,
			zone_id: this.summary.zone_id,
			godown_id: this.summary.godown_id,
			grade_id: this.summary.grade_id,
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
			advance_payment_term: this.summary.advance_payment_term,
			balance_payment_term: this.summary.balance_payment_term,
			lc_days: this.summary.lc_days,
			lc_interest: this.summary.lc_interest,
			packing: this.summary.packing,
			shipment_from: this.summary.shipment_from,
			shipment_to: this.summary.shipment_to,
			virtual_acc_no: this.summary.virtual_acc_no,
			remark: this.summary.remark,
			deal_type: 3,
			temp_email: this.summary.temp_email.toString(),
			temp_mobile: this.summary.temp_mobile.toString(),
			company_id: 3,
			import_local_flag: this.summary.import_local_flag,
			so_link_bal_qty: Number(this.summary.quantity),
			offer_id: this.summary.offer_id,
			supplier_id: this.summary.supplier_id,
			shipment_month: this.summary.shipment_month

		};

		if (this.editMode) {
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
			extra_column_name: this.summary.extra_column_name
		};


		if (this.editMode) {
			body['id'] = this.id;
			this.crudServices.updateData(ImportSales.update, body).subscribe(res => {
				this.loadingBtn = false;
				if (res['code'] == '100') {
					this.summaryModal.hide();
					this.summary = null;
					this.toasterService.pop('success', 'Success', res['data']);
					if (notification_body != null) {
						this.sendInAppNotification(notification_body);
					}
					this.generateSalesOrder(this.id);
				}
			});
		} else {
			this.crudServices.addData(ImportSales.add, body).subscribe(result => {
				this.loadingBtn = false;
				if (result['code'] == '100') {
					this.summaryModal.hide();
					this.summary = null;
					if (notification_body != null) {
						this.sendInAppNotification(notification_body);
					}
					this.generateSalesOrder(result['data']);
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
					this.generateSoSurisha.generateSo(res_data.data[0], this.percent, this.company_bank_details).then(async (pdfObj) => {
						let pdfOBjFromData = pdfObj;
						await pdfMake.createPdf(pdfOBjFromData).getBlob(data => {
							if (data) {
								this.fileData.append('sales_order_pdf', data, 'so.pdf')
								this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res => {
									let path = res.uploads.sales_order_pdf[0].location;
									this.crudServices.updateData(ImportSales.update, {
										id: res_data.data[0].id,
										data: {
											so_copy: path
										}
									}).subscribe(result => {
										if (result) {
											this.toasterService.pop('success', 'Success', 'Deal Added Successfully');
											res_data.data[0].so_copy = path;
											this.sendEmail(res_data.data[0]);
											this.sendWhatsApp(res_data.data[0], path);
											this.summary = null;
											this.goBack();
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

	onChangeValue(e, type) {
		this.zone_fcm = [];
		if (type == 'company') {
			this.salesOrderForm.reset();
			this.salesOrderForm.patchValue({
				advance_payment_term: 15
			})
			if (e != null && e != undefined) {
				this.company_id = e.id;
				this.getSpiplBank();
				this.getCustomers();
				this.getZones();
				this.initForm();
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
				// payment_type: null,
				virtual_acc_no: null,
				tds: null,
				tcs: null,
				extra_suspense: null,
				extra_import: null,
				extra_local: null
			});
			if (e != null && e != undefined) {
				if (e.salesAccHolder != null && e.salesAccHolder.fcm_web_token != null) {
					this.zone_fcm.push(e.salesAccHolder.fcm_web_token)
				}
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
						extra_local: Number(e.extra_local)
					});
					// this.org_payment_term = e.payment_term;
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
				} else {
					this.toasterService.pop('error', 'Alert', 'Zone is not assigned');
				}
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
				if (!this.editMode) {
					if (this.company_id == 2) {
						this.crudServices.getOne<any>(GradeMaster.getGradePrice, {
							grade_id: e.grade_id,
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
						this.crudServices.getOne<any>(GradeMaster.getGradePrice, {
							grade_id: e.grade_id,
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
			if (e == 4) {
				this.salesOrderForm.patchValue({
					lc_interest: 8.0
				});
				this.showLcDays = true;
				this.salesOrderForm.get('lc_days').setValidators([Validators.required]);
				this.salesOrderForm.get('lc_days').updateValueAndValidity();
			} else {
				this.salesOrderForm.patchValue({
					lc_interest: 0
				});
				this.showLcDays = false;
				this.salesOrderForm.controls['lc_days'].clearValidators();
				this.salesOrderForm.controls['lc_days'].updateValueAndValidity();
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
	}

	setGradeDetails(e, rate) {
		let min_rate = Number(rate) - Number(e.lowest_cap);
		let unit_type = e.unit_type;
		let import_local_flag = 1;
		let nb = Number(this.salesOrderForm.value.deal_rate) - Number(this.salesOrderForm.value.freight_rate);

		let final_deal_rate = 0;

		if (this.editMode) {
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

		if (this.editMode && this.selected_deal.company_id == 2) {
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

		if (this.company_id == 1) {
			this.salesOrderForm.get('deal_rate').setValidators([Validators.required, Validators.minLength(4), Validators.min(min_rate)]);
			this.salesOrderForm.get('deal_rate').updateValueAndValidity();
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
		this.router.navigate(["sales/import-sales"]);
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
		let grade = this.gradesList.find(o => o.grade_id === grade_id);
		return grade.grade_name;
	}

	getCustomerName(sub_org_id) {
		let customer = this.customersList.find(o => o.sub_org_id === sub_org_id);
		return customer.sub_org_name;
	}

	getGodownName(godown_id) {
		let godown = this.godownsList.find(o => o.id === godown_id);
		return godown.godown_name;
	}

	sendEmail(item) {
		if (item.temp_email.length > 0) {
			this.generateSoSurisha.generateSo(item, this.percent, this.company_bank_details).then(async (pdfObj) => {
				await pdfMake.createPdf(pdfObj).getBase64((data) => {
					if (data) {

						const Qty = /{QTY}/gi;
						const GRADE = /{GRADE}/gi;
						const SO_NO = /{SO_NO}/gi;
						this.emailBodyTemplete = this.emailBodyTemplete.replace(Qty, item.quantity + ' ' + item.unit_type);
						this.emailBodyTemplete = this.emailBodyTemplete.replace(GRADE, item.grade_name);
						this.emailBodyTemplete = this.emailBodyTemplete.replace(SO_NO, item.so_no);
						this.emailSubject = this.emailSubject.replace(SO_NO, item.so_no);

						let emails = this.magangementSurishaEmailSales_Company_ID_3



						// if (item.email_office && item.email_office != null) {
						// 	emails.push(item.email_office)
						// }
						// if(item.temp_email != null) {
						// 	let mails = item.temp_email.split(',')
						// 	for(let mail of mails) {
						// 		emails.push(mail)
						// 	}

						// }

						let emailBody = {
							thepdf: data,
							tomail: emails,
							subject: this.emailSubject,
							bodytext: this.emailBodyTemplete + this.emailFooterTemplete,
							filename: item.so_no + '.pdf',
							company_id: item.company_id
						}
						this.crudServices.postRequest<any>(Consignments.sendSurishaMail, emailBody).subscribe((response) => {
							this.toasterService.pop('success', 'SALES ORDER MAIL SEND SUCCESS!', 'SALES ORDER MAIL SEND SUCCESS!')
						});
					}
				})
			})
		}
	}

	sendWhatsApp(element, path) {
		let days = (element.company_id == 1 || element.company_id == 3) ? 10 : 6;

		let order_validity = moment(element.booking_date).add(Number(days), 'd').format("YYYY-MM-DD");

		//*CLIENT BODY WITHOUT NB RATE INCLUD
		let sendHeadsFotCustomer = [
			element.id ? element.id : "NA",
			element.customer ? element.customer : 'NA',
			element.grade_name ? element.grade_name : "NA",
			`${element.quantity ? element.quantity : 'NA'} ${element.unit_type ? element.unit_type : 'NA'}`,
			element.final_rate ? element.final_rate : "NA",
			element.delivery_term ? element.delivery_term : 'NA',
			element.city_name ? element.city_name : "NA",
			element.payment_term_label ? element.payment_term_label : "NA",
			order_validity,
			(element.company_id == 1 || element.company_id == 3) ? 24 : 36
		];

		let official_numbers = null;

		if (element.company_id == 1) {
			official_numbers = this.magangementSPIPLWhatsappNumbers;
		}
		if (element.company_id == 2) {
			official_numbers = this.magangementSSurishaWhatsappNumbers;
		}
		if (element.company_id == 3) {
			official_numbers = this.magangementSurishaWhatsappNumbersSales_Company_ID_3;
		}


		if (element.mobile_office) {
			official_numbers.push(element.mobile_office)
		}

		//*MANAGEMENT BODY FOR WHATSAPP INCLUDING NB RATE
		let sendHeadsForManagement = [
			element.id ? element.id : "NA",
			element.customer ? element.customer : 'NA',
			element.grade_name ? element.grade_name : "NA",
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
			locale: "en",
			company_id: element.company_id,
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
