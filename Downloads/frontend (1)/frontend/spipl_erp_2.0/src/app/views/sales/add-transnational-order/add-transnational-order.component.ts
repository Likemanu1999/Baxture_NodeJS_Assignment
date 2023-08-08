import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap";
import { CurrencyPipe } from '@angular/common';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import {
	SalesOrders,
	Consignments,
	SubOrg,

	GradeMaster,
	orgContactPerson,
	MainContact,
	ValueStore,
	GodownMaster,
	CommonApis,
	TransnationalSales,
	FileUpload,
	PaymentTermMaster
} from '../../../shared/apis-path/apis-path';
import { roundAmount, roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from "moment";
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
	selector: 'app-add-transnational-order',
	templateUrl: './add-transnational-order.component.html',
	styleUrls: ['./add-transnational-order.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService, Calculations, CurrencyPipe],
})
export class AddTransnationalOrderComponent implements OnInit {

	@ViewChild("summaryModal", { static: false }) public summaryModal: ModalDirective;

	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 10000
	});

	datePickerConfig: any = staticValues.datePickerConfig;
	paymentTypesList: any = staticValues.payment_types_transnational;

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

	page_title: any = "Add Transnational Sales Order";
	currency = [];
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
	incoTerms: any;
	paymentTerm: any;

	constructor(
		toasterService: ToasterService,
		private route: ActivatedRoute,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private currencyPipe: CurrencyPipe,
		private calculations: Calculations
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
				this.page_title = "Edit Transactional Sales Order";
			}
		});
	}

	ngOnInit() {
		this.getCustomers();
		this.getPorts();
		this.getGrades();
		this.getMaterialPackMaster();
		this.getIncoTerms();
		this.getCurrency();

		this.getPaymentTerm();
		this.initForm();
		if (this.editMode) {
			this.getSalesOrder();
		}
	}

	initForm() {
		this.salesOrderForm = new FormGroup({
			booking_date: new FormControl(moment().format("YYYY-MM-DD")),
			sub_org_id: new FormControl(null, Validators.required),
			ie_code: new FormControl(null),
			port_id: new FormControl(null, Validators.required),
			grade_id: new FormControl(null, Validators.required),
			rate: new FormControl(null, Validators.required),
			base_amount: new FormControl(null),
			currency: new FormControl('USD'),
			quantity: new FormControl(null, Validators.required),
			unit_type: new FormControl('MT'),
			inco_term: new FormControl(null),
			payment_type: new FormControl(null, Validators.required),
			payment_term: new FormControl(null, Validators.required),
			packing: new FormControl(null),
			remark: new FormControl(null),

		});

		this.newEmailForm = new FormGroup({
			email: new FormControl(null),
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
		this.crudServices.getOne<any>(TransnationalSales.getOne, {
			id: this.id
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.id = res.data[0].id;
					let pay_term = res.data[0].transnational_payments.map(item => item.payment_term_id);
					this.salesOrderForm.patchValue({
						booking_date: new Date(res.data[0].booking_date),
						sub_org_id: res.data[0].sub_org_id,
						port_id: res.data[0].port_id,
						grade_id: res.data[0].grade_id,
						rate: res.data[0].rate,
						currency: res.data[0].currency,
						quantity: res.data[0].quantity,
						unit_type: res.data[0].unit_type,
						base_amount: res.data[0].quantity * res.data[0].rate,
						payment_type: res.data[0].payment_type,
						payment_term: pay_term,
						ie_code: res.data[0].sub_org_master ? res.data[0].sub_org_master.iec : '',
						inco_term: res.data[0].inco_term,
						packing: res.data[0].packing,
						remark: res.data[0].remark,
						// temp_email: res.data[0].temp_email.split(','),
						// temp_mobile: res.data[0].temp_mobile.split(',')
					});
				}
			}
		});
	}

	// getBlList() {
	// 	this.crudServices.getOne<any>(TransnationalSales.getBlList, {
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
			category_id: 131,
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

	getIncoTerms() {
		this.crudServices.getAll<any>(CommonApis.getPiInsurance).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.incoTerms = response;
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

	getPaymentTerm() {
		this.crudServices.getAll<any>(PaymentTermMaster.getAll).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.paymentTerm = response;
			}
		});
	}

	getCurrency() {
		this.crudServices.getAll<any>(CommonApis.getAllCurrency).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.currency = response;
			}
		});
	}


	onSubmit() {


		this.summary = this.salesOrderForm.value;
		if (this.summary.payment_type == 5) {
			this.summary.pay_type = this.summary.payment_term + " Days";
		} else if (this.summary.payment_type == 4) {
			this.summary.pay_type = "Advance by LC";
		} else if (this.summary.payment_type == 6) {
			this.summary.pay_type = "TT";
		} else if (this.summary.payment_type == 7) {
			this.summary.pay_type = "Partial TT";
		}
		this.summary.inco_term = this.summary.inco_term.toUpperCase();
		this.summaryModal.show();
	}

	confirmSummary() {
		this.loadingBtn = true;
		let data = {
			booking_date: this.summary.booking_date,
			sub_org_id: this.summary.sub_org_id,
			port_id: this.summary.port_id,
			grade_id: this.summary.grade_id,
			currency: this.summary.currency,
			rate: Number(this.summary.rate),

			quantity: Number(this.summary.quantity),
			unit_type: this.summary.unit_type,

			total_amount: Number(this.summary.base_amount),

			payment_type: this.summary.payment_type,
			payment_term: this.summary.payment_term,

			inco_term: this.summary.inco_term.toUpperCase(),

			packing: this.summary.packing,
			ie_code: this.summary.ie_code,
			remark: this.summary.remark,
			so_copy: null,

			// temp_email: this.summary.temp_email.toString(),
			// temp_mobile: this.summary.temp_mobile.toString(),
			company_id: this.company_id,
			//import_local_flag: 1
		};
		let body = {
			data: data
		};


		if (this.editMode) {
			body['id'] = this.id;
			this.crudServices.updateData(TransnationalSales.update, body).subscribe(res => {
				this.loadingBtn = false;
				if (res['code'] == '100') {
					this.summary = null;
					this.salesOrderForm.reset();
					this.salesOrderForm.patchValue({ booking_date: moment().format("YYYY-MM-DD"), currency: 'USD' })
					this.toasterService.pop('success', 'Success', res['data']);
					//this.generateSalesOrder(this.id);
				}
			});
		} else {
			this.crudServices.addData(TransnationalSales.add, body).subscribe(res => {
				this.loadingBtn = false;
				if (res['code'] == '100') {
					this.summary = null;
					this.salesOrderForm.reset();
					this.salesOrderForm.patchValue({ booking_date: moment().format("YYYY-MM-DD"), currency: 'USD' })
					this.summaryModal.hide();
					this.toasterService.pop('success', 'Success', 'Order Added Successfully');
					//this.generateSalesOrder(res['data']);
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

	onChangeValue() {
		let qty = this.salesOrderForm.value.quantity;
		let rate = this.salesOrderForm.value.rate;
		let base_amount = Number(qty) * Number(rate)
		this.salesOrderForm.patchValue({ base_amount: base_amount })
	}

	onchangeCustomer(event) {
		if (event) {
			this.salesOrderForm.patchValue({ ie_code: event.iec ? event.iec : '' })
		} else {
			this.salesOrderForm.patchValue({ ie_code: '' })
		}

	}


	generateSalesOrder(con_id) {
		this.crudServices.getOne<any>(TransnationalSales.getTransnationalSalesOrders, {
			id: con_id
		}).subscribe(res_data => {
			if (res_data.code == '100') {
				if (res_data.data.length > 0) {
					// this.generateSo(res_data.data[0]).then(async (pdfObj) => {
					// 	let pdfOBjFromData = pdfObj;
					// 	await pdfMake.createPdf(pdfOBjFromData).getBlob(pdf_file => {
					// 		if (pdf_file) {
					// 			this.fileData.append('sales_order_pdf', pdf_file, 'so.pdf')
					// 			this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res => {
					// 				let path = res.uploads.sales_order_pdf[0].location;
					// 				let body = {
					// 					id: res_data.data[0].id,
					// 					type: 'so_copy',
					// 					sales_order_data: res_data.data[0],
					// 					data: {
					// 						so_copy: path
					// 					}
					// 				};
					// 				this.crudServices.updateData(TransnationalSales.update, body).subscribe(result => {
					// 					this.goBack();
					// 				});
					// 			});
					// 		}
					// 	});
					// });


				}
			}
		});
	}

	async generateSo(item) {
		let logo = await this.exportService.getBase64ImageFromURL('assets/img/brand/parmar_logo.png');
		let sign = await this.exportService.getBase64ImageFromURL('assets/img/sign.png');
		let mid_date = moment().format("YYYY-MM") + "-20";
		let start_date = null;
		let end_date = null;
		if (moment().isBefore(moment(mid_date))) {
			start_date = moment().format("MMMM YYYY");
			end_date = moment().add(1, 'M').format("MMMM YYYY");
		} else {
			start_date = moment().add(1, 'M').format("MMMM YYYY");
			end_date = moment().add(2, 'M').format("MMMM YYYY");
		}
		let shipment_month = start_date + ' / ' + end_date;

		const docDefinition = {
			content: [
				{
					table: {
						widths: ['10%', '90%'],
						body: [
							[
								{
									border: [false, false, false, false],
									image: logo,
									width: 60,
									height: 60,
									alignment: 'left'
								},
								{
									text: [
										{
											text: 'Sushila Parmar International Pvt. Ltd.\n',
											fontSize: 16,
											bold: true,
											alignment: 'center'
										},
										{
											text: [
												{ text: 'Regd.Office: 31, Adinath Shopping Centre, Pune - Satara Road, Pune - 411037, MH, India.', fontSize: 8, alignment: 'center' },
												'\n',
												{ text: 'Corp. Office: 2nd & 3rd Floor, JDC Platinum Towers, Near Zambare Palace, Maharshi Nagar, Pune - 411037, MH, India', fontSize: 8, alignment: 'center' },
												'\n',
												{ text: `P: +91 20 2452 9999 | F: +91 20 2452 9997  |  E: parmar@parmarglobal.com | PAN: ${item.godown ? item.godown.gst_no.substr(2, 10) : ''}`, fontSize: 8, alignment: 'center' }
											],
											fontSize: 8
										}
									],
									border: [false, false, false, false],
									alignment: 'center'
								}
							]
						]
					}
				},
				'\n',
				{
					table: {
						widths: ['100%'],
						body: [
							[
								{
									text: "SALES CONTRACT / PROFORMA INVOICE",
									bold: true,
									fontSize: 9,
									decoration: 'underline',
									border: [false, false, false, false],
									alignment: 'center'
								}
							]
						]
					}
				},
				'\n',
				{
					table: {
						widths: ['70%', '30%'],
						border: [false, false, false, false],
						body: [
							[
								{
									text: 'Buyer / Customer / Invoice To: ',
									fontSize: 8,
									bold: true,
									margin: [0, 0, 0, 0],
									border: [false, false, false, false]
								},
								{
									text: [
										{ text: 'SC NO: ' + item.so_no, fontSize: 8, bold: true, },
									],
									margin: [0, 0, 0, 0],
									border: [false, false, false, false]
								}
							],
							[

								{
									text: item.customer.toUpperCase(),
									fontSize: 9,
									bold: true,
									border: [false, false, false, false]
								},
								{
									text: [
										{ text: 'SC DATE: ', fontSize: 8, bold: true, },
										{ text: moment(item.booking_date).format('DD-MMM-YYYY'), fontSize: 8, bold: true, },
									],
									border: [false, false, false, false]
								}
							],
							[
								{
									text: item.org_address,
									fontSize: 8,
									bold: true,
									border: [false, false, false, false]
								},
								{
									text: '',
									border: [false, false, false, false]
								}
							],
							[
								{
									text: [
										{ text: 'IE CODE: ', fontSize: 8, bold: true, },
										{ text: item.ie_code, fontSize: 8, bold: true, },
									],
									border: [false, false, false, false]
								},
								{
									text: '',
									border: [false, false, false, false]
								}
							],
							[
								{
									text: [
										{ text: 'GST NO: ', fontSize: 8, bold: true, },
										{ text: item.org_gst_no, fontSize: 8, bold: true, },
									],
									margin: [0, 0, 0, 5],
									border: [false, false, false, false]
								},
								{
									text: '',
									border: [false, false, false, false]
								}
							]
						]
					}
				},
				{
					table: {
						widths: ['40%', '20%', '20%', '20%'],
						body: [
							[
								{
									text: 'DESCRIPTION OF GOODS',
									fontSize: 8,
									bold: true,
									alignment: 'center'
								},
								{
									text: 'QUANTITY\n(MT)',
									fontSize: 8,
									bold: true,
									alignment: 'center'
								},
								{
									text: 'UNIT PRICE\n' + item.inco_term.toUpperCase() + ' ' + item.port_name.toUpperCase() + '\n(USD/MT)',
									fontSize: 8,
									bold: true,
									alignment: 'center'
								},
								{
									text: 'AMOUNT\n(USD)',
									fontSize: 8,
									bold: true,
									alignment: 'center'
								}
							],
							[
								{
									text: item.grade_name.toUpperCase(),
									fontSize: 8,
									alignment: 'center'
								},
								{
									text: item.quantity + ' ' + item.unit_type,
									fontSize: 8,
									alignment: 'center'
								},
								{
									text: this.currencyPipe.transform(item.final_rate, 'USD'),
									fontSize: 8,
									alignment: 'center'
								},
								{
									text: this.currencyPipe.transform(item.base_amount, 'USD'),
									fontSize: 8,
									alignment: 'center'
								}
							]
						]
					}
				},
				'\n',
				{
					table: {
						widths: ['38.5%', '61.5%'],
						body: [
							[
								{
									text: 'SHIPMENT',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: shipment_month.toUpperCase(),
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'INCOTERMS',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.inco_term.toUpperCase() + '-' + item.port_name.toUpperCase() + ', INDIA',
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'FINAL PLACE OF DELIVERY',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.inco_term.toUpperCase() + '-' + item.port_name.toUpperCase() + ', INDIA',
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'PAYMENT',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: 'IMMEDIATE BY RTGS AGAINST TRANSFER OF HIGH SEAS DOCUMENTS',
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'PACKING',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.packing.toUpperCase(),
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'NAME OF THE MANUFACTURER',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.supplier.toUpperCase(),
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'COUNTRY OF ORIGIN',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.supplier_country.toUpperCase(),
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							]
						]
					}
				},
				'\n',
				{
					table: {
						widths: ['38.5%', '61.5%'],
						body: [
							[
								{
									text: 'BENEFICIARY NAME',
									fontSize: 8,
									bold: true,
									border: [true, true, false, false],
									alignment: 'left'
								},
								{
									text: 'SUSHILA PARMAR INTERNATIONAL PVT. LTD.',
									fontSize: 8,
									border: [true, true, true, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'BANK NAME',
									fontSize: 8,
									bold: true,
									border: [true, false, false, false],
									alignment: 'left'
								},
								{
									text: 'IDFC FIRST BANK',
									fontSize: 8,
									border: [true, false, true, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'BANK ADDRESS',
									fontSize: 8,
									bold: true,
									border: [true, false, false, false],
									alignment: 'left'
								},
								{
									text: 'BKC BRANCH, MUMBAI',
									fontSize: 8,
									border: [true, false, true, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'ACCOUNT NUMBER',
									fontSize: 8,
									bold: true,
									border: [true, false, false, false],
									alignment: 'left'
								},
								{
									text: 'PARMARZPAPLP1087',
									fontSize: 8,
									border: [true, false, true, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'IFSC Code',
									fontSize: 8,
									bold: true,
									border: [true, false, false, true],
									alignment: 'left'
								},
								{
									text: 'IDFB0040101',
									fontSize: 8,
									border: [true, false, true, true],
									alignment: 'left'
								}
							]
						]
					}
				},
				'\n',
				{
					table: {
						widths: ['38.5%', '61.5%'],
						body: [
							[
								{
									text: 'REMARKS',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									ol: [
										'THE USD CONVERSION RATE WILL BE DERIVED ON THE DATE OF TRANSFER OF HIGH SEAS DOCUMENT.',
										'MATERIAL SOLD ON HIGHSEAS BASIS, HENCE THE MATERIAL HAS TO BECLEARED BY THE BUYER DIRECTLY FROM MUNDRA PORT.',
										'ALL CLEARING CHARGES / DUTY ARE TO THE ACCOUNT OF BUYER.',
										'TRANSIT INSURANCE FROM MUNDRA PORT TO BUYERS LOCATION WILL BE TOTHE ACCOUNT OF BUYER.'
									],
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							]
						]
					}
				},
				'\n',
				{
					table: {
						widths: ['50%', '50%'],
						body: [
							[
								{
									text: 'THE SELLER',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: 'ACCEPTED BY',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'SUSHILA PARMAR INTERNATIONAL PVT. LTD.',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.customer.toUpperCase(),
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									image: sign,
									margin: [0, 0, 0, 0],
									border: [false, false, false, false],
									width: 70,
									height: 70
								},
								{
									text: '',
									border: [false, false, false, false]
								}
							],
							[
								{
									text: 'AUTHORIZED SIGNATORY',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: 'AUTHORIZED SIGNATORY',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								}
							]
						]
					}
				}
			]
		};
		return docDefinition;
		// pdfMake.createPdf(docDefinition).open();
	}

	goBack() {
		this.salesOrderForm.reset();
		this.summaryModal.hide();
		this.router.navigate(["sales/transnational-sales"]);
	}
}
