import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap";
import { CurrencyPipe } from '@angular/common';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import { GenerateSoHighSeasService } from "../../../shared/generate-doc/generate-so-high-seas";
import {
	SalesOrders,
	Consignments,
	PercentageDetails,
	SubOrg,
	PortMaster,
	LiveInventory,
	GradeMaster,
	orgContactPerson,
	MainContact,
	ValueStore,
	GodownMaster,
	CommonApis,
	HighSeasOrders,
	FileUpload,
	SpiplBankMaster
} from '../../../shared/apis-path/apis-path';
import { CommonService, roundAmount, roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from "moment";
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
	selector: 'app-add-high-seas-order',
	templateUrl: './add-high-seas-order.component.html',
	styleUrls: ['./add-high-seas-order.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		CrudServices,
		ToasterService,
		PermissionService,
		CommonService,
		ExportService,
		Calculations,
		CurrencyPipe,
		GenerateSoHighSeasService
	]
})

export class AddHighSeasOrderComponent implements OnInit {

	@ViewChild("summaryModal", { static: false }) public summaryModal: ModalDirective;

	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 10000
	});

	datePickerConfig: any = staticValues.datePickerConfig;
	paymentTypesList: any = staticValues.payment_types_high_seas;

	user: UserDetails;
	company_id: any = null;
	links: string[] = [];
	blList: any = [];
	customersList: any = [];
	portsList: any = [];
	gradesList: any = [];
	brokersList: any = [];
	commissionTypeList: any = [];
	tempEmailList: any = [];
	tempMobileList: any = [];
	suppliers: any = [];
	material_packs: any = [];

	salesOrderForm: FormGroup;
	newEmailForm: FormGroup;
	newMobileForm: FormGroup;
	fileData: FormData = new FormData();

	page_title: any = "Add High Seas Sales Order";
	currency: any = "USD";
	notional_rate: any = 1;
	id: any = null;
	summary: any = null;
	selectedZone: any = null;
	org_payment_term: any = null;
	disableAdvancePayment: boolean = true;
	disableFreightRate: boolean = true;
	disablePaymentTerm: boolean = true;
	disableCommission: boolean = true;
	currency_change_access: boolean = false;
	loadingBtn: boolean = false;
	isLoading: boolean = false;
	editMode: boolean = false;
	company_bank_details: any = null;

	constructor(
		toasterService: ToasterService,
		private route: ActivatedRoute,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private commonService: CommonService,
		private exportService: ExportService,
		private currencyPipe: CurrencyPipe,
		private calculations: Calculations,
		private generateSoHighSeas: GenerateSoHighSeasService
	) {
		this.toasterService = toasterService;
		this.user = this.loginService.getUserDetails();
		this.company_id = this.user.userDet[0].company_id;
		this.links = this.user.links;
		const perms = this.permissionService.getPermission();
		this.route.params.subscribe((params: Params) => {
			if (params["id"] != null) {
				this.id = params["id"];
				this.editMode = true;
				this.page_title = "Edit High Seas Sales Order";
			}
		});
	}

	ngOnInit() {
		this.getCustomers();
		this.getPorts();
		this.getGrades();
		this.getMaterialPackMaster();
		this.getSuppliers();
		this.getSpiplBank();
		this.initForm();
		if (this.editMode) {
			this.getSalesOrder();
		}
	}

	getSpiplBank() {
		this.crudServices.getOne<any>(SpiplBankMaster.getOne, {
			id: 2
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

	initForm() {
		this.salesOrderForm = new FormGroup({
			booking_date: new FormControl(moment().format("YYYY-MM-DD"), Validators.required),
			deal_type: new FormControl(2),
			zone_id: new FormControl(82),
			main_org_id: new FormControl(null, Validators.required),
			sub_org_id: new FormControl(null, Validators.required),
			customer: new FormControl(null),
			port_id: new FormControl(null, Validators.required),
			port: new FormControl(null),
			godown_id: new FormControl(null),
			grade_id: new FormControl(null, Validators.required),
			grade: new FormControl(null),
			deal_rate: new FormControl(null, [Validators.required, Validators.minLength(2)]),
			currency: new FormControl(this.currency),
			quantity: new FormControl(null, Validators.required),
			unit_type: new FormControl(null, Validators.required),
			base_amount: new FormControl(null, Validators.required),
			total_amount: new FormControl(null, Validators.required),
			payment_type: new FormControl(null, Validators.required),
			advance: new FormControl(null),
			payment_term: new FormControl(null),
			ie_code: new FormControl(null, Validators.required),
			inco_term: new FormControl(null, Validators.required),
			supplier_id: new FormControl(null, Validators.required),
			supplier: new FormControl(null),
			packing: new FormControl(null, Validators.required),
			remark: new FormControl(null),
			temp_email: new FormControl(null),
			temp_mobile: new FormControl(null)
		});

		this.newEmailForm = new FormGroup({
			email: new FormControl(null, Validators.required),
			sub_org_id: new FormControl(null, Validators.required),
			contact_person_id: new FormControl(null, Validators.required),
		});

		this.newMobileForm = new FormGroup({
			mobile_no: new FormControl(null, Validators.required),
			sub_org_id: new FormControl(null, Validators.required),
			contact_person_id: new FormControl(null, Validators.required),
		});
	}

	getSalesOrder() {
		this.crudServices.getOne<any>(SalesOrders.getOne, {
			id: this.id
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.id = res.data[0].id;
					this.salesOrderForm.patchValue({
						booking_date: new Date(res.data[0].booking_date),
						main_org_id: res.data[0].main_org_id,
						sub_org_id: res.data[0].sub_org_id,
						zone_id: res.data[0].zone_id,
						zone: res.data[0].zone,
						godowm_id: res.data[0].godowm_id,
						port_id: res.data[0].port_id,
						deal_type: res.data[0].deal_type,
						grade_id: res.data[0].grade_id,
						bill_rate: res.data[0].bill_rate,
						deal_rate: res.data[0].deal_rate,
						final_rate: res.data[0].final_rate,
						currency: res.data[0].currency,
						quantity: res.data[0].quantity,
						unit_type: res.data[0].unit_type,
						base_amount: res.data[0].base_amount,
						total_amount: res.data[0].total_amount,
						payment_type: res.data[0].payment_type,
						advance: res.data[0].advance,
						payment_term: res.data[0].payment_term,
						ie_code: res.data[0].ie_code,
						inco_term: res.data[0].inco_term,
						supplier_id: res.data[0].supplier_id,
						packing: res.data[0].packing,
						remark: res.data[0].remark,
						temp_email: res.data[0].temp_email.split(','),
						temp_mobile: res.data[0].temp_mobile.split(',')
					});
				}
			}
		});
	}

	// getBlList() {
	// 	this.crudServices.getOne<any>(HighSeasOrders.getBlList, {
	// 		bl_no: null
	// 	}).subscribe(res => {
	// 		if (res.code == '100') {
	// 			if (res.data.length > 0) {
	// 				this.blList = res.data;
	// 			}
	// 		}
	// 	});
	// }

	getCustomers() {
		let body = {
			product_type: this.company_id,
			category_id: 11,
			org_unit: 1,
			blacklist: 0
		}
		if (this.selectedZone) {
			body['sales_acc_holder'] = this.selectedZone
		}
		this.crudServices.getOne<any>(SubOrg.getGroupCustomers, body).subscribe(res => {
			if (res.length > 0) {
				this.customersList = res.map(element => {
					element.customer = element.customer + ' (' + element.location_vilage + ')';
					return element;
				});
			}
		});
	}

	getPorts() {
		this.crudServices.getAll<any>(GodownMaster.getPorts).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.portsList = res.data;
				}
			}
		});
	}

	getGrades() {
		this.crudServices.getAll(GradeMaster.getAll).subscribe((res: any) => {
			if (res.length > 0) {
				this.gradesList = res;
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

	getSuppliers() {
		this.crudServices.getAll<any>(SubOrg.getSuppliers).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						element.supplier_name = element.sub_org_name + ' (' + element.location_vilage + ')';
					});
					this.suppliers = res.data;
				}
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

	onSubmit() {
		this.summary = this.salesOrderForm.value;
		if (this.summary.payment_type == 1 || this.summary.payment_type == 5) {
			this.summary.payment_term_label = this.summary.payment_term + " Days";
		} else if (this.summary.payment_type == 2) {
			this.summary.payment_term_label = "Advance by RTGS";
		} else if (this.summary.payment_type == 4) {
			this.summary.payment_term_label = "Advance by LC";
		} else if (this.summary.payment_type == 3) {
			this.summary.payment_term_label = this.summary.payment_term + " Days | " + this.summary.advance + "% Advance";
		} else if (this.summary.payment_type == 6) {
			this.summary.payment_term_label = "TT";
		}
		this.summary.inco_term = this.summary.inco_term.toUpperCase();
		this.summaryModal.show();
	}

	confirmSummary() {
		this.loadingBtn = true;
		let data = {
			booking_date: this.summary.booking_date,
			main_org_id: this.summary.main_org_id,
			sub_org_id: this.summary.sub_org_id,
			zone_id: this.summary.zone_id,
			port_id: this.summary.port_id,
			godown_id: this.summary.godown_id,
			grade_id: this.summary.grade_id,
			currency: this.currency,
			bill_rate: Number(this.summary.deal_rate),
			deal_rate: Number(this.summary.deal_rate),
			final_rate: Number(this.summary.deal_rate),
			quantity: Number(this.summary.quantity),
			unit_type: this.summary.unit_type,
			base_amount: Number(this.summary.base_amount),
			total_amount: Number(this.summary.base_amount),
			credit_note: 0,
			delivery_term_id: 2,
			freight_rate: 0,
			nb: 0,
			payment_type: this.summary.payment_type,
			payment_term: this.summary.payment_term,
			advance: this.summary.advance,
			inco_term: this.summary.inco_term.toUpperCase(),
			supplier_id: Number(this.summary.supplier_id),
			packing: this.summary.packing,
			ie_code: this.summary.ie_code,
			remark: this.summary.remark,
			so_copy: null,
			deal_type: 2,
			temp_email: this.summary.temp_email.toString(),
			temp_mobile: this.summary.temp_mobile.toString(),
			company_id: this.company_id,
			import_local_flag: 1
		};
		let body = {
			data: data
		};
		if (this.editMode) {
			body['id'] = this.id;
			this.crudServices.updateData(SalesOrders.update, body).subscribe(res => {
				this.loadingBtn = false;
				if (res['code'] == '100') {
					this.summary = null;
					this.toasterService.pop('success', 'Success', res['data']);
					this.generateSalesOrder(this.id);
				}
			});
		} else {
			this.crudServices.addData(SalesOrders.add, body).subscribe(res => {
				this.loadingBtn = false;
				if (res['code'] == '100') {
					this.summary = null;
					this.summaryModal.hide();
					this.toasterService.pop('success', 'Success', 'Order Added Successfully');
					this.generateSalesOrder(res['data']);
				}
			});
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
							}
						});
					}
				}
			});
		}
	}

	onChangeValue(e, type) {
		if (type == 'customer') {
			this.tempEmailList = [];
			this.tempMobileList = [];
			this.salesOrderForm.patchValue({
				main_org_id: null,
				sub_org_id: null,
				customer: null,
				payment_type: null,
				payment_term: null,
				advance: null,
				virtual_acc_no: null,
				tds: null,
				tcs: null,
				extra_suspense: null,
				extra_import: null,
				extra_local: null,
				ie_code: null
			});
			if (e != null && e != undefined) {
				this.salesOrderForm.patchValue({
					main_org_id: e.org_id,
					sub_org_id: e.sub_org_id,
					customer: e.sub_org_name,
					ie_code: e.iec,
					virtual_acc_no: e.virtual_acc_no,
					tds: (e.org_tds_tcs != null && e.org_tds_tcs.length > 0) ? e.org_tds_tcs[0].tds : 0,
					tcs: (e.org_tds_tcs != null && e.org_tds_tcs.length > 0) ? e.org_tds_tcs[0].tcs : 0,
					extra_suspense: Number(e.extra_suspense),
					extra_import: Number(e.extra_import),
					extra_local: Number(e.extra_local)
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
				if (e.iec == null || e.iec == undefined || e.iec == 'null') {
					this.toasterService.pop('error', 'Alert', 'Customer IE Code Not Updated');
				}
			}
		}
		if (type == 'grade') {
			this.commissionTypeList = [];
			this.salesOrderForm.patchValue({
				grade: null,
				unit_type: null
			});
			if (e != null && e != undefined) {
				this.salesOrderForm.patchValue({
					grade: e.grade_name,
					unit_type: e.unit_mt_drum_master.unit_type
				});
			}
		}
		if (type == 'payment_type') {
			this.salesOrderForm.get('payment_term').clearValidators();
			this.salesOrderForm.get('advance').clearValidators();
			this.disableAdvancePayment = true;
			this.disablePaymentTerm = true;
			if (e != null && e != undefined) {
				if (e == 1) {
					this.salesOrderForm.patchValue({
						payment_term: this.org_payment_term,
						advance: 0
					});
					this.salesOrderForm.get('payment_term').setValidators([Validators.required, Validators.max(this.org_payment_term)]);
					this.salesOrderForm.get('payment_term').updateValueAndValidity();
					this.disableAdvancePayment = true;
					this.disablePaymentTerm = false;
				} else if (e == 5) {
					this.salesOrderForm.patchValue({
						payment_term: 0,
						advance: 0
					});
					this.disableAdvancePayment = true;
					this.disablePaymentTerm = true;
				} else if (e == 2 || e == 4 || e == 6) {
					this.salesOrderForm.get('payment_term').updateValueAndValidity();
					this.salesOrderForm.get('advance').updateValueAndValidity();
					this.salesOrderForm.patchValue({
						payment_term: 0,
						advance: 100
					});
					this.disableAdvancePayment = true;
					this.disablePaymentTerm = true;
				} else if (e == 3) {
					this.salesOrderForm.get('payment_term').setValidators([Validators.required, Validators.max(this.org_payment_term)]);
					this.salesOrderForm.get('advance').setValidators([Validators.required]);
					this.salesOrderForm.get('payment_term').updateValueAndValidity();
					this.salesOrderForm.get('advance').updateValueAndValidity();
					this.salesOrderForm.patchValue({
						payment_term: this.org_payment_term,
						advance: 50
					});
					this.disableAdvancePayment = false;
					this.disablePaymentTerm = false;
				}
			}
		}
		if (type == 'deal_rate') {
			this.salesOrderForm.patchValue({
				base_amount: null,
				total_amount: null
			});
			if (e != null && e != undefined) {
				let base_amount = this.calculations.getBaseAmount({
					rate: e,
					quantity: this.salesOrderForm.value.quantity
				});
				this.salesOrderForm.patchValue({
					base_amount: base_amount,
					total_amount: base_amount
				});
			}
		}
		if (type == 'quantity') {
			this.salesOrderForm.patchValue({
				base_amount: null
			});
			if (e != null && e != undefined) {
				let base_amount = this.calculations.getBaseAmount({
					rate: Number(this.salesOrderForm.value.deal_rate),
					quantity: e
				});
				this.salesOrderForm.patchValue({
					base_amount: base_amount,
					total_amount: base_amount
				});
			}
		}
		if (type == 'port') {
			this.salesOrderForm.patchValue({
				port: null
			});
			if (e != null && e != undefined) {
				this.salesOrderForm.patchValue({
					port: e.port_name
				});
			}
		}
		if (type == 'supplier') {
			this.salesOrderForm.patchValue({
				supplier: null
			});
			if (e != null && e != undefined) {
				this.salesOrderForm.patchValue({
					supplier: e.sub_org_name
				});
			}
		}
	}

	generateSalesOrder(con_id) {
		this.crudServices.getOne<any>(HighSeasOrders.getHighSeasOrders, {
			id: con_id
		}).subscribe(res_data => {
			if (res_data.code == '100') {
				if (res_data.data.length > 0) {
					this.generateSoHighSeas.generateSo(res_data.data[0], this.company_bank_details).then(async (pdfObj) => {
						let pdfOBjFromData = pdfObj;
						await pdfMake.createPdf(pdfOBjFromData).getBlob(pdf_file => {
							if (pdf_file) {
								this.fileData.append('sales_order_pdf', pdf_file, 'so.pdf')
								this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res => {
									let path = res.uploads.sales_order_pdf[0].location;
									let body = {
										id: res_data.data[0].id,
										type: 'so_copy',
										sales_order_data: res_data.data[0],
										data: {
											so_copy: path
										}
									};
									this.crudServices.updateData(HighSeasOrders.update, body).subscribe(result => {
										this.goBack();
									});
								});
							}
						});
					});


				}
			}
		});
	}

	goBack() {
		this.salesOrderForm.reset();
		this.summaryModal.hide();
		this.router.navigate(["sales/high-seas-orders"]);
	}
}
